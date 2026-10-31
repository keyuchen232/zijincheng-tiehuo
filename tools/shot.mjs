/* Screenshot / console QA harness using headless Chrome + CDP.
   Usage: node tools/shot.mjs [shotName ...]
*/
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'shots');
const PROFILE = path.join(ROOT, '.chrome-profile');
fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(PROFILE, { recursive: true, force: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const APP = process.env.APP || 'http://127.0.0.1:8123/';

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
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-breakpad',
  '--disable-dev-shm-usage',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  '--window-size=1440,900',
  'about:blank',
], { stdio: 'ignore', detached: false });

let ws;
let nextId = 1;
const pending = new Map();
const errors = [];

async function waitPort() {
  for (let i = 0; i < 80; i++) {
    try {
      const v = await getJSON(`http://127.0.0.1:${PORT}/json/version`);
      if (v) return;
    } catch (e) { /* retry */ }
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
  return send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  }).then((r) => {
    if (r.exceptionDetails) {
      errors.push('EVAL: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return null;
    }
    return r.result?.value;
  });
}

async function screenshot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
  console.log('shot', name);
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
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value ?? a.description).join(' ');
      if (msg.params.type === 'error') {
        const line = 'CONSOLE: ' + text;
        if (!errors.includes(line)) errors.push(line);
      } else console.log('console:', text);
    } else if (msg.method === 'Log.entryAdded') {
      if (msg.params.entry.level === 'error') errors.push('LOG: ' + msg.params.entry.text);
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: +(process.env.VW || 1440), height: +(process.env.VH || 900),
    deviceScaleFactor: 1, mobile: process.env.MOBILE === '1',
  });
  await send('Page.navigate', { url: APP });
  await sleep(1800);
  if (process.env.MEASURE) {
    console.log('MEASURE', await evaluate(`JSON.stringify({
      innerWidth, clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      wrap: document.querySelector('.wrap')?.getBoundingClientRect().width,
      h1: document.querySelector('h1')?.getBoundingClientRect().width,
      actions: document.querySelector('.actions')?.getBoundingClientRect().width,
      btn: document.querySelector('.btn')?.getBoundingClientRect().width
    })`));
  }

  const wanted = process.argv.slice(2);
  const shots = wanted.length ? wanted : ['title', 'beijing', 'security', 'gugong', 'night', 'mgpower', 'mgaim', 'result'];
  for (const name of shots) {
    if (name === 'fusion') {
      await evaluate('G.debug.fusion()');
      await sleep(1000);
      await screenshot('fusion');
    } else if (name === 'fusion_west') {
      await evaluate('G.debug.fusion(); G.scene.setPlayer(330, 1250)');
      await sleep(900);
      await screenshot('fusion_west');
    } else if (name === 'fusion_east') {
      await evaluate('G.debug.fusion(); G.scene.setPlayer(1110, 1220)');
      await sleep(900);
      await screenshot('fusion_east');
    } else if (name === 'fusion_mid') {
      await evaluate('G.debug.fusion(); G.scene.setPlayer(720, 1050)');
      await sleep(900);
      await screenshot('fusion_mid');
    } else if (name === 'fusion_repaired') {
      await evaluate('G.debug.fusion(); G.scene.state.cn = true; G.scene.state.en = true; G.scene.finishRepair(); G.scene.setPlayer(720, 700)');
      await sleep(1200);
      await screenshot('fusion_repaired');
    } else if (name === 'archive_cn') {
      await evaluate('G.debug.fusion(); G.scene.state.cn = false; G.scene.state.en = false; G.scene.state.repaired = false; G.scene.refreshObjective(); G.scene.takeArchive("cn")');
      await sleep(200);
      await evaluate('G.dialog.skip(true)');
      await sleep(120);
      await evaluate('G.difficulty.pick("hell")');
      await sleep(700);
      await screenshot('archive_cn');
    } else if (name === 'difficulty') {
      await evaluate('G.debug.fusion(); G.scene.state.cn = false; G.scene.state.en = false; G.scene.state.repaired = false; G.scene.refreshObjective(); G.scene.takeArchive("cn")');
      await sleep(200);
      await evaluate('G.dialog.skip(true)');
      await sleep(700);
      await screenshot('difficulty');
    } else if (name === 'archive_en') {
      await evaluate('G.debug.fusion(); G.scene.state.cn = false; G.scene.state.en = false; G.scene.state.repaired = false; G.scene.refreshObjective(); G.scene.takeArchive("en")');
      await sleep(200);
      await evaluate('G.dialog.skip(true)');
      await sleep(120);
      await evaluate('G.difficulty.pick("hell")');
      await sleep(700);
      await screenshot('archive_en');
    } else if (name === 'source_quiz') {
      await evaluate('G.debug.fusion(); G.scene.state.cn = true; G.scene.state.en = true; G.scene.finishRepair(); G.scene.useTerminal()');
      await sleep(600);
      await screenshot('source_quiz');
    } else if (name === 'fusion_after') {
      await evaluate('G.debug.fusion(); G.scene.state.cn = true; G.scene.state.en = true; G.scene.finishRepair(); G.scene.setPlayer(720, 1050)');
      await sleep(1200);
      await screenshot('fusion_after');
    } else if (name === 'fusion_map') {
      await evaluate('G.debug.fusion(); G.scene.toggleMap(true)');
      await sleep(600);
      await screenshot('fusion_map');
    } else if (name === 'share') {
      await sleep(300);
      await screenshot(process.env.SHOT_NAME || 'share');
    } else if (name === 'public') {
      await sleep(20000);
      console.log('PUBLICSTATE', await evaluate('JSON.stringify({href:location.href,ready:document.readyState,G:typeof G,scene:typeof G!=="undefined"&&G.scene&&G.scene.id,title:typeof G!=="undefined"&&G.titleActive,scripts:[...document.scripts].map(s=>s.src),res:performance.getEntriesByType("resource").map(e=>({n:e.name.split("/").pop(),d:Math.round(e.duration),s:e.transferSize}))})'));
      await screenshot(process.env.SHOT_NAME || 'public');
    } else if (name === 'title') {
      await evaluate('G.debug.title()');
      await sleep(700);
      await screenshot('title');
    } else if (name === 'cover') {
      await evaluate('G.debug.gugong(750, 980); G.ui.showHud(false)');
      await sleep(900);
      await screenshot('cover');
    } else if (name === 'home') {
      await evaluate('G.debug.home()');
      await sleep(900);
      await screenshot('home');
    } else if (name === 'home_bench') {
      await evaluate('G.debug.home()');
      await sleep(500);
      await evaluate('G.scene.useCraftBench(); G.dialog.skip()');
      await sleep(500);
      await screenshot('home_bench');
    } else if (name === 'beijing') {
      await evaluate('G.debug.setFlags({introSeen:true}); G.debug.beijing(1100,1200)');
      await sleep(900);
      await screenshot('beijing');
    } else if (name === 'beijing_gate') {
      await evaluate('G.debug.beijing(1100,880)');
      await sleep(900);
      await screenshot('beijing_gate');
    } else if (name === 'dialog') {
      await evaluate('G.debug.setFlags({introSeen:true}); G.debug.beijing(1100,1200); setTimeout(()=>G.dialog.show([{name:"旅行手账",text:"午后的光落在正阳门的红墙上，前门大街的铜铃被风吹得轻轻发响。"},{name:"王大爷",text:"去故宫啊？顺着中轴线往北，过了天安门就是午门。"}]), 200)');
      await sleep(900);
      await screenshot('dialog');
    } else if (name === 'map') {
      await evaluate('G.debug.setFlags({introSeen:true}); G.debug.beijing(1100,1200); G.scene.toggleMap(true)');
      await sleep(500);
      await screenshot('map');
    } else if (name === 'security') {
      await evaluate('G.debug.security()');
      await sleep(700);
      await screenshot('security_mid');
      await sleep(1800);
      await screenshot('security_done');
    } else if (name === 'gugong') {
      await evaluate('G.debug.gugong(750,1300)');
      await sleep(900);
      await screenshot('gugong');
    } else if (name === 'gugong_mid') {
      await evaluate('G.debug.gugong(750,880)');
      await sleep(900);
      await screenshot('gugong_mid');
    } else if (name === 'gugong_map') {
      await evaluate('G.debug.gugong(750,880); G.scene.toggleMap(true)');
      await sleep(500);
      await screenshot('gugong_map');
    } else if (name === 'night') {
      await evaluate('G.debug.night()');
      await sleep(1200);
      await screenshot('night');
    } else if (name === 'mgpower') {
      await evaluate('G.debug.minigame("power")');
      await sleep(700);
      await screenshot('mgpower');
    } else if (name === 'mgaim') {
      await evaluate('G.minigame.active=false; G.hide(document.querySelector("#mg-result")); G.debug.minigame("aim")');
      await sleep(800);
      await screenshot('mgaim');
    } else if (name === 'mgimpact') {
      await evaluate('G.minigame.active=false; G.hide(document.querySelector("#mg-result")); G.debug.minigame("impact")');
      await sleep(500);
      await screenshot('mgimpact');
    } else if (name === 'result') {
      await evaluate('G.minigame.active=false; G.hide(document.querySelector("#mg-result")); G.debug.minigame("result")');
      await sleep(900);
      await screenshot('result');
    } else if (name === 'codex') {
      await evaluate('G.debug.gugong(750,880); G.unlock("taihe"); G.unlock("jinshui");');
      await sleep(400);
      await evaluate('document.querySelector("#btn-codex").click();');
      await sleep(500);
      await screenshot('codex');
    }
  }

  const state = await evaluate('JSON.stringify(G.debug.state ? G.debug.state() : {})');
  console.log('STATE', state);
  if (errors.length) {
    console.log('--- ERRORS ---');
    for (const e of errors) console.log(e);
  } else {
    console.log('no runtime errors');
  }
  try { ws.close(); } catch (e) { /* noop */ }
  chrome.kill();
}

main().catch((e) => {
  console.error(e);
  try { chrome.kill(); } catch (err) { /* noop */ }
  process.exit(1);
});
