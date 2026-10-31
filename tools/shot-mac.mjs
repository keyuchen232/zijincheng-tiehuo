/* macOS 版截图 / 画面指标对比工具（headless Chrome + CDP）。
   用法：node tools/shot-mac.mjs <输出目录> [scene ...]
   场景与 tools/shot.mjs 一致；额外输出 #game 画布的客观指标，便于前后对比。 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '.polish-shots', 'now'));
const PROFILE = path.join(ROOT, '.chrome-shot-profile');
const CHROME = process.env.CHROME
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const APP = process.env.APP || 'http://127.0.0.1:8123/';

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(PROFILE, { recursive: true, force: true });

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-breakpad',
  '--disable-dev-shm-usage', '--hide-scrollbars', '--allow-file-access-from-files',
  '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
  '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

let ws;
let nextId = 1;
const pending = new Map();
const errors = [];

async function waitPort() {
  for (let i = 0; i < 100; i++) {
    try { await getJSON(`http://127.0.0.1:${PORT}/json/version`); return; } catch (e) { /* retry */ }
    await sleep(150);
  }
  throw new Error('Chrome CDP did not start');
}

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function evaluate(expression) {
  return send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true })
    .then((r) => {
      if (r.exceptionDetails) {
        errors.push('EVAL: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
        return null;
      }
      return r.result?.value;
    });
}

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
}

/* 对 #game 画布做量化：颜色数、亮度统计、色彩饱和度、边缘密度、平板块比例。 */
const STATS_EXPR = `(() => {
  const cv = document.querySelector('#game');
  if (!cv) return JSON.stringify({ error: 'no canvas' });
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const W = cv.width, H = cv.height;
  const img = ctx.getImageData(0, 0, W, H).data;
  const lum = new Float32Array(W * H);
  let col = new Set(), satSum = 0, satN = 0, lumSum = 0;
  for (let i = 0, p = 0; i < img.length; i += 4, p++) {
    const r = img[i], g = img[i + 1], b = img[i + 2];
    col.add((r << 16) | (g << 8) | b);
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[p] = L; lumSum += L;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx > 8) { satSum += (mx - mn) / mx; satN++; }
  }
  const n = W * H, lumMean = lumSum / n;
  let varSum = 0;
  for (let p = 0; p < n; p++) { const d = lum[p] - lumMean; varSum += d * d; }
  const lumStd = Math.sqrt(varSum / n);
  let edge = 0, edN = 0;
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const p = y * W + x;
      if (Math.abs(lum[p] - lum[p + 1]) > 10 || Math.abs(lum[p] - lum[p + W]) > 10) edge++;
      edN++;
    }
  }
  const B = 16; let flat = 0, blocks = 0;
  for (let by = 0; by < H; by += B) {
    for (let bx = 0; bx < W; bx += B) {
      let s = 0, s2 = 0, c = 0;
      for (let y = by; y < Math.min(by + B, H); y++) {
        for (let x = bx; x < Math.min(bx + B, W); x++) {
          const L = lum[y * W + x]; s += L; s2 += L * L; c++;
        }
      }
      const v = s2 / c - (s / c) * (s / c);
      if (v < 9) flat++;
      blocks++;
    }
  }
  return JSON.stringify({
    colors: col.size,
    lumMean: +lumMean.toFixed(1),
    lumStd: +lumStd.toFixed(1),
    sat: +(satSum / Math.max(1, satN)).toFixed(3),
    edge: +(edge / Math.max(1, edN)).toFixed(3),
    flatTiles: +(flat / blocks).toFixed(3),
  });
})()`;

const scenes = process.argv.slice(3).length ? process.argv.slice(3) : [
  'title', 'beijing', 'beijing_gate', 'gugong', 'gugong_mid', 'night',
  'home', 'fusion', 'fusion_west', 'fusion_repair',
];

async function setup(name) {
  const cmds = {
    title: `G.debug.title()`,
    beijing: `G.debug.setFlags({introSeen:true}); G.debug.beijing(1100,1200)`,
    beijing_gate: `G.debug.setFlags({introSeen:true}); G.debug.beijing(1100,880)`,
    gugong: `G.debug.gugong(750,1300)`,
    gugong_mid: `G.debug.gugong(750,880)`,
    night: `G.debug.night()`,
    home: `G.debug.home()`,
    fusion: `G.debug.fusion()`,
    fusion_west: `G.debug.fusion(); G.scene.setPlayer(330,1250)`,
    fusion_repair: `G.debug.fusion(); G.scene.state.cn=true; G.scene.state.en=true; G.scene.finishRepair(); G.scene.setPlayer(720,700)`,
  };
  return cmds[name] || '';
}

async function main() {
  await waitPort();
  const targets = await getJSON(`http://127.0.0.1:${PORT}/json/list`);
  const target = targets.find((t) => t.type === 'page') || targets[0];
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const line = 'EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
      if (!errors.includes(line)) errors.push(line);
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      errors.push('LOG: ' + msg.params.entry.text);
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: APP });
  await sleep(1600);

  const report = {};
  for (const name of scenes) {
    const expr = await setup(name);
    if (expr) { await evaluate(expr); await sleep(1100); }
    await shot(name);
    const s = await evaluate(STATS_EXPR);
    try { report[name] = JSON.parse(s || '{}'); } catch (e) { report[name] = { error: String(s) }; }
    console.log(name, JSON.stringify(report[name]));
  }
  fs.writeFileSync(path.join(OUT, 'stats.json'), JSON.stringify(report, null, 2));
  console.log('OUT', OUT);
  if (errors.length) { console.log('--- ERRORS ---'); errors.slice(0, 8).forEach((e) => console.log(e)); }
  else console.log('no runtime errors');
  try { ws.close(); } catch (e) { /* noop */ }
  chrome.kill();
}

main().catch((e) => {
  console.error(e);
  try { chrome.kill(); } catch (err) { /* noop */ }
  process.exit(1);
});
