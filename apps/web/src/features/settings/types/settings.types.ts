import {
  CANONICAL_MODULES,
  maskDocumentForDisplay,
  type CanonicalModuleCode,
  type ModuleIconKey,
  type OperationModelCode,
  type PlanCode,
  type ProcessKey,
} from "@vittkly/shared";

export type MemberStatus = "active" | "pending" | "suspended";

export type AccessScope = "web" | "mobile" | "both";

export type AccessLabel = "Solo web" | "Solo app" | "Web y app";

export type DocumentType = "DNI" | "carné de extranjería" | "pasaporte";

export type AuthMethod =
  "google" | "microsoft" | "whatsapp" | "pin" | "password";

export interface TeamMember {
  id: string;
  sourceType: "membresia" | "invitacion";
  userId: string;
  perfilId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  docType?: DocumentType | null;
  docNumberMasked?: string | null;
  role: string;
  roleCode?: string;
  isOwner: boolean;
  isCurrentUser: boolean;
  accesoWeb: boolean;
  accesoApp: boolean;
  accessScope: AccessScope;
  accessLabel: AccessLabel;
  accessMethods: AuthMethod[];
  status: MemberStatus;
  statusLabel?: string;
  jobTitle?: string | null;
  invitationId?: string | null;
  invitationType?: "nueva_cuenta" | "cuenta_existente" | null;
  invitationExpiresAt?: string | null;
  createdAt: string;
}

export type DocumentLookupResult =
  | {
      status: "ya_es_miembro";
      maskedName: string;
      roleName: string;
      membershipStatus: "activa" | "desactivada";
      registeredAt: string;
      daysSinceRegistration: number;
    }
  | {
      status: "invitacion_pendiente";
      invitationId: string;
      maskedName: string;
      roleName: string;
      sentAt: string;
      expiresAt: string;
      hoursSinceSent: number;
      daysSinceSent: number;
    }
  | {
      status: "cuenta_existente";
      docType: DocumentType;
      maskedName: string;
      maskedEmail: string;
      maskedDocNumber: string;
      maskedPhone: string;
    }
  | {
      status: "no_encontrado";
      docType: DocumentType;
      normalizedDocNumber: string;
    };

export interface GeneratedInvitationPayload {
  invitationId: string;
  tipo: "nueva_cuenta" | "cuenta_existente";
  recipientName: string;
  recipientEmail: string | null;
  recipientPhone: string | null;
  recipientDocumentMasked: string | null;
  perfilNombre: string;
  accessLabel: AccessLabel;
  expiresAt: string;
  invitationPath: string | null;
  emailSent?: boolean;
  emailError?: string | null;
  canResend?: boolean;
}

export interface InvitationRecord {
  id: string;
  tipo: "nueva_cuenta" | "cuenta_existente";
  usuarioId: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  docType: DocumentType | null;
  docNumberMasked: string | null;
  perfilId: string;
  perfilNombre: string;
  cargo: string | null;
  accesoWeb: boolean;
  accesoApp: boolean;
  accessLabel: AccessLabel;
  estado:
    "pendiente" | "aceptada" | "rechazada" | "vencida" | "anulada" | "usada";
  motivoRechazo: string | null;
  venceEn: string;
  respondidaEn: string | null;
  creadoEn: string;
}

export interface ExitRequestRecord {
  id: string;
  membresiaId: string;
  usuarioId: string;
  fullName: string;
  email: string | null;
  perfilNombre: string;
  motivo: string | null;
  estado: "pendiente" | "aprobada" | "rechazada";
  comentarioResolucion: string | null;
  serviciosFuturos: number;
  creadoEn: string;
  resueltoEn: string | null;
}

export type RestrictionScope = "todas" | "equipo" | "propias" | "ninguna";

export type RestrictionKey =
  | "ver_montos_cotizaciones"
  | "editar_cotizaciones"
  | "eliminar_cotizaciones"
  | "programar_reprogramar"
  | "pagos_clientes"
  | "costeo_margenes"
  | "cancelar_servicios";

export interface ProfileConfiguration {
  modulos: string[];
  opciones: {
    ve_precios_montos: boolean;
    valida_servicios: boolean;
    es_personal_campo: boolean;
  };
  restricciones: Record<RestrictionKey, RestrictionScope>;
  descargar_archivos: boolean;
  aprueba_solicitudes: boolean;
  ocultar_datos_cliente: {
    telefonos: boolean;
    correos: boolean;
    documento: boolean;
    direccion: boolean;
  };
  horario_acceso: {
    restringido: boolean;
    inicio: string;
    fin: string;
  };
  dispositivo_acceso: "cualquiera" | "solo_web" | "solo_app";
}

export interface CompanyProfile {
  id: string;
  codigo: string | null;
  nombre: string;
  descripcion: string;
  recomendadoPara: string;
  esBase: boolean;
  usageCount: number;
  configuracion: ProfileConfiguration;
}

