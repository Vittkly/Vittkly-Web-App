import type { User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/services/supabase';

import type {
  AuthSessionResult,
  OAuthProvider,
  SignInWithPasswordParams,
  UserProfile,
  VerifyOtpParams,
} from '../types/auth.types';
import { getSupabaseOAuthConfig, parseOAuthCallbackUrl } from '../utils/oauth';
import { sanitizeNetworkError } from './network-error';
import { tenantRepository } from './tenant.repository';

WebBrowser.maybeCompleteAuthSession();

interface UsuarioRow {
  id: string;
  nombre: string;
  nombres: string | null;
  apellidos: string | null;
  correo: string | null;
  celular: string | null;
  avatar_ruta: string | null;
  ultima_empresa_id: string | null;
}

function splitFullName(fullName: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  const cleaned = (fullName ?? '').trim();
  if (!cleaned) {
    return { firstName: null, lastName: null };
  }
  const [firstName, ...rest] = cleaned.split(/\s+/);
  return {
    firstName: firstName || null,
    lastName: rest.length > 0 ? rest.join(' ') : null,
  };
}

function mapUserProfile(user: User, usuarioRow: UsuarioRow | null): UserProfile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullNameFromRow =
    usuarioRow?.nombre?.trim() ||
    [usuarioRow?.nombres, usuarioRow?.apellidos].filter(Boolean).join(' ').trim();
  const fullNameFromMeta =
    typeof meta.full_name === 'string' && meta.full_name.trim()
      ? meta.full_name.trim()
      : typeof meta.name === 'string' && meta.name.trim()
        ? meta.name.trim()
        : null;

  const fullName = fullNameFromRow || fullNameFromMeta || null;
  const fallbackNames = splitFullName(fullName);

  const firstName =
    usuarioRow?.nombres?.trim() ||
    (typeof meta.first_name === 'string' ? meta.first_name.trim() : null) ||
    fallbackNames.firstName;
  const lastName =
    usuarioRow?.apellidos?.trim() ||
    (typeof meta.last_name === 'string' ? meta.last_name.trim() : null) ||
    fallbackNames.lastName;

  return {
    id: user.id,
    email: usuarioRow?.correo ?? user.email ?? null,
    phone: usuarioRow?.celular ?? user.phone ?? null,
    firstName: firstName || null,
    lastName: lastName || null,
    fullName,
    avatarUrl: usuarioRow?.avatar_ruta ?? null,
    ultimaEmpresaId: usuarioRow?.ultima_empresa_id ?? null,
  };
}

async function fetchUsuarioRow(userId: string): Promise<UsuarioRow | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, nombres, apellidos, correo, celular, avatar_ruta, ultima_empresa_id')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as UsuarioRow;
  } catch {
    return null;
  }
}

function readCloudPinFromUser(user: User): { hasCloudPin: boolean; cloudPinHash: string | null } {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const cloudPinHash =
    typeof meta.vittkly_pin_hash === 'string' && meta.vittkly_pin_hash.length > 0
      ? meta.vittkly_pin_hash
      : null;

  return {
    hasCloudPin: Boolean(cloudPinHash),
    cloudPinHash,
  };
}

async function buildAuthSessionResult(accessToken: string, user: User): Promise<AuthSessionResult> {
  const [usuarioRow, tenants] = await Promise.all([
    fetchUsuarioRow(user.id),
    tenantRepository.fetchUserTenants(user.id),
  ]);
  const { hasCloudPin, cloudPinHash } = readCloudPinFromUser(user);

  return {
    token: accessToken,
    user: mapUserProfile(user, usuarioRow),
    tenants,
    hasCloudPin,
    cloudPinHash,
  };
}

/**
 * Repositorio canónico de Autenticación y Usuarios para Vittkly Mobile.
 * Consume Supabase Auth + la tabla canónica `public.usuarios` de Etapa 0.
 */
