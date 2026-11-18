import {
  maskDocumentForDisplay,
  maskEmailAddress,
  maskPersonName,
  maskPhoneLocal,
} from "@vittkly/shared";
import {
  AUDIT_ACTION_EVENTS,
  AUDIT_ORIGIN_KEYS,
  SYSTEM_AUDIT_ACTOR_ID,
  type AuditActionEvent,
  type AuditActionPresentation,
  type AuditFilterParams,
  type AuditLogEntry,
  type AuditOriginKey,
  type AuditTimeRange,
  type CanonicalAuditActionEvent,
} from "../types/settings.types";

export interface RawAuditLogRow {
  id: number;
  empresa_id?: string | null;
  usuario_id?: string | null;
  accion: string;
  tipo_evento?: string | null;
  origen?: string | null;
  actor_nombre?: string | null;
  actor_correo?: string | null;
  entidad_nombre?: string | null;
  campos_modificados?: string[] | null;
  detalle?: string | null;
  metadatos?: unknown;
  tabla: string;
  registro_id?: string | null;
  antes?: unknown;
  despues?: unknown;
  creado_en: string;
}

export interface AuditActorInfo {
  fullName: string;
  email?: string | null;
}

export interface AuditFormatContext {
  userNamesById?: Map<string, AuditActorInfo>;
  profileNamesById?: Map<string, string>;
  companyName?: string | null;
  currentUserId?: string | null;
}

const CANONICAL_EVENT_SET = new Set<string>(AUDIT_ACTION_EVENTS);
const CANONICAL_ORIGIN_SET = new Set<string>(AUDIT_ORIGIN_KEYS);

const ACTION_PRESENTATIONS: Record<
  CanonicalAuditActionEvent,
  AuditActionPresentation
> = {
  crear: {
    tipoEvento: "crear",
    label: "Creación",
    variant: "success",
    badgeClassName: "bg-success-soft text-success-ink border-success/30",
    dotClassName: "bg-success",
  },
  aprobar: {
    tipoEvento: "aprobar",
    label: "Aprobación",
    variant: "success",
    badgeClassName: "bg-surface-raised text-success-ink border-success/40",
    dotClassName: "bg-success",
  },
  aceptar: {
    tipoEvento: "aceptar",
    label: "Aceptación",
    variant: "success",
    badgeClassName: "bg-success-soft text-ink border-success/40",
    dotClassName: "bg-success",
  },
  reactivar: {
    tipoEvento: "reactivar",
    label: "Reactivación",
    variant: "success",
    badgeClassName: "bg-surface-sunken text-success-ink border-success/30",
    dotClassName: "bg-success",
  },
  editar: {
    tipoEvento: "editar",
    label: "Edición",
    variant: "primary",
    badgeClassName: "bg-primary-soft text-primary-ink border-primary/20",
    dotClassName: "bg-primary",
  },
  invitar: {
    tipoEvento: "invitar",
    label: "Invitación",
    variant: "plan",
    badgeClassName: "bg-primary-ink text-on-primary border-primary-ink",
    dotClassName: "bg-on-primary",
  },
  reenviar: {
    tipoEvento: "reenviar",
    label: "Reenvío",
    variant: "primary",
    badgeClassName: "bg-surface-raised text-primary-ink border-primary/30",
    dotClassName: "bg-primary",
  },
  acceso: {
    tipoEvento: "acceso",
    label: "Acceso",
    variant: "primary",
    badgeClassName: "bg-surface-sunken text-primary-ink border-primary/30",
    dotClassName: "bg-primary",
  },
  suspender: {
    tipoEvento: "suspender",
    label: "Suspensión",
    variant: "warning",
    badgeClassName: "bg-warning-soft text-warning-ink border-warning/30",
    dotClassName: "bg-warning",
  },
  solicitar: {
    tipoEvento: "solicitar",
    label: "Solicitud",
    variant: "warning",
    badgeClassName: "bg-surface-raised text-warning-ink border-warning/40",
    dotClassName: "bg-warning",
  },
  vencer: {
    tipoEvento: "vencer",
    label: "Vencimiento",
    variant: "warning",
    badgeClassName: "bg-surface-sunken text-warning-ink border-warning/30",
    dotClassName: "bg-warning",
  },
  borrar: {
    tipoEvento: "borrar",
    label: "Eliminación",
    variant: "danger",
    badgeClassName: "bg-danger text-on-danger border-danger",
    dotClassName: "bg-on-danger",
  },
  desvincular: {
    tipoEvento: "desvincular",
    label: "Desvinculación",
    variant: "danger",
    badgeClassName: "bg-danger-soft text-danger-ink border-danger/30",
    dotClassName: "bg-danger",
  },
  rechazar: {
    tipoEvento: "rechazar",
    label: "Rechazo",
    variant: "danger",
    badgeClassName: "bg-surface-raised text-danger-ink border-danger/40",
    dotClassName: "bg-danger",
  },
  anular: {
    tipoEvento: "anular",
    label: "Anulación",
    variant: "danger",
    badgeClassName: "bg-surface-sunken text-danger-ink border-danger/30",
    dotClassName: "bg-danger",
  },
};

const ALIAS_PRESENTATIONS: Record<string, AuditActionPresentation> = {
  activar: {
    tipoEvento: "reactivar",
    label: "Activación",
    variant: "success",
    badgeClassName: "bg-surface-sunken text-success-ink border-success/30",
    dotClassName: "bg-success",
  },
  actualizar: {
    tipoEvento: "editar",
    label: "Actualización",
    variant: "primary",
    badgeClassName: "bg-primary-soft text-primary-ink border-primary/20",
    dotClassName: "bg-primary",
  },
};

const NEUTRAL_BADGE_STYLE = {
  variant: "neutral" as const,
  badgeClassName: "bg-surface-sunken text-ink-muted border-line",
  dotClassName: "bg-ink-muted",
};

function humanizeSnakeLabel(raw: string): string {
  const cleaned = raw.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!cleaned) return "Evento";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function getAuditActionPresentation(
  tipoEvento: string | null | undefined,
  accion?: string | null,
): AuditActionPresentation {
  const normalizedTipo = (tipoEvento ?? "").trim().toLowerCase();

  if (normalizedTipo) {
    if (CANONICAL_EVENT_SET.has(normalizedTipo)) {
      return ACTION_PRESENTATIONS[normalizedTipo as CanonicalAuditActionEvent];
    }
    if (ALIAS_PRESENTATIONS[normalizedTipo]) {
      return ALIAS_PRESENTATIONS[normalizedTipo];
    }
    return {
      tipoEvento: normalizedTipo,
      label: humanizeSnakeLabel(normalizedTipo),
      ...NEUTRAL_BADGE_STYLE,
    };
  }

  const normalizedAccion = (accion ?? "").trim().toLowerCase();
  if (
    normalizedAccion === "crear" ||
    normalizedAccion === "editar" ||
    normalizedAccion === "borrar"
  ) {
    return ACTION_PRESENTATIONS[normalizedAccion];
  }

  return {
    tipoEvento: normalizedAccion || "editar",
    label: normalizedAccion ? humanizeSnakeLabel(normalizedAccion) : "Evento",
    ...NEUTRAL_BADGE_STYLE,
  };
}

