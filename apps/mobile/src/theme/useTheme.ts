import { useColorScheme } from 'react-native';

import {
  borderWidth,
  colors,
  control,
  duration,
  fontFamilies,
  fontWeights,
  layout,
  opacity,
  radius,
  shadows,
  spacing,
  ThemeColors,
  ThemeMode,
  typography,
} from './tokens';

export interface VittklyTheme {
  scheme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  control: typeof control;
  layout: typeof layout;
  borderWidth: typeof borderWidth;
  opacity: typeof opacity;
  duration: typeof duration;
  fontWeights: typeof fontWeights;
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  shadows: (typeof shadows)[ThemeMode];
}

/**
 * Hook de tema reactivo a las preferencias del sistema (claro / oscuro).
 * Devuelve la paleta correspondiente de `tokens.ts` junto con escalas tipográficas,
 * de espaciado, radios y alturas táctiles (`control.lg = 48`).
 */
export function useTheme(): VittklyTheme {
  const systemScheme = useColorScheme();
  const scheme: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';

  return {
    scheme,
    isDark: scheme === 'dark',
    colors: colors[scheme],
    spacing,
    radius,
    control,
    layout,
    borderWidth,
    opacity,
    duration,
    fontWeights,
    typography,
    fontFamilies,
    shadows: shadows[scheme],
  };
}
