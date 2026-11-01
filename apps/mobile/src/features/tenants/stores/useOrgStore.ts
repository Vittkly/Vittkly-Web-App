import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorageService } from '@/features/auth/services/secure-storage.service';
import { queryClient } from '@/services/queryClient';
import type { Organization, OrgStoreState } from '../types/tenant.types';

export const useOrgStore = create<OrgStoreState>()(
  persist(
    (set, get) => ({
      activeOrg: null,
      organizations: [],
      lastOrgId: null,

      setActiveOrg: (org: Organization | null) => {
        set({ activeOrg: org });
      },

      setOrganizations: (organizations: Organization[]) => {
        const { activeOrg, lastOrgId } = get();

        // Criterio 1: Entrada directa si es 1 sola empresa
        let nextActive = activeOrg;
        if (organizations.length === 1 && organizations[0]) {
          nextActive = organizations[0];
        } else if (activeOrg && !organizations.some((o) => o.id === activeOrg.id)) {
          // Si la empresa activa previa ya no está en la lista de membresías
          nextActive = organizations.find((o) => o.id === lastOrgId) ?? null;
        }

        set({ organizations, activeOrg: nextActive });
      },

      setLastOrgId: (lastOrgId: string | null) => {
        set({ lastOrgId });
      },

      switchOrg: async (orgId: string) => {
        const { organizations } = get();
        const found = organizations.find((o) => o.id === orgId) ?? null;

        // Persiste en almacenamiento seguro
        try {
          await secureStorageService.saveLastActiveTenantId(orgId);
        } catch {
          // Fallback silencioso si secure storage no está disponible
        }

        set({
          activeOrg: found,
          lastOrgId: orgId,
        });

        // Criterio 4: Aislamiento total de datos — purga la caché de TanStack Query
        queryClient.clear();
      },

      reset: () => {
        set({
          activeOrg: null,
          organizations: [],
          lastOrgId: null,
        });
        queryClient.clear();
      },
    }),
    {
      name: 'vittkly-org-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeOrg: state.activeOrg,
        lastOrgId: state.lastOrgId,
      }),
    },
  ),
);
