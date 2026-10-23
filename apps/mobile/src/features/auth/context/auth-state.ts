import { type NetInfoState } from '@react-native-community/netinfo';

import type { AuthState, Tenant } from '../types/auth.types';

export const MAX_PIN_ATTEMPTS = 5;
export const PIN_LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos

export const initialAuthState: AuthState = {
  status: 'loading',
  isLoading: true,
  isOffline: false,
  isLoggedIn: false,
  sessionToken: null,
  user: null,
  tenants: [],
  activeOrganizationId: null,
  activeTenant: null,
  lastActiveTenantId: null,
  pin: {
    isConfigured: false,
    isLocked: false,
    failedAttempts: 0,
    lockedUntil: null,
  },
  biometricType: 'none',
  isBiometricEnabled: false,
};

export function isNetworkOffline(netState: NetInfoState): boolean {
  if (netState.isConnected === false) {
    return true;
  }
  if (netState.isInternetReachable === false) {
    return true;
  }
  return false;
}

export function resolveActiveTenant(
  tenants: Tenant[],
  activeOrganizationId: string | null,
): Tenant | null {
  if (!tenants.length) {
    return null;
  }
  if (activeOrganizationId) {
    const found = tenants.find(tenant => tenant.id === activeOrganizationId);
    if (found) {
      return found;
    }
  }
  if (tenants.length === 1) {
    return tenants[0] ?? null;
  }
  return null;
}
