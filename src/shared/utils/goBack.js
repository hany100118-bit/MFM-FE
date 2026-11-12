// 뒤로 가기. 새로고침했거나 주소로 바로 들어와서 돌아갈 화면이 없으면 홈으로 보낸다.
// (router.back() 만 쓰면 "The action 'GO_BACK' was not handled" 에러가 난다)
import { router } from 'expo-router';

export function goBack(fallback = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
