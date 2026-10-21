import type { User } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase';

import type {
  AuthSessionResult,
  SignInWithPasswordParams,
  SignUpParams,
  SignUpWithEmailResult,
  UserProfile,
  VerifyOtpParams,
} from '../types/auth.types';

import { offlineSessionService } from './offline-session.service';
import { secureStorageService } from './secure-storage.service';
import { sanitizeNetworkError } from './tenant.service';

interface DatabaseProfileRow {
  id: string;
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  updated_at?: string | null;
}

export function normalizeInternationalPhone(rawPhone: string): string {
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }
  if (digits.length === 9 && digits.startsWith('9')) {
    return `+51${digits}`;
  }
  return `+${digits}`;
}

function mapSupabaseUserToProfile(
  authUser: User,
  profileRow?: DatabaseProfileRow | null,
): UserProfile {
  const metadata = authUser.user_metadata ?? {};
  const firstName =
    profileRow?.first_name ??
    (typeof metadata.first_name === 'string' ? metadata.first_name : null);
  const lastName =
    profileRow?.last_name ?? (typeof metadata.last_name === 'string' ? metadata.last_name : null);

  const computedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const fullName =
    profileRow?.full_name ||
    (typeof metadata.full_name === 'string' ? metadata.full_name : '') ||
    computedName ||
    authUser.email ||
    authUser.phone ||
    'Usuario Vittkly';

  return {
    id: authUser.id,
    email: profileRow?.email ?? authUser.email ?? null,
    phone: profileRow?.phone ?? authUser.phone ?? null,
    firstName,
    lastName,
    fullName,
    avatarUrl:
      profileRow?.avatar_url ??
      (typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null),
    updatedAt: profileRow?.updated_at ?? authUser.updated_at,
  };
}

/**
 * Lee el PIN de acceso rápido persistido en la nube (`user_metadata.pin_hash` / `pin_enabled`).
 */
function readCloudPin(authUser: User): { pinHash: string | null; pinEnabled: boolean } {
  const metadata = authUser.user_metadata ?? {};
  const pinHash =
    typeof metadata.pin_hash === 'string' && metadata.pin_hash.length > 0
      ? metadata.pin_hash
      : null;
  return {
    pinHash,
    pinEnabled: metadata.pin_enabled === true && pinHash !== null,
  };
}

async function fetchProfileRow(userId: string): Promise<DatabaseProfileRow | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, phone, first_name, last_name, full_name, avatar_url, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as DatabaseProfileRow;
  } catch {
    return null;
  }
}

/**
 * Servicio de Autenticación (Repository Pattern) que encapsula toda comunicación con Supabase Auth.
 */
