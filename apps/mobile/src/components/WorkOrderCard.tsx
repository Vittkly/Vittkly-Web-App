import { Clock, MapPin, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { StatusBadge, WorkOrderStatus } from './StatusBadge';

export interface WorkOrderCardProps {
  code: string;
  title: string;
  status: WorkOrderStatus;
  address?: string;
  time?: string;
  technician?: string;
  amount?: string;
  onPress?: () => void;
  onClick?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tarjeta de una orden de trabajo: la unidad central de Vittkly en la app del técnico.
 * - App del técnico: una por fila, a todo el ancho, ordenadas por hora.
 * - Formatos: hora "9:40 a. m.", montos "S/ 150.00" (tabular-nums), código en mono.
 */
export function WorkOrderCard({
  code,
  title,
  status,
  address,
  time,
  technician,
  amount,
  onPress,
  onClick,
  style,
}: WorkOrderCardProps) {
  const { colors, spacing, radius, typography, fontFamilies } = useTheme();
  const handlePress = onPress ?? onClick;

  const content = (
    <>
      <View style={[styles.topRow, { gap: spacing.space2 }]}>
        <Text style={[typography.code, { color: colors.inkMuted }]}>{code}</Text>
        <StatusBadge status={status} />
      </View>

      <Text style={[typography.title3, { color: colors.ink }]}>{title}</Text>

      {address || time || technician ? (
        <View
          style={[
            styles.metaRow,
            {
              columnGap: spacing.space4,
              rowGap: spacing.space1,
            },
          ]}
        >
          {address ? (
            <View style={[styles.metaItem, { gap: spacing.space1 }]}>
              <MapPin size={16} color={colors.inkMuted} strokeWidth={2} />
              <Text style={[typography.small, { color: colors.inkMuted }]}>{address}</Text>
            </View>
          ) : null}

          {time ? (
            <View style={[styles.metaItem, { gap: spacing.space1 }]}>
              <Clock size={16} color={colors.inkMuted} strokeWidth={2} />
              <Text style={[typography.small, { color: colors.inkMuted }]}>{time}</Text>
            </View>
          ) : null}

          {technician ? (
            <View style={[styles.metaItem, { gap: spacing.space1 }]}>
              <User size={16} color={colors.inkMuted} strokeWidth={2} />
              <Text style={[typography.small, { color: colors.inkMuted }]}>{technician}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {amount ? (
        <Text
          style={[
            styles.amount,
            {
              color: colors.ink,
              fontFamily: fontFamilies.bold,
              fontSize: typography.bodyLg.fontSize,
              lineHeight: typography.bodyLg.lineHeight,
            },
          ]}
        >
          {amount}
        </Text>
      ) : null}
    </>
  );

  if (handlePress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: pressed ? colors.lineStrong : colors.line,
            borderRadius: radius.lg,
            padding: spacing.space4,
            gap: spacing.space2,
          },
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.line,
          borderRadius: radius.lg,
          padding: spacing.space4,
          gap: spacing.space2,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
