import React from 'react';
import { Insets, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { BackIcon } from '@/components/icons';
import { useTheme } from '@/theme';

export interface BackButtonProps {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const ICON_SIZE = 20;
const HIT_SLOP: Insets = { top: 4, bottom: 4, left: 4, right: 4 };

export function BackButton({
  onPress,
  testID = 'back-btn',
  accessibilityLabel = 'Volver',
  style,
}: BackButtonProps) {
  const { colors, control, radius } = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: control.lg,
          height: control.lg,
          borderRadius: radius.pill,
          backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
        },
        style,
      ]}
    >
      <BackIcon size={ICON_SIZE} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
