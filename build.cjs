const fs = require('fs');
const path = require('path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const gmHtml = fs.readFileSync(path.join(root, 'gm.html'), 'utf8');
const hexHtml = fs.readFileSync(path.join(root, 'hex.html'), 'utf8');
const conquestHtml = fs.readFileSync(path.join(root, 'conquest.html'), 'utf8');
const hexEngine = fs.readFileSync(path.join(root, 'hex-engine.js'), 'utf8');
const hexAvatars = fs.readFileSync(path.join(root, 'hex-avatars.js'), 'utf8');
const hexV02 = fs.readFileSync(path.join(root, 'hex-v02.js'), 'utf8');
const hexV021 = fs.readFileSync(path.join(root, 'hex-v021.js'), 'utf8');
const hexV022 = fs.readFileSync(path.join(root, 'hex-v022.js'), 'utf8');
const hexV03 = fs.readFileSync(path.join(root, 'hex-v03.js'), 'utf8');
const hexAnalytics = fs.readFileSync(path.join(root, 'hex-analytics.js'), 'utf8');
const hexUi = fs.readFileSync(path.join(root, 'hex-ui.js'), 'utf8');
const conquestUi = fs.readFileSync(path.join(root, 'conquest-ui.js'), 'utf8');
const hexV02Css = fs.readFileSync(path.join(root, 'hex-v02.css'), 'utf8');
const conquestCss = fs.readFileSync(path.join(root, 'conquest.css'), 'utf8');
const teamLogoDir = path.join(root, 'assets', 'team-logos');
const teamLogos = Object.fromEntries(fs.readdirSync(teamLogoDir).filter(name => name.endsWith('.svg')).map(name => [name, fs.readFileSync(path.join(teamLogoDir, name), 'utf8')]));
const serverDir = path.join(root, 'dist', 'server');
fs.mkdirSync(serverDir, { recursive: true });

const worker = `const HTML = ${JSON.stringify(html)};
const GM_HTML = ${JSON.stringify(gmHtml)};
const HEX_HTML = ${JSON.stringify(hexHtml)};
const CONQUEST_HTML = ${JSON.stringify(conquestHtml)};
const HEX_ENGINE = ${JSON.stringify(hexEngine)};
const HEX_AVATARS = ${JSON.stringify(hexAvatars)};
const HEX_V02 = ${JSON.stringify(hexV02)};
const HEX_V021 = ${JSON.stringify(hexV021)};
const HEX_V022 = ${JSON.stringify(hexV022)};
const HEX_V03 = ${JSON.stringify(hexV03)};
const HEX_ANALYTICS = ${JSON.stringify(hexAnalytics)};
const HEX_UI = ${JSON.stringify(hexUi)};
const CONQUEST_UI = ${JSON.stringify(conquestUi)};
const HEX_V02_CSS = ${JSON.stringify(hexV02Css)};
const CONQUEST_CSS = ${JSON.stringify(conquestCss)};
const TEAM_LOGOS = ${JSON.stringify(teamLogos)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const teamLogoMatch = url.pathname.match(/^\\/assets\\/team-logos\\/([A-Z]{2,3}\\.svg)$/);
    if (teamLogoMatch && TEAM_LOGOS[teamLogoMatch[1]]) return new Response(TEAM_LOGOS[teamLogoMatch[1]], { headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' } });
    const asset = url.pathname === '/' || url.pathname === '/index.html'
      ? { body: HTML, type: 'text/html; charset=utf-8' }
      : url.pathname === '/gm.html'
        ? { body: GM_HTML, type: 'text/html; charset=utf-8' }
      : url.pathname === '/hex.html'
        ? { body: HEX_HTML, type: 'text/html; charset=utf-8' }
      : url.pathname === '/conquest.html'
        ? { body: CONQUEST_HTML, type: 'text/html; charset=utf-8' }
        : url.pathname === '/hex-engine.js'
          ? { body: HEX_ENGINE, type: 'application/javascript; charset=utf-8' }
          : url.pathname === '/hex-avatars.js'
            ? { body: HEX_AVATARS, type: 'application/javascript; charset=utf-8' }
          : url.pathname === '/hex-v02.js'
            ? { body: HEX_V02, type: 'application/javascript; charset=utf-8' }
            : url.pathname === '/hex-v021.js'
              ? { body: HEX_V021, type: 'application/javascript; charset=utf-8' }
            : url.pathname === '/hex-v022.js'
              ? { body: HEX_V022, type: 'application/javascript; charset=utf-8' }
            : url.pathname === '/hex-v03.js'
              ? { body: HEX_V03, type: 'application/javascript; charset=utf-8' }
              : url.pathname === '/hex-analytics.js'
                ? { body: HEX_ANALYTICS, type: 'application/javascript; charset=utf-8' }
            : url.pathname === '/hex-ui.js'
              ? { body: HEX_UI, type: 'application/javascript; charset=utf-8' }
            : url.pathname === '/conquest-ui.js'
              ? { body: CONQUEST_UI, type: 'application/javascript; charset=utf-8' }
              : url.pathname === '/hex-v02.css'
                ? { body: HEX_V02_CSS, type: 'text/css; charset=utf-8' }
              : url.pathname === '/conquest.css'
                ? { body: CONQUEST_CSS, type: 'text/css; charset=utf-8' }
          : null;
    if (!asset) return new Response('Not Found', { status: 404 });
    const isHtml = asset.type.startsWith('text/html');
    return new Response(asset.body, {
      headers: {
        'content-type': asset.type,
        'cache-control': isHtml ? 'no-store, no-cache, must-revalidate, max-age=0' : 'public, max-age=31536000, immutable',
        ...(isHtml ? { 'pragma': 'no-cache', 'expires': '0' } : {}),
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin'
      }
    });
  }
};
`;

fs.writeFileSync(path.join(serverDir, 'index.js'), worker);
console.log('Built dist/server/index.js');
