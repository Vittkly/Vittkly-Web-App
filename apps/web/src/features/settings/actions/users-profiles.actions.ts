"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createMemberInvitationSchema,
  isValidE164Phone,
  isCanonicalModuleCode,
  lookupDocumentInputSchema,
  maskDocumentForDisplay,
  maskEmailAddress,
  maskPersonName,
  maskPhoneLocal,
  newAccountPersonDetailsSchema,
  normalizeDocumentNumber,
  normalizeDocumentType,
  normalizeModuleCodesToCanonical,
  normalizePhoneToE164,
} from "@vittkly/shared";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import type { Database } from "@vittkly/db-types";
import { sendInvitationEmail } from "../services/invitation-mailer";
import {
  createCompanyInvitationInDb,
  getExistingAccountEmailTargetInDb,
  lookupPersonByDocumentInDb,
  resendCompanyInvitationInDb,
  saveCompanyProfileInDb,
  type RpcCreatedInvitationResult,
} from "../services/users-profiles.repository";
import {
  mapAccessLabelToFlags,
  type DocumentLookupResult,
  type DocumentType,
  type GeneratedInvitationPayload,
  type ProfileConfiguration,
} from "../types/settings.types";

export type { DocumentLookupResult, GeneratedInvitationPayload };

function hashToken(rawToken: string): string {
  return createHash("sha256")
    .update(rawToken.trim().toUpperCase(), "utf8")
    .digest("hex");
}

function generateInvitationToken(): string {
  return randomBytes(16).toString("hex");
}

function revalidateUsersProfiles() {
  revalidatePath("/dashboard/configuraciones/usuarios-perfiles");
  revalidatePath("/dashboard/configuraciones");
  revalidatePath("/dashboard", "layout");
}

async function dispatchInvitationEmailServerOnly(params: {
  rpcRes: RpcCreatedInvitationResult;
  empresaId: string;
  empresaNombre: string;
  invitadorNombre: string;
  rawToken: string;
}): Promise<{ emailSent: boolean; emailError: string | null }> {
  let targetEmail: string | null = null;
  let targetName = params.rpcRes.displayName;

  if (params.rpcRes.tipo === "cuenta_existente") {
    const resolved = await getExistingAccountEmailTargetInDb(
      params.rpcRes.invitationId,
      params.empresaId,
    );
    if (resolved) {
      targetEmail = resolved.email;
      targetName = resolved.recipientName;
    }
  } else {
    targetEmail = params.rpcRes.displayEmail;
  }

  if (!targetEmail) {
    return {
      emailSent: false,
      emailError: "No se encontró un correo de destino.",
    };
  }

  const emailResult = await sendInvitationEmail({
    email: targetEmail,
    recipientName: targetName,
    empresaNombre: params.empresaNombre,
    perfilNombre: params.rpcRes.perfilNombre,
    invitadorNombre: params.invitadorNombre,
    rawToken: params.rawToken,
    tipoInvitacion: params.rpcRes.tipo,
  });

  if (!emailResult.success && emailResult.error) {
    console.warn(
      "[ACTION] No se pudo despachar el correo de invitación:",
      emailResult.error,
    );
  }

  return {
    emailSent: emailResult.success,
    emailError: emailResult.error ?? null,
  };
}

function mapRpcResultToModalPayload(
  rpcRes: RpcCreatedInvitationResult,
  rawToken: string,
  emailStatus: { emailSent: boolean; emailError: string | null },
): GeneratedInvitationPayload {
  return {
    invitationId: rpcRes.invitationId,
    tipo: rpcRes.tipo,
    recipientName: rpcRes.displayName,
    recipientEmail: rpcRes.displayEmail,
    recipientPhone:
      rpcRes.tipo === "cuenta_existente"
        ? rpcRes.displayPhone
        : rpcRes.displayPhone,
    recipientDocumentMasked: rpcRes.maskedDocument,
    perfilNombre: rpcRes.perfilNombre,
    accessLabel: rpcRes.accessLabel,
    expiresAt: rpcRes.expiresAt,
    invitationPath:
      rpcRes.tipo === "cuenta_existente"
        ? null
        : `/activar-invitacion?token=${rawToken}`,
    emailSent: emailStatus.emailSent,
    emailError: emailStatus.emailError,
    canResend: true,
  };
}

// ---------------------------------------------------------------------
// 1. Búsqueda de persona por documento (enmascarada, exclusivamente por RPC)
// ---------------------------------------------------------------------
export async function lookupPersonByDocumentAction(input: {
  docType: DocumentType | string;
  docNumber: string;
}): Promise<{
  success: boolean;
  data?: DocumentLookupResult;
  error?: string;
}> {
  try {
    const validated = lookupDocumentInputSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();
    if (!userId || !active) {
      return { success: false, error: "No hay sesión de empresa activa." };
    }

    const data = await lookupPersonByDocumentInDb(
      active.id,
      validated.docType,
      validated.docNumber,
    );
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Documento inválido.",
      };
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "No se pudo verificar el documento en este momento.",
    };
  }
}

