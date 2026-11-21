import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { sanitizeNetworkError } from '../services/network-error';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

export interface CountryOption {
  code: string;
  dial: string;
  name: string;
}

export const COUNTRIES: readonly CountryOption[] = [
  { code: 'PE', dial: '+51', name: 'Perú' },
  { code: 'CO', dial: '+57', name: 'Colombia' },
  { code: 'MX', dial: '+52', name: 'México' },
  { code: 'CL', dial: '+56', name: 'Chile' },
  { code: 'EC', dial: '+593', name: 'Ecuador' },
  { code: 'US', dial: '+1', name: 'Estados Unidos' },
] as const;

export function usePhoneEntry() {
  const { requestPhoneOtp } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/welcome');

  const params = useLocalSearchParams<{
    phone?: string;
  }>();

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>(
    params.phone ? params.phone.replace(/^\+\d{1,3}/, '') : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleBackPress = () => handleBack('/(auth)/welcome');

  const handleSendCode = async () => {
    if (isSubmitting) return;
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Ingresa un número de celular válido.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const fullPhone = `${selectedCountry.dial} ${digits}`;
    const targetPhone = `${selectedCountry.dial}${digits}`;

    try {
      const { normalizedPhone } = await requestPhoneOtp(targetPhone);
      router.push({
        pathname: '/(auth)/otp',
        params: {
          flow: 'phone',
          phone: fullPhone,
          normalizedPhone,
        },
      });
    } catch (err: unknown) {
      setError(
        sanitizeNetworkError(
          err,
          'No pudimos enviar el código de verificación. Verifica tu número e intenta nuevamente.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    params,
    selectedCountry,
    setSelectedCountry,
    showCountryPicker,
    setShowCountryPicker,
    phoneNumber,
    setPhoneNumber,
    error,
    setError,
    isSubmitting,
    handleBackPress,
    handleSendCode,
  };
}
