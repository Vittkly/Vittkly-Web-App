import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import type { Tenant, UserProfile } from '../types/auth.types';

const DB_NAME = 'vittkly_offline_auth.db';

interface ProfileRow {
  id: string;
  payload: string;
  updated_at: string;
}

interface TenantRow {
  id: string;
  payload: string;
  updated_at: string;
}

interface PinMetaRow {
  id: string;
  pin_enabled: number;
  pin_synced_at: string | null;
}

export interface OfflinePinMeta {
  pinEnabled: boolean;
  pinSyncedAt: string | null;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;

/**
 * Fallback en memoria para entornos donde SQLite nativo no está disponible (Web / Jest).
 */
let memoryProfileCache: UserProfile | null = null;
let memoryTenantsCache: Tenant[] = [];
let memoryPinMetaCache: OfflinePinMeta | null = null;
let memoryActiveTenantId: string | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    if (!dbInstance) {
      dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    }

    if (!isInitialized && dbInstance) {
      await dbInstance.execAsync(`
        CREATE TABLE IF NOT EXISTS offline_user_profile (
          id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS offline_tenants (
          id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS offline_pin_meta (
          id TEXT PRIMARY KEY NOT NULL,
          pin_enabled INTEGER NOT NULL,
          pin_synced_at TEXT
        );
        CREATE TABLE IF NOT EXISTS offline_active_tenant (
          id TEXT PRIMARY KEY NOT NULL,
          tenant_id TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      isInitialized = true;
    }

    return dbInstance;
  } catch {
    return null;
  }
}

/**
 * Servicio de almacenamiento local en SQLite (`expo-sqlite`) para hidratar
 * el perfil del usuario (`UserProfile`) y sus organizaciones (`Tenant[]`) sin conexión.
 */
export const offlineSessionService = {
  /**
   * Guarda el perfil del usuario en la base de datos SQLite local.
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    memoryProfileCache = profile;
    const db = await getDatabase();
    if (!db) return;

    try {
      const now = new Date().toISOString();
      const serialized = JSON.stringify(profile);
      await db.runAsync(
        `INSERT OR REPLACE INTO offline_user_profile (id, payload, updated_at) VALUES (?, ?, ?);`,
        [profile.id, serialized, now],
      );
    } catch {
      // Fallback en memoria ya actualizado
    }
  },

  /**
   * Obtiene el perfil del usuario almacenado en SQLite local.
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const db = await getDatabase();
    if (!db) {
      return memoryProfileCache;
    }

    try {
      const row = await db.getFirstAsync<ProfileRow>(
        `SELECT id, payload, updated_at FROM offline_user_profile ORDER BY updated_at DESC LIMIT 1;`,
      );
      if (!row?.payload) {
        return memoryProfileCache;
      }
      const parsed = JSON.parse(row.payload) as UserProfile;
      memoryProfileCache = parsed;
      return parsed;
    } catch {
      return memoryProfileCache;
    }
  },

  /**
   * Guarda el listado de organizaciones (`Tenant[]`) del usuario en SQLite local.
   */
  async saveTenants(tenants: Tenant[]): Promise<void> {
    memoryTenantsCache = tenants;
    const db = await getDatabase();
    if (!db) return;

    try {
      const now = new Date().toISOString();
      await db.runAsync(`DELETE FROM offline_tenants;`);

      for (const tenant of tenants) {
        const serialized = JSON.stringify(tenant);
        await db.runAsync(
          `INSERT OR REPLACE INTO offline_tenants (id, payload, updated_at) VALUES (?, ?, ?);`,
          [tenant.id, serialized, now],
        );
      }
    } catch {
      // Fallback en memoria ya actualizado
    }
  },

  /**
   * Recupera todas las organizaciones (`Tenant[]`) almacenadas en SQLite local.
   */
  async getTenants(): Promise<Tenant[]> {
    const db = await getDatabase();
    if (!db) {
      return memoryTenantsCache;
    }

    try {
      const rows = await db.getAllAsync<TenantRow>(
        `SELECT id, payload, updated_at FROM offline_tenants ORDER BY updated_at ASC;`,
      );
      if (!rows || rows.length === 0) {
        return memoryTenantsCache;
      }

      const parsed: Tenant[] = [];
      for (const row of rows) {
        try {
          parsed.push(JSON.parse(row.payload) as Tenant);
        } catch {
          // Ignorar fila corrupta
        }
      }

      memoryTenantsCache = parsed;
      return parsed;
    } catch {
      return memoryTenantsCache;
    }
  },

  /**
   * Guarda en un solo paso el perfil y las organizaciones en SQLite local.
   */
  async saveOfflineSnapshot(profile: UserProfile, tenants: Tenant[]): Promise<void> {
    await Promise.all([this.saveUserProfile(profile), this.saveTenants(tenants)]);
  },

  /**
   * Carga en paralelo el perfil y las organizaciones desde SQLite local.
   */
  async loadOfflineSnapshot(): Promise<{ user: UserProfile | null; tenants: Tenant[] }> {
    const [user, tenants] = await Promise.all([this.getUserProfile(), this.getTenants()]);
    return { user, tenants };
  },

  /**
   * Guarda la metainformación del PIN (habilitado + última sincronización con la nube).
   * El hash del PIN NUNCA se almacena en SQLite: vive solo en SecureStore.
   */
  async savePinMeta(meta: { userId: string; pinEnabled: boolean; synced: boolean }): Promise<void> {
    const syncedAt = meta.synced ? new Date().toISOString() : null;
    memoryPinMetaCache = { pinEnabled: meta.pinEnabled, pinSyncedAt: syncedAt };

    const db = await getDatabase();
    if (!db) return;

    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO offline_pin_meta (id, pin_enabled, pin_synced_at) VALUES (?, ?, ?);`,
        [meta.userId, meta.pinEnabled ? 1 : 0, syncedAt],
      );
    } catch {
      // Fallback en memoria ya actualizado
    }
  },

  /**
   * Recupera la metainformación del PIN almacenada en SQLite local.
   */
  async getPinMeta(): Promise<OfflinePinMeta | null> {
    const db = await getDatabase();
    if (!db) {
      return memoryPinMetaCache;
    }

    try {
      const row = await db.getFirstAsync<PinMetaRow>(
        `SELECT id, pin_enabled, pin_synced_at FROM offline_pin_meta LIMIT 1;`,
      );
      if (!row) {
        return memoryPinMetaCache;
      }
      const meta: OfflinePinMeta = {
        pinEnabled: row.pin_enabled === 1,
        pinSyncedAt: row.pin_synced_at,
      };
      memoryPinMetaCache = meta;
      return meta;
    } catch {
      return memoryPinMetaCache;
    }
  },

  /**
   * Guarda el ID de la empresa activa en SQLite local.
   */
  async saveActiveTenantId(tenantId: string): Promise<void> {
    memoryActiveTenantId = tenantId;
    const db = await getDatabase();
    if (!db) return;

    try {
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT OR REPLACE INTO offline_active_tenant (id, tenant_id, updated_at) VALUES ('current', ?, ?);`,
        [tenantId, now],
      );
    } catch {
      // Fallback en memoria ya actualizado
    }
  },

  /**
   * Recupera el ID de la empresa activa almacenada en SQLite local.
   */
  async getActiveTenantId(): Promise<string | null> {
    const db = await getDatabase();
    if (!db) {
      return memoryActiveTenantId;
    }

    try {
      interface ActiveTenantRow {
        tenant_id: string;
      }
      const row = await db.getFirstAsync<ActiveTenantRow>(
        `SELECT tenant_id FROM offline_active_tenant WHERE id = 'current' LIMIT 1;`,
      );
      if (row?.tenant_id) {
        memoryActiveTenantId = row.tenant_id;
        return row.tenant_id;
      }
      return memoryActiveTenantId;
    } catch {
      return memoryActiveTenantId;
    }
  },

  /**
   * Limpia todas las tablas de caché offline en SQLite al cerrar sesión.
   */
  async clearOfflineSession(): Promise<void> {
    memoryProfileCache = null;
    memoryTenantsCache = [];
    memoryPinMetaCache = null;
    memoryActiveTenantId = null;

    const db = await getDatabase();
    if (!db) return;

    try {
      await db.execAsync(`
        DELETE FROM offline_user_profile;
        DELETE FROM offline_tenants;
        DELETE FROM offline_pin_meta;
        DELETE FROM offline_active_tenant;
      `);
    } catch {
      // Ignorar si las tablas aún no existen
    }
  },
};
