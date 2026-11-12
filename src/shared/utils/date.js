// 날짜 도우미. 서버는 공개일을 'YYYY-MM-DD'(한국 날짜)로 받는다.
const KST_MS = 9 * 60 * 60 * 1000;
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/** 지금 한국 날짜를 Date(UTC 자정 기준)로 */
export function todayKstDate(now = new Date()) {
  const k = new Date(now.getTime() + KST_MS);
  return new Date(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()));
}

export const toYmd = (d) => d.toISOString().slice(0, 10);

/** 빠른 기간 선택: 1개월 / 100일 / 6개월 / 1년 */
export const PERIODS = [
  { id: '1m', label: '1개월', months: 1, days: 0 },
  { id: '100d', label: '100일', months: 0, days: 100 },
  { id: '6m', label: '6개월', months: 6, days: 0 },
  { id: '1y', label: '1년', months: 12, days: 0 },
];

export function addPeriod(base, { months = 0, days = 0 }) {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + months, base.getUTCDate() + days));
}

export const minOpenDate = (now) => addPeriod(todayKstDate(now), { days: 1 });
export const maxOpenDate = (now) => addPeriod(todayKstDate(now), { months: 120 });

export function dDayOf(ymd, now = new Date()) {
  const target = new Date(`${ymd}T00:00:00Z`);
  return Math.round((target - todayKstDate(now)) / 86400000);
}

/** '2027-10-21' → '2027. 10. 21 (목)' */
export function formatYmd(ymd) {
  const d = new Date(`${ymd}T00:00:00Z`);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}. ${p(d.getUTCMonth() + 1)}. ${p(d.getUTCDate())} (${WEEK[d.getUTCDay()]})`;
}

/** '2027-10-21' → '10.21' */
export const shortYmd = (ymd) => `${Number(ymd.slice(5, 7))}.${ymd.slice(8, 10)}`;

export const dDayLabel = (n) => (n > 0 ? `D-${n}` : n === 0 ? 'D-DAY' : `D+${-n}`);

/** ISO 시각 → '방금 전' / 'N분 전' / 'N시간 전' / 'N일 전' / 'M.D' */
export function timeAgo(iso, now = new Date()) {
  const diff = (now - new Date(iso)) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  const k = new Date(new Date(iso).getTime() + KST_MS);
  return `${k.getUTCMonth() + 1}.${k.getUTCDate()}`;
}