export const authService = {
  /**
   * Inicia sesión con correo electrónico y contraseña.
   */
  async signInWithPassword(params: SignInWithPasswordParams): Promise<AuthSessionResult> {
    const cleanEmail = params.email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password,
      });

      if (error || !data.session || !data.user) {
        throw new Error(
          sanitizeNetworkError(error, 'Credenciales inválidas. Verifica tu correo y contraseña.'),
        );
      }

      const profileRow = await fetchProfileRow(data.user.id);
      const userProfile = mapSupabaseUserToProfile(data.user, profileRow);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: userProfile,
        ...readCloudPin(data.user),
      };
    } catch (err: unknown) {
      throw new Error(
        sanitizeNetworkError(err, 'Credenciales inválidas. Verifica tu correo y contraseña.'),
      );
    }
  },

  /**
   * Registra un nuevo usuario con correo y contraseña.
   * Retorna si requiere confirmación por correo (OTP) y la sesión si fue confirmada automáticamente.
   */
  async signUpWithEmail(params: SignUpParams): Promise<SignUpWithEmailResult> {
    const cleanEmail = params.email.trim().toLowerCase();
    const rawFullName =
      params.fullName?.trim() ||
      `${params.firstName ?? ''} ${params.lastName ?? ''}`.trim() ||
      'Usuario Vittkly';
    const nameParts = rawFullName.split(/\s+/);
    const firstName = params.firstName?.trim() || nameParts[0] || rawFullName;
    const lastName = params.lastName?.trim() || nameParts.slice(1).join(' ') || '';
    const whatsappPhone = params.whatsapp?.trim() || params.phone?.trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: rawFullName,
            phone: whatsappPhone ? normalizeInternationalPhone(whatsappPhone) : undefined,
            company_name: params.companyName?.trim() || undefined,
            business_activity: params.businessActivity?.trim() || undefined,
            city: params.city?.trim() || undefined,
            whatsapp: whatsappPhone ? normalizeInternationalPhone(whatsappPhone) : undefined,
          },
        },
      });

      if (error) {
        throw new Error(sanitizeNetworkError(error, 'No se pudo completar el registro.'));
      }

      if (!data.session || !data.user) {
        return {
          requiresEmailConfirmation: true,
          email: cleanEmail,
          session: null,
        };
      }

      const profileRow = await fetchProfileRow(data.user.id);
      const userProfile = mapSupabaseUserToProfile(data.user, profileRow);

      return {
        requiresEmailConfirmation: false,
        email: cleanEmail,
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          user: userProfile,
        },
      };
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'No se pudo completar el registro.'));
    }
  },

  /**
   * Alias de compatibilidad para registro.
   */
  async signUp(params: SignUpParams): Promise<AuthSessionResult | null> {
    const result = await this.signUpWithEmail(params);
    return result.session;
  },

  /**
   * Verifica estrictamente el código OTP de 6 dígitos para confirmación de registro de correo.
   * Lanza "Código incorrecto o expirado" si el código no coincide o no retorna sesión válida.
   */
  async verifySignupOtp(email: string, token: string): Promise<AuthSessionResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.replace(/\D/g, '');

    if (cleanToken.length !== 6) {
      throw new Error('Código incorrecto o expirado');
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup',
      });

      if (error || !data.session || !data.user) {
        throw new Error('Código incorrecto o expirado');
      }

      const profileRow = await fetchProfileRow(data.user.id);
      const userProfile = mapSupabaseUserToProfile(data.user, profileRow);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: userProfile,
        ...readCloudPin(data.user),
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Código incorrecto o expirado') {
        throw err;
      }
      throw new Error('Código incorrecto o expirado');
    }
  },

  /**
   * Reenvía el código OTP de 6 dígitos de confirmación de registro.
   */
  async resendSignupOtp(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        throw new Error(
          sanitizeNetworkError(error, 'No se pudo reenviar el código de verificación.'),
        );
      }
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'No se pudo reenviar el código de verificación.'));
    }
  },

  /**
   * Envía un código OTP de 6 dígitos por SMS/WhatsApp al teléfono del técnico.
   */
  async signInWithOtp(phone: string): Promise<{ normalizedPhone: string }> {
    const normalizedPhone = normalizeInternationalPhone(phone);
    if (!normalizedPhone || normalizedPhone.length < 8) {
      throw new Error('Ingresa un número de celular válido.');
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      });

      if (error) {
        throw new Error(
          sanitizeNetworkError(error, 'No se pudo enviar el código de verificación.'),
        );
      }

      return { normalizedPhone };
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'No se pudo enviar el código de verificación.'));
    }
  },

  /**
   * Verifica el código OTP de 6 dígitos enviado al teléfono del técnico.
   */
  async verifyOtp(params: VerifyOtpParams): Promise<AuthSessionResult> {
    const normalizedPhone = normalizeInternationalPhone(params.phone);
    const cleanToken = params.token.replace(/\D/g, '');

    if (cleanToken.length !== 6) {
      throw new Error('El código de verificación debe tener 6 dígitos.');
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: cleanToken,
        type: 'sms',
      });

      if (error || !data.session || !data.user) {
        throw new Error(sanitizeNetworkError(error, 'Código inválido o expirado.'));
      }

      const profileRow = await fetchProfileRow(data.user.id);
      const userProfile = mapSupabaseUserToProfile(data.user, profileRow);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: userProfile,
        ...readCloudPin(data.user),
      };
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'Código inválido o expirado.'));
    }
  },

  /**
   * Envía un correo de recuperación de contraseña.
   */
  async resetPasswordForEmail(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Ingresa tu correo electrónico para recuperar tu contraseña.');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        throw new Error(
          sanitizeNetworkError(error, 'No se pudo enviar el correo de recuperación.'),
        );
      }
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'No se pudo enviar el correo de recuperación.'));
    }
  },

  /**
   * Verifica estrictamente el código OTP de 6 dígitos para recuperación de contraseña.
   * Lanza "Código incorrecto o expirado" si el código no coincide o no retorna sesión válida.
   * Supabase Auth establece la sesión de recuperación automáticamente si el código es válido.
   */
  async verifyRecoveryOtp(email: string, token: string): Promise<AuthSessionResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.replace(/\D/g, '');

    if (cleanToken.length !== 6) {
      throw new Error('Código incorrecto o expirado');
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'recovery',
      });

      if (error || !data.session || !data.user) {
        throw new Error('Código incorrecto o expirado');
      }

      const profileRow = await fetchProfileRow(data.user.id);
      const userProfile = mapSupabaseUserToProfile(data.user, profileRow);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: userProfile,
        ...readCloudPin(data.user),
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Código incorrecto o expirado') {
        throw err;
      }
      throw new Error('Código incorrecto o expirado');
    }
  },

  /**
   * Alias de compatibilidad para verificación de OTP de recuperación.
   */
  async verifyPasswordResetOtp(email: string, token: string): Promise<void> {
    await this.verifyRecoveryOtp(email, token);
  },

  /**
   * Actualiza la contraseña del usuario autenticado.
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(sanitizeNetworkError(error, 'No se pudo actualizar la contraseña.'));
      }
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'No se pudo actualizar la contraseña.'));
    }
  },

  /**
   * Sincroniza el hash del PIN en la nube mediante `user_metadata` de Supabase Auth
   * (`pin_hash` + `pin_enabled`). No lanza error si falla por red: devuelve `{ synced: false }`
   * para que el llamador marque la sincronización como pendiente.
   */
  async syncPinToCloud(pinHash: string): Promise<{ synced: boolean }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { pin_hash: pinHash, pin_enabled: true },
      });
      return { synced: !error };
    } catch {
      return { synced: false };
    }
  },

  /**
   * Obtiene la sesión actual desde Supabase si hay conectividad.
   */
  async getCurrentSession(): Promise<AuthSessionResult | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session || !data.session.user) {
        return null;
      }

      const profileRow = await fetchProfileRow(data.session.user.id);
      const userProfile = mapSupabaseUserToProfile(data.session.user, profileRow);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: userProfile,
        ...readCloudPin(data.session.user),
      };
    } catch {
      return null;
    }
  },

  /**
   * Cierra la sesión en Supabase y limpia tanto SecureStore como SQLite local.
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // Continuar limpieza local incluso si no hay red
    }

    await Promise.all([
      secureStorageService.clearAllAuthStorage(),
      offlineSessionService.clearOfflineSession(),
    ]);
  },
};
