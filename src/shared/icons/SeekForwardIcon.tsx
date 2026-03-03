import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

export function SeekForwardIcon({ color = '#fff', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 6L19 12L13 18V6Z" fill={color} />
      <Path d="M5 6L11 12L5 18V6Z" fill={color} opacity={0.9} />
      <Path d="M21 5.5V18.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
