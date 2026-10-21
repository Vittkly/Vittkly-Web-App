import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/ui/FormField';
import { useTheme } from '@/theme';

export interface SignupCompanyStepProps {
  companyName: string;
  onChangeCompanyName: (val: string) => void;
  businessActivity: string;
  onChangeBusinessActivity: (val: string) => void;
  city: string;
  onChangeCity: (val: string) => void;
  whatsapp: string;
  onChangeWhatsapp: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onPrevStep: () => void;
}

export function SignupCompanyStep({
  companyName,
  onChangeCompanyName,
  businessActivity,
  onChangeBusinessActivity,
  city,
  onChangeCity,
  whatsapp,
  onChangeWhatsapp,
  isSubmitting,
  onSubmit,
  onPrevStep,
}: SignupCompanyStepProps) {
  const { colors, spacing, typography, control } = useTheme();

  return (
    <View style={{ gap: spacing.space3 }}>
      <FormField
        testID="signup-company-name-input"
        label="Nombre de la empresa"
        value={companyName}
        editable={!isSubmitting}
        onChangeText={onChangeCompanyName}
        placeholder="Ej. Servifast Perú S.A.C."
      />

      <FormField
        testID="signup-activity-input"
        label="A qué se dedica (opcional)"
        value={businessActivity}
        editable={!isSubmitting}
        onChangeText={onChangeBusinessActivity}
        placeholder="Ej. Mantenimiento de aire acondicionado"
      />

      <FormField
        testID="signup-city-input"
        label="Ciudad"
        value={city}
        editable={!isSubmitting}
        onChangeText={onChangeCity}
        placeholder="Lima, Perú"
      />

      <FormField
        testID="signup-whatsapp-input"
        label="WhatsApp de la empresa (opcional)"
        value={whatsapp}
        editable={!isSubmitting}
        onChangeText={onChangeWhatsapp}
        placeholder="9xx xxx xxx"
        keyboardType="phone-pad"
        inputMode="tel"
      />

      <Button
        testID="signup-submit-btn"
        variant="inverse"
        shape="pill"
        block
        isLoading={isSubmitting}
        disabled={isSubmitting}
        onPress={onSubmit}
      >
        Registrarse
      </Button>

      <Pressable
        testID="signup-prev-step-btn"
        accessibilityRole="button"
        accessibilityLabel="Paso anterior"
        disabled={isSubmitting}
        onPress={onPrevStep}
        style={[styles.prevStepBtn, { minHeight: control.lg }]}
      >
        <Text style={[typography.bodyStrong, { color: colors.primaryInk }]}>← Paso anterior</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  prevStepBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
