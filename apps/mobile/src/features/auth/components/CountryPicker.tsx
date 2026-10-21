import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { COUNTRIES, type CountryOption } from '../hooks/usePhoneEntry';

export interface CountryPickerProps {
  selectedCountry: CountryOption;
  onSelectCountry: (country: CountryOption) => void;
  visible: boolean;
  testID?: string;
}

export function CountryPicker({
  selectedCountry,
  onSelectCountry,
  visible,
  testID = 'phone-country-picker-list',
}: CountryPickerProps) {
  const { colors, spacing, radius, typography, control } = useTheme();

  if (!visible) return null;

  return (
    <View
      testID={testID}
      style={[
        styles.countryList,
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.line,
          borderRadius: radius.md,
          padding: spacing.space2,
          gap: spacing.space1,
          marginTop: spacing.space1,
        },
      ]}
    >
      {COUNTRIES.map(c => (
        <Pressable
          key={c.code}
          testID={`phone-country-option-${c.code}`}
          accessibilityRole="button"
          onPress={() => onSelectCountry(c)}
          style={[
            styles.countryRow,
            {
              minHeight: control.lg,
              paddingHorizontal: spacing.space3,
              borderRadius: radius.sm,
              backgroundColor: c.code === selectedCountry.code ? colors.primarySoft : 'transparent',
            },
          ]}
        >
          <Text style={[typography.body, styles.flex, { color: colors.ink }]}>{c.name}</Text>
          <Text style={[typography.small, { color: colors.inkMuted }]}>{c.dial}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  countryList: {
    borderWidth: 1,
    width: '100%',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
});
