import Svg, { Path } from "react-native-svg";

interface IconProps {
  color?: string;
  size?: number;
  filled?: boolean;
}

export function BackIcon({
  color = "#000",
  size = 24,
  filled = false,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M15.7071 4.29289
        C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711
        L9.41421 12
        L15.7071 18.2929
        C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071
        C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071
        L7.29289 12.7071
        C7.10536 12.5196 7 12.2652 7 12
        C7 11.7348 7.10536 11.4804 7.29289 11.2929
        L14.2929 4.29289
        C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z"
        fill={filled ? color : "none"}
        stroke={!filled ? color : "none"}
        strokeWidth={1.5}
      />
    </Svg>
  );
}
