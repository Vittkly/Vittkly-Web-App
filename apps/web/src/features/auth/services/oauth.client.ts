import { createClient } from "@/lib/supabase/client";

export type OAuthProviderId = "google" | "microsoft";
export type OAuthEntryOrigin = "login" | "register";

interface OAuthProviderConfig {
  supabaseProvider: "google" | "azure";
  label: string;
  scopes?: string;
}

const OAUTH_PROVIDER_MAP: Record<OAuthProviderId, OAuthProviderConfig> = {
  google: {
    supabaseProvider: "google",
    label: "Google",
  },
  microsoft: {
    supabaseProvider: "azure",
    label: "Microsoft",
    scopes: "email",
  },
};

function safeClientNextPath(
  raw: string | null | undefined,
  fallback = "/accesos/auto",
): string {
  if (!raw || !raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.includes("\\") || /[\u0000-\u001f]/.test(raw))
    return fallback;
  return raw;
}

/**
 * Inicia el flujo OAuth PKCE desde el navegador usando el cliente oficial `@supabase/ssr`.
 * Garantiza que la cookie `code_verifier` se guarde antes de redirigir al proveedor.
 */
export async function signInWithOAuthProvider(
  provider: OAuthProviderId,
  options?: {
    next?: string;
    from?: OAuthEntryOrigin;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = OAUTH_PROVIDER_MAP[provider];
  const origin =
    typeof window !== "undefined"
      ? window.location.origin.replace(/\/+$/, "")
      : "";

  if (!origin) {
    return {
      ok: false,
      error: `No se pudo iniciar la autenticación con ${config.label}.`,
    };
  }

  const nextPath = safeClientNextPath(options?.next, "/accesos/auto");
  const from: OAuthEntryOrigin =
    options?.from === "register" ? "register" : "login";
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", nextPath);
  callbackUrl.searchParams.set("from", from);

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: config.supabaseProvider,
      options: {
        redirectTo: callbackUrl.toString(),
        ...(config.scopes ? { scopes: config.scopes } : {}),
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error || !data?.url) {
      return {
        ok: false,
        error: `No se pudo conectar con ${config.label}. Verifica que el proveedor esté habilitado e intenta nuevamente.`,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: `No se pudo iniciar sesión con ${config.label}. Intenta nuevamente.`,
    };
  }
}
