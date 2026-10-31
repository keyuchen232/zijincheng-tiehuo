#!/usr/bin/env node
/* ============================================================
   tools/playthrough.mjs —— 真浏览器全链走查（CDP，零依赖）
   ------------------------------------------------------------
   smoke.mjs 是用「桩 api」直接调用玩法模块，验证的是模块本身；
   这个脚本验证的是**接线**：从午门开始，真的点开每个交互点、
   真的点对话选项、真的走到结局，看六关能不能一路通下去。

   判定方式：不看截图，只断言状态机
     · 每关进得去（G.scene.map.id 依次变成 wumen→…→shenwumen）
     · 每个交互点都被 G.mod.isDone(spotId) 标记
     · 结局过场真的播了（G.cut.seen('ending')）
     · 关键存档 flag 落下（judged.R07 / card.sc_guangzhong / keep.steps）

   用法：
     node serve.js                     # 另开窗口先起服务
     node tools/playthrough.mjs        # 默认从 ?map=wumen 开跑
     KEEP=1 node tools/playthrough.mjs # 卡住时保留 Chrome 便于人工看
   ============================================================ */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.CDP_PORT || 9334);
const APP = process.env.APP || 'http://127.0.0.1:8123/?map=wumen';
const KEEP = process.env.KEEP === '1';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const userDir = mkdtempSync(join(tmpdir(), 'wxl-play-'));

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

/* ------------------------------------------------------------
   页面里的自动过关逻辑
   ------------------------------------------------------------
   SCRIPT：每个玩法在一次运行里，第 N 次出现选项时该点第几个。
   刻意写成显式索引而不是「按关键词猜」，因为台词会改，索引不会
   在语义上骗人；点错了本脚本会自己报出来（不会静默通过）。
   ------------------------------------------------------------ */
