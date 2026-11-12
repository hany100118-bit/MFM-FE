// 목업 서버가 화면이 읽는 형식대로 응답하는지 확인 (계약 테스트와 같은 필드)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient } from './client.js';
import { createMockServer } from './mockServer.js';

const make = () => createApiClient({ baseUrl: 'http://mock/api', getToken: async () => 'mock-token', fetchImpl: createMockServer({ delayMs: 0 }).fetch });

test('로그인 → 내 정보', async () => {
  const api = make();
  assert.equal((await api.post('/auth/dev-login', { kakaoId: '1001' }, { token: null })).status, 'LOGGED_IN');
  assert.equal((await api.post('/auth/dev-login', { kakaoId: 'new' }, { token: null })).status, 'SIGNUP_REQUIRED');
  const me = await api.get('/users/me');
  for (const k of ['id', 'handle', 'name', 'email', 'age', 'gender', 'notificationAgreed']) assert.ok(k in me, `me.${k}`);
});

test('받은 편지 목록: 봉인 편지는 제목이 null, 상자별 개수', async () => {
  const api = make();
  const sealed = await api.get('/letters/received', { query: { box: 'sealed', limit: 5 } });
  assert.ok(sealed.counts.sealed > 0 && sealed.items.length <= 5);
  const item = sealed.items[0];
  for (const k of ['id', 'dDay', 'openDate', 'recipientType', 'isReply', 'firstReadAt', 'reply']) assert.ok(k in item, `item.${k}`);
  assert.equal(item.title, null);
  assert.ok(sealed.items.every((l, i, a) => i === 0 || a[i - 1].dDay <= l.dDay), '가까운 순');
  const opened = await api.get('/letters/received', { query: { box: 'opened' } });
  assert.ok(opened.items.some((l) => l.reply.available), '오늘 열린 편지는 답장 가능');
  const archived = await api.get('/letters/received', { query: { box: 'archived', q: '생일' } });
  assert.equal(archived.items.length, 1);
});

test('편지 쓰기·답장·보관·알림', async () => {
  const api = make();
  const look = await api.get('/users/lookup', { query: { handle: 'minji' } });
  assert.deepEqual(look, { exists: true, user: { handle: 'minji', name: '민지' } });
  const tomorrow = new Date(Date.now() + 9 * 3600e3 + 86400e3).toISOString().slice(0, 10);
  const { letter } = await api.post('/letters', { recipientType: 'friend', recipientHandle: 'minji', title: '안녕', content: '내용', openDate: tomorrow });
  assert.equal(letter.role, 'sender');
  await assert.rejects(api.post('/letters', { recipientType: 'self', title: '', content: 'x', openDate: tomorrow }), (e) => e.status === 400 && e.message.includes('제목'));
  const opened = await api.get('/letters/received', { query: { box: 'opened' } });
  const today = opened.items.find((l) => l.reply.available);
  await api.post(`/letters/${today.id}/reply`, { title: '답장', content: '고마워', openDate: tomorrow });
  assert.equal((await api.get(`/letters/${today.id}`)).letter.reply.available, false);
  const r = await api.patch(`/letters/${today.id}/archive`, { archived: true });
  assert.ok(r.archivedAt);
  const n = await api.get('/notifications');
  assert.ok(n.unreadCount > 0);
  await api.patch('/notifications/read-all', {});
  assert.equal((await api.get('/notifications', { query: { limit: 1 } })).unreadCount, 0);
  await assert.rejects(api.get('/letters/nope'), (e) => e.status === 404);
});