export interface AuditLogEntry {
  id: number;
  accion: "crear" | "editar" | "borrar" | string;
  tabla: string;
  registroId: string | null;
  actorNombre: string;
  resumen: string;
  creadoEn: string;
}

export interface UsersProfilesBundle {
  members: TeamMember[];
  profiles: CompanyProfile[];
  invitations: InvitationRecord[];
  exitRequests: ExitRequestRecord[];
  auditLogs: AuditLogEntry[];
  activePlanCode: PlanCode;
  allowedPlanModules: CanonicalModuleCode[];
}

export interface ProfileModuleCatalogItem {
  code: CanonicalModuleCode;
  label: string;
  description: string;
  process: ProcessKey;
  processLabel: string;
  iconKey: ModuleIconKey;
  minPlan: PlanCode;
  isPronto?: boolean;
}

export const PROFILE_MODULES_CATALOG: ProfileModuleCatalogItem[] =
  CANONICAL_MODULES.map((mod) => ({
    code: mod.code,
    label: mod.label,
    description: mod.description,
    process: mod.process,
    processLabel: mod.processLabel,
    iconKey: mod.iconKey,
    minPlan: mod.minPlan,
    isPronto: mod.isPronto,
  }));

export const RESTRICTION_FIELDS_META: {
  key: RestrictionKey;
  label: string;
  shortHeader: string;
}[] = [
  {
    key: "ver_montos_cotizaciones",
    label: "Ver montos de cotizaciones",
    shortHeader: "VER MONTOS DE COTIZACIONES",
  },
  {
    key: "editar_cotizaciones",
    label: "Editar cotizaciones",
    shortHeader: "EDITAR COTIZACIONES",
  },
  {
    key: "eliminar_cotizaciones",
    label: "Eliminar cotizaciones",
    shortHeader: "ELIMINAR COTIZACIONES",
  },
  {
    key: "programar_reprogramar",
    label: "Programar y reprogramar",
    shortHeader: "PROGRAMAR Y REPROGRAMAR",
  },
  {
    key: "pagos_clientes",
    label: "Pagos de clientes",
    shortHeader: "PAGOS DE CLIENTES",
  },
  {
    key: "costeo_margenes",
    label: "Costeo y márgenes",
    shortHeader: "COSTEO Y MÁRGENES",
  },
  {
    key: "cancelar_servicios",
    label: "Cancelar servicios",
    shortHeader: "CANCELAR SERVICIOS",
  },
];

export function mapFlagsToAccessLabel(
  accesoWeb: boolean,
  accesoApp: boolean,
): AccessLabel {
  if (accesoWeb && !accesoApp) return "Solo web";
  if (!accesoWeb && accesoApp) return "Solo app";
  return "Web y app";
}

export function mapAccessLabelToFlags(label: AccessLabel): {
  accesoWeb: boolean;
  accesoApp: boolean;
  accessScope: AccessScope;
} {
  if (label === "Solo web") {
    return { accesoWeb: true, accesoApp: false, accessScope: "web" };
  }
  if (label === "Solo app") {
    return { accesoWeb: false, accesoApp: true, accessScope: "mobile" };
  }
  return { accesoWeb: true, accesoApp: true, accessScope: "both" };
}

export function maskDocumentNumber(docNumber?: string | null): string | null {
  if (!docNumber || !docNumber.trim()) return null;
  return maskDocumentForDisplay(docNumber);
}

export type SettingsCategoryKey =
  "negocio" | "operacion" | "ventas" | "equipo" | "cuenta";

export interface SettingsSubmodule {
  slug: string;
  name: string;
  code: string;
  category: SettingsCategoryKey;
  categoryLabel: string;
  description: string;
  isActiveModule?: boolean;
}

export const SETTINGS_CATEGORIES: {
  key: SettingsCategoryKey;
  label: string;
}[] = [
  { key: "negocio", label: "MI NEGOCIO" },
  { key: "operacion", label: "OPERACIÓN" },
  { key: "ventas", label: "CLIENTES Y VENTAS" },
  { key: "equipo", label: "EQUIPO" },
  { key: "cuenta", label: "CUENTA VITTKLY" },
];

export interface CompanySettingsBundle {
  empresaId: string;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  direccion: string;
  rubro: string;
  ciudad: string;
  whatsappTelefono: string;
  encabezadoDocumento: string;
  piePaginaDocumento: string;
  logoRuta: string | null;
  iconoMenuRuta: string | null;
  colorMarca: string;
  modeloOperacion: OperationModelCode;
  menuAcordeon: boolean;
  canEdit: boolean;
}

