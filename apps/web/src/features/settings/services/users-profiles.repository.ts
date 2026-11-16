import "server-only";
import { cache } from "react";
import {
  maskDocumentForDisplay,
  maskEmailAddress,
  maskPersonName,
  maskPhoneLocal,
  type CanonicalDocumentType,
} from "@vittkly/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  mapFlagsToAccessLabel,
  maskDocumentNumber,
  type AccessLabel,
  type AccessScope,
  type AuditLogEntry,
  type CompanyProfile,
  type DocumentLookupResult,
  type DocumentType,
  type ExitRequestRecord,
  type InvitationRecord,
  type MemberStatus,
  type ProfileConfiguration,
  type RestrictionKey,
  type RestrictionScope,
  type TeamMember,
  type UsersProfilesBundle,
} from "../types/settings.types";

interface StandardProfilePreset {
  codigo: string;
  nombre: string;
  descripcion: string;
  recomendadoPara: string;
  configuracion: ProfileConfiguration;
}

const ALL_MODULES = [
  "dashboard",
  "cotizaciones",
  "clientes",
  "calendario",
  "trabajos",
  "tiempo",
  "finanzas",
  "postventa",
  "inventario",
  "academia",
  "reportes",
  "configuraciones",
];

function buildProfileConfig(
  overrides: Partial<ProfileConfiguration> & {
    restricciones?: Partial<Record<RestrictionKey, RestrictionScope>>;
  },
): ProfileConfiguration {
  return {
    modulos: overrides.modulos ?? ["dashboard", "calendario", "trabajos"],
    opciones: {
      ve_precios_montos: overrides.opciones?.ve_precios_montos ?? false,
      valida_servicios: overrides.opciones?.valida_servicios ?? false,
      es_personal_campo: overrides.opciones?.es_personal_campo ?? false,
    },
    restricciones: {
      ver_montos_cotizaciones:
        overrides.restricciones?.ver_montos_cotizaciones ?? "ninguna",
      editar_cotizaciones:
        overrides.restricciones?.editar_cotizaciones ?? "ninguna",
      eliminar_cotizaciones:
        overrides.restricciones?.eliminar_cotizaciones ?? "ninguna",
      programar_reprogramar:
        overrides.restricciones?.programar_reprogramar ?? "ninguna",
      pagos_clientes: overrides.restricciones?.pagos_clientes ?? "ninguna",
      costeo_margenes: overrides.restricciones?.costeo_margenes ?? "ninguna",
      cancelar_servicios:
        overrides.restricciones?.cancelar_servicios ?? "ninguna",
    },
    descargar_archivos: overrides.descargar_archivos ?? false,
    aprueba_solicitudes: overrides.aprueba_solicitudes ?? false,
    ocultar_datos_cliente: {
      telefonos: overrides.ocultar_datos_cliente?.telefonos ?? false,
      correos: overrides.ocultar_datos_cliente?.correos ?? false,
      documento: overrides.ocultar_datos_cliente?.documento ?? false,
      direccion: overrides.ocultar_datos_cliente?.direccion ?? false,
    },
    horario_acceso: {
      restringido: overrides.horario_acceso?.restringido ?? false,
      inicio: overrides.horario_acceso?.inicio ?? "08:00",
      fin: overrides.horario_acceso?.fin ?? "18:00",
    },
    dispositivo_acceso: overrides.dispositivo_acceso ?? "cualquiera",
  };
}

