import { Platform, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { AppText, Envelope, OpenEnvelope, ShadowBox } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { dDayLabel, shortYmd } from '../../../shared/utils/date';

const fromName = (l) => (l.recipientType === 'self' ? '나에게서' : l.isReply ? `${l.sender.name}의 답장` : l.sender.name);

// 디자인에서 봉투 타일 배경이 줄마다 번갈아 바뀐다
const TILE = [colors.lavender, colors.butter, colors.lavenderStrong];

const row = { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12 };
const tile = { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' };

/** 디자인의 filter: blur(4px) 처리된 점 자리표시. 웹은 CSS filter, 네이티브는 BlurView 를 얹는다 */
function BlurredDots() {
  const dots = <AppText style={{ fontSize: 13, lineHeight: 19 }}>●●●●● ●●● ●●●●●●●</AppText>;
  if (Platform.OS === 'web') {
    return <View importantForAccessibility="no-hide-descendants" style={{ marginTop: 4, filter: 'blur(4px)', userSelect: 'none' }}>{dots}</View>;
  }
  return (
    <View importantForAccessibility="no-hide-descendants" style={{ marginTop: 4, overflow: 'hidden' }}>
      {dots}
      <BlurView intensity={40} tint="light" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.15)' }} />
    </View>
  );
}

/** 봉인된 편지: 서버가 제목·내용을 주지 않으므로 자리표시 위에 블러만 얹는다 */
export function SealedRow({ letter, onPress, index = 0 }) {
  const soon = letter.dDay <= 14;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${fromName(letter)}, ${letter.openDate} 공개, ${dDayLabel(letter.dDay)}. 제목과 내용은 공개일까지 가려져 있어요`} onPress={onPress}
      style={[row, { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 18 }]}>
      <View style={[tile, { backgroundColor: TILE[index % TILE.length] }]}><Envelope width={30} strokeWidth={3} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="bold" numberOfLines={1} style={{ fontSize: 15 }}>
          {fromName(letter)}{' '}
          <AppText style={{ fontSize: 12, color: colors.muted }}>{letter.recipientType === 'self' ? '' : `@${letter.sender.handle} `}· {shortYmd(letter.openDate)} 공개</AppText>
        </AppText>
        <BlurredDots />
      </View>
      <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: soon ? colors.violet : colors.lavender, borderWidth: soon ? 0 : 2, borderColor: colors.violet }}>
        <AppText variant="bold" style={{ fontSize: 13, color: soon ? colors.white : colors.violetDark }}>{dDayLabel(letter.dDay)}</AppText>
      </View>
    </Pressable>
  );
}

/** 열람 가능한 편지: 새로 열린(또는 답장 가능한) 편지는 노란 카드 + 딱 떨어지는 그림자 */
export function OpenedRow({ letter, onPress }) {
  const fresh = letter.reply.available || !letter.firstReadAt;
  const body = (
    <Pressable accessibilityRole="button" onPress={onPress} style={[row, { backgroundColor: fresh ? colors.butter : colors.white }]}>
      <View style={[tile, { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink }]}><OpenEnvelope width={30} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="bold" numberOfLines={1} style={{ fontSize: 15 }}>{letter.title}</AppText>
        <AppText style={{ fontSize: 13, marginTop: 2 }} numberOfLines={2}>from. {letter.recipientType === 'self' ? '나' : letter.sender.name}{letter.reply.available ? ' · 답장은 오늘 23:59까지' : ''}</AppText>
      </View>
      <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: fresh ? colors.ink : colors.lavender }}>
        <AppText variant="bold" style={{ fontSize: 13, color: fresh ? colors.butter : colors.violetDark }}>{letter.firstReadAt ? '다시 보기' : '열어보기'}</AppText>
      </View>
    </Pressable>
  );
  if (!fresh) return <View style={{ borderWidth: 2, borderColor: colors.ink, borderRadius: 18, overflow: 'hidden' }}>{body}</View>;
  // box-shadow 는 레이아웃을 차지하지 않으므로 음수 여백으로 카드 폭을 디자인과 맞춘다
  return <ShadowBox offset={4} radius={18} style={{ marginRight: -4, marginBottom: -4 }}>{body}</ShadowBox>;
}
