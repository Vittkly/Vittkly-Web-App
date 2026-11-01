import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/theme';
import { useOrgStore } from '../stores/useOrgStore';
import type { Organization } from '../types/tenant.types';
import { OrgSwitchItem } from './OrgSwitchItem';

export interface OrgSwitchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSwitched?: (orgId: string) => void;
}

export function OrgSwitchSheet({ visible, onClose, onSwitched }: OrgSwitchSheetProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const { tenants, activeTenant, lastActiveTenantId, switchTenant } = useAuth();
  const { activeOrg, organizations, switchOrg, lastOrgId } = useOrgStore();

  const orgList: Organization[] =
    organizations.length > 0
      ? organizations
      : tenants.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          logoUrl: t.logoUrl,
          role: t.role,
          jobTitle: t.jobTitle,
          canViewPrices: t.canViewPrices,
          activeModules: t.activeModules,
        }));

  const currentActiveId = activeOrg?.id ?? activeTenant?.id;
  const effectiveLastId = lastOrgId ?? lastActiveTenantId;

  const handleSelectOrg = async (org: Organization) => {
    onClose();

    if (org.id !== currentActiveId) {
      await switchOrg(org.id);
      await switchTenant(org.id);
      if (onSwitched) {
        onSwitched(org.id);
      } else {
        router.replace('/(tabs)/hoy');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable
          testID="org-switch-sheet-backdrop"
          accessibilityRole="button"
          accessibilityLabel="Cerrar ventana de selección"
          style={styles.backdropPressable}
          onPress={onClose}
        />

        <BottomSheet style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderTitles}>
              <Text style={[typography.title2, { color: colors.ink }]}>Cambiar de empresa</Text>
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                Selecciona con cuál vas a trabajar ahora
              </Text>
            </View>

            <Pressable
              testID="org-switch-sheet-close-btn"
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector de empresa"
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                {
                  borderRadius: radius.pill,
                  backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
                },
              ]}
            >
              <X size={22} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.listContainer,
              { gap: spacing.space3, paddingVertical: spacing.space2 },
            ]}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {orgList.map((org) => (
              <OrgSwitchItem
                key={org.id}
                org={org}
                isSelected={org.id === currentActiveId}
                isLastActive={org.id === effectiveLastId && org.id !== currentActiveId}
                onSelect={handleSelectOrg}
              />
            ))}
          </ScrollView>
        </BottomSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 42, 59, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContent: {
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  sheetHeaderTitles: {
    flex: 1,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    maxHeight: 360,
  },
  listContainer: {
    flexGrow: 1,
  },
});
