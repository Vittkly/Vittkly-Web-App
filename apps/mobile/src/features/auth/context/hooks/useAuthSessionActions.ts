import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useOrgStore } from '@/features/tenants/stores/useOrgStore';

import { authRepository } from '../../services/auth.repository';
import { offlineSessionService } from '../../services/offline-session.service';
import { secureStorageService } from '../../services/secure-storage.service';
import { tenantService } from '../../services/tenant.service';
import type {
  AuthSessionResult,
  AuthState,
  BiometricType,
  LoginResult,
  SetSessionPayload,
  SignInWithPasswordParams,
  VerifyOtpParams,
} from '../../types/auth.types';
import { syncOrgStoreFromAuth } from '../../utils/tenant-sync';
import { initialAuthState, resolveActiveTenant } from '../auth-state';

export interface UseAuthSessionActionsProps {
  stateRef: React.MutableRefObject<AuthState>;
  setState: React.Dispatch<React.SetStateAction<AuthState>>;
  hydrateCloudPin: (cloudPinHash: string | null) => Promise<boolean>;
}

export function useAuthSessionActions({
  stateRef,
  setState,
  hydrateCloudPin,
}: UseAuthSessionActionsProps) {
  const queryClient = useQueryClient();

  const setSession = useCallback(
    async (payload: SetSessionPayload) => {
      const tenants = payload.tenants ?? [];
      let resolvedOrgId = payload.activeOrganizationId ?? null;

      if (tenants.length === 1 && tenants[0]) {
        resolvedOrgId = tenants[0].id;
        await Promise.all([
          secureStorageService.saveLastActiveTenantId(resolvedOrgId),
          offlineSessionService.saveActiveTenantId(resolvedOrgId),
        ]);
      }

      const activeTenant = resolveActiveTenant(tenants, resolvedOrgId);
      const lastActiveTenantId =
        payload.user.ultimaEmpresaId ??
        (await secureStorageService.getLastActiveTenantId()) ??
        resolvedOrgId;

      await Promise.all([
        secureStorageService.setSessionJwt(payload.token),
        secureStorageService.setCachedUserProfile(payload.user),
        secureStorageService.setCachedTenants(tenants),
        offlineSessionService.saveOfflineSnapshot(payload.user, tenants),
        resolvedOrgId
          ? secureStorageService.setActiveEmpresaId(resolvedOrgId)
          : secureStorageService.removeActiveEmpresaId(),
      ]);

      syncOrgStoreFromAuth(tenants, activeTenant, lastActiveTenantId);

      setState((prev) => ({
        ...prev,
        status: prev.isOffline ? 'offline_authenticated' : 'logged_in',
        isLoading: false,
        isLoggedIn: true,
        sessionToken: payload.token,
        user: payload.user,
        tenants,
        activeOrganizationId: activeTenant?.id ?? null,
        activeTenant,
        lastActiveTenantId,
      }));
    },
    [setState],
  );

  const establishUserSession = useCallback(
    async (sessionResult: AuthSessionResult): Promise<LoginResult> => {
      const tenants =
        sessionResult.tenants.length > 0
          ? sessionResult.tenants
          : await tenantService.fetchUserTenants(sessionResult.user.id);

      let activeOrgId: string | null = null;
      if (tenants.length === 1 && tenants[0]) {
        // Criterio 1: Entrada directa si tiene 1 sola empresa con acceso móvil
        activeOrgId = tenants[0].id;
        await Promise.all([
          secureStorageService.saveLastActiveTenantId(activeOrgId),
          offlineSessionService.saveActiveTenantId(activeOrgId),
          authRepository.updateLastActiveEmpresa(sessionResult.user.id, activeOrgId),
        ]);
      }

      await setSession({
        token: sessionResult.token,
        user: sessionResult.user,
        tenants,
        activeOrganizationId: activeOrgId,
      });

      const hasPin = await hydrateCloudPin(sessionResult.cloudPinHash ?? null);

      return {
        user: sessionResult.user,
        tenants,
        hasPin,
        activeOrganizationId: activeOrgId,
        needsTenantSelection: tenants.length > 1 || tenants.length === 0,
      };
    },
    [hydrateCloudPin, setSession],
  );

  const loginWithPassword = useCallback(
    async (params: SignInWithPasswordParams): Promise<LoginResult> => {
      const sessionResult = await authRepository.signInWithPassword(params);
      return establishUserSession(sessionResult);
    },
    [establishUserSession],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    await authRepository.resetPasswordForEmail(email);
  }, []);

  const verifyRecoveryOtp = useCallback(
    async (email: string, token: string): Promise<LoginResult> => {
      const sessionResult = await authRepository.verifyRecoveryOtp(email, token);
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
    await authRepository.updatePassword(newPassword);
  }, []);

  const requestPhoneOtp = useCallback(async (phone: string) => {
    return authRepository.signInWithOtp(phone);
  }, []);

  const verifyPhoneOtp = useCallback(
    async (params: VerifyOtpParams): Promise<LoginResult> => {
      const sessionResult = await authRepository.verifyOtp(params);
      return establishUserSession(sessionResult);
    },
    [establishUserSession],
  );

  const switchTenant = useCallback(
    async (organizationId: string) => {
      const currentUserId = stateRef.current.user?.id;

      await Promise.all([
        secureStorageService.setActiveEmpresaId(organizationId),
        secureStorageService.saveLastActiveTenantId(organizationId),
        offlineSessionService.saveActiveTenantId(organizationId),
        currentUserId
          ? authRepository.updateLastActiveEmpresa(currentUserId, organizationId)
          : Promise.resolve(),
      ]);

      setState((prev) => {
        const activeTenant = resolveActiveTenant(prev.tenants, organizationId);
        syncOrgStoreFromAuth(prev.tenants, activeTenant, organizationId);
        return {
          ...prev,
          activeOrganizationId: organizationId,
          activeTenant,
          lastActiveTenantId: organizationId,
        };
      });

      queryClient.clear();
    },
    [queryClient, setState, stateRef],
  );

  const selectOrganization = switchTenant;

  const setBiometricPreference = useCallback(
    async (enabled: boolean, type?: BiometricType) => {
      await secureStorageService.setBiometricEnabled(enabled);

      setState((prev) => ({
        ...prev,
        isBiometricEnabled: enabled,
        biometricType: type ?? prev.biometricType,
      }));
    },
    [setState],
  );

  const signOut = useCallback(async () => {
    await Promise.all([
      authRepository.signOut(),
      secureStorageService.clearAllAuthStorage(),
      offlineSessionService.clearOfflineSession(),
    ]);

    useOrgStore.getState().reset();
    queryClient.clear();

    setState((prev) => ({
      ...initialAuthState,
      status: 'unauthenticated',
      isLoading: false,
      isOffline: prev.isOffline,
      biometricType: prev.biometricType,
    }));
  }, [queryClient, setState]);

  return {
    setSession,
    loginWithPassword,
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