export const STANDARD_PROFILE_PRESETS: StandardProfilePreset[] = [
  {
    codigo: "admin",
    nombre: "Administrador",
    descripcion:
      "Acceso total a todos los módulos, configuraciones, finanzas y reportes de la empresa.",
    recomendadoPara: "Dueños, gerencia general y responsables de cuenta",
    configuracion: buildProfileConfig({
      modulos: ALL_MODULES,
      opciones: {
        ve_precios_montos: true,
        valida_servicios: true,
        es_personal_campo: false,
      },
      restricciones: {
        ver_montos_cotizaciones: "todas",
        editar_cotizaciones: "todas",
        eliminar_cotizaciones: "todas",
        programar_reprogramar: "todas",
        pagos_clientes: "todas",
        costeo_margenes: "todas",
        cancelar_servicios: "todas",
      },
      descargar_archivos: true,
      aprueba_solicitudes: true,
    }),
  },
  {
    codigo: "supervisor",
    nombre: "Supervisor",
    descripcion:
      "Supervisa trabajos en campo, valida servicios realizados y gestiona cuadrillas operativas.",
    recomendadoPara: "Jefes de operaciones y supervisores de ruta",
    configuracion: buildProfileConfig({
      modulos: [
        "dashboard",
        "calendario",
        "clientes",
        "trabajos",
        "tiempo",
        "postventa",
        "inventario",
        "academia",
      ],
      opciones: {
        ve_precios_montos: false,
        valida_servicios: true,
        es_personal_campo: true,
      },
      restricciones: {
        ver_montos_cotizaciones: "equipo",
        editar_cotizaciones: "ninguna",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "todas",
        pagos_clientes: "ninguna",
        costeo_margenes: "ninguna",
        cancelar_servicios: "equipo",
      },
      descargar_archivos: true,
      aprueba_solicitudes: true,
    }),
  },
  {
    codigo: "ventas",
    nombre: "Ventas",
    descripcion:
      "Cotiza, atiende clientes, programa trabajos y hace seguimiento comercial.",
    recomendadoPara: "Ejecutivos comerciales y asesores de ventas",
    configuracion: buildProfileConfig({
      modulos: [
        "cotizaciones",
        "clientes",
        "calendario",
        "trabajos",
        "postventa",
      ],
      opciones: {
        ve_precios_montos: true,
        valida_servicios: false,
        es_personal_campo: false,
      },
      restricciones: {
        ver_montos_cotizaciones: "propias",
        editar_cotizaciones: "propias",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "propias",
        pagos_clientes: "propias",
        costeo_margenes: "ninguna",
        cancelar_servicios: "ninguna",
      },
      descargar_archivos: true,
      aprueba_solicitudes: false,
    }),
  },
  {
    codigo: "coordinador_agenda",
    nombre: "Coordinador de agenda",
    descripcion:
      "Organiza el calendario, asigna técnicos a visitas y reprograma órdenes de trabajo.",
    recomendadoPara: "Despachadores y coordinadores de programación",
    configuracion: buildProfileConfig({
      modulos: ["dashboard", "calendario", "clientes", "trabajos", "tiempo"],
      opciones: {
        ve_precios_montos: false,
        valida_servicios: true,
        es_personal_campo: false,
      },
      restricciones: {
        ver_montos_cotizaciones: "ninguna",
        editar_cotizaciones: "ninguna",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "todas",
        pagos_clientes: "ninguna",
        costeo_margenes: "ninguna",
        cancelar_servicios: "todas",
      },
      descargar_archivos: false,
      aprueba_solicitudes: false,
    }),
  },
  {
    codigo: "contabilidad",
    nombre: "Contabilidad",
    descripcion:
      "Gestiona cobranzas, comprobantes, liquidaciones, caja, bancos y análisis de rentabilidad.",
    recomendadoPara: "Contadores, tesorería y administración financiera",
    configuracion: buildProfileConfig({
      modulos: [
        "dashboard",
        "cotizaciones",
        "clientes",
        "finanzas",
        "reportes",
      ],
      opciones: {
        ve_precios_montos: true,
        valida_servicios: false,
        es_personal_campo: false,
      },
      restricciones: {
        ver_montos_cotizaciones: "todas",
        editar_cotizaciones: "ninguna",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "ninguna",
        pagos_clientes: "todas",
        costeo_margenes: "todas",
        cancelar_servicios: "ninguna",
      },
      descargar_archivos: true,
      aprueba_solicitudes: false,
    }),
  },
  {
    codigo: "atencion_cliente",
    nombre: "Atención al cliente",
    descripcion:
      "Atiende consultas, gestiona post venta, garantías y seguimiento de satisfacción.",
    recomendadoPara: "Mesa de ayuda, recepción y post venta",
    configuracion: buildProfileConfig({
      modulos: ["clientes", "calendario", "trabajos", "postventa"],
      opciones: {
        ve_precios_montos: false,
        valida_servicios: false,
        es_personal_campo: false,
      },
      restricciones: {
        ver_montos_cotizaciones: "ninguna",
        editar_cotizaciones: "ninguna",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "propias",
        pagos_clientes: "ninguna",
        costeo_margenes: "ninguna",
        cancelar_servicios: "ninguna",
      },
      descargar_archivos: false,
      aprueba_solicitudes: false,
    }),
  },
  {
    codigo: "analista_gerencia",
    nombre: "Analista / Gerencia",
    descripcion:
      "Consulta indicadores, márgenes, reportes ejecutivos y desempeño operativo en modo lectura.",
    recomendadoPara: "Analistas de gestión, directorio y auditoría interna",
    configuracion: buildProfileConfig({
      modulos: [
        "dashboard",
        "cotizaciones",
        "clientes",
        "calendario",
        "trabajos",
        "tiempo",
        "finanzas",
        "reportes",
      ],
      opciones: {
        ve_precios_montos: true,
        valida_servicios: false,
        es_personal_campo: false,
      },
      restricciones: {
        ver_montos_cotizaciones: "todas",
        editar_cotizaciones: "ninguna",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "ninguna",
        pagos_clientes: "todas",
        costeo_margenes: "todas",
        cancelar_servicios: "ninguna",
      },
      descargar_archivos: true,
      aprueba_solicitudes: false,
    }),
  },
  {
    codigo: "tecnico",
    nombre: "Técnico",
    descripcion:
      "Solo ve sus trabajos asignados, marcaciones de tiempo y hojas de servicio en la app móvil.",
    recomendadoPara: "Técnicos de campo y operarios en ruta",
    configuracion: buildProfileConfig({
      modulos: ["calendario", "trabajos", "tiempo", "academia"],
      opciones: {
        ve_precios_montos: false,
        valida_servicios: false,
        es_personal_campo: true,
      },
      restricciones: {
        ver_montos_cotizaciones: "ninguna",
        editar_cotizaciones: "ninguna",
        eliminar_cotizaciones: "ninguna",
        programar_reprogramar: "ninguna",
        pagos_clientes: "ninguna",
        costeo_margenes: "ninguna",
        cancelar_servicios: "ninguna",
      },
      descargar_archivos: false,
      aprueba_solicitudes: false,
      ocultar_datos_cliente: {
        telefonos: true,
        correos: true,
        documento: true,
        direccion: false,
      },
      dispositivo_acceso: "solo_app",
    }),
  },
  {
    codigo: "gerente_comercial",
    nombre: "Gerente Comercial",
    descripcion:
      "Lidera el equipo de ventas, aprueba descuentos, revisa márgenes y gestiona el embudo comercial.",
    recomendadoPara: "Jefes de ventas y gerentes comerciales",
    configuracion: buildProfileConfig({
      modulos: [
        "dashboard",
        "cotizaciones",
        "clientes",
        "calendario",
        "trabajos",
        "postventa",
        "reportes",
      ],
      opciones: {
        ve_precios_montos: true,
        valida_servicios: false,
        es_personal_campo: false,
      },
      restricciones: {
        ver_montos_cotizaciones: "todas",
        editar_cotizaciones: "todas",
        eliminar_cotizaciones: "equipo",
        programar_reprogramar: "todas",
        pagos_clientes: "equipo",
        costeo_margenes: "todas",
        cancelar_servicios: "equipo",
      },
      descargar_archivos: true,
      aprueba_solicitudes: true,
    }),
  },
];

