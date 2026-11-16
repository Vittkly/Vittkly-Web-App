import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, type ButtonVariant } from '@/components/Button';
import { VittklyIcon, type VittklyIconName } from '@/components/icons';
import { useTheme } from '@/theme';

export type ActionSheetIconTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface ActionSheetAction {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: VittklyIconName;
  disabled?: boolean;
  isLoading?: boolean;
  testID?: string;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: VittklyIconName;
  iconTone?: ActionSheetIconTone;
  actions?: ActionSheetAction[];
  children?: React.ReactNode;
  dismissOnBackdropPress?: boolean;
  testID?: string;
}

/**
 * Hoja modal inferior con scrim semántico, handle táctil e ícono opcional,
 * alineada con `.vk-scrim` + `.vk-sheet` de `vittkly-campo-app.html`.
 */
export function ActionSheet({
  visible,
  onClose,
  title,
  description,
  icon,
  iconTone = 'primary',
  actions = [],
  children,
  dismissOnBackdropPress = true,
  testID = 'action-sheet',
}: ActionSheetProps) {
  const { colors, spacing, radius, control, typography, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const iconPalette: Record<ActionSheetIconTone, { bg: string; fg: string }> = {
    primary: { bg: colors.primarySoft, fg: colors.primaryInk },
    success: { bg: colors.successSoft, fg: colors.successInk },
    warning: { bg: colors.warningSoft, fg: colors.warningInk },
    danger: { bg: colors.dangerSoft, fg: colors.dangerInk },
    neutral: { bg: colors.surfaceSunken, fg: colors.inkMuted },
  };

  const badgeColors = iconPalette[iconTone];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.scrim, { backgroundColor: colors.scrim }]}>
        <Pressable
          testID={`${testID}-backdrop`}
          accessibilityRole="button"
          accessibilityLabel="Cerrar panel"
          onPress={dismissOnBackdropPress ? onClose : undefined}
          style={StyleSheet.absoluteFill}
        />

        <View
          testID={testID}
          accessibilityViewIsModal
          style={[
            styles.sheet,
            shadows.shadow2,
            {
              backgroundColor: colors.surfaceRaised,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingHorizontal: spacing.space6,
              paddingTop: spacing.space3,
              paddingBottom: Math.max(spacing.space6, insets.bottom + spacing.space4),
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              {
                borderRadius: radius.pill,
                backgroundColor: colors.lineStrong,
                marginBottom: spacing.space3,
              },
            ]}
          />

          {icon ? (
            <View
              style={[
                styles.iconBadge,
                {
                  width: control.lg,
                  height: control.lg,
                  borderRadius: radius.pill,
                  backgroundColor: badgeColors.bg,
                  marginBottom: spacing.space2,
                },
              ]}
            >
              <VittklyIcon name={icon} size={22} color={badgeColors.fg} />
            </View>
          ) : null}

          <Text
            testID={`${testID}-title`}
            accessibilityRole="header"
            style={[typography.title2, { color: colors.ink }]}
          >
            {title}
          </Text>

          {description ? (
            <Text
              testID={`${testID}-description`}
              style={[typography.small, { color: colors.inkMuted, marginTop: spacing.space1 }]}
            >
              {description}
            </Text>
          ) : null}

          {children ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ marginTop: spacing.space3, maxHeight: 320 }}
            >
              {children}
            </ScrollView>
          ) : null}

          {actions.length > 0 ? (
            <View style={{ gap: spacing.space2, marginTop: spacing.space4 }}>
              {actions.map((action, index) => (
                <Button
                  key={`${action.label}-${index}`}
                  variant={action.variant ?? 'secondary'}
                  icon={action.icon}
                  size="lg"
                  block
                  disabled={action.disabled}
                  isLoading={action.isLoading}
                  testID={action.testID}
                  onPress={action.onPress}
                >
                  {action.label}
                </Button>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
  },
  iconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
