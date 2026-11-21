"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  signInWithOAuthProvider,
  type OAuthEntryOrigin,
  type OAuthProviderId,
} from "../services/oauth.client";

const URL_OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_cancelado:
    "Cancelaste el acceso con tu cuenta externa. Puedes intentarlo nuevamente o usar tu correo.",
  oauth_error:
    "No se pudo completar el acceso con el proveedor externo. Intenta nuevamente.",
};

/**
 * Hook compartido para iniciar sesión o registrarse con Google o Microsoft (OAuth PKCE).
 */
export function useOAuthSignIn(options: {
  from: OAuthEntryOrigin;
  next?: string;
}) {
  const searchParams = useSearchParams();
  const urlErrorCode = searchParams.get("error");
  const urlOAuthError = urlErrorCode
    ? (URL_OAUTH_ERROR_MESSAGES[urlErrorCode] ?? null)
    : null;

  const [oauthProvider, setOauthProvider] = useState<OAuthProviderId | null>(
    null,
  );
  const [localOAuthError, setLocalOAuthError] = useState<string | null>(null);

  const clearOAuthError = useCallback(() => {
    setLocalOAuthError(null);
  }, []);

  const handleOAuthSignIn = useCallback(
    async (provider: OAuthProviderId) => {
      if (oauthProvider !== null) return;
      setLocalOAuthError(null);
      setOauthProvider(provider);

      const result = await signInWithOAuthProvider(provider, {
        from: options.from,
        next: options.next,
      });

      if (!result.ok) {
        setLocalOAuthError(result.error);
        setOauthProvider(null);
      }
    },
    [oauthProvider, options.from, options.next],
  );

  return {
    oauthProvider,
    oauthError: localOAuthError ?? urlOAuthError,
    clearOAuthError,
    handleOAuthSignIn,
  };
}
