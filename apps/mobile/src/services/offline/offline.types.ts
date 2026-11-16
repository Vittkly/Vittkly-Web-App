import type { Database, Json } from '@vittkly/db-types';

export type ClienteRow = Database['public']['Tables']['clientes']['Row'];
export type OrdenTrabajoRow = Database['public']['Tables']['ordenes_trabajo']['Row'];
export type PlantillaFormularioRow = Database['public']['Tables']['plantillas_formulario']['Row'];
export type RespuestaFormularioRow = Database['public']['Tables']['respuestas_formulario']['Row'];
export type EvidenciaOrdenRow = Database['public']['Tables']['evidencias_orden']['Row'];
export type RegistroTiempoRow = Database['public']['Tables']['registros_tiempo']['Row'];

export type OrdenEstado = OrdenTrabajoRow['estado'];
export type OrdenMetodoPago = OrdenTrabajoRow['metodo_pago'];
export type OrdenEstadoValidacion = OrdenTrabajoRow['estado_validacion'];
export type EvidenciaTipo = EvidenciaOrdenRow['tipo'];
export type RegistroTiempoTipo = RegistroTiempoRow['tipo'];

export type LocalSyncStatus = 'synced' | 'local_only' | 'pending_update' | 'error';

export type CachedCliente = ClienteRow;

export interface CachedOrdenTrabajo extends OrdenTrabajoRow {
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  tecnico_nombre: string | null;
}

export type CachedPlantillaFormulario = PlantillaFormularioRow;

export interface CachedRespuestaFormulario extends RespuestaFormularioRow {
  sync_status: LocalSyncStatus;
}

export interface CachedEvidenciaOrden {
  id: string;
  empresa_id: string;
  orden_trabajo_id: string;
  usuario_id: string;
  tipo: EvidenciaTipo;
  item_codigo: string | null;
  storage_path: string;
  local_uri: string | null;
  nota: string | null;
  creado_en: string;
  sync_status: LocalSyncStatus;
}

export interface CachedRegistroTiempo extends RegistroTiempoRow {
  iniciado_en_ms: number;
  finalizado_en_ms: number | null;
  sync_status: LocalSyncStatus;
}

export type OutboxEntityType =
  'ordenes_trabajo' | 'respuestas_formulario' | 'evidencias_orden' | 'registros_tiempo';

export type OutboxOperation =
  | 'order.update_status'
  | 'order.mark_paid'
  | 'order.validate'
  | 'form.upsert_response'
  | 'evidence.upload'
  | 'time.start_entry'
  | 'time.stop_entry';

export type OutboxStatus = 'pending' | 'processing' | 'failed';

export interface OrderUpdateStatusPayload {
  orden_id: string;
  estado: OrdenEstado;
  en_ruta_eta_min?: number | null;
  iniciado_en?: string | null;
  completado_en?: string | null;
}

export interface OrderMarkPaidPayload {
  orden_id: string;
  metodo_pago: Exclude<OrdenMetodoPago, 'pendiente'>;
  pagado_en: string;
}

export interface OrderValidatePayload {
  orden_id: string;
  estado_validacion: Exclude<OrdenEstadoValidacion, 'pendiente'>;
  validado_por: string;
  validado_en: string;
  observacion_validacion?: string | null;
}

export interface FormUpsertResponsePayload {
  id: string;
  empresa_id: string;
  orden_trabajo_id: string;
  plantilla_id: string | null;
  usuario_id: string;
  estado: 'borrador' | 'completado';
  paso_actual: number;
  respuestas: Json;
  firma_inicio_path: string | null;
  firma_inicio_en: string | null;
  firma_conformidad_path: string | null;
  firma_conformidad_en: string | null;
  nombre_firmante: string | null;
  calificacion_csat: number | null;
  nps_score: number | null;
  encuesta_omitida: boolean;
  completado_en: string | null;
}

export interface EvidenceUploadPayload {
  evidencia_id: string;
  empresa_id: string;
  orden_trabajo_id: string;
  usuario_id: string;
  tipo: EvidenciaTipo;
  item_codigo: string | null;
  storage_path: string;
  local_uri: string | null;
  mime_type: string;
  nota: string | null;
  creado_en: string;
}

export interface TimeStartEntryPayload {
  registro_id: string;
  empresa_id: string;
  usuario_id: string;
  orden_trabajo_id: string | null;
  tipo: RegistroTiempoTipo;
  iniciado_en: string;
  nota: string | null;
}

export interface TimeStopEntryPayload {
  registro_id: string;
  empresa_id: string;
  finalizado_en: string;
  duracion_segundos: number;
  nota?: string | null;
}

export type OutboxPayloadByOperation = {
  'order.update_status': OrderUpdateStatusPayload;
  'order.mark_paid': OrderMarkPaidPayload;
  'order.validate': OrderValidatePayload;
  'form.upsert_response': FormUpsertResponsePayload;
  'evidence.upload': EvidenceUploadPayload;
  'time.start_entry': TimeStartEntryPayload;
  'time.stop_entry': TimeStopEntryPayload;
};

export interface SyncOutboxItem<O extends OutboxOperation = OutboxOperation> {
  id: string;
  empresa_id: string;
  usuario_id: string;
  entity_type: OutboxEntityType;
  entity_id: string;
  operation: O;
  payload: OutboxPayloadByOperation[O];
  local_asset_uri: string | null;
  idempotency_key: string;
  status: OutboxStatus;
  retry_count: number;
  next_retry_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncEngineSnapshot {
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  totalUnsyncedCount: number;
  lastSyncedAt: string | null;
}
