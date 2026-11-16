import { supabase } from '@/services/supabase';

import type { AccessScope, MembershipRole, Tenant } from '../types/auth.types';

interface MisAccesosEmpresaItem {
  membresia_id?: string;
  empresa_id: string;
  nombre?: string | null;
  rubro?: string | null;
  ciudad?: string | null;
  perfil_id?: string | null;
  perfil_nombre?: string | null;
  perfil_codigo?: string | null;
  es_propietario?: boolean;
  acceso_web?: boolean;
  acceso_app?: boolean;
}

interface MisAccesosRpcPayload {
  empresas_propias?: MisAccesosEmpresaItem[] | null;
  empresas_miembro?: MisAccesosEmpresaItem[] | null;
}

interface MembresiaDetailRow {
  id: string;
  empresa_id: string;
  perfil_id: string;
  es_propietario: boolean;
  acceso_web: boolean;
  acceso_app: boolean;
  cargo: string | null;
  estado: string;
  activo: boolean;
  empresas: {
    id: string;
    razon_social: string;
    nombre_comercial: string | null;
    logo_ruta: string | null;
    color_marca: string | null;
    modelo_operacion: string | null;
    rubro: string | null;
    ciudad: string | null;
    activa: boolean;
    eliminado_en: string | null;
  } | null;
  perfiles: {
    id: string;
    codigo: string;
    nombre: string;
    perfil_permisos:
      | {
          permiso_codigo: string;
          alcance: string | null;
        }[]
      | null;
  } | null;
}

function buildEmpresaSlug(name: string, id: string): string {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || id;
}

function resolveMembershipRole(
  esPropietario: boolean,
  perfilCodigo?: string | null,
  permisos: string[] = [],
): MembershipRole {
  if (esPropietario) {
    return 'owner';
  }
  const lowerCode = (perfilCodigo ?? '').toLowerCase();
  if (
    lowerCode === 'admin' ||
    lowerCode === 'administrador' ||
    lowerCode === 'supervisor' ||
    permisos.includes('configuracion.editar') ||
    permisos.includes('usuarios.editar')
  ) {
    return 'admin';
  }
  return 'member';
}

function resolveAccessScope(accesoWeb: boolean, accesoApp: boolean): AccessScope {
  if (accesoWeb && accesoApp) return 'both';
  if (accesoApp) return 'app';
  return 'web';
}

function extractActiveModules(permisos: string[]): string[] {
  return permisos
    .filter((codigo) => codigo.endsWith('.ver') && !codigo.startsWith('cotizaciones.'))
    .map((codigo) => codigo.slice(0, -4));
}

function mapDetailRowToTenant(row: MembresiaDetailRow): Tenant | null {
  const empresa = row.empresas;
  if (!empresa || !empresa.activa || empresa.eliminado_en) {
    return null;
  }

  const perfil = row.perfiles;
  const permisos = (perfil?.perfil_permisos ?? [])
    .filter((p) => p.alcance !== 'ninguna')
    .map((p) => p.permiso_codigo);

  const esPropietario = Boolean(row.es_propietario);
  const displayName = empresa.nombre_comercial?.trim() || empresa.razon_social;

  return {
    id: empresa.id,
    membresiaId: row.id,
    name: displayName,
    razonSocial: empresa.razon_social,
    slug: buildEmpresaSlug(displayName, empresa.id),
    rubro: empresa.rubro,
    ciudad: empresa.ciudad,
    logoUrl: empresa.logo_ruta,
    brandColor: empresa.color_marca,
    modeloOperacion: empresa.modelo_operacion,
    role: resolveMembershipRole(esPropietario, perfil?.codigo, permisos),
    esPropietario,
    perfilId: perfil?.id ?? row.perfil_id,
    perfilCodigo: perfil?.codigo ?? null,
    perfilNombre: perfil?.nombre ?? null,
    jobTitle: row.cargo ?? perfil?.nombre ?? null,
    accessScope: resolveAccessScope(row.acceso_web, row.acceso_app),
    accesoWeb: row.acceso_web,
    accesoApp: row.acceso_app,
    canViewPrices: esPropietario || permisos.includes('precios.ver'),
    validaServicios: esPropietario || permisos.includes('servicios.validar'),
    canRegisterPayments: esPropietario || permisos.includes('pagos.registrar'),
    permisos,
    activeModules: extractActiveModules(permisos),
    stdKey: perfil?.codigo ?? null,
  };
}

