import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { SyncIcon, WifiOffIcon } from '@/components/icons';
import { useTheme } from '@/theme/useTheme';

export type ConnectionStatus = 'offline' | 'syncing';
export type ConnectionBannerVariant = 'surface' | 'hero';

export interface ConnectionBannerProps {
  status?: ConnectionStatus;
  variant?: ConnectionBannerVariant;
  pending?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Aviso de conexión de la app del técnico:
 * - `status="offline"`: franja ámbar a todo el ancho bajo la barra de estado.
 *   Es un aviso, no un error: el técnico puede seguir trabajando.
 * - `status="syncing"` con `pending`: chip "3 cambios por enviar" (`variant="hero"` usa chip translúcido sobre el hero).
 * - NUNCA rojo: la falta de señal es normal en campo.
 */
export function ConnectionBanner({
  status = 'offline',
  variant = 'surface',
  pending = 0,
  children,
  style,
  testID,
}: ConnectionBannerProps) {
  const { colors, spacing, radius, fontFamilies, tabularNums } = useTheme();

  if (status === 'syncing') {
    const syncLabel = pending === 1 ? '1 cambio por enviar' : `${pending} cambios por enviar`;
    const isHero = variant === 'hero';
    const chipBg = isHero ? colors.heroChipBg : colors.warningSoft;
    const chipFg = isHero ? colors.heroInk : colors.warningInk;

    return (
      <View
        testID={testID}
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        style={[
          styles.syncChip,
          {
            backgroundColor: chipBg,
            borderRadius: radius.pill,
          },
          style,
        ]}
      >
        <SyncIcon size={14} color={chipFg} strokeWidth={2} />
        <Text
          style={[
            styles.syncText,
            tabularNums,
            {
              color: chipFg,
              fontFamily: fontFamilies.bold,
            },
          ]}
        >
          {children ?? syncLabel}
        </Text>
      </View>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.offlineBanner,
        {
          backgroundColor: colors.warningSoft,
          paddingVertical: spacing.space2,
          paddingHorizontal: spacing.space4,
          gap: spacing.space2,
        },
        style,
      ]}
    >
      <WifiOffIcon size={16} color={colors.warningInk} strokeWidth={2} />
      <Text
        style={[
          styles.offlineText,
          {
            color: colors.warningInk,
            fontFamily: fontFamilies.bold,
          },
        ]}
      >
        {children ?? 'Sin conexión · tus cambios se guardan en el teléfono'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    flexShrink: 1,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 6,
  },
  syncText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