function normalizeProfileConfiguration(
  rawConfig: unknown,
  codigo: string | null,
  nombre: string,
  permisosRows: { permiso_codigo: string; alcance: string | null }[],
): {
  descripcionDefault: string;
  recomendadoDefault: string;
  configuracion: ProfileConfiguration;
} {
  const preset =
    STANDARD_PROFILE_PRESETS.find(
      (p) =>
        (codigo && p.codigo.toLowerCase() === codigo.toLowerCase()) ||
        p.nombre.toLowerCase() === nombre.toLowerCase(),
    ) ?? STANDARD_PROFILE_PRESETS[2];

  const base = preset.configuracion;
  const parsed =
    rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig)
      ? (rawConfig as Partial<ProfileConfiguration>)
      : {};

  const merged = buildProfileConfig({
    modulos: Array.isArray(parsed.modulos) ? parsed.modulos : base.modulos,
    opciones: {
      ve_precios_montos:
        parsed.opciones?.ve_precios_montos ?? base.opciones.ve_precios_montos,
      valida_servicios:
        parsed.opciones?.valida_servicios ?? base.opciones.valida_servicios,
      es_personal_campo:
        parsed.opciones?.es_personal_campo ?? base.opciones.es_personal_campo,
    },
    restricciones: {
      ...base.restricciones,
      ...(parsed.restricciones ?? {}),
    },
    descargar_archivos: parsed.descargar_archivos ?? base.descargar_archivos,
    aprueba_solicitudes: parsed.aprueba_solicitudes ?? base.aprueba_solicitudes,
    ocultar_datos_cliente: {
      ...base.ocultar_datos_cliente,
      ...(parsed.ocultar_datos_cliente ?? {}),
    },
    horario_acceso: {
      ...base.horario_acceso,
      ...(parsed.horario_acceso ?? {}),
    },
    dispositivo_acceso: parsed.dispositivo_acceso ?? base.dispositivo_acceso,
  });

  // Si existen filas en perfil_permisos con alcance explícito, sincronizarlas
  for (const pp of permisosRows) {
    const scope = (pp.alcance as RestrictionScope | null) ?? "todas";
    if (
      pp.permiso_codigo === "cotizaciones.ver_montos" ||
      pp.permiso_codigo === "ver_montos_cotizaciones"
    ) {
      merged.restricciones.ver_montos_cotizaciones = scope;
    } else if (
      pp.permiso_codigo === "cotizaciones.editar" ||
      pp.permiso_codigo === "editar_cotizaciones"
    ) {
      merged.restricciones.editar_cotizaciones = scope;
    } else if (
      pp.permiso_codigo === "cotizaciones.eliminar" ||
      pp.permiso_codigo === "eliminar_cotizaciones"
    ) {
      merged.restricciones.eliminar_cotizaciones = scope;
    } else if (
      pp.permiso_codigo === "agenda.programar" ||
      pp.permiso_codigo === "programar_reprogramar"
    ) {
      merged.restricciones.programar_reprogramar = scope;
    } else if (
      pp.permiso_codigo === "cobranzas.ver" ||
      pp.permiso_codigo === "pagos_clientes"
    ) {
      merged.restricciones.pagos_clientes = scope;
    } else if (
      pp.permiso_codigo === "rentabilidad.ver" ||
      pp.permiso_codigo === "costeo_margenes"
    ) {
      merged.restricciones.costeo_margenes = scope;
    } else if (
      pp.permiso_codigo === "trabajos.cancelar" ||
      pp.permiso_codigo === "cancelar_servicios"
    ) {
      merged.restricciones.cancelar_servicios = scope;
    }
  }

  return {
    descripcionDefault: preset.descripcion,
    recomendadoDefault: preset.recomendadoPara,
    configuracion: merged,
  };
}

function splitFullName(
  nombre: string | null | undefined,
  nombres?: string | null,
  apellidos?: string | null,
): { fullName: string; firstName: string; lastName: string } {
  if (nombres || apellidos) {
    const first = (nombres ?? "").trim();
    const last = (apellidos ?? "").trim();
    const full = `${first} ${last}`.trim() || (nombre ?? "").trim();
    return { fullName: full, firstName: first, lastName: last };
  }
  const clean = (nombre ?? "").trim();
  if (!clean) {
    return { fullName: "Sin nombre", firstName: "", lastName: "" };
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return { fullName: clean, firstName: parts[0], lastName: "" };
  }
  const firstName = parts.slice(0, Math.ceil(parts.length / 2)).join(" ");
  const lastName = parts.slice(Math.ceil(parts.length / 2)).join(" ");
  return { fullName: clean, firstName, lastName };
}

