import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Insets, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface BackButtonProps {
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const BUTTON_SIZE = 40;
const ICON_SIZE = 20;
const HIT_SLOP: Insets = { top: 8, bottom: 8, left: 8, right: 8 };

export function BackButton({
  onPress,
  testID = 'back-btn',
  accessibilityLabel = 'Volver',
  style,
}: BackButtonProps) {
  const { colors, radius } = useTheme();

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
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: radius.pill,
          backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
        },
        style,
      ]}
    >
      <ArrowLeft size={ICON_SIZE} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
