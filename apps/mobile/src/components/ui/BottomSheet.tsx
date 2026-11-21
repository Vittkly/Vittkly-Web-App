import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export interface BottomSheetProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BottomSheet({ children, style, testID = 'bottom-sheet' }: BottomSheetProps) {
  const { colors, spacing, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(spacing.space8, insets.bottom + spacing.space4);

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
          paddingBottom: bottomPadding,
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