function describeAuditRecord(
  accion: string,
  tabla: string,
  antes: Record<string, unknown> | null,
  despues: Record<string, unknown> | null,
): string {
  const verbo =
    accion === "crear"
      ? "Creó registro en"
      : accion === "editar"
        ? "Actualizó registro en"
        : accion === "borrar"
          ? "Eliminó registro en"
          : `${accion} en`;

  if (tabla === "membresias") {
    const estadoNuevo = despues?.estado as string | undefined;
    const estadoAnterior = antes?.estado as string | undefined;
    if (estadoNuevo === "desvinculada") {
      return "Desvinculó a un miembro de la empresa";
    }
    if (estadoNuevo && estadoAnterior && estadoNuevo !== estadoAnterior) {
      return `Cambió estado de membresía de ${estadoAnterior} a ${estadoNuevo}`;
    }
    if (
      antes?.perfil_id &&
      despues?.perfil_id &&
      antes.perfil_id !== despues.perfil_id
    ) {
      return "Actualizó el perfil asignado a un miembro";
    }
    return `${verbo} membresías del equipo`;
  }

  if (tabla === "invitaciones") {
    const tipo = (despues?.tipo ?? antes?.tipo ?? "nueva_cuenta") as string;
    const maskedRaw = (despues?.datos_enmascarados ??
      antes?.datos_enmascarados ??
      null) as Record<string, unknown> | null;
    const rawCorreo = (despues?.correo ?? antes?.correo ?? "") as string;
    const label =
      tipo === "cuenta_existente"
        ? ((maskedRaw?.correo as string | undefined) ??
          (maskedRaw?.nombre as string | undefined) ??
          (rawCorreo ? maskEmailAddress(rawCorreo) : "") ??
          "cuenta existente")
        : rawCorreo;
    const estado = (despues?.estado ?? "") as string;
    if (accion === "crear") {
      return `Envió invitación a ${label || "nuevo colaborador"}`;
    }
    if (estado === "anulada") {
      return `Anuló invitación previa (${label || "colaborador"})`;
    }
    return `${verbo} invitaciones (${estado || "actualización"})`;
  }

  if (tabla === "perfiles") {
    const nombre = (despues?.nombre ?? antes?.nombre ?? "perfil") as string;
    if (accion === "crear") return `Creó el perfil «${nombre}»`;
    if (accion === "editar") return `Actualizó el perfil «${nombre}»`;
    if (accion === "borrar") return `Eliminó el perfil «${nombre}»`;
  }

  if (tabla === "solicitudes_salida") {
    const estado = (despues?.estado ?? "") as string;
    if (estado === "aprobada") return "Aprobó una solicitud de salida";
    if (estado === "rechazada") return "Rechazó una solicitud de salida";
    return "Registró movimiento en solicitudes de salida";
  }

  return `${verbo} ${tabla}`;
}

