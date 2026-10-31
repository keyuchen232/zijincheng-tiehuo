#!/usr/bin/env node
/* ============================================================
   tools/check-modules.mjs —— 拼装前的一致性检查
   ------------------------------------------------------------
   三个人并行开发时，最容易出的错不是语法错，而是「名字对不上」：
   地图引用了 A 没画的 painter、玩法模块 id 拼错、文案 key 少一个。

   这个脚本不启动浏览器，只做静态对账，10 毫秒出结果。
   用法：node tools/check-modules.mjs
   退出码 1 = 有硬错误，不要提交。
   ============================================================ */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);
const rd = (p) => readFileSync(join(root, p), 'utf8');
const has = (p) => existsSync(join(root, p));

function listFiles(dir) {
  if (!has(dir)) return [];
  return readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.js'))
    .map((f) => dir + '/' + f);
}

/* ---------- 1. index.html 的脚本顺序 ---------- */
const html = rd('index.html');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);

const CORE = ['js/core.js', 'js/art.js', 'js/world.js', 'js/str.js', 'js/mod.js', 'js/stage.js', 'js/cut.js'];
CORE.forEach((f) => { if (!scripts.includes(f)) err('index.html 缺少地基脚本 ' + f); });
const pos = (f) => scripts.indexOf(f);
for (let i = 1; i < CORE.length; i++) {
  if (pos(CORE[i - 1]) > pos(CORE[i])) err('index.html 脚本顺序错：' + CORE[i - 1] + ' 应在 ' + CORE[i] + ' 之前');
}
/* js/boot.js 是模块化的启动入口（它绕开了 main.js 的合并冲突），必须是最后一个脚本 */
if (!scripts.includes('js/boot.js')) err('index.html 末尾缺少 js/boot.js —— 没有它 G.mod.boot() 不会被调用');
else if (scripts[scripts.length - 1] !== 'js/boot.js') err('js/boot.js 必须是 index.html 里最后一个 <script>（现在是 ' + scripts[scripts.length - 1] + '）');

/* ---------- 2. 磁盘上的模块文件 ↔ index.html ---------- */
const owned = [
  ...listFiles('js/art'),
  ...listFiles('js/mods'),
  ...listFiles('data/maps'),
  ...listFiles('data/cuts'),
];
owned.forEach((f) => { if (!scripts.includes(f)) err('文件存在但没被引入：' + f + '（在 index.html 对应区块加一行）'); });
scripts
  .filter((f) => /^(js\/(art|mods)|data\/(maps|cuts))\//.test(f))
  .forEach((f) => { if (!has(f)) err('index.html 引用了不存在的文件：' + f); });

/* ---------- 3. 收集已登记的 painter / puzzle / map ---------- */
const painters = new Set();
const puzzles = new Set();
const maps = new Set();
const cuts = new Set();
for (const f of owned) {
  const s = rd(f);
  for (const m of s.matchAll(/G\.mod\.painter\(\s*'([^']+)'/g)) painters.add(m[1]);
  for (const m of s.matchAll(/G\.mod\.puzzle\(\s*'([^']+)'/g)) puzzles.add(m[1]);
  for (const m of s.matchAll(/kind:\s*'cutscene'[\s\S]{0,240}?id:\s*'([^']+)'/g)) cuts.add(m[1]);
  const keyConst = /const\s+KEY\s*=\s*'([^']+)'/.exec(s);
  if (keyConst && /G\.mod\.puzzle\(\s*KEY\s*,/.test(s)) puzzles.add(keyConst[1]);
  for (const m of s.matchAll(/kind:\s*'map'[\s\S]{0,240}?id:\s*'([^']+)'/g)) maps.add(m[1]);
}
if (!painters.size) warn('没有收集到任何 painter —— 检查 G.mod.painter( 的写法');
if (!puzzles.size) warn('没有收集到任何 puzzle —— 检查 G.mod.puzzle( 的写法');

/* ---------- 4. 地图引用是否都落地 ---------- */
for (const f of listFiles('data/maps')) {
  const s = rd(f);
  for (const m of s.matchAll(/painter:\s*'([^']+)'/g)) {
    if (!painters.has(m[1])) err(f + ' 引用了未登记的画笔 ' + m[1]);
  }
  for (const m of s.matchAll(/puzzle:\s*'([^']+)'/g)) {
    if (!puzzles.has(m[1])) err(f + ' 引用了未登记的玩法 ' + m[1]);
  }
}

