import { View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme';

/** 동그란 이니셜 아바타. shadow 를 주면 디자인의 `box-shadow: Npx Npx 0 #1E1442` 처럼 남색 원을 비켜 깐다 */
export function Avatar({ name = '?', size = 44, fill = colors.lavenderStrong, shadow = 0 }) {
  return (
    <View style={{ width: size + shadow, height: size + shadow }}>
      {shadow ? <View style={{ position: 'absolute', left: shadow, top: shadow, width: size, height: size, borderRadius: size / 2, backgroundColor: colors.ink }} /> : null}
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: fill, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="display" style={{ fontSize: size * 0.45, color: colors.ink }}>{String(name).slice(0, 1)}</AppText>
      </View>
    </View>
  );
}
