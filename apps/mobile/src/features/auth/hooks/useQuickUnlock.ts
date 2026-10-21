import { useCallback, useEffect, useRef, useState } from 'react';

import { MAX_PIN_ATTEMPTS, useAuth } from '../context/AuthContext';
import type { BiometricType } from '../types/auth.types';

import { BIOMETRIC_FAILURE_MESSAGE, useBiometrics } from './useBiometrics';
import { computeLocalPinHash } from '../utils/pin-hash';

const PIN_LENGTH = 4;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

export interface UseQuickUnlockOptions {
  /** Se invoca cuando el usuario se desbloqueó con PIN o biometría. */
  onUnlocked: () => void;
}

export interface UseQuickUnlockReturn {
  pin: string;
  length: number;
  /** Mensaje de error de PIN o de bloqueo temporal (pinta los puntos en `danger`). */
  errorMessage: string | null;
  /** Mensaje informativo bajo los puntos (instrucción o aviso de fallo biométrico). */
  helperText: string;
  helperTone: 'muted' | 'danger';
  isLockedOut: boolean;
  isBusy: boolean;
  biometricAvailable: boolean;
  biometricType: BiometricType;
  handleKeyPress: (digit: string) => void;
  handleDelete: () => void;
  handleBiometricPress: () => void;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Orquesta la pantalla de desbloqueo rápido (`pin-lock`):
 * - R3: valida el PIN contra SecureStore (online u offline) y limita a 5 intentos.
 * - R5: dispara una sola vez el prompt biométrico al abrir si el usuario lo habilitó.
 * - R6: cancelar la biometría no muestra mensaje ni vuelve a abrir el diálogo en bucle.
 */
export function useQuickUnlock({ onUnlocked }: UseQuickUnlockOptions): UseQuickUnlockReturn {
  const {
    pin: pinState,
    isBiometricEnabled,
    verifyPinHash,
    unlockOfflineSession,
    resetPinLockout,
  } = useAuth();
  const {
    isAvailable: biometricAvailable,
    biometricType,
    isAuthenticating,
    outcome: biometricOutcome,
    authenticateWithBiometrics,
    resetOutcome,
  } = useBiometrics();

  const [digits, setDigits] = useState<string>('');
  const [lastAttemptFailed, setLastAttemptFailed] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const hasAutoPromptedRef = useRef<boolean>(false);

  const lockedUntil = pinState.lockedUntil;
  const isLockedOut = lockedUntil !== null && now < lockedUntil;
  const lockoutSecondsLeft = isLockedOut ? Math.ceil((lockedUntil - now) / MS_PER_SECOND) : 0;

  // Cuenta regresiva del bloqueo temporal; al vencer reinicia el contador de intentos.
  useEffect(() => {
    if (lockedUntil === null) {
      return;
    }

    const intervalId = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockedUntil) {
        clearInterval(intervalId);
        setLastAttemptFailed(false);
        resetPinLockout();
      }
    }, MS_PER_SECOND);

    return () => {
      clearInterval(intervalId);
    };
  }, [lockedUntil, resetPinLockout]);

  const runBiometricUnlock = useCallback(async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      unlockOfflineSession();
      onUnlocked();
    }
  }, [authenticateWithBiometrics, onUnlocked, unlockOfflineSession]);

  // R5: auto-disparo único al abrir la pantalla bloqueada.
  const canAutoPrompt = isBiometricEnabled && biometricAvailable && !isLockedOut;
  useEffect(() => {
    if (!canAutoPrompt || hasAutoPromptedRef.current) {
      return;
    }
    hasAutoPromptedRef.current = true;
    void runBiometricUnlock();
  }, [canAutoPrompt, runBiometricUnlock]);

  const verifyEnteredPin = useCallback(
    async (candidate: string) => {
      setIsVerifying(true);
      try {
        const isValid = await verifyPinHash(computeLocalPinHash(candidate));
        if (isValid) {
          onUnlocked();
          return;
        }
        setLastAttemptFailed(true);
        setDigits('');
      } finally {
        setIsVerifying(false);
      }
    },
    [onUnlocked, verifyPinHash],
  );

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (isVerifying || isAuthenticating || isLockedOut) return;
      const cleanDigit = digit.replace(/\D/g, '').slice(-1);
      if (!cleanDigit || digits.length >= PIN_LENGTH) return;

      setLastAttemptFailed(false);
      resetOutcome();

      const nextDigits = digits + cleanDigit;
      setDigits(nextDigits);
      if (nextDigits.length === PIN_LENGTH) {
        void verifyEnteredPin(nextDigits);
      }
    },
    [digits, isAuthenticating, isLockedOut, isVerifying, resetOutcome, verifyEnteredPin],
  );

  const handleDelete = useCallback(() => {
    if (isVerifying || isAuthenticating || isLockedOut) return;
    setLastAttemptFailed(false);
    setDigits(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, [isAuthenticating, isLockedOut, isVerifying]);

  const handleBiometricPress = useCallback(() => {
    if (isVerifying || isAuthenticating || isLockedOut) return;
    resetOutcome();
    void runBiometricUnlock();
  }, [isAuthenticating, isLockedOut, isVerifying, resetOutcome, runBiometricUnlock]);

  const remainingAttempts = Math.max(0, MAX_PIN_ATTEMPTS - pinState.failedAttempts);

  let errorMessage: string | null = null;
  if (isLockedOut) {
    errorMessage = `Demasiados intentos. Intenta de nuevo en ${formatCountdown(lockoutSecondsLeft)}.`;
  } else if (lastAttemptFailed) {
    errorMessage = `PIN incorrecto. Te ${remainingAttempts === 1 ? 'queda 1 intento' : `quedan ${remainingAttempts} intentos`}.`;
  }

  let helperText = 'Ingresa tu PIN de 4 dígitos.';
  let helperTone: 'muted' | 'danger' = 'muted';
  if (!errorMessage && biometricOutcome === 'failed') {
    helperText = BIOMETRIC_FAILURE_MESSAGE;
    helperTone = 'danger';
  }

  return {
    pin: digits,
    length: PIN_LENGTH,
    errorMessage,
    helperText,
    helperTone,
    isLockedOut,
    isBusy: isVerifying || isAuthenticating,
    biometricAvailable: biometricAvailable && isBiometricEnabled,
    biometricType,
    handleKeyPress,
    handleDelete,
    handleBiometricPress,
  };
}
