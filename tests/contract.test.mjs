// 계약 테스트: 앱의 API 호출기로 "실제 백엔드"를 부르고, 화면이 읽는 필드가 응답에 있는지 확인한다.
// 실행: 백엔드를 DEV_LOGIN_ENABLED=true, NODE_ENV=development, LOG_LEVEL=info 로 띄우고
//   CONTRACT_API=http://localhost:4000/api CONTRACT_LOG=<백엔드 로그 파일> node --test tests/contract.test.mjs
// (개발 환경 백엔드는 인증 메일 대신 로그에 코드를 찍는다)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createApiClient } from '../src/shared/api/client.js';

const BASE = process.env.CONTRACT_API;
const LOG = process.env.CONTRACT_LOG;
const skip = BASE && LOG ? false : 'CONTRACT_API / CONTRACT_LOG 가 없어 건너뜀';

const tokens = {};
let unauthorizedCalls = 0;
const clientFor = (who) => createApiClient({ baseUrl: BASE, getToken: async () => tokens[who] || null, onUnauthorized: () => { unauthorizedCalls += 1; } });
const anon = () => createApiClient({ baseUrl: BASE, getToken: async () => null });
const ymd = (days) => new Date(Date.now() + 9 * 3600e3 + days * 86400e3).toISOString().slice(0, 10);

function lastCodeFor(email) {
  const lines = readFileSync(LOG, 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const hit = lines.reverse().find((l) => l.event === 'mail.dev_outbox' && l.to === email);
  return hit?.code;
}

async function signup(who, kakaoId, handle, name) {
  const api = anon();
  const login = await api.post('/auth/dev-login', { kakaoId }, { token: null });
  assert.equal(login.status, 'SIGNUP_REQUIRED');
  const st = login.signupToken;
  const avail = await api.get('/auth/handle-availability', { query: { handle }, token: st });
  assert.equal(avail.available, true);
  const email = `${handle}@example.com`;
  const sent = await api.post('/auth/email-verifications', { email }, { token: st });
  assert.equal(typeof sent.expiresInSeconds, 'number');
  await new Promise((r) => setTimeout(r, 100));
  const confirmed = await api.post('/auth/email-verifications/confirm', { email, code: lastCodeFor(email) }, { token: st });
  assert.equal(confirmed.verified, true);
  const done = await api.post('/auth/signup', { handle, name, age: 25, gender: 'female', email, agreements: { terms: true, privacy: true, notification: true } }, { token: st });
  tokens[who] = done.accessToken;
  const me = await clientFor(who).get('/users/me');
  for (const k of ['id', 'handle', 'name', 'email', 'age', 'gender', 'notificationAgreed']) assert.ok(k in me, `me.${k}`);
}

test('가입 흐름: 개발 로그인 → 아이디 확인 → 이메일 인증 → 가입 → 내 정보', { skip }, async () => {
  await signup('a', '2001', 'contract_a', '에이');
  await signup('b', '2002', 'contract_b', '비');
});

test('편지 쓰기 → 받는 사람 홈·수신함 목록에 봉인 상태로 (화면이 읽는 필드 확인)', { skip }, async () => {
  const A = clientFor('a');
  const B = clientFor('b');
  const look = await A.get('/users/lookup', { query: { handle: 'contract_b' } });
  assert.deepEqual(look, { exists: true, user: { handle: 'contract_b', name: '비' } });
  const { letter } = await A.post('/letters', { recipientType: 'friend', recipientHandle: 'contract_b', title: '계약 테스트', content: '내용', openDate: ymd(30) });
  for (const k of ['id', 'status', 'dDay', 'openDate', 'role', 'reply']) assert.ok(k in letter, `letter.${k}`);
  tokens.letterId = letter.id;

  const list = await B.get('/letters/received', { query: { box: 'sealed', limit: 5 } });
  assert.equal(list.counts.sealed, 1);
  const item = list.items[0];
  for (const k of ['id', 'dDay', 'openDate', 'recipientType', 'isReply', 'firstReadAt', 'reply']) assert.ok(k in item, `item.${k}`);
  assert.equal(typeof item.sender.name, 'string');
  assert.equal(typeof item.sender.handle, 'string');
  assert.equal(item.title, null, '공개 전 제목은 null');

  const filtered = await B.get('/letters/received', { query: { box: 'sealed', from: 'friend' } });
  assert.equal(filtered.items.length, 1);
  const detail = (await B.get(`/letters/${letter.id}`)).letter;
  assert.equal(detail.status, 'sealed');
  assert.equal(detail.role, 'recipient');
});

test('보관함 쿼리(정렬·검색)와 보낸 편지 목록이 화면 형식대로 온다', { skip }, async () => {
  const B = clientFor('b');
  const archived = await B.get('/letters/received', { query: { box: 'archived', sort: 'sender', q: '생일' } });
  assert.ok(Array.isArray(archived.items));
  assert.equal(typeof archived.counts.archived, 'number');
  const sent = await clientFor('a').get('/letters/sent');
  assert.equal(sent.items[0].recipient.handle, 'contract_b');
});

test('공개 전 수정 → 보낸 사람 화면에서 공개일 바꾸기', { skip }, async () => {
  const { letter } = await clientFor('a').patch(`/letters/${tokens.letterId}`, { openDate: ymd(3) });
  assert.equal(letter.openDate, ymd(3));
  assert.equal(letter.dDay, 3);
});

test('알림: 목록 → 읽음 → 모두 읽음 (배지 숫자가 서버 값으로 줄어든다)', { skip }, async () => {
  const B = clientFor('b');
  const before = await B.get('/notifications', { query: { limit: 30 } });
  assert.ok(before.unreadCount >= 1);
  const n = before.items[0];
  for (const k of ['id', 'type', 'letterId', 'read', 'createdAt']) assert.ok(k in n, `notification.${k}`);
  assert.equal(typeof n.sender.name, 'string');
  await B.patch(`/notifications/${n.id}/read`, {});
  const mid = await B.get('/notifications', { query: { limit: 1 } });
  assert.equal(mid.unreadCount, before.unreadCount - 1);
  await B.patch('/notifications/read-all', {});
  assert.equal((await B.get('/notifications', { query: { limit: 1 } })).unreadCount, 0);
});

test('오류 처리: 남의 편지 404, 입력 오류 400 문장, 저장된 토큰 거절 시 로그아웃 콜백', { skip }, async () => {
  await signup('c', '2003', 'contract_c', '씨');
  await assert.rejects(clientFor('c').get(`/letters/${tokens.letterId}`), (e) => e.status === 404 && e.code === 'NOT_FOUND');
  await assert.rejects(clientFor('a').post('/letters', { recipientType: 'self', title: '', content: 'x', openDate: ymd(1) }),
    (e) => e.status === 400 && e.code === 'INVALID_REQUEST' && e.message.includes('제목'));
  tokens.bad = 'not-a-jwt';
  const before = unauthorizedCalls;
  await assert.rejects(clientFor('bad').get('/users/me'), (e) => e.status === 401);
  assert.equal(unauthorizedCalls, before + 1);
  await assert.rejects(anon().get('/does-not-exist'), (e) => e.code === 'UNEXPECTED_RESPONSE');
});
