import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { secureStorageService } from '../services/secure-storage.service';

/**
 * Tiempo máximo fuera de la app antes de exigir de nuevo el PIN (15 minutos).
 */
export const INACTIVITY_LOCK_MS = 15 * 60 * 1000;

/**
 * Monitor de ciclo de vida (`AppState`) para el bloqueo automático por inactividad.
 * - Al salir de primer plano (`inactive` / `background`) guarda `lastActiveTimestamp`
 *   en `secure-storage.service.ts` (solo en la primera transición).
 * - Al volver a `active`, si pasaron `>= INACTIVITY_LOCK_MS` bloquea la sesión.
 *
 * Solo está activo cuando existe sesión y PIN configurado y la sesión no está ya bloqueada.
 */
export function useInactivityLock(): void {
  const { sessionToken, pin, lockSession } = useAuth();
  const isArmed = Boolean(sessionToken) && pin.isConfigured && !pin.isLocked;

  const previousStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!isArmed) {
      return;
    }

    const subscription = AppState.addEventListener('change', nextState => {
      const previousState = previousStateRef.current;
      previousStateRef.current = nextState;

      // Primera salida de primer plano: guardar marca de tiempo. El `inactive` → `background`
      // posterior (o el `inactive` transitorio del prompt biométrico) no sobrescribe la marca.
      if (previousState === 'active' && nextState !== 'active') {
        void secureStorageService.saveLastBackgroundTime(Date.now());
        return;
      }

      if (previousState !== 'active' && nextState === 'active') {
        void (async () => {
          const lastBackgroundTime = await secureStorageService.getLastBackgroundTime();
          await secureStorageService.removeLastBackgroundTime();
          if (lastBackgroundTime === null) {
            return;
          }
          if (Date.now() - lastBackgroundTime >= INACTIVITY_LOCK_MS) {
            lockSession();
          }
        })();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isArmed, lockSession]);
}
