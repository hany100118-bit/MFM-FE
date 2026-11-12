import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { colors } from '../theme';

export function BottomSheet({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="닫기" style={styles.dim} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.grip} />
        {title ? <AppText variant="display" style={{ fontSize: 22, marginBottom: 8 }}>{title}</AppText> : null}
        {children}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { flex: 1, backgroundColor: colors.dim },
  sheet: { backgroundColor: colors.bg, borderTopWidth: 2, borderColor: colors.ink, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, gap: 10 },
  grip: { alignSelf: 'center', width: 44, height: 5, borderRadius: 999, backgroundColor: colors.lavenderStrong, marginBottom: 6 },
});
