export const FRIENDLY_NETWORK_ERROR =
  'No pudimos conectarnos con el servidor. Revisa tu conexión a internet o intenta nuevamente.';

/**
 * Sanitiza errores crudos de red para presentar mensajes amigables al usuario sin URLs ni trazas técnicas.
 */
export function sanitizeNetworkError(err: unknown, fallbackMessage: string): string {
  const rawMessage =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message?: unknown }).message ?? '')
        : typeof err === 'string'
          ? err
          : '';

  const lower = rawMessage.toLowerCase();
  if (
    lower.includes('fetch failed') ||
    lower.includes('network request failed') ||
    lower.includes('unknownhostexception') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused')
  ) {
    return FRIENDLY_NETWORK_ERROR;
  }

  return rawMessage.trim() || fallbackMessage;
}