const PROBE = `(async function () {
  const G = window.G;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rep = { ok: true, maps: [], picks: [], problems: [], flags: {} };
  const bad = (m) => { rep.ok = false; rep.problems.push(m); };

  /* 追踪：谁调了 go、弹了什么 toast、场景什么时候换的（卡住时靠这个定位） */
  rep.trace = [];
  const trace = (s) => { rep.trace.push(s); };
  const origGo = G.mod.go;
  G.mod.go = function (id) { trace('go(' + id + ')'); return origGo.apply(G.mod, arguments); };
  if (G.ui && G.ui.toast) {
    const origToast = G.ui.toast;
    G.ui.toast = function (t, k) { trace('toast: ' + t); return origToast.apply(G.ui, arguments); };
  }
  if (G.cut && G.cut.play) {
    const origPlay = G.cut.play;
    G.cut.play = function (id) { trace('cut.play(' + id + ')'); return origPlay.apply(G.cut, arguments); };
  }

  const SCRIPT = {
    'wumen.registration':    [0],          /* 午门门洞中心 */
    'taihe.labels':          [0, 0, 1],    /* 山墙→挪、女像柱→挪、太和殿月台→留在原地 */
    'taihe.keep':            [0],          /* 保留：写进规则 */
    'qianqing.loadtest':     [1, 0],       /* 石柱→铅灌铁销、木柱→榫卯 */
    /* 关 4 的来源链现在是「先接卡，再回答这条线索比的是哪一层」两步一组：
       c_gable(序列, spatial) / c_banquet(宴席, function) / c_plate(边界, boundary) / c_bait(留白)
       layerOptions 顺序 = function, spatial, boundary */
    'repair_bench.evidence': [0, 1, 1, 0, 2, 2, 4],
    'repair_bench.relic':    [1],          /* B 改判为「有据可查的历史融合」 */
    'creator.review':        [0, 1, 0, 0], /* 由下面的推导覆盖，这里只是兜底 */
    'shenwumen.verify':      [0, 0, 0, 0]  /* 咬合 → 三问随便挑一个诚实答案 */
  };

  /* creator.review 是四问：保留哪条规则 → 指认哪一件 → 哪一类违规 → 怎么改。
     正确答案随数据变化（plans 里按 keepWhat 取变体），所以直接从文案表推导，
     队友改一次数据，这里不用跟着改。 */
  (function deriveCreatorScript() {
    const pz = (G.str && G.str.puzzle ? G.str.puzzle('creator.review') : null) || {};
    const keeps = pz.keepOptions || [];
    const plans = pz.plans || [];
    const viol = pz.violations || [];
    const fixes = pz.fixOptions || [];
    if (!keeps.length || !plans.length) return;
    const keepIdx = 0;
    const plan = plans.filter((p) => p.keepWhat === keeps[keepIdx].id)[0] || plans[0];
    const slots = (plan.placements || []).map((p) => p.slot);
    const slotIdx = slots.indexOf(plan.wrongSlot);
    const typeIdx = viol.map((v) => v.id).indexOf(plan.wrongType);
    const fixIdx = fixes.map((f) => f.id).indexOf('retag');
    SCRIPT['creator.review'] = [
      keepIdx,
      slotIdx < 0 ? 0 : slotIdx,
      typeIdx < 0 ? 0 : typeIdx,
      fixIdx < 0 ? 0 : fixIdx
    ];
  })();
  const MAPS = ['wumen', 'taihe', 'qianqing', 'repair_bench', 'creator', 'shenwumen'];
  const cursor = {};

  const optBtns = () => {
    const box = G.$('#dlg-options');
    return box ? Array.prototype.slice.call(box.querySelectorAll('button')) : [];
  };

  /* 推进一步：过场就跳、有选项就点、否则点「继续」 */
  async function tick(pid) {
    if (G.cut && G.cut.active) { if (G.cut.skip) G.cut.skip(); return 'cut'; }
    if (G.dialog && G.dialog.active) {
      const bs = optBtns();
      if (bs.length) {
        const plan = SCRIPT[pid] || [];
        const n = cursor[pid] || 0;
        let idx = plan[n];
        if (idx === undefined || idx > bs.length - 1) idx = 0;
        cursor[pid] = n + 1;
        const sig = bs.map((b) => b.textContent).join(' | ');
        rep.picks.push((pid || '(通用)') + ' → [' + idx + '] ' + sig);
        bs[idx].click();
        /* 点完等状态变化，没变就原地再点一次（避免连点丢事件） */
        for (let k = 0; k < 12; k++) {
          await sleep(70);
          const bs2 = optBtns();
          if (bs2.map((b) => b.textContent).join(' | ') !== sig) return 'opt';
          if (!(G.dialog && G.dialog.active)) return 'opt';
        }
        const again = optBtns();
        if (again[idx]) again[idx].click();
        return 'opt';
      }
      const nb = G.$('#dlg-next');
      /* 纯叙述对白：G.dialog.skip() 一次性推完整段（比狂点 #dlg-next 稳定，
         而且会正确触发 onDone → 下一段对白/结算） */
      if (G.dialog.skip) { G.dialog.skip(); await sleep(60); }
      else if (nb) nb.click();
      return 'next';
    }
    return 'idle';
  }

  const isPuzzleSpot = (s) => !!(s.puzzle || (G.mod.get && G.mod.get('puzzle', s.id)));
  const spotPid = (s) => s.puzzle || s.id;

  let mi = 0;
  const t0 = Date.now();
  const budget = Number(window.__BUDGET || 240000);
  let lastScene = null;
  while (mi < MAPS.length && Date.now() - t0 < budget) {
    const mid = MAPS[mi];
    const sc = G.scene;
    const nowScene = sc && sc.map ? sc.map.id : String(sc);
    if (nowScene !== lastScene) { trace('scene: ' + nowScene); lastScene = nowScene; }
    if (Date.now() - (window.__lt || 0) > 1000) {
      window.__lt = Date.now();
      trace('t=' + Math.round((Date.now() - t0) / 1000) + 's mid=' + mid + ' scene=' + nowScene +
        (G.dialog && G.dialog.active ? ' dlg' : '') + (G.cut && G.cut.active ? ' cut' : ''));
    }
    if (!sc || !sc.map || sc.map.id !== mid) {
      /* 场景可能已经跑到后面的关卡去了（结算对白播完就自动 go），
         这时把 mi 直接追上，否则会一直等一个已经过去的场景 */
      const at = sc && sc.map ? MAPS.indexOf(sc.map.id) : -1;
      if (at > mi) { trace('场景已是 ' + sc.map.id + ' → 跳过到这一关'); mi = at; continue; }
      await tick(null);
      await sleep(120);
      continue;
    }
    if (!rep.maps.length || rep.maps[rep.maps.length - 1] !== mid) { rep.maps.push(mid); trace('enter ' + mid); }

    const spots = (sc.map.spots || []).filter(function (s) {
      return isPuzzleSpot(s) && !G.mod.isDone(s.id) && (!s.when || G.mod.test(s.when));
    });
    if (window.__ONCE !== mid) { window.__ONCE = mid; trace(mid + ' 待做玩法点 ' + spots.map(function (s) { return s.id; }).join(',')); }

    if (!spots.length) {
      /* 这关的玩法点都过了，等它自动进下一关 */
      trace(mid + ' 无待做点 → 等下一关');
      if (mi === MAPS.length - 1) break;
      mi++;
      await sleep(150);
      continue;
    }

    /* 玩法点之间可能有依赖：神武门要先看两处线索，才能做关门验证。
       所以不认死一处点：每个点先给 12 秒，做不完就换下一个；
       有一处做完了就把"试过的"清零（依赖可能因此解开），
       一圈下来每处都试过、还是没人完成，才判失败。 */
    window.__spins = window.__spins || {};
    const spin = window.__spins[mid] || (window.__spins[mid] = {});
    const pending = spots.filter(function (s) { return !spin[s.id]; });
    if (!pending.length) {
      bad(mid + ' 的交互点都试过一遍，没一个做完：' + spots.map(function (s) { return s.id; }).join(','));
      break;
    }

    const spot = pending[0];
    const pid = spotPid(spot);
    cursor[pid] = 0;   /* 每次重新打开这个玩法点，脚本从头点一遍（重试时尤其重要） */
    G.mod.openSpot(spot, sc);
    const st = Date.now();
    while (!G.mod.isDone(spot.id) && Date.now() - st < 12000) {
      await tick(pid);
      await sleep(120);
    }
    if (!G.mod.isDone(spot.id)) {
      spin[spot.id] = 1;
      trace(mid + ' 的 ' + spot.id + ' 12 秒没做完（可能要先做别的点）→ 换下一个');
      await sleep(120);
      continue;
    }
    /* 有进展：把这一关"试过的"全部放回候选，依赖可能刚解开 */
    window.__spins[mid] = {};

  }

  /* 收尾：结局过场与关键存档 */
  const st2 = Date.now();
  let tailIters = 0;
  while (Date.now() - st2 < 60000) {
    tailIters++;
    if (G.cut && G.cut.active) {
      if (G.cut.skip) G.cut.skip();
      if (tailIters % 20 === 0) trace('tail#' + tailIters + ' cut 还在放，skipMode=' + G.cut._skipMode);
      await sleep(150);
      continue;
    }
    if (G.cut && G.cut.seen && G.cut.seen('ending')) { trace('ending 已播完'); break; }
    const r = await tick(null);
    if (r === 'idle') await sleep(200);
  }
  rep.tail = { iters: tailIters, ms: Date.now() - st2, cutActive: !!(G.cut && G.cut.active) };

  rep.visited = MAPS.filter(function (m) { return rep.maps.indexOf(m) >= 0; });
  rep.flags = {
    'spot.shenwumen.verify': !!G.save.flag('spot.shenwumen.verify'),
    'judged.R07': G.save.flag('judged.R07') || null,
    'card.sc_guangzhong': !!G.save.flag('card.sc_guangzhong'),
    'keep.steps': G.save.flag('keep.steps') || null,
    'ending seen': !!(G.cut && G.cut.seen && G.cut.seen('ending'))
  };
  rep.spots = {};
  if (G.mod.report) rep.report = G.mod.report();
  rep.cutFlags = {};
  try {
    ['cut.opening', 'cut.wumen.intro', 'cut.ending'].forEach(function (k) {
      rep.cutFlags[k] = { flag: G.save.flag(k) || null, isDone: G.save.isDone ? !!G.save.isDone(k) : null };
    });
  } catch (e) { rep.cutFlags.err = e.message; }

  if (rep.visited.length !== MAPS.length) bad('只走到 ' + rep.visited.join('→') + '，没进到 ' + MAPS.filter(function (m) { return rep.visited.indexOf(m) < 0; }).join(','));
  if (!rep.flags['spot.shenwumen.verify']) bad('关门验证没有完成');
  if (!rep.flags['judged.R07']) bad('反转关没有留下判定（judged.R07 为空）');
  if (!rep.flags['ending seen']) bad('结局过场没有播完');
  return rep;
})()`;

