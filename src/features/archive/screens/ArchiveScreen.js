// 보관함: 카테고리 · 검색 · 정렬, 2열 카드
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, CategoryTabs, Icon, Screen, StateView } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { useApiQuery } from '../../../shared/hooks/useApiQuery';
import { useDebounced } from '../../../shared/hooks/useDebounced';
import { lettersApi } from '../../letters/api';
import { CATEGORIES } from '../../letters/constants';
import { ArchiveCard } from '../components/ArchiveCard';
import { SORTS, SortSheet } from '../components/SortSheet';
import { SearchField } from '../components/SearchField';

// 분류별 검색창 안내 문구 (디자인 07 ~ 07-4)
const PLACEHOLDERS = {
  all: '보낸 사람, 제목, 내용으로 찾기',
  self: '나에게 쓴 편지에서 찾기',
  friend: '친구 편지에서 찾기',
  anyone: '모르는 사람의 편지에서 찾기',
  reply: '받은 답장에서 찾기',
};

export default function ArchiveScreen() {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('saved');
  const [sortOpen, setSortOpen] = useState(false);
  const [query, setQuery] = useState('');
  const q = useDebounced(query.trim());
  const from = CATEGORIES.find((c) => c.id === category).from;
  const { data, loading, error, refreshing, refresh, reload, setData } = useApiQuery(
    () => lettersApi.listReceived({ box: 'archived', from, sort, q: q || undefined, limit: 20 }), [from, sort, q],
  );

  const loadMore = async () => {
    if (!data?.hasMore) return;
    const more = await lettersApi.listReceived({ box: 'archived', from, sort, q: q || undefined, limit: 20, offset: data.items.length });
    setData((d) => ({ ...more, items: [...d.items, ...more.items] }));
  };

  const items = data?.items || [];
  // 분류를 고르면 그 분류의 개수 (끝까지 받아온 경우만 정확), 전체는 서버 counts
  const total = !data ? '' : category === 'all' ? data.counts.archived : data.hasMore ? `${items.length}+` : items.length;
  // 홀수 개일 때 마지막 카드가 두 칸을 차지하지 않도록 빈 칸을 채운다
  const cells = items.length % 2 ? [...items, { id: '__pad', pad: true }] : items;

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 14 }}>
        <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <AppText variant="display" style={{ fontSize: 30, lineHeight: 38 }}>보관함</AppText>
            {data ? <AppText variant="bold" style={{ fontSize: 14, color: colors.violet }}>{`${total}통`}</AppText> : null}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`정렬 기준 바꾸기, 현재 ${SORTS.find((s) => s.id === sort).label}`} onPress={() => setSortOpen(true)}
            style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: pressed ? 2 : 0 }] })}>
            <Icon name="sort" size={22} />
          </Pressable>
        </View>
        <SearchField value={query} onChangeText={setQuery} placeholder={PLACEHOLDERS[category]} />
        <CategoryTabs items={CATEGORIES} value={category} onChange={setCategory} />
      </View>
      <FlatList
        data={cells}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, gap: 12, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.violet} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<StateView loading={loading} error={error} onRetry={reload} empty={!loading && !error} emptyText={q ? '검색 결과가 없어요' : '보관한 편지가 없어요'} />}
        renderItem={({ item, index }) => (item.pad ? <View style={{ flex: 1 }} /> : (
          <ArchiveCard letter={item} index={index} highlight={index === 0} onPress={() => router.push(`/letter/${item.id}`)} />
        ))}
      />
      <SortSheet visible={sortOpen} value={sort} onChange={setSort} onClose={() => setSortOpen(false)} />
    </Screen>
  );
}
