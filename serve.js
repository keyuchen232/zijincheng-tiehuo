/* tiny static server for 紫禁城 · 铁火 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT ? +process.env.PORT : 8123;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
};

function proxyApi(req, res) {
  const opts = {
    host: '127.0.0.1', port: 8326, path: req.url, method: req.method,
    headers: Object.assign({}, req.headers, { host: '127.0.0.1:8326' }),
  };
  const up = http.request(opts, (ur) => {
    res.writeHead(ur.statusCode || 502, ur.headers);
    ur.pipe(res);
  });
  up.on('error', () => {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: '创造模式 AI 服务未启动（127.0.0.1:8326）' }));
  });
  req.pipe(up);
}

http.createServer((req, res) => {
  if ((req.url || '').startsWith('/api/')) { proxyApi(req, res); return; }
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403); res.end('forbidden'); return;
  }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('not found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('紫禁城 · 铁火  http://127.0.0.1:' + PORT + '/');
});
