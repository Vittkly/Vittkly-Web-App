import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import {
  AlertIcon,
  CardIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  InfoIcon,
  PinIcon,
} from '@/components/icons';
import { useTheme } from '@/theme/useTheme';

export type WorkOrderStatus =
  | 'programada'
  | 'en-ruta'
  | 'en-curso'
  | 'completada'
  | 'pagada'
  | 'pendiente'
  | 'atrasada'
  | 'por-vencer'
  | 'cancelada'
  | 'visita';

export type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusBadgeProps {
  status: WorkOrderStatus;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface StatusConfig {
  label: string;
  tone: BadgeTone;
  IconComponent: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

const STATUS_MAP: Record<WorkOrderStatus, StatusConfig> = {
  programada: { label: 'Programada', tone: 'info', IconComponent: ClockIcon },
  'en-ruta': { label: 'En ruta', tone: 'info', IconComponent: PinIcon },
  'en-curso': { label: 'En curso', tone: 'info', IconComponent: ClockIcon },
  completada: { label: 'Completada', tone: 'success', IconComponent: CheckIcon },
  pagada: { label: 'Pagada', tone: 'success', IconComponent: CardIcon },
  pendiente: { label: 'Pendiente', tone: 'neutral', IconComponent: ClockIcon },
  atrasada: { label: 'Atrasada', tone: 'warning', IconComponent: AlertIcon },
  'por-vencer': { label: 'Por vencer', tone: 'warning', IconComponent: AlertIcon },
  cancelada: { label: 'Cancelada', tone: 'danger', IconComponent: CloseIcon },
  visita: { label: 'Visita técnica', tone: 'neutral', IconComponent: PinIcon },
};

/**
 * Etiqueta del estado de una orden, visita, cotización o pago.
 * SIEMPRE con palabra e ícono SVG obligatorio, nunca solo color.
 * El check queda RESERVADO para el trabajo terminado (`completada`);
 * lo pagado (`pagada`) usa el ícono de pago (`CardIcon`).
 */
export function StatusBadge({ status, children, style, testID }: StatusBadgeProps) {
  const { colors, radius, spacing, fontFamilies } = useTheme();
  const config = STATUS_MAP[status] ?? {
    label: status,
    tone: 'neutral' as BadgeTone,
    IconComponent: InfoIcon,
  };

  const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
    info: { bg: colors.primarySoft, fg: colors.primaryInk },
    success: { bg: colors.successSoft, fg: colors.successInk },
    warning: { bg: colors.warningSoft, fg: colors.warningInk },
    danger: { bg: colors.dangerSoft, fg: colors.dangerInk },
    neutral: { bg: colors.surfaceSunken, fg: colors.inkMuted },
  };

  const { bg, fg } = toneColors[config.tone];
  const Icon = config.IconComponent;

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          gap: spacing.space1,
        },
        style,
      ]}
    >
      <Icon size={14} color={fg} strokeWidth={2} />
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          {
            color: fg,
            fontFamily: fontFamilies.bold,
          },
        ]}
      >
        {children ?? config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 10,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
