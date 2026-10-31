#!/usr/bin/env node
/* ============================================================
   tools/smoke.mjs —— 浏览器冒烟测试（CDP，不依赖 puppeteer）
   ------------------------------------------------------------
   为什么要有它：check-modules.mjs 只做静态对账，「文案 key 对不上」
   它能查出来，但「跑起来会抛异常 / 点了没反应 / 文案没接上」查不出来。
   这个脚本真的开一个 headless Chrome 把游戏跑一遍，然后：

     1. 收集 console 的 error / warning 与未捕获异常
     2. 等 G.str.ready，读 G.mod.report()，看 problems 是否为空
     3. 用桩 api 直接驱动每个已登记的玩法模块，走一遍正确分支与错误分支
     4. 检查每段用到的文案不是 ⟪key⟫（即真的接上了 script.json）

   用法：
     node serve.js                  # 另开一个窗口，先把服务跑起来
     node tools/smoke.mjs           # 默认测 ?map=wumen
     node tools/smoke.mjs ?map=taihe
     SHOT=1 node tools/smoke.mjs    # 顺手存一张截图到 shots/

   注意：headless Chrome 需要能创建命名管道。在某些沙箱里会报
   platform_channel.cc:112 Check failed（拒绝访问），那是环境限制，
   不是代码问题 —— 换到自己的终端跑即可。
   ============================================================ */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.CDP_PORT || 9333);
const query = process.argv[2] || '?map=wumen';
const APP = process.env.APP || ('http://127.0.0.1:8123/' + query);
const SHOT = process.env.SHOT === '1';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const userDir = mkdtempSync(join(tmpdir(), 'wxl-smoke-'));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
  '--no-first-run', '--no-default-browser-check', '--no-sandbox',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + userDir,
  '--window-size=1280,720',
  'about:blank',
], { stdio: 'ignore', windowsHide: true });

let ws = null;
let seq = 0;
const pending = new Map();
const errors = [];
const warns = [];

function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function waitForDevtools() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/json/version');
      if (r.ok) return await r.json();
    } catch (e) { /* 还没起来 */ }
    await sleep(250);
  }
  throw new Error('CDP 没起来（Chrome 可能被沙箱拦住了）');
}

async function newTab(url) {
  for (const method of ['PUT', 'POST']) {
    const r = await fetch('http://127.0.0.1:' + PORT + '/json/new?' + encodeURIComponent(url), { method });
    if (r.ok) return await r.json();
  }
  throw new Error('新建标签失败');
}

