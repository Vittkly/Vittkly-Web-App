import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface PinDotsProps {
  length?: number;
  valueLength: number;
  hasError?: boolean;
  testIDPrefix?: string;
  style?: StyleProp<ViewStyle>;
}

const DOT_SIZE = 16;

export function PinDots({
  length = 4,
  valueLength,
  hasError = false,
  testIDPrefix = 'pin-dot',
  style,
}: PinDotsProps) {
  const { colors, spacing, radius, borderWidth } = useTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${valueLength} de ${length} dígitos ingresados`}
      style={[styles.container, { gap: spacing.space4 }, style]}
    >
      {Array.from({ length }).map((_, index) => {
        const isFilled = index < valueLength;
        const backgroundColor = hasError ? colors.dangerInk : isFilled ? colors.ink : 'transparent';
        const borderColor = hasError ? colors.dangerInk : isFilled ? colors.ink : colors.lineStrong;

        return (
          <View
            key={index}
            testID={`${testIDPrefix}-${index}`}
            style={[
              styles.dot,
              {
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: radius.pill,
                borderWidth: borderWidth.dot,
                backgroundColor,
                borderColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    overflow: 'hidden',
  },
});
