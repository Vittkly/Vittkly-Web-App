import type { Href } from 'expo-router';

import { useAuth } from './useAuth';

export interface RouteGuardResult {
  isLoading: boolean;
  redirectTo: Href | null;
}

/**
 * Evalúa el estado de autenticación y PIN para determinar si se debe redirigir:
 * - A `pin-lock` si hay sesión y PIN configurado bloqueado.
 * - A `welcome` si el usuario no está autenticado.
 * - `null` si el usuario tiene acceso permitido al contenido.
 */
export function useAuthRouteGuard(): RouteGuardResult {
  const { isLoading, isAuthenticated, status, pin, sessionToken } = useAuth();

  if (isLoading || status === 'loading') {
    return { isLoading: true, redirectTo: null };
  }

  if (status === 'offline_locked' || (Boolean(sessionToken) && pin.isConfigured && pin.isLocked)) {
    return { isLoading: false, redirectTo: '/(auth)/pin-lock' };
  }

  const isAccessAllowed = isAuthenticated || (pin.isConfigured && !pin.isLocked);
  if (!isAccessAllowed && status === 'unauthenticated') {
    return { isLoading: false, redirectTo: '/(auth)/welcome' };
  }

  return { isLoading: false, redirectTo: null };
}
