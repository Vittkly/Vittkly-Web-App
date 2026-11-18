import type { Organization } from '@/features/tenants/types/tenant.types';
import { useOrgStore } from '@/features/tenants/stores/useOrgStore';

import type { Tenant } from '../types/auth.types';

export function mapTenantToOrganization(tenant: Tenant): Organization {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    rubro: tenant.rubro,
    ciudad: tenant.ciudad,
    logoUrl: tenant.logoUrl,
    menuIconUrl: tenant.menuIconUrl,
    brandColor: tenant.brandColor,
    role: tenant.role,
    roleName: tenant.perfilNombre ?? null,
    perfilNombre: tenant.perfilNombre,
    esPropietario: tenant.esPropietario,
    jobTitle: tenant.jobTitle,
    accessScope: tenant.accessScope,
    canViewPrices: tenant.canViewPrices,
    validaServicios: tenant.validaServicios,
    canRegisterPayments: tenant.canRegisterPayments,
    permisos: tenant.permisos,
    activeModules: tenant.activeModules,
  };
}

/**
 * Mantiene `useOrgStore` sincronizado como espejo reactivo de `AuthContext`
 * sin duplicar persistencia en almacenamiento local.
 */
export function syncOrgStoreFromAuth(
  tenants: Tenant[],
  activeTenant: Tenant | null,
  lastActiveTenantId: string | null,
): void {
  const store = useOrgStore.getState();
  const orgs = tenants.map(mapTenantToOrganization);
  store.setOrganizations(orgs);
  store.setLastOrgId(lastActiveTenantId ?? activeTenant?.id ?? null);
  store.setActiveOrg(activeTenant ? mapTenantToOrganization(activeTenant) : null);
}
