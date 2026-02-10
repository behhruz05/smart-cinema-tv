import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export const InfoIcon: React.FC<Props> = ({
  size = 24,
  color = '#fff',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M12 17V11"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle
        cx="12"
        cy="9"
        r="1"
        fill={color}
      />
    </Svg>
  );
};