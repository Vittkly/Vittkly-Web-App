'use client';

import Image from 'next/image';

export type LogoVariant = 'wordmark' | 'monogram';
export type LogoTone = 'color' | 'white' | 'tinta';

export interface VittklyLogoProps {
  variant?: LogoVariant;
  tone?: LogoTone;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

const LOGO_SRC: Record<LogoVariant, Record<LogoTone, string>> = {
  wordmark: {
    color: '/brand/vittkly-wordmark.svg',
    white: '/brand/vittkly-wordmark-white.svg',
    tinta: '/brand/vittkly-wordmark-tinta.svg',
  },
  monogram: {
    color: '/brand/vittkly-monograma.svg',
    white: '/brand/vittkly-monograma-white.svg',
    tinta: '/brand/vittkly-monograma.svg',
  },
};

// Aspect ratios from source SVGs:
// wordmark: viewBox 0 0 1750 760 => 1750/760 ≈ 2.302
// monogram: viewBox 12 12 685 551 => 685/551 ≈ 1.243
const ASPECT_RATIOS: Record<LogoVariant, number> = {
  wordmark: 1750 / 760,
  monogram: 685 / 551,
};

export function VittklyLogo({
  variant = 'wordmark',
  tone = 'color',
  height = 36,
  className = '',
  alt = 'Vittkly',
  priority = false,
}: VittklyLogoProps) {
  const src = LOGO_SRC[variant][tone] || LOGO_SRC.wordmark.color;
  const ratio = ASPECT_RATIOS[variant];
  const width = Math.round(height * ratio);

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ height, width }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        unoptimized
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export default VittklyLogo;
