import React, { useState } from 'react';
import { StyleProp, StyleSheet, Vibration, View, ViewStyle } from 'react-native';

import { NumericKeypad } from '@/components/ui/NumericKeypad';
import { PinDots } from '@/components/ui/PinDots';
import { useTheme } from '@/theme/useTheme';

export interface PinPadProps {
  length?: number;
  defaultValue?: string;
  value?: string;
  error?: boolean;
  onChange?: (pin: string) => void;
  onComplete?: (pin: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * PIN de 4 dígitos con teclado propio, para entrar rápido a la app del técnico incluso sin conexión.
 * - Teclas de 72 × 64 px (`radius-lg` = 14px): se usan con el pulgar y con guantes.
 * - Cuando `error={true}`, los puntos se pintan en `dangerInk`.
 */
export function PinPad({
  length = 4,
  defaultValue = '',
  value,
  error = false,
  onChange,
  onComplete,
  style,
}: PinPadProps) {
  const { spacing } = useTheme();
  const [internalPin, setInternalPin] = useState(defaultValue.replace(/\D/g, '').slice(0, length));

  const currentPin = value !== undefined ? value : internalPin;

  const handleDigitPress = (digit: string) => {
    if (currentPin.length >= length) return;
    const next = currentPin + digit;
    if (value === undefined) {
      setInternalPin(next);
    }
    onChange?.(next);
    if (next.length === length) {
      onComplete?.(next);
    }
  };

  const handleDelete = () => {
    if (!currentPin.length) return;
    const next = currentPin.slice(0, -1);
    if (value === undefined) {
      setInternalPin(next);
    }
    onChange?.(next);
  };

  React.useEffect(() => {
    if (error) {
      try {
        Vibration.vibrate(80);
      } catch {
        // Ignorar si el dispositivo/entorno no soporta vibración
      }
    }
  }, [error]);

  return (
    <View style={[styles.container, { gap: spacing.space8 }, style]}>
      <PinDots length={length} valueLength={currentPin.length} hasError={error} />
      <NumericKeypad
        onDigitPress={handleDigitPress}
        onDeletePress={handleDelete}
        testIDPrefix="pin-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
