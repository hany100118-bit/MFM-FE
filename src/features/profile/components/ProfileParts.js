// 내 프로필 화면 전용 조각들 (디자인 09)
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppText } from '../../../shared/components';
import { colors } from '../../../shared/theme';

/** 톱니바퀴 (프로필 설정) */
export function GearIcon({ size = 22, color = colors.ink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Svg>
  );
}

/** 44x44 흰 테두리 아이콘 버튼 (헤더 양옆) */
export function SquareIconButton({ label, onPress, disabled, children }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} hitSlop={4}
      style={({ pressed }) => [styles.square, disabled && { opacity: 0.45 }, { transform: [{ translateY: pressed ? 2 : 0 }] }]}>
      {children}
    </Pressable>
  );
}

/** 112px 아바타: 3px 테두리 + 4px 딱 떨어지는 그림자 */
export function ProfileAvatar({ name = '?', size = 112 }) {
  return (
    <View style={{ width: size + 4, height: size + 4 }}>
      <View style={{ position: 'absolute', top: 4, left: 4, width: size, height: size, borderRadius: size / 2, backgroundColor: colors.ink }} />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.lavenderStrong, borderWidth: 3, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="display" style={{ fontSize: 48, lineHeight: 56 }}>{String(name).slice(0, 1)}</AppText>
      </View>
    </View>
  );
}

/** 숫자 타일 (3칸 그리드) */
export function StatTile({ value, label, accent }) {
  return (
    <View accessible accessibilityLabel={`${label} ${value}`}
      style={[styles.tile, accent && { backgroundColor: colors.butter }]}>
      <AppText variant="display" numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 26, lineHeight: 32 }}>{value}</AppText>
      <AppText variant={accent ? 'bold' : 'body'} numberOfLines={1} style={{ fontSize: 12, lineHeight: 17, color: accent ? colors.ink : colors.muted }}>{label}</AppText>
    </View>
  );
}

/** 하단 큰 버튼 (높이 56, 그림자 4). disabled 면 "준비 중" 꼬리표 */
export function BigButton({ title, onPress, tone = 'violet', disabled }) {
  const bg = tone === 'violet' ? colors.violet : tone === 'butter' ? colors.butter : colors.white;
  const fg = tone === 'violet' ? colors.white : colors.ink;
  return (
    <View style={{ flex: 1, paddingRight: 4, paddingBottom: 4, opacity: disabled ? 0.55 : 1 }}>
      <View style={{ position: 'absolute', top: 4, left: 4, right: 0, bottom: 0, borderRadius: 16, backgroundColor: colors.ink }} />
      <Pressable accessibilityRole="button" accessibilityLabel={disabled ? `${title} (준비 중)` : title} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
        style={({ pressed }) => [styles.big, { backgroundColor: bg, transform: [{ translateY: pressed ? 2 : 0 }] }]}>
        <AppText variant="bold" style={{ fontSize: 15, color: fg }}>{title}</AppText>
        {disabled ? <AppText style={{ fontSize: 10, lineHeight: 13, color: fg }}>준비 중</AppText> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  square: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  tile: { flex: 1, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' },
  big: { height: 56, borderRadius: 16, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
