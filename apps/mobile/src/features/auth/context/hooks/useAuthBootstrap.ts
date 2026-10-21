import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useCallback, useEffect } from 'react';

import { offlineSessionService } from '../../services/offline-session.service';
import { secureStorageService } from '../../services/secure-storage.service';
import type {
  AuthBootstrapData,
  AuthState,
  AuthStatus,
  Tenant,
  UserProfile,
} from '../../types/auth.types';
import { isNetworkOffline, resolveActiveTenant } from '../auth-state';

export interface UseAuthBootstrapProps {
  setState: React.Dispatch<React.SetStateAction<AuthState>>;
  isMountedRef: React.MutableRefObject<boolean>;
}

export function useAuthBootstrap({ setState, isMountedRef }: UseAuthBootstrapProps) {
  const applyBootstrapState = useCallback(
    (
      netState: NetInfoState,
      bootstrap: AuthBootstrapData,
      sqliteSnapshot: { user: UserProfile | null; tenants: Tenant[] },
    ) => {
      if (!isMountedRef.current) {
        return;
      }

      const offline = isNetworkOffline(netState);
      const hasSession = Boolean(bootstrap.sessionToken);
      const hasPinConfigured = Boolean(bootstrap.pinHash);

      const resolvedUser = bootstrap.user ?? sqliteSnapshot.user;
      const resolvedTenants =
        bootstrap.tenants.length > 0 ? bootstrap.tenants : sqliteSnapshot.tenants;

      const activeTenant = resolveActiveTenant(resolvedTenants, bootstrap.activeOrganizationId);
      const resolvedOrgId = activeTenant?.id ?? bootstrap.activeOrganizationId;

      let nextStatus: AuthStatus = 'unauthenticated';
      let isLoggedIn = false;

      if (hasSession) {
        if (offline) {
          nextStatus = hasPinConfigured ? 'offline_locked' : 'offline_authenticated';
          isLoggedIn = !hasPinConfigured;
        } else {
          nextStatus = 'logged_in';
          isLoggedIn = true;
        }
      }

      // Si el bloqueo temporal ya venció, el contador de intentos parte de cero.
      const lockoutExpired =
        bootstrap.pinLockedUntil !== null && Date.now() >= bootstrap.pinLockedUntil;
      const restoredFailedAttempts = lockoutExpired ? 0 : bootstrap.pinFailedAttempts;
      const restoredLockedUntil = lockoutExpired ? null : bootstrap.pinLockedUntil;

      setState(prev => ({
        ...prev,
        status: nextStatus,
        isLoading: false,
        isOffline: offline,
        isLoggedIn,
        sessionToken: bootstrap.sessionToken,
        user: resolvedUser,
        tenants: resolvedTenants,
        activeOrganizationId: resolvedOrgId,
        activeTenant,
        pin: {
          ...prev.pin,
          isConfigured: hasPinConfigured,
          // R1/R4: arranque en frío con sesión + PIN siempre inicia bloqueado (online u offline).
          isLocked: hasSession && hasPinConfigured,
          failedAttempts: restoredFailedAttempts,
          lockedUntil: restoredLockedUntil,
        },
        isBiometricEnabled: bootstrap.isBiometricEnabled,
      }));
    },
    [isMountedRef, setState],
  );

  const refreshAuthState = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, status: 'loading' }));
    try {
      const [netState, bootstrap, sqliteSnapshot] = await Promise.all([
        NetInfo.fetch(),
        secureStorageService.getAuthBootstrapData(),
        offlineSessionService.loadOfflineSnapshot(),
      ]);
      if (isMountedRef.current) {
        applyBootstrapState(netState, bootstrap, sqliteSnapshot);
      }
    } catch {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          isLoading: false,
          isLoggedIn: false,
        }));
      }
    }
  }, [applyBootstrapState, isMountedRef, setState]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      NetInfo.fetch(),
      secureStorageService.getAuthBootstrapData(),
      offlineSessionService.loadOfflineSnapshot(),
    ])
      .then(([netState, bootstrap, sqliteSnapshot]) => {
        if (isMounted && isMountedRef.current) {
          applyBootstrapState(netState, bootstrap, sqliteSnapshot);
        }
      })
      .catch(() => {
        if (isMounted && isMountedRef.current) {
          setState(prev => ({
            ...prev,
            status: 'unauthenticated',
            isLoading: false,
            isLoggedIn: false,
          }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [applyBootstrapState, isMountedRef, setState]);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener(netState => {
      if (!isMounted || !isMountedRef.current) {
        return;
      }

      const offline = isNetworkOffline(netState);

      setState(prev => {
        if (prev.isLoading || prev.isOffline === offline) {
          return prev;
        }

        let nextStatus = prev.status;
        if (prev.sessionToken) {
          if (offline && prev.status === 'logged_in') {
            nextStatus = 'offline_authenticated';
          } else if (!offline && prev.status === 'offline_authenticated') {
            nextStatus = 'logged_in';
          }
        }

        return {
          ...prev,
          isOffline: offline,
          status: nextStatus,
        };
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isMountedRef, setState]);

  return { refreshAuthState };
}
