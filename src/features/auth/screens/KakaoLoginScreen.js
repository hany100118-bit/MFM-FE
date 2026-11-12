// 카카오 로그인 (REST API 인가 코드 방식).
// 카카오 로그인 페이지를 WebView 로 열고, 카카오가 redirect_uri 로 보내는 순간 주소에서 code 를 꺼낸다.
// 그 주소는 실제로 열지 않으므로 redirect_uri 에 실제 웹 서버가 없어도 된다 (카카오 콘솔에 등록만 하면 됨).
import { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { showAlert } from '../../../shared/utils/alert';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { goBack } from '../../../shared/utils/goBack';
import { AppText, Header, Screen } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { config } from '../../../shared/config';
import { errorMessage } from '../../../shared/utils/errorMessage';
import { useAuth } from '../AuthContext';
import { kakaoAuthorizeUrl } from '../api';

export default function KakaoLoginScreen() {
  const { loginWithKakaoCode } = useAuth();
  const [exchanging, setExchanging] = useState(false);
  const handled = useRef(false);

  if (!config.kakaoRestApiKey) {
    return (
      <Screen>
        <Header title="카카오 로그인" />
        <AppText style={{ padding: 24 }}>EXPO_PUBLIC_KAKAO_REST_API_KEY 가 비어 있어요. 앱 .env 를 확인해 주세요.</AppText>
      </Screen>
    );
  }

  const onRedirect = async (url) => {
    if (handled.current) return;
    handled.current = true;
    const params = new URL(url).searchParams;
    const code = params.get('code');
    if (!code) {
      // 사용자가 동의 화면에서 취소한 경우 (error=access_denied)
      goBack('/login');
      return;
    }
    setExchanging(true);
    try {
      const status = await loginWithKakaoCode(code);
      router.replace(status === 'LOGGED_IN' ? '/' : '/signup');
    } catch (err) {
      showAlert('카카오 로그인 실패', errorMessage(err));
      goBack('/login');
    }
  };

  return (
    <Screen bg={colors.white}>
      <Header title="카카오 로그인" />
      {exchanging ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator color={colors.violet} />
          <AppText>로그인하는 중…</AppText>
        </View>
      ) : (
        <WebView
          source={{ uri: kakaoAuthorizeUrl() }}
          incognito
          startInLoadingState
          onShouldStartLoadWithRequest={(req) => {
            if (req.url.startsWith(config.kakaoRedirectUri)) {
              onRedirect(req.url);
              return false;
            }
            // 카카오톡 앱으로 넘기려는 주소는 막고 웹 로그인으로 진행한다
            if (!/^https?:/.test(req.url)) return false;
            return true;
          }}
        />
      )}
    </Screen>
  );
}