/* 页面里跑的测试主体：返回一份可直接 console.table 的报告 */
const PROBE = `(async function () {
  const out = { ok: true, notes: [], problems: [], results: [] };
  const bad = (m) => { out.ok = false; out.problems.push(m); };

  await G.str.ready;
  const raw = G.str.raw() || {};
  out.version = (raw.meta || {}).version || '(no meta)';
  out.scriptSegs = Object.keys(raw).length;
  if (out.version !== '0.4') out.notes.push('meta.version = ' + out.version);

  const rep = G.mod.report();
  out.maps = rep.maps; out.puzzles = rep.puzzles; out.painters = rep.painters.length; out.cuts = rep.cutscenes;
  rep.problems.forEach(function (p) {
    /* 立绘没画只是少一张画，不挡流程，记成 note */
    if (p.indexOf('立绘') >= 0) out.notes.push('待补素材：' + p);
    else bad('G.mod 自检：' + p);
  });

  /* 带点的 id（wumen.registration）能不能被 lookup 命中 —— 这是最容易埋雷的地方 */
  out.lookup = {};
  ['puzzles.wumen.registration.prompt',
   'puzzles.wumen.registration.options',
   'puzzles.taihe.keep.prompt',
   'puzzles.repair_bench.relic.prompt',
   'puzzles.repair_bench.relic.outcome.B',
   'nodes.wumen.enter',
   'chapters'].forEach(function (k) {
    out.lookup[k] = G.str.has(k);
    if (!G.str.has(k)) bad('G.str 取不到 ' + k + '（lookup 处理带点的 id 失败？）');
  });

  /* 文案探针：抽关键段，看有没有 ⟪key⟫ */
  const probeKeys = [
    'puzzles.repair_bench.relic.prompt',
    'puzzles.repair_bench.relic.case.name',
    'puzzles.repair_bench.relic.outcome.B',
    'puzzles.taihe.keep.prompt',
    'puzzles.taihe.keep.outcome.keep',
    'nodes.repair_bench.enter',
    'nodes.wumen.enter',
    'ending.afterword',
    'sourceCards'
  ];
  out.badKeys = [];
  probeKeys.forEach(function (k) {
    const segs = G.str.seg(k);
    const val = segs.length ? JSON.stringify(segs) : String(G.str.get(k));
    if (val.indexOf('⟪') >= 0) out.badKeys.push(k);
  });
  if (out.badKeys.length) bad('文案没接上：' + out.badKeys.join(', '));

  /* 桩 api：驱动某个玩法模块跑完一轮，choices 是依次喂给 api.ask 的答案 */
  function play(pid, choices) {
    const log = []; const vars = {}; let i = 0;
    const mod = G.mod.get('puzzle', pid);
    if (!mod) { bad('玩法没登记：' + pid); return Promise.resolve({ log: ['MISSING_MODULE'], vars }); }
    return new Promise(function (resolve) {
      const timer = setTimeout(function () { log.push('TIMEOUT'); finish(); }, 6000);
      function finish() { clearTimeout(timer); resolve({ log, vars }); }
      const api = {
        spot: { id: 'smoke.' + pid }, scene: null, map: null,
        str: G.str, ui: G.ui, vars,
        sfx: function () {},
        toast: function (t, k) { log.push('toast(' + (k || '-') + ')'); },
        setVar: function (k, v) { vars[k] = v; },
        dialog: function (key, done) {
          log.push('dialog ' + key);
          if (!G.str.has(key)) bad(pid + ' 引用了不存在的文案 ' + key);
          setTimeout(function () { if (done) done(); }, 0);
        },
        ask: function (key, cb) {
          log.push('ask ' + key);
          if (!G.str.has('puzzles.' + key + '.prompt')) bad(pid + ' 的 ask 找不到 puzzles.' + key + '.prompt');
          const c = choices[Math.min(i, choices.length - 1)]; i++;
          setTimeout(function () { cb(c); }, 0);
        },
        pass: function (r) { log.push('pass ' + JSON.stringify(r)); finish(); },
        fail: function (k) { log.push('fail ' + k); finish(); },
        release: function () {}, overlay: function () {}, cut: function (id, d) { if (d) d(); }
      };
      try { mod.open(api); } catch (e) { log.push('THROW ' + e.message); finish(); }
    });
  }

  async function expect(label, pid, choice, wanted) {
    const r = await play(pid, [].concat(choice));
    const joined = r.log.join(' | ');
    const hit = r.log.some(function (l) { return l.indexOf('pass ') === 0; });
    out.results.push({ 关卡: label, 选择: [].concat(choice).join('→'), 期望: wanted, 实际: hit ? '通过' : '未通过', 步骤: r.log.length });
    if (wanted === 'pass' && !hit) bad(label + ' 应该能通过，但没有调 api.pass。log: ' + joined);
    if (wanted === 'retry' && !hit) bad(label + ' 选错后重试再选对，应该能通过。log: ' + joined);
    if (r.log.indexOf('TIMEOUT') >= 0) bad(label + ' 卡住了（6 秒没走完）: ' + joined);
    if (r.log.some(function (l) { return l.indexOf('THROW') === 0; })) bad(label + ' 抛异常: ' + joined);
    return r;
  }

  /* 关 1 回归：选 A 必须通过 */
  await expect('关1 原点之争', 'wumen.registration', ['A'], 'pass');
  /* 关 2 保留选择：三项都必须能通过 */
  await expect('关2 保留·写进规则', 'taihe.keep', ['keep'], 'pass');
  await expect('关2 保留·先记下', 'taihe.keep', ['note'], 'pass');
  await expect('关2 保留·不要', 'taihe.keep', ['drop'], 'pass');
  /* 关 4 反转：B 通过；A→B、C→B 必须先播后果再重试通过 */
  const rB = await expect('关4 反转·改判融合', 'repair_bench.relic', ['B'], 'pass');
  await expect('关4 反转·拆掉→再改判', 'repair_bench.relic', ['A', 'B'], 'retry');
  await expect('关4 反转·删说明→再改判', 'repair_bench.relic', ['C', 'B'], 'retry');

  /* 副作用：B 分支必须写下判定与来源卡 flag */
  out.flags = {
    verdictR07: rB.vars.verdictR07,
    存档判定: !!G.save.flag('judged.R07'),
    广钟卡: !!G.save.flag('card.sc_guangzhong')
  };
  if (!out.flags.存档判定) out.notes.push('judged.R07 没写进存档');
  if (!out.flags.广钟卡) out.notes.push('card.sc_guangzhong 没写进存档');

  /* 场景与运行状态 */
  out.titleActive = G.titleActive;
  out.hasScene = !!G.currentScene;
  return out;
})()`;

