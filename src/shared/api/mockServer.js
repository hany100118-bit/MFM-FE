// 목업 서버: 백엔드 없이 화면 작업을 할 수 있게 fetch 를 흉내 낸다. (.env 에 EXPO_PUBLIC_MOCK_API=true)
// 응답 형식은 실제 서버와 같다 → 성공 { success: true, data } / 실패 { success: false, error }.
// 데이터는 메모리에만 있어서 앱을 새로고침하면 처음 상태로 돌아간다. 화면에 보일 예시 데이터는 아래 SEED 를 고치면 된다.
// React Native 모듈을 쓰지 않아 Node 에서도 테스트할 수 있다.
import { dDayOf, todayKstDate, toYmd, addPeriod } from '../utils/date.js';

const ME = { id: 'u-me', handle: 'jjam_me', name: '짬돌이', email: 'me@example.com', age: 24, gender: 'undisclosed', notificationAgreed: true };
const FRIENDS = {
  minji: { handle: 'minji', name: '민지' },
  junho: { handle: 'junho', name: '준호' },
  stranger: { handle: 'blue_whale', name: '파란고래' },
};

const ymdIn = (days, now) => toYmd(addPeriod(todayKstDate(now), { days }));
const isoAgo = (minutes, now) => new Date(now.getTime() - minutes * 60e3).toISOString();

function seed(now = new Date()) {
  const L = (o) => ({
    recipientType: 'friend', isReply: false, firstReadAt: null, archivedAt: null, repliedLetterId: null,
    createdAt: isoAgo(60 * 24 * 30, now), recipient: { handle: ME.handle, name: ME.name }, ...o,
  });
  const letters = [
    // 공개 예정 (봉인)
    L({ id: 'l1', recipientType: 'self', sender: ME, openDate: ymdIn(3, now), title: '사흘 뒤의 나에게', content: '시험 끝났지? 수고했어.' }),
    L({ id: 'l2', sender: FRIENDS.minji, openDate: ymdIn(12, now), title: '생일 축하해!', content: '미리 써두는 생일 편지 🎂' }),
    L({ id: 'l3', recipientType: 'anyone', sender: FRIENDS.stranger, openDate: ymdIn(45, now), title: '모르는 당신에게', content: '오늘 하루도 잘 버텼어요.' }),
    L({ id: 'l4', sender: FRIENDS.junho, openDate: ymdIn(100, now), title: '100일 뒤에 보자', content: '그때도 우리 같이 밥 먹자.' }),
    L({ id: 'l5', sender: FRIENDS.minji, isReply: true, openDate: ymdIn(200, now), title: '답장이야', content: '네 편지 잘 받았어!' }),
    L({ id: 'l6', recipientType: 'self', sender: ME, openDate: ymdIn(365, now), title: '1년 뒤의 나', content: '지금 하고 있는 고민, 그때는 어떻게 됐어?' }),
    // 열람 가능 (오늘 열림 → 답장 가능 / 지난 편지)
    L({ id: 'l7', sender: FRIENDS.junho, openDate: ymdIn(0, now), title: '오늘 열리는 편지', content: '드디어 열었구나! 오늘 안에 답장 줘.' }),
    L({ id: 'l8', recipientType: 'self', sender: ME, openDate: ymdIn(-20, now), firstReadAt: isoAgo(60 * 24 * 19, now), title: '한 달 전의 다짐', content: '운동 매일 하기. 했지?' }),
    // 보관함
    L({ id: 'l9', sender: FRIENDS.minji, openDate: ymdIn(-90, now), firstReadAt: isoAgo(60 * 24 * 89, now), archivedAt: isoAgo(60 * 24 * 80, now), title: '생일 축하 편지', content: '작년 생일에 쓴 편지야. 올해도 축하해!' }),
    L({ id: 'l10', recipientType: 'self', sender: ME, openDate: ymdIn(-200, now), firstReadAt: isoAgo(60 * 24 * 199, now), archivedAt: isoAgo(60 * 24 * 10, now), title: '새해 다짐', content: '올해는 책 20권 읽기.\n일찍 자기.\n부모님께 자주 연락하기.' }),
    L({ id: 'l11', recipientType: 'anyone', sender: FRIENDS.stranger, openDate: ymdIn(-30, now), firstReadAt: isoAgo(60 * 24 * 29, now), archivedAt: isoAgo(60 * 24 * 2, now), title: '익명의 응원', content: '당신이 이 편지를 읽을 때쯤엔 좋은 일이 있기를.' }),
  ];
  const sent = [
    { id: 's1', recipientType: 'friend', isReply: false, sender: ME, recipient: FRIENDS.minji, openDate: ymdIn(30, now), title: '민지에게', content: '고마워!', createdAt: isoAgo(60, now), firstReadAt: null, archivedAt: null, repliedLetterId: null },
  ];
  const notifications = [
    { id: 'n1', type: 'letter_opened', letterId: 'l7', read: false, createdAt: isoAgo(30, now), sender: FRIENDS.junho },
    { id: 'n2', type: 'reply_deadline', letterId: 'l7', read: false, createdAt: isoAgo(25, now), sender: FRIENDS.junho },
    { id: 'n3', type: 'letter_arrived', letterId: 'l2', read: false, createdAt: isoAgo(60 * 5, now), sender: FRIENDS.minji },
    { id: 'n4', type: 'reply_received', letterId: 'l5', read: true, createdAt: isoAgo(60 * 24 * 2, now), sender: FRIENDS.minji },
  ];
  return { letters, sent, notifications, users: [ME, ...Object.values(FRIENDS)], signedUp: true, seq: 100 };
}

