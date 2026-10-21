import { useCallback, useEffect } from 'react';

import { authService } from '../../services/auth.service';
import { offlineSessionService } from '../../services/offline-session.service';
import { secureStorageService } from '../../services/secure-storage.service';
import type { AuthState } from '../../types/auth.types';
import { MAX_PIN_ATTEMPTS, PIN_LOCKOUT_DURATION_MS } from '../auth-state';

export interface UsePinVaultProps {
  state: AuthState;
  stateRef: React.MutableRefObject<AuthState>;
  setState: React.Dispatch<React.SetStateAction<AuthState>>;
}

export function usePinVault({ state, stateRef, setState }: UsePinVaultProps) {
  // Reintenta sincronizar el PIN con la nube cuando vuelve la conexión (R7).
  useEffect(() => {
    if (state.isLoading || state.isOffline || !state.sessionToken) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const pending = await secureStorageService.getPinCloudSyncPending();
      if (!pending || cancelled) return;

      const localHash = await secureStorageService.getPinHash();
      if (!localHash || cancelled) return;

      const { synced } = await authService.syncPinToCloud(localHash);
      if (!synced || cancelled) return;

      await secureStorageService.setPinCloudSyncPending(false);
      await offlineSessionService.savePinMeta({
        userId: stateRef.current.user?.id ?? 'local',
        pinEnabled: true,
        synced: true,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [state.isLoading, state.isOffline, state.sessionToken, stateRef]);

  /**
   * Hidrata el hash del PIN desde la nube (`user_metadata.pin_hash`) hacia SecureStore.
   */
  const hydrateCloudPin = useCallback(
    async (cloudPinHash: string | null): Promise<boolean> => {
      const localHash = await secureStorageService.getPinHash();
      const effectiveHash = cloudPinHash ?? localHash;

      if (cloudPinHash && cloudPinHash !== localHash) {
        await secureStorageService.savePinHash(cloudPinHash);
      }

      if (!effectiveHash) {
        return false;
      }

      setState(prev => ({
        ...prev,
        pin: {
          ...prev.pin,
          isConfigured: true,
          isLocked: false,
          failedAttempts: 0,
          lockedUntil: null,
        },
      }));
      return true;
    },
    [setState],
  );

  const savePinHash = useCallback(
    async (pinHash: string) => {
      await secureStorageService.savePinHash(pinHash);
      await secureStorageService.removePinAttempts();

      setState(prev => ({
        ...prev,
        pin: {
          ...prev.pin,
          isConfigured: true,
          isLocked: false,
          failedAttempts: 0,
          lockedUntil: null,
        },
      }));

      // Sincronización en la nube (user_metadata). Sin conexión queda pendiente y se reintenta luego.
      const current = stateRef.current;
      let synced = false;
      if (!current.isOffline) {
        const result = await authService.syncPinToCloud(pinHash);
        synced = result.synced;
      }

      await secureStorageService.setPinCloudSyncPending(!synced);
      await offlineSessionService.savePinMeta({
        userId: current.user?.id ?? 'local',
        pinEnabled: true,
        synced,
      });
    },
    [setState, stateRef],
  );

  const verifyPinHash = useCallback(
    async (candidateHash: string): Promise<boolean> => {
      const storedHash = await secureStorageService.getPinHash();
      if (!storedHash) {
        return false;
      }

      const now = Date.now();
      const attempts = await secureStorageService.getPinAttempts();

      // Bloqueo temporal vigente: no se evalúa el PIN.
      if (attempts.lockedUntil !== null && now < attempts.lockedUntil) {
        setState(prev => ({
          ...prev,
          pin: {
            ...prev.pin,
            isLocked: true,
            failedAttempts: attempts.failedAttempts,
            lockedUntil: attempts.lockedUntil,
          },
        }));
        return false;
      }

      // Si el bloqueo ya venció, el contador parte de cero.
      const currentFailed = attempts.lockedUntil !== null ? 0 : attempts.failedAttempts;

      if (storedHash === candidateHash) {
        await secureStorageService.removePinAttempts();
        setState(prev => ({
          ...prev,
          status: prev.isOffline ? 'offline_authenticated' : 'logged_in',
          isLoggedIn: true,
          pin: {
            ...prev.pin,
            isLocked: false,
            failedAttempts: 0,
            lockedUntil: null,
          },
        }));
        return true;
      }

      const nextAttempts = currentFailed + 1;
      const lockedUntil = nextAttempts >= MAX_PIN_ATTEMPTS ? now + PIN_LOCKOUT_DURATION_MS : null;
      await secureStorageService.setPinAttempts({ failedAttempts: nextAttempts, lockedUntil });

      setState(prev => ({
        ...prev,
        pin: {
          ...prev.pin,
          isLocked: true,
          failedAttempts: nextAttempts,
          lockedUntil,
        },
      }));

      return false;
    },
    [setState],
  );

  const unlockOfflineSession = useCallback(() => {
    void secureStorageService.removePinAttempts();
    setState(prev => ({
      ...prev,
      status: prev.isOffline ? 'offline_authenticated' : 'logged_in',
      isLoggedIn: true,
      pin: {
        ...prev.pin,
        isLocked: false,
        failedAttempts: 0,
        lockedUntil: null,
      },
    }));
  }, [setState]);

  const lockSession = useCallback(() => {
    setState(prev => {
      if (!prev.sessionToken || !prev.pin.isConfigured || prev.pin.isLocked) {
        return prev;
      }
      return {
        ...prev,
        pin: { ...prev.pin, isLocked: true },
      };
    });
  }, [setState]);

  const resetPinLockout = useCallback(() => {
    void secureStorageService.removePinAttempts();
    setState(prev => ({
      ...prev,
      pin: { ...prev.pin, failedAttempts: 0, lockedUntil: null },
    }));
  }, [setState]);

  return {
    savePinHash,
    verifyPinHash,
    unlockOfflineSession,
    lockSession,
    resetPinLockout,
    hydrateCloudPin,
  };
}