export const AUDIT_ORIGIN_LABELS: Record<AuditOriginKey, string> = {
  equipo_accesos: "Equipo y accesos",
  perfiles_permisos: "Perfiles y permisos",
  invitaciones: "Invitaciones",
  solicitudes_salida: "Solicitudes de salida",
  empresa_configuracion: "Configuración de empresa",
  operaciones_clientes: "Clientes",
  operaciones_ordenes: "Órdenes de trabajo",
  operaciones_formularios: "Formularios de servicio",
  operaciones_tiempo: "Control de tiempo",
  soporte: "Soporte",
  cuenta_suscripcion: "Cuenta y suscripción",
  plataforma: "Plataforma",
};

const TABLE_TO_ORIGIN_KEY: Record<string, AuditOriginKey> = {
  membresias: "equipo_accesos",
  perfiles: "perfiles_permisos",
  perfil_permisos: "perfiles_permisos",
  invitaciones: "invitaciones",
  solicitudes_salida: "solicitudes_salida",
  empresas: "empresa_configuracion",
  empresa_configuracion: "empresa_configuracion",
  clientes: "operaciones_clientes",
  ordenes_trabajo: "operaciones_ordenes",
  evidencias_orden: "operaciones_ordenes",
  plantillas_formulario: "operaciones_formularios",
  respuestas_formulario: "operaciones_formularios",
  registros_tiempo: "operaciones_tiempo",
  casos_soporte: "soporte",
  cuentas: "cuenta_suscripcion",
  suscripciones: "cuenta_suscripcion",
  verificaciones: "plataforma",
  planes: "plataforma",
  modulos: "plataforma",
  plan_modulos: "plataforma",
  permisos: "plataforma",
  staff_plataforma: "plataforma",
};

const ORIGIN_TO_FILTER_VALUES: Record<AuditOriginKey, string[]> = {
  equipo_accesos: ["equipo_accesos", "membresias", "usuarios"],
  perfiles_permisos: ["perfiles_permisos", "perfiles", "perfil_permisos"],
  invitaciones: ["invitaciones"],
  solicitudes_salida: ["solicitudes_salida"],
  empresa_configuracion: ["empresa_configuracion", "empresas"],
  operaciones_clientes: ["operaciones_clientes", "clientes"],
  operaciones_ordenes: [
    "operaciones_ordenes",
    "ordenes_trabajo",
    "evidencias_orden",
  ],
  operaciones_formularios: [
    "operaciones_formularios",
    "plantillas_formulario",
    "respuestas_formulario",
  ],
  operaciones_tiempo: ["operaciones_tiempo", "registros_tiempo"],
  soporte: ["soporte", "casos_soporte"],
  cuenta_suscripcion: ["cuenta_suscripcion", "cuentas", "suscripciones"],
  plataforma: [
    "plataforma",
    "verificaciones",
    "planes",
    "modulos",
    "plan_modulos",
    "permisos",
    "staff_plataforma",
  ],
};

export function normalizeAuditOrigin(
  rawOrigen: string | null | undefined,
  tabla?: string | null,
  empresaId?: string | null,
): string {
  const cleanedOrigen = (rawOrigen ?? "").trim().toLowerCase();
  const cleanedTabla = (tabla ?? "").trim().toLowerCase();

  if (cleanedOrigen) {
    if (CANONICAL_ORIGIN_SET.has(cleanedOrigen)) {
      return cleanedOrigen;
    }
    if (cleanedOrigen === "usuarios") {
      return empresaId ? "equipo_accesos" : "plataforma";
    }
    if (TABLE_TO_ORIGIN_KEY[cleanedOrigen]) {
      return TABLE_TO_ORIGIN_KEY[cleanedOrigen];
    }
  }

  if (cleanedTabla) {
    if (cleanedTabla === "usuarios") {
      return empresaId ? "equipo_accesos" : "plataforma";
    }
    if (TABLE_TO_ORIGIN_KEY[cleanedTabla]) {
      return TABLE_TO_ORIGIN_KEY[cleanedTabla];
    }
  }

  return cleanedOrigen || cleanedTabla || "plataforma";
}

export function getAuditOriginLabel(
  origen: string | null | undefined,
  tabla?: string | null,
  empresaId?: string | null,
): string {
  const canonical = normalizeAuditOrigin(origen, tabla, empresaId);
  if (CANONICAL_ORIGIN_SET.has(canonical)) {
    return AUDIT_ORIGIN_LABELS[canonical as AuditOriginKey];
  }
  return humanizeSnakeLabel(canonical);
}

export function getAuditOriginFilterValues(origen: string): string[] {
  const cleaned = origen.trim().toLowerCase();
  if (!cleaned || cleaned === "all" || cleaned === "todos") {
    return [];
  }
  const canonical =
    cleaned === "usuarios"
      ? "equipo_accesos"
      : normalizeAuditOrigin(cleaned, undefined, "tenant");
  if (CANONICAL_ORIGIN_SET.has(canonical)) {
    const values = ORIGIN_TO_FILTER_VALUES[canonical as AuditOriginKey];
    return Array.from(new Set([...values, cleaned]));
  }
  return [cleaned];
}

function asJsonObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(
  obj: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!obj) return null;
  const val = obj[key];
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed ? trimmed : null;
}

