export type MemberStatus = "active" | "pending" | "suspended";

export type AccessScope = "web" | "mobile" | "both";

export type AuthMethod =
  "google" | "microsoft" | "whatsapp" | "pin" | "password";

export interface TeamMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  roleCode?: string;
  isOwner: boolean;
  isCurrentUser: boolean;
  accessScope: AccessScope;
  accessMethods: AuthMethod[];
  status: MemberStatus;
  statusLabel?: string;
  jobTitle?: string | null;
  createdAt: string;
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
