/**
 * Índice centralizado y fuertemente tipado de recursos de marca de Vittkly:
 * - Fuentes TrueType (Manrope 400, 500, 600, 700, 800)
 * - Íconos nativos de aplicación y favicon
 * - Logos e isotipos vectoriales (SVG) y rasterizados (PNG 600px / 1200px / monogramas)
 */

export const fontAssets = {
  'Manrope-Regular': require('../../assets/fonts/Manrope-Regular.ttf'),
  'Manrope-Medium': require('../../assets/fonts/Manrope-Medium.ttf'),
  'Manrope-SemiBold': require('../../assets/fonts/Manrope-SemiBold.ttf'),
  'Manrope-Bold': require('../../assets/fonts/Manrope-Bold.ttf'),
  'Manrope-ExtraBold': require('../../assets/fonts/Manrope-ExtraBold.ttf'),
} as const;

export const appImages = {
  icon: require('../../assets/images/icon.png'),
  adaptiveIcon: require('../../assets/images/adaptive-icon.png'),
  favicon: require('../../assets/images/favicon.png'),
} as const;

export const svgLogos = {
  wordmark: require('../../assets/logos/vittkly-wordmark.svg'),
  wordmarkWhite: require('../../assets/logos/vittkly-wordmark-white.svg'),
  wordmarkTinta: require('../../assets/logos/vittkly-wordmark-tinta.svg'),
  monogram: require('../../assets/logos/vittkly-monograma.svg'),
  monogramWhite: require('../../assets/logos/vittkly-monograma-white.svg'),
} as const;

export const pngLogos = {
  wordmark: {
    color: {
      w600: require('../../assets/images/logos-png/vittkly-logo-color-600px.png'),
      w1200: require('../../assets/images/logos-png/vittkly-logo-color-1200px.png'),
    },
    white: {
      w600: require('../../assets/images/logos-png/vittkly-logo-blanco-600px.png'),
      w1200: require('../../assets/images/logos-png/vittkly-logo-blanco-1200px.png'),
    },
    tinta: {
      w600: require('../../assets/images/logos-png/vittkly-logo-tinta-600px.png'),
      w1200: require('../../assets/images/logos-png/vittkly-logo-tinta-1200px.png'),
    },
    onDark: {
      w600: require('../../assets/images/logos-png/vittkly-logo-sobre-oscuro-600px.png'),
      w1200: require('../../assets/images/logos-png/vittkly-logo-sobre-oscuro-1200px.png'),
    },
  },
  monogram: {
    color: {
      w256: require('../../assets/images/logos-png/vittkly-monograma-color-256px.png'),
      w512: require('../../assets/images/logos-png/vittkly-monograma-color-512px.png'),
      w1024: require('../../assets/images/logos-png/vittkly-monograma-color-1024px.png'),
    },
    white: {
      w256: require('../../assets/images/logos-png/vittkly-monograma-blanco-256px.png'),
      w512: require('../../assets/images/logos-png/vittkly-monograma-blanco-512px.png'),
      w1024: require('../../assets/images/logos-png/vittkly-monograma-blanco-1024px.png'),
    },
    tinta: {
      w256: require('../../assets/images/logos-png/vittkly-monograma-tinta-256px.png'),
      w512: require('../../assets/images/logos-png/vittkly-monograma-tinta-512px.png'),
      w1024: require('../../assets/images/logos-png/vittkly-monograma-tinta-1024px.png'),
    },
    onDark: {
      w256: require('../../assets/images/logos-png/vittkly-monograma-sobre-oscuro-256px.png'),
      w512: require('../../assets/images/logos-png/vittkly-monograma-sobre-oscuro-512px.png'),
      w1024: require('../../assets/images/logos-png/vittkly-monograma-sobre-oscuro-1024px.png'),
    },
  },
} as const;

export type FontName = keyof typeof fontAssets;
export type SvgLogoKey = keyof typeof svgLogos;

export const VittklyAssets = {
  fonts: fontAssets,
  appImages,
  svgLogos,
  pngLogos,
} as const;

export default VittklyAssets;
