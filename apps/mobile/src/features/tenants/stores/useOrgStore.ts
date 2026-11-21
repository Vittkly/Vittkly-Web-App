import { create } from 'zustand';

import type { Organization, OrgStoreState } from '../types/tenant.types';

/**
 * Store reactivo en memoria sincronizado con `AuthContext`.
 * La persistencia segura vive exclusivamente en `expo-secure-store` (`active_empresa_id`)
 * y en la tabla local SQLite de sesión offline, evitando estados duplicados con AsyncStorage.
 */
export const useOrgStore = create<OrgStoreState>()((set, get) => ({
  activeOrg: null,
  organizations: [],
  lastOrgId: null,

  setActiveOrg: (activeOrg: Organization | null) => {
    set({
      activeOrg,
      lastOrgId: activeOrg?.id ?? get().lastOrgId,
    });
  },

  setOrganizations: (organizations: Organization[]) => {
    const { activeOrg, lastOrgId } = get();
    let nextActive: Organization | null = activeOrg;

    if (organizations.length === 1 && organizations[0]) {
      nextActive = organizations[0];
    } else if (activeOrg) {
      nextActive = organizations.find((o) => o.id === activeOrg.id) ?? null;
    } else if (lastOrgId) {
      nextActive = organizations.find((o) => o.id === lastOrgId) ?? null;
    }

    set({
      organizations,
      activeOrg: nextActive,
    });
  },

  setLastOrgId: (lastOrgId: string | null) => {
    set({ lastOrgId });
  },

  switchOrg: async (orgId: string) => {
    const { organizations } = get();
    const found = organizations.find((o) => o.id === orgId) ?? null;
    if (found) {
      set({
        activeOrg: found,
        lastOrgId: found.id,
      });
    }
  },

  reset: () => {
    set({
      activeOrg: null,
      organizations: [],
      lastOrgId: null,
    });
  },
}));
