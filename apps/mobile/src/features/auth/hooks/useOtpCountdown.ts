import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseOtpCountdownOptions {
  initialSeconds?: number;
  autoStart?: boolean;
}

export interface UseOtpCountdownReturn {
  secondsLeft: number;
  isExpired: boolean;
  formattedTime: string;
  restart: (customSeconds?: number) => void;
}

function formatSecondsToMmSs(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Hook reactivo de cuenta regresiva (por defecto 60 segundos) para el reenvío de códigos OTP.
 * Diseñado para renderizarse con `typography.timerDisplay` (`tabular-nums`).
 */
export function useOtpCountdown(options: UseOtpCountdownOptions = {}): UseOtpCountdownReturn {
  const { initialSeconds = 60, autoStart = true } = options;

  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    autoStart ? Math.max(0, initialSeconds) : 0,
  );
  const [isRunning, setIsRunning] = useState<boolean>(autoStart && initialSeconds > 0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  const restart = useCallback(
    (customSeconds?: number) => {
      const target = Math.max(0, customSeconds ?? initialSeconds);
      setSecondsLeft(target);
      setIsRunning(target > 0);
    },
    [initialSeconds],
  );

  const isExpired = secondsLeft <= 0;

  const formattedTime = useMemo(() => formatSecondsToMmSs(secondsLeft), [secondsLeft]);

  return {
    secondsLeft,
    isExpired,
    formattedTime,
    restart,
  };
}
