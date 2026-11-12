// 안 읽은 알림 수를 앱 전체(홈 종 아이콘, 하단 탭 배지)에서 같이 쓴다. 서버 값이 기준이라 읽으면 바로 줄어든다.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { notificationsApi } from './api';

const UnreadContext = createContext({ unreadCount: 0, refreshUnread: async () => {}, setUnreadCount: () => {} });

export function UnreadProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const refreshUnread = useCallback(async () => {
    try {
      const r = await notificationsApi.list({ limit: 1 });
      setUnreadCount(r.unreadCount);
    } catch {
      // 배지는 보조 정보라 실패해도 화면을 막지 않는다
    }
  }, []);
  const value = useMemo(() => ({ unreadCount, refreshUnread, setUnreadCount }), [unreadCount, refreshUnread]);
  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export const useUnread = () => useContext(UnreadContext);
