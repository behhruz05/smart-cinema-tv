import React from 'react';
import Svg, { Circle, Path, Rect, Line, Ellipse } from 'react-native-svg';

interface Props {
  slug: string;
  size?: number;
  color?: string;
}

// Barchasi
function AllIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.8} />
      <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.8} />
      <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.8} />
      <Rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

// Sport
function SportIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 3C12 3 9.5 6.5 9.5 12C9.5 17.5 12 21 12 21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M12 3C12 3 14.5 6.5 14.5 12C14.5 17.5 12 21 12 21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

// Yangiliklar / Xabar / News
function NewsIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6C4 4.9 4.9 4 6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="8" y1="15" x2="13" y2="15" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

// Milliy / National
function NationalIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="3" x2="5" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M5 4l14 4-14 4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Bolalar / Kids / Children
function KidsIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 4.8 5.3.8-3.85 3.75.91 5.3L12 14.25l-4.76 2.38.91-5.3L4.3 7.6l5.3-.8L12 2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Musiqa / Music
function MusicIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18V5l12-2v13"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={1.8} />
      <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

// Kino / Film / Movie
function MovieIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M7 6V4M12 6V4M17 6V4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M10 11l5 3-5 3v-6z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Eglantirish / Entertainment
function EntertainmentIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="9" r="6" stroke={color} strokeWidth={1.8} />
      <Circle cx="15" cy="15" r="6" stroke={color} strokeWidth={1.8} />
      <Path d="M7 9c.5-1.5 2-1.5 2 0" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M13 15c.5-1.5 2-1.5 2 0" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

// Serial
function SerialIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="3" width="20" height="13" rx="2" stroke={color} strokeWidth={1.8} />
      <Line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="16" x2="12" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M10 9.5l4 2-4 2v-4z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Hujjatli / Documentary
function DocIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth={1.8} />
      <Line x1="12" y1="3" x2="12" y2="8.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="15.5" x2="12" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="3" y1="12" x2="8.5" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="15.5" y1="12" x2="21" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

// Diniy / Religious
function ReligiousIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C9 3 7.5 5.5 7.5 8c0 4 4.5 7 4.5 7s4.5-3 4.5-7C16.5 5.5 15 3 12 3z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M19 7a3 3 0 01-3 3"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Line x1="12" y1="15" x2="12" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

// Default — TV
function DefaultTvIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="20" height="13" rx="2" stroke={color} strokeWidth={1.8} />
      <Path d="M8 7L12 3l4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function resolveIcon(slug: string): (p: { size: number; color: string }) => React.ReactElement {
  const s = slug.toLowerCase();

  if (s === 'all') return AllIcon;

  if (s.includes('sport') || s.includes('futbol') || s.includes('football')) return SportIcon;

  if (
    s.includes('news') || s.includes('xabar') || s.includes('yangilik') ||
    s.includes('novost') || s.includes('akhbar')
  ) return NewsIcon;

  if (
    s.includes('national') || s.includes('milliy') || s.includes('davlat') ||
    s.includes('uzb') || s.includes('o\'zb')
  ) return NationalIcon;

  if (
    s.includes('kid') || s.includes('child') || s.includes('bola') ||
    s.includes('det') || s.includes('yosh')
  ) return KidsIcon;

  if (
    s.includes('music') || s.includes('musiq') || s.includes('muzik') ||
    s.includes('muz') || s.includes('song')
  ) return MusicIcon;

  if (
    s.includes('movie') || s.includes('kino') || s.includes('film') ||
    s.includes('cinema')
  ) return MovieIcon;

  if (
    s.includes('serial') || s.includes('series') || s.includes('seriya')
  ) return SerialIcon;

  if (
    s.includes('entertain') || s.includes('eglantir') || s.includes('show') ||
    s.includes('humor') || s.includes('comedy')
  ) return EntertainmentIcon;

  if (
    s.includes('doc') || s.includes('hujjat') || s.includes('discovery')
  ) return DocIcon;

  if (
    s.includes('din') || s.includes('relig') || s.includes('islam') ||
    s.includes('mazhab')
  ) return ReligiousIcon;

  return DefaultTvIcon;
}

export function CategoryIcon({ slug, size = 18, color = '#fff' }: Props) {
  const Icon = resolveIcon(slug);
  return <Icon size={size} color={color} />;
}
