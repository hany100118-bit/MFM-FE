import { Pressable, ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

const VARIANTS = {
  primary: { bg: colors.violet, fg: colors.white, shadow: true },
  accent: { bg: colors.butter, fg: colors.ink, shadow: true },
  dark: { bg: colors.ink, fg: colors.butter, shadow: false },
  outline: { bg: colors.white, fg: colors.ink, shadow: false },
  kakao: { bg: colors.kakao, fg: '#191919', shadow: true },
  danger: { bg: colors.white, fg: colors.danger, shadow: false },
};

export function Button({ title, onPress, variant = 'primary', size = 'lg', loading = false, disabled = false, style, accessibilityLabel, icon = null }) {
  const v = VARIANTS[variant];
  const height = size === 'lg' ? 56 : size === 'md' ? 48 : 40;
  const inactive = disabled || loading;
  return (
    <View style={[{ paddingRight: v.shadow ? 4 : 0, paddingBottom: v.shadow ? 4 : 0, opacity: inactive ? 0.6 : 1 }, style]}>
      {v.shadow && <View style={[StyleSheet.absoluteFill, { top: 4, left: 4, borderRadius: radius.md, backgroundColor: colors.ink }]} />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: inactive, busy: loading }}
        onPress={onPress}
        disabled={inactive}
        style={({ pressed }) => [styles.base, { height, backgroundColor: v.bg, transform: [{ translateY: pressed ? 2 : 0 }] }]}
      >
        {loading ? <ActivityIndicator color={v.fg} /> : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {icon}
            <AppText variant="bold" style={{ color: v.fg, fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 15 }}>{title}</AppText>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
});
