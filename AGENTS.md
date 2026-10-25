# Vittkly SaaS Monorepo — Guía Maestra para Agentes de IA

Vittkly es un SaaS B2B multi-tenant para empresas de servicios y operaciones en campo (mantenimiento técnico, limpieza, climatización, saneamiento ambiental).

---

## 1. Stack Tecnológico y Arquitectura

- **Gestor de paquetes:** `pnpm@12.10.1` (PROHIBIDO usar `npm install` o `yarn`).
- **Orquestador:** Turborepo (`turbo.json`).
- **Aplicaciones (`apps/`):**
  - `apps/web` (`@vittkly/web`): Central Web Administrativa. Next.js 16.4 (App Router con Server Components de React 19, Tailwind CSS v4, `@supabase/ssr`).
  - `apps/mobile` (`@vittkly/mobile`): App Móvil para Técnicos de Campo. Expo SDK 57, React Native 0.86, Expo Router, `expo-sqlite`, `expo-secure-store`.
- **Paquetes Compartidos (`packages/`):**
  - `packages/ui-tokens` (`@vittkly/ui-tokens`): Fuente única de verdad de colores, espaciados, radios, tipografía y logos del UI Kit.
  - `packages/db-types` (`@vittkly/db-types`): Tipos TypeScript generados desde Supabase Cloud (`Database`).
  - `packages/shared` (`@vittkly/shared`): Esquemas de validación Zod, constantes y utilitarios puros.
- **Base de Datos (`supabase/`):** Supabase Cloud (sa-east-1). Dos entornos en la nube (Staging/Test y Producción) gobernados por RLS y variables de entorno. No se utiliza Docker local.

---

## 2. Comandos Principales (Ejecutar siempre desde la raíz)

```bash
# Servidores de desarrollo
pnpm dev             # Inicia Web y Mobile
pnpm dev:web         # Solo Central Web (http://localhost:3000)
pnpm dev:mobile      # Solo App Móvil (Expo Metro Bundler)

# Calidad y Verificación
pnpm lint            # Ejecuta ESLint en todos los workspaces
pnpm typecheck       # Ejecuta tsc --noEmit en todos los workspaces
pnpm test            # Ejecuta vitest en paquetes y web
pnpm check           # Verificación completa (lint + typecheck + test)
pnpm build           # Compilación de paquetes y apps

# Base de datos
pnpm sync:db-types   # Regenera packages/db-types/src/database.types.ts desde Supabase Cloud
```

---

## 3. Reglas Arquitectónicas Innegociables

1. **Fronteras Estrictas del Monorepo:**
   - `apps/web` y `apps/mobile` NUNCA se importan entre sí. Todo código compartido debe vivir en `packages/*`.
2. **Thin Routing Obligatorio:**
   - `src/app/` (tanto en Next.js como en Expo Router) se compone únicamente de orquestadores ultraligeros, layouts y páginas delgadas (< 80 líneas). Toda la lógica de negocio reside en `src/features/<feature>/`.
3. **Patrón Repositorio en Supabase:**
   - Prohibido importar clientes de Supabase directamente en componentes visuales o rutas (`src/app/**` o `src/components/**`). El acceso a datos se centraliza en servicios tipados dentro de `src/features/<feature>/services/`.
4. **Seguridad Multi-Tenant y Llaves:**
   - `SUPABASE_SERVICE_ROLE_KEY` es exclusivo para el servidor web (`apps/web/src/lib/supabase/admin.ts` con `import 'server-only'`). NUNCA se expone en el cliente web ni en la app móvil.
   - Toda tabla en PostgreSQL debe contar con `ENABLE ROW LEVEL SECURITY` y `FORCE ROW LEVEL SECURITY`, con políticas atómicas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) y cláusula `WITH CHECK`.
   - El esquema canónico oficial de la base de datos se rige por las 10 migraciones de la Etapa 0 (`empresas`, `membresias`, `usuarios`, `cuentas`, `planes`, `modulos`, `perfiles`).
5. **Sistema de Diseño Inmutable:**
   - Prohibido hardcodear colores HEX (`#...`) o tamaños arbitrarios en componentes. Consumir `@vittkly/ui-tokens` o tokens semánticos (`useTheme()` en móvil, clases semánticas Tailwind en web).
   - El color verde Kleanly `#3EC49B` (`kleanly` / `success`) está **estrictamente reservado** para tareas `completada` o `pagada` y para el isotipo de la marca. NUNCA como fondo de botón principal ni texto sobre blanco.
   - En la aplicación móvil, todo control interactivo táctil debe medir al menos **48 px** (`control.lg`).
   - Cifras monetarias, códigos `OT-XXXX` y cronómetros deben usar la clase `.tabular-nums` y fuentes monoespaciadas.

---

## 4. Qué NO Hacer (Prohibiciones para Agentes de IA)

- NO ejecutar comandos de migración destructivos (`supabase db reset`, `DROP TABLE`) contra bases de datos en la nube.
- NO crear ni editar carpetas nativas `/ios` o `/android` en `apps/mobile` (usar Continuous Native Generation mediante `app.json`).
- NO instalar paquetes en `apps/mobile` sin verificar compatibilidad con el SDK 57 de Expo (`npx expo-doctor`).
- NO comitear archivos `.env` ni `.agents/mcp_config.json` con credenciales reales.

---

## 5. Definición de "Terminado" (Definition of Done)

Ninguna tarea o refactorización se considera terminada hasta que `pnpm check` (`lint`, `typecheck`, `test`) se ejecute sin ningún error desde la raíz del monorepo.
