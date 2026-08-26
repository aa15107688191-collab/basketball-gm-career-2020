const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const hexHtml = fs.readFileSync(path.join(root, 'hex.html'), 'utf8');
const hexEngine = fs.readFileSync(path.join(root, 'hex-engine.js'), 'utf8');
const serverDir = path.join(root, 'dist', 'server');
fs.mkdirSync(serverDir, { recursive: true });

const worker = `const HTML = ${JSON.stringify(html)};
const HEX_HTML = ${JSON.stringify(hexHtml)};
const HEX_ENGINE = ${JSON.stringify(hexEngine)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = url.pathname === '/' || url.pathname === '/index.html'
      ? { body: HTML, type: 'text/html; charset=utf-8' }
      : url.pathname === '/hex.html'
        ? { body: HEX_HTML, type: 'text/html; charset=utf-8' }
        : url.pathname === '/hex-engine.js'
          ? { body: HEX_ENGINE, type: 'application/javascript; charset=utf-8' }
          : null;
    if (!asset) return new Response('Not Found', { status: 404 });
    return new Response(asset.body, {
      headers: {
        'content-type': asset.type,
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin'
      }
    });
  }
};
`;

fs.writeFileSync(path.join(serverDir, 'index.js'), worker);
console.log('Built dist/server/index.js');
