import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthCallbackRedirect } from "@/features/auth/services/auth-callback.service";

/**
 * Route Handler: /auth/callback
 * Delega el intercambio PKCE (OAuth Google/Microsoft) o verificación OTP por correo al servicio auth-callback.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const targetPath = await resolveAuthCallbackRedirect(requestUrl);
  return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
}