// ---------------------------------------------------------------------
// 2. Registrar y enviar invitación (tipo derivado en servidor)
// ---------------------------------------------------------------------
export type CreateInvitationInput = z.input<
  typeof createMemberInvitationSchema
>;

export async function createInvitationAction(
  input: CreateInvitationInput,
): Promise<{
  success: boolean;
  data?: GeneratedInvitationPayload;
  error?: string;
}> {
  try {
    const validated = createMemberInvitationSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();

    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    const lookup = await lookupPersonByDocumentInDb(
      active.id,
      validated.docType,
      validated.docNumber,
    );

    if (lookup.status === "ya_es_miembro") {
      return {
        success: false,
        error: `Esta persona ya pertenece a la empresa con el perfil de ${lookup.roleName}.`,
      };
    }

    if (lookup.status === "invitacion_pendiente") {
      return {
        success: false,
        error: `Ya existe una invitación pendiente para esta persona (perfil ${lookup.roleName}).`,
      };
    }

    let firstName: string | null = null;
    let lastName: string | null = null;
    let email: string | null = null;
    let phoneE164: string | null = null;

    if (lookup.status === "no_encontrado") {
      const details = newAccountPersonDetailsSchema.parse({
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        countryPrefix: validated.countryPrefix,
        phone: validated.phone,
      });

      const e164 = normalizePhoneToE164(details.countryPrefix, details.phone);
      if (!isValidE164Phone(e164)) {
        return {
          success: false,
          error:
            details.countryPrefix === "+51"
              ? "Ingresa un celular válido de Perú (9 dígitos iniciando en 9)."
              : "Ingresa un número de celular válido en formato internacional.",
        };
      }

      firstName = details.firstName;
      lastName = details.lastName;
      email = details.email;
      phoneE164 = e164;
    }

    const { accesoWeb, accesoApp } = mapAccessLabelToFlags(
      validated.accessLabel,
    );
    const rawToken = generateInvitationToken();
    const tokenHash = hashToken(rawToken);

    const rpcRes = await createCompanyInvitationInDb({
      empresaId: active.id,
      docType: validated.docType,
      docNumber: validated.docNumber,
      perfilId: validated.perfilId,
      accesoWeb,
      accesoApp,
      cargo: validated.jobTitle || null,
      firstName,
      lastName,
      email,
      phoneE164,
      tokenHash,
    });

    revalidateUsersProfiles();

    const emailStatus = await dispatchInvitationEmailServerOnly({
      rpcRes,
      empresaId: active.id,
      empresaNombre: active.name || "Vittkly",
      invitadorNombre: active.roleName || "El Administrador",
      rawToken,
    });

    return {
      success: true,
      data: mapRpcResultToModalPayload(rpcRes, rawToken, emailStatus),
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Datos de invitación inválidos.",
      };
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Ocurrió un error al registrar la invitación.",
    };
  }
}

