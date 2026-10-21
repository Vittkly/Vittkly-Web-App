import React, { useEffect, useRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

import { useOtpCountdown } from '../hooks/useOtpCountdown';
import { OtpTimer } from './OtpTimer';

export interface OtpVerificationProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  error?: string | boolean | null;
  disabled?: boolean;
  countdownSeconds?: number;
  focusVariant?: 'primary' | 'tenantAccent';
  label?: string;
  resendLabel?: string;
  onChange?: (code: string) => void;
  onCodeComplete: (code: string) => void;
  onResendCode?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const BORDER_WIDTH_DEFAULT = 1.5;
const BORDER_WIDTH_FOCUSED = 2;

/**
 * Componente presentacional de 6 celdas individuales para verificación de código OTP.
 */
export function OtpVerification({
  length = 6,
  value,
  defaultValue = '',
  error = null,
  disabled = false,
  countdownSeconds = 60,
  focusVariant = 'primary',
  label = 'Código de verificación',
  resendLabel = 'Reenviar código',
  onChange,
  onCodeComplete,
  onResendCode,
  style,
  testID = 'otp-verification',
}: OtpVerificationProps) {
  const { colors, spacing, radius, typography, control, fontFamilies } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [internalDigits, setInternalDigits] = useState<string[]>(() => {
    const initial = defaultValue.replace(/\D/g, '').slice(0, length).split('');
    return Array.from({ length }, (_, idx) => initial[idx] ?? '');
  });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const { formattedTime, isExpired, restart } = useOtpCountdown({
    initialSeconds: countdownSeconds,
    autoStart: true,
  });

  const digits =
    value !== undefined ? Array.from({ length }, (_, idx) => value[idx] ?? '') : internalDigits;

  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' && error.trim().length > 0 ? error : null;
  const activeFocusColor = focusVariant === 'tenantAccent' ? colors.tenantAccent : colors.primary;

  useEffect(() => {
    if (hasError && digits.every(d => d === '')) {
      inputRefs.current[0]?.focus();
    }
  }, [hasError, digits]);

  const commitDigits = (nextDigits: string[]) => {
    if (value === undefined) {
      setInternalDigits(nextDigits);
    }
    const code = nextDigits.join('');
    onChange?.(code);
    if (code.length === length && nextDigits.every(digit => digit.length === 1)) {
      onCodeComplete(code);
    }
  };

  const handleChangeText = (index: number, rawText: string) => {
    if (disabled) return;
    const cleanDigits = rawText.replace(/\D/g, '');

    if (cleanDigits.length > 1) {
      const next = [...digits];
      for (let i = 0; i < cleanDigits.length && index + i < length; i++) {
        next[index + i] = cleanDigits[i] ?? '';
      }
      commitDigits(next);
      const nextFocusIndex = Math.min(index + cleanDigits.length, length - 1);
      inputRefs.current[nextFocusIndex]?.focus();
      return;
    }

    const singleChar = cleanDigits.slice(-1);
    const next = [...digits];
    next[index] = singleChar;
    commitDigits(next);

    if (singleChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (disabled) return;
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      commitDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendPress = () => {
    if (!isExpired || disabled) return;
    restart(countdownSeconds);
    onResendCode?.();
  };

  return (
    <View testID={testID} style={[styles.container, { gap: spacing.space6 }, style]}>
      <View accessibilityLabel={label} style={[styles.cellsRow, { gap: spacing.space2 }]}>
        {Array.from({ length }).map((_, index) => {
          const isFocused = focusedIndex === index;
          const isFilled = Boolean(digits[index]);
          const borderColor = hasError
            ? colors.dangerInk
            : isFocused
              ? activeFocusColor
              : isFilled
                ? colors.tenantAccent
                : colors.lineStrong;

          return (
            <TextInput
              key={index}
              ref={el => {
                inputRefs.current[index] = el;
              }}
              testID={`otp-input-${index}`}
              value={digits[index] ?? ''}
              editable={!disabled}
              onChangeText={text => handleChangeText(index, text)}
              onKeyPress={e => handleKeyPress(index, e)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(prev => (prev === index ? null : prev))}
              keyboardType="number-pad"
              inputMode="numeric"
              textContentType={index === 0 ? 'oneTimeCode' : 'none'}
              autoComplete={index === 0 ? 'sms-otp' : 'off'}
              maxLength={index === 0 ? length : 1}
              selectTextOnFocus
              accessibilityLabel={`Dígito ${index + 1} de ${length}`}
              style={[
                styles.cell,
                typography.title1,
                {
                  fontFamily: fontFamilies.mono,
                  fontVariant: ['tabular-nums'],
                  minWidth: control.lg,
                  minHeight: control.lg + spacing.space2,
                  borderRadius: radius.md,
                  color: colors.ink,
                  backgroundColor: hasError
                    ? colors.dangerSoft
                    : isFocused
                      ? colors.primarySoft
                      : colors.surfaceRaised,
                  borderColor,
                  borderWidth: isFocused ? BORDER_WIDTH_FOCUSED : BORDER_WIDTH_DEFAULT,
                },
              ]}
            />
          );
        })}
      </View>

      {errorMessage ? (
        <Text
          testID="otp-error-message"
          accessibilityLiveRegion="polite"
          style={[typography.small, styles.centerText, { color: colors.dangerInk }]}
        >
          {errorMessage}
        </Text>
      ) : null}

      <OtpTimer
        formattedTime={formattedTime}
        isExpired={isExpired}
        disabled={disabled}
        resendLabel={resendLabel}
        onResendPress={handleResendPress}
        testIDPrefix="otp"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  cellsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});
