#!/usr/bin/env node
/* ============================================================
   data/script.json  →  data/script.js
   ------------------------------------------------------------
   为什么需要这一步：
   双击 file:// 打开 index.html 时，fetch('data/script.json') 会被
   浏览器的同源策略拦住（file:// 没有源）。所以生成一个
   `window.WXL_SCRIPT = {...}` 的脚本兜底，js/str.js 会优先读它。

   用法：node tools/build-data.mjs
   什么时候跑：每次改完 data/script.json 都要跑一次。
   也可以直接跑 tools/build-all.mjs（如果有）或 build-web.mjs 之后再跑。
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const SRC = resolve(root, 'data/script.json');
const OUT = resolve(root, 'data/script.js');

const raw = readFileSync(SRC, 'utf8');

/* 先做一次语法校验：JSON 错了就在这里报，别等到游戏里变 ⟪key⟫ */
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.error('✗ data/script.json 不是合法 JSON：' + e.message);
  process.exit(1);
}

const header =
  '/* 自动生成，请勿手改。源文件 data/script.json，生成命令 node tools/build-data.mjs */\n';
writeFileSync(OUT, header + 'window.WXL_SCRIPT = ' + JSON.stringify(parsed, null, 1) + ';\n', 'utf8');

const sections = Object.keys(parsed);
console.log('✓ data/script.js 已生成（' + sections.length + ' 段：' + sections.join(', ') + '）');
