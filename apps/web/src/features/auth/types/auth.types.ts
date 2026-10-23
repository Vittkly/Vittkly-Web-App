/**
 * Tipos de estado y retorno para Server Actions de autenticación.
 */
export interface AuthActionState {
  error?: string | null;
  message?: string | null;
  success?: boolean;
  blockedUntil?: string | null;
  remainingSeconds?: number;
}