/* ---------- 5. 文案 key 是否都存在 ---------- */
const script = JSON.parse(rd('data/script.json'));
const leaves = new Set();
const arrays = new Set();
(function flat(o, prefix) {
  for (const k of Object.keys(o)) {
    const v = o[k];
    const p = prefix ? prefix + '.' + k : k;
    if (Array.isArray(v)) arrays.add(p);
    else if (v && typeof v === 'object') flat(v, p);
    else leaves.add(p);
  }
})(script, '');

function hasKey(key) {
  if (leaves.has(key) || arrays.has(key)) return true;
  const dot = key.indexOf('.');
  if (dot > 0) {
    const head = key.slice(0, dot);
    const rest = key.slice(dot + 1);
    const arr = script[head];
    if (Array.isArray(arr)) return arr.some((o) => o && o.id === rest.split('.')[0]);
  }
  return false;
}

const jsFiles = ['js/str.js', 'js/mod.js', 'js/stage.js', ...owned];
for (const f of jsFiles) {
  const s = rd(f);
  const re = /G\.str\.(get|has|seg|dialog|puzzle|options|node)\(\s*'([^']+)'/g;
  for (const m of s.matchAll(re)) {
    const key = m[2];
    /* 动态拼接的 key（'nodes.' + id + '.name'）只校验到点号为止，跳过 */
    if (!key || key.endsWith('.')) continue;
    if (!hasKey(key)) err(f + ' 用到的文案 key 不存在：' + key);
  }
}

/* 地图里 inspect 引用的物件必须在 script.json 的 objects 里 */
const objIds = new Set((script.objects || []).map((o) => o.id));
for (const f of listFiles('data/maps')) {
  for (const m of rd(f).matchAll(/inspect:\s*'([^']+)'/g)) {
    if (!objIds.has(m[1])) err(f + ' 的 inspect 引用了不存在的物件 ' + m[1]);
  }
}

/* ---------- 5b. 过场：引用的过场要存在，字要存在，立绘要画过 ---------- */
for (const f of listFiles('data/maps')) {
  const s = rd(f);
  for (const m of s.matchAll(/(enterCut|exitCut):\s*'([^']+)'/g)) {
    if (!cuts.has(m[2])) err(f + ' 的 ' + m[1] + ' 引用了未登记的过场 ' + m[2]);
  }
}
for (const f of listFiles('data/cuts')) {
  const s = rd(f);
  for (const m of s.matchAll(/(?:key|subKey):\s*'([^']+)'/g)) {
    if (!hasKey(m[1])) err(f + ' 引用了不存在的文案 ' + m[1]);
  }
  for (const m of s.matchAll(/t:\s*'portrait'[\s\S]{0,120}?who:\s*'([^']+)'/g)) {
    if (!painters.has('portrait.' + m[1])) warn(f + ' 要的立绘还没画：portrait.' + m[1] + '（仍可播放，只是少一张画）');
  }
}

/* ---------- 6. file:// 兜底是否过期 ---------- */
if (has('data/script.json')) {
  if (!has('data/script.js')) {
    warn('data/script.js 不存在（双击 file:// 打开时文案会全是 ⟪key⟫）：node tools/build-data.mjs');
  } else {
    const a = statSync(join(root, 'data/script.json')).mtimeMs;
    const b = statSync(join(root, 'data/script.js')).mtimeMs;
    if (a > b + 1000) warn('data/script.js 比 script.json 旧：node tools/build-data.mjs');
  }
}

/* ---------- 报告 ---------- */
console.log('地图 ' + maps.size + ' · 画笔 ' + painters.size + ' · 玩法 ' + puzzles.size +
  ' · 过场 ' + cuts.size + ' · 文案叶节点 ' + leaves.size);
if (warns.length) warns.forEach((w) => console.log('  ! ' + w));
if (errors.length) {
  errors.forEach((e) => console.log('  ✗ ' + e));
  console.log('\n✗ ' + errors.length + ' 个错误');
  process.exit(1);
}
console.log('✓ 模块对账通过');
