// 서버 오류 코드 → 화면에 보여줄 문장. 서버가 준 4xx 문장이 있으면 그걸 우선 쓴다.
const BY_CODE = {
  NETWORK_ERROR: '인터넷 연결을 확인해 주세요.',
  NETWORK_TIMEOUT: '서버 응답이 늦어요. 잠시 후 다시 시도해 주세요.',
  DATABASE_UNAVAILABLE: '서비스를 잠시 이용할 수 없어요. 잠시 후 다시 시도해 주세요.',
  SERVICE_SHUTTING_DOWN: '서비스를 잠시 이용할 수 없어요. 잠시 후 다시 시도해 주세요.',
  INTERNAL_SERVER_ERROR: '문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
  KAKAO_BAD_GATEWAY: '카카오 로그인 서버와 연결이 원활하지 않아요.',
  KAKAO_TIMEOUT: '카카오 로그인 응답이 늦어요. 다시 시도해 주세요.',
  EMAIL_BAD_GATEWAY: '인증 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
  EMAIL_TIMEOUT: '인증 메일 발송이 늦어지고 있어요.',
  UNAUTHORIZED: '다시 로그인해 주세요.',
};

export function errorMessage(err) {
  if (!err) return '';
  const status = err.status || 0;
  if (status >= 400 && status < 500 && err.message) return err.message;
  return BY_CODE[err.code] || err.message || '문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
}

/** 503 처럼 잠시 뒤 다시 하면 되는 오류인가 */
export const isRetryable = (err) => ['NETWORK_ERROR', 'NETWORK_TIMEOUT', 'DATABASE_UNAVAILABLE', 'SERVICE_SHUTTING_DOWN'].includes(err?.code);
