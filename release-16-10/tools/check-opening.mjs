#!/usr/bin/env node
/* ============================================================
   tools/check-opening.mjs —— 开场（黑屏倒计时）验收
   ------------------------------------------------------------
   只验四件事，都是"看得出玩家会不会被卡住"的：
     A 首屏真的开始播开场：G.cut.active = true，画面上是倒计时卡片
     B 屏幕上写着按哪个键跳过：#cut .cut-hint 里有「空格」
     C 不按任何键：倒计时走完 → 自动落地午门（G.scene.map.id = wumen）
     D 按一次空格：立刻跳过 → 落地午门（这就是演示时要按的那一下）

   D 用的是真键盘事件（Input.dispatchKeyEvent），不是 JS 直接调 skip()，
   所以它验证的是"玩家按空格确实能跳过"，而不是"代码里有 skip 函数"。

   —— 正式动画接进 data/cuts/opening.js 之后，这个脚本照样该跑过：
   只要 cut.js 还提供跳过提示与按键。（那时 C 的等待时间会变长，
   可以用 WAIT=8000 放宽。）

   用法：
     node serve.js                      # 另开窗口起服务
     node tools/check-opening.mjs       # 默认测 http://127.0.0.1:8123/
     WAIT=8000 node tools/check-opening.mjs
   ============================================================ */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.CDP_PORT || 9336);
const APP = process.env.APP || 'http://127.0.0.1:8123/';
const WAIT = Number(process.env.WAIT || 12000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const userDir = mkdtempSync(join(tmpdir(), 'wxl-open-'));

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

function connect(url) {
  return new Promise((resolve, reject) => {
    const s = new WebSocket(url);
    s.onopen = () => resolve(s);
    s.onerror = (e) => reject(new Error('WebSocket 连不上：' + (e && e.message)));
  });
}

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', {
    expression: expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) {
    throw new Error('页面里报错：' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
  }
  return r.result && r.result.value;
}

/* 真键盘事件：按一下空格 */
async function pressSpace() {
  const base = { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 };
  await send('Input.dispatchKeyEvent', Object.assign({ type: 'keyDown', text: ' ' }, base));
  await sleep(40);
  await send('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, base));
}

const fails = [];
const notes = [];
function ok(cond, msg) {
  if (cond) { console.log('  ✓ ' + msg); return true; }
  fails.push(msg);
  console.log('  ✗ ' + msg);
  return false;
}

async function main() {
  await waitForDevtools();
  const tab = await newTab(APP);
  ws = await connect(tab.webSocketDebuggerUrl);
  ws.onmessage = (ev) => {
    let m = null;
    try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.reject(new Error(m.error.message));
      else p.resolve(m.result);
      return;
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errors.push((d.exception && d.exception.description) || d.text || '未捕获异常');
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push(m.params.args.map((a) => a.value || a.description || '').join(' '));
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      errors.push(m.params.entry.text || '');
    }
  };
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Page.reload', { ignoreCache: true });

  /* A/B：开场起来了没有、提示写没写 */
  let active = false;
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    active = await evaluate('!!(window.G && G.cut && G.cut.active)');
    if (active) break;
  }
  ok(active, '首屏开始播开场（G.cut.active = true）');

  const dom = await (async () => {
    /* 开场第一步是压黑/上下黑边，倒计时卡片随后才出现，所以要等一下再看 */
    for (let i = 0; i < 30; i++) {
      const d = await evaluate(`(() => {
        const cut = document.getElementById('cut');
        const card = document.querySelector('#cut .cut-count');
        const text = document.querySelector('#cut .cut-text');
        const hint = document.querySelector('#cut .cut-hint');
        return {
          cutShown: !!cut && !cut.classList.contains('hidden'),
          countCard: !!card,
          countText: text ? text.textContent.trim() : '',
          hint: hint ? hint.textContent.trim() : '',
          map: (window.G && G.scene && G.scene.map) ? G.scene.map.id : null
        };
      })()`);
      if (d.countCard) return d;
      if (d.map) return d;   /* 已经进场景了，不必再等 */
      await sleep(120);
    }
    return { cutShown: false, countCard: false, countText: '', hint: '', map: null };
  })();
  ok(dom.cutShown, '黑场是压在标题页上的（#cut 已显示）');
  ok(dom.countCard, '倒计时卡片在（.cut-count）');
  notes.push('倒计时当前显示：' + (dom.countText || '(空)'));
  ok(/空格/.test(dom.hint), '跳过提示写了按键：「' + dom.hint + '」');
  ok(!dom.map, '还没进场景（开场期间 ' + (dom.map || '无场景') + '）');

  /* C：不按任何键，倒计时走完应当自己落地午门（落地后午门自己的进场过场会接着播，
     那是另一段过场，不算在这里 —— 所以只看"场景有没有变成 wumen"） */
  let map = null;
  const t0 = Date.now();
  while (Date.now() - t0 < WAIT) {
    await sleep(100);
    map = await evaluate('(window.G && G.scene && G.scene.map) ? G.scene.map.id : null');
    if (map) break;
  }
  ok(map === 'wumen', '不按键：倒计时走完自动落地午门（当前 ' + (map || '无场景') + '，用时 ' + (Math.round((Date.now() - t0) / 100) / 10) + 's）');

  /* D：重新来一次，这次按空格 */
  await evaluate(`(() => {
    if (window.G && G.save && G.save.flag) { G.save.flag('cut.opening', false); if (G.save.persist) G.save.persist(); }
    return true;
  })()`);
  await send('Page.reload', { ignoreCache: true });

  let active2 = false;
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    active2 = await evaluate('!!(window.G && G.cut && G.cut.active)');
    if (active2) break;
  }
  ok(active2, '第二次进入时开场照常开始（说明跳过不会被记成"看过"以外的状态）');

  const t1 = Date.now();
  await pressSpace();
  let map2 = null;
  while (Date.now() - t1 < WAIT) {
    await sleep(100);
    map2 = await evaluate('(window.G && G.scene && G.scene.map) ? G.scene.map.id : null');
    if (map2) break;
  }
  const skipMs = Date.now() - t1;
  ok(map2 === 'wumen', '按一次空格：立刻跳过并落地午门（用时 ' + (skipMs / 1000).toFixed(1) + 's）');
  ok(skipMs < 2500, '跳过是"立刻"，不是等倒计时走完（' + (skipMs / 1000).toFixed(1) + 's < 2.5s）');

  if (notes.length) notes.forEach((n) => console.log('  · ' + n));
  if (errors.length) {
    errors.slice(0, 5).forEach((e) => console.log('  ! console.error: ' + e));
    ok(false, '页面有 console.error / 未捕获异常');
  } else {
    ok(true, '页面无 console.error / 未捕获异常');
  }

  console.log('');
  if (fails.length) {
    console.log('✗ 开场验收失败（' + fails.length + ' 项）');
    process.exitCode = 1;
  } else {
    console.log('✓ 开场验收通过：黑屏倒计时 + 跳过提示 + 空格可跳');
  }
}

try {
  await main();
} catch (e) {
  console.error('✗ ' + e.message);
  process.exitCode = 1;
} finally {
  try { if (ws) ws.close(); } catch (e) { /* ignore */ }
  if (!(process.env.KEEP === '1')) {
    try { chrome.kill(); } catch (e) { /* ignore */ }
  }
  await sleep(300);
  process.exit(process.exitCode || 0);
}
