// 웹 개발용 백엔드 프록시.
// 브라우저에서 ngrok 무료 주소를 직접 부르면 ngrok 경고 페이지가 오고, 그걸 건너뛰는 헤더는 백엔드 CORS 가 막는다.
// 그래서 웹에서는 개발 서버(같은 주소)의 /__backend/... 로 보내고, 여기서 헤더를 붙여 백엔드로 대신 전달한다.
// 휴대폰(Expo Go)은 CORS 가 없어서 이 프록시를 쓰지 않고 백엔드로 바로 간다.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const PREFIX = '/__backend';
const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL || '';

let target = null;
try {
  target = apiBase ? new URL(apiBase).origin : null;
} catch {
  target = null;
}

const FORWARD_HEADERS = ['authorization', 'content-type', 'accept', 'x-request-id'];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    req.on('error', reject);
  });
}

async function proxy(req, res) {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    for (const h of FORWARD_HEADERS) if (req.headers[h]) headers[h] = req.headers[h];
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const upstream = await fetch(target + req.url.slice(PREFIX.length), {
      method: req.method,
      headers,
      body: hasBody ? await readBody(req) : undefined,
    });
    // ngrok 이 대신 답한 경우 (예: ERR_NGROK_3200 = 백엔드/터널이 꺼짐) → 알아보기 쉬운 JSON 오류로 바꾼다
    const ngrokError = upstream.headers.get('ngrok-error-code');
    if (ngrokError) {
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { code: 'SERVER_OFFLINE', message: `백엔드 서버가 꺼져 있어요. 백엔드와 ngrok 이 켜져 있는지 확인해 주세요. (${ngrokError})` } }));
      return;
    }
    const out = { 'content-type': upstream.headers.get('content-type') || 'application/json' };
    const reqId = upstream.headers.get('x-request-id');
    if (reqId) out['x-request-id'] = reqId;
    res.writeHead(upstream.status, out);
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { code: 'PROXY_ERROR', message: `백엔드에 연결할 수 없어요 (${err.message})` } }));
  }
}

if (target) {
  config.server = config.server || {};
  const prev = config.server.enhanceMiddleware;
  config.server.enhanceMiddleware = (middleware, server) => {
    const inner = prev ? prev(middleware, server) : middleware;
    return (req, res, next) => (req.url.startsWith(PREFIX + '/') ? proxy(req, res) : inner(req, res, next));
  };
}

module.exports = config;
