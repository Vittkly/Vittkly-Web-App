import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import { computeLocalPinHash } from '../utils/pin-hash';
import { useAuth } from './useAuth';
import { useAuthBackNavigation } from './useAuthBackNavigation';

const PIN_LENGTH = 4;

export function usePinSetup() {
  const { isOffline, savePinHash } = useAuth();
  const { handleBack } = useAuthBackNavigation('/(auth)/quick-access-prompt');
  const params = useLocalSearchParams<{ flow?: string }>();
  const isMandatoryPhoneFlow = params.flow === 'phone';

  const [pinEntry, setPinEntry] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // R8: En flujo obligatorio por teléfono se bloquea el botón físico "Atrás" de Android.
  useEffect(() => {
    if (!isMandatoryPhoneFlow) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      subscription.remove();
    };
  }, [isMandatoryPhoneFlow]);

  const handleBackPress = () => {
    if (isMandatoryPhoneFlow) {
      return;
    }
    handleBack('/(auth)/quick-access-prompt');
  };

  const handleKeyPress = (digit: string) => {
    if (isSaving) return;
    setError(null);
    setPinEntry(prev => (prev.length < PIN_LENGTH ? prev + digit : prev));
  };

  const handleDelete = () => {
    if (isSaving) return;
    setError(null);
    setPinEntry(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  const handleContinuePress = async () => {
    if (pinEntry.length < PIN_LENGTH || isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const pinHash = computeLocalPinHash(pinEntry);
      await savePinHash(pinHash);
      router.replace('/(auth)/biometrics');
    } catch {
      setError('No se pudo guardar el PIN en el dispositivo.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    pinEntry,
    pinLength: PIN_LENGTH,
    error,
    isSaving,
    isOffline,
    isMandatoryPhoneFlow,
    handleBackPress,
    handleKeyPress,
    handleDelete,
    handleContinuePress,
  };
}
