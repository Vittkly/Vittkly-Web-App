import "server-only";

import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export interface InvitationDetails {
  id: string;
  empresaId: string;
  empresaNombre: string;
  empresaLogoUrl: string | null;
  empresaMenuIconUrl?: string | null;
  empresaBrandColor?: string | null;
  perfilId: string;
  perfilNombre: string;
  perfilCodigo: string;
  nombres: string | null;
  apellidos: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  correo: string;
  celular: string | null;
  cargo: string | null;
  accesoWeb: boolean;
  accesoApp: boolean;
  venceEn: string;
}

export type InvitationVerificationStatus =
  | {
      status: "valid";
      tipo: "cuenta_existente";
      invitation: InvitationDetails;
      existingUserName: string | null;
      isAuthenticated: boolean;
    }
  | {
      status: "valid";
      tipo: "nueva_cuenta";
      invitation: InvitationDetails;
      isAuthenticated: boolean;
    }
  | {
      status: "invalid_or_expired";
      reason: "not_found" | "expired" | "already_used";
    };

function hashToken(rawToken: string): string {
  return createHash("sha256")
    .update(rawToken.trim().toUpperCase(), "utf8")
    .digest("hex");
}

/**
 * Consulta y valida un token de invitación (`rawToken`), retornando el contexto
 * de la empresa, perfil y si el usuario ya existe previamente en Vittkly.
 */
export async function getInvitationByToken(
  rawToken: string,
): Promise<InvitationVerificationStatus> {
  if (!rawToken || !rawToken.trim()) {
    return { status: "invalid_or_expired", reason: "not_found" };
  }

  const trimmedToken = rawToken.trim();
  const hashed = hashToken(trimmedToken);
  const adminClient = createAdminClient();

  // 1. Buscar en public.invitaciones por token_hash, codigo_hash, o id directo
  const { data: invRow, error: invError } = await adminClient
    .from("invitaciones")
    .select(
      "id, empresa_id, tipo, usuario_id, nombres, apellidos, tipo_documento, numero_documento, correo, celular, datos_enmascarados, perfil_id, cargo, acceso_web, acceso_app, codigo_hash, token_hash, vence_en, estado",
    )
    .or(
      `token_hash.eq.${hashed},codigo_hash.eq.${hashed},token_hash.eq.${trimmedToken}`,
    )
    .maybeSingle();

  if (invError || !invRow) {
    // Si no encontró por hash, intentar buscar por id si es UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        trimmedToken,
      );
    if (isUuid) {
      const { data: invById } = await adminClient
        .from("invitaciones")
        .select(
          "id, empresa_id, tipo, usuario_id, nombres, apellidos, tipo_documento, numero_documento, correo, celular, datos_enmascarados, perfil_id, cargo, acceso_web, acceso_app, codigo_hash, token_hash, vence_en, estado",
        )
        .eq("id", trimmedToken)
        .maybeSingle();

      if (invById) {
        return processInvitationRow(invById, adminClient);
      }
    }

    return { status: "invalid_or_expired", reason: "not_found" };
  }

  return processInvitationRow(invRow, adminClient);
}

interface InvitationRowData {
  id: string;
  empresa_id: string;
  tipo: string;
  usuario_id: string | null;
  nombres: string | null;
  apellidos: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  correo: string | null;
  celular: string | null;
  datos_enmascarados: unknown;
  perfil_id: string;
  cargo: string | null;
  acceso_web: boolean | null;
  acceso_app: boolean | null;
  codigo_hash: string;
  token_hash: string | null;
  vence_en: string | null;
  estado: string;
}

