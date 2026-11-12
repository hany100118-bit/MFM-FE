// API 호출기 단위 테스트 (Node 내장 테스트, 가짜 fetch). 실행: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient, ApiError } from './client.js';

const json = (status, body) => ({ status, ok: status < 400, json: async () => body });
function make(responder, extra = {}) {
  const calls = [];
  const client = createApiClient({
    baseUrl: 'http://api.test/api/',
    getToken: async () => 'stored-token',
    fetchImpl: async (url, init) => { calls.push({ url, init }); return responder(url, init); },
    ...extra,
  });
  return { client, calls };
}

test('성공 응답이면 data 만 돌려주고, 저장된 토큰을 붙인다', async () => {
  const { client, calls } = make(() => json(200, { success: true, data: { ok: 1 } }));
  assert.deepEqual(await client.get('/users/me'), { ok: 1 });
  assert.equal(calls[0].url, 'http://api.test/api/users/me');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer stored-token');
});

test('쿼리는 빈 값을 빼고 인코딩한다', async () => {
  const { client, calls } = make(() => json(200, { success: true, data: {} }));
  await client.get('/letters/received', { query: { box: 'archived', q: '생일 편지', from: undefined, sort: '' } });
  assert.equal(calls[0].url, `http://api.test/api/letters/received?box=archived&q=${encodeURIComponent('생일 편지')}`);
});

test('token 을 직접 넘기면 그 토큰을, null 이면 토큰 없이 보낸다', async () => {
  const { client, calls } = make(() => json(200, { success: true, data: {} }));
  await client.post('/auth/signup', { a: 1 }, { token: 'signup-token' });
  await client.post('/auth/kakao', { code: 'c' }, { token: null });
  assert.equal(calls[0].init.headers.Authorization, 'Bearer signup-token');
  assert.equal(calls[1].init.headers.Authorization, undefined);
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
});

test('서버 오류 형식을 ApiError(status, code, message, requestId)로 바꾼다', async () => {
  const { client } = make(() => json(409, { success: false, error: { code: 'FORBIDDEN_ACTION', message: '이미 답장했어요.', requestId: 'r1' } }));
  await assert.rejects(client.post('/letters/1/reply', {}), (e) => e instanceof ApiError && e.status === 409 && e.code === 'FORBIDDEN_ACTION' && e.message === '이미 답장했어요.' && e.requestId === 'r1');
});

test('저장된 토큰이 401 이면 로그아웃 처리를 부르고, 직접 넘긴 토큰의 401 은 부르지 않는다', async () => {
  let called = 0;
  const { client } = make(() => json(401, { success: false, error: { code: 'UNAUTHORIZED' } }), { onUnauthorized: () => { called += 1; } });
  await assert.rejects(client.get('/users/me'));
  await assert.rejects(client.post('/auth/signup', {}, { token: 'signup' }));
  assert.equal(called, 1);
});

test('JSON 이 아닌 응답(없는 주소 등) → UNEXPECTED_RESPONSE', async () => {
  const { client } = make(() => ({ status: 404, ok: false, json: async () => { throw new SyntaxError('html'); } }));
  await assert.rejects(client.get('/nope'), (e) => e.code === 'UNEXPECTED_RESPONSE' && e.status === 404);
});

test('네트워크 실패 → NETWORK_ERROR, 시간 초과 → NETWORK_TIMEOUT', async () => {
  const { client: a } = make(() => { throw new TypeError('Network request failed'); });
  await assert.rejects(a.get('/health'), (e) => e.code === 'NETWORK_ERROR');
  const b = createApiClient({ baseUrl: 'http://x', getToken: async () => null, timeoutMs: 20,
    fetchImpl: (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))) });
  await assert.rejects(b.get('/health'), (e) => e.code === 'NETWORK_TIMEOUT');
});
