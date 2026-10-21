import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/theme';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { CountryPicker } from '../components/CountryPicker';
import { usePhoneEntry } from '../hooks/usePhoneEntry';

const LOGO_HEIGHT = 48;
const CHEVRON_SIZE = 16;

export function PhoneScreen() {
  const { colors, spacing, typography, control } = useTheme();

  const {
    selectedCountry,
    setSelectedCountry,
    showCountryPicker,
    setShowCountryPicker,
    phoneNumber,
    setPhoneNumber,
    error,
    setError,
    isSubmitting,
    handleBackPress,
    handleSendCode,
  } = usePhoneEntry();

  return (
    <AuthScreenLayout
      testID="phone-screen"
      backButtonTestID="phone-back-btn"
      onBackPress={handleBackPress}
    >
      <View style={[styles.centerBody, { gap: spacing.space6 }]}>
        <View style={[styles.headerCenter, { gap: spacing.space2 }]}>
          <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />
          <View style={{ gap: spacing.space1 }}>
            <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
              Ingresa tu celular
            </Text>
            <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
              Te enviaremos un código por WhatsApp o correo.
            </Text>
          </View>
        </View>

        <View style={[styles.formCard, { gap: spacing.space3 }]}>
          <View style={{ gap: spacing.space1 }}>
            <Text style={[typography.small, styles.fieldLabel, { color: colors.inkMuted }]}>
              Número de celular
            </Text>

            <View style={[styles.phoneRow, { gap: spacing.space3 }]}>
              <Pressable
                testID="phone-country-selector-btn"
                accessibilityRole="button"
                accessibilityLabel={`País ${selectedCountry.name} ${selectedCountry.dial}`}
                onPress={() => setShowCountryPicker(prev => !prev)}
                style={[
                  styles.dialButton,
                  {
                    minHeight: control.lg,
                    borderBottomColor: colors.lineStrong,
                    gap: spacing.space1,
                  },
                ]}
              >
                <Text style={[typography.bodyStrong, { color: colors.ink }]}>
                  {selectedCountry.dial}
                </Text>
                <ChevronDown size={CHEVRON_SIZE} color={colors.inkMuted} />
              </Pressable>

              <TextInput
                testID="phone-number-input"
                value={phoneNumber}
                editable={!isSubmitting}
                onChangeText={text => {
                  setPhoneNumber(text.replace(/[^\d\s-]/g, ''));
                  setError(null);
                }}
                placeholder="987 654 321"
                placeholderTextColor={colors.inkMuted}
                keyboardType="phone-pad"
                inputMode="tel"
                style={[
                  typography.body,
                  styles.underlineInput,
                  styles.flex,
                  {
                    minHeight: control.lg,
                    borderBottomColor: error ? colors.dangerInk : colors.lineStrong,
                    color: colors.ink,
                  },
                ]}
              />
            </View>

            <Text style={[typography.small, { color: colors.inkMuted }]}>
              {selectedCountry.name}
            </Text>

            <CountryPicker
              selectedCountry={selectedCountry}
              onSelectCountry={c => {
                setSelectedCountry(c);
                setShowCountryPicker(false);
              }}
              visible={showCountryPicker}
            />
          </View>

          {error ? (
            <Text testID="phone-error-text" style={[typography.small, { color: colors.dangerInk }]}>
              {error}
            </Text>
          ) : null}

          <Button
            testID="phone-submit-btn"
            variant="inverse"
            shape="pill"
            block
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onPress={() => void handleSendCode()}
          >
            Enviar código
          </Button>

          <Text style={[typography.small, styles.legalNotice, { color: colors.inkMuted }]}>
            Usamos tu celular para validar que eres técnico del equipo.
          </Text>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  centerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 320,
  },
  fieldLabel: {
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
  },
  underlineInput: {
    borderBottomWidth: 1.5,
    paddingVertical: 0,
  },
  flex: {
    flex: 1,
  },
  legalNotice: {
    textAlign: 'center',
  },
});
