import { RefreshCw, WifiOff } from 'lucide-react-native';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export type ConnectionStatus = 'offline' | 'syncing';

export interface ConnectionBannerProps {
  status?: ConnectionStatus;
  pending?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Aviso de conexión de la app del técnico:
 * - `status="offline"`: franja ámbar a todo el ancho bajo la barra de estado.
 *   Es un aviso, no un error: el técnico puede seguir trabajando.
 * - `status="syncing"` con `pending`: chip "3 cambios por enviar".
 * - NUNCA rojo: la falta de señal es normal en campo.
 */
export function ConnectionBanner({
  status = 'offline',
  pending = 0,
  children,
  style,
}: ConnectionBannerProps) {
  const { colors, spacing, radius, fontFamilies } = useTheme();

  if (status === 'syncing') {
    const syncLabel = pending === 1 ? '1 cambio por enviar' : `${pending} cambios por enviar`;

    return (
      <View
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        style={[
          styles.syncChip,
          {
            backgroundColor: colors.warningSoft,
            borderRadius: radius.pill,
          },
          style,
        ]}
      >
        <RefreshCw size={14} color={colors.warningInk} strokeWidth={2} />
        <Text
          style={[
            styles.syncText,
            {
              color: colors.warningInk,
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
      <WifiOff size={16} color={colors.warningInk} strokeWidth={2} />
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