/** 서버가 내려주는 형태로 바꾼다 (봉인 중이면 제목·내용·미리보기는 null) */
function view(l, role, now) {
  const dDay = dDayOf(l.openDate, now);
  const status = dDay > 0 ? 'sealed' : 'opened';
  const openedToday = dDay === 0;
  const until = new Date(`${l.openDate}T23:59:59+09:00`).toISOString();
  const sealed = status === 'sealed';
  return {
    id: l.id, status, role, dDay, openDate: l.openDate, recipientType: l.recipientType, isReply: l.isReply,
    sender: { handle: l.sender.handle, name: l.sender.name }, recipient: { handle: l.recipient.handle, name: l.recipient.name },
    title: sealed ? null : l.title, content: sealed ? null : l.content, preview: sealed ? null : l.content.slice(0, 60),
    firstReadAt: l.firstReadAt, archivedAt: l.archivedAt, createdAt: l.createdAt,
    reply: { available: role === 'recipient' && openedToday && !l.repliedLetterId && l.recipientType !== 'self', until, repliedLetterId: l.repliedLetterId },
  };
}

const FROM = {
  self: (l) => l.recipientType === 'self',
  friend: (l) => l.recipientType === 'friend' && !l.isReply,
  anyone: (l) => l.recipientType === 'anyone',
  reply: (l) => l.isReply,
};
const BOX = {
  sealed: (v) => v.status === 'sealed',
  opened: (v) => v.status === 'opened' && !v.archivedAt,
  archived: (v) => !!v.archivedAt,
};
const SORT = {
  saved: (a, b) => b.archivedAt.localeCompare(a.archivedAt),
  newest: (a, b) => b.openDate.localeCompare(a.openDate),
  oldest: (a, b) => a.openDate.localeCompare(b.openDate),
  sender: (a, b) => a.sender.name.localeCompare(b.sender.name, 'ko'),
};

class Fail extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

