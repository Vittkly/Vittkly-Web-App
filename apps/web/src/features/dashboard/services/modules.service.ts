import "server-only";

import {
  CANONICAL_MODULES,
  getPlanModuleCodes,
  getRequiredPlanBadgeLabel,
  isTenantAdminRole,
  normalizeModuleCodesToCanonical,
  type CanonicalModuleCode,
  type PlanCode,
} from "@vittkly/shared";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type PlanCodigo = PlanCode;

export interface ModulePermissionDetail {
  code: string;
  description: string;
  scope: string | null;
}

export interface EnrichedModule {
  codigo: string;
  nombre: string;
  grupo: string;
  modelo: string;
  etapa: number;
  disponible: boolean;
  orden: number;
  permissions: ModulePermissionDetail[];
  permissionSummary: string;
}

export interface DashboardContextResult {
  user: {
    id: string;
    nombre: string;
    correo: string;
    avatarRuta: string | null;
  };
  activeOrganization: {
    id: string;
    razonSocial: string;
    nombreComercial: string | null;
    ruc: string | null;
    modeloOperacion: string;
    moneda: string;
    pais: string;
    activa: boolean;
    logoRuta: string | null;
    iconoMenuRuta: string | null;
    colorMarca: string | null;
    menuAcordeon: boolean;
  };
  activePlan: {
    id: string;
    codigo: PlanCodigo;
    nombre: string;
    usuariosIncluidos: number;
    estadoSuscripcion: string;
    pruebaHasta: string | null;
  };
  activeProfile: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    esPropietario: boolean;
    accesoWeb: boolean;
    isSimulated?: boolean;
  };
  globalCapabilities: {
    canViewPrices: boolean;
    canValidateServices: boolean;
    canEditConfig: boolean;
    canManageUsers: boolean;
  };
  canAccessConfig: boolean;
  allowedModules: CanonicalModuleCode[];
  allowedByPlanModules: CanonicalModuleCode[];
  enabledModules: EnrichedModule[];
  planLockedModules: Array<{
    codigo: string;
    nombre: string;
    grupo: string;
    requiredPlan: string;
  }>;
  roleRestrictedModules: Array<{
    codigo: string;
    nombre: string;
    grupo: string;
  }>;
  availableOrganizations: Array<{
    id: string;
    nombre: string;
    rol: string;
  }>;
  availableProfilesForPreview: Array<{
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
  }>;
}

const CANONICAL_DB_FALLBACK: Database["public"]["Tables"]["modulos"]["Row"][] =
  CANONICAL_MODULES.map((m) => ({
    codigo: m.code,
    nombre: m.label,
    grupo:
      m.process === "root"
        ? m.code === "reportes"
          ? "reportes"
          : "sin_grupo"
        : m.process,
    modelo:
      m.code === "cotizaciones" ||
      m.code === "post_venta" ||
      m.code === "marketing" ||
      m.code === "sitio_web_reservas"
        ? "visita"
        : "comun",
    etapa: m.minPlan === "inicia" ? 1 : m.minPlan === "crece" ? 2 : 3,
    disponible: !m.isPronto,
    orden: m.orden,
    creado_en: "",
    creado_por: null,
    actualizado_en: "",
    actualizado_por: null,
  }));

function normalizePlanCodigo(raw?: string | null): PlanCodigo {
  const clean = (raw ?? "").trim().toLowerCase();
  if (clean === "inicia" || clean === "crece" || clean === "empresa") {
    return clean;
  }
  return "empresa";
}

function resolveUserAllowedModuleSet(
  userPermissionsMap: Map<string, { alcance: string | null; desc?: string }>,
): Set<CanonicalModuleCode> {
  const rawModuleViewCodes: string[] = [];
  for (const [permCode, meta] of userPermissionsMap.entries()) {
    if (
      permCode.endsWith(".ver") &&
      permCode !== "precios.ver" &&
      permCode !== "usuarios.ver" &&
      permCode !== "auditoria.ver" &&
      permCode !== "costeo.ver" &&
      permCode !== "cotizaciones.ver_montos" &&
      meta.alcance !== "ninguna"
    ) {
      rawModuleViewCodes.push(permCode.slice(0, -4));
    }
  }
  return new Set(normalizeModuleCodesToCanonical(rawModuleViewCodes));
}

