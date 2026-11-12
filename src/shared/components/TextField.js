import { TextInput, View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, fonts, radius } from '../theme';

/**
 * 입력칸: 라벨 + 테두리 상자 + 도움말/오류.
 * sublabel: 라벨 옆 회색 보조 문구 · trailing: 상자 안쪽 오른쪽 요소 · right: 상자 바깥 오른쪽 요소
 * showCount: maxLength 가 있을 때 글자 수 표시 (기본 표시)
 */
export function TextField({
  label, sublabel, hint, error, prefix, right, trailing, maxLength, value, multiline, style, inputStyle, boxStyle, letter,
  showCount = true, ...rest
}) {
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? (
        <AppText variant="bold" style={{ fontSize: 13 }}>
          {label}{sublabel ? <AppText style={{ fontSize: 13, color: colors.muted }}>{` ${sublabel}`}</AppText> : null}
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'stretch' }}>
        <View style={[styles.box, multiline && { minHeight: 96, alignItems: 'flex-start' }, error && { borderColor: colors.danger }, boxStyle]}>
          {prefix ? <AppText variant="bold" style={styles.prefix}>{prefix}</AppText> : null}
          <TextInput
            accessibilityLabel={label}
            value={value}
            maxLength={maxLength}
            multiline={multiline}
            placeholderTextColor="#8B7BD8"
            style={[styles.input, letter && { fontFamily: fonts.letter }, multiline && { textAlignVertical: 'top', paddingVertical: 10 }, inputStyle]}
            {...rest}
          />
          {maxLength && showCount ? <AppText variant="caption" style={{ marginLeft: 6 }}>{(value || '').length} / {maxLength}</AppText> : null}
          {trailing}
        </View>
        {right}
      </View>
      {error ? <AppText style={{ fontSize: 12, color: colors.danger }}>{error}</AppText> : hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm + 2, paddingHorizontal: 14 },
  // 디자인: '@' 는 상자 바깥선 기준 14px, 글자는 안쪽 34px 에서 시작
  prefix: { color: colors.violet, fontSize: 15, marginLeft: -2, width: 20 },
  input: { flex: 1, minWidth: 0, alignSelf: 'stretch', fontFamily: fonts.body, fontSize: 15, color: colors.ink, paddingVertical: 0 },
});
