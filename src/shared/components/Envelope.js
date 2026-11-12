import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

/**
 * 디자인(피그마 HTML)의 편지 봉투 SVG 그대로.
 *   sealed: 자물쇠가 달린 봉인 봉투 (64x48)
 *   dot:    가운데 둥근 씰이 찍힌 봉투 (dot 에 색을 넘긴다. 예: colors.violet)
 *   strokeWidth: 디자인에서 크기에 따라 2 / 2.5 / 3 을 쓴다
 */
export function Envelope({ width = 44, fill = colors.white, sealed = false, dot = null, strokeWidth = 2, lockFill = colors.butter }) {
  if (sealed) {
    return (
      <Svg width={width} height={width * 0.75} viewBox="0 0 64 48">
        <Rect x="1" y="5" width="62" height="42" rx="6" fill={fill} stroke={colors.ink} strokeWidth={strokeWidth} />
        <Path d="M2 8l30 22 30-22" fill="none" stroke={colors.ink} strokeWidth={strokeWidth} />
        <Rect x="24" y="20" width="16" height="13" rx="3" fill={lockFill} stroke={colors.ink} strokeWidth={strokeWidth} />
        <Path d="M27 20v-4a5 5 0 0 1 10 0v4" fill="none" stroke={colors.ink} strokeWidth={strokeWidth} />
      </Svg>
    );
  }
  return (
    <Svg width={width} height={width * (44 / 64)} viewBox="0 0 64 44">
      <Rect x="1" y="1" width="62" height="42" rx="6" fill={fill} stroke={colors.ink} strokeWidth={strokeWidth} />
      <Path d="M2 4l30 22 30-22" fill="none" stroke={colors.ink} strokeWidth={strokeWidth} />
      {dot ? <Circle cx="32" cy="25" r="6" fill={dot} stroke={colors.ink} strokeWidth={strokeWidth} /> : null}
    </Svg>
  );
}

/** 열린 봉투 (편지 열람 화면) */
export function OpenEnvelope({ width = 64 }) {
  return (
    <Svg width={width} height={width * 0.75} viewBox="0 0 64 48">
      <Path d="M2 20l30-18 30 18v26H2z" fill={colors.white} stroke={colors.ink} strokeWidth="3" strokeLinejoin="round" />
      <Path d="M2 20l30 18 30-18" fill="none" stroke={colors.ink} strokeWidth="3" />
    </Svg>
  );
}

/** 짬처리 로고: 노란 봉투 + 시계 (clock=false 면 시계 바늘 없는 작은 버전) */
export function LogoMark({ size = 104, clock = true }) {
  if (!clock) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x="10" y="28" width="72" height="50" rx="10" fill={colors.butter} stroke={colors.ink} strokeWidth="5" />
        <Path d="M13 33l35 26 35-26" fill="none" stroke={colors.ink} strokeWidth="5" strokeLinejoin="round" />
        <Circle cx="78" cy="28" r="16" fill={colors.lavenderStrong} stroke={colors.ink} strokeWidth="5" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="짬처리 로고">
      <Rect x="14" y="32" width="68" height="46" rx="8" fill={colors.butter} stroke={colors.ink} strokeWidth="3" />
      <Path d="M16 36l32 24 32-24" fill="none" stroke={colors.ink} strokeWidth="3" strokeLinejoin="round" />
      <Circle cx="76" cy="30" r="15" fill={colors.lavenderStrong} stroke={colors.ink} strokeWidth="3" />
      <Path d="M76 22v8l5 4" fill="none" stroke={colors.ink} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}
