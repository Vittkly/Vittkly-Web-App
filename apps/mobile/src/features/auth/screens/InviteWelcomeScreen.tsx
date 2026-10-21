import { router, useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/theme';

import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/profile';

const LOGO_HEIGHT = 48;
const COMPANY_LOGO_SIZE = 64;
const INFO_ICON_SIZE = 18;

export function InviteWelcomeScreen() {
  const { colors, spacing, radius, typography, control, fontFamilies } = useTheme();
  const { isOffline } = useAuth();
  const params = useLocalSearchParams<{
    code?: string;
    organizationName?: string;
    jobTitle?: string;
    invitedName?: string;
    invitedPhone?: string;
  }>();

  const organizationName = params.organizationName || 'Vitta Kleanly';
  const invitedName = params.invitedName || 'Jorge';
  const jobTitle = params.jobTitle || 'Técnico de campo';
  const companyInitials = getInitials(organizationName);

  const handleAcceptInvitation = () => {
    router.push({
      pathname: '/(auth)/phone',
      params: {
        invitationCode: params.code ?? '',
        organizationName,
        jobTitle,
        invitedName,
        phone: params.invitedPhone ?? '',
      },
    });
  };

  return (
    <SafeAreaView
      testID="invite-welcome-screen"
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.space6,
            paddingVertical: spacing.space6,
            gap: spacing.space4,
          },
        ]}
      >
        <OfflineSessionBanner visible={isOffline} />

        <View style={[styles.centerBody, { gap: spacing.space4 }]}>
          <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />

          <View
            testID="invite-welcome-company-avatar"
            style={[
              styles.companyAvatar,
              {
                width: COMPANY_LOGO_SIZE,
                height: COMPANY_LOGO_SIZE,
                borderRadius: radius.pill,
                backgroundColor: colors.tenantAccentSoft,
                borderColor: colors.line,
                marginTop: spacing.space2,
              },
            ]}
          >
            <Text
              style={[
                typography.title2,
                {
                  fontFamily: fontFamilies.extraBold,
                  color: colors.successInk,
                },
              ]}
            >
              {companyInitials}
            </Text>
          </View>

          <View style={[styles.titleGroup, { gap: spacing.space2 }]}>
            <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
              {organizationName} te invitó a unirte
            </Text>
            <Text style={[typography.title1, styles.centerText, { color: colors.ink }]}>
              ¡Bienvenido, {invitedName}!
            </Text>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: colors.primarySoft,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.space3,
                  paddingVertical: spacing.space1,
                },
              ]}
            >
              <Text style={[typography.label, { color: colors.primaryInk }]}>{jobTitle}</Text>
            </View>
          </View>

          <View
            style={[
              styles.infoAlert,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: radius.lg,
                padding: spacing.space3,
                gap: spacing.space3,
              },
            ]}
          >
            <Info size={INFO_ICON_SIZE} color={colors.primaryInk} />
            <Text style={[typography.small, styles.flexText, { color: colors.ink }]}>
              Acepta para activar tu cuenta con tu número de celular.
            </Text>
          </View>

          <Button
            testID="invite-welcome-accept-btn"
            variant="inverse"
            shape="pill"
            block
            onPress={handleAcceptInvitation}
          >
            Aceptar invitación
          </Button>

          <Pressable
            testID="invite-welcome-decline-btn"
            accessibilityRole="button"
            accessibilityLabel="Ahora no"
            onPress={() => router.replace('/(auth)/welcome')}
            style={[styles.secondaryLink, { minHeight: control.lg }]}
          >
            <Text style={[typography.small, styles.underlineText, { color: colors.inkMuted }]}>
              Ahora no
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  companyAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  titleGroup: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  roleBadge: {
    alignSelf: 'center',
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  flexText: {
    flex: 1,
  },
  secondaryLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
