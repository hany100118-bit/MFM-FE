import { View, ActivityIndicator } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors } from '../theme';
import { errorMessage } from '../utils/errorMessage';

/** 로딩 / 오류(다시 시도) / 비어 있음 상태를 한 곳에서 */
export function StateView({ loading, error, empty, emptyText = '아직 아무것도 없어요', onRetry }) {
  if (loading) return <View style={{ paddingVertical: 48 }}><ActivityIndicator color={colors.violet} /></View>;
  if (error) {
    return (
      <View style={{ paddingVertical: 32, gap: 12, alignItems: 'center' }}>
        <AppText style={{ textAlign: 'center' }}>{errorMessage(error)}</AppText>
        {onRetry ? <Button title="다시 시도" variant="outline" size="sm" onPress={onRetry} /> : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={{ paddingVertical: 32, borderWidth: 2, borderStyle: 'dashed', borderColor: '#8B7BD8', borderRadius: 18, alignItems: 'center' }}>
        <AppText variant="caption" style={{ fontSize: 14 }}>{emptyText}</AppText>
      </View>
    );
  }
  return null;
}