export function createMockServer({ now = () => new Date(), delayMs = 250 } = {}) {
  let db = seed(now());
  const findLetter = (id) => db.letters.find((l) => l.id === id) || db.sent.find((l) => l.id === id);

  function validateLetter(body) {
    if (!body.title?.trim()) throw new Fail(400, 'INVALID_REQUEST', '제목을 입력해 주세요.');
    if (!body.content?.trim()) throw new Fail(400, 'INVALID_REQUEST', '내용을 입력해 주세요.');
    if (!body.openDate || dDayOf(body.openDate, now()) < 1) throw new Fail(400, 'INVALID_REQUEST', '공개일은 내일 이후로 골라 주세요.');
  }

  function newLetter(body, recipient, extra = {}) {
    db.seq += 1;
    const l = {
      id: `m${db.seq}`, recipientType: body.recipientType || 'friend', isReply: false, sender: ME, recipient,
      openDate: body.openDate, title: body.title.trim(), content: body.content, createdAt: now().toISOString(),
      firstReadAt: null, archivedAt: null, repliedLetterId: null, ...extra,
    };
    // 나에게 쓴 편지는 받은 편지함에도 들어간다
    if (l.recipientType === 'self') db.letters.push(l);
    else db.sent.push(l);
    return l;
  }

  const routes = [
    ['POST', /^\/auth\/dev-login$/, ({ body }) => (body.kakaoId === 'new'
      ? { status: 'SIGNUP_REQUIRED', signupToken: 'mock-signup', kakaoEmail: 'new@example.com' }
      : { status: 'LOGGED_IN', accessToken: 'mock-token' })],
    ['POST', /^\/auth\/kakao$/, () => ({ status: 'SIGNUP_REQUIRED', signupToken: 'mock-signup', kakaoEmail: 'new@example.com' })],
    ['GET', /^\/auth\/handle-availability$/, ({ query }) => ({ available: !db.users.some((u) => u.handle === query.handle) })],
    ['POST', /^\/auth\/email-verifications$/, () => ({ expiresInSeconds: 300 })],
    // 목업에서는 인증 코드 123456 만 통과
    ['POST', /^\/auth\/email-verifications\/confirm$/, ({ body }) => {
      if (body.code !== '123456') throw new Fail(400, 'INVALID_CODE', '인증 코드가 맞지 않아요. (목업 코드: 123456)');
      return { verified: true };
    }],
    ['POST', /^\/auth\/signup$/, ({ body }) => {
      Object.assign(ME, { handle: body.handle, name: body.name, age: body.age, gender: body.gender, email: body.email, notificationAgreed: !!body.agreements?.notification });
      return { accessToken: 'mock-token' };
    }],
    ['GET', /^\/users\/me$/, () => ({ ...ME })],
    ['GET', /^\/users\/lookup$/, ({ query }) => {
      const u = db.users.find((x) => x.handle === query.handle && x.handle !== ME.handle);
      return u ? { exists: true, user: { handle: u.handle, name: u.name } } : { exists: false, user: null };
    }],

    ['GET', /^\/letters\/received$/, ({ query }) => {
      const t = now();
      const all = db.letters.map((l) => ({ l, v: view(l, 'recipient', t) }));
      const counts = Object.fromEntries(Object.keys(BOX).map((b) => [b, all.filter(({ v }) => BOX[b](v)).length]));
      let rows = all.filter(({ v }) => BOX[query.box || 'sealed'](v));
      if (query.from && FROM[query.from]) rows = rows.filter(({ l }) => FROM[query.from](l));
      if (query.q) {
        const q = query.q.toLowerCase();
        rows = rows.filter(({ l }) => [l.sender.name, l.sender.handle, l.title, l.content].some((s) => s.toLowerCase().includes(q)));
      }
      let items = rows.map(({ v }) => v);
      items.sort(query.box === 'archived' ? SORT[query.sort] || SORT.saved : (a, b) => a.dDay - b.dDay);
      if (query.box === 'opened') items.sort((a, b) => b.openDate.localeCompare(a.openDate));
      const limit = Number(query.limit) || 20;
      const offset = Number(query.offset) || 0;
      const page = items.slice(offset, offset + limit);
      return { items: page, counts, hasMore: offset + limit < items.length };
    }],
    ['GET', /^\/letters\/sent$/, ({ query }) => {
      const items = db.sent.map((l) => view(l, 'sender', now()));
      const limit = Number(query.limit) || 20;
      const offset = Number(query.offset) || 0;
      return { items: items.slice(offset, offset + limit), hasMore: offset + limit < items.length };
    }],
    ['POST', /^\/letters$/, ({ body }) => {
      validateLetter(body);
      let recipient = ME;
      if (body.recipientType === 'friend') {
        recipient = db.users.find((u) => u.handle === body.recipientHandle);
        if (!recipient) throw new Fail(404, 'NOT_FOUND', '그 아이디를 찾을 수 없어요.');
      } else if (body.recipientType === 'anyone') {
        recipient = FRIENDS.stranger;
      }
      const l = newLetter(body, recipient);
      return { letter: view(l, l.recipientType === 'self' ? 'recipient' : 'sender', now()) };
    }],
    ['GET', /^\/letters\/([^/]+)$/, ({ params }) => {
      const l = findLetter(params[0]);
      if (!l) throw new Fail(404, 'NOT_FOUND', '편지를 찾을 수 없어요.');
      const role = db.letters.includes(l) ? 'recipient' : 'sender';
      const v = view(l, role, now());
      // 받은 사람이 열람 가능한 편지를 처음 열면 읽음 시각을 남긴다
      if (role === 'recipient' && v.status === 'opened' && !l.firstReadAt) l.firstReadAt = now().toISOString();
      return { letter: v };
    }],
    ['PATCH', /^\/letters\/([^/]+)$/, ({ params, body }) => {
      const l = findLetter(params[0]);
      if (!l) throw new Fail(404, 'NOT_FOUND', '편지를 찾을 수 없어요.');
      if (body.openDate) {
        if (dDayOf(body.openDate, now()) < 1) throw new Fail(400, 'INVALID_REQUEST', '공개일은 내일 이후로 골라 주세요.');
        l.openDate = body.openDate;
      }
      return { letter: view(l, 'sender', now()) };
    }],
    ['DELETE', /^\/letters\/([^/]+)$/, ({ params }) => {
      db.sent = db.sent.filter((l) => l.id !== params[0]);
      db.letters = db.letters.filter((l) => l.id !== params[0]);
      return {};
    }],
    ['POST', /^\/letters\/([^/]+)\/reply$/, ({ params, body }) => {
      const orig = findLetter(params[0]);
      if (!orig) throw new Fail(404, 'NOT_FOUND', '편지를 찾을 수 없어요.');
      if (orig.repliedLetterId) throw new Fail(409, 'ALREADY_REPLIED', '이미 답장한 편지예요.');
      validateLetter(body);
      const l = newLetter({ ...body, recipientType: orig.recipientType }, orig.sender, { isReply: true });
      orig.repliedLetterId = l.id;
      return { letter: view(l, 'sender', now()) };
    }],
    ['PATCH', /^\/letters\/([^/]+)\/archive$/, ({ params, body }) => {
      const l = findLetter(params[0]);
      if (!l) throw new Fail(404, 'NOT_FOUND', '편지를 찾을 수 없어요.');
      l.archivedAt = body.archived ? now().toISOString() : null;
      return { archivedAt: l.archivedAt };
    }],
    ['DELETE', /^\/letters\/([^/]+)\/received$/, ({ params }) => {
      db.letters = db.letters.filter((l) => l.id !== params[0]);
      return {};
    }],

    ['GET', /^\/notifications$/, ({ query }) => {
      const sorted = [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const limit = Number(query.limit) || 30;
      const offset = Number(query.offset) || 0;
      return { items: sorted.slice(offset, offset + limit), unreadCount: db.notifications.filter((n) => !n.read).length, hasMore: offset + limit < sorted.length };
    }],
    ['PATCH', /^\/notifications\/read-all$/, () => { db.notifications.forEach((n) => { n.read = true; }); return {}; }],
    ['PATCH', /^\/notifications\/([^/]+)\/read$/, ({ params }) => {
      const n = db.notifications.find((x) => x.id === params[0]);
      if (n) n.read = true;
      return {};
    }],
  ];

  async function fetchImpl(url, init = {}) {
    const method = (init.method || 'GET').toUpperCase();
    const u = new URL(url);
    // baseUrl 의 /api 같은 앞부분은 떼고 경로만 본다
    const path = u.pathname.replace(/^.*?\/api(?=\/)/, '');
    const query = Object.fromEntries(u.searchParams.entries());
    const body = init.body ? JSON.parse(init.body) : {};
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));

    const reply = (status, payload) => ({ status, ok: status < 400, json: async () => payload });
    for (const [m, re, handler] of routes) {
      const match = method === m && path.match(re);
      if (!match) continue;
      try {
        return reply(200, { success: true, data: handler({ params: match.slice(1), query, body }) });
      } catch (e) {
        if (!(e instanceof Fail)) throw e;
        return reply(e.status, { success: false, error: { code: e.code, message: e.message, requestId: 'mock' } });
      }
    }
    return reply(404, { success: false, error: { code: 'NOT_FOUND', message: `목업에 없는 API 예요: ${method} ${path}`, requestId: 'mock' } });
  }

  return { fetch: fetchImpl, reset: () => { db = seed(now()); } };
}
