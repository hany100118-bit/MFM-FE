// 카카오 로그인 (웹). 웹에는 WebView 가 없으므로 이 탭 자체를 카카오 로그인 페이지로 보낸다.
// 카카오가 redirect_uri(예: http://localhost:5173/oauth/kakao)로 돌려보내면 KakaoCallbackScreen 이 code 를 처리한다.
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText, Header, Screen } from '../../../shared/components';
import { colors } from '../../../shared/theme';
import { config } from '../../../shared/config';
import { kakaoAuthorizeUrl } from '../api';

export default function KakaoLoginScreen() {
  const ready = Boolean(config.kakaoRestApiKey);
  useEffect(() => {
    if (ready) window.location.assign(kakaoAuthorizeUrl());
  }, [ready]);

  return (
    <Screen bg={colors.white}>
      <Header title="카카오 로그인" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        {ready ? <ActivityIndicator color={colors.violet} /> : null}
        <AppText style={{ textAlign: 'center' }}>
          {ready ? '카카오 로그인 페이지로 이동하는 중…' : 'EXPO_PUBLIC_KAKAO_REST_API_KEY 가 비어 있어요. 앱 .env 를 확인해 주세요.'}
        </AppText>
      </View>
    </Screen>
  );
}
