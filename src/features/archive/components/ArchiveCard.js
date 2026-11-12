import { Pressable, View } from 'react-native';
import { AppText } from '../../../shared/components';
import { colors, fonts } from '../../../shared/theme';

const BANDS = [colors.violet, colors.butter, colors.lavenderStrong, colors.lavender];
const ORIGIN = { self: '나에게서', friend: '친구에게서', anyone: '모르는 사람에게서' };

// "10.19 열람" — 실제 처음 읽은 날(없으면 공개일)
function readLabel(letter) {
  let m;
  let d;
  if (letter.firstReadAt) {
    const t = new Date(letter.firstReadAt);
    m = t.getMonth() + 1;
    d = t.getDate();
  } else {
    [, m, d] = letter.openDate.split('-').map(Number);
  }
  return `${m}.${String(d).padStart(2, '0')} 열람`;
}

/** 보관함 2열 카드. highlight=true 면 디자인처럼 딱 떨어지는 그림자를 깐다 (레이아웃은 그대로). */
export function ArchiveCard({ letter, index, highlight = false, onPress }) {
  const band = BANDS[index % BANDS.length];
  const from = letter.recipientType === 'self' ? '나' : `${letter.sender.name} @${letter.sender.handle}`;
  const meta = letter.isReply ? '내 편지에 온 답장' : `${ORIGIN[letter.recipientType] || '받은 편지'} · ${readLabel(letter)}`;
  return (
    <View style={{ flex: 1 }}>
      {highlight ? <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 18, backgroundColor: colors.ink }} /> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={`${letter.title}, from ${from}`} onPress={onPress}
        style={({ pressed }) => ({ flex: 1, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink, borderRadius: 18, overflow: 'hidden', transform: [{ translateY: pressed ? 2 : 0 }] })}>
        <View style={{ height: 64, backgroundColor: band, borderBottomWidth: 2, borderColor: colors.ink }}>
          <AppText variant="display" style={{ position: 'absolute', left: 12, bottom: 10, fontSize: 22, lineHeight: 26, color: band === colors.violet ? colors.white : colors.ink }}>
            {letter.openDate.replaceAll('-', '.')}
          </AppText>
          {letter.isReply ? (
            <View style={{ position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: colors.ink }}>
              <AppText variant="bold" style={{ fontSize: 11, lineHeight: 15, color: colors.butter }}>답장</AppText>
            </View>
          ) : null}
        </View>
        <View style={{ paddingTop: 10, paddingHorizontal: 12, paddingBottom: 12, gap: 4 }}>
          <AppText style={{ fontFamily: fonts.letter, fontSize: 15, lineHeight: 22 }} numberOfLines={1}>{letter.title}</AppText>
          <AppText variant="bold" style={{ fontSize: 12, lineHeight: 17, color: colors.violet }} numberOfLines={1}>from. {from}</AppText>
          <AppText style={{ fontFamily: fonts.letter, fontSize: 13, color: '#4A416E', lineHeight: 19.5 }} numberOfLines={2}>{letter.preview}</AppText>
          <AppText style={{ fontSize: 11, lineHeight: 16, color: colors.muted }} numberOfLines={1}>{meta}</AppText>
        </View>
      </Pressable>
    </View>
  );
}
