import "server-only";

import { createClient as createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type StaffRole = "admin" | "soporte";

export interface StaffAccessStatus {
  isAuthenticated: boolean;
  isStaff: boolean;
  staffRole: StaffRole | null;
  hasActiveWebMembership: boolean;
  userId: string | null;
  email: string | null;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Verifica en el servidor si el usuario autenticado pertenece al equipo/staff de Vittkly
 * (`public.staff_plataforma` / RPC `public.es_staff`) o cuenta con una membresía/perfil de
 * plataforma activo con privilegios de acceso interno.
 */
export async function verifyStaffAccess(): Promise<StaffAccessStatus> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      isStaff: false,
      staffRole: null,
      hasActiveWebMembership: false,
      userId: null,
      email: null,
    };
  }

  let isStaff = false;
  let staffRole: StaffRole | null = null;

  // 1. Verificar mediante RPC canónica public.es_staff()
  try {
    const { data: rpcIsStaff } = await supabase.rpc("es_staff");
    if (rpcIsStaff === true) {
      isStaff = true;
    }
  } catch (err) {
    console.warn("[Vittkly Staff Auth] Error ejecutando RPC es_staff:", err);
  }

  // 2. Consultar fila en public.staff_plataforma para conocer el rol ('admin' | 'soporte')
  try {
    const { data: staffRow } = await supabase
      .from("staff_plataforma")
      .select("usuario_id, rol, activo")
      .eq("usuario_id", user.id)
      .eq("activo", true)
      .maybeSingle();

    if (staffRow) {
      isStaff = true;
      staffRole = staffRow.rol === "admin" ? "admin" : "soporte";
    } else if (isStaff) {
      staffRole = "admin";
    }
  } catch (err) {
    console.warn(
      "[Vittkly Staff Auth] Error consultando staff_plataforma:",
      err,
    );
  }

  // 3. Verificar membresías activas (para redirección segura si es un usuario tenant pero no staff)
  let hasActiveWebMembership = false;
  try {
    const { data: memberships } = await supabase
      .from("membresias")
      .select("id, acceso_web, activo")
      .eq("usuario_id", user.id)
      .eq("activo", true);

    if (memberships && memberships.some((m) => m.acceso_web)) {
      hasActiveWebMembership = true;
    }
  } catch (err) {
    console.warn("[Vittkly Staff Auth] Error consultando membresías:", err);
  }

  return {
    isAuthenticated: true,
    isStaff,
    staffRole,
    hasActiveWebMembership,
    userId: user.id,
    email: user.email ?? null,
  };
}
