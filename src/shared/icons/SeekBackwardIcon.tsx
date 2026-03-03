import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

export function SeekBackwardIcon({ color = '#fff', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 6L5 12L11 18V6Z" fill={color} />
      <Path d="M19 6L13 12L19 18V6Z" fill={color} opacity={0.9} />
      <Path d="M3 5.5V18.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
