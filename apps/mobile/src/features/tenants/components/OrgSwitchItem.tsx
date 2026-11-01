import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getInitials } from '@/features/auth/utils/profile';
import { useTheme } from '@/theme';
import type { Organization } from '../types/tenant.types';

export interface OrgSwitchItemProps {
  org: Organization;
  isSelected: boolean;
  isLastActive: boolean;
  onSelect: (org: Organization) => void;
}

export function OrgSwitchItem({ org, isSelected, isLastActive, onSelect }: OrgSwitchItemProps) {
  const { colors, spacing, radius, typography, fontFamilies, control } = useTheme();

  const initials = getInitials(org.name);
  const roleDisplay =
    org.jobTitle ||
    (org.role === 'owner'
      ? 'Titular de Empresa'
      : org.role === 'admin'
        ? 'Supervisor'
        : 'Técnico de Campo');

  return (
    <Pressable
      testID={`org-switch-item-${org.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Empresa ${org.name}, rol ${roleDisplay}.${
        isSelected ? ' Actualmente activa.' : ''
      }`}
      accessibilityState={{ selected: isSelected }}
      onPress={() => onSelect(org)}
      style={({ pressed }) => [
        styles.orgItem,
        {
          minHeight: control.lg,
          padding: spacing.space3,
          borderRadius: radius.md,
          backgroundColor: isSelected
            ? colors.tenantAccentSoft
            : pressed
              ? colors.surfaceSunken
              : colors.surfaceRaised,
          borderColor: isSelected ? colors.tenantAccent : colors.line,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            width: control.lg - 6,
            height: control.lg - 6,
            borderRadius: radius.pill,
            backgroundColor: isSelected ? colors.tenantAccent : colors.tenantAccentSoft,
            borderColor: colors.tenantAccent,
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
              fontSize: 14,
            },
          ]}
        >
          {initials}
        </Text>
      </View>

      <View style={styles.orgInfo}>
        <View style={styles.nameRow}>
          <Text
            style={[
              typography.bodyStrong,
              {
                fontFamily: fontFamilies.bold,
                color: colors.ink,
                flex: 1,
              },
            ]}
            numberOfLines={1}
          >
            {org.name}
          </Text>

          {isLastActive ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.surfaceSunken,
                  borderColor: colors.line,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.space2,
                  paddingVertical: 2,
                },
              ]}
            >
              <Text
                style={[
                  typography.small,
                  {
                    fontSize: 10,
                    fontFamily: fontFamilies.mono,
                    color: colors.inkMuted,
                  },
                ]}
              >
                Última
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={[typography.small, { color: colors.inkMuted }]} numberOfLines={1}>
          {roleDisplay}
        </Text>
      </View>

      {isSelected ? (
        <View
          style={[
            styles.checkCircle,
            {
              backgroundColor: colors.tenantAccent,
              borderRadius: radius.pill,
            },
          ]}
        >
          <Check size={16} color={colors.onTenantAccent} strokeWidth={2.5} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderWidth: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
