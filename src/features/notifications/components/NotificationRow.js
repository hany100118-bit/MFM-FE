import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppText, ShadowBox } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { timeAgo } from '../../../shared/utils/date';

const TEXT = {
  letter_arrived: (n) => `${n.sender.name}님이 편지를 보냈어요`,
  letter_opened: () => '봉인이 풀렸어요! 편지를 열어보세요',
  reply_deadline: () => '답장은 공개 당일 23:59까지만 보낼 수 있어요',
  reply_received: (n) => `${n.sender.name}님이 내 편지에 답장했어요`,
};
const BADGE = { letter_arrived: colors.lavender, letter_opened: colors.butter, reply_deadline: colors.lavenderStrong, reply_received: colors.butter };
// 디자인 HTML 의 아이콘 경로 그대로 (24x24, 선 2)
const ICON = {
  letter_arrived: 'M3 6h18v12H3zM3 7l9 6 9-6',
  letter_opened: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2',
  reply_deadline: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  reply_received: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 6 6v5',
};

export function NotificationRow({ n, onPress }) {
  const text = (TEXT[n.type] || (() => '새 알림'))(n);
  const body = (
    <Pressable accessibilityRole="button" accessibilityLabel={`${n.read ? '' : '안 읽음, '}${text}, ${timeAgo(n.createdAt)}`} onPress={onPress}
      style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, backgroundColor: n.read ? colors.bg : colors.white }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 2, borderColor: colors.ink, backgroundColor: BADGE[n.type] || colors.lavender, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d={ICON[n.type] || ICON.letter_arrived} />
        </Svg>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText variant="bold" style={{ fontSize: 14, lineHeight: 20 }}>{text}</AppText>
        <AppText style={{ fontSize: 12, color: colors.muted }}>{timeAgo(n.createdAt)}</AppText>
      </View>
      {!n.read ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.violet }} /> : null}
    </Pressable>
  );
  if (n.read) return <View style={{ borderWidth: 2, borderColor: colors.ink, borderRadius: 18, overflow: 'hidden' }}>{body}</View>;
  // 안 읽은 알림만 딱 떨어지는 그림자. box-shadow 처럼 레이아웃을 차지하지 않게 음수 여백
  return <ShadowBox offset={4} radius={18} style={{ marginRight: -4, marginBottom: -4 }}>{body}</ShadowBox>;
}
