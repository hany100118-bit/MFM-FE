import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

/** 디자인의 "딱 떨어지는 그림자": 같은 모양의 남색 판을 뒤에 비켜 깐다 (안드로이드·iOS 동일하게 보임) */
export function ShadowBox({ offset = 4, radius = 18, style, contentStyle, children }) {
  return (
    <View style={[{ paddingRight: offset, paddingBottom: offset }, style]}>
      <View style={[StyleSheet.absoluteFill, { top: offset, left: offset, borderRadius: radius, backgroundColor: colors.ink }]} />
      <View style={[{ borderRadius: radius, borderWidth: 2, borderColor: colors.ink, overflow: 'hidden' }, contentStyle]}>{children}</View>
    </View>
  );
}
