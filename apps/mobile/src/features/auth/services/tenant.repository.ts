import { supabase } from '@/services/supabase';

import type { AccessScope, MembershipRole, SubscriptionStatus, Tenant } from '../types/auth.types';

export interface RawRpcContextItem {
  org_id?: string;
  organization_id?: string;
  id?: string;
  org_name?: string;
  name?: string;
  org_slug?: string;
  slug?: string;
  logo_url?: string | null;
  role?: MembershipRole;
  job_title?: string | null;
  access_scope?: AccessScope;
  subscription_status?: SubscriptionStatus;
  std_key?: string | null;
  can_view_prices?: boolean;
  valida_servicios?: boolean;
  active_modules?: string[];
  modules?: string[];
}

export interface RawMembershipQueryRow {
  role: MembershipRole;
  job_title?: string | null;
  access_scope?: AccessScope | null;
  organizations?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
  } | null;
  access_profiles?: {
    std_key?: string | null;
    config_sections?: Record<string, unknown> | null;
  } | null;
}

export function mapRawContextToTenant(item: RawRpcContextItem): Tenant | null {
  const id = item.org_id ?? item.organization_id ?? item.id;
  const name = item.org_name ?? item.name;
  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    slug: item.org_slug ?? item.slug ?? id.slice(0, 8),
    logoUrl: item.logo_url ?? null,
    role: item.role ?? 'member',
    jobTitle: item.job_title ?? null,
    accessScope: item.access_scope ?? 'both',
    subscriptionStatus: item.subscription_status ?? 'active',
    stdKey: item.std_key ?? null,
    canViewPrices: Boolean(item.can_view_prices),
    validaServicios: Boolean(item.valida_servicios),
    activeModules: item.active_modules ?? item.modules ?? [],
  };
}

export const tenantRepository = {
  /**
   * Obtiene las organizaciones asignadas al usuario y sus banderas de permisos
   * consumiendo la RPC `mi_contexto()` (con fallback tipado a `get_my_access` y `memberships`).
   */
  async fetchUserTenants(userId?: string): Promise<Tenant[]> {
    // 1. Intento vía RPC principal `mi_contexto()`
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('mi_contexto');
      if (!rpcError && rpcData) {
        const list: RawRpcContextItem[] = Array.isArray(rpcData)
          ? (rpcData as RawRpcContextItem[])
          : typeof rpcData === 'object' && rpcData !== null && 'organizations' in rpcData
            ? ((rpcData as { organizations?: RawRpcContextItem[] }).organizations ?? [])
            : [rpcData as RawRpcContextItem];

        const mapped = list
          .map(mapRawContextToTenant)
          .filter((item): item is Tenant => item !== null);

        if (mapped.length > 0) {
          return mapped;
        }
      }
    } catch {
      // Continuar al fallback
    }

    // 2. Fallback vía RPC `get_my_access()` del Core SaaS
    try {
      const { data: accessData, error: accessError } = await (supabase as any).rpc('get_my_access');
      if (!accessError && Array.isArray(accessData)) {
        const mapped = (accessData as RawRpcContextItem[])
          .map(mapRawContextToTenant)
          .filter((item): item is Tenant => item !== null);

        if (mapped.length > 0) {
          return mapped;
        }
      }
    } catch {
      // Continuar al fallback relacional
    }

    // 3. Fallback consulta relacional tipada a `memberships` + `organizations` + `access_profiles`
    try {
      let query = supabase
        .from('memberships')
        .select(
          `
          role,
          job_title,
          access_scope,
          organizations ( id, name, slug, logo_url ),
          access_profiles ( std_key, config_sections )
        `,
        )
        .eq('status', 'active');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: rows, error } = await query;
      if (error || !rows) {
        return [];
      }

      const tenants: Tenant[] = [];
      for (const rawRow of rows as unknown as RawMembershipQueryRow[]) {
        const org = rawRow.organizations;
        if (!org?.id) continue;

        const config = rawRow.access_profiles?.config_sections ?? {};
        const canViewPrices =
          typeof config.can_view_prices === 'boolean'
            ? config.can_view_prices
            : rawRow.role === 'owner' || rawRow.role === 'admin';
        const validaServicios =
          typeof config.valida_servicios === 'boolean'
            ? config.valida_servicios
            : rawRow.role !== 'member';

        tenants.push({
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl: org.logo_url ?? null,
          role: rawRow.role,
          jobTitle: rawRow.job_title ?? null,
          accessScope: rawRow.access_scope ?? 'both',
          stdKey: rawRow.access_profiles?.std_key ?? null,
          canViewPrices,
          validaServicios,
          activeModules: [],
        });
      }

      return tenants;
    } catch {
      return [];
    }
  },
};
