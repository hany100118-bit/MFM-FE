// 편지 열람·쓰기 화면 전용 작은 UI 조각들 (디자인 05 / 06 의 수치를 그대로 옮김)
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { goBack } from '../../../shared/utils/goBack';
import { AppText, Icon } from '../../../shared/components';
import { colors, fonts } from '../../../shared/theme';

/** 디자인 아이콘 중 공용 Icon 에 없는 것들 */
export function ExtraIcon({ name, size = 20, color = colors.ink }) {
  if (name === 'reply') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 14L4 9l5-5" /><Path d="M4 9h10a6 6 0 0 1 6 6v5" />
      </Svg>
    );
  }
  if (name === 'trash') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </Svg>
    );
  }
  if (name === 'more') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Circle cx="5" cy="12" r="2" /><Circle cx="12" cy="12" r="2" /><Circle cx="19" cy="12" r="2" />
      </Svg>
    );
  }
  return null;
}

/** 흰 네모 버튼 (44x44, 열람 화면 헤더) */
function BoxButton({ label, onPress, children }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4}
      style={({ pressed }) => [styles.boxBtn, pressed && { transform: [{ translateY: 1 }] }]}>
      {children}
    </Pressable>
  );
}

/**
 * 편지 화면 헤더.
 * kind="box": 흰 네모 뒤로가기 + Jua 20 제목 (열람)
 * kind="close": X 닫기 + Jua 22 제목 (쓰기)
 */
export function LetterHeader({ title, kind = 'box', light = false, right = null, onBack = () => goBack() }) {
  const fg = light ? colors.white : colors.ink;
  if (kind === 'close') {
    return (
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={onBack} hitSlop={6}
          style={{ width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={24} color={fg} />
        </Pressable>
        <AppText variant="display" style={{ fontSize: 22, color: fg }}>{title}</AppText>
        <View style={{ width: 34 }} />
      </View>
    );
  }
  return (
    <View style={styles.header}>
      <BoxButton label="뒤로" onPress={onBack}><Icon name="back" size={22} /></BoxButton>
      <AppText variant="display" style={{ fontSize: 20, color: fg }}>{title}</AppText>
      {right || <View style={{ width: 44 }} />}
    </View>
  );
}

export { BoxButton };

const ACTION = {
  accent: { bg: colors.butter, fg: colors.ink, shadow: true, h: 56, r: 16, fs: 16 },
  primary: { bg: colors.violet, fg: colors.white, shadow: true, h: 56, r: 16, fs: 16 },
  outline: { bg: colors.white, fg: colors.ink, shadow: false, h: 52, r: 14, fs: 14 },
  danger: { bg: colors.white, fg: colors.danger, shadow: false, h: 52, r: 14, fs: 14 },
  dark: { bg: colors.ink, fg: colors.white, shadow: false, h: 52, r: 14, fs: 14 },
};

/** 디자인 그대로의 하단 버튼 (큰 버튼 56/r16 + 4px 그림자, 작은 버튼 52/r14) */
export function ActionButton({ title, variant = 'primary', icon = null, onPress, loading = false, disabled = false, style }) {
  const v = ACTION[variant];
  const inactive = disabled || loading;
  return (
    <View style={[{ opacity: inactive ? 0.6 : 1 }, v.shadow && { paddingRight: 4, paddingBottom: 4, marginRight: -4, marginBottom: -4 }, style]}>
      {v.shadow ? <View style={[StyleSheet.absoluteFill, { top: 4, left: 4, borderRadius: v.r, backgroundColor: colors.ink }]} /> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: inactive, busy: loading }}
        onPress={onPress} disabled={inactive}
        style={({ pressed }) => [styles.action, { height: v.h, borderRadius: v.r, backgroundColor: v.bg, transform: [{ translateY: pressed ? 2 : 0 }] }]}>
        {loading ? <ActivityIndicator color={v.fg} /> : (
          <>
            {icon}
            <AppText variant="bold" numberOfLines={1} style={{ color: v.fg, fontSize: v.fs }}>{title}</AppText>
          </>
        )}
      </Pressable>
    </View>
  );
}

/** 라벨(14 bold) + 보조 문구(12 muted) */
export function FieldLabel({ children, sub, right }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <AppText variant="bold" style={{ fontSize: 14 }}>
        {children}{sub ? <AppText style={{ fontSize: 12, color: colors.muted }}>{` · ${sub}`}</AppText> : null}
      </AppText>
      {right}
    </View>
  );
}