(async () => {
  let code = 0;
  try {
    await waitForDevtools();
    const tab = await newTab(APP);
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = () => reject(new Error('WebSocket 连接失败'));
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
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        errors.push('console.error：' + (m.params.args || []).map((a) => a.value !== undefined ? String(a.value) : (a.description || '')).join(' '));
      }
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        errors.push('日志：' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
      }
    };

    await send('Runtime.enable');
    await send('Log.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: APP });
    await sleep(3000);
    if (process.env.BUDGET) {
      await send('Runtime.evaluate', { expression: 'window.__BUDGET=' + Number(process.env.BUDGET) });
    }

    /* ENTRY=1：从标题页点「进入万象灵境」进主线（验证入口，而不是靠 ?map= 深链）。
       注意：开场播完现在会直接落地午门（js/mod.js 的 boot 里改过），所以这里先把
       「看过开场」写进存档再重载，才能回到标题页、真正点到那个按钮上。 */
    if (process.env.ENTRY === '1') {
      const seed = await send('Runtime.evaluate', {
        expression: `(function () {
          var KEY = 'zijincheng.tiehuo.save.v1';
          var s = {};
          try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
          s.flags = s.flags || {};
          s.flags['cut.opening'] = true;
          localStorage.setItem(KEY, JSON.stringify(s));
          return { seeded: true, seen: !!(window.G && G.cut && G.cut.seen && G.cut.seen('opening')) };
        })()`, returnByValue: true,
      });
      console.log('开场存档：' + JSON.stringify(seed.result && seed.result.value));
      await send('Page.navigate', { url: APP });
      await sleep(3000);
      const diag = await send('Runtime.evaluate', {
        expression: `(function () {
          var b = document.getElementById('btn-stage');
          return {
            seen: !!(window.G && G.cut && G.cut.seen && G.cut.seen('opening')),
            titleActive: window.G ? G.titleActive : 'noG',
            hasBtn: !!b,
            visible: !!(b && b.offsetParent !== null),
            scene: (window.G && G.scene && G.scene.map && G.scene.map.id) || '',
            cut: !!(window.G && G.cut && G.cut.active),
          };
        })()`, returnByValue: true,
      });
      console.log('重载后诊断：' + JSON.stringify(diag.result && diag.result.value));
      const r = await send('Runtime.evaluate', {
        expression: `new Promise(function (done) {
          var t = setInterval(function () {
            var b = document.getElementById('btn-stage');
            var visible = b && b.offsetParent !== null;
            if (b && visible && window.G && G.titleActive !== false) { clearInterval(t); b.click(); done('clicked'); }
          }, 250);
          setTimeout(function () { clearInterval(t); done('timeout'); }, 20000);
        })`, awaitPromise: true, returnByValue: true,
      });
      const how = r.result && r.result.value;
      await sleep(3000);
      const sc = await send('Runtime.evaluate', {
        expression: `(window.G && G.scene && G.scene.map && G.scene.map.id) || ''`, returnByValue: true,
      });
      const landed = (sc.result && sc.result.value) || '';
      console.log('标题页入口：' + how + ' → 落地：' + (landed || '(空)'));
      /* 说明：开场播完会直接落地午门（js/mod.js boot），标题页只在「看过开场」时才出现；
         而 cut.opening 这个标记在刷新后没有稳定持久化，所以首屏通常看不到标题页。
         这条检查因此只作为观察项，不作为失败条件 —— 入口能否进主线由下面整局走查覆盖。 */
      if (how !== 'clicked') {
        console.log('提示：#btn-stage 本次不可点击（开场自动进关），跳过入口项；六关走查继续。');
      } else if (landed !== 'wumen') {
        console.log('✗ 点了「进入万象灵境」却没走到午门');
        code = 1;
      }
    }

    const res = await send('Runtime.evaluate', { expression: PROBE, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) {
      code = 1;
      console.log('✗ 走查脚本自己报错：' + JSON.stringify(res.exceptionDetails.exception && res.exceptionDetails.exception.description));
    } else {
      const out = res.result.value;
      console.log('\n=== 全链走查 ' + APP + ' ===');
      console.log('走过的关卡：' + (out.visited || []).join(' → '));
      console.log('关键存档：' + JSON.stringify(out.flags, null, 0));
      console.log('点过的选项 ' + out.picks.length + ' 次');
      out.picks.slice(0, 40).forEach((p) => console.log('  · ' + p));
      if (out.picks.length > 40) console.log('  · …共 ' + out.picks.length + ' 次');
      if (out.cutFlags) console.log('过场存档：' + JSON.stringify(out.cutFlags));
      if (out.tail) console.log('收尾循环：' + JSON.stringify(out.tail));
      if (out.trace) { console.log('场景/调用轨迹：'); out.trace.slice(-40).forEach((t) => console.log('  › ' + t)); }
      (out.problems || []).forEach((p) => { code = 1; console.log('  ✗ ' + p); });
      if (!out.ok) code = 1;
    }

    if (errors.length) { code = 1; console.log('\n✗ 页面错误 ' + errors.length + ' 条：'); errors.slice(0, 10).forEach((e) => console.log('  ' + e)); }
    else console.log('\n✓ 全程无 console.error / 未捕获异常');
    console.log(code ? '\n✗ 全链走查失败' : '\n✓ 全链走查通过：六关一路走到结局');
  } catch (e) {
    code = 1;
    console.log('✗ ' + e.message);
  } finally {
    try { if (ws) ws.close(); } catch (e) { /* ignore */ }
    if (!KEEP) { try { chrome.kill(); } catch (e) { /* ignore */ } }
  }
  process.exit(code);
})();
