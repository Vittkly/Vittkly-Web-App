"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import type { Database, Json } from "@vittkly/db-types";
import { sendInvitationEmail } from "../services/invitation-mailer";
import {
  mapAccessLabelToFlags,
  type AccessLabel,
  type DocumentType,
  type ProfileConfiguration,
} from "../types/settings.types";

function hashToken(rawToken: string): string {
  return createHash("sha256")
    .update(rawToken.trim().toUpperCase(), "utf8")
    .digest("hex");
}

function generateInvitationToken(): string {
  return randomBytes(16).toString("hex");
}

function maskWord(word?: string | null): string {
  const clean = (word ?? "").trim();
  if (!clean) return "";
  if (clean.length <= 1) return `${clean}***`;
  return `${clean[0]}***`;
}

function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "***";
  const [local, domain] = email.split("@");
  const prefix = local.slice(0, Math.min(3, local.length));
  return `${prefix}***@${domain}`;
}

function revalidateUsersProfiles() {
  revalidatePath("/dashboard/configuraciones/usuarios-perfiles");
  revalidatePath("/dashboard/configuraciones");
}

// ---------------------------------------------------------------------
// 1. Búsqueda de persona por documento (enmascarada)
// ---------------------------------------------------------------------
const lookupDocumentSchema = z.object({
  docType: z.enum(["DNI", "carné de extranjería", "pasaporte"]),
  docNumber: z.string().min(4, "Ingresa un número de documento válido"),
});

export interface DocumentLookupResult {
  found: boolean;
  usuarioId: string | null;
  maskedName: string | null;
  maskedEmail: string | null;
  maskedPhone: string | null;
  alreadyMember: boolean;
}

export async function lookupPersonByDocumentAction(input: {
  docType: DocumentType;
  docNumber: string;
}): Promise<{
  success: boolean;
  data?: DocumentLookupResult;
  error?: string;
}> {
  try {
    const validated = lookupDocumentSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return { success: false, error: "No hay sesión de empresa activa." };
    }

    const supabase = await createClient();
    const { data: rpcRows, error: rpcError } = await supabase.rpc(
      "buscar_persona",
      {
        p_empresa_id: active.id,
        p_tipo_documento: validated.docType,
        p_numero_documento: validated.docNumber.trim(),
      },
    );

    if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
      const first = rpcRows[0];
      return {
        success: true,
        data: {
          found: Boolean(first.encontrado),
          usuarioId: first.usuario_id ?? null,
          maskedName: first.nombre_mascara ?? null,
          maskedEmail: first.correo_mascara ?? null,
          maskedPhone: first.celular_mascara ?? null,
          alreadyMember: Boolean(first.ya_es_miembro),
        },
      };
    }

    // Fallback seguro sobre usuarios si el RPC aún no está desplegado en la nube
    const { data: userRow } = await supabase
      .from("usuarios")
      .select("id, nombre, nombres, apellidos, correo, celular")
      .eq("tipo_documento", validated.docType)
      .eq("numero_documento", validated.docNumber.trim())
      .maybeSingle();

    if (!userRow) {
      return {
        success: true,
        data: {
          found: false,
          usuarioId: null,
          maskedName: null,
          maskedEmail: null,
          maskedPhone: null,
          alreadyMember: false,
        },
      };
    }

    const { data: existingMembership } = await supabase
      .from("membresias")
      .select("id, estado")
      .eq("empresa_id", active.id)
      .eq("usuario_id", userRow.id)
      .neq("estado", "desvinculada")
      .maybeSingle();

    const firstPart =
      userRow.nombres || userRow.nombre.split(/\s+/)[0] || "Usuario";
    const secondPart =
      userRow.apellidos || userRow.nombre.split(/\s+/)[1] || "";

    return {
      success: true,
      data: {
        found: true,
        usuarioId: userRow.id,
        maskedName: `${maskWord(firstPart)} ${maskWord(secondPart)}`.trim(),
        maskedEmail: maskEmail(userRow.correo),
        maskedPhone: userRow.celular
          ? `***${userRow.celular.slice(-3)}`
          : "***",
        alreadyMember: Boolean(existingMembership),
      },
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Documento inválido",
      };
    }
    return {
      success: false,
      error: "No se pudo verificar el documento en este momento.",
    };
  }
}

