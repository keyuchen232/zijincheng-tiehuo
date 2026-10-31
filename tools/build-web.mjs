/* Build a single-file website version of 紫禁城 · 铁火.
   Usage: node tools/build-web.mjs [output.html]

   改过两次的坑：
   · 以前只认 styles.css 一个外链样式，队友加了 css/cut.css 之后构建直接抛错；
   · 以前只内联 js/ 下的脚本，data/ 下的地图、过场、文案包（data/script.js）
     还是外链 —— 直接用 file:// 打开时 fetch 拿不到 json，文案会变成 ⟪key⟫。
   所以现在：所有 <link rel="stylesheet"> 和 js|data 下的 <script src> 全部内联。
*/
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'web.html');

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* 1) 外链样式表全部内联 */
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, rel) => {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error('stylesheet not found: ' + rel);
  return '<style data-href="' + rel + '">\n' + fs.readFileSync(file, 'utf8') + '\n</style>';
});
if (/<link rel="stylesheet"/.test(html)) throw new Error('unreplaced stylesheet remains');

/* 2) 游戏脚本全部内联（js/ 代码 + data/ 地图·过场·文案包） */
const scriptRe = /<script src="((?:js|data)\/[^"]+)"><\/script>/g;
const scripts = [...html.matchAll(scriptRe)];
if (scripts.length === 0) throw new Error('no game scripts found');
for (const match of scripts) {
  const rel = match[1];
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error('script not found: ' + rel);
  const js = fs.readFileSync(file, 'utf8');
  if (js.includes('</script')) throw new Error('unsafe closing script tag in ' + rel);
  html = html.replace(
    `<script src="${rel}"></script>`,
    () => `<script data-src="${rel}">\n` + js + '\n</script>'
  );
}
if (/<script src="(?:js|data)\//.test(html)) throw new Error('unreplaced script tag remains');
if (!html.includes('G.$$ =')) throw new Error('build corrupted the G.$$ selector helper');

html = html.replace(
  '<!doctype html>',
  '<!doctype html>\n<!-- 紫禁城 · 铁火 — 单文件网站版（由 tools/build-web.mjs 生成） -->'
);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log('built', OUT, Math.round(Buffer.byteLength(html) / 1024) + ' KB');
