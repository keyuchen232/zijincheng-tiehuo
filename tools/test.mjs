/* End-to-end smoke test for 紫禁城 · 铁火 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const ROOT = path.resolve(import.meta.dirname, '..');
const PROFILE = path.join(ROOT, '.chrome-test-profile');
fs.rmSync(PROFILE, { recursive: true, force: true });
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9335;
const APP = process.env.APP || 'http://127.0.0.1:8123/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const results = [];

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-breakpad',
  '--disable-dev-shm-usage', '--hide-scrollbars', '--allow-file-access-from-files', '--no-first-run',
  '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

let ws;
let nextId = 1;
const pending = new Map();

async function waitPort() {
  for (let i = 0; i < 80; i++) {
    try { await getJSON(`http://127.0.0.1:${PORT}/json/version`); return; } catch (e) { /* retry */ }
    await sleep(150);
  }
  throw new Error('CDP did not start');
}
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) {
    const msg = r.exceptionDetails.exception?.description || r.exceptionDetails.text;
    errors.push('EVAL: ' + msg);
    throw new Error(msg);
  }
  return r.result?.value;
}
async function waitFor(expr, timeout = 5000, label = expr) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await ev(expr)) return true;
    await sleep(120);
  }
  throw new Error('timeout waiting: ' + label);
}
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : ''));
  if (!ok) errors.push('CHECK: ' + name + ' ' + (detail || ''));
}

