import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  borderWidth,
  colors,
  control,
  duration,
  fontFamilies,
  fontWeights,
  layout,
  opacity,
  radius,
  shadows,
  spacing,
  tabularNumsStyle,
  ThemeColors,
  ThemeMode,
  typography,
} from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_PREFERENCE_STORAGE_KEY = 'vittkly.theme_preference.v1';

interface VittklyThemeContextValue {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  isThemeLoaded: boolean;
}

const DEFAULT_CONTEXT: VittklyThemeContextValue = {
  themePreference: 'system',
  setThemePreference: () => {},
  isThemeLoaded: true,
};

const VittklyThemeContext = createContext<VittklyThemeContextValue>(DEFAULT_CONTEXT);

function isValidThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export interface VittklyThemeProviderProps {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
}

/**
 * Proveedor raíz de tema para Vittkly Mobile.
 * Mantiene preferencia persistida ('system' | 'light' | 'dark') en AsyncStorage
 * para que el modo manual desde Perfil sobreviva reinicios de la app.
 */
export function VittklyThemeProvider({
  children,
  initialPreference = 'system',
}: VittklyThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(initialPreference);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrateThemePreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
        if (active && isValidThemePreference(stored)) {
          setThemePreferenceState(stored);
        }
      } catch {
        // Fallback silencioso a preferencia por defecto ('system')
      } finally {
        if (active) {
          setIsThemeLoaded(true);
        }
      }
    };

    void hydrateThemePreference();

    return () => {
      active = false;
    };
  }, []);

  const setThemePreference = useCallback((next: ThemePreference) => {
    setThemePreferenceState(next);
    void AsyncStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, next).catch(() => {
      // Ignorar fallo de escritura en entornos sin almacenamiento persistente
    });
  }, []);

  const value = useMemo<VittklyThemeContextValue>(
    () => ({
      themePreference,
      setThemePreference,
      isThemeLoaded,
    }),
    [themePreference, setThemePreference, isThemeLoaded],
  );

  return React.createElement(VittklyThemeContext.Provider, { value }, children);
}

export interface VittklyTheme {
  scheme: ThemeMode;
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  isThemeLoaded: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  control: typeof control;
  layout: typeof layout;
  borderWidth: typeof borderWidth;
  opacity: typeof opacity;
  duration: typeof duration;
  fontWeights: typeof fontWeights;
  typography: typeof typography;
  tabularNums: typeof tabularNumsStyle;
  fontFamilies: typeof fontFamilies;
  shadows: (typeof shadows)[ThemeMode];
}

/**
 * Hook de tema reactivo a las preferencias del sistema o a la anulación manual del usuario.
 * Devuelve la paleta correspondiente de `tokens.ts` junto con escalas tipográficas,
 * de espaciado, radios y alturas táctiles (`control.lg = 48`).
 */
export function useTheme(): VittklyTheme {
  const systemScheme = useColorScheme();
  const { themePreference, setThemePreference, isThemeLoaded } = useContext(VittklyThemeContext);

  const scheme: ThemeMode =
    themePreference === 'light' || themePreference === 'dark'
      ? themePreference
      : systemScheme === 'dark'
        ? 'dark'
        : 'light';

  return useMemo(
    () => ({
      scheme,
      isDark: scheme === 'dark',
      themePreference,
      setThemePreference,
      isThemeLoaded,
      colors: colors[scheme],
      spacing,
      radius,
      control,
      layout,
      borderWidth,
      opacity,
      duration,
      fontWeights,
      typography,
      tabularNums: tabularNumsStyle,
      fontFamilies,
      shadows: shadows[scheme],
    }),
    [scheme, themePreference, setThemePreference, isThemeLoaded],
  );
}
