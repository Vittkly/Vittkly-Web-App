---
name: pre-flight
description: Ejecuta la suite de verificación integral previa a cualquier commit, release o entrega (typecheck, lint, expo-doctor).
---

# Pre-flight Quality Check Skill

Esta skill orquesta la verificación completa de calidad del código y salud del entorno en Vittkly-App.

## Comandos Ejecutados en Secuencia

1. **Chequeo de Tipos TypeScript:**
   ```bash
   npx tsc --noEmit
   ```
   *Criterio de éxito: 0 errores de tipado.*

2. **Linter Estático (ESLint):**
   ```bash
   npx eslint .
   ```
   *Criterio de éxito: 0 errores y 0 warnings sobre imports no permitidos de `@/services/supabase` en UI.*

3. **Diagnóstico del Entorno Expo:**
   ```bash
   npx expo-doctor
   ```
   *Criterio de éxito: Todas las comprobaciones pasan sin advertencias de paquetes incompatibles.*

## Acciones de Corrección
- Si `tsc` falla: inspeccionar los tipos en `src/types/` o props de componentes.
- Si `eslint` falla: ejecutar `npx eslint . --fix` o corregir imports restringidos.
- Si `expo-doctor` detecta versiones desalineadas: ejecutar `npx expo install --fix`.