/** 편지 제목 입력 (46px, Gowun Dodum 15, 오른쪽 글자 수) */
export function LetterTitleField({ label, value, onChangeText, maxLength, placeholder }) {
  return (
    <View style={{ gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      <View style={[styles.inputBox, { height: 46 }]}>
        <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} maxLength={maxLength} placeholder={placeholder}
          placeholderTextColor="#8B7BD8" style={[styles.input, { fontFamily: fonts.letter }]} />
        <AppText variant="caption" style={{ marginLeft: 8 }}>{(value || '').length} / {maxLength}</AppText>
      </View>
    </View>
  );
}

/** 편지 내용 입력 (흰 카드 r16 · 점선 아래 글자 수) */
export function LetterBodyField({ label, value, onChangeText, maxLength, placeholder }) {
  return (
    <View style={{ gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      <View style={styles.bodyCard}>
        <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} maxLength={maxLength} placeholder={placeholder}
          placeholderTextColor="#8B7BD8" multiline textAlignVertical="top"
          style={[styles.input, { fontFamily: fonts.letter, minHeight: 72, lineHeight: 24, paddingVertical: 0 }]} />
        <DashedLine />
        <View style={styles.bodyFoot}>
          <AppText variant="caption">{(value || '').length} / {maxLength}</AppText>
        </View>
      </View>
    </View>
  );
}

/** 아이디 입력 (48px, 보라 @ 접두) + 오른쪽 확인 버튼 */
export function HandleField({ label, sub, value, onChangeText, error, onConfirm, confirmLoading, confirmDisabled }) {
  return (
    <View style={{ gap: 8 }}>
      <FieldLabel sub={sub}>{label}</FieldLabel>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[styles.inputBox, { flex: 1, height: 48 }, error && { borderColor: colors.danger }]}>
          <AppText variant="bold" style={{ color: colors.violet, fontSize: 15, marginRight: 6 }}>@</AppText>
          <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder="아이디" placeholderTextColor="#8B7BD8"
            autoCapitalize="none" autoCorrect={false} style={styles.input} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="확인" onPress={onConfirm} disabled={confirmDisabled || confirmLoading}
          style={[styles.confirm, (confirmDisabled || confirmLoading) && { opacity: 0.6 }]}>
          {confirmLoading ? <ActivityIndicator color={colors.butter} /> : <AppText variant="bold" style={{ color: colors.butter, fontSize: 14 }}>확인</AppText>}
        </Pressable>
      </View>
      {error ? <AppText style={{ fontSize: 12, color: colors.danger }}>{error}</AppText> : null}
    </View>
  );
}

/** 2px 점선 가로줄 (한쪽 테두리 dashed 는 iOS 에서 깨져서 SVG 로) */
export function DashedLine({ color = colors.line }) {
  return (
    <Svg width="100%" height={2}>
      <Line x1="0" y1="1" x2="100%" y2="1" stroke={color} strokeWidth={2} strokeDasharray="6 4" />
    </Svg>
  );
}

/** 줄 노트 배경: 32px 마다 #E4DCFF 1px 줄 (repeating-linear-gradient 대체) */
export function LinedPaper() {
  const [h, setH] = useState(0);
  const count = Math.max(0, Math.floor((h - 31) / 32) + 1);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: 31 + i * 32, height: 1, backgroundColor: colors.line }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  boxBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  action: { borderWidth: 2, borderColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.body, fontSize: 15, color: colors.ink, paddingVertical: 0, outlineStyle: 'none' },
  bodyCard: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, gap: 8 },
  bodyFoot: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', minHeight: 28 },
  confirm: { height: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
