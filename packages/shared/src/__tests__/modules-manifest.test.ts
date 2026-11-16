import { describe, expect, it } from 'vitest';
import {
  CANONICAL_MODULES,
  CANONICAL_MODULE_CODES,
  CANONICAL_PROCESSES,
  getFirstAllowedDashboardPath,
  getPlanModuleCodes,
  getRequiredPlanBadgeLabel,
  isModuleIncludedInPlan,
  isTenantAdminRole,
  normalizeModuleCodesToCanonical,
  resolveModuleBySlug,
} from '../dashboard/modules-manifest';

describe('modules-manifest', () => {
  it('defines exactly 19 canonical modules and 5 visual process containers', () => {
    expect(CANONICAL_MODULES).toHaveLength(19);
    expect(CANONICAL_MODULE_CODES).toHaveLength(19);
    expect(CANONICAL_PROCESSES.map((p) => p.key)).toEqual([
      'ventas',
      'operacion',
      'finanzas',
      'equipo',
      'crecimiento',
    ]);
    // Contenedores y retirados no forman parte del catálogo de módulos
    const codes = new Set<string>(CANONICAL_MODULE_CODES);
    for (const forbidden of [
      'ventas',
      'operacion',
      'finanzas',
      'equipo',
      'crecimiento',
      'ocurrencias',
      'configuraciones',
      'contratos',
      'valorizaciones',
    ]) {
      expect(codes.has(forbidden)).toBe(false);
    }
  });

  it('enforces the exact 10 / 16 / 19 module counts across Inicia, Crece, and Empresa', () => {
    const inicia = getPlanModuleCodes('inicia');
    const crece = getPlanModuleCodes('crece');
    const empresa = getPlanModuleCodes('empresa');

    expect(inicia).toEqual([
      'dashboard',
      'calendario',
      'clientes',
      'cotizaciones',
      'inventario',
      'trabajos',
      'tiempo',
      'cobranzas',
      'comprobantes',
      'personal',
    ]);
    expect(inicia).toHaveLength(10);

    expect(crece).toHaveLength(16);
    for (const mod of [
      'post_venta',
      'liquidaciones',
      'rentabilidad',
      'pagos_personal',
      'biblioteca_academia',
      'reportes',
    ] as const) {
      expect(crece).toContain(mod);
      expect(isModuleIncludedInPlan(mod, 'inicia')).toBe(false);
      expect(getRequiredPlanBadgeLabel(resolveModuleBySlug(mod)!.minPlan)).toBe(
        'Disponible en plan Crece',
      );
    }

    expect(empresa).toHaveLength(19);
    for (const mod of ['caja_bancos', 'marketing', 'sitio_web_reservas'] as const) {
      expect(empresa).toContain(mod);
      expect(isModuleIncludedInPlan(mod, 'crece')).toBe(false);
      expect(getRequiredPlanBadgeLabel(resolveModuleBySlug(mod)!.minPlan)).toBe(
        'Disponible en plan Empresa',
      );
    }
  });

  it('resolves slugs and legacy aliases cleanly', () => {
    expect(resolveModuleBySlug('postventa')?.code).toBe('post_venta');
    expect(resolveModuleBySlug('post_venta')?.href).toBe('/dashboard/postventa');
    expect(resolveModuleBySlug('caja')?.code).toBe('caja_bancos');
    expect(resolveModuleBySlug('pagos-personal')?.code).toBe('pagos_personal');
    expect(resolveModuleBySlug('academia')?.code).toBe('biblioteca_academia');
    expect(resolveModuleBySlug('sitio-web')?.code).toBe('sitio_web_reservas');
    expect(resolveModuleBySlug('ocurrencias')).toBeNull();
  });

  it('never defaults null profile codes to admin in isTenantAdminRole', () => {
    expect(isTenantAdminRole(true, null)).toBe(true);
    expect(isTenantAdminRole(false, 'admin')).toBe(true);
    expect(isTenantAdminRole(false, 'administrador')).toBe(true);
    expect(isTenantAdminRole(false, null)).toBe(false);
    expect(isTenantAdminRole(false, '')).toBe(false);
    expect(isTenantAdminRole(false, 'ventas')).toBe(false);
  });

  it('normalizes legacy module arrays without keeping container or retired names', () => {
    const normalized = normalizeModuleCodesToCanonical([
      'calendario_trabajos',
      'cobranzas_comprobantes',
      'ocurrencias',
      'configuraciones',
      'academia',
      'sitio_web',
    ]);

    expect(normalized).toEqual([
      'calendario',
      'trabajos',
      'cobranzas',
      'comprobantes',
      'biblioteca_academia',
      'sitio_web_reservas',
    ]);
  });

  it('computes firstAllowedDashboardPath in strict Sidebar order and returns null for 0 modules', () => {
    expect(getFirstAllowedDashboardPath(['cotizaciones', 'clientes', 'cobranzas'], false)).toBe(
      '/dashboard/clientes',
    );
    expect(getFirstAllowedDashboardPath(['reportes'], false)).toBe('/dashboard/reportes');
    expect(getFirstAllowedDashboardPath([], true)).toBe('/dashboard/configuraciones');
    expect(getFirstAllowedDashboardPath([], false)).toBeNull();
  });
});
