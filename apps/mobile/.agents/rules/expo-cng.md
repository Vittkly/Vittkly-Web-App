---
description: Reglas de Continuous Native Generation (CNG) y configuración nativa en Expo
globs: ["app.json", "app.config.ts", "eas.json", "ios/**/*", "android/**/*"]
---

# Expo Continuous Native Generation (CNG) & Native Configuration

Este proyecto utiliza Expo Continuous Native Generation (CNG).

## 1. Prohibido Editar o Crear Manualmente `ios/` o `android/`
- Los directorios `ios/` y `android/` son transitorios o generados por el comando `npx expo prebuild`.
- NUNCA modificar archivos dentro de `ios/` o `android/` directamente por texto o scripts manuales.
- NUNCA commitear archivos de código nativo directamente a menos que el proyecto se haya expulsado explícitamente (eject).

## 2. Configuración Declarativa
- Cualquier permiso, icono, splash, nombre de paquete (`bundleIdentifier`, `package`), o configuración de SDK nativo debe configurarse en `app.json` o `app.config.ts`.
- Si una librería requiere código nativo o modificaciones en `Podfile` / `AndroidManifest.xml` / `build.gradle`, debe configurarse mediante un **Config Plugin** oficial o personalizado en el campo `"plugins"` de `app.json`.

## 3. Instalación de Módulos
- Siempre usar `npx expo install <package>` para garantizar compatibilidad con Expo SDK 57.
- Prohibido instalar librerías nativas con versiones arbitrarias que no hayan sido verificadas por `expo-doctor`.
