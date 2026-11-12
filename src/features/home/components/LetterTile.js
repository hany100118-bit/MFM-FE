import { Pressable, View } from 'react-native';
import { AppText, Envelope, Icon } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { dDayLabel } from '../../../shared/utils/date';

// 디자인 03 홈: 3열 그리드의 봉인된 편지 카드 (흰 카드 + 색 칸 안의 봉투)
export function LetterTile({ letter, fill, onPress }) {
  const from = letter.recipientType === 'self' ? '나' : letter.sender.name;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${from}에게서 온 편지, ${dDayLabel(letter.dDay)}`} onPress={onPress}
      style={{ flex: 1, minWidth: 0, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 16, padding: 8, gap: 6 }}>
      <View style={{ height: 58, borderRadius: 10, backgroundColor: fill, alignItems: 'center', justifyContent: 'center' }}>
        <Envelope width={44} strokeWidth={2.5} />
        {letter.isReply ? (
          <View style={{ position: 'absolute', top: 4, left: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, backgroundColor: colors.ink }}>
            <AppText variant="bold" style={{ fontSize: 10, lineHeight: 14, color: colors.butter }}>답장</AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="bold" style={{ fontSize: 14, lineHeight: 20 }}>{dDayLabel(letter.dDay)}</AppText>
      <AppText variant="caption" numberOfLines={1} style={{ fontSize: 11, lineHeight: 16 }}>from. {from}</AppText>
    </Pressable>
  );
}

export function AddTile({ onPress }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="편지 쓰기" onPress={onPress}
      style={{ flex: 1, minWidth: 0, minHeight: 112, padding: 8, backgroundColor: colors.bg, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.violet, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Icon name="plus" size={26} strokeWidth={2.2} color={colors.violet} />
      <AppText variant="bold" style={{ color: colors.violet, fontSize: 12, lineHeight: 17, textAlign: 'center' }}>짬 하나{'\n'}더 넘기기</AppText>
    </Pressable>
  );
}
