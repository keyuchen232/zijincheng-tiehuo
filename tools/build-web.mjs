/* Build a single-file website version of 紫禁城 · 铁火.
   Usage: node tools/build-web.mjs [output.html]
*/
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'web.html');

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 内联所有本地样式表（styles.css、css/cut.css 等）
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, rel) =>
  '<style>\n' + fs.readFileSync(path.join(ROOT, rel), 'utf8') + '\n</style>');
if (!html.includes('<style>')) throw new Error('styles.css <link> not found');

// 内联 js/ 与 data/ 下的脚本（模块化的地图/过场/文案表都在 data/）
const scriptRe = /<script src="((?:js|data)\/[^"]+)"><\/script>/g;
const scripts = [...html.matchAll(scriptRe)];
if (scripts.length === 0) throw new Error('no game scripts found');
for (const match of scripts) {
  const rel = match[1];
  const js = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (js.includes('</script')) throw new Error('unsafe closing script tag in ' + rel);
  html = html.replace(
    `<script src="${rel}"></script>`,
    () => `<script data-src="${rel}">\n` + js + '\n</script>'
  );
}
if (/<script src="(?:js|data)\//.test(html)) throw new Error('unreplaced script tag remains');
if (/<link rel="stylesheet"/.test(html)) throw new Error('unreplaced stylesheet remains');
if (!html.includes('G.$$ =')) throw new Error('build corrupted the G.$$ selector helper');

html = html.replace(
  '<!doctype html>',
  '<!doctype html>\n<!-- 紫禁城 · 铁火 — 单文件网站版（由 tools/build-web.mjs 生成） -->'
);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log('built', OUT, Math.round(Buffer.byteLength(html) / 1024) + ' KB');
