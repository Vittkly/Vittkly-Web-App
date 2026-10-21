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
  const setSession = useCallback(
    async (payload: SetSessionPayload) => {
      const tenants = payload.tenants ?? [];
      const activeTenant = resolveActiveTenant(tenants, payload.activeOrganizationId ?? null);
      const resolvedOrgId = activeTenant?.id ?? payload.activeOrganizationId ?? null;

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
      const activeOrgId = tenants[0]?.id ?? null;

      await setSession({
        token: sessionResult.accessToken,
        user: sessionResult.user,
        tenants,
        activeOrganizationId: activeOrgId,
      });
      const hasPin = await hydrateCloudPin(sessionResult.pinHash ?? null);

      return {
        user: sessionResult.user,
        tenants,
        hasPin,
      };
    },
    [hydrateCloudPin, setSession],
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

  const selectOrganization = useCallback(
    async (organizationId: string) => {
      await secureStorageService.setActiveOrganizationId(organizationId);

      setState(prev => {
        const activeTenant = resolveActiveTenant(prev.tenants, organizationId);
        return {
          ...prev,
          activeOrganizationId: organizationId,
          activeTenant,
        };
      });
    },
    [setState],
  );

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
    selectOrganization,
    setBiometricPreference,
    signOut,
  };
}
