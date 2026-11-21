import { router } from 'expo-router';
import { useState } from 'react';

import { sanitizeNetworkError } from '../services/network-error';
import type { LoginResult, OAuthProvider } from '../types/auth.types';
import { isValidEmail } from '../utils/validators';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

export interface EmailLoginFieldErrors {
  email?: string;
  password?: string;
}

function navigateAfterLogin(result: LoginResult) {
  if (result.tenants.length === 0) {
    router.replace('/(auth)/org-selector');
    return;
  }

  if (!result.hasPin) {
    router.replace('/(auth)/quick-access-prompt');
    return;
  }

  if (result.tenants.length > 1 && !result.activeOrganizationId) {
    router.replace('/(auth)/org-selector');
    return;
  }

  router.replace('/');
}

export function useEmailLogin() {
  const { loginWithPassword, loginWithOAuth } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/welcome');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<EmailLoginFieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<OAuthProvider | null>(null);

  const isOAuthSubmitting = oauthProvider !== null;
  const handleBackPress = () => handleBack('/(auth)/welcome');

  const handleLoginSubmit = async () => {
    if (isSubmitting || isOAuthSubmitting) return;

    const errors: EmailLoginFieldErrors = {};
    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!password) {
      errors.password = 'Ingresa tu contraseña.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await loginWithPassword({
        email: cleanEmail,
        password,
      });

      navigateAfterLogin(result);
    } catch (err: unknown) {
      setAuthError(
        sanitizeNetworkError(err, 'Credenciales inválidas. Verifica tu correo y contraseña.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    if (isSubmitting || isOAuthSubmitting) return;

    setOauthProvider(provider);
    setAuthError(null);

    try {
      const result = await loginWithOAuth(provider);
      if (result) {
        navigateAfterLogin(result);
      }
    } catch (err: unknown) {
      setAuthError(
        sanitizeNetworkError(err, 'No se pudo completar el inicio de sesión. Intenta nuevamente.'),
      );
    } finally {
      setOauthProvider(null);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    fieldErrors,
    setFieldErrors,
    authError,
    setAuthError,
    isSubmitting,
    oauthProvider,
    isOAuthSubmitting,
    handleBackPress,
    handleLoginSubmit,
    handleOAuthLogin,
  };
}
