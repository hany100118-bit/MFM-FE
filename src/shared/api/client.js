// 백엔드 REST API 호출기. React Native 모듈을 쓰지 않아 Node 에서도 테스트할 수 있다.
// 응답 규칙: 성공 { success: true, data } / 실패 { success: false, error: { code, message, requestId } }

export class ApiError extends Error {
  constructor({ status = 0, code = 'UNKNOWN', message = '알 수 없는 오류가 발생했어요.', requestId = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

function buildUrl(baseUrl, path, query) {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `${url}?${params.join('&')}` : url;
}

/**
 * @param {object} options
 * @param {string} options.baseUrl
 * @param {() => Promise<string|null>} options.getToken  저장된 액세스 토큰
 * @param {() => void} [options.onUnauthorized]          저장된 토큰이 거절됐을 때 (로그아웃 처리)
 */
export function createApiClient({ baseUrl, getToken, onUnauthorized, timeoutMs = 15000, fetchImpl = (...a) => fetch(...a) }) {
  async function request(method, path, { body, query, token } = {}) {
    const usingStoredToken = token === undefined;
    const bearer = usingStoredToken ? await getToken() : token;
    const headers = { Accept: 'application/json' };
    // ngrok 무료 주소는 브라우저 요청에 JSON 대신 경고 페이지를 돌려준다 → 이 헤더로 건너뛴다
    if (/ngrok/.test(baseUrl)) headers['ngrok-skip-browser-warning'] = 'true';
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (bearer) headers.Authorization = `Bearer ${bearer}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
      res = await fetchImpl(buildUrl(baseUrl, path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      const timedOut = err?.name === 'AbortError';
      throw new ApiError({
        code: timedOut ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR',
        message: timedOut ? '서버 응답이 늦어요. 잠시 후 다시 시도해 주세요.' : '인터넷 연결을 확인해 주세요.',
      });
    } finally {
      clearTimeout(timer);
    }

    let payload = null;
    try {
      payload = await res.json();
    } catch {
      // 없는 주소 등 서버 기본 HTML 응답
      throw new ApiError({ status: res.status, code: 'UNEXPECTED_RESPONSE', message: '요청을 처리할 수 없어요.' });
    }

    if (!res.ok || payload?.success !== true) {
      const e = payload?.error || {};
      if (res.status === 401 && usingStoredToken && bearer && onUnauthorized) onUnauthorized();
      throw new ApiError({ status: res.status, code: e.code, message: e.message, requestId: e.requestId });
    }
    return payload.data;
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, body, opts) => request('POST', path, { ...opts, body }),
    patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
    del: (path, opts) => request('DELETE', path, opts),
  };
}