export const getUsersProfilesBundle = cache(
  async (empresaId: string): Promise<UsersProfilesBundle> => {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const currentUserId = currentUser?.id ?? "";

    // 1. Consultar perfiles exclusivamente de la empresa activa (empresa_id = empresaId)
    const { data: rawProfiles } = await supabase
      .from("perfiles")
      .select(
        "id, empresa_id, codigo, nombre, descripcion, recomendado_para, configuracion, es_base",
      )
      .eq("empresa_id", empresaId)
      .order("es_base", { ascending: false })
      .order("nombre", { ascending: true });

    const profileIds = (rawProfiles ?? []).map((p) => p.id);
    const { data: rawPerfilPermisos } =
      profileIds.length > 0
        ? await supabase
            .from("perfil_permisos")
            .select("perfil_id, permiso_codigo, alcance")
            .in("perfil_id", profileIds)
        : {
            data: [] as {
              perfil_id: string;
              permiso_codigo: string;
              alcance: string | null;
            }[],
          };

    // 2. Consultar membresías de la empresa activa (JOIN con usuarios y perfiles)
    const { data: rawMembresias } = await supabase
      .from("membresias")
      .select(
        `
        id,
        empresa_id,
        usuario_id,
        perfil_id,
        es_propietario,
        acceso_web,
        acceso_app,
        cargo,
        estado,
        activo,
        invitacion_id,
        creado_en,
        usuarios:usuario_id (
          id,
          nombre,
          nombres,
          apellidos,
          correo,
          celular,
          avatar_ruta,
          tipo_documento,
          numero_documento
        ),
        perfiles:perfil_id (
          id,
          nombre,
          codigo,
          es_base
        )
      `,
      )
      .eq("empresa_id", empresaId)
      .order("es_propietario", { ascending: false })
      .order("creado_en", { ascending: true });

    // 3. Consultar invitaciones de la empresa activa
    const { data: rawInvitaciones } = await supabase
      .from("invitaciones")
      .select(
        `
        id,
        empresa_id,
        tipo,
        usuario_id,
        nombres,
        apellidos,
        tipo_documento,
        numero_documento,
        correo,
        celular,
        datos_enmascarados,
        perfil_id,
        cargo,
        acceso_web,
        acceso_app,
        vence_en,
        estado,
        motivo_rechazo,
        respondida_en,
        creado_en
      `,
      )
      .eq("empresa_id", empresaId)
      .order("creado_en", { ascending: false });

    // 4. Consultar solicitudes de salida de la empresa activa
    const { data: rawSalidas } = await supabase
      .from("solicitudes_salida")
      .select(
        `
        id,
        empresa_id,
        membresia_id,
        usuario_id,
        motivo,
        estado,
        comentario_resolucion,
        servicios_futuros,
        creado_en,
        resuelto_en
      `,
      )
      .eq("empresa_id", empresaId)
      .order("creado_en", { ascending: false });

    // 5. Consultar auditoría de la empresa activa
    const { data: rawAuditoria } = await supabase
      .from("auditoria")
      .select(
        "id, empresa_id, usuario_id, accion, tabla, registro_id, antes, despues, creado_en",
      )
      .eq("empresa_id", empresaId)
      .order("creado_en", { ascending: false })
      .limit(60);

    // Mapa rápido de perfiles por ID
    const profileMap = new Map<
      string,
      { id: string; nombre: string; codigo: string | null; es_base: boolean }
    >();
    for (const p of rawProfiles ?? []) {
      profileMap.set(p.id, {
        id: p.id,
        nombre: p.nombre,
        codigo: p.codigo,
        es_base: p.es_base,
      });
    }

    // Mapa de nombres de usuario para enriquecer salidas y auditoría
    const userNamesById = new Map<
      string,
      { fullName: string; email: string | null }
    >();

    // Conteo de miembros activos/suspendidos por perfil
    const usageByProfileId = new Map<string, number>();

    const members: TeamMember[] = [];

    for (const row of rawMembresias ?? []) {
      const rawEstado =
        (row as { estado?: string }).estado ??
        (row.activo ? "activa" : "desactivada");

      // Las membresías desvinculadas ya no forman parte de la tabla activa de Personas
      if (rawEstado === "desvinculada") {
        continue;
      }

      usageByProfileId.set(
        row.perfil_id,
        (usageByProfileId.get(row.perfil_id) ?? 0) + 1,
      );

      const u = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios;
      const p = Array.isArray(row.perfiles) ? row.perfiles[0] : row.perfiles;

      const isCurrent = Boolean(
        currentUserId && row.usuario_id === currentUserId,
      );

      const { fullName, firstName, lastName } = splitFullName(
        u?.nombre || (isCurrent ? (currentUser?.email ?? "Usuario") : null),
        (u as { nombres?: string | null } | null)?.nombres,
        (u as { apellidos?: string | null } | null)?.apellidos,
      );

      const email =
        u?.correo || (isCurrent ? (currentUser?.email ?? "") : "") || "";
      const phone = u?.celular ?? null;

      userNamesById.set(row.usuario_id, { fullName, email });

      const accesoWeb = row.acceso_web ?? true;
      const accesoApp =
        (row as { acceso_app?: boolean }).acceso_app ??
        (p?.codigo === "tecnico" ? true : true);
      const accessLabel = mapFlagsToAccessLabel(accesoWeb, accesoApp);
      const accessScope: AccessScope =
        accessLabel === "Solo web"
          ? "web"
          : accessLabel === "Solo app"
            ? "mobile"
            : "both";

      const status: MemberStatus =
        rawEstado === "activa" ? "active" : "suspended";

      const docType = ((u as { tipo_documento?: string | null } | null)
        ?.tipo_documento ?? null) as DocumentType | null;
      const docNumberRaw =
        (u as { numero_documento?: string | null } | null)?.numero_documento ??
        null;

      members.push({
        id: row.id,
        sourceType: "membresia",
        userId: row.usuario_id,
        perfilId: row.perfil_id,
        fullName,
        firstName,
        lastName,
        email,
        phone,
        avatarUrl: u?.avatar_ruta ?? null,
        docType,
        docNumberMasked: maskDocumentNumber(docNumberRaw),
        role:
          p?.nombre ??
          profileMap.get(row.perfil_id)?.nombre ??
          (row.es_propietario ? "Administrador" : "Personal"),
        roleCode: p?.codigo ?? profileMap.get(row.perfil_id)?.codigo ?? "admin",
        isOwner: Boolean(row.es_propietario),
        isCurrentUser: isCurrent,
        accesoWeb,
        accesoApp,
        accessScope,
        accessLabel,
        accessMethods:
          accessLabel === "Solo app"
            ? ["whatsapp", "pin"]
            : ["google", "microsoft", "whatsapp"],
        status,
        jobTitle: (row as { cargo?: string | null }).cargo ?? null,
        invitationId:
          (row as { invitacion_id?: string | null }).invitacion_id ?? null,
        createdAt: row.creado_en,
      });
    }

    // Procesar invitaciones y agregar las 'pendiente' (vigentes) a la lista de Personas
    const invitations: InvitationRecord[] = [];
    for (const inv of rawInvitaciones ?? []) {
      const perfilMeta = profileMap.get(inv.perfil_id);
      const perfilNombre = perfilMeta?.nombre ?? "Colaborador";
      const accesoWeb = inv.acceso_web ?? true;
      const accesoApp = (inv as { acceso_app?: boolean }).acceso_app ?? true;
      const accessLabel = mapFlagsToAccessLabel(accesoWeb, accesoApp);

      const invTipo =
        (inv as { tipo?: string }).tipo === "cuenta_existente"
          ? "cuenta_existente"
          : "nueva_cuenta";

      const maskedRaw = (inv as { datos_enmascarados?: unknown })
        .datos_enmascarados;
      const maskedObj =
        maskedRaw && typeof maskedRaw === "object" && !Array.isArray(maskedRaw)
          ? (maskedRaw as Record<string, unknown>)
          : null;

      const docType = ((inv as { tipo_documento?: string | null })
        .tipo_documento ?? null) as DocumentType | null;

      const rawNombres = (inv as { nombres?: string | null }).nombres ?? null;
      const rawApellidos =
        (inv as { apellidos?: string | null }).apellidos ?? null;
      const rawNumeroDoc =
        (inv as { numero_documento?: string | null }).numero_documento ?? null;

      let resolvedFullName: string;
      let resolvedFirstName: string;
      let resolvedLastName: string;
      let resolvedEmail: string | null;
      let resolvedPhone: string | null;
      let docNumberMasked: string | null;

      if (invTipo === "cuenta_existente") {
        resolvedFullName =
          (typeof maskedObj?.nombre === "string" && maskedObj.nombre) ||
          (rawNombres && rawNombres.includes("****")
            ? rawNombres
            : maskPersonName(null, rawNombres, rawApellidos));
        resolvedFirstName = resolvedFullName;
        resolvedLastName = "";
        resolvedEmail =
          (typeof maskedObj?.correo === "string" && maskedObj.correo) ||
          (inv.correo ? maskEmailAddress(inv.correo) : null);
        resolvedPhone =
          (typeof maskedObj?.celular === "string" && maskedObj.celular) ||
          (inv.celular ? maskPhoneLocal(inv.celular) : null);
        docNumberMasked =
          (typeof maskedObj?.documento === "string" && maskedObj.documento) ||
          (rawNumeroDoc ? maskDocumentForDisplay(rawNumeroDoc) : null);
      } else {
        const split = splitFullName(
          inv.correo ?? inv.celular ?? "Invitado",
          rawNombres,
          rawApellidos,
        );
        resolvedFullName = split.fullName;
        resolvedFirstName = split.firstName;
        resolvedLastName = split.lastName;
        resolvedEmail = inv.correo;
        resolvedPhone = inv.celular;
        docNumberMasked = maskDocumentNumber(rawNumeroDoc);
      }

      const rawEstado = (inv.estado ||
        "pendiente") as InvitationRecord["estado"];
      const isExpiredPending =
        rawEstado === "pendiente" &&
        Boolean(inv.vence_en) &&
        new Date(inv.vence_en).getTime() < Date.now();
      const invEstado: InvitationRecord["estado"] = isExpiredPending
        ? "vencida"
        : rawEstado;

      invitations.push({
        id: inv.id,
        tipo: invTipo,
        usuarioId: (inv as { usuario_id?: string | null }).usuario_id ?? null,
        fullName: resolvedFullName,
        email: resolvedEmail,
        phone: resolvedPhone,
        docType,
        docNumberMasked,
        perfilId: inv.perfil_id,
        perfilNombre,
        cargo: (inv as { cargo?: string | null }).cargo ?? null,
        accesoWeb,
        accesoApp,
        accessLabel,
        estado: invEstado,
        motivoRechazo:
          (inv as { motivo_rechazo?: string | null }).motivo_rechazo ?? null,
        venceEn: inv.vence_en,
        respondidaEn:
          (inv as { respondida_en?: string | null }).respondida_en ?? null,
        creadoEn: inv.creado_en,
      });

      if (invEstado === "pendiente") {
        const accessScope: AccessScope =
          accessLabel === "Solo web"
            ? "web"
            : accessLabel === "Solo app"
              ? "mobile"
              : "both";

        members.push({
          id: `inv-${inv.id}`,
          sourceType: "invitacion",
          userId:
            (inv as { usuario_id?: string | null }).usuario_id ??
            `inv-user-${inv.id}`,
          perfilId: inv.perfil_id,
          fullName: resolvedFullName,
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
          email: resolvedEmail ?? "",
          phone: resolvedPhone ?? null,
          avatarUrl: null,
          docType,
          docNumberMasked,
          role: perfilNombre,
          roleCode: perfilMeta?.codigo ?? undefined,
          isOwner: false,
          isCurrentUser: false,
          accesoWeb,
          accesoApp,
          accessScope,
          accessLabel,
          accessMethods:
            accessLabel === "Solo app"
              ? ["whatsapp", "pin"]
              : ["google", "microsoft", "whatsapp"],
          status: "pending",
          statusLabel: "Aún no ingresa",
          jobTitle: (inv as { cargo?: string | null }).cargo ?? null,
          invitationId: inv.id,
          invitationType: invTipo,
          invitationExpiresAt: inv.vence_en,
          createdAt: inv.creado_en,
        });
      }
    }

    // Construir tarjetas de perfiles de la empresa
    const profiles: CompanyProfile[] = (rawProfiles ?? []).map((p) => {
      const permRows = (rawPerfilPermisos ?? []).filter(
        (pp) => pp.perfil_id === p.id,
      );
      const { descripcionDefault, recomendadoDefault, configuracion } =
        normalizeProfileConfiguration(
          (p as { configuracion?: unknown }).configuracion,
          p.codigo,
          p.nombre,
          permRows,
        );

      return {
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        descripcion: p.descripcion || descripcionDefault,
        recomendadoPara:
          (p as { recomendado_para?: string | null }).recomendado_para ||
          recomendadoDefault,
        esBase: p.es_base,
        usageCount: usageByProfileId.get(p.id) ?? 0,
        configuracion,
      };
    });

    // Construir solicitudes de salida
    const exitRequests: ExitRequestRecord[] = (rawSalidas ?? []).map((s) => {
      const uMeta = userNamesById.get(s.usuario_id);
      const matchingMember = members.find((m) => m.id === s.membresia_id);
      return {
        id: s.id,
        membresiaId: s.membresia_id,
        usuarioId: s.usuario_id,
        fullName: uMeta?.fullName ?? matchingMember?.fullName ?? "Colaborador",
        email: uMeta?.email ?? matchingMember?.email ?? null,
        perfilNombre: matchingMember?.role ?? "Miembro",
        motivo: s.motivo,
        estado: (s.estado as ExitRequestRecord["estado"]) || "pendiente",
        comentarioResolucion: s.comentario_resolucion,
        serviciosFuturos: s.servicios_futuros ?? 0,
        creadoEn: s.creado_en,
        resueltoEn: s.resuelto_en,
      };
    });

    // Construir registros de auditoría
    const auditLogs: AuditLogEntry[] = (rawAuditoria ?? []).map((a) => {
      const actorMeta = a.usuario_id
        ? userNamesById.get(a.usuario_id)
        : undefined;
      const antesObj =
        a.antes && typeof a.antes === "object" && !Array.isArray(a.antes)
          ? (a.antes as Record<string, unknown>)
          : null;
      const despuesObj =
        a.despues && typeof a.despues === "object" && !Array.isArray(a.despues)
          ? (a.despues as Record<string, unknown>)
          : null;

      return {
        id: a.id,
        accion: a.accion,
        tabla: a.tabla,
        registroId: a.registro_id,
        actorNombre:
          actorMeta?.fullName ??
          (a.usuario_id && a.usuario_id === currentUserId
            ? "Tú (Administrador)"
            : "Sistema / Administrador"),
        resumen: describeAuditRecord(a.accion, a.tabla, antesObj, despuesObj),
        creadoEn: a.creado_en,
      };
    });

    return {
      members,
      profiles,
      invitations,
      exitRequests,
      auditLogs,
    };
  },
);

