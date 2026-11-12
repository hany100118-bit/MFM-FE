// 홈: 다음에 열릴 편지(D-day), 카테고리별 봉인된 편지, 알림·프로필 버튼
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppText, Avatar, BellIcon, CategoryTabs, Envelope, LogoMark, Screen, ShadowBox, StateView } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { useApiQuery } from '../../../shared/hooks/useApiQuery';
import { dDayLabel, todayKstDate } from '../../../shared/utils/date';
import { useAuth } from '../../auth/AuthContext';
import { lettersApi } from '../../letters/api';
import { CATEGORIES, TILE_COLORS } from '../../letters/constants';
import { useUnread } from '../../notifications/UnreadContext';
import { AddTile, LetterTile } from '../components/LetterTile';

const WRITE_TARGET = { self: 'self', friend: 'friend', anyone: 'anyone' };
// 카테고리별 문구 (디자인 03, 03-1 ~ 03-4)
const HEAD = {
  all: ['도착 예정인 편지가', '있어요'], self: ['나에게서 온 편지가', '기다려요'], friend: ['친구가 보낸 편지가', '기다려요'],
  anyone: ['모르는 사람의 편지가', '기다려요'], reply: ['도착 예정인 답장이', '있어요'],
};
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

/** 올해면 '10.31 (토)', 아니면 '2027.05.07' */
function openLabel(ymd) {
  const d = new Date(`${ymd}T00:00:00Z`);
  const [y, m, dd] = ymd.split('-');
  return Number(y) === todayKstDate().getUTCFullYear() ? `${m}.${dd} (${WEEK[d.getUTCDay()]})` : `${y}.${m}.${dd}`;
}

/** '1년 전의 나' / '3개월 전의 나' / '12일 전의 나' */
function pastMe(createdAt) {
  const days = createdAt ? Math.floor((Date.now() - new Date(createdAt)) / 86400000) : NaN;
  if (!(days >= 0)) return '과거의 나';
  if (days >= 365) return `${Math.floor(days / 365)}년 전의 나`;
  if (days >= 30) return `${Math.floor(days / 30)}개월 전의 나`;
  return days ? `${days}일 전의 나` : '오늘의 나';
}

function fromLabel(l) {
  if (l.recipientType === 'self') return `${pastMe(l.createdAt)}에게서`;
  if (l.isReply) return `${l.sender.name}의 답장`;
  if (l.recipientType === 'anyone') return `모르는 사람 @${l.sender.handle} 에게서`;
  return `${l.sender.name}에게서`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { unreadCount, refreshUnread } = useUnread();
  const [category, setCategory] = useState('all');
  const from = CATEGORIES.find((c) => c.id === category).from;
  const { data, loading, error, refreshing, refresh, reload } = useApiQuery(() => lettersApi.listReceived({ box: 'sealed', from, limit: 5 }), [from]);

  useFocusEffect(useCallback(() => { refreshUnread(); }, [refreshUnread]));

  const items = data?.items || [];
  const next = items[0];
  // counts.sealed 는 분류와 상관없는 전체 수 → 분류 탭에선 받은 목록이 전부일 때 그 개수를 쓴다
  const count = category !== 'all' && data && !data.hasMore ? items.length : data?.counts.sealed ?? 0;
  const catLabel = CATEGORIES.find((c) => c.id === category).label;
  const prefix = category === 'all' ? '' : `${catLabel} · `;
  const rows = [];
  const cells = [...items.map((l) => ({ type: 'letter', l })), { type: 'add' }];
  for (let i = 0; i < cells.length; i += 3) rows.push(cells.slice(i, i + 3));

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, gap: 16, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.violet} />}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LogoMark size={34} clock={false} />
            <AppText variant="display" style={{ fontSize: 24, color: colors.violet }}>짬처리</AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={unreadCount ? `알림 ${unreadCount}개` : '알림'} onPress={() => router.navigate('/notifications')}
              style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
              <BellIcon size={22} />
              {unreadCount ? (
                <View style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.butter, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: unreadCount > 9 ? 3 : 0 }}>
                  <AppText variant="bold" style={{ fontSize: 10, lineHeight: 13 }}>{unreadCount > 99 ? '99+' : unreadCount}</AppText>
                </View>
              ) : null}
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="내 프로필" onPress={() => router.push('/profile')} style={{ marginRight: -2, marginBottom: -2 }}>
              <Avatar name={user?.name || '나'} size={44} shadow={2} />
            </Pressable>
          </View>
        </View>

        <View>
          <AppText style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>오늘의 짬, 미래로 토스할까요?</AppText>
          <AppText variant="bold" style={{ marginTop: 2, fontSize: 22, lineHeight: 30 }}>
            {HEAD[category][0]} <AppText variant="bold" style={{ fontSize: 22, color: colors.violet }}>{count}통</AppText> {HEAD[category][1]}
          </AppText>
        </View>

        {next ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`다음 공개 ${dDayLabel(next.dDay)}, ${fromLabel(next)}`} onPress={() => router.push(`/letter/${next.id}`)}
            style={{ marginRight: -5, marginBottom: -5 }}>
            <ShadowBox radius={22} offset={5} contentStyle={{ backgroundColor: colors.violet, paddingVertical: 18, paddingHorizontal: 20, height: 158, justifyContent: 'space-between' }}>
              <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.butter }}>
                <AppText variant="bold" style={{ fontSize: 12, lineHeight: 16 }}>{prefix}다음 공개</AppText>
              </View>
              <View>
                <AppText variant="display" style={{ color: colors.white, fontSize: 52, lineHeight: 54 }}>{dDayLabel(next.dDay)}</AppText>
                <AppText style={{ marginTop: 4, color: colors.line, fontSize: 13, lineHeight: 18 }}>{openLabel(next.openDate)} 공개 · {fromLabel(next)}</AppText>
              </View>
              <View pointerEvents="none" style={{ position: 'absolute', right: 11, top: 9 }}><Envelope width={132} sealed /></View>
            </ShadowBox>
          </Pressable>
        ) : null}

        <CategoryTabs items={CATEGORIES} value={category} onChange={setCategory} counts={loading ? undefined : { [category]: count }} />

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <AppText variant="bold" style={{ fontSize: 16, lineHeight: 22 }}>{prefix}봉인된 편지</AppText>
            <Pressable accessibilityRole="link" onPress={() => router.navigate('/inbox')} hitSlop={8}>
              <AppText variant="bold" style={{ color: colors.violet, fontSize: 13 }}>전체보기 ›</AppText>
            </Pressable>
          </View>
          {loading || error ? <StateView loading={loading} error={error} onRetry={reload} /> : rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', gap: 10 }}>
              {row.map((c, ci) => (
                // 칸마다 패딩 없는 래퍼로 감싸야 3열 너비가 똑같이 나뉜다 (웹은 패딩을 flex-basis 밖에서 더함)
                <View key={c.type === 'add' ? 'add' : c.l.id} style={{ flex: 1 }}>
                  {c.type === 'add'
                    ? <AddTile onPress={() => router.push({ pathname: '/write', params: { target: WRITE_TARGET[category] || 'self' } })} />
                    : <LetterTile letter={c.l} fill={TILE_COLORS[(ri * 3 + ci) % 3]} onPress={() => router.push(`/letter/${c.l.id}`)} />}
                </View>
              ))}
              {Array.from({ length: 3 - row.length }).map((_, k) => <View key={`pad${k}`} style={{ flex: 1 }} />)}
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