function readBoolean(
  obj: Record<string, unknown> | null,
  key: string,
): boolean | null {
  if (!obj) return null;
  const val = obj[key];
  return typeof val === "boolean" ? val : null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SECRET_KEY_PATTERN =
  /(secret|password|contrasena|contraseña|passcode|token_hash|codigo_hash|api_key|apikey|private_key|salt|_hash$|_secret$|_token$)/i;

const NOISE_DIFF_KEYS = new Set([
  "actualizado_en",
  "actualizado_por",
  "creado_en",
  "creado_por",
  "datos_enmascarados",
  "id",
  "empresa_id",
]);

const GENERIC_DETAIL_REGEX =
  /^(Creó|Actualizó|Eliminó)\s+registro\s+en\s+[a-z0-9_]+\.?$/i;

const GENERIC_ACTOR_NAMES = new Set([
  "usuario",
  "sistema",
  "sistema / administrador",
  "sin nombre",
]);

export function inferAuditTipoEvento(
  row: Pick<
    RawAuditLogRow,
    "accion" | "tipo_evento" | "tabla" | "antes" | "despues"
  >,
): AuditActionEvent {
  const rawTipo = (row.tipo_evento ?? "").trim().toLowerCase();
  if (rawTipo) {
    if (rawTipo === "activar") return "reactivar";
    if (rawTipo === "actualizar") return "editar";
    return rawTipo;
  }

  const accion = (row.accion ?? "").trim().toLowerCase();
  const tabla = (row.tabla ?? "").trim().toLowerCase();
  const antes = asJsonObject(row.antes);
  const despues = asJsonObject(row.despues);

  const oldEstado = readString(antes, "estado");
  const newEstado = readString(despues, "estado");

  if (accion === "crear") {
    if (tabla === "invitaciones") return "invitar";
    if (
      tabla === "solicitudes_salida" ||
      tabla === "casos_soporte" ||
      tabla === "verificaciones"
    ) {
      return "solicitar";
    }
    return "crear";
  }

  if (accion === "borrar") {
    return "borrar";
  }

  if (tabla === "membresias") {
    if (newEstado === "desactivada" && oldEstado !== "desactivada") {
      return "suspender";
    }
    if (
      newEstado === "activa" &&
      (oldEstado === "desactivada" || oldEstado === "desvinculada")
    ) {
      return "reactivar";
    }
    if (newEstado === "desvinculada" && oldEstado !== "desvinculada") {
      return "desvincular";
    }
    return "editar";
  }

  if (tabla === "invitaciones") {
    if (
      (newEstado === "aceptada" || newEstado === "usada") &&
      oldEstado !== "aceptada" &&
      oldEstado !== "usada"
    ) {
      return "aceptar";
    }
    if (newEstado === "rechazada" && oldEstado !== "rechazada") {
      return "rechazar";
    }
    if (newEstado === "anulada" && oldEstado !== "anulada") {
      return "anular";
    }
    if (newEstado === "vencida" && oldEstado !== "vencida") {
      return "vencer";
    }
    return "editar";
  }

  if (tabla === "solicitudes_salida") {
    if (newEstado === "aprobada" && oldEstado !== "aprobada") return "aprobar";
    if (newEstado === "rechazada" && oldEstado !== "rechazada") {
      return "rechazar";
    }
    return "editar";
  }

  if (tabla === "ordenes_trabajo") {
    if (newEstado === "cancelada" && oldEstado !== "cancelada") return "anular";
    const oldVal = readString(antes, "estado_validacion");
    const newVal = readString(despues, "estado_validacion");
    if (newVal === "aprobado" && oldVal !== "aprobado") return "aprobar";
    if (newVal === "observado" && oldVal !== "observado") return "rechazar";
    return "editar";
  }

  if (tabla === "clientes") {
    const oldActivo = readBoolean(antes, "activo");
    const newActivo = readBoolean(despues, "activo");
    if (oldActivo === true && newActivo === false) return "suspender";
    if (oldActivo === false && newActivo === true) return "reactivar";
    return "editar";
  }

  if (tabla === "plantillas_formulario") {
    const oldActiva = readBoolean(antes, "activa");
    const newActiva = readBoolean(despues, "activa");
    if (oldActiva === true && newActiva === false) return "suspender";
    if (oldActiva === false && newActiva === true) return "reactivar";
    return "editar";
  }

  if (tabla === "suscripciones") {
    if (newEstado === "suspendida" && oldEstado !== "suspendida") {
      return "suspender";
    }
    if (oldEstado === "suspendida" && newEstado === "activa") {
      return "reactivar";
    }
    if (newEstado === "cancelada" && oldEstado !== "cancelada") {
      return "anular";
    }
    return "editar";
  }

  if (tabla === "verificaciones") {
    const oldVerificado = readString(antes, "verificado_en");
    const newVerificado = readString(despues, "verificado_en");
    if (!oldVerificado && newVerificado) return "acceso";
    return "editar";
  }

  return accion === "crear" || accion === "borrar" ? accion : "editar";
}

function resolveMaskedInvitationLabel(
  fila: Record<string, unknown> | null,
): string | null {
  if (!fila) return null;
  const tipo = readString(fila, "tipo");
  const maskedObj = asJsonObject(fila.datos_enmascarados);
  const maskedName = readString(maskedObj, "nombre");
  const maskedEmail = readString(maskedObj, "correo");
  const rawNombres = readString(fila, "nombres");
  const rawApellidos = readString(fila, "apellidos");
  const rawCorreo = readString(fila, "correo");
  const rawCelular = readString(fila, "celular");

  if (tipo === "cuenta_existente") {
    if (maskedName) return maskedName;
    if (rawNombres || rawApellidos) {
      if (rawNombres && rawNombres.includes("****")) {
        return rawNombres;
      }
      return maskPersonName(null, rawNombres, rawApellidos);
    }
    if (maskedEmail) return maskedEmail;
    if (rawCorreo) return maskEmailAddress(rawCorreo);
    return "Cuenta existente";
  }

  const fullName = [rawNombres, rawApellidos].filter(Boolean).join(" ").trim();
  return fullName || rawCorreo || rawCelular || maskedName || null;
}

function maskDestinationValue(destino: string): string {
  return destino.includes("@")
    ? maskEmailAddress(destino)
    : maskPhoneLocal(destino);
}

export function resolveEntityName(
  row: Pick<
    RawAuditLogRow,
    | "tabla"
    | "registro_id"
    | "entidad_nombre"
    | "metadatos"
    | "antes"
    | "despues"
  >,
  context?: AuditFormatContext,
): string | null {
  const tabla = (row.tabla ?? "").trim().toLowerCase();
  const antes = asJsonObject(row.antes);
  const despues = asJsonObject(row.despues);
  const fila = despues ?? antes;
  const metadatos = asJsonObject(row.metadatos);
  const snapshotEntity = (row.entidad_nombre ?? "").trim() || null;

  if (tabla === "invitaciones") {
    const tipo = readString(fila, "tipo");
    if (tipo === "cuenta_existente") {
      if (snapshotEntity && snapshotEntity.includes("****")) {
        return snapshotEntity;
      }
      return resolveMaskedInvitationLabel(fila) ?? "Cuenta existente";
    }
  }

  if (snapshotEntity && !UUID_REGEX.test(snapshotEntity)) {
    if (tabla === "verificaciones" && !snapshotEntity.includes("****")) {
      const parts = snapshotEntity.split("·").map((p) => p.trim());
      return parts
        .map((part) => {
          if (part.includes("@")) {
            return maskDestinationValue(part);
          }
          if (
            /^\+?[\d\s()-]{6,}$/.test(part) &&
            part.replace(/\D/g, "").length >= 6
          ) {
            const normalizedPhone = part.startsWith("+")
              ? `+${part.replace(/\D/g, "")}`
              : part.replace(/\D/g, "");
            return maskDestinationValue(normalizedPhone);
          }
          return part;
        })
        .join(" · ");
    }
    return snapshotEntity;
  }

  if (tabla === "membresias" || tabla === "solicitudes_salida") {
    const targetUserId = readString(fila, "usuario_id");
    const targetUser = targetUserId
      ? context?.userNamesById?.get(targetUserId)
      : undefined;
    if (targetUser?.fullName) return targetUser.fullName;
  }

  if (tabla === "invitaciones") {
    const invLabel = resolveMaskedInvitationLabel(fila);
    if (invLabel) return invLabel;
  }

  if (tabla === "perfiles") {
    return (
      readString(fila, "nombre") ??
      readString(fila, "codigo") ??
      snapshotEntity ??
      row.registro_id ??
      null
    );
  }

  if (tabla === "perfil_permisos") {
    const perfilId = readString(fila, "perfil_id");
    const perfilNombre =
      readString(metadatos, "perfil_nombre") ??
      (perfilId ? context?.profileNamesById?.get(perfilId) : null) ??
      null;
    const permiso = readString(fila, "permiso_codigo");
    const joined = [perfilNombre, permiso].filter(Boolean).join(" · ");
    return joined || snapshotEntity || row.registro_id || null;
  }

  if (tabla === "empresas") {
    return (
      readString(fila, "nombre_comercial") ??
      readString(fila, "razon_social") ??
      snapshotEntity ??
      context?.companyName ??
      row.registro_id ??
      null
    );
  }

  if (tabla === "empresa_configuracion") {
    return snapshotEntity ?? context?.companyName ?? "Configuración general";
  }

  if (tabla === "clientes") {
    return (
      readString(fila, "nombre_completo") ??
      snapshotEntity ??
      row.registro_id ??
      null
    );
  }

  if (tabla === "ordenes_trabajo") {
    const codigo = readString(fila, "codigo");
    const titulo = readString(fila, "titulo");
    const joined = [codigo, titulo].filter(Boolean).join(" · ");
    return joined || snapshotEntity || row.registro_id || null;
  }

  if (tabla === "plantillas_formulario") {
    return (
      readString(fila, "nombre") ??
      readString(fila, "codigo") ??
      snapshotEntity ??
      row.registro_id ??
      null
    );
  }

  if (tabla === "respuestas_formulario") {
    const ordenRef =
      readString(metadatos, "orden_codigo") ??
      readString(fila, "orden_trabajo_id") ??
      row.registro_id;
    return ordenRef ? `Formulario ${ordenRef}` : (snapshotEntity ?? null);
  }

  if (tabla === "evidencias_orden") {
    const ordenRef =
      readString(metadatos, "orden_codigo") ??
      readString(fila, "orden_trabajo_id") ??
      row.registro_id;
    const tipo = readString(fila, "tipo");
    const joined = [ordenRef, tipo].filter(Boolean).join(" · ");
    return joined || snapshotEntity || null;
  }

  if (tabla === "registros_tiempo") {
    const targetUserId = readString(fila, "usuario_id");
    const targetUser = targetUserId
      ? context?.userNamesById?.get(targetUserId)?.fullName
      : null;
    const tipo = readString(fila, "tipo");
    const joined = [targetUser ?? "Técnico", tipo].filter(Boolean).join(" · ");
    return joined || snapshotEntity || row.registro_id || null;
  }

  if (tabla === "cuentas") {
    return (
      readString(fila, "nombre") ?? snapshotEntity ?? row.registro_id ?? null
    );
  }

  if (tabla === "suscripciones") {
    const planNombre = readString(metadatos, "plan_nombre") ?? "Plan";
    const periodo = readString(fila, "periodo");
    return periodo ? `${planNombre} (${periodo})` : planNombre;
  }

  if (tabla === "usuarios") {
    const fullName = [
      readString(fila, "nombres"),
      readString(fila, "apellidos"),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    return (
      readString(fila, "nombre") ??
      (fullName || null) ??
      readString(fila, "correo") ??
      snapshotEntity ??
      row.registro_id ??
      null
    );
  }

  if (tabla === "casos_soporte") {
    const targetUserId = readString(fila, "usuario_id");
    const targetUser = targetUserId
      ? context?.userNamesById?.get(targetUserId)?.fullName
      : null;
    return (
      targetUser ??
      readString(fila, "correo_contacto") ??
      snapshotEntity ??
      "Caso de soporte"
    );
  }

  if (tabla === "verificaciones") {
    const canal = readString(fila, "canal");
    const destino = readString(fila, "destino");
    const maskedDestino = destino
      ? destino.includes("****")
        ? destino
        : maskDestinationValue(destino)
      : null;
    const joined = [canal, maskedDestino].filter(Boolean).join(" · ");
    return joined || snapshotEntity || row.registro_id || null;
  }

  if (tabla === "planes" || tabla === "modulos") {
    return (
      readString(fila, "nombre") ??
      readString(fila, "codigo") ??
      snapshotEntity ??
      row.registro_id ??
      null
    );
  }

  if (tabla === "plan_modulos") {
    return (
      readString(fila, "modulo_codigo") ??
      snapshotEntity ??
      row.registro_id ??
      null
    );
  }

  if (tabla === "permisos") {
    return (
      readString(fila, "codigo") ?? snapshotEntity ?? row.registro_id ?? null
    );
  }

  if (tabla === "staff_plataforma") {
    const targetUserId = readString(fila, "usuario_id");
    const targetUser = targetUserId
      ? context?.userNamesById?.get(targetUserId)?.fullName
      : null;
    return (
      targetUser ??
      readString(fila, "rol") ??
      snapshotEntity ??
      row.registro_id ??
      null
    );
  }

  return (
    readString(fila, "nombre") ??
    readString(fila, "titulo") ??
    readString(fila, "codigo") ??
    snapshotEntity ??
    row.registro_id ??
    null
  );
}

const FIELD_LABELS: Record<string, string> = {
  estado: "Estado",
  perfil_id: "Perfil",
  plan_id: "Plan",
  acceso_web: "Acceso web",
  acceso_app: "Acceso app",
  cargo: "Cargo",
  es_propietario: "Propietario",
  activo: "Estado activo",
  activa: "Activa",
  nombre: "Nombre",
  nombres: "Nombres",
  apellidos: "Apellidos",
  nombre_completo: "Nombre completo",
  nombre_comercial: "Nombre comercial",
  razon_social: "Razón social",
  descripcion: "Descripción",
  recomendado_para: "Recomendado para",
  configuracion: "Configuración de accesos",
  permiso_codigo: "Permiso",
  alcance: "Alcance",
  correo: "Correo",
  correo_contacto: "Correo de contacto",
  celular: "Celular",
  tipo_documento: "Tipo de documento",
  numero_documento: "Número de documento",
  documento_numero: "Número de documento",
  vence_en: "Fecha de vencimiento",
  motivo_rechazo: "Motivo de rechazo",
  motivo: "Motivo",
  comentario_resolucion: "Comentario de resolución",
  titulo: "Título",
  codigo: "Código",
  prioridad: "Prioridad",
  estado_validacion: "Validación",
  monto_total: "Monto total",
  duracion_segundos: "Duración",
  finalizado_en: "Finalizado",
  verificado_en: "Verificado",
  destino: "Destino",
  canal: "Canal",
  periodo: "Periodo",
  distrito: "Distrito",
  direccion: "Dirección",
  igv_incluido: "IGV incluido",
  horario_laboral: "Horario laboral",
  moneda: "Moneda",
  pais: "País",
  modelo_operacion: "Modelo de operación",
  modulo_codigo: "Módulo",
  rol: "Rol",
  completado: "Completado",
  ajustes: "Ajustes",
  esquema_campos: "Esquema de campos",
  respuestas: "Respuestas",
  nota: "Nota",
  notas: "Notas",
  tipo: "Tipo",
  asunto: "Asunto",
  fecha_programada: "Fecha programada",
  tecnico_id: "Técnico asignado",
  cliente_id: "Cliente",
  acceso: "Acceso",
  perfil: "Perfil",
};

const ENUM_VALUE_LABELS: Record<string, string> = {
  solo_web: "Solo web",
  solo_app: "Solo app",
  cualquiera: "Cualquiera",
  en_ruta: "en ruta",
  en_curso: "en curso",
  "en-curso": "en curso",
  nueva_cuenta: "Nueva cuenta",
  cuenta_existente: "Cuenta existente",
  yape_plin: "Yape / Plin",
  desactivada: "suspendida",
};

function getFieldLabel(rawField: string): string {
  const trimmed = rawField.trim();
  const lower = trimmed.toLowerCase();
  if (FIELD_LABELS[lower]) {
    return FIELD_LABELS[lower];
  }
  if (!trimmed.includes("_") && /[A-ZÁÉÍÓÚÑ\s]/.test(trimmed)) {
    return trimmed;
  }
  return humanizeSnakeLabel(trimmed);
}

function isSecretFieldKey(rawField: string): boolean {
  const lower = rawField.trim().toLowerCase();
  return SECRET_KEY_PATTERN.test(lower);
}

function formatFieldValue(
  fieldKey: string,
  rawValue: unknown,
  side: "antes" | "despues",
  row: Pick<RawAuditLogRow, "tabla" | "metadatos" | "antes" | "despues">,
  context?: AuditFormatContext,
): { text: string; isObjectSummary?: boolean } {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return { text: "sin definir" };
  }

  const lowerKey = fieldKey.toLowerCase();

  if (isSecretFieldKey(lowerKey)) {
    return { text: "[protegido]" };
  }

  if (lowerKey === "numero_documento" || lowerKey === "documento_numero") {
    const str = String(rawValue);
    return {
      text:
        str.includes("****") || str.includes("**")
          ? str
          : maskDocumentForDisplay(str),
    };
  }

  if (lowerKey === "destino") {
    const str = String(rawValue);
    return {
      text: str.includes("****") ? str : maskDestinationValue(str),
    };
  }

  const fila = asJsonObject(row.despues) ?? asJsonObject(row.antes);
  if (
    (row.tabla ?? "").toLowerCase() === "invitaciones" &&
    readString(fila, "tipo") === "cuenta_existente"
  ) {
    if (lowerKey === "correo") {
      const str = String(rawValue);
      return { text: str.includes("****") ? str : maskEmailAddress(str) };
    }
    if (lowerKey === "celular") {
      const str = String(rawValue);
      return { text: str.includes("****") ? str : maskPhoneLocal(str) };
    }
    if (lowerKey === "nombres" || lowerKey === "apellidos") {
      const str = String(rawValue);
      return { text: str.includes("****") ? str : maskPersonName(str) };
    }
  }

  if (lowerKey === "perfil_id" && typeof rawValue === "string") {
    const metadatos = asJsonObject(row.metadatos);
    const metaName =
      side === "antes"
        ? readString(metadatos, "perfil_anterior_nombre")
        : readString(metadatos, "perfil_nombre");
    const mapped =
      metaName ?? context?.profileNamesById?.get(rawValue) ?? rawValue;
    return { text: mapped };
  }

  if (lowerKey === "plan_id" && typeof rawValue === "string") {
    const metadatos = asJsonObject(row.metadatos);
    const planName =
      side === "despues" ? readString(metadatos, "plan_nombre") : null;
    return { text: planName ?? rawValue };
  }

  if (typeof rawValue === "boolean") {
    if (lowerKey === "activo" || lowerKey === "activa") {
      return { text: rawValue ? "Activo" : "Inactivo" };
    }
    return { text: rawValue ? "Sí" : "No" };
  }

  if (typeof rawValue === "number") {
    if (lowerKey === "duracion_segundos") {
      const mins = Math.round(rawValue / 60);
      return { text: mins >= 1 ? `${mins} min` : `${rawValue} s` };
    }
    return { text: String(rawValue) };
  }

  if (Array.isArray(rawValue)) {
    if (rawValue.length === 0) return { text: "ninguno" };
    const scalarItems = rawValue.every(
      (item) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    );
    if (scalarItems && rawValue.length <= 3) {
      return { text: rawValue.map(String).join(", ") };
    }
    return { text: `${rawValue.length} elemento(s)` };
  }

  if (typeof rawValue === "object") {
    return { text: "actualizado", isObjectSummary: true };
  }

  const strVal = String(rawValue).trim();
  if (!strVal) return { text: "sin definir" };

  const enumMapped = ENUM_VALUE_LABELS[strVal.toLowerCase()];
  if (enumMapped) {
    return { text: enumMapped };
  }

  if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(strVal) && !strVal.includes("@")) {
    return { text: strVal.replace(/_/g, " ") };
  }

  return { text: strVal };
}

