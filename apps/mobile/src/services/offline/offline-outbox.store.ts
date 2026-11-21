import type * as SQLite from 'expo-sqlite';

import {
  createOfflineUuid,
  getOfflineMemoryStore,
  getOfflineOpsDb,
  type OfflineMemoryStore,
} from './offline-db';
import type {
  OutboxEntityType,
  OutboxOperation,
  OutboxPayloadByOperation,
  OutboxStatus,
  SyncOutboxItem,
} from './offline.types';

interface OutboxRow {
  id: string;
  empresa_id: string;
  usuario_id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  payload_json: string;
  local_asset_uri: string | null;
  idempotency_key: string;
  status: string;
  retry_count: number;
  next_retry_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

interface OutboxCountRow {
  pending_count: number;
  failed_count: number;
}

type OutboxListener = () => void;
const listeners = new Set<OutboxListener>();

export function subscribeOutboxUpdates(listener: OutboxListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyOutboxChanged(): void {
  for (const listener of listeners) {
    listener();
  }
}

function mapOutboxRow(row: OutboxRow): SyncOutboxItem {
  const operation = row.operation as OutboxOperation;
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    usuario_id: row.usuario_id,
    entity_type: row.entity_type as OutboxEntityType,
    entity_id: row.entity_id,
    operation,
    payload: JSON.parse(row.payload_json) as OutboxPayloadByOperation[typeof operation],
    local_asset_uri: row.local_asset_uri,
    idempotency_key: row.idempotency_key,
    status: row.status as OutboxStatus,
    retry_count: row.retry_count,
    next_retry_at: row.next_retry_at,
    last_error: row.last_error,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export interface EnqueueOutboxParams<O extends OutboxOperation> {
  empresaId: string;
  usuarioId: string;
  entityType: OutboxEntityType;
  entityId: string;
  operation: O;
  payload: OutboxPayloadByOperation[O];
  localAssetUri?: string | null;
  idempotencyKey?: string;
}

/**
 * Inserta una mutación pendiente dentro de la transacción activa (`db` o memoria).
 */
export async function insertOutboxItemInTxn<O extends OutboxOperation>(
  db: SQLite.SQLiteDatabase | null,
  mem: OfflineMemoryStore,
  params: EnqueueOutboxParams<O>,
): Promise<SyncOutboxItem<O>> {
  const nowIso = new Date().toISOString();
  const id = createOfflineUuid();
  const item: SyncOutboxItem<O> = {
    id,
    empresa_id: params.empresaId,
    usuario_id: params.usuarioId,
    entity_type: params.entityType,
    entity_id: params.entityId,
    operation: params.operation,
    payload: params.payload,
    local_asset_uri: params.localAssetUri ?? null,
    idempotency_key: params.idempotencyKey ?? `${params.operation}:${params.entityId}:${id}`,
    status: 'pending',
    retry_count: 0,
    next_retry_at: null,
    last_error: null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  if (db) {
    await db.runAsync(
      `INSERT INTO sync_outbox (
        id, empresa_id, usuario_id, entity_type, entity_id, operation,
        payload_json, local_asset_uri, idempotency_key, status,
        retry_count, next_retry_at, last_error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        item.id,
        item.empresa_id,
        item.usuario_id,
        item.entity_type,
        item.entity_id,
        item.operation,
        JSON.stringify(item.payload),
        item.local_asset_uri,
        item.idempotency_key,
        item.status,
        item.retry_count,
        item.next_retry_at,
        item.last_error,
        item.created_at,
        item.updated_at,
      ],
    );
  } else {
    mem.outbox.push(item);
  }

  return item;
}

export const offlineOutboxStore = {
  async getCounts(empresaId?: string | null): Promise<{
    pendingCount: number;
    failedCount: number;
    totalUnsyncedCount: number;
  }> {
    const db = await getOfflineOpsDb();
    if (!db) {
      const mem = getOfflineMemoryStore();
      const filtered = empresaId
        ? mem.outbox.filter((item) => item.empresa_id === empresaId)
        : mem.outbox;
      const pendingCount = filtered.filter(
        (item) => item.status === 'pending' || item.status === 'processing',
      ).length;
      const failedCount = filtered.filter((item) => item.status === 'failed').length;
      return {
        pendingCount,
        failedCount,
        totalUnsyncedCount: pendingCount + failedCount,
      };
    }

    const row = empresaId
      ? await db.getFirstAsync<OutboxCountRow>(
          `SELECT
            COALESCE(SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END), 0) AS pending_count,
            COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) AS failed_count
          FROM sync_outbox
          WHERE empresa_id = ?;`,
          [empresaId],
        )
      : await db.getFirstAsync<OutboxCountRow>(
          `SELECT
            COALESCE(SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END), 0) AS pending_count,
            COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) AS failed_count
          FROM sync_outbox;`,
        );

    const pendingCount = row?.pending_count ?? 0;
    const failedCount = row?.failed_count ?? 0;
    return {
      pendingCount,
      failedCount,
      totalUnsyncedCount: pendingCount + failedCount,
    };
  },

  async listReadyForSync(empresaId?: string | null): Promise<SyncOutboxItem[]> {
    const nowIso = new Date().toISOString();
    const db = await getOfflineOpsDb();
    if (!db) {
      const mem = getOfflineMemoryStore();
      return mem.outbox
        .filter((item) => {
          if (empresaId && item.empresa_id !== empresaId) return false;
          if (item.status !== 'pending') return false;
          return !item.next_retry_at || item.next_retry_at <= nowIso;
        })
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
    }

    const rows = empresaId
      ? await db.getAllAsync<OutboxRow>(
          `SELECT * FROM sync_outbox
           WHERE empresa_id = ?
             AND status = 'pending'
             AND (next_retry_at IS NULL OR next_retry_at <= ?)
           ORDER BY created_at ASC;`,
          [empresaId, nowIso],
        )
      : await db.getAllAsync<OutboxRow>(
          `SELECT * FROM sync_outbox
           WHERE status = 'pending'
             AND (next_retry_at IS NULL OR next_retry_at <= ?)
           ORDER BY created_at ASC;`,
          [nowIso],
        );

    return rows.map(mapOutboxRow);
  },

  async hasPendingForEntity(entityType: OutboxEntityType, entityId: string): Promise<boolean> {
    const db = await getOfflineOpsDb();
    if (!db) {
      const mem = getOfflineMemoryStore();
      return mem.outbox.some(
        (item) => item.entity_type === entityType && item.entity_id === entityId,
      );
    }

    const row = await db.getFirstAsync<{ found: number }>(
      `SELECT 1 AS found FROM sync_outbox WHERE entity_type = ? AND entity_id = ? LIMIT 1;`,
      [entityType, entityId],
    );
    return Boolean(row?.found);
  },

  async markProcessing(id: string): Promise<void> {
    const nowIso = new Date().toISOString();
    const db = await getOfflineOpsDb();
    if (!db) {
      const item = getOfflineMemoryStore().outbox.find((entry) => entry.id === id);
      if (item) {
        item.status = 'processing';
        item.updated_at = nowIso;
      }
      notifyOutboxChanged();
      return;
    }

    await db.runAsync(
      `UPDATE sync_outbox SET status = 'processing', updated_at = ? WHERE id = ?;`,
      [nowIso, id],
    );
    notifyOutboxChanged();
  },

  async markCompleted(id: string): Promise<void> {
    const db = await getOfflineOpsDb();
    if (!db) {
      const mem = getOfflineMemoryStore();
      mem.outbox = mem.outbox.filter((entry) => entry.id !== id);
      notifyOutboxChanged();
      return;
    }

    await db.runAsync(`DELETE FROM sync_outbox WHERE id = ?;`, [id]);
    notifyOutboxChanged();
  },

  async markRetryOrFailed(params: {
    id: string;
    retryCount: number;
    nextRetryAt: string | null;
    failed: boolean;
    errorMessage: string;
  }): Promise<void> {
    const nowIso = new Date().toISOString();
    const nextStatus: OutboxStatus = params.failed ? 'failed' : 'pending';
    const db = await getOfflineOpsDb();
    if (!db) {
      const item = getOfflineMemoryStore().outbox.find((entry) => entry.id === params.id);
      if (item) {
        item.status = nextStatus;
        item.retry_count = params.retryCount;
        item.next_retry_at = params.nextRetryAt;
        item.last_error = params.errorMessage;
        item.updated_at = nowIso;
      }
      notifyOutboxChanged();
      return;
    }

    await db.runAsync(
      `UPDATE sync_outbox
       SET status = ?, retry_count = ?, next_retry_at = ?, last_error = ?, updated_at = ?
       WHERE id = ?;`,
      [nextStatus, params.retryCount, params.nextRetryAt, params.errorMessage, nowIso, params.id],
    );
    notifyOutboxChanged();
  },

  async requeueFailed(empresaId?: string | null): Promise<number> {
    const nowIso = new Date().toISOString();
    const db = await getOfflineOpsDb();
    if (!db) {
      let count = 0;
      for (const item of getOfflineMemoryStore().outbox) {
        if (item.status === 'failed' && (!empresaId || item.empresa_id === empresaId)) {
          item.status = 'pending';
          item.retry_count = 0;
          item.next_retry_at = null;
          item.last_error = null;
          item.updated_at = nowIso;
          count += 1;
        }
      }
      if (count > 0) notifyOutboxChanged();
      return count;
    }

    const res = empresaId
      ? await db.runAsync(
          `UPDATE sync_outbox
           SET status = 'pending', retry_count = 0, next_retry_at = NULL, last_error = NULL, updated_at = ?
           WHERE status = 'failed' AND empresa_id = ?;`,
          [nowIso, empresaId],
        )
      : await db.runAsync(
          `UPDATE sync_outbox
           SET status = 'pending', retry_count = 0, next_retry_at = NULL, last_error = NULL, updated_at = ?
           WHERE status = 'failed';`,
          [nowIso],
        );

    if (res.changes > 0) notifyOutboxChanged();
    return res.changes;
  },
};
