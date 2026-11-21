export type PlanCode = 'inicia' | 'crece' | 'empresa';

export type ProcessKey = 'root' | 'ventas' | 'operacion' | 'finanzas' | 'equipo' | 'crecimiento';

export type ModuleIconKey =
  | 'LayoutGrid'
  | 'Calendar'
  | 'BarChart2'
  | 'Users'
  | 'FilePlus2'
  | 'Box'
  | 'ClipboardCheck'
  | 'Clock'
  | 'Heart'
  | 'CircleDollarSign'
  | 'Receipt'
  | 'FileText'
  | 'Landmark'
  | 'TrendingUp'
  | 'IdCard'
  | 'Banknote'
  | 'GraduationCap'
  | 'Megaphone'
  | 'Globe';

export type ProcessIconKey = 'Users' | 'Briefcase' | 'Wallet' | 'IdCard' | 'Megaphone';

export const CANONICAL_MODULE_CODES = [
  'dashboard',
  'calendario',
  'clientes',
  'cotizaciones',
  'inventario',
  'trabajos',
  'tiempo',
  'post_venta',
  'cobranzas',
  'comprobantes',
  'liquidaciones',
  'caja_bancos',
  'rentabilidad',
  'personal',
  'pagos_personal',
  'biblioteca_academia',
  'marketing',
  'sitio_web_reservas',
  'reportes',
] as const;

export type CanonicalModuleCode = (typeof CANONICAL_MODULE_CODES)[number];

export interface CanonicalProcessMeta {
  key: Exclude<ProcessKey, 'root'>;
  label: string;
  iconKey: ProcessIconKey;
}

export const CANONICAL_PROCESSES: readonly CanonicalProcessMeta[] = [
  { key: 'ventas', label: 'Ventas', iconKey: 'Users' },
  { key: 'operacion', label: 'Operación', iconKey: 'Briefcase' },
  { key: 'finanzas', label: 'Finanzas', iconKey: 'Wallet' },
  { key: 'equipo', label: 'Equipo', iconKey: 'IdCard' },
  { key: 'crecimiento', label: 'Crecimiento', iconKey: 'Megaphone' },
];

export interface CanonicalModuleMeta {
  code: CanonicalModuleCode;
  slug: string;
  aliasSlugs: readonly string[];
  href: string;
  label: string;
  shortHeaderCode: string;
  description: string;
  process: ProcessKey;
  processLabel: string;
  iconKey: ModuleIconKey;
  minPlan: PlanCode;
  isPronto?: boolean;
  orden: number;
}