// ---------------------------------------------------------------------
// 2. Registrar y enviar invitación (nueva cuenta o cuenta existente)
// ---------------------------------------------------------------------
const createInvitationSchema = z.object({
  tipo: z.enum(["nueva_cuenta", "cuenta_existente"]),
  usuarioId: z.string().uuid().nullable().optional(),
  docType: z.enum(["DNI", "carné de extranjería", "pasaporte"]),
  docNumber: z.string().min(4, "Número de documento obligatorio"),
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  perfilId: z.string().uuid("Selecciona un perfil válido"),
  jobTitle: z.string().optional().default(""),
  accessLabel: z.enum(["Solo web", "Solo app", "Web y app"]),
  notifyNow: z.boolean().optional().default(true),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export interface GeneratedInvitationPayload {
  invitationId: string;
  recipientName: string;
  recipientEmail: string | null;
  recipientPhone: string | null;
  perfilNombre: string;
  accessLabel: AccessLabel;
  expiresAt: string;
  invitationPath: string;
}

export async function createInvitationAction(
  input: CreateInvitationInput,
): Promise<{
  success: boolean;
  data?: GeneratedInvitationPayload;
  error?: string;
}> {
  try {
    const validated = createInvitationSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();

    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    if (validated.tipo === "nueva_cuenta") {
      if (
        !validated.firstName.trim() ||
        !validated.lastName.trim() ||
        !validated.email.trim()
      ) {
        return {
          success: false,
          error:
            "Nombres, apellidos y correo son obligatorios para una cuenta nueva.",
        };
      }
    }

    const supabase = await createClient();

    const { data: profileRow } = await supabase
      .from("perfiles")
      .select("id, nombre")
      .eq("id", validated.perfilId)
      .eq("empresa_id", active.id)
      .maybeSingle();

    if (!profileRow) {
      return {
        success: false,
        error: "El perfil seleccionado no pertenece a esta empresa.",
      };
    }

    const { accesoWeb, accesoApp } = mapAccessLabelToFlags(
      validated.accessLabel,
    );
    const rawToken = generateInvitationToken();
    const hashed = hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const normalizedPhone = validated.phone.trim()
      ? validated.phone.trim().startsWith("+")
        ? validated.phone.trim().replace(/\s+/g, "")
        : `+51${validated.phone.trim().replace(/\s+/g, "")}`
      : null;

    const normalizedEmail = validated.email.trim()
      ? validated.email.trim().toLowerCase()
      : null;

    const { data: inserted, error: insertError } = await supabase
      .from("invitaciones")
      .insert({
        empresa_id: active.id,
        tipo: validated.tipo,
        usuario_id: validated.usuarioId ?? null,
        nombres: validated.firstName.trim() || null,
        apellidos: validated.lastName.trim() || null,
        tipo_documento: validated.docType,
        numero_documento: validated.docNumber.trim(),
        correo: normalizedEmail,
        celular: normalizedPhone,
        perfil_id: validated.perfilId,
        cargo: validated.jobTitle.trim() || null,
        acceso_web: accesoWeb,
        acceso_app: accesoApp,
        codigo_hash: hashed,
        token_hash: hashed,
        vence_en: expiresAt,
        estado: "pendiente",
        creado_por: userId,
      })
      .select("id, vence_en")
      .single();

    if (insertError || !inserted) {
      return {
        success: false,
        error:
          insertError?.message ||
          "No se pudo registrar la invitación en la base de datos.",
      };
    }

    revalidateUsersProfiles();

    const recipientName =
      `${validated.firstName.trim()} ${validated.lastName.trim()}`.trim() ||
      normalizedEmail ||
      `Documento ${validated.docType}`;

    const invitationPath =
      validated.tipo === "cuenta_existente"
        ? "/accesos"
        : `/activar-invitacion?token=${rawToken}`;

    // Despacho real de correo transaccional
    if (normalizedEmail) {
      const emailResult = await sendInvitationEmail({
        email: normalizedEmail,
        recipientName,
        empresaNombre: active.name || "Vittkly",
        perfilNombre: profileRow.nombre,
        invitadorNombre: active.roleName || "El Administrador",
        rawToken,
        tipoInvitacion: validated.tipo,
      });

      if (!emailResult.success && emailResult.error) {
        console.warn(
          "[ACTION] No se pudo despachar el correo de invitación:",
          emailResult.error,
        );
      }
    }

    return {
      success: true,
      data: {
        invitationId: inserted.id,
        recipientName,
        recipientEmail: normalizedEmail,
        recipientPhone: normalizedPhone,
        perfilNombre: profileRow.nombre,
        accessLabel: validated.accessLabel,
        expiresAt: inserted.vence_en,
        invitationPath,
      },
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Datos de invitación inválidos",
      };
    }
    return {
      success: false,
      error: "Ocurrió un error al registrar la invitación.",
    };
  }
}

// ---------------------------------------------------------------------
// 3. Reenviar invitación (anula la anterior y genera nuevo enlace de 7 días)
// ---------------------------------------------------------------------
export async function resendInvitationAction(invitationId: string): Promise<{
  success: boolean;
  data?: GeneratedInvitationPayload;
  error?: string;
}> {
  try {
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const supabase = await createClient();

    const { data: prevInv, error: fetchError } = await supabase
      .from("invitaciones")
      .select(
        "id, empresa_id, tipo, usuario_id, nombres, apellidos, tipo_documento, numero_documento, correo, celular, perfil_id, cargo, acceso_web, acceso_app",
      )
      .eq("id", invitationId)
      .eq("empresa_id", active.id)
      .maybeSingle();

    if (fetchError || !prevInv) {
      return {
        success: false,
        error: "No se encontró la invitación seleccionada.",
      };
    }

    // 1. Anular la invitación anterior
    const { error: voidError } = await supabase
      .from("invitaciones")
      .update({ estado: "anulada" })
      .eq("id", prevInv.id)
      .eq("empresa_id", active.id);

    if (voidError) {
      return {
        success: false,
        error: voidError.message || "No se pudo anular la invitación anterior.",
      };
    }

    // 2. Emitir nueva invitación con enlace nuevo y vigencia de 7 días
    const rawToken = generateInvitationToken();
    const hashed = hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: newInv, error: createError } = await supabase
      .from("invitaciones")
      .insert({
        empresa_id: active.id,
        tipo: prevInv.tipo || "nueva_cuenta",
        usuario_id: prevInv.usuario_id,
        nombres: prevInv.nombres,
        apellidos: prevInv.apellidos,
        tipo_documento: prevInv.tipo_documento,
        numero_documento: prevInv.numero_documento,
        correo: prevInv.correo,
        celular: prevInv.celular,
        perfil_id: prevInv.perfil_id,
        cargo: prevInv.cargo,
        acceso_web: prevInv.acceso_web,
        acceso_app: prevInv.acceso_app,
        codigo_hash: hashed,
        token_hash: hashed,
        vence_en: expiresAt,
        estado: "pendiente",
        creado_por: userId,
      })
      .select("id, vence_en")
      .single();

    if (createError || !newInv) {
      return {
        success: false,
        error:
          createError?.message ||
          "No se pudo generar el nuevo enlace de invitación.",
      };
    }

    const { data: profileRow } = await supabase
      .from("perfiles")
      .select("nombre")
      .eq("id", prevInv.perfil_id)
      .maybeSingle();

    revalidateUsersProfiles();

    const accessLabel: AccessLabel =
      prevInv.acceso_web && !prevInv.acceso_app
        ? "Solo web"
        : !prevInv.acceso_web && prevInv.acceso_app
          ? "Solo app"
          : "Web y app";

    const recipientName =
      `${prevInv.nombres ?? ""} ${prevInv.apellidos ?? ""}`.trim() ||
      prevInv.correo ||
      "Invitado";

    const isCuentaExistente = prevInv.tipo === "cuenta_existente";
    const invitationPath = isCuentaExistente
      ? "/accesos"
      : `/activar-invitacion?token=${rawToken}`;

    if (prevInv.correo) {
      const emailResult = await sendInvitationEmail({
        email: prevInv.correo,
        recipientName,
        empresaNombre: active.name || "Vittkly",
        perfilNombre: profileRow?.nombre ?? "Colaborador",
        invitadorNombre: active.roleName || "El Administrador",
        rawToken,
        tipoInvitacion: isCuentaExistente ? "cuenta_existente" : "nueva_cuenta",
      });

      if (!emailResult.success && emailResult.error) {
        console.warn(
          "[ACTION] No se pudo reenviar el correo de invitación:",
          emailResult.error,
        );
      }
    }

    return {
      success: true,
      data: {
        invitationId: newInv.id,
        recipientName,
        recipientEmail: prevInv.correo,
        recipientPhone: prevInv.celular,
        perfilNombre: profileRow?.nombre ?? "Colaborador",
        accessLabel,
        expiresAt: newInv.vence_en,
        invitationPath,
      },
    };
  } catch {
    return {
      success: false,
      error: "Ocurrió un error al reenviar la invitación.",
    };
  }
}

