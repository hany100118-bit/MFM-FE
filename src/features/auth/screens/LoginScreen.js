// 로그인 (디자인: figma_screens/01_로그인.html)
// 연보라 배경 위에 떠다니는 봉투 장식 → 아치 모양 보라 패널 → 패널에 걸친 로고 원 → 카카오 버튼
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppText, Button, Envelope, KakaoIcon, LogoMark } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { showAlert } from '../../../shared/utils/alert';
import { errorMessage } from '../../../shared/utils/errorMessage';
import { useAuth } from '../AuthContext';

const PANEL_TOP = 320; // 패널(아치 꼭대기)이 시작하는 높이
const ARCH = 90; // 아치가 내려오는 높이
const LOGO = 156;

/** 패널 윗부분: 양쪽이 똑같이 둥근 아치. 화면 너비에 맞춰 늘어나도 테두리 굵기는 그대로 */
function Arch() {
  return (
    <Svg width="100%" height={ARCH} viewBox="0 0 100 90" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      <Path d="M0 90 C0 30 22 0 50 0 C78 0 100 30 100 90 Z" fill={colors.violet} />
      <Path d="M0 90 C0 30 22 0 50 0 C78 0 100 30 100 90" fill="none" stroke={colors.ink} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </Svg>
  );
}

export default function LoginScreen() {
  const { devLogin } = useAuth();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  // 시연용: 카카오 페이지로 가지 않고 3초 뒤 로그인된 것처럼 메인으로 보낸다.
  // 목업 모드(EXPO_PUBLIC_MOCK_API=true)의 가짜 회원으로 로그인하므로 이후 화면도 가짜 데이터로 동작한다.
  const onStart = async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 3000));
      const status = await devLogin('1001');
      router.replace(status === 'LOGGED_IN' ? '/' : '/signup');
    } catch (err) {
      showAlert('로그인 실패', errorMessage(err));
      setBusy(false);
    }
  };

  const top = insets.top;
  return (
    <View style={styles.root}>
      {/* 장식 (디자인 위치 그대로) */}
      <AppText variant="bold" style={[styles.tag, { top: top + 56 }]}>SECRET LETTER TO FUTURE ME</AppText>
      <View style={[styles.deco, { top: top + 110, left: 34, transform: [{ rotate: '-14deg' }] }]}><Envelope width={72} fill={colors.butter} /></View>
      <View style={[styles.deco, { top: top + 96, right: 40, transform: [{ rotate: '12deg' }] }]}><Envelope width={58} dot={colors.violet} /></View>
      <View style={[styles.deco, styles.dday, { top: top + 190, right: 54 }]}><AppText variant="display" style={{ color: colors.butter, fontSize: 16 }}>D-365</AppText></View>
      <View style={[styles.deco, styles.dot, { top: top + 200, left: 70 }]} />

      {/* 보라 패널 */}
      <View style={[styles.panel, { marginTop: top + PANEL_TOP }]}>
        <Arch />
        <View style={[styles.panelBody, { paddingBottom: Math.max(insets.bottom, 16) + 20 }]}>
          <AppText variant="display" style={{ color: colors.line, fontSize: 24 }}>미래의 나에게</AppText>
          <AppText variant="display" style={{ color: colors.white, fontSize: 68, lineHeight: 72 }}>짬처리</AppText>
          <AppText style={{ color: colors.line, fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: 14 }}>
            오늘 못 한 말, 미뤄둔 다짐{'\n'}미래의 나에게 슬쩍 넘겨두세요
          </AppText>
          <View style={{ flex: 1, minHeight: 24 }} />
          <Button title="카카오로 3초 만에 시작하기" variant="kakao" icon={<KakaoIcon />} loading={busy} onPress={onStart} style={{ alignSelf: 'stretch' }} />
          <AppText style={{ color: colors.line, fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: 'center' }}>
            시작하면 <AppText style={styles.link}>이용약관</AppText>과 <AppText style={styles.link}>개인정보 처리방침</AppText>에 동의하게 돼요
          </AppText>
        </View>
      </View>

      {/* 로고 원: 패널보다 나중에 그려서 항상 위에 보이게 */}
      <View style={[styles.logoWrap, { top: top + 236 }]} pointerEvents="none">
        <View style={styles.logoShadow} />
        <View style={styles.logo}><LogoMark size={104} /></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.lavender },
  tag: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 12, letterSpacing: 3, color: colors.violet },
  deco: { position: 'absolute' },
  dday: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.ink, transform: [{ rotate: '8deg' }] },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.lavenderStrong, borderWidth: 2, borderColor: colors.ink },
  panel: { flex: 1 },
  panelBody: { flex: 1, marginTop: ARCH, backgroundColor: colors.violet, alignItems: 'center', paddingTop: 110 - ARCH, paddingHorizontal: 24 },
  logoWrap: { position: 'absolute', left: '50%', marginLeft: -LOGO / 2, width: LOGO + 5, height: LOGO + 5, zIndex: 2, elevation: 2 },
  logoShadow: { position: 'absolute', left: 5, top: 5, width: LOGO, height: LOGO, borderRadius: LOGO / 2, backgroundColor: colors.ink },
  logo: { width: LOGO, height: LOGO, borderRadius: LOGO / 2, backgroundColor: colors.white, borderWidth: 3, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  link: { color: colors.white, fontSize: 12, textDecorationLine: 'underline' },
});