export async function getDashboardContext(
  selectedEmpresaId?: string,
  previewPerfilCodigo?: string,
): Promise<DashboardContextResult | null> {
  const supabase = await createServerClient();

  // 1. Obtener usuario autenticado
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // 2. Obtener datos de la persona en public.usuarios
  const { data: usuarioRow } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  // 3. Consultar membresías activas del usuario
  let { data: rawMemberships } = await supabase
    .from("membresias")
    .select(
      `
      id,
      empresa_id,
      perfil_id,
      es_propietario,
      acceso_web,
      activo,
      empresas (*),
      perfiles (*)
    `,
    )
    .eq("usuario_id", authUser.id)
    .eq("activo", true);

  // Auto-provisión si el usuario acaba de registrarse y no tiene empresa
  if (!rawMemberships || rawMemberships.length === 0) {
    const meta = authUser.user_metadata || {};
    if (meta.company_name) {
      try {
        await supabase.rpc("crear_cuenta_y_empresa", {
          p_nombre_empresa: meta.company_name,
          p_ruc: meta.ruc || null,
          p_plan_codigo: meta.plan_code || "empresa",
        });

        const recheck = await supabase
          .from("membresias")
          .select(
            `
            id,
            empresa_id,
            perfil_id,
            es_propietario,
            acceso_web,
            activo,
            empresas (*),
            perfiles (*)
          `,
          )
          .eq("usuario_id", authUser.id)
          .eq("activo", true);

        rawMemberships = recheck.data;
      } catch (err) {
        console.warn(
          "[Vittkly Dashboard] Error auto-aprovisionando empresa:",
          err,
        );
      }
    }
  }

  if (!rawMemberships || rawMemberships.length === 0) {
    return null;
  }

  // Filtrar membresías con acceso web (mantener respaldo si solo tiene app y no admin)
  const webMemberships = rawMemberships.filter((m) => m.acceso_web);
  const activeMembershipsList =
    webMemberships.length > 0 ? webMemberships : rawMemberships;

  // 4. Resolver la Empresa Activa
  let activeMembership = activeMembershipsList[0];
  if (selectedEmpresaId) {
    const found = activeMembershipsList.find(
      (m) => m.empresa_id === selectedEmpresaId,
    );
    if (found) activeMembership = found;
  } else if (usuarioRow?.ultima_empresa_id) {
    const found = activeMembershipsList.find(
      (m) => m.empresa_id === usuarioRow.ultima_empresa_id,
    );
    if (found) activeMembership = found;
  }

  const activeEmpresa =
    (activeMembership.empresas as unknown as Database["public"]["Tables"]["empresas"]["Row"]) || {
      id: activeMembership.empresa_id,
      razon_social: "Mi Empresa",
      nombre_comercial: null,
      ruc: null,
      modelo_operacion: "ambos",
      moneda: "PEN",
      pais: "PE",
      activa: true,
    };

  // 5. Consultar la Suscripción y el Plan Activo de la Empresa
  let activePlanCodigo: PlanCodigo = "empresa";
  let planNombre = "Empresa";
  let planUsuarios = 15;
  let subEstado = "prueba";
  let subPruebaHasta: string | null = null;
  let planId = "";

  try {
    const { data: cuentaData } = await supabase
      .from("cuentas")
      .select("*, suscripciones(*, planes(*))")
      .eq("id", activeEmpresa.cuenta_id)
      .maybeSingle();

    const suscripcion =
      cuentaData?.suscripciones as unknown as Database["public"]["Tables"]["suscripciones"]["Row"] & {
        planes?: Database["public"]["Tables"]["planes"]["Row"];
      };

    if (suscripcion) {
      subEstado = suscripcion.estado || "prueba";
      subPruebaHasta = suscripcion.prueba_hasta || null;
      if (suscripcion.planes) {
        planId = suscripcion.planes.id;
        activePlanCodigo = normalizePlanCodigo(suscripcion.planes.codigo);
        planNombre = suscripcion.planes.nombre || "Empresa";
        planUsuarios = suscripcion.planes.usuarios_incluidos || 15;
      }
    }
  } catch (err) {
    console.warn("[Vittkly Dashboard] Error obteniendo cuenta/plan:", err);
  }

  // 6. Consultar Módulos Permitidos por el Plan (public.plan_modulos -> fallback matriz 10/16/19)
  let allowedByPlanSet = new Set<CanonicalModuleCode>();

  if (planId) {
    const { data: planModulosRows } = await supabase
      .from("plan_modulos")
      .select("modulo_codigo")
      .eq("plan_id", planId);

    if (planModulosRows && planModulosRows.length > 0) {
      const normalized = normalizeModuleCodesToCanonical(
        planModulosRows.map((r) => r.modulo_codigo),
      );
      if (normalized.length > 0) {
        allowedByPlanSet = new Set(normalized);
      }
    }
  }

  if (allowedByPlanSet.size === 0) {
    allowedByPlanSet = new Set(getPlanModuleCodes(activePlanCodigo));
  }

  const allowedByPlanModules = CANONICAL_MODULES.filter((m) =>
    allowedByPlanSet.has(m.code),
  ).map((m) => m.code);

  // 7. Consultar Perfiles de la Empresa (para previsualización admin)
  const { data: empresaPerfiles } = await supabase
    .from("perfiles")
    .select("*")
    .or(`empresa_id.eq.${activeEmpresa.id},empresa_id.is.null`);

  const assignedPerfilRow =
    activeMembership.perfiles as unknown as Database["public"]["Tables"]["perfiles"]["Row"];

  const assignedIsAdmin = isTenantAdminRole(
    activeMembership.es_propietario,
    assignedPerfilRow?.codigo,
  );

  let activePerfilRow = assignedPerfilRow;
  let isSimulated = false;

  // Simulación solo permitida para propietario/admin real
  if (previewPerfilCodigo && assignedIsAdmin) {
    const simulated = (empresaPerfiles || []).find(
      (p) => p.codigo === previewPerfilCodigo,
    );
    if (simulated) {
      activePerfilRow = simulated;
      isSimulated = true;
    }
  }

  // Nunca asignar "admin" por defecto cuando codigo es null (perfiles personalizados)
  const activePerfilCodigo = activePerfilRow?.codigo ?? "";
  const effectiveIsOwner = isSimulated
    ? false
    : activeMembership.es_propietario;
  const isAdmin = isTenantAdminRole(effectiveIsOwner, activePerfilCodigo);

  // 8. Consultar Permisos del Perfil Activo (public.perfil_permisos)
  let userPermisosRows: Array<{
    permiso_codigo: string;
    alcance: string | null;
    permisos?: Database["public"]["Tables"]["permisos"]["Row"];
  }> = [];

  if (activePerfilRow?.id) {
    const { data: ppRows } = await supabase
      .from("perfil_permisos")
      .select("permiso_codigo, alcance, permisos (*)")
      .eq("perfil_id", activePerfilRow.id);

    if (ppRows) {
      userPermisosRows = ppRows as unknown as typeof userPermisosRows;
    }
  }

  const userPermissionsMap = new Map<
    string,
    { alcance: string | null; desc?: string }
  >();
  userPermisosRows.forEach((p) => {
    userPermissionsMap.set(p.permiso_codigo, {
      alcance: p.alcance,
      desc: p.permisos?.descripcion,
    });
  });

  //Acceso a Configuraciones: Propietario, Admin/Administrador, permiso configuracion.editar o módulo configuraciones asignado
  const hasConfigEditPermission =
    userPermissionsMap.has("configuracion.editar") &&
    userPermissionsMap.get("configuracion.editar")?.alcance !== "ninguna";
  const rawProfileConfig = activePerfilRow?.configuracion as
    { modulos?: unknown } | null | undefined;
  const hasConfigModuleAssigned =
    (Array.isArray(rawProfileConfig?.modulos) &&
      rawProfileConfig.modulos.includes("configuraciones")) ||
    userPermissionsMap.has("configuracion.ver") ||
    userPermissionsMap.has("configuraciones.ver");

  const canEditConfig = isAdmin || hasConfigEditPermission;
  const canAccessConfig = canEditConfig || hasConfigModuleAssigned;
  const canViewPrices = isAdmin || userPermissionsMap.has("precios.ver");
  const canValidateServices =
    isAdmin || userPermissionsMap.has("servicios.validar");
  const canManageUsers =
    isAdmin ||
    (userPermissionsMap.has("usuarios.invitar") &&
      userPermissionsMap.get("usuarios.invitar")?.alcance !== "ninguna");

  // Consultar empresa_configuracion para menu_acordeon y catálogo de módulos en paralelo
  const [{ data: dbModulos }, { data: empresaCfgRow }] = await Promise.all([
    supabase.from("modulos").select("*").order("orden", { ascending: true }),
    supabase
      .from("empresa_configuracion")
      .select("menu_acordeon")
      .eq("empresa_id", activeEmpresa.id)
      .maybeSingle(),
  ]);

  const dbModuloByCode = new Map(
    (dbModulos && dbModulos.length > 0 ? dbModulos : CANONICAL_DB_FALLBACK).map(
      (m) => [m.codigo, m],
    ),
  );

  // 10. Filtrado Estricto: Plan (para todos, incluido Owner/Admin) + Perfil (perfil_permisos)
  const profileAllowedSet = resolveUserAllowedModuleSet(userPermissionsMap);

  const allowedModules: CanonicalModuleCode[] = [];
  const enabledModules: EnrichedModule[] = [];
  const planLockedModules: Array<{
    codigo: string;
    nombre: string;
    grupo: string;
    requiredPlan: string;
  }> = [];
  const roleRestrictedModules: Array<{
    codigo: string;
    nombre: string;
    grupo: string;
  }> = [];

  for (const modMeta of CANONICAL_MODULES) {
    const dbRow = dbModuloByCode.get(modMeta.code);
    const grupo =
      modMeta.process === "root"
        ? modMeta.code === "reportes"
          ? "reportes"
          : "sin_grupo"
        : modMeta.process;
    const isAllowedByPlan = allowedByPlanSet.has(modMeta.code);
    const hasViewPermission = isAdmin || profileAllowedSet.has(modMeta.code);

    if (isAllowedByPlan && hasViewPermission) {
      allowedModules.push(modMeta.code);

      const modulePermissions: ModulePermissionDetail[] = [
        {
          code: `${modMeta.code}.ver`,
          description: `Entrar a ${modMeta.label}`,
          scope: isAdmin ? "todas" : null,
        },
      ];

      if (modMeta.code === "cotizaciones") {
        if (isAdmin || userPermissionsMap.has("cotizaciones.editar")) {
          modulePermissions.push({
            code: "cotizaciones.editar",
            description: "Editar cotizaciones",
            scope:
              userPermissionsMap.get("cotizaciones.editar")?.alcance ||
              (isAdmin ? "todas" : "propias"),
          });
        }
        if (isAdmin || userPermissionsMap.has("cotizaciones.ver_montos")) {
          modulePermissions.push({
            code: "cotizaciones.ver_montos",
            description: "Ver montos y totales",
            scope:
              userPermissionsMap.get("cotizaciones.ver_montos")?.alcance ||
              null,
          });
        }
      }

      if (modMeta.code === "calendario" || modMeta.code === "trabajos") {
        if (canValidateServices && modMeta.code === "trabajos") {
          modulePermissions.push({
            code: "servicios.validar",
            description: "Validar servicios cerrados",
            scope: null,
          });
        }
        if (isAdmin || userPermissionsMap.has("programacion.editar")) {
          modulePermissions.push({
            code: "programacion.editar",
            description: "Programar y reprogramar",
            scope:
              userPermissionsMap.get("programacion.editar")?.alcance || "todas",
          });
        }
      }

      if (
        modMeta.code === "cobranzas" &&
        (isAdmin || userPermissionsMap.has("pagos.registrar"))
      ) {
        modulePermissions.push({
          code: "pagos.registrar",
          description: "Registrar cobros y pagos",
          scope: "todas",
        });
      }

      if (
        modMeta.code === "rentabilidad" &&
        (isAdmin || userPermissionsMap.has("costeo.ver"))
      ) {
        modulePermissions.push({
          code: "costeo.ver",
          description: "Ver márgenes y rentabilidad",
          scope: null,
        });
      }

      if (
        modMeta.code === "reportes" &&
        (isAdmin || userPermissionsMap.has("datos.exportar"))
      ) {
        modulePermissions.push({
          code: "datos.exportar",
          description: "Exportar reportes a Excel",
          scope: null,
        });
      }

      let summary = "Solo Lectura";
      if (isAdmin) {
        summary = "Control Total (Administrador)";
      } else if (
        modulePermissions.some(
          (p) => p.code.includes("editar") || p.code.includes("registrar"),
        )
      ) {
        summary = "Lectura y Edición";
      } else if (modulePermissions.some((p) => p.code.includes("validar"))) {
        summary = "Lectura y Validación";
      }

      enabledModules.push({
        codigo: modMeta.code,
        nombre: modMeta.label,
        grupo,
        modelo: dbRow?.modelo ?? "comun",
        etapa: dbRow?.etapa ?? 1,
        disponible: dbRow ? dbRow.disponible : !modMeta.isPronto,
        orden: modMeta.orden,
        permissions: modulePermissions,
        permissionSummary: summary,
      });
    } else if (!isAllowedByPlan) {
      planLockedModules.push({
        codigo: modMeta.code,
        nombre: modMeta.label,
        grupo,
        requiredPlan: getRequiredPlanBadgeLabel(modMeta.minPlan),
      });
    } else {
      roleRestrictedModules.push({
        codigo: modMeta.code,
        nombre: modMeta.label,
        grupo,
      });
    }
  }

  // Lista de organizaciones para el selector
  const availableOrganizations = activeMembershipsList.map((m) => {
    const emp =
      m.empresas as unknown as Database["public"]["Tables"]["empresas"]["Row"];
    return {
      id: m.empresa_id,
      nombre: emp?.nombre_comercial || emp?.razon_social || "Mi Empresa",
      rol: m.es_propietario ? "Propietario" : "Miembro",
    };
  });

  // Lista de perfiles para simulación
  const availableProfilesForPreview = (empresaPerfiles || [])
    .filter(
      (p, index, self) =>
        index ===
        self.findIndex((t) => t.codigo === p.codigo && t.nombre === p.nombre),
    )
    .map((p) => ({
      id: p.id,
      codigo: p.codigo || "personalizado",
      nombre: p.nombre,
      descripcion: p.descripcion,
    }));

  return {
    user: {
      id: authUser.id,
      nombre:
        usuarioRow?.nombre ||
        (authUser.user_metadata?.full_name as string) ||
        "Usuario Vittkly",
      correo: authUser.email || "",
      avatarRuta: usuarioRow?.avatar_ruta || null,
    },
    activeOrganization: {
      id: activeEmpresa.id,
      razonSocial: activeEmpresa.razon_social,
      nombreComercial: activeEmpresa.nombre_comercial,
      ruc: activeEmpresa.ruc,
      modeloOperacion: activeEmpresa.modelo_operacion,
      moneda: activeEmpresa.moneda,
      pais: activeEmpresa.pais,
      activa: activeEmpresa.activa,
      logoRuta: activeEmpresa.logo_ruta ?? null,
      iconoMenuRuta: activeEmpresa.icono_menu_ruta ?? null,
      colorMarca: activeEmpresa.color_marca ?? null,
      menuAcordeon: Boolean(empresaCfgRow?.menu_acordeon),
    },
    activePlan: {
      id: planId,
      codigo: activePlanCodigo,
      nombre: planNombre,
      usuariosIncluidos: planUsuarios,
      estadoSuscripcion: subEstado,
      pruebaHasta: subPruebaHasta,
    },
    activeProfile: {
      id: activePerfilRow?.id || "",
      codigo: activePerfilCodigo,
      nombre: activePerfilRow?.nombre || "Personalizado",
      descripcion: activePerfilRow?.descripcion || null,
      esPropietario: effectiveIsOwner,
      accesoWeb: activeMembership.acceso_web,
      isSimulated,
    },
    globalCapabilities: {
      canViewPrices,
      canValidateServices,
      canEditConfig,
      canManageUsers,
    },
    canAccessConfig,
    allowedModules,
    allowedByPlanModules,
    enabledModules,
    planLockedModules,
    roleRestrictedModules,
    availableOrganizations,
    availableProfilesForPreview,
  };
}

