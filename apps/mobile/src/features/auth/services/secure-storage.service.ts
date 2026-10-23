import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { AuthBootstrapData, Tenant, UserProfile } from '../types/auth.types';

/**
 * Claves de almacenamiento seguro en Keychain (iOS) / Keystore (Android).
 */
export const SECURE_STORAGE_KEYS = {
  SESSION_JWT: 'vittkly.auth.session_jwt',
  PIN_HASH: 'vittkly.auth.pin_hash',
  ACTIVE_ORGANIZATION_ID: 'vittkly.auth.active_organization_id',
  LAST_ACTIVE_TENANT_ID: 'vittkly.auth.last_active_tenant_id',
  USER_PROFILE: 'vittkly.auth.user_profile',
  TENANTS: 'vittkly.auth.tenants',
  BIOMETRIC_ENABLED: 'vittkly.auth.biometric_enabled',
  LAST_BACKGROUND_TIME: 'vittkly.auth.last_background_time',
  PIN_CLOUD_SYNC_PENDING: 'vittkly.auth.pin_cloud_sync_pending',
  PIN_ATTEMPTS: 'vittkly.auth.pin_attempts',
} as const;

export interface PinAttemptsRecord {
  failedAttempts: number;
  lockedUntil: number | null;
}

type SecureStorageKey = (typeof SECURE_STORAGE_KEYS)[keyof typeof SECURE_STORAGE_KEYS];

/**
 * Fallback en memoria para entornos donde SecureStore nativo no está disponible (ej. Web / Jest).
 */
const memoryFallback = new Map<string, string>();

