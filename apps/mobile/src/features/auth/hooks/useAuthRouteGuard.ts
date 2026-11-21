import type { Href } from 'expo-router';

import { useAuth } from './useAuth';

export interface AuthRouteGuardResult {
  isLoading: boolean;
  redirectTo: Href | null;
}

/**
 * Resuelve la ruta inicial obligatoria según estado de sesión, bloqueo por PIN y empresa activa.
 */
export function useAuthRouteGuard(): AuthRouteGuardResult {
  const { isLoading, status, pin, tenants, activeOrganizationId } = useAuth();

  if (isLoading || status === 'loading') {
    return { isLoading: true, redirectTo: null };
  }

  if (status === 'offline_locked' || (pin.isConfigured && pin.isLocked)) {
    return { isLoading: false, redirectTo: '/(auth)/pin-lock' };
  }

  if (status === 'unauthenticated') {
    return { isLoading: false, redirectTo: '/(auth)/welcome' };
  }

  if (tenants.length === 0 || (tenants.length > 1 && !activeOrganizationId)) {
    return { isLoading: false, redirectTo: '/(auth)/org-selector' };
  }

  return { isLoading: false, redirectTo: null };
}
