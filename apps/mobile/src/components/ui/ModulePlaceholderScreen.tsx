import { Sparkles } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { CompanyCircleButton } from '@/components/ui/CompanyCircleButton';
import { useTheme } from '@/theme';

export interface ModulePlaceholderScreenProps {
  moduleCode: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  children?: ReactNode;
  testID?: string;
}

export function ModulePlaceholderScreen({
  moduleCode,
  title,
  subtitle,
  badgeText,
  children,
  testID,
}: ModulePlaceholderScreenProps) {
  const { colors, spacing, radius, typography, fontFamilies, isDark } = useTheme();

  return (
    <SafeAreaView
      edges={['top']}
      testID={testID}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      {/* Top Header con Logo y Selector de Empresa */}
      <View
        style={[
          styles.topHeader,
          {
            paddingHorizontal: spacing.space4,
            paddingVertical: spacing.space3,
            borderBottomColor: colors.line,
          },
        ]}
      >
        <Logo variant="wordmark" tone={isDark ? 'white' : 'color'} height={28} />
        <CompanyCircleButton />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.space4,
            paddingTop: spacing.space4,
            paddingBottom: spacing.space8,
            gap: spacing.space4,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Título de pantalla y Badge con Manrope Bold y JetBrains Mono */}
        <View style={[styles.titleBlock, { gap: spacing.space2 }]}>
          <View style={styles.titleRow}>
            <Text
              style={[
                typography.title1,
                {
                  fontFamily: fontFamilies.bold,
                  color: colors.ink,
                  flex: 1,
                },
              ]}
            >
              {title}
            </Text>

            <View
              style={[
                styles.codeBadge,
                {
                  backgroundColor: colors.surfaceSunken,
                  borderColor: colors.line,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.space3,
                  paddingVertical: spacing.space1,
                },
              ]}
            >
              <Text
                style={[
                  typography.small,
                  {
                    fontFamily: fontFamilies.mono,
                    fontSize: 11,
                    color: colors.inkMuted,
                    letterSpacing: 0.5,
                  },
                ]}
              >
                {badgeText ?? moduleCode}
              </Text>
            </View>
          </View>

          {subtitle ? (
            <Text style={[typography.body, { color: colors.inkMuted }]}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Cascarón visual limpio en bg-surface-raised y borde border-line */}
        <View
          style={[
            styles.placeholderContainer,
            {
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.line,
              borderRadius: radius.lg,
              padding: spacing.space6,
              gap: spacing.space4,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrapper,
              {
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                backgroundColor: colors.surfaceSunken,
                borderColor: colors.line,
              },
            ]}
          >
            <Sparkles size={20} color={colors.primaryInk} />
          </View>

          <View style={[styles.textBlock, { gap: spacing.space1 }]}>
            <Text
              style={[
                typography.title3,
                {
                  fontFamily: fontFamilies.bold,
                  color: colors.ink,
                  textAlign: 'center',
                },
              ]}
            >
              Módulo en preparación
            </Text>
            <Text
              style={[
                typography.body,
                {
                  color: colors.inkMuted,
                  textAlign: 'center',
                },
              ]}
            >
              Próximamente disponible • Vittkly Field Service
            </Text>
          </View>

          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: colors.surfaceSunken,
                borderColor: colors.line,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.space3,
                paddingVertical: 4,
              },
            ]}
          >
            <Text
              style={[
                typography.small,
                {
                  fontSize: 10,
                  fontFamily: fontFamilies.mono,
                  color: colors.inkMuted,
                },
              ]}
            >
              SaaS Multi-Tenant • {moduleCode}
            </Text>
          </View>
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  titleBlock: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  codeBadge: {
    borderWidth: 1,
  },
  placeholderContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 220,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textBlock: {
    alignItems: 'center',
  },
  tagPill: {
    borderWidth: 1,
  },
});
