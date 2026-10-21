import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface BottomSheetProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BottomSheet({ children, style, testID = 'bottom-sheet' }: BottomSheetProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        shadows.shadow2,
        {
          backgroundColor: colors.surfaceRaised,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingHorizontal: spacing.space6,
          paddingTop: spacing.space6,
          paddingBottom: spacing.space8,
          gap: spacing.space3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