export async function cancelInvitationAction(
  invitationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("invitaciones")
      .update({ estado: "anulada" })
      .eq("id", invitationId)
      .eq("empresa_id", active.id);

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudo anular la invitación.",
      };
    }

    revalidateUsersProfiles();
    return { success: true };
  } catch {
    return { success: false, error: "Error al anular la invitación." };
  }
}

// ---------------------------------------------------------------------
// 4. Edición Inline en Tabla de Personas (Botón Guardar dinámico)
// ---------------------------------------------------------------------
const updateInlineSchema = z.object({
  id: z.string().min(1),
  sourceType: z.enum(["membresia", "invitacion"]),
  invitationId: z.string().uuid().nullable().optional(),
  perfilId: z.string().uuid("Selecciona un perfil válido"),
  accessLabel: z.enum(["Solo web", "Solo app", "Web y app"]),
});

export async function updateMemberInlineAction(
  input: z.infer<typeof updateInlineSchema>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateInlineSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const { accesoWeb, accesoApp } = mapAccessLabelToFlags(
      validated.accessLabel,
    );
    const supabase = await createClient();

    if (validated.sourceType === "invitacion") {
      const targetInvId =
        validated.invitationId ?? validated.id.replace(/^inv-/, "");
      const { error } = await supabase
        .from("invitaciones")
        .update({
          perfil_id: validated.perfilId,
          acceso_web: accesoWeb,
          acceso_app: accesoApp,
        })
        .eq("id", targetInvId)
        .eq("empresa_id", active.id);

      if (error) {
        return {
          success: false,
          error: error.message || "No se pudo actualizar la invitación.",
        };
      }
    } else {
      const { error } = await supabase
        .from("membresias")
        .update({
          perfil_id: validated.perfilId,
          acceso_web: accesoWeb,
          acceso_app: accesoApp,
        })
        .eq("id", validated.id)
        .eq("empresa_id", active.id);

      if (error) {
        return {
          success: false,
          error:
            error.message ||
            "No se pudo guardar el cambio de perfil o acceso en membresías.",
        };
      }
    }

    // El trigger nativo public.auditar() registra el cambio automáticamente en public.auditoria
    revalidateUsersProfiles();
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Datos inválidos",
      };
    }
    return {
      success: false,
      error: "Ocurrió un error al guardar los cambios.",
    };
  }
}

