import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goBack } from '../utils/goBack';
import { AppText } from './AppText';
import { Icon } from './Icons';
import { colors } from '../theme';

/** 화면 공통 틀: 안전 영역 + 배경색 */
export function Screen({ children, style, bg = colors.bg, edges = ['top'] }) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

/** 뒤로 가기 + 가운데 제목 + 오른쪽 자리 */
export function Header({ title, right, onBack = () => goBack(), light = false }) {
  const fg = light ? colors.white : colors.ink;
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={onBack} hitSlop={8} style={styles.side}>
        <Icon name="back" size={24} color={fg} />
      </Pressable>
      <AppText variant="bold" style={{ fontSize: 15, color: fg }}>{title}</AppText>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  side: { minWidth: 44, height: 44, justifyContent: 'center' },
});
