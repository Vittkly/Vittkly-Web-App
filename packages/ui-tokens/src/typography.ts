/**
 * Tokens tipográficos y pesos de fuentes del UI Kit de Vittkly.
 */

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

export const fontFamiliesBase = {
  sans: 'Manrope',
  mono: 'JetBrains Mono',
} as const;

export const typographyMetrics = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.48,
  },
  title1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.24,
  },
  title2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  title3: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodyLg: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  small: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.72,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  code: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  timerDisplay: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
} as const;