// ---------------------------------------------------------------------
// 5. Modal Editar Persona (actualiza usuarios + membresias / invitaciones)
// ---------------------------------------------------------------------
const updateMemberDetailsSchema = z.object({
  id: z.string().min(1),
  sourceType: z.enum(["membresia", "invitacion"]),
  userId: z.string().min(1),
  invitationId: z.string().uuid().nullable().optional(),
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  phone: z.string().optional().default(""),
  docType: z
    .enum(["DNI", "carné de extranjería", "pasaporte"])
    .nullable()
    .optional(),
  docNumber: z.string().optional().default(""),
  perfilId: z.string().uuid("Selecciona un perfil válido"),
  jobTitle: z.string().optional().default(""),
  accessLabel: z.enum(["Solo web", "Solo app", "Web y app"]),
});

export type UpdateMemberDetailsInput = z.infer<
  typeof updateMemberDetailsSchema
>;

export async function updateMemberDetailsAction(
  input: UpdateMemberDetailsInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateMemberDetailsSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const { accesoWeb, accesoApp } = mapAccessLabelToFlags(
      validated.accessLabel,
    );
    const normalizedPhone = validated.phone.trim()
      ? validated.phone.trim().startsWith("+")
        ? validated.phone.trim().replace(/\s+/g, "")
        : `+51${validated.phone.trim().replace(/\s+/g, "")}`
      : null;

    const supabase = await createClient();

    if (validated.sourceType === "invitacion") {
      const targetInvId =
        validated.invitationId ?? validated.id.replace(/^inv-/, "");
      const updatePayload: Database["public"]["Tables"]["invitaciones"]["Update"] =
        {
          nombres: validated.firstName.trim(),
          apellidos: validated.lastName.trim(),
          celular: normalizedPhone,
          perfil_id: validated.perfilId,
          cargo: validated.jobTitle.trim() || null,
          acceso_web: accesoWeb,
          acceso_app: accesoApp,
        };
      if (validated.docType && validated.docNumber.trim()) {
        updatePayload.tipo_documento = validated.docType;
        updatePayload.numero_documento = validated.docNumber.trim();
      }

      const { error } = await supabase
        .from("invitaciones")
        .update(updatePayload)
        .eq("id", targetInvId)
        .eq("empresa_id", active.id);

      if (error) {
        return {
          success: false,
          error:
            error.message || "No se pudieron actualizar los datos del invitado",
        };
      }
    } else {
      // Regla de Identidad Global (PDF 13 nov 2026):
      // Los datos personales en public.usuarios pertenecen a la cuenta global del usuario.
      // El administrador de la empresa solo tiene potestad sobre los atributos de la relación en public.membresias.
      const { error: memError } = await supabase
        .from("membresias")
        .update({
          perfil_id: validated.perfilId,
          cargo: validated.jobTitle.trim() || null,
          acceso_web: accesoWeb,
          acceso_app: accesoApp,
        })
        .eq("id", validated.id)
        .eq("empresa_id", active.id);

      if (memError) {
        return {
          success: false,
          error:
            memError.message ||
            "No se pudo actualizar la membresía en la empresa",
        };
      }
    }

    revalidateUsersProfiles();
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Datos inválidos",
      };
    }
    return {
      success: false,
      error: "Error inesperado al actualizar los datos de la persona.",
    };
  }
}