export const authRepository = {
  /**
   * Inicia sesión con correo electrónico y contraseña.
   */
  async signInWithPassword(params: SignInWithPasswordParams): Promise<AuthSessionResult> {
    const email = params.email.trim().toLowerCase();

    let data;
    let error;
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password: params.password,
      });
      data = response.data;
      error = response.error;
    } catch (err: unknown) {
      throw new Error(
        sanitizeNetworkError(
          err,
          'No pudimos conectarnos con el servidor. Verifica tu conexión a internet.',
        ),
      );
    }

    if (error || !data.session || !data.user) {
      const msg = error?.message?.toLowerCase() ?? '';
      if (msg.includes('invalid login') || msg.includes('invalid_credentials')) {
        throw new Error('Correo o contraseña incorrectos.');
      }
      if (msg.includes('email not confirmed')) {
        throw new Error('Tu correo aún no ha sido verificado.');
      }
      throw new Error(
        sanitizeNetworkError(error, 'No se pudo iniciar sesión. Verifica tus credenciales.'),
      );
    }

    return buildAuthSessionResult(data.session.access_token, data.user);
  },

  /**
   * Inicia sesión mediante OAuth externo (Google o Microsoft) usando WebBrowser + Deep Link.
   * Retorna `null` si el usuario canceló la ventana del proveedor.
   */
  async signInWithOAuth(provider: OAuthProvider): Promise<AuthSessionResult | null> {
    const config = getSupabaseOAuthConfig(provider);
    const redirectTo = Linking.createURL('auth/callback');

    let oauthUrl: string | undefined;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: config.supabaseProvider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          ...(config.scopes ? { scopes: config.scopes } : {}),
          queryParams: config.queryParams,
        },
      });
      if (error || !data?.url) {
        throw new Error(
          sanitizeNetworkError(error, `No se pudo iniciar la autenticación con ${config.label}.`),
        );
      }
      oauthUrl = data.url;
    } catch (err: unknown) {
      throw new Error(
        sanitizeNetworkError(
          err,
          `No pudimos conectarnos con ${config.label}. Verifica tu conexión a internet.`,
        ),
      );
    }

    const browserResult = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo);
    if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
      return null;
    }
    if (browserResult.type !== 'success' || !browserResult.url) {
      throw new Error(`No se pudo completar el acceso con ${config.label}. Intenta nuevamente.`);
    }

    const params = parseOAuthCallbackUrl(browserResult.url);
    if (params.error === 'access_denied') {
      return null;
    }
    if (params.error) {
      throw new Error(
        sanitizeNetworkError(
          new Error(params.error_description || params.error),
          `No se pudo completar el acceso con ${config.label}.`,
        ),
      );
    }

    let sessionData;
    let sessionError;
    try {
      if (params.code) {
        const res = await supabase.auth.exchangeCodeForSession(params.code);
        sessionData = res.data;
        sessionError = res.error;
      } else if (params.access_token && params.refresh_token) {
        const res = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        sessionData = res.data;
        sessionError = res.error;
      } else {
        throw new Error(`No se recibieron credenciales válidas de ${config.label}.`);
      }
    } catch (err: unknown) {
      throw new Error(
        sanitizeNetworkError(err, `No se pudo validar tu sesión con ${config.label}.`),
      );
    }

    if (sessionError || !sessionData.session || !sessionData.user) {
      throw new Error(
        sanitizeNetworkError(sessionError, `No se pudo iniciar sesión con ${config.label}.`),
      );
    }

    try {
      await supabase
        .from('usuarios')
        .update({ ultimo_ingreso_en: new Date().toISOString() })
        .eq('id', sessionData.user.id);
    } catch {
      // Operación best-effort: no bloquea el ingreso móvil
    }

    return buildAuthSessionResult(sessionData.session.access_token, sessionData.user);
  },

  /**
   * Solicita un código OTP por SMS/WhatsApp al número del técnico.
   */
  async signInWithOtp(phone: string): Promise<{ normalizedPhone: string }> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      throw new Error('Ingresa un número de celular válido.');
    }

    let error;
    try {
      const response = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });
      error = response.error;
    } catch (err: unknown) {
      throw new Error(
        sanitizeNetworkError(
          err,
          'No pudimos conectarnos para enviar el código. Revisa tu conexión.',
        ),
      );
    }

    if (error) {
      throw new Error(
        sanitizeNetworkError(error, 'No se pudo enviar el código de verificación al celular.'),
      );
    }

    return { normalizedPhone: cleanPhone };
  },

  /**
   * Verifica el código OTP telefónico y resuelve usuario + membresías activas en app móvil.
   */
  async verifyOtp(params: VerifyOtpParams): Promise<AuthSessionResult> {
    const cleanPhone = params.phone.trim();
    const cleanToken = params.token.trim();

    let data;
    let error;
    try {
      const response = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: cleanToken,
        type: 'sms',
      });
      data = response.data;
      error = response.error;
    } catch (err: unknown) {
      throw new Error(
        sanitizeNetworkError(
          err,
          'No pudimos validar el código. Revisa tu conexión e intenta nuevamente.',
        ),
      );
    }

    if (error || !data.session || !data.user) {
      throw new Error(sanitizeNetworkError(error, 'Código incorrecto o expirado.'));
    }

    return buildAuthSessionResult(data.session.access_token, data.user);
  },

  /**
   * Envía un código OTP de recuperación de contraseña al correo del usuario.
   */
  async resetPasswordForEmail(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    let error;

    try {
      const response = await supabase.auth.resetPasswordForEmail(cleanEmail);
      error = response.error;
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'No se pudo enviar el código de recuperación.'));
    }

    if (error) {
      throw new Error(sanitizeNetworkError(error, 'No se pudo enviar el código de recuperación.'));
    }
  },

  /**
   * Verifica el código OTP de recuperación enviado al correo electrónico.
   */
  async verifyRecoveryOtp(email: string, token: string): Promise<AuthSessionResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    let data;
    let error;

    try {
      const response = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'recovery',
      });
      data = response.data;
      error = response.error;
    } catch (err: unknown) {
      throw new Error(
        sanitizeNetworkError(err, 'El código de recuperación es inválido o ha expirado.'),
      );
    }

    if (error || !data.session || !data.user) {
      throw new Error(
        sanitizeNetworkError(error, 'El código de recuperación es inválido o ha expirado.'),
      );
    }

    return buildAuthSessionResult(data.session.access_token, data.user);
  },

  /**
   * Actualiza la contraseña del usuario durante el flujo de recuperación.
   */
  async updatePassword(newPassword: string): Promise<void> {
    let error;

    try {
      const response = await supabase.auth.updateUser({
        password: newPassword,
      });
      error = response.error;
    } catch (err: unknown) {
      throw new Error(sanitizeNetworkError(err, 'No se pudo actualizar la contraseña.'));
    }

    if (error) {
      throw new Error(sanitizeNetworkError(error, 'No se pudo actualizar la contraseña.'));
    }
  },

  /**
   * Respalda el hash del PIN en los metadatos del usuario en Supabase Auth.
   */
  async syncPinToCloud(pinHash: string): Promise<{ synced: boolean }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          vittkly_pin_hash: pinHash,
          vittkly_pin_updated_at: new Date().toISOString(),
        },
      });
      return { synced: !error };
    } catch {
      return { synced: false };
    }
  },

  /**
   * Persiste `ultima_empresa_id` y `ultimo_ingreso_en` en `public.usuarios`
   * para recordar la empresa seleccionada entre sesiones y dispositivos.
   */
  async updateLastActiveEmpresa(userId: string, empresaId: string): Promise<void> {
    try {
      await supabase
        .from('usuarios')
        .update({
          ultima_empresa_id: empresaId,
          ultimo_ingreso_en: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch {
      // Operación best-effort: la fuente inmediata es SecureStore + SQLite local.
    }
  },

  /**
   * Verifica la sesión vigente en Supabase Auth y recarga perfil + empresas habilitadas.
   */
  async getCurrentSession(): Promise<AuthSessionResult | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session || !data.session.user) {
        return null;
      }

      return await buildAuthSessionResult(data.session.access_token, data.session.user);
    } catch {
      return null;
    }
  },

  /**
   * Cierra la sesión activa en Supabase Auth.
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // Garantiza limpieza de sesión local aunque no haya red
    }
  },
};
