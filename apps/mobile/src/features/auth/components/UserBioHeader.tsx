import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { useTheme } from '@/theme';

export interface UserBioHeaderProps {
  fullName: string;
  initials: string;
  subtitle: string;
  testID?: string;
}

const LOGO_HEIGHT = 40;
const BIO_AVATAR_SIZE = 64;

export function UserBioHeader({
  fullName,
  initials,
  subtitle,
  testID = 'pin-lock-user-bio',
}: UserBioHeaderProps) {
  const { colors, spacing, radius, typography, fontFamilies } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.bioContainer,
        {
          gap: spacing.space2,
          paddingTop: spacing.space2,
        },
      ]}
    >
      <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />

      <View
        style={[
          styles.bioAvatar,
          {
            width: BIO_AVATAR_SIZE,
            height: BIO_AVATAR_SIZE,
            borderRadius: radius.pill,
            backgroundColor: colors.primarySoft,
            marginTop: spacing.space2,
          },
        ]}
      >
        <Text
          style={[
            typography.title2,
            {
              fontFamily: fontFamilies.bold,
              color: colors.primaryInk,
            },
          ]}
        >
          {initials}
        </Text>
      </View>

      <Text
        testID="pin-lock-user-fullname"
        style={[typography.title2, styles.centerText, { color: colors.ink }]}
      >
        {fullName}
      </Text>

      <View
        testID="pin-lock-role-badge"
        style={[
          styles.bioTenantPill,
          {
            backgroundColor: colors.surfaceSunken,
            borderRadius: radius.pill,
            paddingVertical: spacing.space1,
            paddingHorizontal: spacing.space3,
          },
        ]}
      >
        <Text
          testID="pin-lock-user-role"
          style={[typography.small, styles.centerText, { color: colors.inkMuted }]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioTenantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});
