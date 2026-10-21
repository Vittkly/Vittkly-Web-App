import { router, usePathname, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { useInactivityLock } from '../hooks/useInactivityLock';

/**
 * Componente silencioso montado en el layout raíz (`src/app/_layout.tsx`) que:
 * 1. Activa el monitor de ciclo de vida e inactividad de 15 minutos (`useInactivityLock`).
 * 2. Redirige a `/(auth)/pin-lock` cuando la sesión pasa a estado bloqueado (`pin.isLocked`),
 *    manteniendo `AuthContext` libre de llamadas directas al `router` (`thin-routing.md`).
 */
export function InactivityLockGate() {
  useInactivityLock();

  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const { isLoading, sessionToken, pin } = useAuth();

  useEffect(() => {
    if (!rootNavigationState?.key || isLoading) {
      return;
    }

    const shouldRedirectToPinLock =
      Boolean(sessionToken) &&
      pin.isConfigured &&
      pin.isLocked &&
      pathname !== '/pin-lock' &&
      pathname !== '/(auth)/pin-lock' &&
      pathname !== '/splash' &&
      pathname !== '/(auth)/splash';

    if (shouldRedirectToPinLock) {
      router.replace('/(auth)/pin-lock');
    }
  }, [isLoading, pathname, pin.isConfigured, pin.isLocked, rootNavigationState?.key, sessionToken]);

  return null;
}
