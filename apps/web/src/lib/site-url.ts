import "server-only";
import { headers } from "next/headers";

/**
 * URL base confiable para enlaces enviados por correo (confirmación / recuperación).
 * En producción se exige NEXT_PUBLIC_SITE_URL para impedir Host/Origin header injection.
 */
export async function getTrustedSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[Vittkly AppSec] NEXT_PUBLIC_SITE_URL es obligatorio en producción.",
    );
  }

  const reqHeaders = await headers();
  return reqHeaders.get("origin") || "http://localhost:3000";
}

/** Solo permite rutas internas relativas (bloquea //, /\, esquemas y caracteres de control). */
export function safeRelativePath(raw: string | null, fallback = "/"): string {
  if (!raw || !raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.includes("\\") || /[\u0000-\u001f]/.test(raw))
    return fallback;
  return raw;
}
