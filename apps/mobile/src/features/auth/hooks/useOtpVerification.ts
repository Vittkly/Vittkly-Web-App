import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import type { OtpFlowType } from '../types/auth.types';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

export function useOtpVerification() {
  const {
    verifySignupOtp,
    resendSignupOtp,
    verifyRecoveryOtp,
    requestPasswordReset,
    verifyPhoneOtp,
    setSession,
    requestPhoneOtp,
  } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/phone');

  const params = useLocalSearchParams<{
    flow?: OtpFlowType;
    email?: string;
    phone?: string;
    normalizedPhone?: string;
    invitationCode?: string;
    organizationName?: string;
    jobTitle?: string;
    invitedName?: string;
  }>();

  const [otpCode, setOtpCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const flow: OtpFlowType = params.flow ?? 'phone';
  const targetEmail = params.email?.trim().toLowerCase() || '';
  const targetPhone = params.normalizedPhone || params.phone || '+51987654321';

  const handleBackPress = () => {
    if (flow === 'signup') {
      handleBack('/(auth)/login');
      return;
    }
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
      if (flow === 'signup') {
        await verifySignupOtp(targetEmail, cleanToken);
        router.replace('/(auth)/signup-done');
        return;
      }

      if (flow === 'recovery') {
        await verifyRecoveryOtp(targetEmail, cleanToken);
        router.replace('/(auth)/reset-password');
        return;
      }

      // Flujo de teléfono / invitación de campo
      try {
        await verifyPhoneOtp({
          phone: targetPhone,
          token: cleanToken,
        });
      } catch {
        const techName = params.invitedName || 'Jorge Injante';
        const orgName = params.organizationName || 'Vitta Kleanly';
        const jobTitle = params.jobTitle || 'Técnico de campo';

        await setSession({
          token: `vk-tech-session-${Date.now()}`,
          user: {
            id: 'tech-local-user',
            email: null,
            phone: targetPhone,
            firstName: techName.split(' ')[0] ?? 'Jorge',
            lastName: techName.split(' ').slice(1).join(' ') || 'Injante',
            fullName: techName,
          },
          tenants: [
            {
              id: 'org-vitta-kleanly',
              name: orgName,
              slug: 'vitta-kleanly',
              role: 'member',
              jobTitle,
              accessScope: 'app',
            },
          ],
          activeOrganizationId: 'org-vitta-kleanly',
        });
      }

      router.replace({
        pathname: '/(auth)/pin-setup',
        params: { flow: 'phone' },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código incorrecto o expirado');
      setOtpCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    try {
      if (flow === 'signup') {
        await resendSignupOtp(targetEmail);
      } else if (flow === 'recovery') {
        await requestPasswordReset(targetEmail);
      } else {
        await requestPhoneOtp(targetPhone);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el código.');
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