// ---------------------------------------------------------------------
// 6. Suspender / Reactivar acceso y Quitar de la empresa (baja lógica)
// ---------------------------------------------------------------------
export async function toggleMemberStatusAction(input: {
  membershipId: string;
  suspend: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("membresias")
      .update({
        estado: input.suspend ? "desactivada" : "activa",
        activo: !input.suspend,
      })
      .eq("id", input.membershipId)
      .eq("empresa_id", active.id);

    if (error) {
      return {
        success: false,
        error:
          error.message || "No se pudo actualizar el estado de la membresía.",
      };
    }

    revalidateUsersProfiles();
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Ocurrió un error al cambiar el estado de acceso.",
    };
  }
}

export async function unlinkMemberAction(input: {
  id: string;
  sourceType: "membresia" | "invitacion";
  invitationId?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const supabase = await createClient();

    if (input.sourceType === "invitacion") {
      const targetInvId = input.invitationId ?? input.id.replace(/^inv-/, "");
      const { error } = await supabase
        .from("invitaciones")
        .update({ estado: "anulada" })
        .eq("id", targetInvId)
        .eq("empresa_id", active.id);

      if (error) {
        return {
          success: false,
          error: error.message || "No se pudo anular la invitación.",
        };
      }
    } else {
      // Regla innegociable: NO hacer DELETE físico en membresias.
      // Actualizar estado = 'desvinculada', activo = false y desvinculada_en = now().
      const { error } = await supabase
        .from("membresias")
        .update({
          estado: "desvinculada",
          activo: false,
          desvinculada_en: new Date().toISOString(),
        })
        .eq("id", input.id)
        .eq("empresa_id", active.id);

      if (error) {
        return {
          success: false,
          error:
            error.message ||
            "No se pudo desvincular a la persona de la empresa",
        };
      }
    }

    revalidateUsersProfiles();
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Ocurrió un error al quitar a la persona de la empresa.",
    };
  }
}

