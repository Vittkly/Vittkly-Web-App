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

    const [{ data: rows }, { data: usuario }, cookieStore] = await Promise.all([
      supabase
        .from("membresias")
        .select(
          "es_propietario, acceso_web, empresas!inner(id, razon_social, nombre_comercial, activa, eliminado_en), perfiles(nombre)",
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

  return data as unknown as MisAccesosData;
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

  return (data ?? {}) as {
    aceptada?: boolean;
    empresa_id?: string | null;
    acceso_web?: boolean;
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
