"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";

const newMemberSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(6, "Teléfono inválido").optional().or(z.literal("")),
  role: z.enum(["Administrador", "Ventas", "Técnico", "Supervisor"]),
  accessScope: z.enum(["web", "mobile", "both"]),
});

export type NewMemberInput = z.infer<typeof newMemberSchema>;

export async function addTeamMemberAction(input: NewMemberInput) {
  try {
    const validated = newMemberSchema.parse(input);
    const { active, userId } = await resolveActiveOrganization();

    if (!userId || !active) {
      return {
        success: false,
        error: "No tienes una sesión de empresa activa.",
      };
    }

    // En esta fase, validamos los datos y notificamos éxito para la simulación fluida en UI
    revalidatePath("/dashboard/configuraciones/usuarios-perfiles");
    revalidatePath("/dashboard/configuraciones");

    return {
      success: true,
      data: {
        id: `mem-${Date.now()}`,
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone || null,
        role: validated.role,
        accessScope: validated.accessScope,
        status: "pending",
        statusLabel: "Aún no ingresa",
      },
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues[0]?.message || "Datos inválidos",
      };
    }
    return { success: false, error: "Error al registrar al colaborador" };
  }
}
