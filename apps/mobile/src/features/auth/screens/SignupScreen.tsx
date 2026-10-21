import { router } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { useTheme } from '@/theme';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { SignupAccountStep } from '../components/SignupAccountStep';
import { SignupCompanyStep } from '../components/SignupCompanyStep';
import { useSignupFlow } from '../hooks/useSignupFlow';

const LOGO_HEIGHT = 48;
const STEPBAR_WIDTH = 24;
const STEPBAR_HEIGHT = 4;
const SHEET_ICON_SIZE = 48;
const ICON_SIZE = 20;

export function SignupScreen() {
  const { colors, spacing, radius, typography } = useTheme();

  const {
    step,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    step1Errors,
    setStep1Errors,
    companyName,
    setCompanyName,
    businessActivity,
    setBusinessActivity,
    city,
    setCity,
    whatsapp,
    setWhatsapp,
    submitError,
    isSubmitting,
    handleBackPress,
    handleContinueStep1,
    handleRegisterSubmit,
  } = useSignupFlow();

  const renderHeader = () => {
    if (step === 1) {
      return (
        <View style={[styles.headerCenter, { gap: spacing.space2 }]}>
          <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />
          <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
            Crea tu cuenta
          </Text>
          <View style={[styles.stepbarRow, { gap: spacing.space1, marginTop: spacing.space1 }]}>
            <View
              style={{
                width: STEPBAR_WIDTH,
                height: STEPBAR_HEIGHT,
                borderRadius: radius.sm,
                backgroundColor: colors.primary,
              }}
            />
            <View
              style={{
                width: STEPBAR_WIDTH,
                height: STEPBAR_HEIGHT,
                borderRadius: radius.sm,
                backgroundColor: colors.line,
              }}
            />
            <Text style={[typography.label, { color: colors.inkMuted }]}>PASO 1 DE 2</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.headerCenter, { gap: spacing.space1 }]}>
        <View
          style={[
            styles.sheetIcon,
            {
              width: SHEET_ICON_SIZE,
              height: SHEET_ICON_SIZE,
              borderRadius: radius.pill,
              backgroundColor: colors.primarySoft,
            },
          ]}
        >
          <Building2 size={ICON_SIZE} color={colors.primaryInk} />
        </View>
        <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
          Cuéntanos de tu empresa
        </Text>
        <Text
          style={[
            typography.small,
            styles.centerText,
            styles.subtitleMaxWidth,
            { color: colors.inkMuted },
          ]}
        >
          Con esto armamos tu espacio. Podrás cambiarlo luego en Configuración → Empresa.
        </Text>
        <View style={[styles.stepbarRow, { gap: spacing.space1, marginTop: spacing.space1 }]}>
          <View
            style={{
              width: STEPBAR_WIDTH,
              height: STEPBAR_HEIGHT,
              borderRadius: radius.sm,
              backgroundColor: colors.primary,
            }}
          />
          <View
            style={{
              width: STEPBAR_WIDTH,
              height: STEPBAR_HEIGHT,
              borderRadius: radius.sm,
              backgroundColor: colors.primary,
            }}
          />
          <Text style={[typography.label, { color: colors.inkMuted }]}>PASO 2 DE 2</Text>
        </View>
      </View>
    );
  };

  return (
    <AuthScreenLayout
      testID="signup-screen"
      backButtonTestID="signup-back-btn"
      onBackPress={handleBackPress}
    >
      <View style={{ gap: spacing.space4 }}>
        {renderHeader()}

        <AlertBanner message={submitError} tone="danger" testID="signup-submit-error" />

        {step === 1 ? (
          <SignupAccountStep
            fullName={fullName}
            onChangeFullName={name => {
              setFullName(name);
              if (step1Errors.name) setStep1Errors(prev => ({ ...prev, name: undefined }));
            }}
            email={email}
            onChangeEmail={val => {
              setEmail(val);
              if (step1Errors.email) setStep1Errors(prev => ({ ...prev, email: undefined }));
            }}
            password={password}
            onChangePassword={val => {
              setPassword(val);
              if (step1Errors.password) setStep1Errors(prev => ({ ...prev, password: undefined }));
            }}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(p => !p)}
            nameError={step1Errors.name}
            emailError={step1Errors.email}
            passwordError={step1Errors.password}
            onContinue={handleContinueStep1}
            onGoToLogin={() => router.push('/(auth)/login_email')}
          />
        ) : (
          <SignupCompanyStep
            companyName={companyName}
            onChangeCompanyName={setCompanyName}
            businessActivity={businessActivity}
            onChangeBusinessActivity={setBusinessActivity}
            city={city}
            onChangeCity={setCity}
            whatsapp={whatsapp}
            onChangeWhatsapp={setWhatsapp}
            isSubmitting={isSubmitting}
            onSubmit={() => void handleRegisterSubmit()}
            onPrevStep={() => setStep1Errors({})}
          />
        )}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerCenter: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  subtitleMaxWidth: {
    maxWidth: 280,
  },
  stepbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
