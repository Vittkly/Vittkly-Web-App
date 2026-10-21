import { Fingerprint, ScanFace } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  Vibration,
  View,
  type ViewStyle,
} from 'react-native';

import { NumericKeypad } from '@/components/ui/NumericKeypad';
import { PinDots } from '@/components/ui/PinDots';
import { useTheme } from '@/theme';

import type { BiometricType } from '../types/auth.types';

export interface PinPadLockProps {
  pin: string;
  length?: number;
  error?: string | boolean | null;
  /** Mensaje informativo bajo los puntos (instrucción / aviso). Se oculta si hay `error`. */
  helperText?: string | null;
  helperTone?: 'muted' | 'danger';
  disabled?: boolean;
  biometricAvailable?: boolean;
  biometricType?: BiometricType;
  onKeyPress: (digit: string) => void;
  onDelete: () => void;
  onBiometricPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const KEY_WIDTH = 72;
const KEY_HEIGHT = 64;
const ICON_SIZE = 24;

function triggerSafeHaptic(durationMs: number): void {
  if (Platform.OS === 'web') return;
  try {
    Vibration.vibrate(durationMs);
  } catch {
    // Fallback silencioso
  }
}

/**
 * Teclado numérico táctil en rejilla (72×64px por botón) para PIN de seguridad local y desbloqueo biométrico.
 */
export function PinPadLock({
  pin,
  length = 4,
  error = null,
  helperText = null,
  helperTone = 'muted',
  disabled = false,
  biometricAvailable = false,
  biometricType = 'fingerprint',
  onKeyPress,
  onDelete,
  onBiometricPress,
  style,
  testID = 'pin-pad-lock',
}: PinPadLockProps) {
  const { colors, spacing, radius, typography, opacity } = useTheme();

  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' && error.trim().length > 0 ? error : null;

  useEffect(() => {
    if (hasError) {
      triggerSafeHaptic(80);
    }
  }, [hasError]);

  const handleDigitPress = (digit: string) => {
    if (disabled || pin.length >= length) return;
    onKeyPress(digit);
  };

  const handleBiometricAction = () => {
    if (disabled || !biometricAvailable || !onBiometricPress) return;
    triggerSafeHaptic(15);
    onBiometricPress();
  };

  const BiometricIcon = biometricType === 'facial' ? ScanFace : Fingerprint;
  const biometricAccessibilityLabel =
    biometricType === 'facial'
      ? 'Desbloquear con reconocimiento facial'
      : 'Desbloquear con huella dactilar';

  const renderBiometricSlot = () => {
    if (!biometricAvailable || !onBiometricPress) {
      return (
        <View key="bio-placeholder" testID="pin-pad-bio-placeholder" style={styles.keyDimensions} />
      );
    }

    return (
      <Pressable
        key="bio"
        testID="pin-pad-btn-biometric"
        accessibilityRole="button"
        accessibilityLabel={biometricAccessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handleBiometricAction}
        style={({ pressed }) => [
          styles.keyButton,
          styles.keyDimensions,
          {
            borderRadius: radius.lg,
            backgroundColor: pressed ? colors.primarySoft : 'transparent',
            opacity: disabled ? opacity.disabled : 1,
          },
        ]}
      >
        <BiometricIcon
          size={ICON_SIZE}
          color={colors.primary}
          strokeWidth={biometricType === 'facial' ? 2 : 1.75}
        />
      </Pressable>
    );
  };

  return (
    <View testID={testID} style={[styles.container, { gap: spacing.space8 }, style]}>
      <View style={[styles.statusArea, { gap: spacing.space3 }]}>
        <PinDots length={length} valueLength={pin.length} hasError={hasError} />

        {errorMessage ? (
          <Text
            testID="pin-pad-error-message"
            accessibilityLiveRegion="polite"
            style={[typography.small, styles.errorText, { color: colors.dangerInk }]}
          >
            {errorMessage}
          </Text>
        ) : helperText ? (
          <Text
            testID="pin-pad-helper-text"
            accessibilityLiveRegion="polite"
            style={[
              typography.small,
              styles.errorText,
              {
                color: helperTone === 'danger' ? colors.dangerInk : colors.inkMuted,
              },
            ]}
          >
            {helperText}
          </Text>
        ) : null}
      </View>

      <NumericKeypad
        onDigitPress={handleDigitPress}
        onDeletePress={onDelete}
        leftSlot={renderBiometricSlot()}
        disabled={disabled}
        testIDPrefix="pin-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  statusArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  errorText: {
    textAlign: 'center',
  },
  keyDimensions: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
  },
  keyButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
