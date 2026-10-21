import { Banknote, Check, Clock, Info, MapPin, TriangleAlert, X } from 'lucide-react-native';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

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
  | 'cancelada';

export type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusBadgeProps {
  status: WorkOrderStatus;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface StatusConfig {
  label: string;
  tone: BadgeTone;
  IconComponent: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

const STATUS_MAP: Record<WorkOrderStatus, StatusConfig> = {
  programada: { label: 'Programada', tone: 'info', IconComponent: Clock },
  'en-ruta': { label: 'En ruta', tone: 'info', IconComponent: MapPin },
  'en-curso': { label: 'En curso', tone: 'info', IconComponent: Clock },
  completada: { label: 'Completada', tone: 'success', IconComponent: Check },
  pagada: { label: 'Pagada', tone: 'success', IconComponent: Banknote },
  pendiente: { label: 'Pendiente', tone: 'neutral', IconComponent: Clock },
  atrasada: { label: 'Atrasada', tone: 'warning', IconComponent: TriangleAlert },
  'por-vencer': { label: 'Por vencer', tone: 'warning', IconComponent: TriangleAlert },
  cancelada: { label: 'Cancelada', tone: 'danger', IconComponent: X },
};

/**
 * Etiqueta del estado de una orden, visita, cotización o pago.
 * SIEMPRE con palabra e ícono Lucide obligatorio, nunca solo color.
 * El check queda RESERVADO para el trabajo terminado (`completada`);
 * lo pagado (`pagada`) usa el ícono de billete (`Banknote`).
 */
export function StatusBadge({ status, children, style }: StatusBadgeProps) {
  const { colors, radius, spacing, fontFamilies } = useTheme();
  const config = STATUS_MAP[status] ?? {
    label: status,
    tone: 'neutral' as BadgeTone,
    IconComponent: Info,
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
