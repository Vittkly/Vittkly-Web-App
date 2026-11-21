---
name: react-native-vittkly-design
description: Estándares de UI Kit, tokens Light/Dark, accesibilidad táctil de campo y patrones React Native / Expo Router para Vittkly Mobile.
---

# React Native Vittkly Design Skill

Guía obligatoria para diseñar, refinar y construir pantallas y componentes en `apps/mobile` (Expo SDK 58, React Native 0.88, Expo Router) con fidelidad al UI Kit Vittkly y al prototipo `vittkly-campo-app.html`.

---

## 1. Reglas Innegociables de Tokens y Color

1. **Fuente única de verdad (`@vittkly/ui-tokens` + `@/theme`):**
   - Prohibido escribir códigos HEX (`#...`), colores `rgba(...)` o tamaños mágicos directamente en componentes.
   - Consumir siempre `const { colors, spacing, radius, control, layout, typography, fontFamilies, shadows, isDark } = useTheme();` o `tokens` desde `@/theme`.
2. **Reserva absoluta del Verde Kleanly (`#3EC49B` / `colors.kleanly` / `colors.success`):**
   - Exclusivo para estados `completada` / `pagada` e isotipo de marca.
   - **NUNCA** usarlo como fondo de botón primario ni como color de texto sobre fondos claros (ratio de contraste insuficiente). Usar `colors.successInk` para texto accesible sobre `colors.successSoft`.
3. **Soporte dual Light / Dark:**
   - Todo componente debe verse y contrastar correctamente en ambos esquemas (`light` y `dark`).
   - El tema respeta el sistema por defecto y permite anulación manual persistida (`'system' | 'light' | 'dark'`) mediante `setThemePreference()` expuesto por `useTheme()`.
4. **Un solo CTA `primary` por pantalla:**
   - Evitar competencia visual en campo: máximo un botón `variant="primary"` por pantalla. Acciones complementarias usan `secondary`, `outline`, `ghost` o `option`.

---

## 2. Ergonomía Táctil de Campo (Outdoor Operability)

1. **Área táctil mínima de `48 px`:**
   - Todo control interactivo (botones, filas pulsables, back button `48 × 48 px`, campos de entrada, pills táctiles relevantes) debe garantizar al menos `control.lg` (`48 px`) de altura o `hitSlop` equivalente cuando el elemento visual compacto (p. ej. badge o icono) sea menor.
2. **Teclado numérico (`PinPad`):**
   - Cada tecla debe medir exactamente `72 × 64 px`, con espaciado uniforme (`keypadWidth: 280`).
3. **Jerarquía Tipográfica y `tabular-nums`:**
   - Títulos hero/display: `typography.display` (`32 px` / `lineHeight: 40`).
   - Lectura principal de campo: `typography.bodyLg` (`17 px` / `lineHeight: 26`).
   - **Montos (`S/ 150.00`), códigos (`OT-0482`), RUC y cronómetros** DEBEN aplicar `fontVariant: ['tabular-nums']` (y `fontFamilies.mono` / `typography.code` en códigos técnicos).

---

## 3. Primitivas Nativas, Iconografía y Arquitectura

1. **Primitivas React Native obligatorias:**
   - `SafeAreaView` (`react-native-safe-area-context`) o manejo explícito de insets en bordes superiores/inferiores de pantalla y bottom sheets.
   - `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`) en toda vista con formularios o entradas de texto.
   - `FlatList` para listados dinámicos (evitar `.map()` dentro de `ScrollView` para colecciones de órdenes, clientes, citas, historial o selects largos).
2. **Iconografía vectorial con `react-native-svg`:**
   - Importar íconos SVG desde `@/components/icons` (`VittklyIcon` y componentes tipados extraídos del kit oficial) con `strokeWidth={2}`, `strokeLinecap="round"` y `strokeLinejoin="round"` heredando `color` de `useTheme()`.
3. **Fronteras y Thin Routing:**
   - `src/app/**`: únicamente rutas delgadas (`< 80` líneas) delegando en `src/features/<feature>/screens/`.
   - `src/components/**` y `src/app/**`: **PROHIBIDO** importar `@/services/supabase`. Todo acceso a datos va en `src/features/<feature>/services/` + hooks.
   - Prohibido inventar pantallas, contadores falsos, alertas `alert()` o copys fuera del prototipo `vittkly-campo-app.html`.

---

## 4. Accesibilidad y Definición de Checklist por Componente

Todo componente compartido debe incluir:

- `accessibilityRole` (`button`, `header`, `text`, `tab`, `switch`, etc.)
- `accessibilityLabel` descriptivo en español
- `accessibilityState` (`{ disabled, selected, busy }` según corresponda)
- `testID?: string` configurable para pruebas automatizadas

### Flujo recomendado al crear o modificar UI

1. Revisar `@/theme` y `@/components/icons` antes de crear estilos o SVG nuevos.
2. Diseñar la interfaz `Props` tipada estrictamente en TypeScript (sin `any`).
3. Aplicar estilos base con `tokens` + overrides de color dependientes de `useTheme()`.
4. Verificar en ambos modos (`light` y `dark`) y ejecutar `pnpm --filter @vittkly/mobile typecheck` y `pnpm --filter @vittkly/mobile lint`.
