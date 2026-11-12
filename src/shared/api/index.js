// 앱 전체에서 쓰는 API 인스턴스. 401(저장된 토큰 거절)이면 등록된 로그아웃 처리를 부른다.
import { config } from '../config';
import { getToken } from '../storage/tokenStorage';
import { createApiClient } from './client';
import { createMockServer } from './mockServer';

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

export const api = createApiClient({
  baseUrl: config.apiBaseUrl,
  getToken,
  onUnauthorized: () => unauthorizedHandler && unauthorizedHandler(),
  ...(config.mockApi ? { fetchImpl: createMockServer().fetch } : {}),
});

export { ApiError } from './client';