async function processInvitationRow(
  invRow: InvitationRowData,
  adminClient: ReturnType<typeof createAdminClient>,
): Promise<InvitationVerificationStatus> {
  // Verificar si ya fue usada o anulada
  if (invRow.estado !== "pendiente") {
    return { status: "invalid_or_expired", reason: "already_used" };
  }

  // Verificar si expiró
  if (invRow.vence_en && new Date(invRow.vence_en) < new Date()) {
    return { status: "invalid_or_expired", reason: "expired" };
  }

  // Consultar datos de la empresa
  const { data: primaryEmp, error: empErr } = await adminClient
    .from("empresas")
    .select(
      "id, razon_social, nombre_comercial, logo_ruta, icono_menu_ruta, color_marca",
    )
    .eq("id", invRow.empresa_id)
    .maybeSingle();

  let empresaData = primaryEmp as {
    id: string;
    razon_social: string;
    nombre_comercial: string | null;
    logo_ruta: string | null;
    icono_menu_ruta?: string | null;
    color_marca?: string | null;
  } | null;

  if (empErr?.message?.includes("icono_menu_ruta")) {
    const fallbackEmp = await adminClient
      .from("empresas")
      .select("id, razon_social, nombre_comercial, logo_ruta, color_marca")
      .eq("id", invRow.empresa_id)
      .maybeSingle();
    empresaData = fallbackEmp.data as typeof empresaData;
  }

  // Consultar datos del perfil
  const { data: perfilData } = await adminClient
    .from("perfiles")
    .select("id, nombre, codigo")
    .eq("id", invRow.perfil_id)
    .maybeSingle();

  const empresaNombre =
    empresaData?.nombre_comercial ||
    empresaData?.razon_social ||
    "Empresa Vittkly";
  const empresaLogoUrl = empresaData?.logo_ruta ?? null;
  const empresaMenuIconUrl = empresaData?.icono_menu_ruta ?? null;
  const empresaBrandColor = empresaData?.color_marca ?? null;
  const perfilNombre = perfilData?.nombre || "Colaborador";
  const perfilCodigo = perfilData?.codigo || "colaborador";
  const maskedObj =
    invRow.datos_enmascarados &&
    typeof invRow.datos_enmascarados === "object" &&
    !Array.isArray(invRow.datos_enmascarados)
      ? (invRow.datos_enmascarados as Record<string, unknown>)
      : null;

  const targetEmail = (invRow.correo || "").trim().toLowerCase();
  const maskedEmail =
    typeof maskedObj?.correo === "string" ? maskedObj.correo : "";

  const invitation: InvitationDetails = {
    id: invRow.id,
    empresaId: invRow.empresa_id,
    empresaNombre,
    empresaLogoUrl,
    empresaMenuIconUrl,
    empresaBrandColor,
    perfilId: invRow.perfil_id,
    perfilNombre,
    perfilCodigo,
    nombres: invRow.nombres,
    apellidos: invRow.apellidos,
    tipoDocumento: invRow.tipo_documento,
    numeroDocumento: invRow.numero_documento,
    correo:
      invRow.tipo === "cuenta_existente"
        ? maskedEmail
        : targetEmail || maskedEmail,
    celular: invRow.tipo === "cuenta_existente" ? null : invRow.celular,
    cargo: invRow.cargo,
    accesoWeb: Boolean(invRow.acceso_web),
    accesoApp: Boolean(invRow.acceso_app),
    venceEn: invRow.vence_en ?? "",
  };

  // Verificar si el usuario que visita ya tiene sesión iniciada
  const supabase = await createServerClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(currentUser);

  // Determinar si ya existe una cuenta de usuario registrada en Vittkly sin exponer PII a visitantes anónimos
  let existingUserName: string | null = null;
  let userExists = invRow.tipo === "cuenta_existente";

  if (invRow.tipo === "cuenta_existente") {
    if (
      currentUser &&
      invRow.usuario_id &&
      currentUser.id === invRow.usuario_id
    ) {
      const { data: userRow } = await adminClient
        .from("usuarios")
        .select("nombre")
        .eq("id", invRow.usuario_id)
        .maybeSingle();
      existingUserName = userRow?.nombre ?? null;
    } else if (typeof maskedObj?.nombre === "string") {
      existingUserName = maskedObj.nombre;
    }
  } else if (targetEmail) {
    const { data: userRow } = await adminClient
      .from("usuarios")
      .select("id, nombre, correo")
      .eq("correo", targetEmail)
      .maybeSingle();

    if (userRow) {
      userExists = true;
      existingUserName = userRow.nombre;
    } else {
      // Verificar si existe en Supabase Auth
      try {
        const { data: authUsers } = await adminClient.auth.admin.listUsers();
        const found = authUsers?.users?.find(
          (u) => (u.email || "").toLowerCase() === targetEmail,
        );
        if (found) {
          userExists = true;
          existingUserName =
            (found.user_metadata?.full_name as string) ||
            (found.user_metadata?.nombre as string) ||
            found.email ||
            null;
        }
      } catch (authErr) {
        console.warn("[Vittkly Auth] Error listando usuarios auth:", authErr);
      }
    }
  }

  // Si la invitación fue marcada explícitamente como 'cuenta_existente' o el usuario ya existe en la BD
  if (userExists) {
    return {
      status: "valid",
      tipo: "cuenta_existente",
      invitation,
      existingUserName:
        existingUserName ||
        `${invRow.nombres ?? ""} ${invRow.apellidos ?? ""}`.trim() ||
        null,
      isAuthenticated,
    };
  }

  return {
    status: "valid",
    tipo: "nueva_cuenta",
    invitation,
    isAuthenticated,
  };
}
