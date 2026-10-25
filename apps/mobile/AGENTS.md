# Vittkly Mobile App (`@vittkly/mobile`) — Reglas de Desarrollo

Aplicación móvil universal para técnicos y supervisores en campo (Expo SDK 57, React Native 0.86, Expo Router).

## Expo SDK 57 — No Confiar en Datos de Entrenamiento Antiguos

Antes de utilizar cualquier API de Expo o React Native:
1. Consultar la versión mayor de `expo` en `package.json` (`~57.0.30`).
2. Consultar https://docs.expo.dev/llms.txt para índices y correcciones específicas de la versión.

## Comandos de Verificación

```bash
pnpm --filter @vittkly/mobile typecheck   # Verificación de TypeScript
pnpm --filter @vittkly/mobile lint        # ESLint Expo Config
npx expo-doctor                           # Diagnóstico de dependencias
```

## Reglas Específicas
- **Continuous Native Generation:** Prohibido crear o editar carpetas `/ios` o `/android` manualmente.
- **Rutas Delgadas:** Mantener `src/app/` con archivos delgados (< 80 líneas). La interfaz vive en `src/features/<feature>/screens/`.
- **Ergonomía de Calle:** Altura táctil de 48 px (`control.lg`) obligatoria en botones y controles.
