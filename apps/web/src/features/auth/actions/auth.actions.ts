'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@vittkly/shared';
import type { AuthActionState } from '../types/auth.types';

/**
 * Server Action: Iniciar sesión con correo y contraseña.
 *
 * AppSec y Control de Fuerza Bruta:
 * 1. Valida payload con `loginSchema`.
 * 2. Consulta `public.ingreso_bloqueado_hasta(identificador)` con service_role.
 *    Si está bloqueado, rechaza inmediatamente y retorna tiempo restante.
 * 3. Ejecuta `supabase.auth.signInWithPassword`.
 * 4. Si falla: invoca `registrar_intento(identificador, false)`. Al 3.er fallo bloquea 30s;
 *    al 5.º fallo bloquea 15m. Retorna mensaje genérico o aviso de bloqueo temporal.
 * 5. Si tiene éxito: invoca `registrar_intento(identificador, true)` y redirige al dashboard.
 */
export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawEmail = formData.get('email')?.toString() || '';
  const rawPassword = formData.get('password')?.toString() || '';

  const validation = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      error: firstIssue?.message || 'Credenciales inválidas',
    };
  }

  const identificador = validation.data.email.toLowerCase();
  const password = validation.data.password;

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (err) {
    console.error('[Vittkly Auth] Error inicializando admin client:', err);
  }

  // 1. Verificación previa de bloqueo temporal
  if (adminClient) {
    try {
      const { data: blockedUntil } = await adminClient.rpc('ingreso_bloqueado_hasta', {
        identificador,
      });

      if (blockedUntil) {
        const remainingSeconds = Math.ceil(
          (new Date(blockedUntil).getTime() - Date.now()) / 1000
        );

        if (remainingSeconds > 0) {
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          const timeLabel =
            minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

          return {
            error: `Demasiados intentos fallidos. Espera ${timeLabel} antes de reintentar.`,
            blockedUntil,
            remainingSeconds,
          };
        }
      }
    } catch (err) {
      console.warn('[Vittkly AppSec] No se pudo evaluar bloqueo previo:', err);
    }
  }

  // 2. Intento de autenticación en Supabase Auth
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identificador,
    password,
  });

  // 3. Manejo de error de credenciales
  if (error || !data.user) {
    if (adminClient) {
      try {
        await adminClient.rpc('registrar_intento', {
          identificador,
          exito: false,
        });

        // Verificar si este fallo activó un nuevo bloqueo (30s al 3.º o 15m al 5.º)
        const { data: newBlock } = await adminClient.rpc('ingreso_bloqueado_hasta', {
          identificador,
        });

        if (newBlock) {
          const remainingSeconds = Math.ceil(
            (new Date(newBlock).getTime() - Date.now()) / 1000
          );

          if (remainingSeconds > 0) {
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            const timeLabel =
              minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

            return {
              error: `Demasiados intentos fallidos. Cuenta bloqueada temporalmente por ${timeLabel}.`,
              blockedUntil: newBlock,
              remainingSeconds,
            };
          }
        }
      } catch (rpcErr) {
        console.warn('[Vittkly AppSec] Error registrando intento fallido:', rpcErr);
      }
    }

    // Zero User-Enumeration: mensaje indistinguible
    return {
      error: 'Correo o contraseña incorrectos',
    };
  }

  // 4. Autenticación exitosa
  if (adminClient) {
    try {
      await adminClient.rpc('registrar_intento', {
        identificador,
        exito: true,
      });

      // Actualizar último ingreso en usuarios si la tabla está disponible
      await adminClient
        .from('usuarios')
        .update({ ultimo_ingreso_en: new Date().toISOString() })
        .eq('id', data.user.id);
    } catch (err) {
      console.warn('[Vittkly AppSec] Error reseteando intentos en login exitoso:', err);
    }
  }

  redirect('/');
}

/**
 * Server Action: Solicitar enlace de recuperación de contraseña vía correo.
 *
 * AppSec y Anti-Enumeración (Zero User-Enumeration):
 * - Sin importar si el correo existe o no en la plataforma, la respuesta visual siempre
 *   es idéntica y exitosa para evitar el reconocimiento de correos válidos por atacantes.
 */
export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawEmail = formData.get('email')?.toString() || '';

  const validation = forgotPasswordSchema.safeParse({ email: rawEmail });
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      error: firstIssue?.message || 'Ingresa un correo electrónico válido',
    };
  }

  const email = validation.data.email.toLowerCase();

  const reqHeaders = await headers();
  const origin =
    reqHeaders.get('origin') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  const supabase = await createServerClient();
  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/restablecer-contrasena`,
    });
  } catch (err) {
    console.warn('[Vittkly Auth] Error enviando correo de recuperación:', err);
  }

  // Respuesta idéntica garantizada
  return {
    success: true,
    message:
      'Si este correo está registrado en la plataforma, hemos enviado un enlace para restablecer tu contraseña.',
  };
}

/**
 * Server Action: Restablecer contraseña con validación estricta de requisitos.
 */
export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawPassword = formData.get('password')?.toString() || '';
  const rawConfirmPassword = formData.get('confirmPassword')?.toString() || '';

  const validation = resetPasswordSchema.safeParse({
    password: rawPassword,
    confirmPassword: rawConfirmPassword,
  });

  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      error: firstIssue?.message || 'La contraseña no cumple con los requisitos mínimos de seguridad',
    };
  }

  const { password } = validation.data;
  const supabase = await createServerClient();

  // Validar que exista una sesión de recuperación activa
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        'El enlace de recuperación ha expirado o es inválido. Por favor solicita uno nuevo.',
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      error: error.message || 'No se pudo actualizar la contraseña. Intenta nuevamente.',
    };
  }

  redirect('/login?updated=true');
}
