import NetInfo from '@react-native-community/netinfo';

import type { WorkOrderStatus } from '@/components/StatusBadge';
import { isNetworkOffline } from '@/features/auth/context/auth-state';
import {
  type CachedCliente,
  type CachedOrdenTrabajo,
  type OrdenEstado,
  offlineCacheRepository,
} from '@/services/offline';
import { supabase } from '@/services/supabase';

export interface VisitRecord {
  id: string;
  code: string;
  title: string;
  status: WorkOrderStatus;
  address?: string;
  time?: string;
  technician?: string;
  amount?: string;
}

interface SupabaseOrdenQueryRow extends Omit<
  CachedOrdenTrabajo,
  'cliente_nombre' | 'cliente_telefono' | 'tecnico_nombre'
> {
  cliente: CachedCliente | CachedCliente[] | null;
  tecnico: { nombre: string } | { nombre: string }[] | null;
}

const ORDEN_ESTADO_TO_BADGE: Record<OrdenEstado, WorkOrderStatus> = {
  programada: 'programada',
  en_ruta: 'en-ruta',
  en_curso: 'en-curso',
  completada: 'completada',
  pagada: 'pagada',
  cancelada: 'cancelada',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
};

function getTodayLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHoraEstimada(hora?: string | null): string | undefined {
  if (!hora) return undefined;
  const parts = hora.split(':');
  if (parts.length < 2) return undefined;

  const hours = Number.parseInt(parts[0] ?? '', 10);
  const minutes = parts[1];
  if (Number.isNaN(hours) || !minutes) return undefined;

  const suffix = hours >= 12 ? 'p. m.' : 'a. m.';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes} ${suffix}`;
}

function formatMonto(montoTotal: number, moneda: string): string | undefined {
  if (!Number.isFinite(montoTotal) || montoTotal <= 0) return undefined;
  const symbol = CURRENCY_SYMBOLS[moneda] ?? moneda;
  return `${symbol} ${montoTotal.toFixed(2)}`;
}

function unwrapSingle<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toCachedOrder(row: SupabaseOrdenQueryRow): {
  order: CachedOrdenTrabajo;
  cliente: CachedCliente | null;
} {
  const { cliente: rawCliente, tecnico: rawTecnico, ...orderFields } = row;
  const cliente = unwrapSingle(rawCliente);
  const tecnico = unwrapSingle(rawTecnico);

  return {
    cliente,
    order: {
      ...orderFields,
      cliente_nombre: cliente?.nombre_completo ?? null,
      cliente_telefono: cliente?.telefono ?? null,
      tecnico_nombre: tecnico?.nombre ?? null,
    },
  };
}

function mapCachedOrderToVisitRecord(order: CachedOrdenTrabajo): VisitRecord {
  const addressParts = [order.direccion_servicio, order.distrito].filter((part): part is string =>
    Boolean(part && part.trim().length > 0),
  );

  return {
    id: order.id,
    code: order.codigo,
    title: order.titulo,
    status: ORDEN_ESTADO_TO_BADGE[order.estado],
    address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
    time: formatHoraEstimada(order.hora_inicio_estimada),
    technician: order.tecnico_nombre ?? undefined,
    amount: formatMonto(order.monto_total, order.moneda),
  };
}

export const visitsService = {
  /**
   * Obtiene las órdenes de trabajo programadas para hoy en la empresa activa,
   * sincronizando el snapshot remoto cuando hay red y leyendo siempre desde SQLite offline-first.
   */
  async fetchTodayVisits(empresaId: string): Promise<VisitRecord[]> {
    if (!empresaId) return [];

    const todayIso = getTodayLocalIsoDate();

    try {
      const netState = await NetInfo.fetch();
      if (!isNetworkOffline(netState)) {
        const { data, error } = await supabase
          .from('ordenes_trabajo')
          .select(
            `
              id,
              empresa_id,
              codigo,
              cliente_id,
              tecnico_id,
              tipo,
              titulo,
              descripcion,
              instrucciones,
              estado,
              fecha_programada,
              hora_inicio_estimada,
              duracion_estimada_min,
              direccion_servicio,
              distrito,
              latitud,
              longitud,
              en_ruta_eta_min,
              frecuencia_recurrencia,
              monto_total,
              moneda,
              metodo_pago,
              pagado_en,
              iniciado_en,
              completado_en,
              estado_validacion,
              validado_por,
              validado_en,
              observacion_validacion,
              creado_en,
              creado_por,
              actualizado_en,
              actualizado_por,
              cliente:clientes!ordenes_trabajo_cliente_id_fkey (
                id,
                empresa_id,
                nombre_completo,
                tipo_persona,
                documento_tipo,
                documento_numero,
                telefono,
                correo,
                direccion,
                distrito,
                referencia,
                latitud,
                longitud,
                notas,
                activo,
                creado_en,
                creado_por,
                actualizado_en,
                actualizado_por
              ),
              tecnico:usuarios!ordenes_trabajo_tecnico_id_fkey (
                nombre
              )
            `,
          )
          .eq('empresa_id', empresaId)
          .eq('fecha_programada', todayIso)
          .order('hora_inicio_estimada', { ascending: true, nullsFirst: false });

        if (!error && data) {
          const rows = data as unknown as SupabaseOrdenQueryRow[];
          const cachedOrders: CachedOrdenTrabajo[] = [];
          const clientesMap = new Map<string, CachedCliente>();

          for (const row of rows) {
            const normalized = toCachedOrder(row);
            cachedOrders.push(normalized.order);
            if (normalized.cliente) {
              clientesMap.set(normalized.cliente.id, normalized.cliente);
            }
          }

          await offlineCacheRepository.saveOrdersSnapshot(
            empresaId,
            cachedOrders,
            Array.from(clientesMap.values()),
          );
        }
      }
    } catch {
      // Silencio intencional offline-first: si la red falla se sirve la caché local SQLite.
    }

    const cached = await offlineCacheRepository.getCachedOrders(empresaId, {
      fechaProgramada: todayIso,
    });
    return cached.map(mapCachedOrderToVisitRecord);
  },
};
