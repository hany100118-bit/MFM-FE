// Alert.alert 대신 쓰는 공통 함수. react-native-web 의 Alert.alert 는 아무것도 안 하는 빈 함수라서
// 웹에서는 브라우저 기본 창(window.alert / window.confirm)으로 대신 띄운다. 쓰는 법은 Alert.alert 와 같다.
import { Alert, Platform } from 'react-native';

export function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') return Alert.alert(title, message, buttons);

  const text = [title, message].filter(Boolean).join('\n\n');
  const list = buttons?.length ? buttons : [{ text: '확인' }];
  const cancel = list.find((b) => b.style === 'cancel');
  const action = list.find((b) => b.style !== 'cancel');

  // 취소 + 실행 버튼이면 확인/취소 창, 아니면 안내 창
  if (cancel && action) {
    const ok = globalThis.confirm?.(text);
    (ok ? action : cancel).onPress?.();
  } else {
    globalThis.alert?.(text);
    (action || cancel)?.onPress?.();
  }
}