export const CANONICAL_MODULES: readonly CanonicalModuleMeta[] = [
  // Sin proceso (acceso directo en raíz del Sidebar — parte superior)
  {
    code: 'dashboard',
    slug: 'dashboard',
    aliasSlugs: ['inicio'],
    href: '/dashboard',
    label: 'Inicio',
    shortHeaderCode: 'INI-01',
    description: 'Resumen general, indicadores del día y alertas operativas.',
    process: 'root',
    processLabel: 'General',
    iconKey: 'LayoutGrid',
    minPlan: 'inicia',
    orden: 1,
  },
  {
    code: 'calendario',
    slug: 'calendario',
    aliasSlugs: ['agenda'],
    href: '/dashboard/calendario',
    label: 'Calendario',
    shortHeaderCode: 'CAL-01',
    description: 'Programación de visitas, turnos y disponibilidad de equipos.',
    process: 'root',
    processLabel: 'General',
    iconKey: 'Calendar',
    minPlan: 'inicia',
    orden: 2,
  },

  // Proceso: Ventas
  {
    code: 'clientes',
    slug: 'clientes',
    aliasSlugs: [],
    href: '/dashboard/clientes',
    label: 'Clientes',
    shortHeaderCode: 'VE-CLI',
    description: 'Directorio de clientes, sedes, contactos e historial.',
    process: 'ventas',
    processLabel: 'Ventas',
    iconKey: 'Users',
    minPlan: 'inicia',
    orden: 3,
  },
  {
    code: 'cotizaciones',
    slug: 'cotizaciones',
    aliasSlugs: ['nueva'],
    href: '/dashboard/cotizaciones',
    label: 'Cotizaciones',
    shortHeaderCode: 'VE-COT',
    description: 'Propuestas comerciales, envíos por WhatsApp y seguimiento.',
    process: 'ventas',
    processLabel: 'Ventas',
    iconKey: 'FilePlus2',
    minPlan: 'inicia',
    orden: 4,
  },

  // Proceso: Operación
  {
    code: 'inventario',
    slug: 'inventario',
    aliasSlugs: [],
    href: '/dashboard/inventario',
    label: 'Inventario',
    shortHeaderCode: 'OP-INV',
    description: 'Almacenes, insumos, repuestos y movimientos de stock.',
    process: 'operacion',
    processLabel: 'Operación',
    iconKey: 'Box',
    minPlan: 'inicia',
    orden: 5,
  },
  {
    code: 'trabajos',
    slug: 'trabajos',
    aliasSlugs: ['ordenes'],
    href: '/dashboard/trabajos',
    label: 'Trabajos',
    shortHeaderCode: 'OP-TRAB',
    description: 'Órdenes de trabajo (OT), ejecución en campo y actas de cierre.',
    process: 'operacion',
    processLabel: 'Operación',
    iconKey: 'ClipboardCheck',
    minPlan: 'inicia',
    orden: 6,
  },
  {
    code: 'tiempo',
    slug: 'tiempo',
    aliasSlugs: [],
    href: '/dashboard/tiempo',
    label: 'Tiempo',
    shortHeaderCode: 'OP-TIME',
    description: 'Marcaciones de jornada, asistencia y control de horas.',
    process: 'operacion',
    processLabel: 'Operación',
    iconKey: 'Clock',
    minPlan: 'inicia',
    orden: 7,
  },
  {
    code: 'post_venta',
    slug: 'postventa',
    aliasSlugs: ['post_venta', 'post-venta'],
    href: '/dashboard/postventa',
    label: 'Post venta',
    shortHeaderCode: 'OP-POST',
    description: 'Garantías, reclamos, encuestas de satisfacción y calidad.',
    process: 'operacion',
    processLabel: 'Operación',
    iconKey: 'Heart',
    minPlan: 'crece',
    orden: 8,
  },

  // Proceso: Finanzas
  {
    code: 'cobranzas',
    slug: 'cobranzas',
    aliasSlugs: [],
    href: '/dashboard/cobranzas',
    label: 'Cobranzas',
    shortHeaderCode: 'FI-COB',
    description: 'Cuentas por cobrar, pagos de clientes y recordatorios.',
    process: 'finanzas',
    processLabel: 'Finanzas',
    iconKey: 'CircleDollarSign',
    minPlan: 'inicia',
    orden: 9,
  },
  {
    code: 'comprobantes',
    slug: 'comprobantes',
    aliasSlugs: [],
    href: '/dashboard/comprobantes',
    label: 'Comprobantes',
    shortHeaderCode: 'FI-COMP',
    description: 'Emisión y control de boletas y facturas electrónicas.',
    process: 'finanzas',
    processLabel: 'Finanzas',
    iconKey: 'Receipt',
    minPlan: 'inicia',
    orden: 10,
  },
  {
    code: 'liquidaciones',
    slug: 'liquidaciones',
    aliasSlugs: [],
    href: '/dashboard/liquidaciones',
    label: 'Liquidaciones',
    shortHeaderCode: 'FI-LIQ',
    description: 'Cortes periódicos y liquidaciones de servicios realizados.',
    process: 'finanzas',
    processLabel: 'Finanzas',
    iconKey: 'FileText',
    minPlan: 'crece',
    orden: 11,
  },
  {
    code: 'caja_bancos',
    slug: 'caja',
    aliasSlugs: ['caja_bancos', 'caja-bancos'],
    href: '/dashboard/caja',
    label: 'Caja y bancos',
    shortHeaderCode: 'FI-CAJA',
    description: 'Flujo de efectivo, conciliación de cuentas y movimientos.',
    process: 'finanzas',
    processLabel: 'Finanzas',
    iconKey: 'Landmark',
    minPlan: 'empresa',
    orden: 12,
  },
  {
    code: 'rentabilidad',
    slug: 'rentabilidad',
    aliasSlugs: [],
    href: '/dashboard/rentabilidad',
    label: 'Rentabilidad',
    shortHeaderCode: 'FI-RENT',
    description: 'Márgenes de ganancia, costos operativos y utilidad por servicio.',
    process: 'finanzas',
    processLabel: 'Finanzas',
    iconKey: 'TrendingUp',
    minPlan: 'crece',
    orden: 13,
  },

  // Proceso: Equipo
  {
    code: 'personal',
    slug: 'personal',
    aliasSlugs: [],
    href: '/dashboard/personal',
    label: 'Personal',
    shortHeaderCode: 'EQ-PERS',
    description: 'Fichas del personal técnico, habilidades y documentación.',
    process: 'equipo',
    processLabel: 'Equipo',
    iconKey: 'IdCard',
    minPlan: 'inicia',
    isPronto: true,
    orden: 14,
  },
  {
    code: 'pagos_personal',
    slug: 'pagos-personal',
    aliasSlugs: ['pagos_personal'],
    href: '/dashboard/pagos-personal',
    label: 'Pagos al personal',
    shortHeaderCode: 'EQ-PAG',
    description: 'Cálculo de honorarios, comisiones, bonos y liquidación de pagos.',
    process: 'equipo',
    processLabel: 'Equipo',
    iconKey: 'Banknote',
    minPlan: 'crece',
    orden: 15,
  },
  {
    code: 'biblioteca_academia',
    slug: 'academia',
    aliasSlugs: ['biblioteca_academia', 'biblioteca-academia', 'biblioteca'],
    href: '/dashboard/academia',
    label: 'Biblioteca y Academia',
    shortHeaderCode: 'EQ-ACAD',
    description: 'Protocolos técnicos, manuales operativos y capacitación.',
    process: 'equipo',
    processLabel: 'Equipo',
    iconKey: 'GraduationCap',
    minPlan: 'crece',
    orden: 16,
  },

  // Proceso: Crecimiento
  {
    code: 'marketing',
    slug: 'marketing',
    aliasSlugs: [],
    href: '/dashboard/marketing',
    label: 'Marketing',
    shortHeaderCode: 'CR-MKT',
    description: 'Campañas promocionales, segmentación y captación de clientes.',
    process: 'crecimiento',
    processLabel: 'Crecimiento',
    iconKey: 'Megaphone',
    minPlan: 'empresa',
    orden: 17,
  },
  {
    code: 'sitio_web_reservas',
    slug: 'sitio-web',
    aliasSlugs: ['sitio_web_reservas', 'sitio_web', 'sitio-web-reservas'],
    href: '/dashboard/sitio-web',
    label: 'Sitio web y reservas',
    shortHeaderCode: 'CR-WEB',
    description: 'Portal público para clientes y reservas de servicio en línea.',
    process: 'crecimiento',
    processLabel: 'Crecimiento',
    iconKey: 'Globe',
    minPlan: 'empresa',
    orden: 18,
  },

  // Sin proceso (acceso directo en raíz del Sidebar — parte inferior)
  {
    code: 'reportes',
    slug: 'reportes',
    aliasSlugs: [],
    href: '/dashboard/reportes',
    label: 'Reportes',
    shortHeaderCode: 'REP-01',
    description: 'Indicadores gerenciales, exportación en Excel y análisis histórico.',
    process: 'root',
    processLabel: 'General',
    iconKey: 'BarChart2',
    minPlan: 'crece',
    orden: 19,
  },
] as const;

