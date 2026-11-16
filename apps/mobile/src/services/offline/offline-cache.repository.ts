import {
  createOfflineUuid,
  getOfflineMemoryStore,
  getOfflineOpsDb,
  withOfflineDbTransaction,
} from './offline-db';
import { insertOutboxItemInTxn, notifyOutboxChanged } from './offline-outbox.store';
import type {
  CachedCliente,
  CachedEvidenciaOrden,
  CachedOrdenTrabajo,
  CachedPlantillaFormulario,
  CachedRegistroTiempo,
  CachedRespuestaFormulario,
  EvidenciaTipo,
  LocalSyncStatus,
  OrdenEstado,
  OrdenEstadoValidacion,
  OrdenMetodoPago,
  RegistroTiempoRow,
  RegistroTiempoTipo,
} from './offline.types';

interface JsonPayloadRow {
  id: string;
  payload_json: string;
  sync_status?: string;
}

export const offlineCacheRepository = {
  /**
   * Almacena órdenes de trabajo y clientes asociados para una empresa sin pisar
   * órdenes locales que aún tienen cambios pendientes en `sync_outbox`.
   */
  async saveOrdersSnapshot(
    empresaId: string,
    orders: CachedOrdenTrabajo[],
    clientes: CachedCliente[] = [],
  ): Promise<void> {
    await withOfflineDbTransaction(async (db, mem) => {
      const nowIso = new Date().toISOString();

      for (const cliente of clientes) {
        if (cliente.empresa_id !== empresaId) continue;
        if (db) {
          await db.runAsync(
            `INSERT OR REPLACE INTO offline_clientes (id, empresa_id, payload_json, actualizado_en)
             VALUES (?, ?, ?, ?);`,
            [cliente.id, empresaId, JSON.stringify(cliente), cliente.actualizado_en || nowIso],
          );
        } else {
          mem.clientes.set(cliente.id, cliente);
        }
      }

      if (db) {
        const pendingOrderIds = await db.getAllAsync<{ entity_id: string }>(
          `SELECT DISTINCT entity_id FROM sync_outbox
           WHERE empresa_id = ? AND entity_type = 'ordenes_trabajo';`,
          [empresaId],
        );
        const lockedIds = new Set(pendingOrderIds.map((r) => r.entity_id));

        for (const order of orders) {
          if (order.empresa_id !== empresaId || lockedIds.has(order.id)) continue;
          await db.runAsync(
            `INSERT OR REPLACE INTO offline_ordenes_trabajo (
              id, empresa_id, tecnico_id, fecha_programada, estado, payload_json, actualizado_en
            ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
              order.id,
              empresaId,
              order.tecnico_id,
              order.fecha_programada,
              order.estado,
              JSON.stringify(order),
              order.actualizado_en || nowIso,
            ],
          );
        }
      } else {
        const lockedIds = new Set(
          mem.outbox
            .filter(
              (item) => item.empresa_id === empresaId && item.entity_type === 'ordenes_trabajo',
            )
            .map((item) => item.entity_id),
        );
        for (const order of orders) {
          if (order.empresa_id === empresaId && !lockedIds.has(order.id)) {
            mem.ordenes.set(order.id, order);
          }
        }
      }
    });
  },

  async getCachedOrders(
    empresaId: string,
    filters?: { fechaProgramada?: string; tecnicoId?: string },
  ): Promise<CachedOrdenTrabajo[]> {
    const db = await getOfflineOpsDb();
    if (!db) {
      const items = Array.from(getOfflineMemoryStore().ordenes.values()).filter((item) => {
        if (item.empresa_id !== empresaId) return false;
        if (filters?.fechaProgramada && item.fecha_programada !== filters.fechaProgramada) {
          return false;
        }
        if (filters?.tecnicoId && item.tecnico_id !== filters.tecnicoId) return false;
        return true;
      });
      return items.sort((a, b) =>
        (a.hora_inicio_estimada ?? '99:99').localeCompare(b.hora_inicio_estimada ?? '99:99'),
      );
    }

    const clauses = ['empresa_id = ?'];
    const params: (string | number)[] = [empresaId];
    if (filters?.fechaProgramada) {
      clauses.push('fecha_programada = ?');
      params.push(filters.fechaProgramada);
    }
    if (filters?.tecnicoId) {
      clauses.push('tecnico_id = ?');
      params.push(filters.tecnicoId);
    }

    const rows = await db.getAllAsync<JsonPayloadRow>(
      `SELECT id, payload_json FROM offline_ordenes_trabajo WHERE ${clauses.join(' AND ')};`,
      params,
    );
    return rows
      .map((row) => JSON.parse(row.payload_json) as CachedOrdenTrabajo)
      .sort((a, b) =>
        (a.hora_inicio_estimada ?? '99:99').localeCompare(b.hora_inicio_estimada ?? '99:99'),
      );
  },

  async saveClientesSnapshot(empresaId: string, clientes: CachedCliente[]): Promise<void> {
    await withOfflineDbTransaction(async (db, mem) => {
      for (const cliente of clientes) {
        if (cliente.empresa_id !== empresaId) continue;
        if (db) {
          await db.runAsync(
            `INSERT OR REPLACE INTO offline_clientes (id, empresa_id, payload_json, actualizado_en)
             VALUES (?, ?, ?, ?);`,
            [cliente.id, empresaId, JSON.stringify(cliente), cliente.actualizado_en],
          );
        } else {
          mem.clientes.set(cliente.id, cliente);
        }
      }
    });
  },

  async getCachedClientes(empresaId: string): Promise<CachedCliente[]> {
    const db = await getOfflineOpsDb();
    if (!db) {
      return Array.from(getOfflineMemoryStore().clientes.values())
        .filter((c) => c.empresa_id === empresaId && c.activo)
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
    }

    const rows = await db.getAllAsync<JsonPayloadRow>(
      `SELECT id, payload_json FROM offline_clientes WHERE empresa_id = ?;`,
      [empresaId],
    );
    return rows
      .map((r) => JSON.parse(r.payload_json) as CachedCliente)
      .filter((c) => c.activo)
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
  },

  async savePlantillasSnapshot(
    empresaId: string,
    plantillas: CachedPlantillaFormulario[],
  ): Promise<void> {
    await withOfflineDbTransaction(async (db, mem) => {
      for (const tpl of plantillas) {
        if (tpl.empresa_id !== empresaId) continue;
        if (db) {
          await db.runAsync(
            `INSERT OR REPLACE INTO offline_plantillas_formulario (
              id, empresa_id, tipo, activa, payload_json, actualizado_en
            ) VALUES (?, ?, ?, ?, ?, ?);`,
            [
              tpl.id,
              empresaId,
              tpl.tipo,
              tpl.activa ? 1 : 0,
              JSON.stringify(tpl),
              tpl.actualizado_en,
            ],
          );
        } else {
          mem.plantillas.set(tpl.id, tpl);
        }
      }
    });
  },

  async getCachedPlantillas(
    empresaId: string,
    tipo?: CachedPlantillaFormulario['tipo'],
  ): Promise<CachedPlantillaFormulario[]> {
    const db = await getOfflineOpsDb();
    if (!db) {
      return Array.from(getOfflineMemoryStore().plantillas.values()).filter(
        (t) => t.empresa_id === empresaId && t.activa && (!tipo || t.tipo === tipo),
      );
    }

    const rows = tipo
      ? await db.getAllAsync<JsonPayloadRow>(
          `SELECT id, payload_json FROM offline_plantillas_formulario
           WHERE empresa_id = ? AND activa = 1 AND tipo = ?;`,
          [empresaId, tipo],
        )
      : await db.getAllAsync<JsonPayloadRow>(
          `SELECT id, payload_json FROM offline_plantillas_formulario
           WHERE empresa_id = ? AND activa = 1;`,
          [empresaId],
        );

    return rows.map((r) => JSON.parse(r.payload_json) as CachedPlantillaFormulario);
  },

  async updateOrderStatusAndEnqueue(params: {
    empresaId: string;
    usuarioId: string;
    ordenId: string;
    estado: OrdenEstado;
    enRutaEtaMin?: number | null;
    iniciadoEn?: string | null;
    completadoEn?: string | null;
  }): Promise<CachedOrdenTrabajo | null> {
    const updated = await withOfflineDbTransaction(async (db, mem) => {
      const nowIso = new Date().toISOString();
      let current: CachedOrdenTrabajo | null = null;

      if (db) {
        const row = await db.getFirstAsync<JsonPayloadRow>(
          `SELECT id, payload_json FROM offline_ordenes_trabajo WHERE id = ? AND empresa_id = ?;`,
          [params.ordenId, params.empresaId],
        );
        current = row ? (JSON.parse(row.payload_json) as CachedOrdenTrabajo) : null;
      } else {
        const found = mem.ordenes.get(params.ordenId);
        current = found && found.empresa_id === params.empresaId ? found : null;
      }

      if (current) {
        current = {
          ...current,
          estado: params.estado,
          en_ruta_eta_min:
            params.enRutaEtaMin !== undefined ? params.enRutaEtaMin : current.en_ruta_eta_min,
          iniciado_en: params.iniciadoEn !== undefined ? params.iniciadoEn : current.iniciado_en,
          completado_en:
            params.completadoEn !== undefined ? params.completadoEn : current.completado_en,
          actualizado_en: nowIso,
        };

        if (db) {
          await db.runAsync(
            `UPDATE offline_ordenes_trabajo
             SET estado = ?, payload_json = ?, actualizado_en = ?
             WHERE id = ? AND empresa_id = ?;`,
            [current.estado, JSON.stringify(current), nowIso, current.id, params.empresaId],
          );
        } else {
          mem.ordenes.set(current.id, current);
        }
      }

      await insertOutboxItemInTxn(db, mem, {
        empresaId: params.empresaId,
        usuarioId: params.usuarioId,
        entityType: 'ordenes_trabajo',
        entityId: params.ordenId,
        operation: 'order.update_status',
        payload: {
          orden_id: params.ordenId,
          estado: params.estado,
          en_ruta_eta_min: params.enRutaEtaMin,
          iniciado_en: params.iniciadoEn,
          completado_en: params.completadoEn,
        },
      });

      return current;
    });

    notifyOutboxChanged();
    return updated;
  },

  async markOrderPaidAndEnqueue(params: {
    empresaId: string;
    usuarioId: string;
    ordenId: string;
    metodoPago: Exclude<OrdenMetodoPago, 'pendiente'>;
    pagadoEn?: string;
  }): Promise<void> {
    const pagadoEn = params.pagadoEn ?? new Date().toISOString();
    await withOfflineDbTransaction(async (db, mem) => {
      if (db) {
        const row = await db.getFirstAsync<JsonPayloadRow>(
          `SELECT id, payload_json FROM offline_ordenes_trabajo WHERE id = ? AND empresa_id = ?;`,
          [params.ordenId, params.empresaId],
        );
        if (row) {
          const current = JSON.parse(row.payload_json) as CachedOrdenTrabajo;
          const next: CachedOrdenTrabajo = {
            ...current,
            estado: 'pagada',
            metodo_pago: params.metodoPago,
            pagado_en: pagadoEn,
            actualizado_en: pagadoEn,
          };
          await db.runAsync(
            `UPDATE offline_ordenes_trabajo
             SET estado = 'pagada', payload_json = ?, actualizado_en = ?
             WHERE id = ? AND empresa_id = ?;`,
            [JSON.stringify(next), pagadoEn, next.id, params.empresaId],
          );
        }
      } else {
        const found = mem.ordenes.get(params.ordenId);
        if (found && found.empresa_id === params.empresaId) {
          mem.ordenes.set(params.ordenId, {
            ...found,
            estado: 'pagada',
            metodo_pago: params.metodoPago,
            pagado_en: pagadoEn,
            actualizado_en: pagadoEn,
          });
        }
      }

      await insertOutboxItemInTxn(db, mem, {
        empresaId: params.empresaId,
        usuarioId: params.usuarioId,
        entityType: 'ordenes_trabajo',
        entityId: params.ordenId,
        operation: 'order.mark_paid',
        payload: {
          orden_id: params.ordenId,
          metodo_pago: params.metodoPago,
          pagado_en: pagadoEn,
        },
      });
    });

    notifyOutboxChanged();
  },

  async validateOrderAndEnqueue(params: {
    empresaId: string;
    usuarioId: string;
    ordenId: string;
    estadoValidacion: Exclude<OrdenEstadoValidacion, 'pendiente'>;
    observacionValidacion?: string | null;
  }): Promise<void> {
    const validadoEn = new Date().toISOString();
    await withOfflineDbTransaction(async (db, mem) => {
      if (db) {
        const row = await db.getFirstAsync<JsonPayloadRow>(
          `SELECT id, payload_json FROM offline_ordenes_trabajo WHERE id = ? AND empresa_id = ?;`,
          [params.ordenId, params.empresaId],
        );
        if (row) {
          const current = JSON.parse(row.payload_json) as CachedOrdenTrabajo;
          const next: CachedOrdenTrabajo = {
            ...current,
            estado_validacion: params.estadoValidacion,
            validado_por: params.usuarioId,
            validado_en: validadoEn,
            observacion_validacion: params.observacionValidacion ?? null,
            actualizado_en: validadoEn,
          };
          await db.runAsync(
            `UPDATE offline_ordenes_trabajo SET payload_json = ?, actualizado_en = ? WHERE id = ? AND empresa_id = ?;`,
            [JSON.stringify(next), validadoEn, next.id, params.empresaId],
          );
        }
      } else {
        const found = mem.ordenes.get(params.ordenId);
        if (found && found.empresa_id === params.empresaId) {
          mem.ordenes.set(params.ordenId, {
            ...found,
            estado_validacion: params.estadoValidacion,
            validado_por: params.usuarioId,
            validado_en: validadoEn,
            observacion_validacion: params.observacionValidacion ?? null,
            actualizado_en: validadoEn,
          });
        }
      }

      await insertOutboxItemInTxn(db, mem, {
        empresaId: params.empresaId,
        usuarioId: params.usuarioId,
        entityType: 'ordenes_trabajo',
        entityId: params.ordenId,
        operation: 'order.validate',
        payload: {
          orden_id: params.ordenId,
          estado_validacion: params.estadoValidacion,
          validado_por: params.usuarioId,
          validado_en: validadoEn,
          observacion_validacion: params.observacionValidacion ?? null,
        },
      });
    });

    notifyOutboxChanged();
  },

  async saveRespuestaAndEnqueue(
    respuesta: Omit<CachedRespuestaFormulario, 'sync_status'>,
  ): Promise<void> {
    const cached: CachedRespuestaFormulario = {
      ...respuesta,
      sync_status: 'pending_update',
    };

    await withOfflineDbTransaction(async (db, mem) => {
      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO offline_respuestas_formulario (
            id, empresa_id, orden_trabajo_id, estado, paso_actual, payload_json, sync_status, actualizado_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            cached.id,
            cached.empresa_id,
            cached.orden_trabajo_id,
            cached.estado,
            cached.paso_actual,
            JSON.stringify(cached),
            cached.sync_status,
            cached.actualizado_en,
          ],
        );
      } else {
        mem.respuestas.set(cached.orden_trabajo_id, cached);
      }

      await insertOutboxItemInTxn(db, mem, {
        empresaId: cached.empresa_id,
        usuarioId: cached.usuario_id,
        entityType: 'respuestas_formulario',
        entityId: cached.id,
        operation: 'form.upsert_response',
        payload: {
          id: cached.id,
          empresa_id: cached.empresa_id,
          orden_trabajo_id: cached.orden_trabajo_id,
          plantilla_id: cached.plantilla_id,
          usuario_id: cached.usuario_id,
          estado: cached.estado,
          paso_actual: cached.paso_actual,
          respuestas: cached.respuestas,
          firma_inicio_path: cached.firma_inicio_path,
          firma_inicio_en: cached.firma_inicio_en,
          firma_conformidad_path: cached.firma_conformidad_path,
          firma_conformidad_en: cached.firma_conformidad_en,
          nombre_firmante: cached.nombre_firmante,
          calificacion_csat: cached.calificacion_csat,
          nps_score: cached.nps_score,
          encuesta_omitida: cached.encuesta_omitida,
          completado_en: cached.completado_en,
        },
      });
    });

    notifyOutboxChanged();
  },

  async getCachedRespuesta(
    empresaId: string,
    ordenTrabajoId: string,
  ): Promise<CachedRespuestaFormulario | null> {
    const db = await getOfflineOpsDb();
    if (!db) {
      const entry = getOfflineMemoryStore().respuestas.get(ordenTrabajoId);
      return entry && entry.empresa_id === empresaId ? entry : null;
    }

    const row = await db.getFirstAsync<JsonPayloadRow>(
      `SELECT id, payload_json FROM offline_respuestas_formulario
       WHERE empresa_id = ? AND orden_trabajo_id = ?;`,
      [empresaId, ordenTrabajoId],
    );
    return row ? (JSON.parse(row.payload_json) as CachedRespuestaFormulario) : null;
  },

  async saveEvidenciaAndEnqueue(params: {
    empresaId: string;
    ordenTrabajoId: string;
    usuarioId: string;
    tipo: EvidenciaTipo;
    localUri: string;
    mimeType?: string;
    itemCodigo?: string | null;
    nota?: string | null;
    extension?: string;
  }): Promise<CachedEvidenciaOrden> {
    const id = createOfflineUuid();
    const nowIso = new Date().toISOString();
    const ext = params.extension ?? 'jpg';
    const storagePath = `${params.empresaId}/${params.ordenTrabajoId}/${params.tipo}_${id}.${ext}`;
    const cached: CachedEvidenciaOrden = {
      id,
      empresa_id: params.empresaId,
      orden_trabajo_id: params.ordenTrabajoId,
      usuario_id: params.usuarioId,
      tipo: params.tipo,
      item_codigo: params.itemCodigo ?? null,
      storage_path: storagePath,
      local_uri: params.localUri,
      nota: params.nota ?? null,
      creado_en: nowIso,
      sync_status: 'local_only',
    };

    await withOfflineDbTransaction(async (db, mem) => {
      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO offline_evidencias_locales (
            id, empresa_id, orden_trabajo_id, tipo, local_uri, storage_path, payload_json, sync_status, creado_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            cached.id,
            cached.empresa_id,
            cached.orden_trabajo_id,
            cached.tipo,
            cached.local_uri,
            cached.storage_path,
            JSON.stringify(cached),
            cached.sync_status,
            cached.creado_en,
          ],
        );
      } else {
        mem.evidencias.set(cached.id, cached);
      }

      await insertOutboxItemInTxn(db, mem, {
        empresaId: cached.empresa_id,
        usuarioId: cached.usuario_id,
        entityType: 'evidencias_orden',
        entityId: cached.id,
        operation: 'evidence.upload',
        localAssetUri: cached.local_uri,
        payload: {
          evidencia_id: cached.id,
          empresa_id: cached.empresa_id,
          orden_trabajo_id: cached.orden_trabajo_id,
          usuario_id: cached.usuario_id,
          tipo: cached.tipo,
          item_codigo: cached.item_codigo,
          storage_path: cached.storage_path,
          local_uri: cached.local_uri,
          mime_type: params.mimeType ?? 'image/jpeg',
          nota: cached.nota,
          creado_en: cached.creado_en,
        },
      });
    });

    notifyOutboxChanged();
    return cached;
  },

  async markEvidenciaSyncStatus(id: string, syncStatus: LocalSyncStatus): Promise<void> {
    const db = await getOfflineOpsDb();
    if (!db) {
      const found = getOfflineMemoryStore().evidencias.get(id);
      if (found) found.sync_status = syncStatus;
      return;
    }

    const row = await db.getFirstAsync<JsonPayloadRow>(
      `SELECT id, payload_json FROM offline_evidencias_locales WHERE id = ?;`,
      [id],
    );
    if (!row) return;
    const parsed = JSON.parse(row.payload_json) as CachedEvidenciaOrden;
    parsed.sync_status = syncStatus;
    await db.runAsync(
      `UPDATE offline_evidencias_locales SET sync_status = ?, payload_json = ? WHERE id = ?;`,
      [syncStatus, JSON.stringify(parsed), id],
    );
  },

  async getCachedEvidencias(
    empresaId: string,
    ordenTrabajoId: string,
  ): Promise<CachedEvidenciaOrden[]> {
    const db = await getOfflineOpsDb();
    if (!db) {
      return Array.from(getOfflineMemoryStore().evidencias.values())
        .filter((e) => e.empresa_id === empresaId && e.orden_trabajo_id === ordenTrabajoId)
        .sort((a, b) => a.creado_en.localeCompare(b.creado_en));
    }

    const rows = await db.getAllAsync<JsonPayloadRow>(
      `SELECT id, payload_json FROM offline_evidencias_locales
       WHERE empresa_id = ? AND orden_trabajo_id = ?
       ORDER BY creado_en ASC;`,
      [empresaId, ordenTrabajoId],
    );
    return rows.map((r) => JSON.parse(r.payload_json) as CachedEvidenciaOrden);
  },

  /**
   * Hidrata registros de tiempo desde el servidor respetando timers locales abiertos o sin sincronizar.
   */
  async hydrateServerTimeEntries(empresaId: string, entries: RegistroTiempoRow[]): Promise<void> {
    await withOfflineDbTransaction(async (db, mem) => {
      if (db) {
        const pendingRows = await db.getAllAsync<{ entity_id: string }>(
          `SELECT DISTINCT entity_id FROM sync_outbox
           WHERE empresa_id = ? AND entity_type = 'registros_tiempo';`,
          [empresaId],
        );
        const lockedIds = new Set(pendingRows.map((r) => r.entity_id));

        for (const row of entries) {
          if (row.empresa_id !== empresaId || lockedIds.has(row.id)) continue;
          const startMs = Date.parse(row.iniciado_en);
          const endMs = row.finalizado_en ? Date.parse(row.finalizado_en) : null;
          const cached: CachedRegistroTiempo = {
            ...row,
            iniciado_en_ms: Number.isFinite(startMs) ? startMs : Date.now(),
            finalizado_en_ms: endMs !== null && Number.isFinite(endMs) ? endMs : null,
            sync_status: 'synced',
          };
          await db.runAsync(
            `INSERT OR REPLACE INTO offline_registros_tiempo (
              id, empresa_id, usuario_id, orden_trabajo_id, tipo,
              iniciado_en_ms, finalizado_en_ms, duracion_segundos, nota,
              payload_json, sync_status, actualizado_en
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?);`,
            [
              cached.id,
              cached.empresa_id,
              cached.usuario_id,
              cached.orden_trabajo_id,
              cached.tipo,
              cached.iniciado_en_ms,
              cached.finalizado_en_ms,
              cached.duracion_segundos,
              cached.nota,
              JSON.stringify(cached),
              cached.actualizado_en,
            ],
          );
        }
      } else {
        const lockedIds = new Set(
          mem.outbox
            .filter(
              (item) => item.empresa_id === empresaId && item.entity_type === 'registros_tiempo',
            )
            .map((item) => item.entity_id),
        );
        for (const row of entries) {
          if (row.empresa_id !== empresaId || lockedIds.has(row.id)) continue;
          const startMs = Date.parse(row.iniciado_en);
          const endMs = row.finalizado_en ? Date.parse(row.finalizado_en) : null;
          mem.registrosTiempo.set(row.id, {
            ...row,
            iniciado_en_ms: Number.isFinite(startMs) ? startMs : Date.now(),
            finalizado_en_ms: endMs !== null && Number.isFinite(endMs) ? endMs : null,
            sync_status: 'synced',
          });
        }
      }
    });
  },

  /**
   * Inicia un tramo de tiempo persistiendo el timestamp real en milisegundos (`iniciado_en_ms`)
   * para recuperar cronómetros con precisión aunque el sistema operativo cierre la app.
   * Si se inicia una actividad distinta de `jornada`, cierra primero cualquier otra actividad abierta.
   */
  async startTimeEntryAndEnqueue(params: {
    empresaId: string;
    usuarioId: string;
    tipo: RegistroTiempoTipo;
    ordenTrabajoId?: string | null;
    nota?: string | null;
    startedAtMs?: number;
  }): Promise<CachedRegistroTiempo> {
    const startMs = params.startedAtMs ?? Date.now();
    const startIso = new Date(startMs).toISOString();
    const id = createOfflineUuid();

    const newEntry: CachedRegistroTiempo = {
      id,
      empresa_id: params.empresaId,
      usuario_id: params.usuarioId,
      orden_trabajo_id: params.ordenTrabajoId ?? null,
      tipo: params.tipo,
      iniciado_en: startIso,
      finalizado_en: null,
      duracion_segundos: null,
      nota: params.nota ?? null,
      creado_en: startIso,
      creado_por: params.usuarioId,
      actualizado_en: startIso,
      actualizado_por: params.usuarioId,
      iniciado_en_ms: startMs,
      finalizado_en_ms: null,
      sync_status: 'local_only',
    };

    await withOfflineDbTransaction(async (db, mem) => {
      // Cerrar tramo previo abierto si aplica para respetar índices parciales únicos del servidor
      const openRows = db
        ? await db.getAllAsync<JsonPayloadRow>(
            `SELECT id, payload_json FROM offline_registros_tiempo
             WHERE empresa_id = ? AND usuario_id = ? AND finalizado_en_ms IS NULL;`,
            [params.empresaId, params.usuarioId],
          )
        : Array.from(mem.registrosTiempo.values())
            .filter(
              (r) =>
                r.empresa_id === params.empresaId &&
                r.usuario_id === params.usuarioId &&
                r.finalizado_en_ms === null,
            )
            .map((r) => ({ id: r.id, payload_json: JSON.stringify(r) }));

      for (const openRow of openRows) {
        const parsed = JSON.parse(openRow.payload_json) as CachedRegistroTiempo;
        const shouldClose =
          params.tipo === 'jornada' ? parsed.tipo === 'jornada' : parsed.tipo !== 'jornada';
        if (!shouldClose) continue;

        const duracionSegundos = Math.max(0, Math.floor((startMs - parsed.iniciado_en_ms) / 1000));
        const closed: CachedRegistroTiempo = {
          ...parsed,
          finalizado_en: startIso,
          finalizado_en_ms: startMs,
          duracion_segundos: duracionSegundos,
          actualizado_en: startIso,
          sync_status: 'pending_update',
        };

        if (db) {
          await db.runAsync(
            `UPDATE offline_registros_tiempo
             SET finalizado_en_ms = ?, duracion_segundos = ?, payload_json = ?, sync_status = ?, actualizado_en = ?
             WHERE id = ?;`,
            [
              startMs,
              duracionSegundos,
              JSON.stringify(closed),
              closed.sync_status,
              startIso,
              closed.id,
            ],
          );
        } else {
          mem.registrosTiempo.set(closed.id, closed);
        }

        await insertOutboxItemInTxn(db, mem, {
          empresaId: params.empresaId,
          usuarioId: params.usuarioId,
          entityType: 'registros_tiempo',
          entityId: closed.id,
          operation: 'time.stop_entry',
          payload: {
            registro_id: closed.id,
            empresa_id: params.empresaId,
            finalizado_en: startIso,
            duracion_segundos: duracionSegundos,
            nota: closed.nota,
          },
        });
      }

      if (db) {
        await db.runAsync(
          `INSERT INTO offline_registros_tiempo (
            id, empresa_id, usuario_id, orden_trabajo_id, tipo,
            iniciado_en_ms, finalizado_en_ms, duracion_segundos, nota,
            payload_json, sync_status, actualizado_en
          ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, 'local_only', ?);`,
          [
            newEntry.id,
            newEntry.empresa_id,
            newEntry.usuario_id,
            newEntry.orden_trabajo_id,
            newEntry.tipo,
            newEntry.iniciado_en_ms,
            newEntry.nota,
            JSON.stringify(newEntry),
            startIso,
          ],
        );
      } else {
        mem.registrosTiempo.set(newEntry.id, newEntry);
      }

      await insertOutboxItemInTxn(db, mem, {
        empresaId: params.empresaId,
        usuarioId: params.usuarioId,
        entityType: 'registros_tiempo',
        entityId: newEntry.id,
        operation: 'time.start_entry',
        payload: {
          registro_id: newEntry.id,
          empresa_id: newEntry.empresa_id,
          usuario_id: newEntry.usuario_id,
          orden_trabajo_id: newEntry.orden_trabajo_id,
          tipo: newEntry.tipo,
          iniciado_en: startIso,
          nota: newEntry.nota,
        },
      });
    });

    notifyOutboxChanged();
    return newEntry;
  },

  async stopTimeEntryAndEnqueue(params: {
    empresaId: string;
    usuarioId: string;
    registroId: string;
    endedAtMs?: number;
    nota?: string | null;
  }): Promise<CachedRegistroTiempo | null> {
    const endMs = params.endedAtMs ?? Date.now();
    const endIso = new Date(endMs).toISOString();

    const closed = await withOfflineDbTransaction(async (db, mem) => {
      let current: CachedRegistroTiempo | null = null;
      if (db) {
        const row = await db.getFirstAsync<JsonPayloadRow>(
          `SELECT id, payload_json FROM offline_registros_tiempo WHERE id = ? AND empresa_id = ?;`,
          [params.registroId, params.empresaId],
        );
        current = row ? (JSON.parse(row.payload_json) as CachedRegistroTiempo) : null;
      } else {
        const found = mem.registrosTiempo.get(params.registroId);
        current = found && found.empresa_id === params.empresaId ? found : null;
      }

      if (!current) {
        return null;
      }

      const duracionSegundos = Math.max(0, Math.floor((endMs - current.iniciado_en_ms) / 1000));
      const updated: CachedRegistroTiempo = {
        ...current,
        finalizado_en: endIso,
        finalizado_en_ms: endMs,
        duracion_segundos: duracionSegundos,
        nota: params.nota !== undefined ? params.nota : current.nota,
        actualizado_en: endIso,
        sync_status: 'pending_update',
      };

      if (db) {
        await db.runAsync(
          `UPDATE offline_registros_tiempo
           SET finalizado_en_ms = ?, duracion_segundos = ?, nota = ?, payload_json = ?, sync_status = ?, actualizado_en = ?
           WHERE id = ?;`,
          [
            endMs,
            duracionSegundos,
            updated.nota,
            JSON.stringify(updated),
            updated.sync_status,
            endIso,
            updated.id,
          ],
        );
      } else {
        mem.registrosTiempo.set(updated.id, updated);
      }

      await insertOutboxItemInTxn(db, mem, {
        empresaId: params.empresaId,
        usuarioId: params.usuarioId,
        entityType: 'registros_tiempo',
        entityId: updated.id,
        operation: 'time.stop_entry',
        payload: {
          registro_id: updated.id,
          empresa_id: params.empresaId,
          finalizado_en: endIso,
          duracion_segundos: duracionSegundos,
          nota: updated.nota,
        },
      });

      return updated;
    });

    if (closed) notifyOutboxChanged();
    return closed;
  },

  async getActiveTimeEntries(
    empresaId: string,
    usuarioId: string,
  ): Promise<{
    jornadaActiva: CachedRegistroTiempo | null;
    actividadActiva: CachedRegistroTiempo | null;
  }> {
    const db = await getOfflineOpsDb();
    let openEntries: CachedRegistroTiempo[];

    if (!db) {
      openEntries = Array.from(getOfflineMemoryStore().registrosTiempo.values()).filter(
        (r) =>
          r.empresa_id === empresaId && r.usuario_id === usuarioId && r.finalizado_en_ms === null,
      );
    } else {
      const rows = await db.getAllAsync<JsonPayloadRow>(
        `SELECT id, payload_json FROM offline_registros_tiempo
         WHERE empresa_id = ? AND usuario_id = ? AND finalizado_en_ms IS NULL
         ORDER BY iniciado_en_ms DESC;`,
        [empresaId, usuarioId],
      );
      openEntries = rows.map((r) => JSON.parse(r.payload_json) as CachedRegistroTiempo);
    }

    return {
      jornadaActiva: openEntries.find((e) => e.tipo === 'jornada') ?? null,
      actividadActiva: openEntries.find((e) => e.tipo !== 'jornada') ?? null,
    };
  },

  async getTimeEntriesInRange(
    empresaId: string,
    usuarioId: string,
    fromMs: number,
    toMs: number,
  ): Promise<CachedRegistroTiempo[]> {
    const db = await getOfflineOpsDb();
    if (!db) {
      return Array.from(getOfflineMemoryStore().registrosTiempo.values())
        .filter(
          (r) =>
            r.empresa_id === empresaId &&
            r.usuario_id === usuarioId &&
            r.iniciado_en_ms >= fromMs &&
            r.iniciado_en_ms <= toMs,
        )
        .sort((a, b) => a.iniciado_en_ms - b.iniciado_en_ms);
    }

    const rows = await db.getAllAsync<JsonPayloadRow>(
      `SELECT id, payload_json FROM offline_registros_tiempo
       WHERE empresa_id = ? AND usuario_id = ?
         AND iniciado_en_ms >= ? AND iniciado_en_ms <= ?
       ORDER BY iniciado_en_ms ASC;`,
      [empresaId, usuarioId, fromMs, toMs],
    );
    return rows.map((r) => JSON.parse(r.payload_json) as CachedRegistroTiempo);
  },

  async clearTenantCacheIfSynced(empresaId: string): Promise<boolean> {
    const db = await getOfflineOpsDb();
    if (!db) {
      const mem = getOfflineMemoryStore();
      if (mem.outbox.some((item) => item.empresa_id === empresaId)) {
        return false;
      }
      for (const [k, v] of mem.clientes) if (v.empresa_id === empresaId) mem.clientes.delete(k);
      for (const [k, v] of mem.ordenes) if (v.empresa_id === empresaId) mem.ordenes.delete(k);
      for (const [k, v] of mem.plantillas) if (v.empresa_id === empresaId) mem.plantillas.delete(k);
      for (const [k, v] of mem.respuestas) if (v.empresa_id === empresaId) mem.respuestas.delete(k);
      for (const [k, v] of mem.evidencias) if (v.empresa_id === empresaId) mem.evidencias.delete(k);
      for (const [k, v] of mem.registrosTiempo) {
        if (v.empresa_id === empresaId) mem.registrosTiempo.delete(k);
      }
      return true;
    }

    return withOfflineDbTransaction(async (txn) => {
      if (!txn) return false;
      const pending = await txn.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count FROM sync_outbox WHERE empresa_id = ?;`,
        [empresaId],
      );
      if ((pending?.count ?? 0) > 0) {
        return false;
      }

      await txn.runAsync(`DELETE FROM offline_clientes WHERE empresa_id = ?;`, [empresaId]);
      await txn.runAsync(`DELETE FROM offline_ordenes_trabajo WHERE empresa_id = ?;`, [empresaId]);
      await txn.runAsync(`DELETE FROM offline_plantillas_formulario WHERE empresa_id = ?;`, [
        empresaId,
      ]);
      await txn.runAsync(`DELETE FROM offline_respuestas_formulario WHERE empresa_id = ?;`, [
        empresaId,
      ]);
      await txn.runAsync(`DELETE FROM offline_evidencias_locales WHERE empresa_id = ?;`, [
        empresaId,
      ]);
      await txn.runAsync(`DELETE FROM offline_registros_tiempo WHERE empresa_id = ?;`, [empresaId]);
      return true;
    });
  },
};