export const getTeamMembers = cache(
  async (empresaId: string): Promise<TeamMember[]> => {
    const bundle = await getUsersProfilesBundle(empresaId);
    return bundle.members;
  },
);

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Respuesta inesperada del servidor de base de datos.");
  }
  return value as Record<string, unknown>;
}

/**
 * Consulta segura de identidad por documento mediante RPC SECURITY DEFINER.
 * Nunca expone PII en bruto ni realiza consultas directas a `public.usuarios`.
 */
export async function lookupPersonByDocumentInDb(
  empresaId: string,
  docType: CanonicalDocumentType,
  docNumber: string,
): Promise<DocumentLookupResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("buscar_persona_por_documento", {
    p_empresa_id: empresaId,
    p_tipo_documento: docType,
    p_numero_documento: docNumber,
  });

  if (error || !data) {
    throw new Error(
      error?.message ||
        "No se pudo verificar el documento en la base de datos.",
    );
  }

  const row = asRecord(data);
  const estado = row.estado;

  if (estado === "ya_es_miembro") {
    return {
      status: "ya_es_miembro",
      maskedName: String(row.nombre_enmascarado ?? "Colaborador"),
      roleName: String(row.perfil_nombre ?? "Miembro"),
      membershipStatus:
        row.estado_membresia === "desactivada" ? "desactivada" : "activa",
      registeredAt: String(row.registrado_en ?? new Date().toISOString()),
      daysSinceRegistration: Number(row.dias_desde_registro ?? 0),
    };
  }

  if (estado === "invitacion_pendiente") {
    return {
      status: "invitacion_pendiente",
      invitationId: String(row.invitacion_id ?? ""),
      maskedName: String(row.nombre_enmascarado ?? "Invitado"),
      roleName: String(row.perfil_nombre ?? "Colaborador"),
      sentAt: String(row.enviada_en ?? new Date().toISOString()),
      expiresAt: String(row.vence_en ?? new Date().toISOString()),
      hoursSinceSent: Number(row.horas_desde_envio ?? 0),
      daysSinceSent: Number(row.dias_desde_envio ?? 0),
    };
  }

  if (estado === "cuenta_existente") {
    return {
      status: "cuenta_existente",
      docType: (row.tipo_documento as DocumentType) ?? docType,
      maskedName: String(row.nombre_enmascarado ?? "U****"),
      maskedEmail: String(row.correo_enmascarado ?? "****"),
      maskedDocNumber: String(row.documento_enmascarado ?? "****"),
      maskedPhone: String(row.celular_enmascarado ?? "****"),
    };
  }

  if (estado === "no_encontrado") {
    return {
      status: "no_encontrado",
      docType: (row.tipo_documento as DocumentType) ?? docType,
      normalizedDocNumber: String(row.documento_normalizado ?? docNumber),
    };
  }

  throw new Error("Estado de verificación documental no reconocido.");
}

