import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_ORG_COOKIE,
  LAST_ORG_COOKIE,
  type MisAccesosData,
  type OrganizationOptions,
  type UserOrganization,
} from "../types/tenants.types";

interface MembershipOrgRow {
  es_propietario: boolean;
  acceso_web: boolean;
  empresas: {
    id: string;
    razon_social: string;
    nombre_comercial: string | null;
    logo_ruta?: string | null;
    icono_menu_ruta?: string | null;
    color_marca?: string | null;
    activa: boolean;
    eliminado_en: string | null;
  } | null;
  perfiles: { nombre: string } | null;
}

/**
 * Empresas activas del usuario autenticado (membresía activa con acceso web).
 * El aislamiento lo garantiza RLS; el filtro por `usuario_id` es defensa en profundidad.
 */
export const getOrganizationOptions = cache(
  async (): Promise<OrganizationOptions> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return {
        userId: null,
        organizations: [],
        totalActiveCount: 0,
        lastOrganizationId: null,
      };

    const [
      { data: primaryRows, error: primaryError },
      { data: usuario },
      cookieStore,
    ] = await Promise.all([
      supabase
        .from("membresias")
        .select(
          "es_propietario, acceso_web, empresas!inner(id, razon_social, nombre_comercial, logo_ruta, icono_menu_ruta, color_marca, activa, eliminado_en), perfiles(nombre)",
        )
        .eq("usuario_id", user.id)
        .eq("estado", "activa")
        .eq("activo", true),
      supabase
        .from("usuarios")
        .select("ultima_empresa_id")
        .eq("id", user.id)
        .maybeSingle(),
      cookies(),
    ]);

    let rows = primaryRows;
    if (primaryError?.message?.includes("icono_menu_ruta")) {
      const fallback = await supabase
        .from("membresias")
        .select(
          "es_propietario, acceso_web, empresas!inner(id, razon_social, nombre_comercial, logo_ruta, color_marca, activa, eliminado_en), perfiles(nombre)",
        )
        .eq("usuario_id", user.id)
        .eq("estado", "activa")
        .eq("activo", true);
      rows = fallback.data as unknown as typeof primaryRows;
    }

    const activeRows = ((rows ?? []) as unknown as MembershipOrgRow[]).filter(
      (row) => row.empresas?.activa && !row.empresas.eliminado_en,
    );

    const organizations = activeRows
      .filter((row) => row.acceso_web)
      .map<UserOrganization>((row) => ({
        id: row.empresas!.id,
        name: row.empresas!.nombre_comercial || row.empresas!.razon_social,
        roleName: row.perfiles?.nombre ?? "Miembro",
        isOwner: row.es_propietario,
        logoUrl: row.empresas!.logo_ruta ?? null,
        menuIconUrl: row.empresas!.icono_menu_ruta ?? null,
        brandColor: row.empresas!.color_marca ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));

    const candidates = [
      cookieStore.get(LAST_ORG_COOKIE)?.value,
      usuario?.ultima_empresa_id,
    ];
    const lastOrganizationId =
      candidates.find((id) => id && organizations.some((o) => o.id === id)) ??
      null;

    return {
      userId: user.id,
      organizations,
      totalActiveCount: activeRows.length,
      lastOrganizationId,
    };
  },
);

/** Obtiene todos los accesos del usuario (empresas propias, membresías, invitaciones y cuenta) vía RPC segura. */
export const getMisAccesos = cache(async (): Promise<MisAccesosData | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase.rpc("mis_accesos");
  if (error || !data || typeof data !== "object") {
    console.warn(
      "[Vittkly Tenants] Error al obtener mis_accesos:",
      error?.message,
    );
    return null;
  }

  const parsed = data as unknown as MisAccesosData;

  // Enriquecer marca (logo_ruta, icono_menu_ruta, color_marca) si la RPC en la nube aún no los incluye
  const needsBrandEnrichment = [
    ...(parsed.empresas_propias ?? []),
    ...(parsed.empresas_miembro ?? []),
  ].some(
    (emp) => emp.logo_ruta === undefined && emp.icono_menu_ruta === undefined,
  );

  if (needsBrandEnrichment) {
    const empresaIds = Array.from(
      new Set([
        ...(parsed.empresas_propias ?? []).map((e) => e.empresa_id),
        ...(parsed.empresas_miembro ?? []).map((e) => e.empresa_id),
      ]),
    );

    if (empresaIds.length > 0) {
      const { data: brandRows, error: brandErr } = await supabase
        .from("empresas")
        .select("id, logo_ruta, icono_menu_ruta, color_marca")
        .in("id", empresaIds);

      let resolvedRows = brandRows as Array<{
        id: string;
        logo_ruta: string | null;
        icono_menu_ruta?: string | null;
        color_marca: string | null;
      }> | null;

      if (brandErr?.message?.includes("icono_menu_ruta")) {
        const fallback = await supabase
          .from("empresas")
          .select("id, logo_ruta, color_marca")
          .in("id", empresaIds);
        resolvedRows = fallback.data as typeof resolvedRows;
      }

      if (resolvedRows && resolvedRows.length > 0) {
        const byId = new Map(resolvedRows.map((row) => [row.id, row]));
        for (const emp of parsed.empresas_propias ?? []) {
          const b = byId.get(emp.empresa_id);
          if (b) {
            emp.logo_ruta = emp.logo_ruta ?? b.logo_ruta ?? null;
            emp.icono_menu_ruta =
              emp.icono_menu_ruta ?? b.icono_menu_ruta ?? null;
            emp.color_marca = emp.color_marca ?? b.color_marca ?? null;
          }
        }
        for (const emp of parsed.empresas_miembro ?? []) {
          const b = byId.get(emp.empresa_id);
          if (b) {
            emp.logo_ruta = emp.logo_ruta ?? b.logo_ruta ?? null;
            emp.icono_menu_ruta =
              emp.icono_menu_ruta ?? b.icono_menu_ruta ?? null;
            emp.color_marca = emp.color_marca ?? b.color_marca ?? null;
          }
        }
      }
    }
  }

  return parsed;
});

