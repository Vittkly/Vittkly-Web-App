/**
 * Escalas y métricas base del UI Kit de Vittkly.
 */

export const spacingNumbers = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space6: 24,
  space8: 32,
  space12: 48,
} as const;

export const spacingCss = {
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space6: '24px',
  space8: '32px',
  space12: '48px',
} as const;

export const radiusNumbers = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 24,
  pill: 999,
} as const;

export const radiusCss = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '24px',
  pill: '999px',
} as const;

export const controlNumbers = {
  sm: 32,
  md: 40,
  lg: 48,
} as const;

export const controlCss = {
  sm: '32px',
  md: '40px',
  lg: '48px',
} as const;

export const layout = {
  formMaxWidth: 320,
  contentMaxWidth: 360,
  keypadWidth: 280,
  cardGap: 12,
} as const;

export const borderWidth = {
  none: 0,
  thin: 1,
  emphasis: 1.5,
  dot: 2,
  focus: 2,
} as const;

export const opacity = {
  disabled: 0.4,
  subtle: 0.45,
  dim: 0.5,
  pressed: 0.6,
  hover: 0.8,
  full: 1,
} as const;

export const duration = {
  instant: 150,
  fast: 200,
  normal: 300,
  progress: 900,
  splashHold: 950,
} as const;
