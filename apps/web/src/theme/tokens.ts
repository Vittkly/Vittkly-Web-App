/**
 * Re-exportación y fachadas de tokens de diseño para Vittkly SaaS Web.
 * Conectado con la fuente única de verdad canónica `@vittkly/ui-tokens`.
 * Mantiene compatibilidad 1:1 con todas las importaciones existentes.
 */

import {
  colors as canonicalColors,
  spacingCss,
  radiusCss,
  controlCss,
  type ThemeMode,
} from "@vittkly/ui-tokens";

export const colors = canonicalColors;
export const spacing = spacingCss;
export const radius = radiusCss;
export const control = controlCss;

export const shadows = {
  light: {
    shadow1: "0 1px 2px rgba(14,42,59,0.08)",
    shadow2: "0 8px 24px rgba(14,42,59,0.14)",
  },
  dark: {
    shadow1: "0 1px 2px rgba(0,0,0,0.4)",
    shadow2: "0 8px 24px rgba(0,0,0,0.5)",
  },
} as const;

export const typography = {
  display: {
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: "800",
    letterSpacing: "-0.015em",
  },
  title1: {
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: "800",
    letterSpacing: "-0.01em",
  },
  title2: {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: "700",
  },
  title3: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: "700",
  },
  body: {
    fontSize: "15px",
    lineHeight: "24px",
    fontWeight: "400",
  },
  bodyLg: {
    fontSize: "17px",
    lineHeight: "26px",
    fontWeight: "400",
  },
  bodyStrong: {
    fontSize: "15px",
    lineHeight: "24px",
    fontWeight: "600",
  },
  small: {
    fontSize: "13px",
    lineHeight: "20px",
    fontWeight: "400",
  },
  label: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  button: {
    fontSize: "15px",
    lineHeight: "20px",
    fontWeight: "700",
  },
  code: {
    fontSize: "13px",
    lineHeight: "20px",
    fontWeight: "400",
  },
} as const;

export type { ThemeMode };
export type ThemeColors = (typeof colors)[ThemeMode];

export const tokens = {
  colors,
  spacing,
  radius,
  control,
  shadows,
  typography,
} as const;
