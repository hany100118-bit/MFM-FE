// 인증 API. 가입 전 단계(가입·아이디 확인)는 가입 토큰을 직접 넘긴다.
import { api } from '../../shared/api';
import { config } from '../../shared/config';

export const authApi = {
  loginWithKakao: (code) => api.post('/auth/kakao', { code, redirectUri: config.kakaoRedirectUri }, { token: null }),
  devLogin: (kakaoId) => api.post('/auth/dev-login', { kakaoId }, { token: null }),
  checkHandle: (handle, signupToken) => api.get('/auth/handle-availability', { query: { handle }, token: signupToken }),
  signup: (body, signupToken) => api.post('/auth/signup', body, { token: signupToken }),
  me: () => api.get('/users/me'),
};

export function kakaoAuthorizeUrl() {
  const q = `client_id=${encodeURIComponent(config.kakaoRestApiKey)}&redirect_uri=${encodeURIComponent(config.kakaoRedirectUri)}&response_type=code`;
  return `https://kauth.kakao.com/oauth/authorize?${q}`;
}
