import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {
  AuthState,
  BiometricType,
  LoginResult,
  OAuthProvider,
  SetSessionPayload,
  SignInWithPasswordParams,
  VerifyOtpParams,
} from '../types/auth.types';
import {
  initialAuthState,
  MAX_PIN_ATTEMPTS,
  PIN_LOCKOUT_DURATION_MS,
  resolveActiveTenant,
} from './auth-state';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { useAuthSessionActions } from './hooks/useAuthSessionActions';
import { usePinVault } from './hooks/usePinVault';

export { MAX_PIN_ATTEMPTS, PIN_LOCKOUT_DURATION_MS, resolveActiveTenant, initialAuthState };

export interface AuthContextValue extends AuthState {
  activeEmpresaId: string | null;
  isAuthenticated: boolean;
  /** Cuentas sin correo (acceso por teléfono) deben crear PIN obligatoriamente. */
  isPinRequired: boolean;
  setSession: (payload: SetSessionPayload) => Promise<void>;
  loginWithPassword: (params: SignInWithPasswordParams) => Promise<LoginResult>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<LoginResult | null>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyRecoveryOtp: (email: string, token: string) => Promise<LoginResult>;
  verifyPasswordResetCode: (email: string, token: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  requestPhoneOtp: (phone: string) => Promise<{ normalizedPhone: string }>;
  verifyPhoneOtp: (params: VerifyOtpParams) => Promise<LoginResult>;
  switchTenant: (organizationId: string) => Promise<void>;
  selectOrganization: (organizationId: string) => Promise<void>;
  selectTenant: (organizationId: string) => Promise<void>;
  savePinHash: (pinHash: string) => Promise<void>;
  verifyPinHash: (candidateHash: string) => Promise<boolean>;
  unlockOfflineSession: () => void;
  lockSession: () => void;
  resetPinLockout: () => void;
  setBiometricPreference: (enabled: boolean, type?: BiometricType) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const isMountedRef = useRef<boolean>(false);
  const stateRef = useRef<AuthState>(state);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const { refreshAuthState } = useAuthBootstrap({ setState, isMountedRef });

  const {
    savePinHash,
    verifyPinHash,
    unlockOfflineSession,
    lockSession,
    resetPinLockout,
    hydrateCloudPin,
  } = usePinVault({ state, stateRef, setState });

  const sessionActions = useAuthSessionActions({
    stateRef,
    setState,
    hydrateCloudPin,
  });

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      ...state,
      activeEmpresaId: state.activeOrganizationId,
      isAuthenticated: state.isLoggedIn,
      isPinRequired: !state.user?.email,
      ...sessionActions,
      switchTenant: sessionActions.switchTenant,
      selectTenant: sessionActions.switchTenant,
      selectOrganization: sessionActions.switchTenant,
      savePinHash,
      verifyPinHash,
      unlockOfflineSession,
      lockSession,
      resetPinLockout,
      refreshAuthState,
    }),
    [
      state,
      sessionActions,
      savePinHash,
      verifyPinHash,
      unlockOfflineSession,
      lockSession,
      resetPinLockout,
      refreshAuthState,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Custom Hook para consumir el estado global de autenticación y conectividad.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }
  return context;
}
