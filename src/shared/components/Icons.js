// 디자인(피그마 HTML)의 24x24 선 아이콘을 그대로 옮긴 것. <Icon name="bell" size={22} color={colors.ink} />
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

const ICONS = {
  home: { w: 2, join: true, d: <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /> },
  mail: { w: 2, join: true, d: <><Rect x="3" y="5" width="18" height="14" rx="2" /><Path d="M3 7l9 6 9-6" /></> },
  archive: { w: 2, join: true, d: <><Rect x="3" y="4" width="18" height="5" rx="1" /><Path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></> },
  bell: { w: 2, join: true, cap: true, d: <><Path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z" /><Path d="M10 21h4" /></> },
  plus: { w: 2.6, cap: true, d: <Path d="M12 5v14M5 12h14" /> },
  back: { w: 2.2, cap: true, join: true, d: <Path d="M15 5l-7 7 7 7" /> },
  search: { w: 2, cap: true, d: <><Circle cx="11" cy="11" r="7" /><Path d="M20 20l-4-4" /></> },
  sort: { w: 2, cap: true, d: <Path d="M4 7h16M7 12h10M10 17h4" /> },
  close: { w: 2.2, cap: true, d: <Path d="M6 6l12 12M18 6L6 18" /> },
  send: { w: 2.2, join: true, d: <><Path d="M21 3L3 10l7 3 3 7z" /><Path d="M10 13l5-5" /></> },
  check: { w: 2.6, cap: true, join: true, d: <Path d="M5 12l5 5 9-10" /> },
  chevronDown: { w: 2.6, cap: true, join: true, d: <Path d="M6 9l6 6 6-6" /> },
  clock: { w: 2.4, cap: true, d: <><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></> },
  image: { w: 2, join: true, d: <><Rect x="3" y="5" width="18" height="14" rx="2" /><Circle cx="9" cy="10" r="2" /><Path d="M21 16l-5-5-9 8" /></> },
  camera: { w: 2.2, join: true, d: <><Path d="M4 8h3l2-3h6l2 3h3v11H4z" /><Circle cx="12" cy="13" r="3.5" /></> },
  userPlus: { w: 2.2, cap: true, join: true, d: <><Circle cx="10" cy="8" r="4" /><Path d="M3 20a7 7 0 0 1 14 0M19 8v6M16 11h6" /></> },
};

export function Icon({ name, size = 22, color = colors.ink, strokeWidth }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth ?? icon.w}
      strokeLinecap={icon.cap ? 'round' : undefined} strokeLinejoin={icon.join ? 'round' : undefined}
     >
      {icon.d}
    </Svg>
  );
}

/** 카카오 말풍선 로고 */
export function KakaoIcon({ size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.5.1 1 .1 1.4.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" fill="#191919" />
    </Svg>
  );
}

// 기존 이름 유지 (홈 화면 등에서 사용)
export function BellIcon({ color = colors.ink, size = 22 }) {
  return <Icon name="bell" size={size} color={color} />;
}

/** 자물쇠 (수신함 안내 띠). open 이면 고리가 열린 모양 */
export function LockIcon({ color = colors.butter, size = 22, open = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
     >
      <Rect x="5" y="11" width="14" height="10" rx="2" fill={color} />
      <Path d={open ? 'M8 11V7a4 4 0 0 1 7.5-2' : 'M8 11V7a4 4 0 0 1 8 0v4'} />
    </Svg>
  );
}
