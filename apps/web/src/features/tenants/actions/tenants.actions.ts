"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { organizationIdSchema } from "@vittkly/shared";
import {
  createAdditionalCompany,
  getMisAccesos,
  getOrganizationOptions,
  persistLastOrganization,
  requestExitMembership,
  requestExitSupport,
  respondInvitation,
} from "../services/tenants.service";
import { setActiveOrganizationCookies } from "../services/org-session";

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  message?: string;
  data?: T;
}

function getSafeActionError(err: unknown, fallback: string): string {
  if (
    err instanceof Error &&
    err.message &&
    !err.message.includes("NEXT_REDIRECT")
  ) {
    return err.message;
  }
  return fallback;
}

const respondInvitationSchema = z.object({
  invitacionId: z.string().uuid("Invitación inválida."),
  acepta: z.boolean(),
  motivo: z.string().trim().max(500).nullable().optional(),
});

const requestExitSchema = z.object({
  membresiaId: z.string().uuid("Membresía inválida."),
  motivo: z.string().trim().max(500).nullable().optional(),
});

const requestExitSupportSchema = z.object({
  solicitudId: z.string().uuid("Solicitud inválida."),
});

const createCompanySchema = z.object({
  nombreEmpresa: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre comercial de la empresa.")
    .max(120, "Máximo 120 caracteres."),
  rubro: z.string().trim().max(80).nullable().optional(),
  ciudad: z.string().trim().max(80).nullable().optional(),
  ruc: z.string().trim().max(20).nullable().optional(),
  modo: z.enum(["sumar_cuenta", "plan_propio"]),
  planCodigo: z.enum(["inicia", "crece", "empresa"]).default("crece"),
  periodo: z.enum(["mensual", "anual"]).default("mensual"),
});

/** Cambia la empresa activa (selector inicial y menú lateral). Valida pertenencia en servidor. */
export async function selectOrganizationAction(
  formData: FormData,
): Promise<void> {
  const parsed = organizationIdSchema.safeParse(formData.get("organizationId"));
  if (!parsed.success) redirect("/accesos");

  const { userId, organizations } = await getOrganizationOptions();
  if (!userId) redirect("/login");
  if (!organizations.some((o) => o.id === parsed.data)) redirect("/accesos");

  await setActiveOrganizationCookies(parsed.data);
  await persistLastOrganization(userId, parsed.data);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Ingresa a una empresa con acceso web desde /accesos o el menú del sidebar. */
export async function enterCompanyAction(
  organizationId: string,
): Promise<ActionResult> {
  const parsed = organizationIdSchema.safeParse(organizationId);
  if (!parsed.success) {
    return { ok: false, error: "Empresa inválida." };
  }

  const { userId, organizations } = await getOrganizationOptions();
  if (!userId) redirect("/login");

  if (!organizations.some((o) => o.id === parsed.data)) {
    return {
      ok: false,
      error:
        "Esta empresa solo te habilitó acceso desde la app móvil de Vittkly.",
    };
  }

  await setActiveOrganizationCookies(parsed.data);
  await persistLastOrganization(userId, parsed.data);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Acepta o rechaza una invitación pendiente desde /accesos sin redirigir fuera de la vista. */
export async function respondInvitationAction(
  input: z.infer<typeof respondInvitationSchema>,
): Promise<
  ActionResult<{ accepted: boolean; accesoWeb: boolean; empresaNombre: string }>
> {
  const parsed = respondInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const { userId } = await getOrganizationOptions();
  if (!userId) redirect("/login");

  try {
    const result = await respondInvitation(parsed.data);
    const accepted = Boolean(result.aceptada);
    const accesoWeb = Boolean(result.acceso_web);
    const empresaNombre = accepted ? (result.empresa_nombre?.trim() ?? "") : "";

    let message = "Invitación rechazada.";
    if (accepted) {
      if (accesoWeb) {
        message = empresaNombre
          ? `Invitación aceptada correctamente. Ya puedes entrar a ${empresaNombre}.`
          : "Invitación aceptada correctamente. Ya puedes entrar a la empresa.";
      } else {
        message = empresaNombre
          ? `Invitación aceptada. Tu acceso en ${empresaNombre} es exclusivo desde la app móvil.`
          : "Invitación aceptada. Tu acceso es exclusivo desde la app móvil.";
      }
    }

    // No invocamos revalidatePath aquí: en Next.js 16 dispara un re-render del action POST
    // sin `?stay=1` y provoca el auto-redirect a `/accesos/auto` cuando es la 1.ª empresa.
    // `AccesosEmpresaView` navega a `/accesos?stay=1` y ejecuta `router.refresh()` (`force-dynamic`).
    return {
      ok: true,
      message,
      data: {
        accepted,
        accesoWeb,
        empresaNombre,
      },
    };
  } catch (err) {
    unstable_rethrow(err);
    return {
      ok: false,
      error: getSafeActionError(err, "No se pudo responder la invitación."),
    };
  }
}

/** Solicita salir de una empresa donde el usuario no es propietario. */
export async function requestExitAction(
  input: z.infer<typeof requestExitSchema>,
): Promise<ActionResult> {
  const parsed = requestExitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await requestExitMembership(parsed.data);
    revalidatePath("/accesos");
    return { ok: true };
  } catch (err) {
    unstable_rethrow(err);
    return {
      ok: false,
      error: getSafeActionError(err, "No se pudo enviar la solicitud."),
    };
  }
}

/** Escala una solicitud de salida a soporte de Vittkly tras el periodo de espera. */
export async function requestExitSupportAction(
  input: z.infer<typeof requestExitSupportSchema>,
): Promise<ActionResult> {
  const parsed = requestExitSupportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await requestExitSupport(parsed.data.solicitudId);
    revalidatePath("/accesos");
    return { ok: true };
  } catch (err) {
    unstable_rethrow(err);
    return {
      ok: false,
      error: getSafeActionError(err, "No se pudo solicitar apoyo a soporte."),
    };
  }
}

/** Crea una empresa adicional (sumada a cuenta actual o con plan propio) y entra al dashboard. */
export async function createAdditionalCompanyAction(
  input: z.infer<typeof createCompanySchema>,
): Promise<ActionResult> {
  const parsed = createCompanySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Verifica los datos de la empresa.",
    };
  }

  const { userId } = await getOrganizationOptions();
  if (!userId) redirect("/login");

  let safePlanCodigo = parsed.data.planCodigo;
  if (parsed.data.modo === "sumar_cuenta") {
    const accesos = await getMisAccesos();
    const currentPlan = accesos?.cuenta_actual?.plan_codigo?.toLowerCase();
    safePlanCodigo = currentPlan === "empresa" ? "empresa" : "crece";
  }

  let empresaId: string;
  try {
    empresaId = await createAdditionalCompany({
      ...parsed.data,
      planCodigo: safePlanCodigo,
    });
  } catch (err) {
    unstable_rethrow(err);
    return {
      ok: false,
      error: getSafeActionError(err, "No se pudo crear la empresa."),
    };
  }

  await setActiveOrganizationCookies(empresaId);
  await persistLastOrganization(userId, empresaId);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
