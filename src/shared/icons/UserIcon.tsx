import Svg, { Circle, Ellipse } from "react-native-svg";

interface IconProps {
  color?: string;
  size?: number;
  filled?: boolean;
}

export function UserIcon({
  color = "#1C274C",
  size = 24,
  filled = false,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      
      <Circle
        cx="12"
        cy="6"
        r="4"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />

      <Ellipse
        cx="12"
        cy="17"
        rx="7"
        ry="4"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />
      
    </Svg>
  );
}
