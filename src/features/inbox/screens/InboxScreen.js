// 수신함: 공개 예정 / 열람 가능
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Screen, Segmented, StateView } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { useApiQuery } from '../../../shared/hooks/useApiQuery';
import { lettersApi } from '../../letters/api';
import { OpenedRow, SealedRow } from '../components/LetterRow';
import { OutlineLock, PencilIcon } from '../components/InboxIcons';

export default function InboxScreen() {
  const [box, setBox] = useState('sealed');
  const { data, loading, error, refreshing, refresh, reload, setData } = useApiQuery(() => lettersApi.listReceived({ box, limit: 20 }), [box]);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!data?.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const more = await lettersApi.listReceived({ box, limit: 20, offset: data.items.length });
      setData((d) => ({ ...more, items: [...d.items, ...more.items] }));
    } finally {
      setLoadingMore(false);
    }
  };

  const counts = data?.counts || { sealed: 0, opened: 0 };
  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
          <View>
            <AppText variant="display" style={{ fontSize: 30, lineHeight: 38 }}>수신함</AppText>
            <AppText style={{ fontSize: 13, color: colors.muted }}>공개일이 되면 블러가 스르륵 풀려요</AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="편지 쓰기" onPress={() => router.push('/write')}
            style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <PencilIcon size={22} />
          </Pressable>
        </View>
        <Segmented items={[{ id: 'sealed', label: `공개 예정 ${counts.sealed}` }, { id: 'opened', label: `열람 가능 ${counts.opened}` }]} value={box} onChange={setBox} />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, backgroundColor: colors.ink, borderRadius: 16 }}>
          <OutlineLock open={box !== 'sealed'} size={28} />
          <View style={{ flex: 1 }}>
            <AppText variant="bold" style={{ color: colors.white, fontSize: 14 }}>{box === 'sealed' ? '봉인된 편지는 아무도 못 열어요' : '봉인이 풀린 편지예요'}</AppText>
            <AppText style={{ color: '#CFC6F5', fontSize: 12, marginTop: 2 }}>{box === 'sealed' ? '제목과 내용은 공개일 0시(한국 시간)에 열려요' : '답장은 공개 당일에만 · 다 읽으면 보관하거나 지울 수 있어요'}</AppText>
          </View>
        </View>
      </View>
      <FlatList
        data={data?.items || []}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, gap: 10, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.violet} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<StateView loading={loading} error={error} onRetry={reload} empty={!loading && !error}
          emptyText={box === 'sealed' ? '기다리는 편지가 없어요' : '열어볼 편지가 없어요'} />}
        renderItem={({ item, index }) => (box === 'sealed'
          ? <SealedRow letter={item} index={index} onPress={() => router.push(`/letter/${item.id}`)} />
          : <OpenedRow letter={item} onPress={() => router.push(`/letter/${item.id}`)} />)}
      />
    </Screen>
  );
}