function formatSingleChangePill(
  campo: string,
  antesVal: unknown,
  despuesVal: unknown,
  row: Pick<RawAuditLogRow, "tabla" | "metadatos" | "antes" | "despues">,
  context?: AuditFormatContext,
): string | null {
  const label = getFieldLabel(campo);

  if (isSecretFieldKey(campo)) {
    return `${label}: [protegido]`;
  }

  const beforeFormatted = formatFieldValue(
    campo,
    antesVal,
    "antes",
    row,
    context,
  );
  const afterFormatted = formatFieldValue(
    campo,
    despuesVal,
    "despues",
    row,
    context,
  );

  if (beforeFormatted.isObjectSummary || afterFormatted.isObjectSummary) {
    return `${label}: actualizado`;
  }

  const beforeEmpty =
    antesVal === null || antesVal === undefined || antesVal === "";
  const afterEmpty =
    despuesVal === null || despuesVal === undefined || despuesVal === "";

  if (beforeEmpty && afterEmpty) {
    return null;
  }

  if (beforeEmpty) {
    return `${label}: ${afterFormatted.text}`;
  }

  if (afterEmpty) {
    return `${label}: ${beforeFormatted.text} → sin definir`;
  }

  if (beforeFormatted.text === afterFormatted.text) {
    return `${label}: ${afterFormatted.text}`;
  }

  return `${label}: ${beforeFormatted.text} → ${afterFormatted.text}`;
}

