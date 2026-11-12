// 로그인 상태를 앱 전체에 공유한다.
//   status: loading | signedOut | signupRequired | signedIn | error(서버 연결 실패, 다시 시도 가능)
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../../shared/api';
import { clearToken, getToken, setToken } from '../../shared/storage/tokenStorage';
import { authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, signupToken: null, kakaoEmail: null, error: null });

  const logout = useCallback(async () => {
    await clearToken();
    setState({ status: 'signedOut', user: null, signupToken: null, kakaoEmail: null, error: null });
  }, []);

  const restore = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    const token = await getToken();
    if (!token) return setState((s) => ({ ...s, status: 'signedOut' }));
    try {
      const user = await authApi.me();
      setState((s) => ({ ...s, status: 'signedIn', user }));
    } catch (error) {
      if (error.status === 401) return logout();
      setState((s) => ({ ...s, status: 'error', error }));
    }
  }, [logout]);

  useEffect(() => {
    setUnauthorizedHandler(() => { logout(); });
    restore();
    return () => setUnauthorizedHandler(null);
  }, [logout, restore]);

  /** 카카오/개발 로그인 응답 처리: 기존 회원이면 로그인, 신규면 가입 단계로 */
  const handleLoginResult = useCallback(async (data) => {
    if (data.status === 'LOGGED_IN') {
      await setToken(data.accessToken);
      const user = await authApi.me();
      setState({ status: 'signedIn', user, signupToken: null, kakaoEmail: null, error: null });
    } else {
      setState({ status: 'signupRequired', user: null, signupToken: data.signupToken, kakaoEmail: data.kakaoEmail, error: null });
    }
    return data.status;
  }, []);

  const value = useMemo(() => ({
    ...state,
    loginWithKakaoCode: async (code) => handleLoginResult(await authApi.loginWithKakao(code)),
    devLogin: async (kakaoId) => handleLoginResult(await authApi.devLogin(kakaoId)),
    completeSignup: async (body) => {
      const data = await authApi.signup(body, state.signupToken);
      await setToken(data.accessToken);
      const user = await authApi.me();
      setState({ status: 'signedIn', user, signupToken: null, kakaoEmail: null, error: null });
    },
    cancelSignup: () => setState({ status: 'signedOut', user: null, signupToken: null, kakaoEmail: null, error: null }),
    refreshUser: restore,
    retry: restore,
    logout,
  }), [state, handleLoginResult, logout, restore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있어요.');
  return ctx;
}