// ---------------------------------------------------------------------
// 3. Reenviar invitación (atómica, anula la anterior y emite nueva de 7 días)
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

    const rawToken = generateInvitationToken();
    const tokenHash = hashToken(rawToken);

    const rpcRes = await resendCompanyInvitationInDb(invitationId, tokenHash);

    revalidateUsersProfiles();

    const emailStatus = await dispatchInvitationEmailServerOnly({
      rpcRes,
      empresaId: active.id,
      empresaNombre: active.name || "Vittkly",
      invitadorNombre: active.roleName || "El Administrador",
      rawToken,
    });

    return {
      success: true,
      data: mapRpcResultToModalPayload(rpcRes, rawToken, emailStatus),
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Ocurrió un error al reenviar la invitación.",
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
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
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

export type UpdateMemberDetailsInput = z.input<
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
    const supabase = await createClient();

    if (validated.sourceType === "invitacion") {
      const targetInvId =
        validated.invitationId ?? validated.id.replace(/^inv-/, "");

      const { data: currentInv } = await supabase
        .from("invitaciones")
        .select("id, tipo, correo, tipo_documento, numero_documento")
        .eq("id", targetInvId)
        .eq("empresa_id", active.id)
        .maybeSingle();

      if (!currentInv) {
        return { success: false, error: "No se encontró la invitación." };
      }

      if (currentInv.tipo === "cuenta_existente") {
        // Blindaje PII: una invitación de cuenta existente solo permite editar perfil, cargo y canales.
        const { error } = await supabase
          .from("invitaciones")
          .update({
            perfil_id: validated.perfilId,
            cargo: validated.jobTitle.trim() || null,
            acceso_web: accesoWeb,
            acceso_app: accesoApp,
          })
          .eq("id", targetInvId)
          .eq("empresa_id", active.id);

        if (error) {
          return {
            success: false,
            error:
              error.message ||
              "No se pudieron actualizar los permisos de la invitación",
          };
        }
      } else {
        const cleanFirst = validated.firstName.trim();
        const cleanLast = validated.lastName.trim();
        if (cleanFirst.length < 2 || cleanLast.length < 2) {
          return {
            success: false,
            error:
              "Nombres y apellidos son obligatorios (mínimo 2 caracteres).",
          };
        }

        const rawPhone = validated.phone.trim();
        let normalizedPhone: string | null = null;
        if (rawPhone) {
          const e164 = normalizePhoneToE164("+51", rawPhone);
          if (!isValidE164Phone(e164)) {
            return {
              success: false,
              error: "El número de celular ingresado no es válido.",
            };
          }
          normalizedPhone = e164;
        }

        const nextDocType = validated.docType
          ? normalizeDocumentType(validated.docType)
          : ((currentInv.tipo_documento as DocumentType | null) ?? null);
        const nextDocNumber =
          nextDocType && validated.docNumber.trim()
            ? normalizeDocumentNumber(nextDocType, validated.docNumber)
            : (currentInv.numero_documento ?? null);

        const updatePayload: Database["public"]["Tables"]["invitaciones"]["Update"] =
          {
            nombres: cleanFirst,
            apellidos: cleanLast,
            celular: normalizedPhone,
            perfil_id: validated.perfilId,
            cargo: validated.jobTitle.trim() || null,
            acceso_web: accesoWeb,
            acceso_app: accesoApp,
            datos_enmascarados: {
              nombre: maskPersonName(null, cleanFirst, cleanLast),
              correo: maskEmailAddress(currentInv.correo),
              documento: maskDocumentForDisplay(nextDocNumber),
              celular: maskPhoneLocal(normalizedPhone),
              tipo_documento: nextDocType,
            },
          };

        if (nextDocType && nextDocNumber) {
          updatePayload.tipo_documento = nextDocType;
          updatePayload.numero_documento = nextDocNumber;
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
              error.message ||
              "No se pudieron actualizar los datos del invitado",
          };
        }
      }
    } else {
      // Regla de Identidad Global: solo atributos de membresía.
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
const restrictionScopeSchema = z.enum([
  "todas",
  "equipo",
  "propias",
  "ninguna",
]);

const saveProfileSchema = z.object({
  profileId: z.string().uuid().nullable().optional(),
  nombre: z.string().trim().min(2, "El nombre del perfil es obligatorio"),
  descripcion: z.string().optional().default(""),
  recomendadoPara: z.string().optional().default(""),
  configuracion: z.object({
    modulos: z.array(z.string()),
    opciones: z.object({
      ve_precios_montos: z.boolean(),
      valida_servicios: z.boolean(),
      es_personal_campo: z.boolean(),
    }),
    restricciones: z.object({
      ver_montos_cotizaciones: restrictionScopeSchema,
      editar_cotizaciones: restrictionScopeSchema,
      eliminar_cotizaciones: restrictionScopeSchema,
      programar_reprogramar: restrictionScopeSchema,
      pagos_clientes: restrictionScopeSchema,
      costeo_margenes: restrictionScopeSchema,
      cancelar_servicios: restrictionScopeSchema,
    }),
    descargar_archivos: z.boolean(),
    aprueba_solicitudes: z.boolean(),
    ocultar_datos_cliente: z.object({
      telefonos: z.boolean(),
      correos: z.boolean(),
      documento: z.boolean(),
      direccion: z.boolean(),
    }),
    horario_acceso: z.object({
      restringido: z.boolean(),
      inicio: z.string(),
      fin: z.string(),
    }),
    dispositivo_acceso: z.enum(["cualquiera", "solo_web", "solo_app"]),
  }),
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

    const invalidModules = validated.configuracion.modulos.filter(
      (code) => !isCanonicalModuleCode(code),
    );
    if (invalidModules.length > 0) {
      return {
        success: false,
        error: `Módulos no permitidos en el catálogo oficial: ${invalidModules.join(", ")}.`,
      };
    }

    const cleanConfig: ProfileConfiguration = {
      ...validated.configuracion,
      modulos: normalizeModuleCodesToCanonical(validated.configuracion.modulos),
    };

    const targetProfileId = await saveCompanyProfileInDb({
      empresaId: active.id,
      profileId: validated.profileId ?? null,
      nombre: validated.nombre,
      descripcion: validated.descripcion.trim(),
      recomendadoPara: validated.recomendadoPara.trim(),
      configuracion: cleanConfig,
    });

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
      error:
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar el perfil.",
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
