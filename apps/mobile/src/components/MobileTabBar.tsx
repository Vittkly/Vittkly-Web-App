import {
  BarChart3,
  Calendar,
  ClipboardList,
  Home,
  Settings,
  User,
  Users,
  Wallet,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  home: Home,
  calendar: Calendar,
  list: ClipboardList,
  user: User,
  users: Users,
  chart: BarChart3,
  wallet: Wallet,
  settings: Settings,
};

export const DEFAULT_TECHNICIAN_TABS: NavItem[] = [
  { label: 'Hoy', icon: 'home', active: true },
  { label: 'Agenda', icon: 'calendar' },
  { label: 'Órdenes', icon: 'list' },
  { label: 'Perfil', icon: 'user' },
];

/**
 * Barra inferior de navegación de la app del técnico/supervisor.
 * - Cada pestaña mide al menos `control-lg` (48 px) de alto.
 * - Íconos de 24 px con etiqueta siempre visible.
 * - Pestañas del técnico por defecto: Hoy, Agenda, Órdenes, Perfil.
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
          paddingBottom: spacing.space1 + insets.bottom,
        },
        style,
      ]}
    >
      {items.map((item, idx) => {
        const Icon = ICON_MAP[item.icon ?? 'home'] ?? Home;
        const isActive = !!item.active;
        const tint = isActive ? colors.primaryInk : colors.inkMuted;

        return (
          <Pressable
            key={item.label}
            accessibilityRole="tab"
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
            <Icon size={24} color={tint} strokeWidth={2} />
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: tint,
                  fontFamily: fontFamilies.semiBold,
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
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
