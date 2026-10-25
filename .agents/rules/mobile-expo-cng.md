---
description: Reglas de desarrollo para Expo SDK 57, React Native 0.86 y Expo Router en la App Móvil
globs: ["apps/mobile/**"]
---

# Mobile Architecture: Expo SDK 57 & Continuous Native Generation

1. **Continuous Native Generation (CNG):**
   - No crear ni modificar carpetas `/ios` o `/android` manualmente. Toda configuración nativa se define en `app.json` o en config plugins.
2. **Thin Routing con Expo Router:**
   - Cada archivo en `src/app/` debe ser un orquestador delegado (< 80 líneas). La interfaz y la lógica de pantallas residen en `src/features/<feature>/screens/` o `src/features/<feature>/components/`.
3. **Ergonomía de Calle (Outdoor Operability):**
   - Los controles interactivos (botones, pestañas, campos) deben respetar la altura mínima de **48 px** (`control.lg`).
   - El teclado de PIN numérico debe medir exactamente **72 × 64 px** por tecla.
   - La tipografía corrida base para el técnico en campo es `typography.bodyLg` (**17 px** con interlineado de **26 px**).
4. **Patrón Repositorio en Supabase:**
   - Prohibido importar `@/services/supabase` en la capa visual (`src/app/**` o `src/components/**`).
   - El acceso a datos se hace mediante servicios de dominio y custom hooks en `src/features/<feature>/`.
5. **Persistencia y Seguridad Offline:**
   - El hash del PIN y tokens sensibles se guardan exclusivamente en hardware mediante `expo-secure-store`.
   - La caché offline de datos operativos utiliza `expo-sqlite`.
