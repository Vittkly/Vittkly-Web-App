import React from 'react';
import { StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BuildingIcon } from '@/components/icons';
import { tokens, useTheme } from '@/theme';

import type { Tenant } from '../types/auth.types';
import { TenantCard } from './TenantCard';

export interface TenantSelectorProps {
  tenants: Tenant[];
  selectedTenantId?: string | null;
  lastActiveTenantId?: string | null;
  disabled?: boolean;
  onSelectTenant: (tenant: Tenant) => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ICON_SIZE = tokens.spacing.space6;

/**
 * Listado de empresas disponibles para usuarios con acceso móvil multi-empresa.
 * Delega la renderización visual de cada tarjeta a `TenantCard`.
 */
export function TenantSelector({
  tenants,
  selectedTenantId = null,
  lastActiveTenantId = null,
  disabled = false,
  onSelectTenant,
  style,
  testID = 'tenant-selector',
}: TenantSelectorProps) {
  const { colors, spacing, radius, typography } = useTheme();

  if (tenants.length === 0) {
    return (
      <View
        testID="tenant-selector-empty"
        style={[
          styles.emptyCard,
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.line,
            borderRadius: radius.lg,
            padding: spacing.space6,
            gap: spacing.space2,
          },
          style,
        ]}
      >
        <BuildingIcon size={ICON_SIZE} color={colors.inkMuted} />
        <Text style={[typography.title3, styles.centerText, { color: colors.ink }]}>
          Sin empresas con acceso móvil
        </Text>
        <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
          Tu cuenta no tiene membresías activas habilitadas para la App de Campo. Solicita a tu
          administrador activar tu acceso móvil desde la central web.
        </Text>
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.listContainer, { gap: spacing.space3 }, style]}>
      {tenants.map((tenant) => (
        <TenantCard
          key={tenant.id}
          tenant={tenant}
          isSelected={tenant.id === selectedTenantId}
          isLastActive={tenant.id === lastActiveTenantId}
          disabled={disabled}
          onSelect={onSelectTenant}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
  },
  centerText: {
    textAlign: 'center',
  },
});
