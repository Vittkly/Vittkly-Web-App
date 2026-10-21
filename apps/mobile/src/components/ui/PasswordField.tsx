import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Insets, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { FormField, FormFieldProps } from './FormField';

export interface PasswordFieldProps extends Omit<FormFieldProps, 'secureTextEntry' | 'rightSlot'> {
  showToggle?: boolean;
  toggleTestID?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
}

const ICON_SIZE = 20;
const HIT_SLOP: Insets = { top: 8, bottom: 8, left: 8, right: 8 };

export function PasswordField({
  showToggle = true,
  toggleTestID,
  testID,
  wrapperStyle,
  ...rest
}: PasswordFieldProps) {
  const { colors, control } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleButton = showToggle ? (
    <Pressable
      testID={toggleTestID ?? (testID ? `${testID}-toggle-btn` : undefined)}
      accessibilityRole="button"
      accessibilityLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      hitSlop={HIT_SLOP}
      onPress={() => setIsPasswordVisible(prev => !prev)}
      style={[styles.toggleBtn, { width: control.lg, height: control.lg }]}
    >
      {isPasswordVisible ? (
        <EyeOff size={ICON_SIZE} color={colors.inkMuted} />
      ) : (
        <Eye size={ICON_SIZE} color={colors.inkMuted} />
      )}
    </Pressable>
  ) : null;

  return (
    <FormField
      testID={testID}
      secureTextEntry={!isPasswordVisible}
      autoCapitalize="none"
      autoCorrect={false}
      rightSlot={toggleButton}
      containerStyle={wrapperStyle}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  toggleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
