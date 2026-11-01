import { Building2, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getInitials } from '@/features/auth/utils/profile';
import type { Organization } from '@/features/tenants';
import { useTheme } from '@/theme';

export interface PerfilOrgCardProps {
  organization: Organization | null;
  onOpenSwitcher: () => void;
}

export function PerfilOrgCard({ organization, onOpenSwitcher }: PerfilOrgCardProps) {
  const { colors, spacing, radius, typography, fontFamilies, control } = useTheme();

  const companyName = organization?.name ?? 'Vitta Kleanly';
  const companyInitials = getInitials(companyName);
  const roleDisplay =
    organization?.jobTitle ||
    (organization?.role === 'owner'
      ? 'Titular de Empresa'
      : organization?.role === 'admin'
        ? 'Supervisor'
        : 'Técnico de Campo');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.line,
          borderRadius: radius.lg,
          padding: spacing.space4,
          gap: spacing.space3,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Building2 size={16} color={colors.inkMuted} />
        <Text
          style={[
            typography.small,
            {
              fontFamily: fontFamilies.bold,
              color: colors.inkMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
          ]}
        >
          Empresa de Trabajo
        </Text>
      </View>

      <Pressable
        testID="perfil-change-org-btn"
        accessibilityRole="button"
        accessibilityLabel={`Empresa actual ${companyName}. Toca para cambiar de empresa.`}
        onPress={onOpenSwitcher}
        style={({ pressed }) => [
          styles.orgSelectRow,
          {
            minHeight: control.lg,
            padding: spacing.space3,
            borderRadius: radius.md,
            backgroundColor: pressed ? colors.surfaceSunken : colors.tenantAccentSoft,
            borderColor: colors.tenantAccent,
            borderWidth: 1,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              width: 38,
              height: 38,
              borderRadius: radius.pill,
              backgroundColor: colors.tenantAccent,
            },
          ]}
        >
          <Text
            style={[
              typography.bodyStrong,
              {
                fontFamily: fontFamilies.bold,
                color: colors.onTenantAccent,
                fontSize: 13,
              },
            ]}
          >
            {companyInitials}
          </Text>
        </View>

        <View style={styles.orgTextColumn}>
          <Text
            style={[typography.bodyStrong, { fontFamily: fontFamilies.bold, color: colors.ink }]}
            numberOfLines={1}
          >
            {companyName}
          </Text>
          <Text style={[typography.small, { color: colors.inkMuted }]} numberOfLines={1}>
            {roleDisplay}
          </Text>
        </View>

        <View style={styles.actionPromptRow}>
          <Text
            style={[
              typography.small,
              {
                fontFamily: fontFamilies.bold,
                color: colors.primaryInk,
              },
            ]}
          >
            Cambiar
          </Text>
          <ChevronRight size={18} color={colors.primaryInk} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orgSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgTextColumn: {
    flex: 1,
    gap: 2,
  },
  actionPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
