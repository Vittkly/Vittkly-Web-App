---
name: vittkly-ui-builder
description: Procedimiento estandarizado para construir componentes y pantallas alineados al Sistema de Diseño Vittkly.
---

# Vittkly UI Builder Skill

Esta skill guía la creación o modificación de componentes visuales de UI y pantallas en Vittkly-App.

## Requisitos Obligatorios
1. **Importar Tokens:** Siempre importar desde `@/theme` (`tokens`, `useTheme`, `typography`, `spacing`, etc.).
2. **Dimensiones Táctiles Mínimas:** Los elementos interactivos principales (botones, campos de texto, tabs) deben tener un alto mínimo de `tokens.sizes.control.lg` (48px) para accesibilidad táctil.
3. **Cero Magic Numbers/Colors:** No utilizar hex codes sueltos ni espaciados arbitrarios en `StyleSheet.create`. Todo valor debe venir de `tokens`.
4. **Semántica de Marca:** El color Kleanly (`tokens.colors.primary.kleanly` / `#3EC49B`) está reservado EXCLUSIVAMENTE para tareas completadas, estados pagados o transacciones exitosas. Nunca usarlo como fondo genérico o botón primario principal.
5. **Accesibilidad & Testing:** Todos los componentes interactivos deben incluir `accessibilityLabel`, `accessibilityRole` y `testID`.

## Procedimiento Paso a Paso

### 1. Definir la interfaz de Props
- Tipar explícitamente todas las props con TypeScript (evitar `any`).
- Incluir `testID?: string` opcional o generado.

### 2. Implementar Componente
```tsx
import React from 'react';
import { StyleSheet, Text, Pressable, PressableProps } from 'react-native';
import { tokens, useTheme } from '@/theme';

export interface VittklyButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  testID?: string;
}

export const VittklyButton: React.FC<VittklyButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && { backgroundColor: colors.buttonPrimary },
        variant === 'secondary' && { backgroundColor: colors.surfaceContainer },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, { color: colors.buttonPrimaryText }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: tokens.sizes.control.lg, // 48px obligatorio
    paddingHorizontal: tokens.spacing[5],
    borderRadius: tokens.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    ...tokens.typography.button,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
});
```

### 3. Verificación
- Ejecutar `npx tsc --noEmit` para verificar tipos.
- Asegurar que no hay violaciones de ESLint.
