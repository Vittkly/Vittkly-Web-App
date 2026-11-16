import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import type {
  CachedCliente,
  CachedEvidenciaOrden,
  CachedOrdenTrabajo,
  CachedPlantillaFormulario,
  CachedRegistroTiempo,
  CachedRespuestaFormulario,
  SyncOutboxItem,
} from './offline.types';

const OPS_DB_NAME = 'vittkly_offline_ops.db';

export interface OfflineMemoryStore {
  clientes: Map<string, CachedCliente>;
  ordenes: Map<string, CachedOrdenTrabajo>;
  plantillas: Map<string, CachedPlantillaFormulario>;
  respuestas: Map<string, CachedRespuestaFormulario>;
  evidencias: Map<string, CachedEvidenciaOrden>;
  registrosTiempo: Map<string, CachedRegistroTiempo>;
  outbox: SyncOutboxItem[];
  lastSyncedAt: string | null;
}

const memoryStore: OfflineMemoryStore = {
  clientes: new Map(),
  ordenes: new Map(),
  plantillas: new Map(),
  respuestas: new Map(),
  evidencias: new Map(),
  registrosTiempo: new Map(),
  outbox: [],
  lastSyncedAt: null,
};

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

async function initializeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS offline_clientes (
      id TEXT PRIMARY KEY NOT NULL,
      empresa_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_offline_clientes_empresa
      ON offline_clientes (empresa_id);

    CREATE TABLE IF NOT EXISTS offline_ordenes_trabajo (
      id TEXT PRIMARY KEY NOT NULL,
      empresa_id TEXT NOT NULL,
      tecnico_id TEXT,
      fecha_programada TEXT NOT NULL,
      estado TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_offline_ordenes_empresa_fecha
      ON offline_ordenes_trabajo (empresa_id, fecha_programada, estado);

    CREATE TABLE IF NOT EXISTS offline_plantillas_formulario (
      id TEXT PRIMARY KEY NOT NULL,
      empresa_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      activa INTEGER NOT NULL DEFAULT 1,
      payload_json TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_offline_plantillas_empresa
      ON offline_plantillas_formulario (empresa_id, activa, tipo);

    CREATE TABLE IF NOT EXISTS offline_respuestas_formulario (
      id TEXT PRIMARY KEY NOT NULL,
      empresa_id TEXT NOT NULL,
      orden_trabajo_id TEXT NOT NULL UNIQUE,
      estado TEXT NOT NULL,
      paso_actual INTEGER NOT NULL DEFAULT 0,
      payload_json TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'local_only',
      actualizado_en TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_offline_respuestas_empresa_orden
      ON offline_respuestas_formulario (empresa_id, orden_trabajo_id);

    CREATE TABLE IF NOT EXISTS offline_evidencias_locales (
      id TEXT PRIMARY KEY NOT NULL,
      empresa_id TEXT NOT NULL,
      orden_trabajo_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      local_uri TEXT,
      storage_path TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'local_only',
      creado_en TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_offline_evidencias_empresa_orden
      ON offline_evidencias_locales (empresa_id, orden_trabajo_id);

    CREATE TABLE IF NOT EXISTS offline_registros_tiempo (
      id TEXT PRIMARY KEY NOT NULL,
      empresa_id TEXT NOT NULL,
      usuario_id TEXT NOT NULL,
      orden_trabajo_id TEXT,
      tipo TEXT NOT NULL,
      iniciado_en_ms INTEGER NOT NULL,
      finalizado_en_ms INTEGER,
      duracion_segundos INTEGER,
      nota TEXT,
      payload_json TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'local_only',
      actualizado_en TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_offline_tiempo_empresa_usuario
      ON offline_registros_tiempo (empresa_id, usuario_id, iniciado_en_ms DESC);

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY NOT NULL,
      empresa_id TEXT NOT NULL,
      usuario_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      local_asset_uri TEXT,
      idempotency_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      retry_count INTEGER NOT NULL DEFAULT 0,
      next_retry_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sync_outbox_pending
      ON sync_outbox (status, empresa_id, created_at ASC);
  `);

  // Si el SO cerró la app a mitad de una sincronización, devolvemos ítems 'processing' a 'pending'
  await db.runAsync(
    `UPDATE sync_outbox SET status = 'pending', updated_at = ? WHERE status = 'processing';`,
    [new Date().toISOString()],
  );
}

/**
 * Abre e inicializa de forma perezosa la base SQLite operativa (`vittkly_offline_ops.db`).
 * En Web o entornos sin SQLite nativo retorna `null` para activar el fallback en memoria.
 */
export async function getOfflineOpsDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(OPS_DB_NAME);
        await initializeSchema(db);
        dbInstance = db;
        return db;
      } catch {
        return null;
      } finally {
        initPromise = null;
      }
    })();
  }

  return initPromise;
}

/**
 * Ejecuta una operación atómica en SQLite cuando está disponible, o sobre el store en memoria.
 */
export async function withOfflineDbTransaction<T>(
  work: (db: SQLite.SQLiteDatabase | null, mem: OfflineMemoryStore) => Promise<T>,
): Promise<T> {
  const db = await getOfflineOpsDb();
  if (!db) {
    return work(null, memoryStore);
  }

  let result!: T;
  await db.withExclusiveTransactionAsync(async (txn) => {
    result = await work(txn, memoryStore);
  });
  return result;
}

export function getOfflineMemoryStore(): OfflineMemoryStore {
  return memoryStore;
}

export function resetOfflineOpsMemoryStoreForTests(): void {
  memoryStore.clientes.clear();
  memoryStore.ordenes.clear();
  memoryStore.plantillas.clear();
  memoryStore.respuestas.clear();
  memoryStore.evidencias.clear();
  memoryStore.registrosTiempo.clear();
  memoryStore.outbox = [];
  memoryStore.lastSyncedAt = null;
}

/**
 * Genera un UUID v4 válido para identificadores idempotentes creados sin conexión.
 */
export function createOfflineUuid(): string {
  const randomUuidFn = globalThis.crypto?.randomUUID;
  if (typeof randomUuidFn === 'function') {
    return randomUuidFn.call(globalThis.crypto);
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const val = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return val.toString(16);
  });
}
