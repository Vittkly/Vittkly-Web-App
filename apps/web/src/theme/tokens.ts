/**
 * Fuente única de verdad de tokens de diseño para Vittkly SaaS Web.
 * Sincronizado 1:1 con tokens.json del UI Kit oficial de Vittkly.
 * REGLA INMUTABLE: Prohibido alterar o inventar valores HEX, espaciados o radios.
 */

export const colors = {
  light: {
    surface: '#F3F8FA',
    surfaceRaised: '#FFFFFF',
    surfaceSunken: '#EAF2F6',
    line: '#DDE7EC',
    lineStrong: '#778B97',
    ink: '#0E2A3B',
    inkMuted: '#52626D',
    vitta: '#2AA8DE',
    kleanly: '#3EC49B',
    primary: '#157AA8',
    primaryHover: '#0F6A93',
    onPrimary: '#FFFFFF',
    primaryInk: '#106C97',
    primarySoft: '#E3F4FB',
    success: '#3EC49B',
    onSuccess: '#0E2A3B',
    successInk: '#146F55',
    successSoft: '#E2F6EF',
    warning: '#F2A93B',
    onWarning: '#0E2A3B',
    warningInk: '#8A5A0B',
    warningSoft: '#FDF1DC',
    danger: '#B3322C',
    onDanger: '#FFFFFF',
    dangerInk: '#B3322C',
    dangerSoft: '#FDE8E7',
    focus: '#157AA8',
    tenantAccent: '#3EC49B',
    onTenantAccent: '#0E2A3B',
    tenantAccentSoft: '#E2F6EF',
    heroFrom: '#0E2A3B',
    heroTo: '#15425C',
    heroInk: '#FFFFFF',
  },
  dark: {
    surface: '#0A1C27',
    surfaceRaised: '#10283A',
    surfaceSunken: '#081620',
    line: '#1F3B4E',
    lineStrong: '#6A8CA1',
    ink: '#E7F1F6',
    inkMuted: '#9DB2BE',
    vitta: '#2AA8DE',
    kleanly: '#3EC49B',
    primary: '#5BC0EA',
    primaryHover: '#7FCFF0',
    onPrimary: '#0A1C27',
    primaryInk: '#5BC0EA',
    primarySoft: '#0F3347',
    success: '#3EC49B',
    onSuccess: '#0A1C27',
    successInk: '#4FD1A9',
    successSoft: '#0E3A2E',
    warning: '#F2A93B',
    onWarning: '#0A1C27',
    warningInk: '#F2B45A',
    warningSoft: '#3D2A0B',
    danger: '#F08A84',
    onDanger: '#0A1C27',
    dangerInk: '#F08A84',
    dangerSoft: '#3F1614',
    focus: '#5BC0EA',
    tenantAccent: '#3EC49B',
    onTenantAccent: '#0A1C27',
    tenantAccentSoft: '#0E3A2E',
    heroFrom: '#071825',
    heroTo: '#0F3347',
    heroInk: '#E7F1F6',
  },
} as const;

export const spacing = {
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space6: '24px',
  space8: '32px',
  space12: '48px',
} as const;

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '24px',
  pill: '999px',
} as const;

export const control = {
  sm: '32px',
  md: '40px',
  lg: '48px',
} as const;

export const shadows = {
  light: {
    shadow1: '0 1px 2px rgba(14,42,59,0.08)',
    shadow2: '0 8px 24px rgba(14,42,59,0.14)',
  },
  dark: {
    shadow1: '0 1px 2px rgba(0,0,0,0.4)',
    shadow2: '0 8px 24px rgba(0,0,0,0.5)',
  },
} as const;

export const typography = {
  display: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: '800',
    letterSpacing: '-0.015em',
  },
  title1: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: '800',
    letterSpacing: '-0.01em',
  },
  title2: {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: '700',
  },
  title3: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: '700',
  },
  body: {
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: '400',
  },
  bodyLg: {
    fontSize: '17px',
    lineHeight: '26px',
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: '600',
  },
  small: {
    fontSize: '13px',
    lineHeight: '20px',
    fontWeight: '400',
  },
  label: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '600',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: '700',
  },
  code: {
    fontSize: '13px',
    lineHeight: '20px',
    fontWeight: '400',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = (typeof colors)[ThemeMode];

export const tokens = {
  colors,
  spacing,
  radius,
  control,
  shadows,
  typography,
} as const;