async function isSecureStoreSupported(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function getRawItem(key: SecureStorageKey): Promise<string | null> {
  try {
    const supported = await isSecureStoreSupported();
    if (!supported) {
      return memoryFallback.get(key) ?? null;
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setRawItem(key: SecureStorageKey, value: string): Promise<void> {
  const supported = await isSecureStoreSupported();
  if (!supported) {
    memoryFallback.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

async function removeRawItem(key: SecureStorageKey): Promise<void> {
  try {
    const supported = await isSecureStoreSupported();
    if (!supported) {
      memoryFallback.delete(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Ignorar error si la clave ya no existe
  }
}

/**
 * Servicio envoltura (wrapper) tipado para la persistencia segura de credenciales y sesión local.
 */
export const secureStorageService = {
  /**
   * Obtiene el JWT de sesión almacenado de forma segura.
   */
  async getSessionJwt(): Promise<string | null> {
    return getRawItem(SECURE_STORAGE_KEYS.SESSION_JWT);
  },

  /**
   * Guarda el JWT de sesión en el almacenamiento seguro del dispositivo.
   */
  async setSessionJwt(token: string): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.SESSION_JWT, token);
  },

  /**
   * Elimina el JWT de sesión del almacenamiento seguro.
   */
  async removeSessionJwt(): Promise<void> {
    await removeRawItem(SECURE_STORAGE_KEYS.SESSION_JWT);
  },

  /**
   * Obtiene el hash del PIN local configurado por el usuario.
   */
  async getPinHash(): Promise<string | null> {
    return getRawItem(SECURE_STORAGE_KEYS.PIN_HASH);
  },

  /**
   * Guarda el hash del PIN local del usuario.
   */
  async setPinHash(pinHash: string): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.PIN_HASH, pinHash);
  },

  /**
   * Elimina el hash del PIN local del usuario.
   */
  async removePinHash(): Promise<void> {
    await removeRawItem(SECURE_STORAGE_KEYS.PIN_HASH);
  },

  /**
   * Obtiene el ID de la organización activa (`active_organization_id`).
   */
  async getActiveOrganizationId(): Promise<string | null> {
    return getRawItem(SECURE_STORAGE_KEYS.ACTIVE_ORGANIZATION_ID);
  },

  /**
   * Guarda el ID de la organización activa (`active_organization_id`).
   */
  async setActiveOrganizationId(organizationId: string): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.ACTIVE_ORGANIZATION_ID, organizationId);
  },

  /**
   * Elimina el ID de la organización activa.
   */
  async removeActiveOrganizationId(): Promise<void> {
    await removeRawItem(SECURE_STORAGE_KEYS.ACTIVE_ORGANIZATION_ID);
  },

  /**
   * Guarda el ID de la última empresa activa seleccionada por el usuario.
   * Se persiste tanto en LAST_ACTIVE_TENANT_ID como en ACTIVE_ORGANIZATION_ID.
   */
  async saveLastActiveTenantId(tenantId: string): Promise<void> {
    await Promise.all([
      setRawItem(SECURE_STORAGE_KEYS.LAST_ACTIVE_TENANT_ID, tenantId),
      setRawItem(SECURE_STORAGE_KEYS.ACTIVE_ORGANIZATION_ID, tenantId),
    ]);
  },

  /**
   * Obtiene el ID de la última empresa activa seleccionada por el usuario.
   * Consulta primero LAST_ACTIVE_TENANT_ID y hace fallback a ACTIVE_ORGANIZATION_ID.
   */
  async getLastActiveTenantId(): Promise<string | null> {
    const last = await getRawItem(SECURE_STORAGE_KEYS.LAST_ACTIVE_TENANT_ID);
    if (last) return last;
    return this.getActiveOrganizationId();
  },

  /**
   * Obtiene el perfil del usuario almacenado en caché seguro para modo offline.
   */
  async getCachedUserProfile(): Promise<UserProfile | null> {
    const raw = await getRawItem(SECURE_STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  /**
   * Guarda el perfil del usuario para hidratación rápida offline.
   */
  async setCachedUserProfile(profile: UserProfile): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  /**
   * Elimina el perfil del usuario en caché.
   */
  async removeCachedUserProfile(): Promise<void> {
    await removeRawItem(SECURE_STORAGE_KEYS.USER_PROFILE);
  },

  /**
   * Obtiene la lista de organizaciones (tenants) en caché.
   */
  async getCachedTenants(): Promise<Tenant[]> {
    const raw = await getRawItem(SECURE_STORAGE_KEYS.TENANTS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Tenant[]) : [];
    } catch {
      return [];
    }
  },

  /**
   * Guarda la lista de organizaciones (tenants) del usuario en caché seguro.
   */
  async setCachedTenants(tenants: Tenant[]): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  },

  /**
   * Elimina la lista de organizaciones en caché.
   */
  async removeCachedTenants(): Promise<void> {
    await removeRawItem(SECURE_STORAGE_KEYS.TENANTS);
  },

  /**
   * Obtiene si el desbloqueo biométrico está habilitado por el usuario.
   */
  async getBiometricEnabled(): Promise<boolean> {
    const raw = await getRawItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED);
    return raw === 'true';
  },

  /**
   * Establece la preferencia de desbloqueo biométrico del usuario.
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
  },

  /**
   * Alias de `setPinHash`: guarda el hash del PIN en el hardware del dispositivo.
   */
  async savePinHash(pinHash: string): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.PIN_HASH, pinHash);
  },

  /**
   * Alias de `setBiometricEnabled`: guarda la preferencia de desbloqueo biométrico.
   */
  async saveBiometricPreference(enabled: boolean): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
  },

  /**
   * Guarda la marca de tiempo (ms) en que la app pasó a segundo plano.
   */
  async saveLastBackgroundTime(timestampMs: number): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.LAST_BACKGROUND_TIME, String(timestampMs));
  },

  /**
   * Obtiene la marca de tiempo (ms) de la última salida a segundo plano.
   */
  async getLastBackgroundTime(): Promise<number | null> {
    const raw = await getRawItem(SECURE_STORAGE_KEYS.LAST_BACKGROUND_TIME);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  },

  /**
   * Elimina la marca de tiempo de la última salida a segundo plano.
   */
  async removeLastBackgroundTime(): Promise<void> {
    await removeRawItem(SECURE_STORAGE_KEYS.LAST_BACKGROUND_TIME);
  },

  /**
   * Indica si el hash del PIN aún no se pudo sincronizar con la nube (sin conexión).
   */
  async getPinCloudSyncPending(): Promise<boolean> {
    const raw = await getRawItem(SECURE_STORAGE_KEYS.PIN_CLOUD_SYNC_PENDING);
    return raw === 'true';
  },

  /**
   * Marca o limpia la sincronización pendiente del PIN con la nube.
   */
  async setPinCloudSyncPending(pending: boolean): Promise<void> {
    if (pending) {
      await setRawItem(SECURE_STORAGE_KEYS.PIN_CLOUD_SYNC_PENDING, 'true');
      return;
    }
    await removeRawItem(SECURE_STORAGE_KEYS.PIN_CLOUD_SYNC_PENDING);
  },

  /**
   * Obtiene los intentos fallidos de PIN persistidos (sobreviven al cierre de la app).
   */
  async getPinAttempts(): Promise<PinAttemptsRecord> {
    const raw = await getRawItem(SECURE_STORAGE_KEYS.PIN_ATTEMPTS);
    if (!raw) return { failedAttempts: 0, lockedUntil: null };
    try {
      const parsed = JSON.parse(raw) as Partial<PinAttemptsRecord>;
      return {
        failedAttempts: typeof parsed.failedAttempts === 'number' ? parsed.failedAttempts : 0,
        lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
      };
    } catch {
      return { failedAttempts: 0, lockedUntil: null };
    }
  },

  /**
   * Persiste los intentos fallidos de PIN y el instante de fin de bloqueo.
   */
  async setPinAttempts(record: PinAttemptsRecord): Promise<void> {
    await setRawItem(SECURE_STORAGE_KEYS.PIN_ATTEMPTS, JSON.stringify(record));
  },

  /**
   * Reinicia el contador de intentos fallidos de PIN.
   */
  async removePinAttempts(): Promise<void> {
    await removeRawItem(SECURE_STORAGE_KEYS.PIN_ATTEMPTS);
  },

  /**
   * Recupera en paralelo todos los datos de sesión necesarios durante el arranque de la app.
   */
  async getAuthBootstrapData(): Promise<AuthBootstrapData> {
    const [
      sessionToken,
      pinHash,
      activeOrganizationId,
      lastActiveTenantId,
      user,
      tenants,
      isBiometricEnabled,
      pinAttempts,
    ] = await Promise.all([
      this.getSessionJwt(),
      this.getPinHash(),
      this.getActiveOrganizationId(),
      this.getLastActiveTenantId(),
      this.getCachedUserProfile(),
      this.getCachedTenants(),
      this.getBiometricEnabled(),
      this.getPinAttempts(),
    ]);

    return {
      sessionToken,
      pinHash,
      activeOrganizationId,
      lastActiveTenantId,
      user,
      tenants,
      isBiometricEnabled,
      pinFailedAttempts: pinAttempts.failedAttempts,
      pinLockedUntil: pinAttempts.lockedUntil,
    };
  },

  /**
   * Limpia todas las credenciales y datos de sesión almacenados al cerrar sesión.
   */
  async clearAllAuthStorage(): Promise<void> {
    await Promise.all([
      this.removeSessionJwt(),
      this.removePinHash(),
      this.removeActiveOrganizationId(),
      this.removeCachedUserProfile(),
      this.removeCachedTenants(),
      removeRawItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED),
      this.removeLastBackgroundTime(),
      this.removePinAttempts(),
      this.setPinCloudSyncPending(false),
    ]);
  },
};
