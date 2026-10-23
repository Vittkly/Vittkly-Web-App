import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authService } from '../../services/auth.service';
import { offlineSessionService } from '../../services/offline-session.service';
import { secureStorageService } from '../../services/secure-storage.service';
import { tenantService } from '../../services/tenant.service';
import type {
  AuthSessionResult,
  AuthState,
  BiometricType,
  SetSessionPayload,
  SignInWithPasswordParams,
  SignUpParams,
  SignUpWithEmailResult,
  VerifyOtpParams,
} from '../../types/auth.types';
import { initialAuthState, resolveActiveTenant } from '../auth-state';

export interface UseAuthSessionActionsProps {
  setState: React.Dispatch<React.SetStateAction<AuthState>>;
  hydrateCloudPin: (cloudPinHash: string | null) => Promise<boolean>;
}

export function useAuthSessionActions({ setState, hydrateCloudPin }: UseAuthSessionActionsProps) {
  const queryClient = useQueryClient();

  const setSession = useCallback(
    async (payload: SetSessionPayload) => {
      const tenants = payload.tenants ?? [];
      let resolvedOrgId = payload.activeOrganizationId ?? null;
      if (tenants.length === 1 && tenants[0]) {
        resolvedOrgId = tenants[0].id;
        await secureStorageService.saveLastActiveTenantId(resolvedOrgId);
        await offlineSessionService.saveActiveTenantId(resolvedOrgId);
      }

      const activeTenant = resolveActiveTenant(tenants, resolvedOrgId);

      await Promise.all([
        secureStorageService.setSessionJwt(payload.token),
        secureStorageService.setCachedUserProfile(payload.user),
        secureStorageService.setCachedTenants(tenants),
        offlineSessionService.saveOfflineSnapshot(payload.user, tenants),
        resolvedOrgId
          ? secureStorageService.setActiveOrganizationId(resolvedOrgId)
          : secureStorageService.removeActiveOrganizationId(),
      ]);

      setState(prev => ({
        ...prev,
        status: prev.isOffline ? 'offline_authenticated' : 'logged_in',
        isLoading: false,
        isLoggedIn: true,
        sessionToken: payload.token,
        user: payload.user,
        tenants,
        activeOrganizationId: resolvedOrgId,
        activeTenant,
      }));
    },
    [setState],
  );

  const establishUserSession = useCallback(
    async (sessionResult: AuthSessionResult) => {
      const tenants = await tenantService.fetchUserTenants(sessionResult.user.id);
      const lastActiveId = await secureStorageService.getLastActiveTenantId();

      let activeOrgId: string | null = null;
      if (tenants.length === 1 && tenants[0]) {
        // Criterio 1: Entrada directa si tiene una sola empresa
        activeOrgId = tenants[0].id;
        await secureStorageService.saveLastActiveTenantId(activeOrgId);
        await offlineSessionService.saveActiveTenantId(activeOrgId);
      } else if (tenants.length > 1) {
        // Criterio 2: Si tiene varias, activeOrgId queda null para elegir en select-tenant
        activeOrgId = null;
      }

      await setSession({
        token: sessionResult.accessToken,
        user: sessionResult.user,
        tenants,
        activeOrganizationId: activeOrgId,
      });

      if (lastActiveId) {
        setState(prev => ({ ...prev, lastActiveTenantId: lastActiveId }));
      }

      const hasPin = await hydrateCloudPin(sessionResult.pinHash ?? null);

      return {
        user: sessionResult.user,
        tenants,
        hasPin,
      };
    },
    [hydrateCloudPin, setSession, setState],
  );

  const loginWithPassword = useCallback(
    async (params: SignInWithPasswordParams) => {
      const sessionResult = await authService.signInWithPassword(params);
      return establishUserSession(sessionResult);
    },
    [establishUserSession],
  );

  const signUpWithEmail = useCallback(
    async (params: SignUpParams): Promise<SignUpWithEmailResult> => {
      const result = await authService.signUpWithEmail(params);
      if (result.session) {
        await establishUserSession(result.session);
      }
      return result;
    },
    [establishUserSession],
  );

  const signUp = useCallback(async (params: SignUpParams): Promise<AuthSessionResult | null> => {
    return authService.signUp(params);
  }, []);

  const verifySignupOtp = useCallback(
    async (email: string, token: string) => {
      const sessionResult = await authService.verifySignupOtp(email, token);
      return establishUserSession(sessionResult);
    },
    [establishUserSession],
  );

  const resendSignupOtp = useCallback(async (email: string) => {
    await authService.resendSignupOtp(email);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await authService.resetPasswordForEmail(email);
  }, []);

  const verifyRecoveryOtp = useCallback(
    async (email: string, token: string) => {
      const sessionResult = await authService.verifyRecoveryOtp(email, token);
      return establishUserSession(sessionResult);
    },
    [establishUserSession],
  );

  const verifyPasswordResetCode = useCallback(
    async (email: string, token: string) => {
      await verifyRecoveryOtp(email, token);
    },
    [verifyRecoveryOtp],
  );

  const updatePassword = useCallback(async (newPassword: string) => {
    await authService.updatePassword(newPassword);
  }, []);

  const requestPhoneOtp = useCallback(async (phone: string) => {
    return authService.signInWithOtp(phone);
  }, []);

  const verifyPhoneOtp = useCallback(
    async (params: VerifyOtpParams) => {
      const sessionResult = await authService.verifyOtp(params);
      return establishUserSession(sessionResult);
    },
    [establishUserSession],
  );

  const switchTenant = useCallback(
    async (organizationId: string) => {
      // 1. Persistir en SecureStore y SQLite
      await Promise.all([
        secureStorageService.saveLastActiveTenantId(organizationId),
        offlineSessionService.saveActiveTenantId(organizationId),
      ]);

      // 2. Actualizar estado en AuthContext
      setState(prev => {
        const activeTenant = resolveActiveTenant(prev.tenants, organizationId);
        return {
          ...prev,
          activeOrganizationId: organizationId,
          activeTenant,
          lastActiveTenantId: organizationId,
        };
      });

      // 3. Criterio 4: Aislamiento estricto de datos — purgar caché de consultas previas
      queryClient.clear();
    },
    [queryClient, setState],
  );

  const selectOrganization = switchTenant;

  const setBiometricPreference = useCallback(
    async (enabled: boolean, type?: BiometricType) => {
      await secureStorageService.setBiometricEnabled(enabled);

      setState(prev => ({
        ...prev,
        isBiometricEnabled: enabled,
        biometricType: type ?? prev.biometricType,
      }));
    },
    [setState],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();

    setState(prev => ({
      ...initialAuthState,
      status: 'unauthenticated',
      isLoading: false,
      isOffline: prev.isOffline,
      biometricType: prev.biometricType,
    }));
  }, [setState]);

  return {
    setSession,
    loginWithPassword,
    signUpWithEmail,
    signUp,
    verifySignupOtp,
    resendSignupOtp,
    requestPasswordReset,
    verifyRecoveryOtp,
    verifyPasswordResetCode,
    updatePassword,
    requestPhoneOtp,
    verifyPhoneOtp,
    switchTenant,
    selectOrganization,
    setBiometricPreference,
    signOut,
  };
}
