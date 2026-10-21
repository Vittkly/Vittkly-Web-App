import { Check, ChevronRight, Shield } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens, useTheme } from '@/theme';

import type { MembershipRole, Tenant } from '../types/auth.types';
import { getInitials } from '../utils/profile';

export interface TenantCardProps {
  tenant: Tenant;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (tenant: Tenant) => void | Promise<void>;
}

const AVATAR_SIZE = tokens.control.lg; // 48px
const ICON_SIZE = tokens.spacing.space6; // 24px
const SMALL_ICON_SIZE = tokens.spacing.space4; // 16px
const ACTIVE_DOT_SIZE = tokens.spacing.space2; // 8px

function formatRoleLabel(role: MembershipRole, jobTitle?: string | null): string {
  if (jobTitle && jobTitle.trim().length > 0) {
    return jobTitle;
  }
  switch (role) {
    case 'owner':
      return 'Titular de Empresa';
    case 'admin':
      return 'Supervisor';
    case 'member':
    default:
      return 'Técnico de Campo';
  }
}

export function TenantCard({ tenant, isSelected, disabled = false, onSelect }: TenantCardProps) {
  const { colors, spacing, radius, typography, control, fontFamilies } = useTheme();

  const roleLabel = formatRoleLabel(tenant.role, tenant.jobTitle);
  const companyInitials = getInitials(tenant.name);

  return (
    <Pressable
      testID={`tenant-card-${tenant.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Seleccionar organización ${tenant.name}, rol ${roleLabel}`}
      accessibilityState={{ selected: isSelected, disabled }}
      disabled={disabled}
      onPress={() => onSelect(tenant)}
      style={({ pressed }) => [
        styles.card,
        {
          minHeight: control.lg + spacing.space6,
          borderRadius: radius.md,
          padding: spacing.space4,
          backgroundColor: isSelected
            ? colors.tenantAccentSoft
            : pressed
              ? colors.primarySoft
              : colors.surfaceRaised,
          borderColor: isSelected ? colors.tenantAccent : pressed ? colors.primary : colors.line,
          borderWidth: isSelected ? 2 : 1.5,
          gap: spacing.space3,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.orgAvatar,
          {
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: radius.pill,
            backgroundColor: isSelected ? colors.tenantAccent : colors.tenantAccentSoft,
            borderColor: isSelected ? colors.tenantAccent : colors.line,
            borderWidth: 1,
          },
        ]}
      >
        <Text
          style={[
            typography.bodyStrong,
            {
              fontFamily: fontFamilies.bold,
              color: isSelected ? colors.onTenantAccent : colors.successInk,
            },
          ]}
        >
          {companyInitials}
        </Text>
      </View>

      <View style={[styles.infoColumn, { gap: spacing.space1 }]}>
        <View style={[styles.titleRow, { gap: spacing.space2 }]}>
          <Text
            testID={`tenant-card-name-${tenant.id}`}
            style={[
              typography.bodyStrong,
              styles.companyName,
              { fontFamily: fontFamilies.bold, color: colors.ink },
            ]}
            numberOfLines={1}
          >
            {tenant.name}
          </Text>

          {isSelected ? (
            <View
              testID={`tenant-card-active-badge-${tenant.id}`}
              style={[
                styles.activeTenantBadge,
                {
                  backgroundColor: colors.surfaceRaised,
                  borderColor: colors.tenantAccent,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.space2,
                  paddingVertical: spacing.space1 / 2,
                  gap: spacing.space1,
                },
              ]}
            >
              <View
                style={{
                  width: ACTIVE_DOT_SIZE,
                  height: ACTIVE_DOT_SIZE,
                  borderRadius: radius.pill,
                  backgroundColor: colors.tenantAccent,
                }}
              />
              <Text style={[typography.label, { color: colors.successInk }]}>Activa</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.roleRow, { gap: spacing.space2 }]}>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: isSelected ? colors.surfaceRaised : colors.surfaceSunken,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.space2,
                paddingVertical: spacing.space1,
                gap: spacing.space1,
              },
            ]}
          >
            <Shield size={SMALL_ICON_SIZE} color={colors.primaryInk} />
            <Text style={[typography.small, { color: colors.inkMuted }]}>{roleLabel}</Text>
          </View>

          {tenant.validaServicios ? (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: colors.tenantAccentSoft,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.space2,
                  paddingVertical: spacing.space1,
                },
              ]}
            >
              <Text style={[typography.label, { color: colors.successInk }]}>Valida servicios</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.trailingIndicator,
          {
            width: control.sm,
            height: control.sm,
            borderRadius: radius.pill,
            backgroundColor: isSelected ? colors.tenantAccent : 'transparent',
          },
        ]}
      >
        {isSelected ? (
          <Check size={SMALL_ICON_SIZE} color={colors.onTenantAccent} />
        ) : (
          <ChevronRight size={ICON_SIZE} color={colors.inkMuted} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    flexShrink: 1,
  },
  activeTenantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
