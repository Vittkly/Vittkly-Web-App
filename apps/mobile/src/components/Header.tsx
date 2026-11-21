import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { useTheme } from '@/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'hero';
  onBackPress?: () => void;
  backAccessibilityLabel?: string;
  rightSlot?: React.ReactNode;
  includeSafeArea?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const BACK_ICON_SIZE = 20;

/**
 * Cabecera superior de navegación interna alineada a `AppHeader` de `vittkly-campo-app.html`.
 * Respeta botón de retroceso táctil mínimo de `48 × 48 px` (`control.lg`) y soporte dual Light/Dark.
 */
export function Header({
  title,
  subtitle,
  variant = 'default',
  onBackPress,
  backAccessibilityLabel = 'Volver',
  rightSlot,
  includeSafeArea = false,
  style,
  testID = 'app-header',
}: HeaderProps) {
  const { colors, spacing, radius, control, typography, borderWidth } = useTheme();
  const isHero = variant === 'hero';

  const bar = (
    <View
      testID={testID}
      style={[
        styles.bar,
        {
          minHeight: control.lg + spacing.space2,
          paddingHorizontal: spacing.space4,
          paddingVertical: spacing.space2,
          gap: spacing.space2,
          backgroundColor: isHero ? colors.heroFrom : colors.surface,
          borderBottomColor: isHero ? colors.heroTo : colors.line,
          borderBottomWidth: borderWidth.thin,
        },
        style,
      ]}
    >
      {onBackPress ? (
        <Pressable
          testID={`${testID}-back-btn`}
          accessibilityRole="button"
          accessibilityLabel={backAccessibilityLabel}
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.backButton,
            {
              width: control.lg,
              height: control.lg,
              borderRadius: radius.pill,
              backgroundColor: pressed
                ? isHero
                  ? colors.heroChipBg
                  : colors.surfaceSunken
                : 'transparent',
            },
          ]}
        >
          <BackIcon size={BACK_ICON_SIZE} color={isHero ? colors.heroInk : colors.ink} />
        </Pressable>
      ) : null}

      <View style={styles.titleBlock}>
        <Text
          numberOfLines={1}
          accessibilityRole="header"
          testID={`${testID}-title`}
          style={[typography.title2, { color: isHero ? colors.heroInk : colors.ink }]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            testID={`${testID}-subtitle`}
            style={[typography.small, { color: isHero ? colors.heroInkSoft : colors.inkMuted }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightSlot ? (
        <View style={[styles.rightSlot, { gap: spacing.space2 }]}>{rightSlot}</View>
      ) : null}
    </View>
  );

  if (!includeSafeArea) {
    return bar;
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={{ backgroundColor: isHero ? colors.heroFrom : colors.surface }}
    >
      {bar}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
