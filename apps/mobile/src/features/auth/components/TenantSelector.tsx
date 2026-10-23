import { Building2 } from 'lucide-react-native';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

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
 * Listado de organizaciones disponibles para usuarios con membresía multi-tenant.
 * Delega la renderización visual de cada item a TenantCard.
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
        <Building2 size={ICON_SIZE} color={colors.inkMuted} />
        <Text style={[typography.title3, styles.centerText, { color: colors.ink }]}>
          Sin organizaciones asignadas
        </Text>
        <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
          Aún no tienes membresías activas. Si tienes un código de invitación VK-XXXX, vincúlalo
          desde la pantalla de bienvenida.
        </Text>
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.listContainer, { gap: spacing.space3 }, style]}>
      {tenants.map(tenant => (
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
