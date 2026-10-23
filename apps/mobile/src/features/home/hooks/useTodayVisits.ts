import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';
import { visitsService, type VisitRecord } from '../services/visits.service';

export type { VisitRecord };

export function useTodayVisits() {
  const { activeTenant } = useAuth();
  const activeTenantId = activeTenant?.id ?? 'default';
  const activeTenantName = activeTenant?.name ?? 'Vitta Kleanly';

  return useQuery<VisitRecord[]>({
    queryKey: ['work-orders', 'today', activeTenantId],
    queryFn: async () => {
      if (!activeTenant?.id) {
        return [];
      }
      return visitsService.fetchTodayVisits(activeTenant.id, activeTenantName);
    },
    enabled: Boolean(activeTenant?.id),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