export function formatAuditChanges(
  row: Pick<
    RawAuditLogRow,
    | "accion"
    | "tabla"
    | "campos_modificados"
    | "metadatos"
    | "antes"
    | "despues"
  >,
  context?: AuditFormatContext,
): string[] {
  const metadatos = asJsonObject(row.metadatos);
  const antes = asJsonObject(row.antes);
  const despues = asJsonObject(row.despues);
  const tabla = (row.tabla ?? "").trim().toLowerCase();

  // Priority 1: metadatos.cambios structured array
  const rawCambios = metadatos?.cambios;
  if (Array.isArray(rawCambios) && rawCambios.length > 0) {
    const chips: string[] = [];
    for (const item of rawCambios) {
      const obj = asJsonObject(item);
      if (!obj) continue;
      const campo = readString(obj, "campo");
      if (!campo) continue;
      if (
        NOISE_DIFF_KEYS.has(campo.toLowerCase()) ||
        (tabla === "empresa_configuracion" && campo.toLowerCase() === "version")
      ) {
        continue;
      }
      const pill = formatSingleChangePill(
        campo,
        obj.antes ?? null,
        obj.despues ?? null,
        row,
        context,
      );
      if (pill && !chips.includes(pill)) {
        chips.push(pill);
      }
    }
    if (chips.length > 0) {
      return chips;
    }
  }

  // Priority 2: campos_modificados paired with antes/despues
  const camposMod = Array.isArray(row.campos_modificados)
    ? row.campos_modificados.filter((c): c is string => typeof c === "string")
    : [];

  if (camposMod.length > 0) {
    const chips: string[] = [];
    for (const campo of camposMod) {
      const lower = campo.trim().toLowerCase();
      if (!lower) continue;
      if (
        NOISE_DIFF_KEYS.has(lower) ||
        (tabla === "empresa_configuracion" && lower === "version")
      ) {
        continue;
      }
      if (isSecretFieldKey(lower)) {
        const pill = `${getFieldLabel(campo)}: [protegido]`;
        if (!chips.includes(pill)) chips.push(pill);
        continue;
      }
      if (antes || despues) {
        const pill = formatSingleChangePill(
          campo,
          antes?.[campo] ?? null,
          despues?.[campo] ?? null,
          row,
          context,
        );
        if (pill && !chips.includes(pill)) {
          chips.push(pill);
        }
      } else {
        const pill = `${getFieldLabel(campo)}: actualizado`;
        if (!chips.includes(pill)) {
          chips.push(pill);
        }
      }
    }
    if (chips.length > 0) {
      return chips;
    }
  }

  // Priority 3: Legacy UPDATE diff of antes vs despues
  if ((row.accion ?? "").toLowerCase() === "editar" && (antes || despues)) {
    const allKeys = new Set<string>([
      ...Object.keys(antes ?? {}),
      ...Object.keys(despues ?? {}),
    ]);
    const chips: string[] = [];
    for (const key of Array.from(allKeys).sort()) {
      const lower = key.toLowerCase();
      if (
        NOISE_DIFF_KEYS.has(lower) ||
        isSecretFieldKey(lower) ||
        (tabla === "empresa_configuracion" && lower === "version")
      ) {
        continue;
      }
      const oldVal = antes?.[key] ?? null;
      const newVal = despues?.[key] ?? null;
      if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
        continue;
      }
      const pill = formatSingleChangePill(key, oldVal, newVal, row, context);
      if (pill && !chips.includes(pill)) {
        chips.push(pill);
      }
    }
    return chips;
  }

  return [];
}

