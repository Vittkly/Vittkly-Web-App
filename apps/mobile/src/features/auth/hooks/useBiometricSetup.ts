import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from './useAuth';
import { useBiometrics } from './useBiometrics';

export function useBiometricSetup() {
  const { isOffline, tenants, activeOrganizationId, switchTenant, setBiometricPreference } =
    useAuth();
  const { isAvailable, biometricType, authenticateWithBiometrics } = useBiometrics();
  const [isActivating, setIsActivating] = useState(false);

  const navigateToNext = () => {
    if (tenants.length === 1 && tenants[0]) {
      void switchTenant(tenants[0].id);
      router.replace('/');
      return;
    }
    if (tenants.length > 1 && !activeOrganizationId) {
      router.replace('/(auth)/select-tenant');
      return;
    }
    router.replace('/');
  };

  const handleActivateBiometrics = async () => {
    if (isActivating) return;
    setIsActivating(true);

    try {
      if (isAvailable) {
        const authenticated = await authenticateWithBiometrics();
        await setBiometricPreference(authenticated, biometricType);
      } else {
        await setBiometricPreference(true, 'facial');
      }
    } catch {
      await setBiometricPreference(true, 'facial');
    } finally {
      setIsActivating(false);
    }

    navigateToNext();
  };

  const handleSkipBiometrics = async () => {
    await setBiometricPreference(false);
    navigateToNext();
  };

  return {
    isAvailable,
    biometricType,
    isActivating,
    isOffline,
    handleActivateBiometrics,
    handleSkipBiometrics,
  };
}
