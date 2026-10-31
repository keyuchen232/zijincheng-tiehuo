/* 找出「登记了但没人用」和「写了但没人读」的东西 —— 也就是废案。
   Usage: node tools/audit.mjs
*/
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
}

const jsFiles = walk(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js'));
const dataFiles = walk(path.join(ROOT, 'data')).filter((f) => f.endsWith('.js'));
const read = (f) => fs.readFileSync(f, 'utf8');

/* 1) 画笔：登记 vs 被引用 */
const registered = new Map();
for (const f of jsFiles) {
  for (const m of read(f).matchAll(/G\.mod\.painter\(\s*'([^']+)'/g)) {
    registered.set(m[1], path.relative(ROOT, f));
  }
}
const used = new Set();
for (const f of dataFiles) {
  const s = read(f);
  for (const m of s.matchAll(/painter:\s*'([^']+)'/g)) used.add(m[1]);
  /* 过场里的 { t:'portrait', who:'x' } 会去找 portrait.x */
  for (const m of s.matchAll(/\{\s*t:\s*'portrait'[^}]*who:\s*'([^']+)'/g)) used.add('portrait.' + m[1]);
}
/* 屏幕层画笔：玩法里 scene.screenPainters = ['x'] / .push('x')，不走地图配置 */
for (const f of jsFiles) {
  for (const line of read(f).split('\n')) {
    if (!/screenPainters/.test(line)) continue;
    for (const m of line.matchAll(/'([a-zA-Z]+\.[a-zA-Z_]+)'/g)) used.add(m[1]);
  }
}
/* 直接点名绘制 */
for (const f of jsFiles.concat(dataFiles)) {
  for (const m of read(f).matchAll(/G\.mod\.paint\(\s*'([^']+)'/g)) used.add(m[1]);
}

/* 2) 地图 / 玩法 / 过场：登记 vs 被引用 */
const mapsReg = new Set();
for (const f of dataFiles) for (const m of read(f).matchAll(/kind:\s*'map',\s*id:\s*'([^']+)'/g)) mapsReg.add(m[1]);
const mapsUsed = new Set();
for (const f of dataFiles) for (const m of read(f).matchAll(/next:\s*'([^']+)'/g)) mapsUsed.add(m[1]);
for (const f of walk(path.join(ROOT, 'js'))) for (const m of read(f).matchAll(/G\.mod\.go\(\s*'([^']+)'/g)) mapsUsed.add(m[1]);

const puzzlesReg = new Set();
for (const f of jsFiles) for (const m of read(f).matchAll(/G\.mod\.puzzle\(\s*[A-Z_]+\s*,/g)) void m;
for (const f of jsFiles) {
  const s = read(f);
  const key = (s.match(/const\s+KEY\s*=\s*'([^']+)'/) || [])[1];
  if (key && /G\.mod\.puzzle\(KEY/.test(s)) puzzlesReg.add(key);
}
const puzzlesUsed = new Set();
for (const f of dataFiles) for (const m of read(f).matchAll(/puzzle:\s*'([^']+)'/g)) puzzlesUsed.add(m[1]);

/* 3) 文案：段落有没有消费方 */
let script = {};
const jsonPath = path.join(ROOT, 'data/script.json');
if (fs.existsSync(jsonPath)) script = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const codeAll = jsFiles.concat(dataFiles).map(read).join('\n');
function mentions(name) {
  return (codeAll.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

/* 4) 仓库里的残留文件 */
const stray = [];
for (const f of fs.readdirSync(ROOT)) {
  if (/\.(bak|orig|old|tmp)$/i.test(f) || /^_\w+\.txt$/.test(f)) stray.push(f);
}
for (const f of walk(path.join(ROOT, 'data'))) {
  if (/\.(bak|orig|old|tmp)$/i.test(f) || /^_\w+\.txt$/.test(path.basename(f))) stray.push(path.relative(ROOT, f));
}

const lines = [];
const pad = (s) => String(s).padEnd(22);
lines.push('=== 画笔 ===');
for (const id of registered.keys()) {
  if (!used.has(id)) lines.push('  ! 没人用：' + pad(id) + registered.get(id));
}
lines.push('  登记 ' + registered.size + ' · 被引用 ' + [...registered.keys()].filter((x) => used.has(x)).length);
lines.push('=== 地图 ===');
for (const id of mapsReg) if (!mapsUsed.has(id)) lines.push('  ! 进不去：' + id);
lines.push('  登记 ' + mapsReg.size + ' · 可达 ' + [...mapsReg].filter((x) => mapsUsed.has(x)).length);
lines.push('=== 玩法 ===');
for (const id of puzzlesReg) if (!puzzlesUsed.has(id)) lines.push('  ! 没有交互点引用：' + id);
lines.push('  登记 ' + puzzlesReg.size + ' · 有 spot ' + [...puzzlesReg].filter((x) => puzzlesUsed.has(x)).length);
lines.push('=== 文案段落 ===');
for (const sec of Object.keys(script)) {
  const n = mentions(sec);
  lines.push('  ' + (n === 0 ? '! ' : '  ') + pad(sec) + '代码提及 ' + n);
}
lines.push('=== 残留文件 ===');
lines.push(stray.length ? stray.map((s) => '  ! ' + s).join('\n') : '  （无）');
console.log(lines.join('\n'));