/** Número de invitaciones pendientes para el usuario autenticado. */
export async function getPendingInvitationsCount(): Promise<number> {
  const accesos = await getMisAccesos();
  return accesos?.invitaciones.length ?? 0;
}

/** Empresa activa validada contra las membresías reales (nunca se confía solo en la cookie). */
export async function resolveActiveOrganization() {
  const options = await getOrganizationOptions();
  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  const active = options.organizations.find((o) => o.id === activeId) ?? null;
  return { ...options, active };
}

/** Recuerda la última empresa en `public.usuarios.ultima_empresa_id` (política "editar mi usuario"). */
export async function persistLastOrganization(
  userId: string,
  organizationId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("usuarios")
    .update({ ultima_empresa_id: organizationId })
    .eq("id", userId);
  if (error)
    console.warn(
      "[Vittkly Tenants] No se pudo guardar ultima_empresa_id:",
      error.message,
    );
}

export async function respondInvitation(params: {
  invitacionId: string;
  acepta: boolean;
  motivo?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("responder_invitacion", {
    p_invitacion_id: params.invitacionId,
    p_acepta: params.acepta,
    p_motivo: params.motivo ?? null,
  });

  if (error) {
    throw new Error(error.message || "No se pudo procesar la invitación.");
  }

  const payload = (data ?? {}) as {
    aceptada?: boolean;
    empresa_id?: string | null;
    acceso_web?: boolean;
  };

  let empresaNombre: string | null = null;
  if (payload.aceptada && payload.empresa_id) {
    try {
      const { data: empresa, error: empError } = await supabase
        .from("empresas")
        .select("nombre_comercial, razon_social")
        .eq("id", payload.empresa_id)
        .maybeSingle();

      if (!empError && empresa) {
        empresaNombre =
          empresa.nombre_comercial?.trim() ||
          empresa.razon_social?.trim() ||
          null;
      }
    } catch {
      // No degradar la aceptación si falla la consulta auxiliar del nombre.
    }
  }

  return {
    ...payload,
    empresa_nombre: empresaNombre,
  };
}

export async function requestExitMembership(params: {
  membresiaId: string;
  motivo?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("solicitar_salida", {
    p_membresia_id: params.membresiaId,
    p_motivo: params.motivo ?? null,
  });

  if (error) {
    throw new Error(
      error.message || "No se pudo registrar la solicitud de salida.",
    );
  }

  return data as string;
}

export async function requestExitSupport(solicitudId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("pedir_soporte_salida", {
    p_solicitud_id: solicitudId,
  });

  if (error) {
    throw new Error(
      error.message || "No se pudo enviar la solicitud a soporte.",
    );
  }

  return data as string;
}

export async function createAdditionalCompany(params: {
  nombreEmpresa: string;
  rubro?: string | null;
  ciudad?: string | null;
  ruc?: string | null;
  modo: "sumar_cuenta" | "plan_propio";
  planCodigo: string;
  periodo: "mensual" | "anual";
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("crear_cuenta_y_empresa", {
    p_nombre_empresa: params.nombreEmpresa,
    p_ruc: params.ruc ?? null,
    p_plan_codigo: params.planCodigo,
    p_rubro: params.rubro ?? null,
    p_ciudad: params.ciudad ?? null,
    p_modo: params.modo,
    p_periodo: params.periodo,
  });

  if (error || !data) {
    throw new Error(error?.message || "No se pudo crear la empresa.");
  }

  return data as string;
}