export interface RpcCreatedInvitationResult {
  invitationId: string;
  tipo: "nueva_cuenta" | "cuenta_existente";
  perfilId: string;
  perfilNombre: string;
  cargo: string | null;
  accesoWeb: boolean;
  accesoApp: boolean;
  accessLabel: AccessLabel;
  expiresAt: string;
  createdAt: string;
  displayName: string;
  displayEmail: string | null;
  displayPhone: string | null;
  maskedDocument: string | null;
}

function parseRpcInvitationResult(raw: unknown): RpcCreatedInvitationResult {
  const row = asRecord(raw);
  const invitationId =
    typeof row.invitacion_id === "string" ? row.invitacion_id : "";
  const perfilId = typeof row.perfil_id === "string" ? row.perfil_id : "";

  if (!invitationId || !perfilId) {
    throw new Error(
      "La base de datos no confirmó correctamente la creación de la invitación.",
    );
  }

  const accesoWeb = Boolean(row.acceso_web);
  const accesoApp = Boolean(row.acceso_app);
  const accessLabel = mapFlagsToAccessLabel(accesoWeb, accesoApp);
  const tipo =
    row.tipo === "cuenta_existente" ? "cuenta_existente" : "nueva_cuenta";

  if (tipo === "cuenta_existente") {
    return {
      invitationId,
      tipo,
      perfilId,
      perfilNombre: String(row.perfil_nombre ?? "Colaborador"),
      cargo: typeof row.cargo === "string" ? row.cargo : null,
      accesoWeb,
      accesoApp,
      accessLabel,
      expiresAt: String(row.vence_en ?? ""),
      createdAt: String(row.creado_en ?? ""),
      displayName: String(row.nombre_enmascarado ?? "Usuario Vittkly"),
      displayEmail:
        typeof row.correo_enmascarado === "string"
          ? row.correo_enmascarado
          : null,
      displayPhone:
        typeof row.celular_enmascarado === "string"
          ? row.celular_enmascarado
          : null,
      maskedDocument:
        typeof row.documento_enmascarado === "string"
          ? row.documento_enmascarado
          : null,
    };
  }

  return {
    invitationId,
    tipo,
    perfilId,
    perfilNombre: String(row.perfil_nombre ?? "Colaborador"),
    cargo: typeof row.cargo === "string" ? row.cargo : null,
    accesoWeb,
    accesoApp,
    accessLabel,
    expiresAt: String(row.vence_en ?? ""),
    createdAt: String(row.creado_en ?? ""),
    displayName: String(row.nombre_completo ?? row.correo ?? "Invitado"),
    displayEmail: typeof row.correo === "string" ? row.correo : null,
    displayPhone: typeof row.celular === "string" ? row.celular : null,
    maskedDocument:
      typeof row.documento_enmascarado === "string"
        ? row.documento_enmascarado
        : null,
  };
}