function mapRpcItemToFallbackTenant(item: MisAccesosEmpresaItem): Tenant {
  const displayName = item.nombre?.trim() || 'Empresa Vittkly';
  const esPropietario = Boolean(item.es_propietario);
  const perfilCodigo = item.perfil_codigo ?? null;
  const accesoWeb = Boolean(item.acceso_web);
  const accesoApp = Boolean(item.acceso_app);

  return {
    id: item.empresa_id,
    membresiaId: item.membresia_id,
    name: displayName,
    slug: buildEmpresaSlug(displayName, item.empresa_id),
    rubro: item.rubro ?? null,
    ciudad: item.ciudad ?? null,
    logoUrl: null,
    brandColor: null,
    modeloOperacion: null,
    role: resolveMembershipRole(esPropietario, perfilCodigo),
    esPropietario,
    perfilId: item.perfil_id ?? null,
    perfilCodigo,
    perfilNombre: item.perfil_nombre ?? null,
    jobTitle: item.perfil_nombre ?? null,
    accessScope: resolveAccessScope(accesoWeb, accesoApp),
    accesoWeb,
    accesoApp,
    canViewPrices: esPropietario || (perfilCodigo !== null && perfilCodigo !== 'tecnico'),
    validaServicios: esPropietario || perfilCodigo === 'admin' || perfilCodigo === 'supervisor',
    canRegisterPayments:
      esPropietario || perfilCodigo === 'admin' || perfilCodigo === 'contabilidad',
    permisos: [],
    activeModules: [],
    stdKey: perfilCodigo,
  };
}

/**
 * Repositorio canónico multi-empresa de Vittkly Mobile.
 * Consulta exclusivamente `mis_accesos()` + `membresias`, `empresas`, `perfiles` y `perfil_permisos`.
 * Filtra de forma estricta las membresías con `acceso_app = true` y empresas activas.
 */
export const tenantRepository = {
  async fetchUserTenants(userId: string): Promise<Tenant[]> {
    // 1. Fuente primaria: RPC canónica `mis_accesos()` (security definer)
    let rpcAppItems: MisAccesosEmpresaItem[] = [];
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('mis_accesos');
      if (!rpcError && rpcData && typeof rpcData === 'object' && !Array.isArray(rpcData)) {
        const payload = rpcData as MisAccesosRpcPayload;
        const combined = [
          ...(Array.isArray(payload.empresas_propias) ? payload.empresas_propias : []),
          ...(Array.isArray(payload.empresas_miembro) ? payload.empresas_miembro : []),
        ];
        const byEmpresaId = new Map<string, MisAccesosEmpresaItem>();
        for (const item of combined) {
          if (item?.empresa_id && item.acceso_app === true && !byEmpresaId.has(item.empresa_id)) {
            byEmpresaId.set(item.empresa_id, item);
          }
        }
        rpcAppItems = Array.from(byEmpresaId.values());
      }
    } catch {
      // Fallback directo a consulta relacional bajo RLS
    }

    // 2. Enriquecimiento relacional con `membresias` -> `empresas`, `perfiles`, `perfil_permisos`
    try {
      const { data: rows, error } = await supabase
        .from('membresias')
        .select(
          `
          id,
          empresa_id,
          perfil_id,
          es_propietario,
          acceso_web,
          acceso_app,
          cargo,
          estado,
          activo,
          empresas!inner (
            id,
            razon_social,
            nombre_comercial,
            logo_ruta,
            color_marca,
            modelo_operacion,
            rubro,
            ciudad,
            activa,
            eliminado_en
          ),
          perfiles!inner (
            id,
            codigo,
            nombre,
            perfil_permisos (
              permiso_codigo,
              alcance
            )
          )
        `,
        )
        .eq('usuario_id', userId)
        .eq('activo', true)
        .eq('estado', 'activa')
        .eq('acceso_app', true);

      if (!error && Array.isArray(rows) && rows.length > 0) {
        const mapped = (rows as unknown as MembresiaDetailRow[])
          .map(mapDetailRowToTenant)
          .filter((t): t is Tenant => t !== null);

        if (mapped.length > 0) {
          const byId = new Map(mapped.map((t) => [t.id, t]));
          for (const rpcItem of rpcAppItems) {
            if (!byId.has(rpcItem.empresa_id)) {
              byId.set(rpcItem.empresa_id, mapRpcItemToFallbackTenant(rpcItem));
            }
          }
          return Array.from(byId.values());
        }
      }
    } catch {
      // Si el enriquecimiento falla por conectividad, usar respuesta de `mis_accesos()`
    }

    return rpcAppItems.map(mapRpcItemToFallbackTenant);
  },
};
