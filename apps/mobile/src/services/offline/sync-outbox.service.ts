import NetInfo from '@react-native-community/netinfo';

import { isNetworkOffline } from '@/features/auth/context/auth-state';
import { supabase } from '@/services/supabase';

import { offlineCacheRepository } from './offline-cache.repository';
import { getOfflineMemoryStore } from './offline-db';
import {
  notifyOutboxChanged,
  offlineOutboxStore,
  subscribeOutboxUpdates,
} from './offline-outbox.store';
import type {
  EvidenceUploadPayload,
  FormUpsertResponsePayload,
  OrderMarkPaidPayload,
  OrderUpdateStatusPayload,
  OrderValidatePayload,
  SyncOutboxItem,
  TimeStartEntryPayload,
  TimeStopEntryPayload,
} from './offline.types';

const EVIDENCIAS_BUCKET = 'evidencias-campo';
const MAX_RETRY_ATTEMPTS = 6;
const BASE_BACKOFF_MS = 5_000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;
const PERMANENT_PG_ERROR_CODES = new Set(['42501', '23503', '23514', '22P02', '42P01', 'PGRST116']);

let activeFlushPromise: Promise<number> | null = null;
let isSyncingFlag = false;
let lastSyncedAtIso: string | null = null;

function isPermanentError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = (err as { code?: unknown }).code;
  if (typeof code === 'string' && PERMANENT_PG_ERROR_CODES.has(code)) {
    return true;
  }
  const status = (err as { status?: unknown }).status;
  return (
    typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429
  );
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  return 'Error al sincronizar con el servidor';
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64ToBytes(base64: string): Uint8Array {
  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(base64.replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  const cleaned = base64.replace(/\s+/g, '').replace(/=+$/g, '');
  const outLength = Math.floor((cleaned.length * 3) / 4);
  const bytes = new Uint8Array(outLength);
  let byteIndex = 0;

  for (let i = 0; i < cleaned.length; i += 4) {
    const a = BASE64_ALPHABET.indexOf(cleaned[i] ?? 'A');
    const b = BASE64_ALPHABET.indexOf(cleaned[i + 1] ?? 'A');
    const c = i + 2 < cleaned.length ? BASE64_ALPHABET.indexOf(cleaned[i + 2] ?? 'A') : 0;
    const d = i + 3 < cleaned.length ? BASE64_ALPHABET.indexOf(cleaned[i + 3] ?? 'A') : 0;
    const triple = (a << 18) | (b << 12) | (c << 6) | d;

    if (byteIndex < outLength) bytes[byteIndex++] = (triple >> 16) & 0xff;
    if (byteIndex < outLength) bytes[byteIndex++] = (triple >> 8) & 0xff;
    if (byteIndex < outLength) bytes[byteIndex++] = triple & 0xff;
  }

  return bytes;
}

async function readLocalAssetBytes(localUri: string): Promise<Uint8Array> {
  if (localUri.startsWith('data:')) {
    const commaIdx = localUri.indexOf(',');
    if (commaIdx === -1) {
      throw new Error('URI data inválida para subir evidencia');
    }
    const header = localUri.slice(0, commaIdx);
    const body = localUri.slice(commaIdx + 1);
    if (header.includes(';base64')) {
      return decodeBase64ToBytes(body);
    }
    return new TextEncoder().encode(decodeURIComponent(body));
  }

  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error(`No se pudo leer archivo local (${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function executeOutboxItem(item: SyncOutboxItem): Promise<void> {
  switch (item.operation) {
    case 'order.update_status': {
      const payload = item.payload as OrderUpdateStatusPayload;
      const updateBody: {
        estado: OrderUpdateStatusPayload['estado'];
        en_ruta_eta_min?: number | null;
        iniciado_en?: string | null;
        completado_en?: string | null;
      } = {
        estado: payload.estado,
      };
      if (payload.en_ruta_eta_min !== undefined)
        updateBody.en_ruta_eta_min = payload.en_ruta_eta_min;
      if (payload.iniciado_en !== undefined) updateBody.iniciado_en = payload.iniciado_en;
      if (payload.completado_en !== undefined) updateBody.completado_en = payload.completado_en;

      const { error } = await supabase
        .from('ordenes_trabajo')
        .update(updateBody)
        .eq('id', payload.orden_id)
        .eq('empresa_id', item.empresa_id);
      if (error) throw error;
      return;
    }

    case 'order.mark_paid': {
      const payload = item.payload as OrderMarkPaidPayload;
      const { error } = await supabase
        .from('ordenes_trabajo')
        .update({
          estado: 'pagada',
          metodo_pago: payload.metodo_pago,
          pagado_en: payload.pagado_en,
        })
        .eq('id', payload.orden_id)
        .eq('empresa_id', item.empresa_id);
      if (error) throw error;
      return;
    }

    case 'order.validate': {
      const payload = item.payload as OrderValidatePayload;
      const { error } = await supabase
        .from('ordenes_trabajo')
        .update({
          estado_validacion: payload.estado_validacion,
          validado_por: payload.validado_por,
          validado_en: payload.validado_en,
          observacion_validacion: payload.observacion_validacion ?? null,
        })
        .eq('id', payload.orden_id)
        .eq('empresa_id', item.empresa_id);
      if (error) throw error;
      return;
    }

    case 'form.upsert_response': {
      const payload = item.payload as FormUpsertResponsePayload;
      const { error } = await supabase.from('respuestas_formulario').upsert(
        {
          id: payload.id,
          empresa_id: payload.empresa_id,
          orden_trabajo_id: payload.orden_trabajo_id,
          plantilla_id: payload.plantilla_id,
          usuario_id: payload.usuario_id,
          estado: payload.estado,
          paso_actual: payload.paso_actual,
          respuestas: payload.respuestas,
          firma_inicio_path: payload.firma_inicio_path,
          firma_inicio_en: payload.firma_inicio_en,
          firma_conformidad_path: payload.firma_conformidad_path,
          firma_conformidad_en: payload.firma_conformidad_en,
          nombre_firmante: payload.nombre_firmante,
          calificacion_csat: payload.calificacion_csat,
          nps_score: payload.nps_score,
          encuesta_omitida: payload.encuesta_omitida,
          completado_en: payload.completado_en,
        },
        { onConflict: 'orden_trabajo_id' },
      );
      if (error) throw error;
      return;
    }

    case 'evidence.upload': {
      const payload = item.payload as EvidenceUploadPayload;
      const localUri = item.local_asset_uri ?? payload.local_uri;
      if (localUri) {
        const bytes = await readLocalAssetBytes(localUri);
        const { error: uploadError } = await supabase.storage
          .from(EVIDENCIAS_BUCKET)
          .upload(payload.storage_path, bytes, {
            contentType: payload.mime_type || 'image/jpeg',
            upsert: true,
          });
        if (uploadError) throw uploadError;
      }

      const { error: dbError } = await supabase.from('evidencias_orden').upsert(
        {
          id: payload.evidencia_id,
          empresa_id: payload.empresa_id,
          orden_trabajo_id: payload.orden_trabajo_id,
          usuario_id: payload.usuario_id,
          tipo: payload.tipo,
          item_codigo: payload.item_codigo,
          storage_path: payload.storage_path,
          nota: payload.nota,
          creado_en: payload.creado_en,
        },
        { onConflict: 'id' },
      );
      if (dbError) throw dbError;
      await offlineCacheRepository.markEvidenciaSyncStatus(payload.evidencia_id, 'synced');
      return;
    }

    case 'time.start_entry': {
      const payload = item.payload as TimeStartEntryPayload;
      const { error } = await supabase.from('registros_tiempo').upsert(
        {
          id: payload.registro_id,
          empresa_id: payload.empresa_id,
          usuario_id: payload.usuario_id,
          orden_trabajo_id: payload.orden_trabajo_id,
          tipo: payload.tipo,
          iniciado_en: payload.iniciado_en,
          nota: payload.nota,
        },
        { onConflict: 'id' },
      );
      if (error) throw error;
      return;
    }

    case 'time.stop_entry': {
      const payload = item.payload as TimeStopEntryPayload;
      const updateBody: {
        finalizado_en: string;
        duracion_segundos: number;
        nota?: string | null;
      } = {
        finalizado_en: payload.finalizado_en,
        duracion_segundos: payload.duracion_segundos,
      };
      if (payload.nota !== undefined) {
        updateBody.nota = payload.nota;
      }

      const { error } = await supabase
        .from('registros_tiempo')
        .update(updateBody)
        .eq('id', payload.registro_id)
        .eq('empresa_id', item.empresa_id);
      if (error) throw error;
      return;
    }
  }
}

export const syncOutboxService = {
  isSyncing(): boolean {
    return isSyncingFlag;
  },

  getLastSyncedAt(): string | null {
    return lastSyncedAtIso ?? getOfflineMemoryStore().lastSyncedAt;
  },

  subscribe(listener: () => void): () => void {
    return subscribeOutboxUpdates(listener);
  },

  async getCounts(empresaId?: string | null) {
    return offlineOutboxStore.getCounts(empresaId);
  },

  async retryFailed(empresaId?: string | null): Promise<number> {
    const requeued = await offlineOutboxStore.requeueFailed(empresaId);
    if (requeued > 0) {
      await this.flushOutbox(empresaId);
    }
    return requeued;
  },

  /**
   * Procesa en orden FIFO todas las mutaciones elegibles de `sync_outbox`.
   * Requiere conexión de red activa y sesión autenticada en Supabase.
   */
  async flushOutbox(empresaId?: string | null): Promise<number> {
    if (activeFlushPromise) {
      return activeFlushPromise;
    }

    activeFlushPromise = (async () => {
      const netState = await NetInfo.fetch();
      if (isNetworkOffline(netState)) {
        return 0;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return 0;
      }

      const items = await offlineOutboxStore.listReadyForSync(empresaId);
      if (items.length === 0) {
        return 0;
      }

      isSyncingFlag = true;
      notifyOutboxChanged();
      let processedCount = 0;

      try {
        for (const item of items) {
          const currentNet = await NetInfo.fetch();
          if (isNetworkOffline(currentNet)) {
            break;
          }

          await offlineOutboxStore.markProcessing(item.id);
          try {
            await executeOutboxItem(item);
            await offlineOutboxStore.markCompleted(item.id);
            processedCount += 1;
            lastSyncedAtIso = new Date().toISOString();
            getOfflineMemoryStore().lastSyncedAt = lastSyncedAtIso;
          } catch (err) {
            const nextRetryCount = item.retry_count + 1;
            const failed = isPermanentError(err) || nextRetryCount >= MAX_RETRY_ATTEMPTS;
            const backoffMs = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** item.retry_count);
            const nextRetryAt = failed ? null : new Date(Date.now() + backoffMs).toISOString();

            if (item.operation === 'evidence.upload' && failed) {
              const evPayload = item.payload as EvidenceUploadPayload;
              await offlineCacheRepository.markEvidenciaSyncStatus(evPayload.evidencia_id, 'error');
            }

            await offlineOutboxStore.markRetryOrFailed({
              id: item.id,
              retryCount: nextRetryCount,
              nextRetryAt,
              failed,
              errorMessage: getErrorMessage(err),
            });
          }
        }
      } finally {
        isSyncingFlag = false;
        activeFlushPromise = null;
        notifyOutboxChanged();
      }

      return processedCount;
    })();

    return activeFlushPromise;
  },
};