export async function createCompanyInvitationInDb(input: {
  empresaId: string;
  docType: CanonicalDocumentType;
  docNumber: string;
  perfilId: string;
  accesoWeb: boolean;
  accesoApp: boolean;
  cargo: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneE164?: string | null;
  tokenHash: string;
}): Promise<RpcCreatedInvitationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crear_invitacion_empresa", {
    p_empresa_id: input.empresaId,
    p_tipo_documento: input.docType,
    p_numero_documento: input.docNumber,
    p_perfil_id: input.perfilId,
    p_acceso_web: input.accesoWeb,
    p_acceso_app: input.accesoApp,
    p_cargo: input.cargo,
    p_nombres: input.firstName ?? null,
    p_apellidos: input.lastName ?? null,
    p_correo: input.email ?? null,
    p_celular: input.phoneE164 ?? null,
    p_token_hash: input.tokenHash,
  });

  if (error || !data) {
    throw new Error(
      error?.message ||
        "No se pudo registrar la invitación en la base de datos.",
    );
  }

  return parseRpcInvitationResult(data);
}

export async function resendCompanyInvitationInDb(
  invitationId: string,
  tokenHash: string,
): Promise<RpcCreatedInvitationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reenviar_invitacion_empresa", {
    p_invitacion_id: invitationId,
    p_token_hash: tokenHash,
  });

  if (error || !data) {
    throw new Error(
      error?.message || "No se pudo generar la nueva invitación.",
    );
  }

  return parseRpcInvitationResult(data);
}

/**
 * Resuelve exclusivamente en servidor el correo real de una invitación
 * `cuenta_existente` vía `service_role` para el envío de correo transaccional.
 * Nunca se retorna al cliente del administrador.
 */
export async function getExistingAccountEmailTargetInDb(
  invitationId: string,
  empresaId: string,
): Promise<{ email: string; recipientName: string } | null> {
  const adminClient = createAdminClient();
  const { data: invRow } = await adminClient
    .from("invitaciones")
    .select("usuario_id")
    .eq("id", invitationId)
    .eq("empresa_id", empresaId)
    .maybeSingle();

  if (!invRow?.usuario_id) {
    return null;
  }

  const { data: userRow } = await adminClient
    .from("usuarios")
    .select("correo, nombre, nombres, apellidos")
    .eq("id", invRow.usuario_id)
    .maybeSingle();

  if (!userRow?.correo) {
    return null;
  }

  const fullName =
    `${userRow.nombres ?? ""} ${userRow.apellidos ?? ""}`.trim() ||
    userRow.nombre ||
    "Colaborador";

  return {
    email: userRow.correo,
    recipientName: fullName,
  };
}