const PLAN_RANK: Record<PlanCode, number> = {
  inicia: 1,
  crece: 2,
  empresa: 3,
};

const MODULE_BY_CODE = new Map<CanonicalModuleCode, CanonicalModuleMeta>(
  CANONICAL_MODULES.map((m) => [m.code, m]),
);

const MODULE_BY_ANY_SLUG = new Map<string, CanonicalModuleMeta>();
for (const mod of CANONICAL_MODULES) {
  MODULE_BY_ANY_SLUG.set(mod.slug.toLowerCase(), mod);
  MODULE_BY_ANY_SLUG.set(mod.code.toLowerCase(), mod);
  for (const alias of mod.aliasSlugs) {
    MODULE_BY_ANY_SLUG.set(alias.toLowerCase(), mod);
  }
}

export function isCanonicalModuleCode(value: string): value is CanonicalModuleCode {
  return MODULE_BY_CODE.has(value as CanonicalModuleCode);
}

export function getCanonicalModuleMeta(code: string): CanonicalModuleMeta | null {
  return MODULE_BY_CODE.get(code as CanonicalModuleCode) ?? null;
}

export function resolveModuleBySlug(slug: string): CanonicalModuleMeta | null {
  const clean = slug.trim().toLowerCase();
  if (!clean) return null;
  return MODULE_BY_ANY_SLUG.get(clean) ?? null;
}

