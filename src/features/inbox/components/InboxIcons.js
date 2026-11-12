import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../../../shared/theme';

/** 디자인 헤더의 연필(편지 쓰기) 아이콘 */
export function PencilIcon({ size = 22, color = colors.ink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 20h4L19 9l-4-4L4 16z" />
      <Path d="M13 7l4 4" />
    </Svg>
  );
}

/** 안내 배너의 선 자물쇠 (open 이면 고리가 풀린 모양) */
export function OutlineLock({ size = 28, color = colors.butter, open = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="5" y="11" width="14" height="10" rx="2" />
      <Path d={open ? 'M8 11V7a4 4 0 0 1 7.5-2' : 'M8 11V7a4 4 0 0 1 8 0v4'} />
    </Svg>
  );
}