function synthesizeResumen(
  row: RawAuditLogRow,
  tipoEvento: AuditActionEvent,
  entidadNombre: string | null,
  context?: AuditFormatContext,
): string {
  const tabla = (row.tabla ?? "").trim().toLowerCase();
  const accion = (row.accion ?? "").trim().toLowerCase();
  const antes = asJsonObject(row.antes);
  const despues = asJsonObject(row.despues);
  const fila = despues ?? antes;
  const metadatos = asJsonObject(row.metadatos);
  const targetLabel = entidadNombre ?? "registro";
  const perfilNombre =
    readString(metadatos, "perfil_nombre") ??
    (readString(fila, "perfil_id")
      ? context?.profileNamesById?.get(readString(fila, "perfil_id")!)
      : null);

  switch (tabla) {
    case "membresias": {
      if (tipoEvento === "crear") {
        const esPropietario = readBoolean(fila, "es_propietario") === true;
        const base = esPropietario
          ? `Registró al propietario «${targetLabel}»`
          : `Incorporó a «${targetLabel}» al equipo`;
        return perfilNombre ? `${base} con perfil «${perfilNombre}»` : base;
      }
      if (tipoEvento === "suspender") {
        return `Suspendió el acceso de «${targetLabel}» en la empresa`;
      }
      if (tipoEvento === "reactivar") {
        return `Reactivó el acceso de «${targetLabel}» en la empresa`;
      }
      if (tipoEvento === "desvincular") {
        return `Desvinculó a «${targetLabel}» de la empresa`;
      }
      if (tipoEvento === "borrar") {
        return `Eliminó la membresía de «${targetLabel}»`;
      }
      return `Actualizó perfil o accesos de «${targetLabel}»`;
    }

    case "invitaciones": {
      if (tipoEvento === "invitar" || accion === "crear") {
        const base = `Envió invitación a ${targetLabel}`;
        return perfilNombre ? `${base} con perfil «${perfilNombre}»` : base;
      }
      if (tipoEvento === "reenviar") {
        return `Reenvió invitación a ${targetLabel}`;
      }
      if (tipoEvento === "aceptar") {
        return `Aceptó la invitación (${targetLabel})`;
      }
      if (tipoEvento === "rechazar") {
        return `Rechazó la invitación (${targetLabel})`;
      }
      if (tipoEvento === "anular") {
        return `Anuló la invitación de ${targetLabel}`;
      }
      if (tipoEvento === "vencer") {
        return `Marcó como vencida la invitación de ${targetLabel}`;
      }
      if (tipoEvento === "borrar") {
        return `Eliminó la invitación de ${targetLabel}`;
      }
      return `Actualizó la invitación de ${targetLabel}`;
    }

    case "solicitudes_salida": {
      if (tipoEvento === "solicitar" || accion === "crear") {
        return `«${targetLabel}» solicitó salir de la empresa`;
      }
      if (tipoEvento === "aprobar") {
        return `Aprobó la solicitud de salida de «${targetLabel}»`;
      }
      if (tipoEvento === "rechazar") {
        return `Rechazó la solicitud de salida de «${targetLabel}»`;
      }
      if (tipoEvento === "borrar") {
        return `Eliminó la solicitud de salida de «${targetLabel}»`;
      }
      return `Actualizó la solicitud de salida de «${targetLabel}»`;
    }

    case "perfiles": {
      if (accion === "crear") return `Creó el perfil «${targetLabel}»`;
      if (accion === "borrar") return `Eliminó el perfil «${targetLabel}»`;
      return `Actualizó el perfil «${targetLabel}»`;
    }

    case "perfil_permisos": {
      const permiso = readString(fila, "permiso_codigo") ?? targetLabel;
      const pName =
        perfilNombre ??
        (readString(fila, "perfil_id")
          ? context?.profileNamesById?.get(readString(fila, "perfil_id")!)
          : null);
      if (accion === "crear") {
        return pName
          ? `Asignó el permiso «${permiso}» al perfil «${pName}»`
          : `Asignó el permiso «${permiso}»`;
      }
      if (accion === "borrar") {
        return pName
          ? `Quitó el permiso «${permiso}» del perfil «${pName}»`
          : `Quitó el permiso «${permiso}»`;
      }
      return pName
        ? `Modificó el permiso «${permiso}» en el perfil «${pName}»`
        : `Modificó el permiso «${permiso}»`;
    }

    case "empresas": {
      if (accion === "crear") return `Registró la empresa «${targetLabel}»`;
      if (accion === "borrar") return `Eliminó la empresa «${targetLabel}»`;
      return `Actualizó datos de la empresa «${targetLabel}»`;
    }

    case "empresa_configuracion": {
      if (accion === "crear") {
        return "Inicializó la configuración general de la empresa";
      }
      if (accion === "borrar") {
        return "Eliminó la configuración general de la empresa";
      }
      return "Actualizó la configuración general de la empresa";
    }

    case "cuentas": {
      if (accion === "crear") {
        return `Registró la cuenta de facturación «${targetLabel}»`;
      }
      if (accion === "borrar") {
        return `Eliminó la cuenta de facturación «${targetLabel}»`;
      }
      return `Actualizó la cuenta de facturación «${targetLabel}»`;
    }

    case "suscripciones": {
      if (accion === "crear") {
        return `Activó la suscripción al plan «${targetLabel}»`;
      }
      if (tipoEvento === "suspender") {
        return `Suspendió la suscripción al plan «${targetLabel}»`;
      }
      if (tipoEvento === "reactivar") {
        return `Reactivó la suscripción al plan «${targetLabel}»`;
      }
      if (tipoEvento === "anular") {
        return `Canceló la suscripción al plan «${targetLabel}»`;
      }
      if (accion === "borrar") {
        return `Eliminó la suscripción al plan «${targetLabel}»`;
      }
      return `Actualizó la suscripción al plan «${targetLabel}»`;
    }

    case "usuarios": {
      if (accion === "crear") return `Registró al usuario «${targetLabel}»`;
      if (accion === "borrar") return `Eliminó al usuario «${targetLabel}»`;
      return `Actualizó los datos del usuario «${targetLabel}»`;
    }

    case "casos_soporte": {
      if (tipoEvento === "solicitar" || accion === "crear") {
        return `Registró caso de soporte para ${targetLabel}`;
      }
      if (accion === "borrar") {
        return `Eliminó caso de soporte de ${targetLabel}`;
      }
      return `Actualizó caso de soporte de ${targetLabel}`;
    }

    case "clientes": {
      if (accion === "crear") return `Registró al cliente «${targetLabel}»`;
      if (tipoEvento === "suspender")
        return `Desactivó al cliente «${targetLabel}»`;
      if (tipoEvento === "reactivar")
        return `Reactivó al cliente «${targetLabel}»`;
      if (accion === "borrar") return `Eliminó al cliente «${targetLabel}»`;
      return `Actualizó datos del cliente «${targetLabel}»`;
    }

    case "ordenes_trabajo": {
      if (accion === "crear") {
        return `Creó la orden de trabajo «${targetLabel}»`;
      }
      if (tipoEvento === "anular") {
        return `Canceló la orden de trabajo «${targetLabel}»`;
      }
      if (tipoEvento === "aprobar") {
        return `Aprobó la validación de la orden «${targetLabel}»`;
      }
      if (tipoEvento === "rechazar") {
        return `Observó la validación de la orden «${targetLabel}»`;
      }
      if (accion === "borrar") {
        return `Eliminó la orden de trabajo «${targetLabel}»`;
      }
      return `Actualizó la orden de trabajo «${targetLabel}»`;
    }

    case "plantillas_formulario": {
      if (accion === "crear") {
        return `Creó la plantilla de formulario «${targetLabel}»`;
      }
      if (tipoEvento === "suspender") {
        return `Desactivó la plantilla de formulario «${targetLabel}»`;
      }
      if (tipoEvento === "reactivar") {
        return `Reactivó la plantilla de formulario «${targetLabel}»`;
      }
      if (accion === "borrar") {
        return `Eliminó la plantilla de formulario «${targetLabel}»`;
      }
      return `Actualizó la plantilla de formulario «${targetLabel}»`;
    }

    case "respuestas_formulario": {
      const ordenRef =
        readString(metadatos, "orden_codigo") ??
        readString(fila, "orden_trabajo_id") ??
        row.registro_id ??
        "servicio";
      if (accion === "crear") {
        return `Registró respuesta de formulario en orden ${ordenRef}`;
      }
      if (accion === "borrar") {
        return `Eliminó respuesta de formulario en orden ${ordenRef}`;
      }
      return `Actualizó respuesta de formulario en orden ${ordenRef}`;
    }

    case "evidencias_orden": {
      const ordenRef =
        readString(metadatos, "orden_codigo") ??
        readString(fila, "orden_trabajo_id") ??
        row.registro_id ??
        "servicio";
      const tipoEvidencia = readString(fila, "tipo") ?? "archivo";
      if (accion === "crear") {
        return `Adjuntó evidencia (${tipoEvidencia}) en orden ${ordenRef}`;
      }
      if (accion === "borrar") {
        return `Eliminó evidencia (${tipoEvidencia}) en orden ${ordenRef}`;
      }
      return `Actualizó evidencia (${tipoEvidencia}) en orden ${ordenRef}`;
    }

    case "registros_tiempo": {
      const tipoReg = readString(fila, "tipo") ?? "general";
      if (accion === "crear") {
        return `Inició registro de tiempo (${tipoReg})`;
      }
      if (accion === "borrar") {
        return `Eliminó registro de tiempo (${tipoReg})`;
      }
      const oldFin = readString(antes, "finalizado_en");
      const newFin = readString(despues, "finalizado_en");
      if (!oldFin && newFin) {
        return `Finalizó registro de tiempo (${tipoReg})`;
      }
      return `Actualizó registro de tiempo (${tipoReg})`;
    }

    case "verificaciones": {
      const canal = readString(fila, "canal") ?? "canal";
      if (tipoEvento === "solicitar" || accion === "crear") {
        return `Solicitó verificación por ${canal}`;
      }
      if (tipoEvento === "acceso") {
        return `Verificó identidad por ${canal}`;
      }
      if (accion === "borrar") {
        return `Eliminó registro de verificación (${canal})`;
      }
      return `Actualizó verificación por ${canal}`;
    }

    case "planes": {
      if (accion === "crear") return `Creó el plan «${targetLabel}»`;
      if (accion === "borrar") return `Eliminó el plan «${targetLabel}»`;
      return `Actualizó el plan «${targetLabel}»`;
    }

    case "modulos": {
      if (accion === "crear") return `Creó el módulo «${targetLabel}»`;
      if (accion === "borrar") return `Eliminó el módulo «${targetLabel}»`;
      return `Actualizó el módulo «${targetLabel}»`;
    }

    case "plan_modulos": {
      if (accion === "crear") {
        return `Asignó módulo «${targetLabel}» al plan`;
      }
      if (accion === "borrar") {
        return `Quitó módulo «${targetLabel}» del plan`;
      }
      return `Actualizó módulo «${targetLabel}» del plan`;
    }

    case "permisos": {
      if (accion === "crear") return `Creó el permiso «${targetLabel}»`;
      if (accion === "borrar") return `Eliminó el permiso «${targetLabel}»`;
      return `Actualizó el permiso «${targetLabel}»`;
    }

    case "staff_plataforma": {
      if (accion === "crear") {
        return `Incorporó a «${targetLabel}» al equipo de plataforma`;
      }
      if (accion === "borrar") {
        return `Retiró a «${targetLabel}» del equipo de plataforma`;
      }
      return `Actualizó rol de «${targetLabel}» en plataforma`;
    }

    default: {
      const originReadable = getAuditOriginLabel(
        row.origen,
        row.tabla,
        row.empresa_id,
      );
      if (accion === "crear") {
        return `Registró «${targetLabel}» en ${originReadable}`;
      }
      if (accion === "borrar") {
        return `Eliminó «${targetLabel}» en ${originReadable}`;
      }
      return `Actualizó «${targetLabel}» en ${originReadable}`;
    }
  }
}

