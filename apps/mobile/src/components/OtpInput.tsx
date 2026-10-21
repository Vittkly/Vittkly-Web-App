import React, { useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface OtpInputProps {
  length?: number;
  defaultValue?: string;
  value?: string;
  error?: boolean;
  label?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Casillas para el código de verificación enviado por WhatsApp o SMS (6 dígitos por defecto).
 * - El foco avanza solo y Retroceso vuelve a la casilla anterior.
 * - La primera casilla acepta el autocompletado del sistema (`oneTimeCode` / `sms-otp`).
 * - `error` pinta las casillas en `dangerInk` y fondo `dangerSoft`.
 */
export function OtpInput({
  length = 6,
  defaultValue = '',
  value,
  error = false,
  label = 'Código de verificación',
  onChange,
  onComplete,
  style,
}: OtpInputProps) {
  const { colors, spacing, radius, fontFamilies } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [internalDigits, setInternalDigits] = useState<string[]>(() => {
    const initial = defaultValue.replace(/\D/g, '').slice(0, length).split('');
    return Array.from({ length }, (_, idx) => initial[idx] ?? '');
  });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const digits =
    value !== undefined ? Array.from({ length }, (_, idx) => value[idx] ?? '') : internalDigits;

  const updateDigits = (nextDigits: string[]) => {
    if (value === undefined) {
      setInternalDigits(nextDigits);
    }
    const code = nextDigits.join('');
    onChange?.(code);
    if (code.length === length && nextDigits.every(d => d.length === 1)) {
      onComplete?.(code);
    }
  };

  const handleChangeText = (index: number, text: string) => {
    const clean = text.replace(/\D/g, '');

    if (clean.length > 1) {
      // Pegado o autocompletado de varios dígitos
      const next = [...digits];
      for (let i = 0; i < clean.length && index + i < length; i++) {
        next[index + i] = clean[i];
      }
      updateDigits(next);
      const nextFocus = Math.min(index + clean.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const ch = clean.slice(-1);
    const next = [...digits];
    next[index] = ch;
    updateDigits(next);

    if (ch && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      updateDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.row,
        {
          gap: spacing.space2,
        },
        style,
      ]}
    >
      {Array.from({ length }).map((_, i) => {
        const isFocused = focusedIndex === i;
        return (
          <TextInput
            key={i}
            ref={el => {
              inputRefs.current[i] = el;
            }}
            value={digits[i] ?? ''}
            onChangeText={txt => handleChangeText(i, txt)}
            onKeyPress={e => handleKeyPress(i, e)}
            onFocus={() => setFocusedIndex(i)}
            onBlur={() => setFocusedIndex(prev => (prev === i ? null : prev))}
            keyboardType="number-pad"
            inputMode="numeric"
            textContentType={i === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={i === 0 ? 'sms-otp' : 'off'}
            maxLength={i === 0 ? length : 1}
            selectTextOnFocus
            accessibilityLabel={`Dígito ${i + 1}`}
            style={[
              styles.box,
              {
                borderRadius: radius.md,
                fontFamily: fontFamilies.bold,
                color: colors.ink,
                backgroundColor: error ? colors.dangerSoft : colors.surfaceRaised,
                borderColor: error
                  ? colors.dangerInk
                  : isFocused
                    ? colors.focus
                    : colors.lineStrong,
                borderWidth: isFocused ? 2 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 46,
    height: 56, // >= control-lg (48px)
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
});