async function main() {
  await waitPort();
  const targets = await getJSON(`http://127.0.0.1:${PORT}/json/list`);
  const target = targets.find((t) => t.type === 'page') || targets[0];
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const line = 'EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
      if (!errors.includes(line)) errors.push(line);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = 'CONSOLE: ' + msg.params.args.map((a) => a.value ?? a.description).join(' ');
      if (!errors.includes(text)) errors.push(text);
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: APP });
  await sleep(1600);

  check('title visible', await ev('!document.querySelector("#title").classList.contains("hidden")'));
  check('title has four entries', (await ev('document.querySelectorAll("#title .title-actions .btn").length')) === 4);
  check('story mode button exists', await ev('!!document.querySelector("#btn-start")'));
  check('continue button exists', await ev('!!document.querySelector("#btn-continue")'));
  check('creative mode button exists', await ev('!!document.querySelector("#btn-create")'));
  check('exit button exists', await ev('!!document.querySelector("#btn-exit")'));
  check('legacy entry buttons removed', await ev('document.querySelector("#btn-fusion") === null && document.querySelector("#btn-athens") === null'));
  check('dialog body uses kai font', (await ev('getComputedStyle(document.querySelector("#dlg-text")).fontFamily')).indexOf('KaiTi') >= 0);
  check('dialog name uses yahei font', (await ev('getComputedStyle(document.querySelector("#dlg-name")).fontFamily')).indexOf('Microsoft YaHei') >= 0);
  check('booking UI removed', await ev('document.querySelector("#booking") === null'));
  await ev('document.querySelector("#btn-start").click()');
  await sleep(1200);
  check('start enters beijing', (await ev('G.scene && G.scene.id')) === 'beijing');
  check('title hidden', await ev('G.titleActive === false'));

  // home button -> hall with workbench -> back to the same spot
  await ev('if (G.dialog.active) G.dialog.skip()');
  await sleep(200);
  const beforeHome = await ev('JSON.stringify({x:G.scene.player.x,y:G.scene.player.y})');
  await ev('document.querySelector("#btn-home").click()');
  await sleep(1000);
  check('home button enters hall', (await ev('G.scene && G.scene.id')) === 'home');
  check('home button changes to leave', (await ev('document.querySelector("#btn-home").textContent')) === '出');
  check('craft bench exists', await ev('!!G.scene.craftBench'));
  check('repair bench exists', await ev('!!G.scene.repairBench'));
  await ev('if (G.dialog.active) G.dialog.skip(); G.scene.useCraftBench()');
  await sleep(200);
  await ev('G.dialog.skip()');
  await sleep(200);
  check('craft bench inspected', await ev('G.scene.visitedCraft === true'));
  await ev('G.scene.useRepairBench()');
  await sleep(200);
  await ev('G.dialog.skip()');
  await sleep(300);
  check('repair bench inspected', await ev('G.scene.visitedRepair === true'));
  check('objective points to door', /大门/.test(await ev('document.querySelector("#objective").textContent')));
  await ev('document.querySelector("#btn-home").click()');
  await sleep(1000);
  check('home button returns to beijing', (await ev('G.scene && G.scene.id')) === 'beijing');
  const afterHome = await ev('JSON.stringify({x:G.scene.player.x,y:G.scene.player.y})');
  check('home returns to same spot', beforeHome === afterHome, beforeHome + ' / ' + afterHome);

  // approach 午门 -> direct security entry
  await ev('G.scene.setPlayer(1100,856); G.scene.gate()');
  await sleep(200);
  await ev('G.dialog.skip()');
  await waitFor('G.security.active', 3000, 'security start');
  check('security overlay', true);
  check('security has two checks', (await ev('document.querySelectorAll("#security .sec-row").length')) === 2);
  check('no reservation code row', await ev('document.querySelector("#sec-ticket-text") === null'));
  await ev('G.security.finish(); G.security.enter()');
  await sleep(1300);
  check('entered palace scene', (await ev('G.scene && G.scene.id')) === 'gugong');
  check('entered flag', await ev('G.save.data.flags.entered'));
  await ev('if (G.dialog.active) G.dialog.skip()');
  await sleep(200);

  // meet zhao
  await ev('G.scene.setPlayer(750,260); G.scene.talkTo(G.scene.zhao)');
  await sleep(200);
  await ev('G.dialog.skip()');
  await sleep(400);
  check('met zhao', await ev('G.save.data.flags.metZhao'));
  check('objective mentions materials', /材料/.test(await ev('document.querySelector("#objective").textContent')));

  // collect all
  await ev('G.scene.collectItem("iron"); G.scene.collectItem("charcoal"); G.scene.collectItem("ladle")');
  await sleep(300);
  check('materials 3/3', await ev('G.scene.collectedCount() === 3'));
  check('objective return', /交给老赵/.test(await ev('document.querySelector("#objective").textContent')));

  // night
  await ev('G.scene.talkTo(G.scene.zhao)');
  await sleep(200);
  await ev('G.dialog.skip()');
  await sleep(4500);
  check('night flag', await ev('G.save.data.flags.night'));
  check('scene night', await ev('G.scene.night'));
  await sleep(1400);
  await ev('if (G.dialog.active) G.dialog.skip()');
  await waitFor('G.dialog.active', 3000, 'tiehua confirm');
  check('tiehua confirm dialog asks to play', true);
  await ev('G.dialog.skip(true)'); // 选“是”
  await waitFor('G.difficulty.active', 3000, 'difficulty select');
  check('tiehua difficulty select opens', true);
  await ev('G.difficulty.pick("hard")');
  await waitFor('G.minigame.active', 3000, 'minigame start');
  check('minigame active', true);

  // one throw
  await ev('G.minigame.action()');
  await sleep(120);
  await ev('G.minigame.power=0.7; G.minigame.action()');
  await sleep(120);
  await ev('G.minigame.reticle={x:G.minigame.target.x,y:G.minigame.target.y}; G.minigame.action()');
  await sleep(800);
  const score = await ev('G.minigame.score');
  check('throw scored', score > 0, 'score=' + score);
  check('combo', (await ev('G.minigame.combo')) >= 1);

  // finish + exit
  await ev('G.minigame.finish()');
  await sleep(300);
  check('result visible', await ev('!document.querySelector("#mg-result").classList.contains("hidden")'));
  await ev('document.querySelector("#res-exit").click()');
  await sleep(1200);
  check('finished flag', await ev('G.save.data.flags.finished'));
  check('returned to gugong', (await ev('G.scene && G.scene.id')) === 'gugong');
  check('best score saved', (await ev('G.save.data.best')) >= score);

  // reload + continue
  await send('Page.reload');
  await sleep(1800);
  check('continue enabled', await ev('!document.querySelector("#btn-continue").disabled'));
  await ev('document.querySelector("#btn-start").click()');
  await sleep(350);
  check('new-game confirm appears', await ev('G.confirmOpen === true'));
  await ev('document.querySelector("#confirm-no").click()');
  await sleep(250);
  check('cancel keeps title', await ev('G.confirmOpen === false && G.titleActive === true'));
  await ev('document.querySelector("#btn-continue").click()');
  await sleep(1400);
  check('continue enters palace', (await ev('G.scene && G.scene.id')) === 'gugong');
  check('continue at night', await ev('G.scene.night === true'));
  const palacePos = await ev('JSON.stringify({x:G.scene.player.x,y:G.scene.player.y})');
  await ev('document.querySelector("#btn-home").click()');
  await sleep(1000);
  check('home works from palace', (await ev('G.scene && G.scene.id')) === 'home');
  await ev('if (G.dialog.active) G.dialog.skip(); document.querySelector("#btn-home").click()');
  await sleep(1000);
  check('returns to palace', (await ev('G.scene && G.scene.id')) === 'gugong');
  const palacePos2 = await ev('JSON.stringify({x:G.scene.player.x,y:G.scene.player.y})');
  check('palace position preserved', palacePos === palacePos2, palacePos + ' / ' + palacePos2);
  check('palace still night', await ev('G.scene.night === true'));
  await ev('G.scene.toggleMap(true)');
  await sleep(200);
  check('palace map opens', await ev('G.scene.mapOpen === true'));
  check('HUD hides on map', await ev('document.querySelector("#hud").classList.contains("map-open")'));
  await ev('G.scene.toggleMap(false)');
  await sleep(200);
  check('palace map closes', await ev('G.scene.mapOpen === false'));
  await ev('document.querySelector("#btn-codex").click()');
  await sleep(300);
  check('codex opens', await ev('!document.querySelector("#codex").classList.contains("hidden")'));
  await ev('document.querySelector("#codex-close").click()');
  await sleep(200);
  check('codex closes', await ev('document.querySelector("#codex").classList.contains("hidden")'));

  // standalone fusion chapter
  await ev('G.debug.fusion()');
  await sleep(900);
  check('fusion scene opens', (await ev('G.scene && G.scene.id')) === 'fusion');
  await ev('G.scene.toggleMap(true)');
  await sleep(200);
  check('fusion map opens', await ev('G.scene.mapOpen === true'));
  await ev('window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyM", key: "m", bubbles: true }))');
  await sleep(250);
  check('fusion map closes with M', await ev('G.scene.mapOpen === false'));
  await ev('G.scene.toggleMap(true); document.querySelector("#game").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))');
  await sleep(200);
  check('fusion map closes on tap', await ev('G.scene.mapOpen === false'));
  await ev('G.scene.takeArchive("cn")');
  await sleep(250);
  check('CN confirm dialog asks to play', await ev('G.dialog.active === true'));
  await ev('G.dialog.skip(true)'); // 选“是”
  await waitFor('G.difficulty.active', 2500, 'cn difficulty');
  check('CN difficulty select opens', true);
  await ev('G.difficulty.pick("hard")');
  await waitFor('G.archiveGame.active', 2500, 'cn game');
  check('Chinese archive mini-game opens', true);
  await ev('G.archiveGame.forceComplete()');
  await sleep(500);
  check('Chinese archive collected', await ev('G.scene.state.cn === true'));
  await ev('if (G.dialog.active) G.dialog.skip()');
  await sleep(200);
  await ev('G.scene.takeArchive("en")');
  await sleep(250);
  check('EN confirm dialog asks to play', await ev('G.dialog.active === true'));
  await ev('G.dialog.skip(true)'); // 选“是”
  await waitFor('G.difficulty.active', 2500, 'en difficulty');
  check('EN difficulty select opens', true);
  await ev('G.difficulty.pick("hard")');
  await waitFor('G.archiveGame.active', 2500, 'en game');
  check('Greek archive mini-game opens', true);
  await ev('G.archiveGame.forceComplete()');
  await sleep(500);
  check('Greek archive collected', await ev('G.scene.state.en === true'));
  await ev('if (G.dialog.active) G.dialog.skip()');
  await sleep(200);
  check('fusion archives 2/2', await ev('G.scene.state.cn && G.scene.state.en'));
  await ev('G.scene.finishRepair()');
  check('fusion repaired', await ev('G.scene.state.repaired === true'));
  await ev('G.scene.useTerminal()');
  await sleep(300);
  check('source quiz opens', await ev('G.sourceQuiz.active === true'));
  await ev('G.sourceQuiz.forceComplete()');
  await sleep(400);
  check('source judgment verified', await ev('G.scene.state.verified === true'));
  await ev('G.scene.enterPortal()');
  await sleep(6500);
  check('fusion chapter complete', await ev('G.scene.state.completed === true'));
  await ev('if (G.dialog.active) G.dialog.skip(); G.leaveFusion()');
  await sleep(900);
  check('fusion exits to title', await ev('G.titleActive === true'));
  await ev('document.querySelector("#btn-create").click()');
  await sleep(900);
  check('creative mode button works', (await ev('G.scene && G.scene.id')) === 'fusion');
  await ev('G.leaveFusion()');
  await sleep(900);
  check('creative mode exit restores title', await ev('G.titleActive === true'));

  // exit game screen
  await ev('document.querySelector("#btn-exit").click()');
  await sleep(900);
  check('exit screen shows', await ev('!document.querySelector("#exit-screen").classList.contains("hidden")'));
  check('exit leaves title mode', await ev('G.titleActive === false'));
  await ev('document.querySelector("#btn-back-title").click()');
  await sleep(500);
  check('re-enter title from exit screen', await ev('G.titleActive === true && !document.querySelector("#title").classList.contains("hidden")'));
  check('exit screen hidden again', await ev('document.querySelector("#exit-screen").classList.contains("hidden")'));
  await ev('document.querySelector("#btn-exit").click()');
  await sleep(900);
  await ev('window.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", key: "Escape", bubbles: true }))');
  await sleep(400);
  check('Escape re-enters title from exit screen', await ev('G.titleActive === true && document.querySelector("#exit-screen").classList.contains("hidden")'));

  // plugin（同境异笔）from upstream: pause-menu entry, keeps the four title entries
  await ev('G.debug.beijing(1100,1200)');
  await sleep(700);
  await ev('document.querySelector("#btn-menu").click()');
  await sleep(300);
  await ev('document.querySelector("#menu-artdemo").click()');
  await sleep(1000);
  check('plugin overlay opens', await ev('!document.querySelector("#artdemo").classList.contains("hidden")'));
  check('plugin keeps four title entries', (await ev('document.querySelectorAll("#title .title-actions .btn").length')) === 4);
  await ev('G.closeArtDemo()');
  await sleep(300);
  check('plugin overlay closes', await ev('document.querySelector("#artdemo").classList.contains("hidden")'));

  console.log('\nRESULTS', JSON.stringify(results, null, 2));
  if (errors.length) {
    console.log('\nERRORS');
    [...new Set(errors)].forEach((e) => console.log(e));
    process.exitCode = 1;
  } else {
    console.log('\nALL CHECKS PASSED');
  }
  try { ws.close(); } catch (e) { /* noop */ }
  chrome.kill();
}

main().catch((e) => {
  console.error(e);
  console.log('ERRORS', [...new Set(errors)]);
  try { chrome.kill(); } catch (err) { /* noop */ }
  process.exit(1);
});