export interface StaffDashboardContextResult {
  user: {
    id: string;
    nombre: string;
    correo: string;
    avatarRuta: string | null;
  };
  staffRole: "admin" | "soporte";
  roleLabel: string;
  enabledModules: EnrichedModule[];
}

export async function getStaffDashboardContext(): Promise<StaffDashboardContextResult | null> {
  const supabase = await createServerClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  let isStaff = false;
  let staffRole: "admin" | "soporte" = "admin";

  try {
    const { data: rpcIsStaff } = await supabase.rpc("es_staff");
    if (rpcIsStaff === true) {
      isStaff = true;
    }
  } catch (err) {
    console.warn(
      "[Vittkly Staff Dashboard] Error verificando es_staff RPC:",
      err,
    );
  }

  try {
    const { data: staffRow } = await supabase
      .from("staff_plataforma")
      .select("usuario_id, rol, activo")
      .eq("usuario_id", authUser.id)
      .eq("activo", true)
      .maybeSingle();

    if (staffRow) {
      isStaff = true;
      staffRole = staffRow.rol === "soporte" ? "soporte" : "admin";
    }
  } catch (err) {
    console.warn(
      "[Vittkly Staff Dashboard] Error consultando staff_plataforma:",
      err,
    );
  }

  if (!isStaff) {
    return null;
  }

  const { data: usuarioRow } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  const { data: dbModulos } = await supabase
    .from("modulos")
    .select("*")
    .order("orden", { ascending: true });

  const allModules =
    dbModulos && dbModulos.length > 0 ? dbModulos : CANONICAL_DB_FALLBACK;

  const { data: dbPermisos } = await supabase
    .from("permisos")
    .select("codigo, modulo_codigo, descripcion");

  const readPermissionCodes = new Set<string>(
    (dbPermisos || []).map((p) => p.codigo),
  );

  const { data: userMemberships } = await supabase
    .from("membresias")
    .select("perfil_id, activo")
    .eq("usuario_id", authUser.id)
    .eq("activo", true);

  const customProfileAllowedModules = new Set<string>();
  if (userMemberships && userMemberships.length > 0) {
    const perfilIds = userMemberships.map((m) => m.perfil_id);
    const { data: ppRows } = await supabase
      .from("perfil_permisos")
      .select("permiso_codigo, alcance")
      .in("perfil_id", perfilIds);

    (ppRows || []).forEach((pp) => {
      if (pp.permiso_codigo.endsWith(".ver") && pp.alcance !== "ninguna") {
        customProfileAllowedModules.add(
          pp.permiso_codigo.replace(/\.ver$/, ""),
        );
      }
    });
  }

  const SOPORTE_DEFAULT_MODULES = new Set<string>([
    "dashboard",
    "calendario",
    "clientes",
    "trabajos",
    "post_venta",
    "biblioteca_academia",
    "reportes",
  ]);

  const enabledModules: EnrichedModule[] = [];

  for (const m of allModules) {
    const hasCatalogReadPerm =
      readPermissionCodes.size === 0 ||
      readPermissionCodes.has(`${m.codigo}.ver`);

    const hasRoleReadAccess =
      staffRole === "admin" ||
      customProfileAllowedModules.has(m.codigo) ||
      SOPORTE_DEFAULT_MODULES.has(m.codigo);

    if (hasCatalogReadPerm && hasRoleReadAccess) {
      enabledModules.push({
        codigo: m.codigo,
        nombre: m.nombre,
        grupo: m.grupo,
        modelo: m.modelo,
        etapa: m.etapa,
        disponible: m.disponible,
        orden: m.orden,
        permissions: [
          {
            code: `${m.codigo}.ver`,
            description: `Entrar a ${m.nombre}`,
            scope: "todas",
          },
        ],
        permissionSummary:
          staffRole === "admin"
            ? "Acceso Total (Staff Admin)"
            : "Lectura y Soporte (Staff)",
      });
    }
  }

  return {
    user: {
      id: authUser.id,
      nombre:
        usuarioRow?.nombre ||
        (authUser.user_metadata?.full_name as string | undefined) ||
        "Staff Vittkly",
      correo: authUser.email || "",
      avatarRuta: usuarioRow?.avatar_ruta || null,
    },
    staffRole,
    roleLabel:
      staffRole === "admin" ? "Superadmin Plataforma" : "Soporte Staff Vittkly",
    enabledModules,
  };
}
