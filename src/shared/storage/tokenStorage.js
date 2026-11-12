// 로그인 토큰은 기기의 보안 저장소(iOS Keychain / Android Keystore)에 둔다. AsyncStorage 는 암호화되지 않아 쓰지 않는다.
import * as SecureStore from 'expo-secure-store';

const KEY = 'jjam.accessToken';
let cached; // 매 요청마다 저장소를 읽지 않도록 메모리에 둔다

export async function getToken() {
  if (cached === undefined) cached = (await SecureStore.getItemAsync(KEY)) || null;
  return cached;
}

export async function setToken(token) {
  cached = token;
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken() {
  cached = null;
  await SecureStore.deleteItemAsync(KEY);
}
