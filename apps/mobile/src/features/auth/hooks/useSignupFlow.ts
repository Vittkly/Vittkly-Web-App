import { router } from 'expo-router';
import { useState } from 'react';

import { isValidEmail, isValidPassword } from '../utils/validators';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

export interface Step1Errors {
  name?: string;
  email?: string;
  password?: string;
}

export function useSignupFlow() {
  const { signUpWithEmail } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/welcome');

  const [step, setStep] = useState<1 | 2>(1);

  // Paso 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  // Paso 2
  const [companyName, setCompanyName] = useState('');
  const [businessActivity, setBusinessActivity] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackPress = () => {
    if (step === 2) {
      setStep(1);
      setSubmitError(null);
      return;
    }
    handleBack('/(auth)/welcome');
  };

  const handleContinueStep1 = () => {
    const errors: Step1Errors = {};

    if (!fullName.trim()) {
      errors.name = 'Ingresa tu nombre completo.';
    }
    if (!isValidEmail(email)) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!isValidPassword(password)) {
      errors.password = 'Debe tener 8+ caracteres, una mayúscula, un número y un símbolo.';
    }

    setStep1Errors(errors);
    if (Object.keys(errors).length === 0) {
      setStep(2);
    }
  };

  const handleRegisterSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const cleanEmail = email.trim().toLowerCase();
    try {
      const result = await signUpWithEmail({
        fullName: fullName.trim(),
        email: cleanEmail,
        password,
        companyName: companyName.trim() || undefined,
        businessActivity: businessActivity.trim() || undefined,
        city: city.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
      });

      if (result.requiresEmailConfirmation) {
        router.push({
          pathname: '/(auth)/otp',
          params: { email: cleanEmail, flow: 'signup' },
        });
      } else {
        router.replace('/(auth)/signup-done');
      }
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'No se pudo completar el registro. Intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    step1Errors,
    setStep1Errors,
    companyName,
    setCompanyName,
    businessActivity,
    setBusinessActivity,
    city,
    setCity,
    whatsapp,
    setWhatsapp,
    submitError,
    setSubmitError,
    isSubmitting,
    handleBackPress,
    handleContinueStep1,
    handleRegisterSubmit,
  };
}