const STOP_WORDS_LOWER = new Set([
  "de",
  "del",
  "la",
  "las",
  "los",
  "el",
  "en",
  "y",
  "a",
  "por",
  "con",
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceCaseInsensitive(
  text: string,
  needle: string,
  replacement: string,
): string {
  if (!needle) return text;
  return text.replace(new RegExp(escapeRegExp(needle), "gi"), replacement);
}

function redactPhoneInText(text: string, rawPhone: string): string {
  const maskedPhone = maskPhoneLocal(rawPhone);
  let next = replaceCaseInsensitive(text, rawPhone, maskedPhone);
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length >= 7) {
    const prefix = rawPhone.trim().startsWith("+") ? "\\+?" : "";
    const flexiblePattern = new RegExp(
      `${prefix}${digits.split("").join("[\\s()-]*")}`,
      "g",
    );
    next = next.replace(flexiblePattern, maskedPhone);
  }
  return next;
}

function redactNameTokenInText(
  text: string,
  rawName: string,
  maskedName: string,
): string {
  const clean = rawName.trim();
  if (!clean || clean.includes("****")) return text;
  if (
    !clean.includes(" ") &&
    (clean.length < 2 || STOP_WORDS_LOWER.has(clean.toLowerCase()))
  ) {
    return text;
  }
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}_])${escapeRegExp(clean)}(?![\\p{L}\\p{N}_])`,
    "giu",
  );
  return text.replace(pattern, maskedName);
}

function sanitizeResumenText(rawDetalle: string, row: RawAuditLogRow): string {
  let text = rawDetalle.trim();

  const tabla = (row.tabla ?? "").toLowerCase();
  const despuesObj = asJsonObject(row.despues);
  const antesObj = asJsonObject(row.antes);
  const fila = despuesObj ?? antesObj;
  const sources = [despuesObj, antesObj].filter(
    (item): item is Record<string, unknown> => item !== null,
  );

  // Never allow unmasked PII for cuenta_existente invitations even in custom detalle
  if (
    tabla === "invitaciones" &&
    readString(fila, "tipo") === "cuenta_existente"
  ) {
    for (const src of sources) {
      const rawCorreo = readString(src, "correo");
      if (rawCorreo && !rawCorreo.includes("****")) {
        text = replaceCaseInsensitive(
          text,
          rawCorreo,
          maskEmailAddress(rawCorreo),
        );
      }

      const rawDoc = readString(src, "numero_documento");
      if (rawDoc && !rawDoc.includes("*")) {
        text = replaceCaseInsensitive(
          text,
          rawDoc,
          maskDocumentForDisplay(rawDoc),
        );
      }

      const rawCelular = readString(src, "celular");
      if (rawCelular && !rawCelular.includes("****")) {
        text = redactPhoneInText(text, rawCelular);
      }

      const rawNombres = readString(src, "nombres");
      const rawApellidos = readString(src, "apellidos");
      const fullName = [rawNombres, rawApellidos]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (fullName && !fullName.includes("****") && fullName.length >= 2) {
        text = redactNameTokenInText(
          text,
          fullName,
          maskPersonName(null, rawNombres, rawApellidos),
        );
      }
      if (rawNombres && !rawNombres.includes("****")) {
        text = redactNameTokenInText(
          text,
          rawNombres,
          maskPersonName(rawNombres),
        );
      }
      if (rawApellidos && !rawApellidos.includes("****")) {
        text = redactNameTokenInText(
          text,
          rawApellidos,
          maskPersonName(rawApellidos),
        );
      }
    }
  }

  // Never allow unmasked destino in verificaciones custom detalle
  if (tabla === "verificaciones") {
    for (const src of sources) {
      const rawDestino = readString(src, "destino");
      if (rawDestino && !rawDestino.includes("****")) {
        if (rawDestino.includes("@")) {
          text = replaceCaseInsensitive(
            text,
            rawDestino,
            maskEmailAddress(rawDestino),
          );
        } else {
          text = redactPhoneInText(text, rawDestino);
        }
      }
    }
  }

  return text;
}

function resolveActor(
  row: RawAuditLogRow,
  context?: AuditFormatContext,
): { actorId: string | null; actorNombre: string; actorCorreo: string | null } {
  const actorId = row.usuario_id ?? null;
  const directoryActor = actorId
    ? context?.userNamesById?.get(actorId)
    : undefined;
  const snapshotName = (row.actor_nombre ?? "").trim() || null;
  const snapshotEmail = (row.actor_correo ?? "").trim() || null;

  if (!actorId) {
    const cleanSnap =
      snapshotName && snapshotName.toLowerCase() !== "sistema / administrador"
        ? snapshotName
        : null;
    return {
      actorId: null,
      actorNombre: cleanSnap ?? "Sistema",
      actorCorreo: snapshotEmail,
    };
  }

  const isGenericSnapshot =
    !snapshotName || GENERIC_ACTOR_NAMES.has(snapshotName.toLowerCase());
  const directoryName =
    directoryActor?.fullName &&
    !GENERIC_ACTOR_NAMES.has(directoryActor.fullName.toLowerCase())
      ? directoryActor.fullName
      : null;

  let actorNombre: string;
  if (!isGenericSnapshot) {
    actorNombre = snapshotName;
  } else if (directoryName) {
    actorNombre = directoryName;
  } else if (context?.currentUserId && actorId === context.currentUserId) {
    actorNombre = "Tú (Administrador)";
  } else {
    actorNombre = "Usuario";
  }

  return {
    actorId,
    actorNombre,
    actorCorreo: snapshotEmail ?? directoryActor?.email?.trim() ?? null,
  };
}

export function formatAuditLogEntry(
  row: RawAuditLogRow,
  context?: AuditFormatContext,
): AuditLogEntry {
  const tipoEvento = inferAuditTipoEvento(row);
  const origen = normalizeAuditOrigin(row.origen, row.tabla, row.empresa_id);
  const origenLabel = getAuditOriginLabel(origen, row.tabla, row.empresa_id);
  const entidadNombre = resolveEntityName(row, context);
  const actor = resolveActor(row, context);
  const cambios = formatAuditChanges(row, context);

  const rawDetalle = (row.detalle ?? "").trim();
  const isGenericDetalle =
    !rawDetalle ||
    GENERIC_DETAIL_REGEX.test(rawDetalle) ||
    rawDetalle.toLowerCase() === `${row.accion} ${row.tabla}`.toLowerCase();

  const resumen = isGenericDetalle
    ? synthesizeResumen(row, tipoEvento, entidadNombre, context)
    : sanitizeResumenText(rawDetalle, row);

  const camposModificados = Array.isArray(row.campos_modificados)
    ? row.campos_modificados.filter(
        (c): c is string => typeof c === "string" && c.trim().length > 0,
      )
    : undefined;

  return {
    id: row.id,
    accion: row.accion,
    tipoEvento,
    tabla: row.tabla,
    origen,
    origenLabel,
    registroId: row.registro_id ?? null,
    entidadNombre,
    actorId: actor.actorId,
    actorNombre: actor.actorNombre,
    actorCorreo: actor.actorCorreo,
    resumen,
    cambios,
    ...(camposModificados ? { camposModificados } : {}),
    creadoEn: row.creado_en,
  };
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesAuditSearch(
  entry: AuditLogEntry,
  search?: string | null,
): boolean {
  const normalizedQuery = normalizeSearchText(search ?? "");
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const presentation = getAuditActionPresentation(
    entry.tipoEvento,
    entry.accion,
  );

  const haystack = normalizeSearchText(
    [
      entry.actorNombre,
      entry.actorCorreo ?? "",
      entry.origenLabel,
      entry.entidadNombre ?? "",
      entry.registroId ?? "",
      entry.resumen,
      presentation.label,
      entry.tipoEvento,
      entry.accion,
      ...entry.cambios,
    ].join(" "),
  );

  return tokens.every((token) => haystack.includes(token));
}

const TIME_RANGE_DAYS: Record<Exclude<AuditTimeRange, "all">, number> = {
  "1d": 1,
  "7d": 7,
  "15d": 15,
  "30d": 30,
};

export function getTimeRangeCutoffMs(
  timeRange: AuditTimeRange,
  now: Date = new Date(),
): number | null {
  if (timeRange === "all") return null;
  const days = TIME_RANGE_DAYS[timeRange];
  return now.getTime() - days * 86_400_000;
}

export function filterAuditLogEntries(
  entries: AuditLogEntry[],
  filters: AuditFilterParams,
  now: Date = new Date(),
): AuditLogEntry[] {
  const actorFilter = filters.actorId?.trim();
  const hasActorFilter =
    Boolean(actorFilter) && actorFilter !== "all" && actorFilter !== "todos";

  const rawOriginFilter = filters.origen?.trim();
  const hasOriginFilter =
    Boolean(rawOriginFilter) &&
    rawOriginFilter !== "all" &&
    rawOriginFilter !== "todos";
  const normalizedOriginFilter = hasOriginFilter
    ? normalizeAuditOrigin(rawOriginFilter, undefined, "tenant")
    : null;

  const cutoffMs = getTimeRangeCutoffMs(filters.timeRange ?? "all", now);
  const search = filters.search;

  return entries.filter((entry) => {
    if (hasActorFilter) {
      if (actorFilter === SYSTEM_AUDIT_ACTOR_ID) {
        if (entry.actorId !== null) return false;
      } else if (entry.actorId !== actorFilter) {
        return false;
      }
    }

    if (normalizedOriginFilter) {
      const entryOrigin = normalizeAuditOrigin(
        entry.origen,
        entry.tabla,
        "tenant",
      );
      if (entryOrigin !== normalizedOriginFilter) {
        return false;
      }
    }

    if (cutoffMs !== null) {
      const entryMs = Date.parse(entry.creadoEn);
      if (!Number.isFinite(entryMs) || entryMs < cutoffMs) {
        return false;
      }
    }

    if (!matchesAuditSearch(entry, search)) {
      return false;
    }

    return true;
  });
}