export const SETTINGS_SUBMODULES: SettingsSubmodule[] = [
  // 1. MI NEGOCIO
  {
    slug: "empresa",
    name: "Empresa",
    code: "CFG-EMP",
    category: "negocio",
    categoryLabel: "MI NEGOCIO",
    description:
      "Datos fiscales, razón social, logo institucional y direcciones comerciales.",
    isActiveModule: true,
  },
  {
    slug: "plantillas-cotizacion",
    name: "Plantillas de cotización",
    code: "CFG-COT",
    category: "negocio",
    categoryLabel: "MI NEGOCIO",
    description:
      "Modelos PDF, términos y condiciones predeterminados para propuestas.",
  },
  {
    slug: "mix-tarifarios",
    name: "Mix tarifarios",
    code: "CFG-MIX",
    category: "negocio",
    categoryLabel: "MI NEGOCIO",
    description:
      "Listas de precios, fórmulas por m², recargos por urgencia y márgenes.",
  },
  {
    slug: "cotizaciones-cobros",
    name: "Cotizaciones y cobros",
    code: "CFG-COB",
    category: "negocio",
    categoryLabel: "MI NEGOCIO",
    description:
      "Cuentas bancarias de depósito, pasarelas de pago y políticas de cobranza.",
  },
  {
    slug: "convenios",
    name: "Convenios",
    code: "CFG-CON",
    category: "negocio",
    categoryLabel: "MI NEGOCIO",
    description:
      "Descuentos por volumen corporativo, tarifas marco y alianzas comerciales.",
  },

  // 2. OPERACIÓN
  {
    slug: "formularios-terminos",
    name: "Formularios y Términos",
    code: "CFG-FOR",
    category: "operacion",
    categoryLabel: "OPERACIÓN",
    description:
      "Actas de conformidad, checklists técnicos y cláusulas de responsabilidad.",
  },
  {
    slug: "equipos-funciones",
    name: "Equipos de trabajo y funciones",
    code: "CFG-EQP",
    category: "operacion",
    categoryLabel: "OPERACIÓN",
    description:
      "Grupos de servicio, especialidades operativas y cuadrillas en ruta.",
  },
  {
    slug: "marcaciones-tiempo",
    name: "Marcaciones y tiempo",
    code: "CFG-MPO",
    category: "operacion",
    categoryLabel: "OPERACIÓN",
    description:
      "Geocercas de inicio de turno, tolerancias y control de horas extras.",
  },
  {
    slug: "rutas-kilometros",
    name: "Rutas y kilómetros",
    code: "CFG-RUT",
    category: "operacion",
    categoryLabel: "OPERACIÓN",
    description:
      "Costeo por kilómetro recorrido, zonas tarifarias y viáticos de viaje.",
  },
  {
    slug: "trabajos-agenda",
    name: "Trabajos y agenda",
    code: "CFG-TRB",
    category: "operacion",
    categoryLabel: "OPERACIÓN",
    description:
      "Ventanas horarias de atención, tiempos de colchón y estados de visita.",
  },

  // 3. CLIENTES Y VENTAS
  {
    slug: "crm-clientes",
    name: "CRM & Clientes",
    code: "CFG-CRM",
    category: "ventas",
    categoryLabel: "CLIENTES Y VENTAS",
    description:
      "Segmentación de clientes, campos personalizados y ciclo de vida de cuenta.",
  },
  {
    slug: "activaciones",
    name: "Activaciones",
    code: "CFG-ACT",
    category: "ventas",
    categoryLabel: "CLIENTES Y VENTAS",
    description:
      "Onboarding de clientes nuevos, encuestas de bienvenida y recordatorios.",
  },
  {
    slug: "post-venta",
    name: "Post venta",
    code: "CFG-PST",
    category: "ventas",
    categoryLabel: "CLIENTES Y VENTAS",
    description:
      "Garantías de servicio, seguimiento de calidad y encuestas CSAT / NPS.",
  },
  {
    slug: "mensajes-avisos",
    name: "Mensajes y avisos",
    code: "CFG-MSG",
    category: "ventas",
    categoryLabel: "CLIENTES Y VENTAS",
    description:
      "Plantillas de WhatsApp, SMS transaccionales y notificaciones de visita.",
  },

  // 4. EQUIPO (MÓDULO ACTIVO)
  {
    slug: "usuarios-perfiles",
    name: "Usuarios y perfiles",
    code: "CFG-USR",
    category: "equipo",
    categoryLabel: "EQUIPO",
    description:
      "Control de acceso B2B, colaboradores del equipo, roles y permisos.",
    isActiveModule: true,
  },

  // 5. CUENTA VITTKLY
  {
    slug: "mi-plan",
    name: "Mi plan y consumo",
    code: "CFG-PLN",
    category: "cuenta",
    categoryLabel: "CUENTA VITTKLY",
    description:
      "Suscripción activa, licencias de técnicos, almacenamiento y facturación SaaS.",
  },
];
