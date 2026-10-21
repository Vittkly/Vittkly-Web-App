import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { FormField } from '@/components/ui/FormField';
import { useTheme } from '@/theme';

import type { ForgotMethod } from '../hooks/useForgotPassword';

export interface ForgotRequestStepProps {
  method: ForgotMethod;
  onSelectMethod: (method: ForgotMethod) => void;
  subtitle: string;
  email: string;
  onChangeEmail: (v: string) => void;
  phone: string;
  onChangePhone: (v: string) => void;
  error?: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const LOGO_HEIGHT = 48;
const CHEVRON_SIZE = 16;

const METHODS = [
  { key: 'email', label: 'Correo' },
  { key: 'sms', label: 'SMS' },
  { key: 'wsp', label: 'WhatsApp' },
] as const;

export function ForgotRequestStep({
  method,
  onSelectMethod,
  subtitle,
  email,
  onChangeEmail,
  phone,
  onChangePhone,
  error,
  isSubmitting,
  onSubmit,
}: ForgotRequestStepProps) {
  const { colors, spacing, radius, typography, control } = useTheme();

  return (
    <View style={[styles.centerBody, { gap: spacing.space4 }]}>
      <View style={[styles.formCard, { gap: spacing.space4 }]}>
        <View style={[styles.headerCenter, { gap: spacing.space1 }]}>
          <Logo variant="wordmark" tone="color" height={LOGO_HEIGHT} />
          <Text style={[typography.title2, styles.centerText, { color: colors.ink }]}>
            Recupera tu contraseña
          </Text>
          <Text style={[typography.small, styles.centerText, { color: colors.inkMuted }]}>
            {subtitle}
          </Text>
        </View>

        {/* Selector segmentado: Correo | SMS | WhatsApp */}
        <View
          style={[
            styles.segmentedControl,
            {
              backgroundColor: colors.surfaceSunken,
              borderRadius: radius.md,
              padding: spacing.space1,
              gap: spacing.space1,
            },
          ]}
        >
          {METHODS.map(tab => {
            const isActive = method === tab.key;
            return (
              <Pressable
                key={tab.key}
                testID={`forgot-tab-${tab.key}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => onSelectMethod(tab.key)}
                style={[
                  styles.segmentBtn,
                  {
                    minHeight: control.lg,
                    borderRadius: radius.sm,
                    backgroundColor: isActive ? colors.surfaceRaised : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    typography.small,
                    styles.boldText,
                    {
                      color: isActive ? colors.ink : colors.inkMuted,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <AlertBanner message={error} tone="danger" testID="forgot-error-box" />

        {method === 'email' ? (
          <FormField
            testID="forgot-email-input"
            label="Correo electrónico"
            value={email}
            editable={!isSubmitting}
            onChangeText={onChangeEmail}
            placeholder="tucorreo@empresa.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : (
          <View style={{ gap: spacing.space1 }}>
            <Text style={[typography.small, styles.fieldLabel, { color: colors.inkMuted }]}>
              Número de celular
            </Text>
            <View style={[styles.phoneRow, { gap: spacing.space3 }]}>
              <View
                style={[
                  styles.dialButton,
                  {
                    minHeight: control.lg,
                    borderBottomColor: colors.lineStrong,
                    gap: spacing.space1,
                  },
                ]}
              >
                <Text style={[typography.bodyStrong, { color: colors.ink }]}>+51</Text>
                <ChevronDown size={CHEVRON_SIZE} color={colors.inkMuted} />
              </View>
              <TextInput
                testID="forgot-phone-input"
                value={phone}
                editable={!isSubmitting}
                onChangeText={onChangePhone}
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
                    borderBottomColor: colors.lineStrong,
                    color: colors.ink,
                  },
                ]}
              />
            </View>
            <Text style={[typography.small, { color: colors.inkMuted }]}>Perú</Text>
          </View>
        )}

        <Button
          testID="forgot-submit-btn"
          variant="inverse"
          shape="pill"
          block
          isLoading={isSubmitting}
          disabled={isSubmitting}
          onPress={onSubmit}
        >
          Enviar código
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBody: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  formCard: {
    width: '100%',
    maxWidth: 320,
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldText: {
    fontWeight: '700',
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
});
