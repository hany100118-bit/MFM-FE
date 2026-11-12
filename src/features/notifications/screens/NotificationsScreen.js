// 알림: 도착 · 봉인 해제 · 답장 마감 · 답장 도착. 누르면 읽음 처리 후 편지로 이동.
import { useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, SectionList, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppText, Screen, StateView } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { useApiQuery } from '../../../shared/hooks/useApiQuery';
import { todayKstDate } from '../../../shared/utils/date';
import { notificationsApi } from '../api';
import { useUnread } from '../UnreadContext';
import { NotificationRow } from '../components/NotificationRow';

/** 한국 날짜 기준으로 오늘 / 이번 주(7일 안) / 이전 으로 묶는다 */
function groupByDay(items) {
  const today = todayKstDate().getTime();
  const groups = [{ title: '오늘', data: [] }, { title: '이번 주', data: [] }, { title: '이전', data: [] }];
  items.forEach((n) => {
    const days = Math.round((today - todayKstDate(new Date(n.createdAt)).getTime()) / 86400000);
    groups[days <= 0 ? 0 : days < 7 ? 1 : 2].data.push(n);
  });
  return groups.filter((g) => g.data.length);
}

export default function NotificationsScreen() {
  const { setUnreadCount } = useUnread();
  const { data, loading, error, refreshing, refresh, reload, setData } = useApiQuery(() => notificationsApi.list(), []);

  useFocusEffect(useCallback(() => { if (data) setUnreadCount(data.unreadCount); }, [data, setUnreadCount]));

  const sections = useMemo(() => groupByDay(data?.items || []), [data]);

  const open = async (n) => {
    if (!n.read) {
      setData((d) => ({ ...d, unreadCount: Math.max(0, d.unreadCount - 1), items: d.items.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }));
      setUnreadCount((c) => Math.max(0, c - 1));
      notificationsApi.markRead(n.id).catch(() => {});
    }
    router.push(`/letter/${n.letterId}`);
  };

  const readAll = async () => {
    await notificationsApi.markAllRead();
    setData((d) => ({ ...d, unreadCount: 0, items: d.items.map((x) => ({ ...x, read: true })) }));
    setUnreadCount(0);
  };

  const canReadAll = !!data?.unreadCount;
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <AppText variant="display" style={{ fontSize: 30, lineHeight: 38 }}>알림</AppText>
          {data?.unreadCount ? <AppText variant="bold" style={{ fontSize: 14, color: colors.violet }}>안 읽음 {data.unreadCount}</AppText> : null}
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canReadAll }} disabled={!canReadAll} onPress={readAll}
          style={({ pressed }) => ({ height: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', opacity: !canReadAll ? 0.45 : pressed ? 0.7 : 1 })}>
          <AppText variant="bold" style={{ fontSize: 13 }}>모두 읽음</AppText>
        </Pressable>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(n) => n.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.violet} />}
        ListEmptyComponent={<View style={{ paddingTop: 14 }}><StateView loading={loading} error={error} onRetry={reload} empty={!loading && !error} emptyText="아직 알림이 없어요" /></View>}
        renderSectionHeader={({ section }) => (
          <AppText variant="bold" accessibilityRole="header" style={{ fontSize: 13, color: colors.muted, marginTop: 18, marginBottom: 14 }}>{section.title}</AppText>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item: n }) => <NotificationRow n={n} onPress={() => open(n)} />}
      />
    </Screen>
  );
}
