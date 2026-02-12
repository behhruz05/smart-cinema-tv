import Svg, { Path } from "react-native-svg";

interface IconProps {
  color?: string;
  size?: number;
  filled?: boolean;
}

export function SearchFoundIcon({
  color = "#000",
  size = 24,
  filled = false,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M21 21L15.8033 15.8033
        M7.5 10.5H13.5
        M15.8033 15.8033
        C17.1605 14.4461 18 12.5711 18 10.5
        C18 6.35786 14.6421 3 10.5 3
        C6.35786 3 3 6.35786 3 10.5
        C3 14.6421 6.35786 18 10.5 18
        C12.5711 18 14.4461 17.1605 15.8033 15.8033Z"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </Svg>
  );
}
