import { Delete } from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  Vibration,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export interface KeypadSlotAction {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
  disabled?: boolean;
}

export interface NumericKeypadProps {
  onDigitPress: (digit: string) => void;
  onDeletePress?: () => void;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  disabled?: boolean;
  testIDPrefix?: string;
  style?: StyleProp<ViewStyle>;
}

const KEY_WIDTH = 72;
const KEY_HEIGHT = 64;
const ICON_SIZE = 22;

const DIGIT_ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

function triggerSafeHaptic(durationMs = 15) {
  if (Platform.OS === 'web') return;
  try {
    Vibration.vibrate(durationMs);
  } catch {
    // Silencioso si no hay soporte de vibración
  }
}

export function NumericKeypad({
  onDigitPress,
  onDeletePress,
  leftSlot,
  rightSlot,
  disabled = false,
  testIDPrefix = 'pin-pad',
  style,
}: NumericKeypadProps) {
  const { colors, spacing, radius, typography, fontWeights, opacity } = useTheme();

  const handleDigit = (digit: string) => {
    if (disabled) return;
    triggerSafeHaptic(15);
    onDigitPress(digit);
  };

  const handleDelete = () => {
    if (disabled || !onDeletePress) return;
    triggerSafeHaptic(10);
    onDeletePress();
  };

  const renderDefaultDeleteButton = () => {
    if (!onDeletePress) {
      return <View style={styles.keyDimensions} />;
    }

    return (
      <Pressable
        testID={`${testIDPrefix}-btn-del`}
        accessibilityRole="button"
        accessibilityLabel="Borrar último dígito"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handleDelete}
        style={({ pressed }) => [
          styles.keyButton,
          styles.keyDimensions,
          {
            borderRadius: radius.lg,
            backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
            opacity: disabled ? opacity.disabled : 1,
          },
        ]}
      >
        <Delete size={ICON_SIZE} color={colors.inkMuted} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.grid, { rowGap: spacing.space3 }, style]}>
      {DIGIT_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.gridRow, { columnGap: spacing.space6 }]}>
          {row.map(digit => (
            <Pressable
              key={digit}
              testID={`${testIDPrefix}-btn-${digit}`}
              accessibilityRole="button"
              accessibilityLabel={`Dígito ${digit}`}
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={() => handleDigit(digit)}
              style={({ pressed }) => [
                styles.keyButton,
                styles.keyDimensions,
                {
                  borderRadius: radius.lg,
                  backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
                  opacity: disabled ? opacity.disabled : 1,
                },
              ]}
            >
              <Text
                style={[
                  typography.title1,
                  styles.digitText,
                  {
                    color: colors.ink,
                    fontWeight: fontWeights.bold,
                  },
                ]}
              >
                {digit}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}

      {/* Fila inferior: leftSlot / '0' / rightSlot */}
      <View style={[styles.gridRow, { columnGap: spacing.space6 }]}>
        {leftSlot ?? <View style={styles.keyDimensions} />}

        <Pressable
          key="0"
          testID={`${testIDPrefix}-btn-0`}
          accessibilityRole="button"
          accessibilityLabel="Dígito 0"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => handleDigit('0')}
          style={({ pressed }) => [
            styles.keyButton,
            styles.keyDimensions,
            {
              borderRadius: radius.lg,
              backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
              opacity: disabled ? opacity.disabled : 1,
            },
          ]}
        >
          <Text
            style={[
              typography.title1,
              styles.digitText,
              {
                color: colors.ink,
                fontWeight: fontWeights.bold,
              },
            ]}
          >
            0
          </Text>
        </Pressable>

        {rightSlot ?? renderDefaultDeleteButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDimensions: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
  },
  keyButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
