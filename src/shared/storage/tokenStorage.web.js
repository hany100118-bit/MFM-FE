// 웹 전용: expo-secure-store 는 웹을 지원하지 않으므로 localStorage 를 쓴다.
// (Metro 가 웹 빌드에서는 tokenStorage.js 대신 이 파일을 자동으로 고른다)
// localStorage 는 암호화되지 않으니 웹은 개발/확인 용도로만 쓴다.
const KEY = 'jjam.accessToken';
let cached;

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // 사파리 개인 모드 등에서 접근 자체가 막힐 수 있다
  }
}

export async function getToken() {
  if (cached === undefined) cached = storage()?.getItem(KEY) || null;
  return cached;
}

export async function setToken(token) {
  cached = token;
  storage()?.setItem(KEY, token);
}

export async function clearToken() {
  cached = null;
  storage()?.removeItem(KEY);
}
