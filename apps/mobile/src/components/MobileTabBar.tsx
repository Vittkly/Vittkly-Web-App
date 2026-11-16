import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BarChartIcon,
  CalendarIcon,
  CardIcon,
  HomeIcon,
  ListIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from '@/components/icons';
import { useTheme } from '@/theme/useTheme';

export type NavIconName =
  'home' | 'calendar' | 'list' | 'user' | 'users' | 'chart' | 'wallet' | 'settings';

export interface NavItem {
  label: string;
  href?: string;
  icon?: NavIconName;
  active?: boolean;
  count?: number;
  onPress?: () => void;
  testID?: string;
}

export interface MobileTabBarProps {
  items?: NavItem[];
  onSelect?: (item: NavItem, index: number) => void;
  style?: StyleProp<ViewStyle>;
}

const ICON_MAP: Record<
  NavIconName,
  React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  home: HomeIcon,
  calendar: CalendarIcon,
  list: ListIcon,
  user: UserIcon,
  users: UsersIcon,
  chart: BarChartIcon,
  wallet: CardIcon,
  settings: SettingsIcon,
};

export const DEFAULT_TECHNICIAN_TABS: NavItem[] = [
  { label: 'Hoy', icon: 'home', active: true },
  { label: 'Agenda', icon: 'calendar' },
  { label: 'Perfil', icon: 'user' },
];

/**
 * Barra inferior de navegación de la app del técnico/supervisor.
 * - Cada pestaña mide al menos `control-lg` (48 px) de alto.
 * - Íconos con píldora activa (`34 × 26 px`) y etiqueta siempre visible.
 * - Pestañas base por defecto: Hoy, Agenda, Perfil.
 */
export function MobileTabBar({
  items = DEFAULT_TECHNICIAN_TABS,
  onSelect,
  style,
}: MobileTabBarProps) {
  const { colors, control, spacing, radius, fontFamilies } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Navegación"
      style={[
        styles.bar,
        {
          backgroundColor: colors.surfaceRaised,
          borderTopColor: colors.line,
          paddingTop: spacing.space1,
          paddingHorizontal: spacing.space2,
          paddingBottom: Math.max(spacing.space1, insets.bottom),
        },
        style,
      ]}
    >
      {items.map((item, idx) => {
        const Icon = ICON_MAP[item.icon ?? 'home'] ?? HomeIcon;
        const isActive = !!item.active;
        const tint = isActive ? colors.primaryInk : colors.inkMuted;

        return (
          <Pressable
            key={item.label}
            testID={item.testID}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              item.onPress?.();
              onSelect?.(item, idx);
            }}
            style={({ pressed }) => [
              styles.tab,
              {
                minHeight: control.lg, // 48px obligatorio
                borderRadius: radius.md,
                backgroundColor: pressed ? colors.surfaceSunken : 'transparent',
              },
            ]}
          >
            <View
              style={[
                styles.iconPill,
                {
                  borderRadius: radius.pill,
                  backgroundColor: isActive ? colors.primarySoft : 'transparent',
                },
              ]}
            >
              <Icon size={22} color={tint} strokeWidth={2} />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: tint,
                  fontFamily: isActive ? fontFamilies.bold : fontFamilies.semiBold,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  iconPill: {
    width: 34,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
