// 내 프로필 (서버 /users/me). 프로필 편집·친구 기능은 서버 API 가 준비되면 연결한다.
import { Pressable, ScrollView, View } from 'react-native';
import { goBack } from '../../../shared/utils/goBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../../../shared/utils/alert';
import { AppText, Envelope, Icon, Screen, ShadowBox } from '../../../shared/components';
import { colors, fonts } from '../../../shared/theme';
import { useAuth } from '../../auth/AuthContext';
import { BigButton, GearIcon, ProfileAvatar, SquareIconButton, StatTile } from '../components/ProfileParts';

const GENDER = { female: '여성', male: '남성', undisclosed: '비공개' };

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  if (!user) return null;
  const confirmLogout = () => showAlert('로그아웃할까요?', '', [{ text: '취소', style: 'cancel' }, { text: '로그아웃', style: 'destructive', onPress: logout }]);
  const bottom = 32 + insets.bottom;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44, marginTop: 20, paddingHorizontal: 20 }}>
        <SquareIconButton label="뒤로" onPress={() => goBack()}>
          <Icon name="back" size={22} />
        </SquareIconButton>
        <AppText variant="display" style={{ fontSize: 20, lineHeight: 26 }}>내 프로필</AppText>
        <SquareIconButton label="프로필 설정 (준비 중)" disabled>
          <GearIcon />
        </SquareIconButton>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: bottom + 56 + 24, gap: 18 }}>
        <ShadowBox radius={26} offset={5} contentStyle={{ backgroundColor: colors.violet, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center', gap: 10 }}>
          <View pointerEvents="none" style={{ position: 'absolute', top: 14, right: -10, transform: [{ rotate: '14deg' }] }}>
            <Envelope width={70} fill={colors.butter} />
          </View>
          <ProfileAvatar name={user.name} />
          <View style={{ alignItems: 'center' }}>
            <AppText variant="display" style={{ color: colors.white, fontSize: 28, lineHeight: 36 }}>{user.name}</AppText>
            <AppText variant="bold" style={{ color: colors.line, fontSize: 14, lineHeight: 20 }}>@{user.handle}</AppText>
          </View>
          <View style={{ maxWidth: '100%', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.ink }}>
            <AppText numberOfLines={1} style={{ fontFamily: fonts.letter, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>{user.email}</AppText>
          </View>
        </ShadowBox>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatTile value={user.age} label="나이" />
          <StatTile value={GENDER[user.gender] || '-'} label="성별" />
          <StatTile value={user.notificationAgreed ? 'ON' : 'OFF'} label="편지 도착 알림" accent />
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="bold" style={{ fontSize: 16 }}>내 친구</AppText>
            <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: colors.lavender }}>
              <AppText variant="bold" style={{ fontSize: 11, lineHeight: 15, color: colors.violet }}>준비 중</AppText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View accessibilityLabel="친구 추가 (준비 중)" style={{ width: 60, alignItems: 'center', gap: 6, opacity: 0.55 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.violet, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={24} strokeWidth={2.4} color={colors.violet} />
              </View>
              <AppText variant="bold" style={{ fontSize: 12, lineHeight: 17, color: colors.violet }}>친구 추가</AppText>
            </View>
            <AppText variant="caption" style={{ flex: 1, lineHeight: 18, marginBottom: 22 }}>사진·상태메시지 변경과 친구 추가는 서버가 준비되면 열려요.</AppText>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={confirmLogout} hitSlop={6}
          style={({ pressed }) => ({ alignSelf: 'center', paddingHorizontal: 16, height: 40, borderRadius: 14, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.white, justifyContent: 'center', transform: [{ translateY: pressed ? 2 : 0 }] })}>
          <AppText variant="bold" style={{ fontSize: 14 }}>로그아웃</AppText>
        </Pressable>
      </ScrollView>

      <View style={{ position: 'absolute', left: 20, right: 20, bottom, flexDirection: 'row', gap: 10 }}>
        <BigButton title="프로필 편집" tone="violet" disabled />
        <BigButton title="친구 추가" tone="butter" disabled />
      </View>
    </Screen>
  );
}
