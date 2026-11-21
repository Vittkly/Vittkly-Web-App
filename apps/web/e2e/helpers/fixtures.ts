import { TEST_IDS } from "./seed-data.mjs";

export { TEST_IDS };

export const MOCK_SUPABASE_URL =
  process.env.MOCK_SUPABASE_URL || "http://127.0.0.1:54329";

export interface TestPersona {
  key: "admin" | "operator" | "multiOrg" | "invalid";
  email: string;
  password: string;
  userId: string;
  displayName: string;
  canAccessConfig: boolean;
}

export const TEST_PERSONAS: Record<TestPersona["key"], TestPersona> = {
  admin: {
    key: "admin",
    email: "admin@vittkly.test",
    password: "Passw0rd!2026",
    userId: TEST_IDS.USER_ADMIN,
    displayName: "Andree Valencia",
    canAccessConfig: true,
  },
  operator: {
    key: "operator",
    email: "operador@vittkly.test",
    password: "Passw0rd!2026",
    userId: TEST_IDS.USER_OPERATOR,
    displayName: "Inés Quispe",
    canAccessConfig: false,
  },
  multiOrg: {
    key: "multiOrg",
    email: "multi@vittkly.test",
    password: "Passw0rd!2026",
    userId: TEST_IDS.USER_MULTI,
    displayName: "Carlos Mendoza",
    canAccessConfig: true,
  },
  invalid: {
    key: "invalid",
    email: "noexiste@vittkly.test",
    password: "WrongPassword!1",
    userId: "",
    displayName: "",
    canAccessConfig: false,
  },
};

export const ALL_17_WEB_MUTATED_TABLES = [
  "usuarios",
  "cuentas",
  "suscripciones",
  "empresas",
  "empresa_configuracion",
  "perfiles",
  "perfil_permisos",
  "membresias",
  "invitaciones",
  "solicitudes_salida",
  "casos_soporte",
  "clientes",
  "ordenes_trabajo",
  "plantillas_formulario",
  "respuestas_formulario",
  "evidencias_orden",
  "registros_tiempo",
] as const;

export const ALL_15_EVENT_TYPES = [
  "crear",
  "aceptar",
  "activar",
  "editar",
  "actualizar",
  "invitar",
  "reenviar",
  "suspender",
  "vencer",
  "solicitar",
  "borrar",
  "anular",
  "rechazar",
  "desvincular",
  "acceso",
] as const;

export const EXPECTED_TIME_RANGES = ["1d", "7d", "15d", "30d", "all"] as const;

export const RAW_SQL_TABLE_NAMES = [
  "perfil_permisos",
  "solicitudes_salida",
  "empresa_configuracion",
  "ordenes_trabajo",
  "plantillas_formulario",
  "respuestas_formulario",
  "evidencias_orden",
  "registros_tiempo",
  "casos_soporte",
] as const;

export async function resetMockSupabase(
  referenceNowMs?: number,
): Promise<void> {
  if (process.env.PLAYWRIGHT_USE_REAL_SUPABASE === "1") return;
  const res = await fetch(`${MOCK_SUPABASE_URL}/__test__/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      referenceNowMs: referenceNowMs ?? Date.now(),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to reset mock Supabase: ${res.status}`);
  }
}

export async function seedMockSupabase(payload: {
  replace?: Record<string, unknown[]>;
  append?: Record<string, unknown[]>;
}): Promise<void> {
  if (process.env.PLAYWRIGHT_USE_REAL_SUPABASE === "1") return;
  const res = await fetch(`${MOCK_SUPABASE_URL}/__test__/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to seed mock Supabase: ${res.status}`);
  }
}
