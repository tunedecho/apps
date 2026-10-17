// Serves _site/ locally under the same base path as the live site: http://localhost:8080/apps/
// Usage: node scripts/serve.mjs [port]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '_site');
const { base } = JSON.parse(fs.readFileSync(path.join(root, 'site/site.json'), 'utf8'));
const port = Number(process.argv[2]) || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/' || url === base) return res.writeHead(302, { Location: base + '/' }).end();
  let file = url.startsWith(base + '/') ? path.join(out, url.slice(base.length)) : null;
  if (file && !file.startsWith(out)) file = null;
  if (file && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.endsWith('/')) return res.writeHead(301, { Location: url + '/' }).end();
    file = path.join(file, 'index.html');
  }
  if (!file || !fs.existsSync(file)) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return fs.createReadStream(path.join(out, '404.html')).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Serving ${path.relative(root, out)}/ at http://localhost:${port}${base}/`));
