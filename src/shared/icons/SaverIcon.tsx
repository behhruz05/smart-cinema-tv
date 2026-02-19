import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

export function SavedIcon({
  color = '#363853',
  size = 24,
  filled = false,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M19 19.2674V7.84496
        C19 5.64147 17.4253 3.74489 15.2391 3.31522
        C13.1006 2.89493 10.8994 2.89493 8.76089 3.31522
        C6.57467 3.74489 5 5.64147 5 7.84496
        V19.2674
        C5 20.6038 6.46752 21.4355 7.63416 20.7604
        L10.8211 18.9159
        C11.5492 18.4945 12.4508 18.4945 13.1789 18.9159
        L16.3658 20.7604
        C17.5325 21.4355 19 20.6038 19 19.2674Z"
        stroke={!filled ? color : "none"}
        fill={filled ? color : "none"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
