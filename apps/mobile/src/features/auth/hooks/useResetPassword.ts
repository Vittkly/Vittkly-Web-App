import { router } from 'expo-router';
import { useState } from 'react';

import { isValidPassword } from '../utils/validators';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

export interface ResetPasswordErrors {
  p1?: string;
  p2?: string;
  general?: string;
}

export function useResetPassword() {
  const { updatePassword } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/forgot');

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleBackPress = () => handleBack('/(auth)/forgot');

  const handleSavePassword = async () => {
    if (isSubmitting) return;

    const nextErrors: ResetPasswordErrors = {};
    if (!isValidPassword(password)) {
      nextErrors.p1 = 'Debe tener 8+ caracteres, una mayúscula, un número y un símbolo.';
    } else if (password !== confirmPassword) {
      nextErrors.p2 = 'Las contraseñas no coinciden.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      router.replace('/(auth)/password-updated');
    } catch (err: unknown) {
      setErrors({
        general: err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    errors,
    setErrors,
    isSubmitting,
    handleBackPress,
    handleSavePassword,
  };
}
