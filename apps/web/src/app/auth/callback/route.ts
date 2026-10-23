import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route Handler: /auth/callback
 * Intercambia el código de autorización PKCE o token hash por la sesión oficial de Supabase.
 * Previene vulnerabilidades de Open Redirect validando el parámetro `next`.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as
    | 'recovery'
    | 'signup'
    | 'invite'
    | 'magiclink'
    | 'email_change'
    | null;
  const rawNext = requestUrl.searchParams.get('next') || '/';

  // Blindaje Anti Open-Redirect: solo permitir rutas relativas seguras
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Si falló el intercambio o expiró el token, redirigir al login con alerta
  return NextResponse.redirect(
    new URL('/login?error=enlace_expirado', requestUrl.origin)
  );
}
