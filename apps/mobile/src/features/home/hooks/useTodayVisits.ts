import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';
import { visitsService, type VisitRecord } from '../services/visits.service';

export type { VisitRecord };

export function useTodayVisits() {
  const { activeOrganizationId, activeTenant } = useAuth();
  const empresaId = activeOrganizationId ?? activeTenant?.id ?? null;

  return useQuery<VisitRecord[]>({
    queryKey: ['work-orders', 'today', empresaId ?? 'none'],
    queryFn: async () => {
      if (!empresaId) {
        return [];
      }
      return visitsService.fetchTodayVisits(empresaId);
    },
    enabled: Boolean(empresaId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
