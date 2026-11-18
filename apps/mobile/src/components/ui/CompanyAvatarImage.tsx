import React, { useState } from 'react';
import { Image, StyleSheet, Text } from 'react-native';

import { getInitials } from '@/features/auth/utils/profile';
import { useTheme } from '@/theme';

export interface CompanyAvatarImageProps {
  name: string;
  menuIconUrl?: string | null;
  logoUrl?: string | null;
  size: number;
  textColor?: string;
  fontSize?: number;
}

/**
 * Contenido visual del avatar circular de empresa en React Native:
 * prioriza `icono_menu_ruta` (`cover`), luego `logo_ruta` (`contain`),
 * y ante error o ausencia muestra las iniciales de la empresa.
 */
export function CompanyAvatarImage({
  name,
  menuIconUrl,
  logoUrl,
  size,
  textColor,
  fontSize = 14,
}: CompanyAvatarImageProps) {
  const { typography, fontFamilies, colors } = useTheme();
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const cleanIcon = menuIconUrl?.trim() || null;
  const cleanLogo = logoUrl?.trim() || null;

  const canUseIcon = Boolean(cleanIcon && !failedUrls.includes(cleanIcon));
  const canUseLogo = Boolean(cleanLogo && !failedUrls.includes(cleanLogo));

  const activeUri = canUseIcon ? cleanIcon : canUseLogo ? cleanLogo : null;
  const isSquareIcon = canUseIcon;

  if (activeUri) {
    return (
      <Image
        source={{ uri: activeUri }}
        accessibilityLabel={`Logo de ${name}`}
        resizeMode={isSquareIcon ? 'cover' : 'contain'}
        onError={() =>
          setFailedUrls((prev) => (prev.includes(activeUri) ? prev : [...prev, activeUri]))
        }
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <Text
      style={[
        typography.bodyStrong,
        {
          fontFamily: fontFamilies.bold,
          color: textColor ?? colors.ink,
          fontSize,
        },
      ]}
    >
      {getInitials(name)}
    </Text>
  );
}

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
});
