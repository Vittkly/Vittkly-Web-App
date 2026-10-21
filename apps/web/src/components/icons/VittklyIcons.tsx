import React from 'react';

export const VITTKLY_ICON_PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  users:
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3',
  face: 'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 10v1M15 10v1M12 10v3.5h-1M9 16a4 4 0 0 0 6 0',
  back: 'M19 12H5M11 18l-6-6 6-6',
  forward: 'M9 18l6-6-6-6',
  x: 'M6 6l12 12M18 6L6 18',
  alert:
    'M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  wifioff:
    'M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.3-2.6M19 12.9a10 10 0 0 0-2.2-1.6M1.4 9a15 15 0 0 1 4.5-2.8M22.6 9A15 15 0 0 0 10.7 5.1M12 20h.01',
  sync: 'M20 11A8 8 0 0 0 5.3 6.7L3 9M3 4v5h5M4 13a8 8 0 0 0 14.7 4.3L21 15M21 20v-5h-5',
  circle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  grid: 'M4 6h16M4 12h16M4 18h16',
  home: 'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  briefcase:
    'M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21a8 8 0 0 1 16 0',
  pin: 'M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  route: 'M4 19c3 0 3-14 6-14s3 14 6 14 3-14 6-14',
  building: 'M4 21V5a1 1 0 0 1 1-1h6v17M11 21h9V11h-9M7 7h.01M7 11h.01M7 15h.01',
  camera:
    'M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  pen: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3zM13.5 6.5l3 3',
  star: 'M12 3l2.6 5.6 6 0.7-4.5 4.1 1.2 6-5.3-3.1-5.3 3.1 1.2-6-4.5-4.1 6-.7z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  mapwide: 'M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z',
  logout: 'M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  truck:
    'M3 17V7a1 1 0 0 1 1-1h9v11H4a1 1 0 0 1-1-1zM13 10h4l3 3v4h-7v-7zM6.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  chevron: 'M9 18l6-6-6-6',
  doc: 'M14 3v5h5M6 3h8l5 5v13H6z',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h3l6 4V6l-6 4H4a1 1 0 0 0-1 1zM17 9a4 4 0 0 1 0 6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  phone:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  nav: 'M3 11l18-8-8 18-2-8-8-2z',
  message:
    'M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.3 8.3 0 0 1-4-1L3 20l1-5.5a8.3 8.3 0 0 1-1-4 8.5 8.5 0 0 1 17 .5z',
  checksquare: 'M9 11l3 3 7-7M20 11v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
  pause: 'M8 5v14M16 5v14',
  play: 'M8 5l11 7-11 7z',
  calendar:
    'M7 2v4M17 2v4M3 9h18M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  repeat: 'M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
  card: 'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20M6 15h4',
  heart:
    'M12 21s-7.2-4.4-9.8-8.8C.6 8.8 1.8 5 5.5 4.3c2.3-.4 4.4.7 6.5 2.9 2.1-2.2 4.2-3.3 6.5-2.9 3.7.7 4.9 4.5 3.3 7.9C19.2 16.6 12 21 12 21z',
  barchart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings:
    'M10.3 4.3c.4-1.8 2.9-1.8 3.4 0 .3 1.2 1.7 1.8 2.7 1.1 1.5-.9 3.3.8 2.4 2.4-.7 1-.1 2.4 1.1 2.7 1.8.4 1.8 2.9 0 3.4-1.2.3-1.8 1.7-1.1 2.7.9 1.5-.8 3.3-2.4 2.4-1-.7-2.4-.1-2.7 1.1-.4 1.8-2.9 1.8-3.4 0-.3-1.2-1.7-1.8-2.7-1.1-1.5.9-3.3-.8-2.4-2.4.7-1 .1-2.4-1.1-2.7-1.8-.4-1.8-2.9 0-3.4 1.2-.3 1.8-1.7 1.1-2.7-.9-1.5.8-3.3 2.4-2.4 1 .7 2.4.1 2.7-1.1zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
} as const;

export type VittklyIconName = keyof typeof VITTKLY_ICON_PATHS;

export interface VittklyIconProps extends React.SVGProps<SVGSVGElement> {
  name: VittklyIconName;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export function VittklyIcon({
  name,
  size = 20,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  ...props
}: VittklyIconProps) {
  const path = VITTKLY_ICON_PATHS[name] || VITTKLY_ICON_PATHS.info;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path d={path} />
    </svg>
  );
}
