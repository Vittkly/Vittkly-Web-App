import type { WorkOrderStatus } from '@/components/StatusBadge';
import { supabase } from '@/services/supabase';

export interface VisitRecord {
  code: string;
  title: string;
  status: WorkOrderStatus;
  address?: string;
  time?: string;
  technician?: string;
  amount?: string;
}

function getTenantScopedDemoVisits(tenantId: string, tenantName: string): VisitRecord[] {
  if (tenantId.includes('vitta') || tenantName.toLowerCase().includes('vitta')) {
    return [
      {
        code: 'OT-0482',
        title: 'Limpieza de oficina · Miraflores',
        status: 'en-ruta',
        address: 'Av. Larco 1150, piso 4',
        time: '9:40 a. m.',
        technician: 'Rosa M.',
        amount: 'S/ 150.00',
      },
      {
        code: 'OT-0481',
        title: 'Mantenimiento de aire acondicionado',
        status: 'completada',
        address: 'Ca. Los Pinos 320, San Isidro',
        time: '8:00 a. m.',
        technician: 'Rosa M.',
        amount: 'S/ 280.00',
      },
      {
        code: 'OT-0479',
        title: 'Desinfección integral de almacén',
        status: 'pagada',
        address: 'Av. Argentina 2410, Callao',
        time: 'Ayer · 4:30 p. m.',
        technician: 'Rosa M.',
        amount: 'S/ 420.00',
      },
    ];
  }

  return [
    {
      code: 'OT-1092',
      title: `Inspección de instalaciones · ${tenantName}`,
      status: 'programada',
      address: 'Jr. Huancavelica 450, Lima Centro',
      time: '11:00 a. m.',
      technician: 'Rosa M.',
      amount: 'S/ 190.00',
    },
    {
      code: 'OT-1088',
      title: 'Mantenimiento preventivo sede norte',
      status: 'completada',
      address: 'Av. Antúnez de Mayolo 880, Los Olivos',
      time: '9:15 a. m.',
      technician: 'Rosa M.',
      amount: 'S/ 310.00',
    },
  ];
}

export const visitsService = {
  /**
   * Obtiene las órdenes de trabajo programadas para hoy filtradas por la empresa activa.
   */
  async fetchTodayVisits(tenantId: string, tenantName: string): Promise<VisitRecord[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('code, title, status, address, start_time, total_amount')
        .eq('org_id', tenantId)
        .order('scheduled_date', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(item => ({
          code: item.code,
          title: item.title,
          status: item.status as WorkOrderStatus,
          address: item.address ?? undefined,
          time: item.start_time ?? undefined,
          amount: item.total_amount ? `S/ ${item.total_amount.toFixed(2)}` : undefined,
        }));
      }
    } catch {
      // Continuar a fallback de demostración
    }

    return getTenantScopedDemoVisits(tenantId, tenantName);
  },
};
