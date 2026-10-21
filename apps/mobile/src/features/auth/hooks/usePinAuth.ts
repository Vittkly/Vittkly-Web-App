import { useCallback, useState } from 'react';

import { secureStorageService } from '../services/secure-storage.service';
import { computeLocalPinHash } from '../utils/pin-hash';

export type PinAuthMode = 'verify' | 'setup';

export interface UsePinAuthOptions {
  length?: number;
  mode?: PinAuthMode;
  autoSubmit?: boolean;
  onSuccess?: (pin: string, pinHash: string) => void;
  onError?: (message: string) => void;
}

export interface UsePinAuthReturn {
  pin: string;
  isComplete: boolean;
  error: string | null;
  isSubmitting: boolean;
  handleKeyPress: (key: string) => void;
  handleDelete: () => void;
  handleClear: () => void;
  verifyPin: (pinOverride?: string) => Promise<boolean>;
  savePin: (pinOverride?: string) => Promise<boolean>;
}

/**
 * Hook para la captura, validación y persistencia del PIN de 4 dígitos conectado a `secureStorageService`.
 */
export function usePinAuth(options: UsePinAuthOptions = {}): UsePinAuthReturn {
  const { length = 4, mode = 'verify', autoSubmit = false, onSuccess, onError } = options;

  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const verifyPin = useCallback(
    async (pinOverride?: string): Promise<boolean> => {
      const targetPin = pinOverride ?? pin;
      if (targetPin.length !== length) {
        const msg = `El PIN debe tener ${length} dígitos.`;
        setError(msg);
        onError?.(msg);
        return false;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const storedHash = await secureStorageService.getPinHash();
        if (!storedHash) {
          const msg = 'No hay un PIN configurado en este dispositivo.';
          setError(msg);
          onError?.(msg);
          return false;
        }

        const candidateHash = computeLocalPinHash(targetPin);
        const isValid = storedHash === candidateHash || storedHash === targetPin;

        if (!isValid) {
          const msg = 'PIN incorrecto. Inténtalo nuevamente.';
          setError(msg);
          setPin('');
          onError?.(msg);
          return false;
        }

        onSuccess?.(targetPin, candidateHash);
        return true;
      } catch {
        const msg = 'No se pudo verificar el PIN local.';
        setError(msg);
        onError?.(msg);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [length, onError, onSuccess, pin],
  );

  const savePin = useCallback(
    async (pinOverride?: string): Promise<boolean> => {
      const targetPin = pinOverride ?? pin;
      if (targetPin.length !== length) {
        const msg = `El PIN debe tener ${length} dígitos.`;
        setError(msg);
        onError?.(msg);
        return false;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const pinHash = computeLocalPinHash(targetPin);
        await secureStorageService.setPinHash(pinHash);
        onSuccess?.(targetPin, pinHash);
        return true;
      } catch {
        const msg = 'No se pudo guardar el PIN en el dispositivo.';
        setError(msg);
        onError?.(msg);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [length, onError, onSuccess, pin],
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isSubmitting) return;
      const cleanDigit = key.replace(/\D/g, '').slice(-1);
      if (!cleanDigit) return;

      setError(null);
      setPin(prev => {
        if (prev.length >= length) {
          return prev;
        }
        const nextPin = prev + cleanDigit;
        if (autoSubmit && nextPin.length === length) {
          if (mode === 'verify') {
            void verifyPin(nextPin);
          } else {
            void savePin(nextPin);
          }
        }
        return nextPin;
      });
    },
    [autoSubmit, isSubmitting, length, mode, savePin, verifyPin],
  );

  const handleDelete = useCallback(() => {
    if (isSubmitting) return;
    setError(null);
    setPin(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, [isSubmitting]);

  const handleClear = useCallback(() => {
    if (isSubmitting) return;
    setError(null);
    setPin('');
  }, [isSubmitting]);

  return {
    pin,
    isComplete: pin.length === length,
    error,
    isSubmitting,
    handleKeyPress,
    handleDelete,
    handleClear,
    verifyPin,
    savePin,
  };
}
