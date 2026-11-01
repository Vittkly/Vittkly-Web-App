import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVE_ORG_COOKIE,
  LAST_ORG_COOKIE,
  type OrganizationOptions,
  type UserOrganization,
} from "../types/tenants.types";

interface MembershipOrgRow {
  es_propietario: boolean;
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
      return { userId: null, organizations: [], lastOrganizationId: null };

    const [{ data: rows }, { data: usuario }, cookieStore] = await Promise.all([
      supabase
        .from("membresias")
        .select(
          "es_propietario, empresas!inner(id, razon_social, nombre_comercial, activa, eliminado_en), perfiles(nombre)",
        )
        .eq("usuario_id", user.id)
        .eq("activo", true)
        .eq("acceso_web", true),
      supabase
        .from("usuarios")
        .select("ultima_empresa_id")
        .eq("id", user.id)
        .maybeSingle(),
      cookies(),
    ]);

    const organizations = ((rows ?? []) as unknown as MembershipOrgRow[])
      .filter((row) => row.empresas?.activa && !row.empresas.eliminado_en)
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

    return { userId: user.id, organizations, lastOrganizationId };
  },
);

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
