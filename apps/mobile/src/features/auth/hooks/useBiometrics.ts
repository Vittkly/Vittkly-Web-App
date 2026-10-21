import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import type { BiometricType } from '../types/auth.types';

export type BiometricOutcome = 'idle' | 'success' | 'failed' | 'cancelled';

export const BIOMETRIC_FAILURE_MESSAGE =
  'No se pudo validar tu identidad biométrica, ingresa tu PIN.';

export interface UseBiometricsReturn {
  isSupported: boolean;
  isEnrolled: boolean;
  isAvailable: boolean;
  biometricType: BiometricType;
  isAuthenticating: boolean;
  error: string | null;
  outcome: BiometricOutcome;
  authenticateWithBiometrics: (promptMessage?: string) => Promise<boolean>;
  resetOutcome: () => void;
}

function mapHardwareTypesToBiometricType(
  types: LocalAuthentication.AuthenticationType[],
): BiometricType {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'facial';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'iris';
  }
  return 'none';
}

/**
 * Hook de detección y autenticación biométrica nativa (FaceID, TouchID, Huella Android).
 */
export function useBiometrics(): UseBiometricsReturn {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<BiometricOutcome>('idle');

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let isMounted = true;

    Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ])
      .then(([hardware, enrolled, supportedTypes]) => {
        if (!isMounted) return;
        setIsSupported(hardware);
        setIsEnrolled(enrolled);
        setBiometricType(
          hardware && enrolled ? mapHardwareTypesToBiometricType(supportedTypes) : 'none',
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setIsSupported(false);
        setIsEnrolled(false);
        setBiometricType('none');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const authenticateWithBiometrics = useCallback(
    async (promptMessage = 'Desbloquea Vittkly para acceder a tus órdenes'): Promise<boolean> => {
      if (Platform.OS === 'web' || !isSupported || !isEnrolled) {
        setError('La biometría no está disponible o configurada en este dispositivo.');
        setOutcome('failed');
        return false;
      }

      setIsAuthenticating(true);
      setError(null);

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          cancelLabel: 'Usar PIN',
          fallbackLabel: 'Usar PIN',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setOutcome('success');
          return true;
        }

        const wasCancelled =
          result.error === 'user_cancel' ||
          result.error === 'system_cancel' ||
          result.error === 'app_cancel' ||
          result.error === 'user_fallback';

        if (wasCancelled) {
          setOutcome('cancelled');
        } else {
          setError(BIOMETRIC_FAILURE_MESSAGE);
          setOutcome('failed');
        }
        return false;
      } catch {
        setError(BIOMETRIC_FAILURE_MESSAGE);
        setOutcome('failed');
        return false;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isEnrolled, isSupported],
  );

  const resetOutcome = useCallback(() => {
    setOutcome('idle');
    setError(null);
  }, []);

  return {
    isSupported,
    isEnrolled,
    isAvailable: isSupported && isEnrolled,
    biometricType,
    isAuthenticating,
    error,
    outcome,
    authenticateWithBiometrics,
    resetOutcome,
  };
}
