import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { sanitizeNetworkError } from '../services/network-error';
import type { OtpFlowType } from '../types/auth.types';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

export function useOtpVerification() {
  const { verifyRecoveryOtp, requestPasswordReset, verifyPhoneOtp, requestPhoneOtp } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/phone');

  const params = useLocalSearchParams<{
    flow?: OtpFlowType;
    email?: string;
    phone?: string;
    normalizedPhone?: string;
  }>();

  const [otpCode, setOtpCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const flow: OtpFlowType = params.flow === 'recovery' ? 'recovery' : 'phone';
  const targetEmail = params.email?.trim().toLowerCase() || '';
  const targetPhone = params.normalizedPhone || params.phone?.replace(/\s+/g, '') || '';

  const handleBackPress = () => {
    if (flow === 'recovery') {
      handleBack('/(auth)/forgot');
      return;
    }
    handleBack('/(auth)/phone');
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const cleanToken = (codeToVerify ?? otpCode).replace(/\D/g, '');
    if (cleanToken.length < 6) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      if (flow === 'recovery') {
        await verifyRecoveryOtp(targetEmail, cleanToken);
        router.replace('/(auth)/reset-password');
        return;
      }

      if (!targetPhone) {
        setError('Falta el número de celular. Regresa e ingrésalo nuevamente.');
        return;
      }

      await verifyPhoneOtp({
        phone: targetPhone,
        token: cleanToken,
      });

      router.replace({
        pathname: '/(auth)/pin-setup',
        params: { flow: 'phone' },
      });
    } catch (err: unknown) {
      setError(sanitizeNetworkError(err, 'Código incorrecto o expirado.'));
      setOtpCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    try {
      if (flow === 'recovery') {
        await requestPasswordReset(targetEmail);
      } else {
        await requestPhoneOtp(targetPhone);
      }
    } catch (err: unknown) {
      setError(sanitizeNetworkError(err, 'No se pudo reenviar el código.'));
    }
  };

  return {
    flow,
    params,
    targetEmail,
    targetPhone,
    otpCode,
    setOtpCode,
    error,
    setError,
    isVerifying,
    handleBackPress,
    handleVerifyOtp,
    handleResendCode,
  };
}
