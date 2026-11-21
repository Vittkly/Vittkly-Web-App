import "server-only";
import { createClient } from "@/lib/supabase/server";
import { safeRelativePath } from "@/lib/site-url";
import { initializeOrganizationContext } from "@/features/tenants/services/org-session";

const ALLOWED_OTP_TYPES = [
  "recovery",
  "signup",
  "invite",
  "magiclink",
  "email_change",
] as const;

/**
 * Procesa el retorno de Supabase Auth (`/auth/callback`) tanto para OAuth PKCE (`?code=`)
 * como para enlaces por correo (`?token_hash=&type=`).
 * Retorna la ruta relativa segura a la que debe redirigir el Route Handler.
 */
export async function resolveAuthCallbackRedirect(
  requestUrl: URL,
): Promise<string> {
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const rawType = requestUrl.searchParams.get("type");
  const providerError = requestUrl.searchParams.get("error");
  const rawFrom = requestUrl.searchParams.get("from");
  const errorOriginPath = rawFrom === "register" ? "/register" : "/login";

  if (providerError) {
    const errorCode =
      providerError === "access_denied" ? "oauth_cancelado" : "oauth_error";
    return `${errorOriginPath}?error=${errorCode}`;
  }

  const type = ALLOWED_OTP_TYPES.find((t) => t === rawType) ?? null;
  const next = safeRelativePath(
    requestUrl.searchParams.get("next"),
    "/accesos/auto",
  );

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return `${errorOriginPath}?error=oauth_error`;
    }

    // Best-effort: actualizar marca de último ingreso
    try {
      await supabase
        .from("usuarios")
        .update({ ultimo_ingreso_en: new Date().toISOString() })
        .eq("id", data.user.id);
    } catch {
      // No bloquear la entrada si la fila aún se sincroniza
    }

    // Auto-aprovisionamiento si traía empresa pendiente en metadata sin membresías previas
    try {
      const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
      if (typeof meta.company_name === "string" && meta.company_name.trim()) {
        const { data: existingMemberships } = await supabase
          .from("membresias")
          .select("id")
          .eq("usuario_id", data.user.id)
          .eq("activo", true)
          .limit(1);

        if (!existingMemberships || existingMemberships.length === 0) {
          await supabase.rpc("crear_cuenta_y_empresa", {
            p_nombre_empresa: meta.company_name.trim(),
            p_ruc: typeof meta.ruc === "string" ? meta.ruc : null,
            p_plan_codigo:
              typeof meta.plan_code === "string" ? meta.plan_code : "crece",
            p_rubro: typeof meta.rubro === "string" ? meta.rubro : null,
            p_ciudad: typeof meta.ciudad === "string" ? meta.ciudad : null,
            p_modo: "plan_propio",
            p_periodo:
              typeof meta.periodo === "string" ? meta.periodo : "mensual",
          });
        }
      }
    } catch (provErr) {
      console.warn(
        "[Vittkly Auth Callback] Advertencia en auto-aprovisionamiento:",
        provErr,
      );
    }

    if (next === "/accesos/auto") {
      return (await initializeOrganizationContext()) === "ready"
        ? "/dashboard"
        : "/accesos";
    }

    return next;
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      if (next === "/accesos/auto") {
        return (await initializeOrganizationContext()) === "ready"
          ? "/dashboard"
          : "/accesos";
      }
      return next;
    }
  }

  return "/login?error=enlace_expirado";
}
