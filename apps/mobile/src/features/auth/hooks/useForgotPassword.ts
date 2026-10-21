import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { isValidEmail } from '../utils/validators';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

export type ForgotMethod = 'email' | 'sms' | 'wsp';

export function useForgotPassword() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { requestPasswordReset, verifyPasswordResetCode } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/login_email');

  const [method, setMethod] = useState<ForgotMethod>('email');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState<string>(params.email ?? '');
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const subtitleByMethod: Record<ForgotMethod, string> = {
    email: 'Te enviaremos un código a tu correo.',
    sms: 'Te enviaremos un código por SMS.',
    wsp: 'Te enviaremos un código por WhatsApp.',
  };

  const handleBackPress = () => {
    if (step === 'verify') {
      setStep('request');
      setError(null);
      return;
    }
    handleBack('/(auth)/login_email');
  };

  const handleSendCode = async () => {
    if (isSubmitting) return;
    setError(null);

    if (method !== 'email') {
      setError(
        'La recuperación por SMS y WhatsApp está disponible próximamente. Usa la opción de Correo.',
      );
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(cleanEmail);
      router.push({
        pathname: '/(auth)/otp',
        params: { email: cleanEmail, flow: 'recovery' },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const cleanCode = (codeToVerify ?? otpCode).replace(/\D/g, '');
    if (cleanCode.length < 6) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await verifyPasswordResetCode(email.trim().toLowerCase(), cleanCode);
      router.push('/(auth)/reset-password');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código incorrecto o expirado');
      setOtpCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    method,
    setMethod,
    step,
    setStep,
    email,
    setEmail,
    phone,
    setPhone,
    otpCode,
    setOtpCode,
    error,
    setError,
    isSubmitting,
    subtitleByMethod,
    handleBackPress,
    handleSendCode,
    handleVerifyCode,
  };
}
