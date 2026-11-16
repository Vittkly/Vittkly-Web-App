import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export interface OAuthIconProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Excepción autorizada en design-fidelity-artifact.md §6.7: colores oficiales de terceros.
const GOOGLE_BRAND = {
  yellow: '#FFC107',
  red: '#FF3D00',
  green: '#4CAF50',
  blue: '#1976D2',
} as const;

const MICROSOFT_BRAND = {
  red: '#F25022',
  green: '#7FBA00',
  blue: '#00A4EF',
  yellow: '#FFB900',
} as const;

/**
 * Ícono oficial de Google para botones de acceso OAuth.
 */
export function GoogleIcon({ size = 18, style, testID }: OAuthIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="Google"
      style={style}
    >
      <Path
        fill={GOOGLE_BRAND.yellow}
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <Path
        fill={GOOGLE_BRAND.red}
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <Path
        fill={GOOGLE_BRAND.green}
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.7 34.5 27 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <Path
        fill={GOOGLE_BRAND.blue}
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.6C41.8 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </Svg>
  );
}

/**
 * Ícono oficial de Microsoft para botones de acceso OAuth.
 */
export function MicrosoftIcon({ size = 18, style, testID }: OAuthIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 23 23"
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="Microsoft"
      style={style}
    >
      <Rect x="1" y="1" width="10" height="10" fill={MICROSOFT_BRAND.red} />
      <Rect x="12" y="1" width="10" height="10" fill={MICROSOFT_BRAND.green} />
      <Rect x="1" y="12" width="10" height="10" fill={MICROSOFT_BRAND.blue} />
      <Rect x="12" y="12" width="10" height="10" fill={MICROSOFT_BRAND.yellow} />
    </Svg>
  );
}
