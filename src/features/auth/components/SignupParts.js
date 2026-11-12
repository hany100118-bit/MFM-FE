// 회원가입 화면 전용 작은 부품들 (디자인 02_회원가입 기준 크기)
import { ActivityIndicator, Pressable, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppText, Icon } from '../../../shared/components';
import { colors } from '../../../shared/theme';

/** 입력칸 옆 48px 버튼: dark(남색 바탕 + 버터색 글자) / outline(흰 바탕) */
export function FieldButton({ title, onPress, variant = 'dark', loading = false, disabled = false, width, accessibilityLabel }) {
  const dark = variant === 'dark';
  const fg = dark ? colors.butter : colors.ink;
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.fieldBtn, { backgroundColor: dark ? colors.ink : colors.white, opacity: inactive ? 0.6 : 1, transform: [{ translateY: pressed ? 1 : 0 }] }, width ? { width, paddingHorizontal: 0 } : null]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <AppText variant="bold" numberOfLines={1} style={{ color: fg, fontSize: 14 }}>{title}</AppText>}
    </Pressable>
  );
}

/** 나이 입력칸 안쪽 오른쪽의 40px 연보라 펼침 버튼 */
export function InnerChevronButton({ onPress, accessibilityLabel }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.innerBtn}>
      <Icon name="chevronDown" size={18} color={colors.violetDark} />
    </Pressable>
  );
}

/** 칸이 선으로 나뉜 48px 세그먼트 (성별) */
export function LinedSegmented({ items, value, onChange }) {
  return (
    <View accessibilityRole="radiogroup" style={styles.seg}>
      {items.map((it, i) => {
        const on = it.id === value;
        return (
          <Pressable key={it.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onChange(it.id)}
            style={[styles.segItem, i > 0 && styles.segDivider, on && { backgroundColor: colors.violet }]}>
            <AppText variant={on ? 'bold' : 'body'} style={{ fontSize: 14, color: on ? colors.white : colors.ink }}>{it.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 브라우저 기본 체크박스(accent-color 보라)와 같은 모양 */
export function CheckBox({ checked, size = 18 }) {
  return (
    <View style={[styles.box, { width: size, height: size }, checked ? { backgroundColor: colors.violet, borderColor: colors.violet } : null]}>
      {checked ? (
        <Svg width={size - 2} height={size - 2} viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M5 12.5l4.5 4.5L19 7.5" />
        </Svg>
      ) : null}
    </View>
  );
}

/** 약관 한 줄: big=전체 동의(22px 상자, 15px 굵게) */
export function AgreeRow({ checked, onPress, big, tag, tagColor, label, note }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: big ? 28 : 24 }}>
      <View style={big ? null : { marginHorizontal: 2 }}><CheckBox checked={checked} size={big ? 22 : 18} /></View>
      <AppText variant={big ? 'bold' : 'body'} style={{ fontSize: big ? 15 : 14, flexShrink: 1 }}>
        {tag ? <AppText variant="bold" style={{ fontSize: 14, color: tagColor }}>{tag} </AppText> : null}
        {label}
        {note ? <AppText style={{ fontSize: 12, color: colors.muted }}>{` ${note}`}</AppText> : null}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldBtn: { height: 48, paddingHorizontal: 14, borderWidth: 2, borderColor: colors.ink, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  innerBtn: { width: 40, height: 40, borderRadius: 9, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', marginRight: -12 },
  seg: { flexDirection: 'row', height: 48, borderWidth: 2, borderColor: colors.ink, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.white },
  segItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segDivider: { borderLeftWidth: 2, borderLeftColor: colors.ink },
  box: { borderRadius: 4, borderWidth: 1.5, borderColor: '#767676', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