export function isModuleIncludedInPlan(
  moduleCode: CanonicalModuleCode,
  planCode: PlanCode,
): boolean {
  const meta = MODULE_BY_CODE.get(moduleCode);
  if (!meta) return false;
  return PLAN_RANK[planCode] >= PLAN_RANK[meta.minPlan];
}

export function getPlanModuleCodes(planCode: PlanCode): CanonicalModuleCode[] {
  return CANONICAL_MODULES.filter((m) => isModuleIncludedInPlan(m.code, planCode)).map(
    (m) => m.code,
  );
}

export function getRequiredPlanBadgeLabel(minPlan: PlanCode): string {
  if (minPlan === 'empresa') return 'Disponible en plan Empresa';
  if (minPlan === 'crece') return 'Disponible en plan Crece';
  return 'Incluido en plan Inicia';
}

/**
 * Fuente única para determinar si una membresía tiene rol administrativo real.
 * Nunca asume "admin" cuando `perfilCodigo` es null o indefinido.
 */
export function isTenantAdminRole(
  esPropietario?: boolean | null,
  perfilCodigo?: string | null,
): boolean {
  if (esPropietario === true) return true;
  const clean = (perfilCodigo ?? '').trim().toLowerCase();
  return clean === 'admin' || clean === 'administrador';
}

/**
 * Normaliza códigos legados de módulos (39/12 códigos antiguos) hacia los
 * códigos canónicos de 19 módulos, descartando contenedores y retirados.
 */
export function normalizeModuleCodesToCanonical(
  rawCodes: readonly string[],
): CanonicalModuleCode[] {
  const result = new Set<CanonicalModuleCode>();

  for (const raw of rawCodes) {
    const code = raw.trim().toLowerCase();
    if (!code) continue;

    if (isCanonicalModuleCode(code)) {
      result.add(code);
      continue;
    }

    switch (code) {
      case 'calendario_trabajos':
        result.add('calendario');
        result.add('trabajos');
        break;
      case 'cobranzas_comprobantes':
        result.add('cobranzas');
        result.add('comprobantes');
        break;
      case 'convenios':
        result.add('liquidaciones');
        break;
      case 'postventa':
        result.add('post_venta');
        break;
      case 'caja':
        result.add('caja_bancos');
        break;
      case 'academia':
      case 'biblioteca':
        result.add('biblioteca_academia');
        break;
      case 'sitio_web':
      case 'sitio-web':
        result.add('sitio_web_reservas');
        break;
      case 'finanzas':
        result.add('cobranzas');
        result.add('comprobantes');
        result.add('liquidaciones');
        result.add('caja_bancos');
        result.add('rentabilidad');
        break;
      default:
        // Contenedores ('ventas', 'operacion', 'equipo', 'crecimiento') y códigos retirados
        // ('ocurrencias', 'contratos', 'valorizaciones', 'configuraciones', etc.) se excluyen.
        break;
    }
  }

  return CANONICAL_MODULES.filter((m) => result.has(m.code)).map((m) => m.code);
}

/**
 * Calcula la primera ruta permitida siguiendo exactamente el orden jerárquico
 * del Sidebar:
 * Inicio -> Calendario -> Ventas -> Operación -> Finanzas -> Equipo -> Crecimiento -> Reportes -> Configuraciones.
 * Retorna `null` cuando el usuario tiene 0 módulos asignados y sin acceso a Configuraciones.
 */
export function getFirstAllowedDashboardPath(
  enabledModuleCodes: Iterable<string>,
  canAccessConfig = false,
): string | null {
  const allowedSet = new Set(enabledModuleCodes);

  for (const mod of CANONICAL_MODULES) {
    if (allowedSet.has(mod.code)) {
      return mod.href;
    }
  }

  if (canAccessConfig) {
    return '/dashboard/configuraciones';
  }

  return null;
}
