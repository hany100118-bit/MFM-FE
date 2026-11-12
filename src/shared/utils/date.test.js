import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERIODS, addPeriod, dDayLabel, dDayOf, formatYmd, minOpenDate, maxOpenDate, timeAgo, todayKstDate, toYmd } from './date.js';

// 2026-11-09 23:30 KST = 2026-11-09 14:30 UTC
const NOW = new Date('2026-11-09T14:30:00Z');

test('한국 날짜 기준: UTC 로는 전날이어도 KST 날짜를 쓴다', () => {
  assert.equal(toYmd(todayKstDate(new Date('2026-11-09T16:00:00Z'))), '2026-11-10'); // KST 11/10 01:00
  assert.equal(toYmd(todayKstDate(NOW)), '2026-11-09');
});

test('빠른 기간: 1개월·100일·6개월·1년', () => {
  const base = todayKstDate(NOW);
  const got = Object.fromEntries(PERIODS.map((p) => [p.id, toYmd(addPeriod(base, p))]));
  assert.deepEqual(got, { '1m': '2026-12-09', '100d': '2027-02-17', '6m': '2027-05-09', '1y': '2027-11-09' });
});

test('공개일 범위: 내일 ~ 10년 뒤', () => {
  assert.equal(toYmd(minOpenDate(NOW)), '2026-11-10');
  assert.equal(toYmd(maxOpenDate(NOW)), '2036-11-09');
});

test('D-day 와 표시', () => {
  assert.equal(dDayOf('2026-11-10', NOW), 1);
  assert.equal(dDayLabel(1), 'D-1');
  assert.equal(dDayLabel(0), 'D-DAY');
  assert.equal(dDayLabel(-3), 'D+3');
});

test('날짜 표시와 상대 시각', () => {
  assert.equal(formatYmd('2027-10-21'), '2027. 10. 21 (목)');
  assert.equal(timeAgo('2026-11-09T14:29:30Z', NOW), '방금 전');
  assert.equal(timeAgo('2026-11-09T12:30:00Z', NOW), '2시간 전');
});
