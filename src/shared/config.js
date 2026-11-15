// 앱 설정. Expo 는 EXPO_PUBLIC_ 로 시작하는 환경 변수를 빌드 때 앱에 넣어 준다 (.env.example 참고).
const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// 웹 개발 중 ngrok 주소면 개발 서버의 프록시(/__backend, metro.config.js)를 거친다.
// (브라우저 → ngrok 직접 호출은 ngrok 경고 페이지 + 백엔드 CORS 때문에 막힌다)
function resolveApiBaseUrl(url) {
  const loc = typeof window !== 'undefined' ? window.location : undefined;
  if (!loc?.origin || process.env.NODE_ENV === 'production' || !/ngrok/.test(url)) return url;
  try {
    return `${loc.origin}/__backend${new URL(url).pathname}`;
  } catch {
    return url;
  }
}

// 카카오 로그인 후 돌아올 주소. 웹은 지금 열린 주소 기준(/oauth/kakao)이라
// localhost:5173 과 배포 주소(https://mfmfrontend.vercel.app) 모두 그대로 동작한다.
// 앱(네이티브)은 WebView 가 가로채므로 .env 값을 쓴다. 어느 쪽이든 카카오 콘솔·백엔드 KAKAO_REDIRECT_URIS 에 등록돼 있어야 한다.
function resolveKakaoRedirectUri() {
  const loc = typeof window !== 'undefined' ? window.location : undefined;
  if (loc?.origin && /^https?:/.test(loc.protocol)) return `${loc.origin}/oauth/kakao`;
  return process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI || 'http://localhost:5173/oauth/kakao';
}

export const config = {
  apiBaseUrl: resolveApiBaseUrl(rawApiBaseUrl),
  kakaoRestApiKey: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '',
  kakaoRedirectUri: resolveKakaoRedirectUri(),
  // 목업 모드: 백엔드 없이 가짜 데이터로 모든 화면을 본다 (src/shared/api/mockServer.js)
  mockApi: process.env.EXPO_PUBLIC_MOCK_API === 'true',
  devLoginEnabled: process.env.EXPO_PUBLIC_DEV_LOGIN === 'true' || process.env.EXPO_PUBLIC_MOCK_API === 'true',
};
