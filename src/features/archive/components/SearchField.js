import { TextInput, View } from 'react-native';
import { Icon } from '../../../shared/components';
import { colors, fonts } from '../../../shared/theme';

/** 보관함 검색창: 왼쪽 돋보기 + 46px 높이 (디자인 07) */
export function SearchField({ value, onChangeText, placeholder }) {
  return (
    <View style={{ height: 46, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 14 }}>
      <View pointerEvents="none" style={{ position: 'absolute', left: 12, top: 11 }}>
        <Icon name="search" size={20} color={colors.muted} />
      </View>
      <TextInput
        accessibilityLabel="보관한 편지 검색"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A82A8"
        returnKeyType="search"
        style={{ flex: 1, height: '100%', paddingLeft: 40, paddingRight: 12, paddingVertical: 0, fontFamily: fonts.body, fontSize: 14, color: colors.ink }}
      />
    </View>
  );
}
