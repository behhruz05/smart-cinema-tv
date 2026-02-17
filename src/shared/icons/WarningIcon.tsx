import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface IconProps {
  color?: string;
  size?: number;
}

export function WarningIcon({
  color = "#FDB022", // Warning yellow
  size = 24,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      
      {/* Triangle Border */}
      <Path
        d="M18.642 20.934H5.385A2.5 2.5 0 0 1 3.163 17.29L9.792 4.421a2.5 2.5 0 0 1 4.444 0L20.865 17.29a2.5 2.5 0 0 1-2.223 3.644Z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />

      {/* Vertical Line */}
      <Path
        d="M12 8.75V14.75"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Dot */}
      <Circle
        cx="12"
        cy="17"
        r="1"
        fill={color}
      />
    </Svg>
  );
}
