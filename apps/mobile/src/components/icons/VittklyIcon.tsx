import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme';

import { VITTKLY_ICON_PATHS } from './iconPaths';
import type { VittklyIconProps } from './types';

/**
 * Componente base para todos los íconos vectoriales de línea del sistema Vittkly.
 * Usa `react-native-svg` y hereda por defecto `colors.ink` del tema activo.
 */
export function VittklyIcon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  style,
  testID,
  accessibilityLabel,
}: VittklyIconProps) {
  const { colors } = useTheme();
  const pathData = VITTKLY_ICON_PATHS[name] ?? VITTKLY_ICON_PATHS.info;
  const resolvedColor = color ?? colors.ink;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      testID={testID}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessible={Boolean(accessibilityLabel)}
      style={style}
    >
      <Path
        d={pathData}
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