(async () => {
  let code = 0;
  try {
    await waitForDevtools();
    const tab = await newTab(APP);
    ws = new WebSocket(tab.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = (e) => reject(new Error('WebSocket 连接失败'));
    });
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id); pending.delete(m.id);
        if (m.error) p.reject(new Error(m.error.message)); else p.resolve(m.result);
        return;
      }
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        errors.push('未捕获异常：' + (d.exception ? d.exception.description : d.text));
      }
      if (m.method === 'Runtime.consoleAPICalled') {
        const text = (m.params.args || []).map((a) => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ');
        if (m.params.type === 'error') errors.push('console.error：' + text);
        if (m.params.type === 'warning') warns.push('console.warn：' + text);
      }
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        errors.push('网络/日志：' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
      }
    };

    await send('Runtime.enable');
    await send('Log.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: APP });
    await sleep(3500);

    const res = await send('Runtime.evaluate', {
      expression: PROBE, awaitPromise: true, returnByValue: true,
    });
    if (res.exceptionDetails) {
      errors.push('探针本身报错：' + JSON.stringify(res.exceptionDetails.exception && res.exceptionDetails.exception.description));
    } else {
      const out = res.result.value;
      console.log('\n=== 冒烟测试 ' + APP + ' ===');
      console.log('文案版本 ' + out.version + ' · 段落 ' + out.scriptSegs + ' · 地图 ' + out.maps.join(',') +
        ' · 画笔 ' + out.painters + ' · 玩法 ' + out.puzzles.length + ' · 过场 ' + out.cuts.join(','));
      console.table(out.results);
      if (out.notes && out.notes.length) out.notes.forEach((n) => console.log('  · ' + n));
      (out.problems || []).forEach((p) => { code = 1; console.log('  ✗ ' + p); });
      if (!out.ok) code = 1;
    }

    if (SHOT) {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      mkdirSync('shots', { recursive: true });
      const file = join('shots', 'smoke-' + query.replace(/[^a-z0-9]+/gi, '_') + '.png');
      writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log('截图已存：' + file);
    }

    if (errors.length) { code = 1; console.log('\n✗ 页面错误 ' + errors.length + ' 条：'); errors.forEach((e) => console.log('  ' + e)); }
    else console.log('\n✓ 页面无 console.error / 未捕获异常');
    if (warns.length) console.log('（warn ' + warns.length + ' 条，仅供参考）'), warns.slice(0, 6).forEach((w) => console.log('  ' + w));
    console.log(code ? '\n✗ 冒烟测试失败' : '\n✓ 冒烟测试通过');
  } catch (e) {
    code = 1;
    console.log('✗ ' + e.message);
    if (errors.length) errors.forEach((x) => console.log('  ' + x));
  } finally {
    try { if (ws) ws.close(); } catch (e) { /* ignore */ }
    try { chrome.kill(); } catch (e) { /* ignore */ }
  }
  process.exit(code);
})();
