import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * 화면에 들어올 때마다 데이터를 불러오는 공통 훅.
 *   const { data, loading, error, refreshing, refresh, reload } = useApiQuery(() => api.get(...), [deps]);
 * deps 가 바뀌거나 화면에 다시 들어오면 새로 불러오고, 늦게 도착한 이전 응답은 버린다.
 */
export function useApiQuery(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null, refreshing: false });
  const seq = useRef(0);
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; });
  const key = JSON.stringify(deps);

  const run = useCallback(async (mode) => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: mode === 'load' && !s.data, refreshing: mode === 'refresh', error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === seq.current) setState({ data, loading: false, error: null, refreshing: false });
    } catch (error) {
      if (id === seq.current) setState((s) => ({ ...s, loading: false, refreshing: false, error }));
    }
  }, []);

  useFocusEffect(useCallback(() => {
    run('load');
    return () => { seq.current += 1; };
    // key(직렬화한 deps)는 일부러 넣는다: 분류·정렬 같은 조건이 바뀌면 다시 불러와야 한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, key]));

  const setData = useCallback((fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })), []);
  return { ...state, refresh: () => run('refresh'), reload: () => run('load'), setData };
}