// ---------------------------------------------------------------------
// 7. Resolver solicitud de salida (Aprobar -> desvinculada / Rechazar)
// ---------------------------------------------------------------------
export async function resolveExitRequestAction(input: {
  requestId: string;
  membresiaId: string;
  decision: "aprobada" | "rechazada";
  comment?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const { error: reqError } = await supabase
      .from("solicitudes_salida")
      .update({
        estado: input.decision,
        comentario_resolucion: input.comment?.trim() || null,
        resuelto_por: userId,
        resuelto_en: nowIso,
      })
      .eq("id", input.requestId)
      .eq("empresa_id", active.id);

    if (reqError) {
      return {
        success: false,
        error:
          reqError.message || "No se pudo actualizar la solicitud de salida.",
      };
    }

    if (input.decision === "aprobada") {
      const { error: memError } = await supabase
        .from("membresias")
        .update({
          estado: "desvinculada",
          activo: false,
          desvinculada_en: nowIso,
        })
        .eq("id", input.membresiaId)
        .eq("empresa_id", active.id);

      if (memError) {
        return {
          success: false,
          error:
            memError.message ||
            "Se aprobó la solicitud pero falló la desvinculación de la membresía.",
        };
      }
    }

    revalidateUsersProfiles();
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Error al procesar la solicitud de salida.",
    };
  }
}

// ---------------------------------------------------------------------
// 8. Crear, Duplicar, Editar y Eliminar Perfiles (public.perfiles)
// ---------------------------------------------------------------------
const saveProfileSchema = z.object({
  profileId: z.string().uuid().nullable().optional(),
  nombre: z.string().min(2, "El nombre del perfil es obligatorio"),
  descripcion: z.string().optional().default(""),
  recomendadoPara: z.string().optional().default(""),
  configuracion: z.custom<ProfileConfiguration>(),
});

export type SaveProfileInput = z.infer<typeof saveProfileSchema>;

export async function saveProfileAction(
  input: SaveProfileInput,
): Promise<{ success: boolean; profileId?: string; error?: string }> {
  try {
    const validated = saveProfileSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const supabase = await createClient();
    const slugCode = validated.nombre
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    let targetProfileId = validated.profileId ?? null;

    if (targetProfileId) {
      const { error: updateErr } = await supabase
        .from("perfiles")
        .update({
          nombre: validated.nombre.trim(),
          descripcion: validated.descripcion.trim() || null,
          recomendado_para: validated.recomendadoPara.trim() || null,
          configuracion: validated.configuracion as unknown as Json,
        })
        .eq("id", targetProfileId)
        .eq("empresa_id", active.id);

      if (updateErr) {
        return {
          success: false,
          error: updateErr.message || "No se pudo actualizar el perfil.",
        };
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("perfiles")
        .insert({
          empresa_id: active.id,
          codigo: `${slugCode}_${Date.now().toString(36).slice(-4)}`,
          nombre: validated.nombre.trim(),
          descripcion: validated.descripcion.trim() || null,
          recomendado_para: validated.recomendadoPara.trim() || null,
          configuracion: validated.configuracion as unknown as Json,
          es_base: false,
          creado_por: userId,
        })
        .select("id")
        .single();

      if (insertErr || !inserted) {
        return {
          success: false,
          error:
            insertErr?.message ||
            "No se pudo crear el perfil (verifica que el nombre no esté repetido).",
        };
      }
      targetProfileId = inserted.id;
    }

    revalidateUsersProfiles();
    return { success: true, profileId: targetProfileId };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Datos del perfil inválidos",
      };
    }
    return {
      success: false,
      error: "Ocurrió un error al guardar el perfil.",
    };
  }
}

export async function deleteProfileAction(
  profileId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const supabase = await createClient();

    const { count } = await supabase
      .from("membresias")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", active.id)
      .eq("perfil_id", profileId)
      .neq("estado", "desvinculada");

    if (count && count > 0) {
      return {
        success: false,
        error:
          "No se puede eliminar un perfil que tiene personas asignadas. Cambia primero su perfil.",
      };
    }

    const { error } = await supabase
      .from("perfiles")
      .delete()
      .eq("id", profileId)
      .eq("empresa_id", active.id)
      .eq("es_base", false);

    if (error) {
      return {
        success: false,
        error: error.message || "No se pudo eliminar el perfil personalizado.",
      };
    }

    revalidateUsersProfiles();
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Ocurrió un error al eliminar el perfil.",
    };
  }
}
