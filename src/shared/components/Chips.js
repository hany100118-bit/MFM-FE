import { Pressable, ScrollView, View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

export function Chip({ label, count, selected, onPress }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
      style={[styles.chip, selected ? { backgroundColor: colors.ink } : { backgroundColor: colors.white }]}>
      <AppText variant={selected ? 'bold' : 'body'} numberOfLines={1} style={{ fontSize: 13, color: selected ? colors.white : colors.ink }}>
        {label}{count !== undefined && count !== null
          ? <AppText variant={selected ? 'bold' : 'body'} style={{ fontSize: 13, color: selected ? colors.butter : colors.muted }}>{` ${count}`}</AppText>
          : null}
      </AppText>
    </Pressable>
  );
}

/** 가로로 넘기는 카테고리 탭 */
export function CategoryTabs({ items, value, onChange, counts }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 4 }} style={{ marginHorizontal: -20, flexGrow: 0 }}>
      {items.map((it) => (
        <Chip key={it.id} label={it.label} count={counts ? counts[it.id] : undefined} selected={value === it.id} onPress={() => onChange(it.id)} />
      ))}
    </ScrollView>
  );
}

/** 두세 칸짜리 세그먼트 (공개 예정 / 열람 가능 등) */
export function Segmented({ items, value, onChange }) {
  return (
    <View accessibilityRole="tablist" style={styles.seg}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <Pressable key={it.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(it.id)}
            style={[styles.segItem, on && { backgroundColor: colors.violet }]}>
            <AppText variant={on ? 'bold' : 'body'} style={{ color: on ? colors.white : colors.ink, fontSize: 14 }}>{it.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexShrink: 0, height: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', height: 46, padding: 4, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: radius.md },
  segItem: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
