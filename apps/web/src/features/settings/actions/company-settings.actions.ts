"use server";

import { revalidatePath } from "next/cache";
import {
  updateCompanySettingsSchema,
  type UpdateCompanySettingsInput,
} from "@vittkly/shared";
import { resolveActiveOrganization } from "@/features/tenants/services/tenants.service";
import {
  updateCompanySettingsInDb,
  uploadCompanyBrandAssetInDb,
} from "../services/company-settings.repository";

export async function updateCompanySettingsAction(
  input: UpdateCompanySettingsInput,
): Promise<{
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}> {
  const { active } = await resolveActiveOrganization();
  if (!active) {
    return {
      success: false,
      error: "No hay una empresa activa seleccionada en la sesión actual.",
    };
  }

  const parsed = updateCompanySettingsSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] || "form");
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    const firstIssue =
      parsed.error.issues[0]?.message ||
      "Revisa los datos ingresados en el formulario.";
    return {
      success: false,
      error: firstIssue,
      fieldErrors,
    };
  }

  const result = await updateCompanySettingsInDb(active.id, parsed.data);
  if (!result.success) {
    return {
      success: false,
      error: result.error || "No se pudieron guardar los cambios.",
    };
  }

  revalidatePath("/dashboard/configuraciones/empresa");
  revalidatePath("/dashboard/configuraciones");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/accesos");

  return { success: true };
}

export async function uploadCompanyBrandAssetAction(
  formData: FormData,
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const { active } = await resolveActiveOrganization();
  if (!active) {
    return {
      success: false,
      error: "No hay una empresa activa seleccionada en la sesión actual.",
    };
  }

  const rawKind = formData.get("kind");
  const kind: "logo" | "icono" = rawKind === "icono" ? "icono" : "logo";
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      error: "Selecciona un archivo de imagen válido.",
    };
  }

  return uploadCompanyBrandAssetInDb(active.id, kind, file);
}
