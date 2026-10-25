# Auditoría de Arquitectura y Plan de Reorganización — Monorepo Vittkly (`WORKSPACE_AUDIT.md`)

> [!IMPORTANT]
> **Nota de Cumplimiento de Fase 1 (Solo Lectura):** La carpeta `docs/audit/` **no existe actualmente** en el repositorio (solo existen `docs/README.md` y `docs/artifacts/`). Cumpliendo estrictamente la Regla 1, Regla 4 y el modo `/plan`, el árbol de trabajo de Git se mantiene **100 % intacto** (`git status` limpio) y se entrega este informe completo en el artefacto de planificación y en el chat para su revisión antes de crear o mover cualquier archivo en la Fase 2.

---

## 1. Resumen Ejecutivo y Calificación Global

El repositorio `vittkly-monorepo` une dos aplicaciones funcionales con trabajo valioso que debe preservarse: una Central Web en Next.js 16.4 (`@vittkly/web`) y una App Móvil offline-first en Expo SDK 57 (`@vittkly/mobile`), gestionadas con `pnpm@12.10.1` y Turborepo `2.5.0`. Sin embargo, la unión dejó **fuerte deuda estructural de "dos repositorios pegados"**: configuraciones triplicadas (`commitlint`, `lint-staged`, `prettier`, `.gitignore`), `husky` instalado tres veces, ausencia de `AGENTS.md` y `.agents/` en la raíz (lo que impide que Antigravity descubra las 11 skills y reglas encerradas dentro de `apps/*/.agents/`), un paquete interactivo legado de **27 MB** con binarios WASM en `docs/artifacts/Demo/completa/`, el archivo `apps/web/tsconfig.tsbuildinfo` (238 KB) versionado en Git, y **dos esquemas de base de datos coexistiendo** (modelo en inglés `organizations`/`memberships`/`profiles` en móvil vs. modelo en español `empresas`/`membresias`/`usuarios` en web y `seed.sql`) sin una única carpeta de migraciones SQL completas en `supabase/migrations/`.

**Calificación Global del Workspace:** **2.9 / 5.0** *(Funcional en sus módulos individuales, pero con alto riesgo de deriva entre Web/Móvil y ceguera de contexto para agentes de IA).*

---

## 2. Árbol Actual Simplificado

```text
vittkly-monorepo/
├── .husky/                              # Hooks de git raíz (commit-msg, pre-commit) + binarios internos _/
├── apps/
│   ├── mobile/                          # @vittkly/mobile (Expo SDK 57, RN 0.86.3, React 19.2.3, TS ~6.0.3)
│   │   ├── .agents/                     # ⚠️ Aislado: rules (6), skills (6), hooks.json, mcp_config.json (versionado)
│   │   ├── .vscode/                     # Configuración de editor local a mobile
│   │   ├── assets/                      # Fuentes Manrope TTF (5), images/logos-png (20), logos SVG (5 duplicados)
│   │   ├── docs/                        # ⚠️ Duplicado/disperso: adr/, design-system/, security/auditoria_bd_supabase_rls.md
│   │   ├── src/
│   │   │   ├── app/                     # Expo Router: _layout.tsx, index.tsx, dashboard.tsx, (auth)/* (18 rutas)
│   │   │   ├── assets/index.ts          # Mapa de fuentes e íconos
│   │   │   ├── components/              # UI nativa en raíz (8) + subcarpeta ui/ (9) con solapamiento (PinPad vs NumericKeypad)
│   │   │   ├── features/                # auth/ (completo: PIN, biometría, SQLite, OTP) y home/ (visitas del día)
│   │   │   ├── services/supabase.ts     # ⚠️ Cliente Supabase sin genérico <Database>
│   │   │   ├── theme/                   # ⚠️ tokens.ts (299 líneas) y useTheme.ts locales a mobile
│   │   │   └── types/env.d.ts           # Tipos de variables EXPO_PUBLIC_*
│   │   ├── AGENTS.md                    # Reglas locales de Expo
│   │   ├── .env, .env.local             # No versionados (correcto), pero ambos coexisten con SUPABASE_PERSONAL_ACCESS_TOKEN
│   │   ├── .env.example                 # Plantilla EXPO_PUBLIC_*
│   │   ├── .gitignore, .prettierrc, .prettierignore, .lintstagedrc.json, commitlint.config.js, skills-lock.json
│   │   ├── app.json, babel.config.js, eslint.config.mjs, metro.config.js, package.json, tsconfig.json
│   └── web/                             # @vittkly/web (Next.js 16.4.2, React 19.3.0, Tailwind v4, TS ^5)
│       ├── .agents/                     # ⚠️ Aislado: rules (5), skills (6), hooks.json, mcp_config.example.json
│       ├── docs/                        # ⚠️ Disperso: adr/001, database/propuesta_010, design-system/, security/
│       ├── public/                      # brand/ (5 SVGs idénticos a mobile + app-icon), favicons (6), icons/ (45 SVGs)
│       ├── src/
│       │   ├── app/                     # App Router: layout.tsx, page.tsx, globals.css, auth/callback, (auth)/*, (dashboard)/*
│       │   ├── components/              # brand/VittklyLogo, icons/VittklyIcons, providers/ThemeProvider, ui/* (11 + 1 test)
│       │   ├── features/                # auth/ (actions, services, types) y dashboard/ (ContextSelectorBar, ModulesListView)
│       │   ├── lib/supabase/            # client.ts, server.ts, admin.ts, middleware.ts + ⚠️ seed.sql (215 líneas infiltrado)
│       │   ├── middleware.ts            # Refresco de sesión SSR
│       │   ├── theme/                   # ⚠️ tokens.ts (187 líneas) duplicado de mobile y globals.css
│       │   └── types/database.types.ts  # Re-exporta @vittkly/db-types
│       ├── AGENTS.md                    # Reglas locales de Next.js
│       ├── .env, .env.local             # No versionados, coexisten en disco
│       ├── .env.example                 # Plantilla NEXT_PUBLIC_* + SUPABASE_SERVICE_ROLE_KEY
│       ├── .gitignore, .prettierrc, .prettierignore, .lintstagedrc.json, commitlint.config.mjs
│       ├── eslint.config.mjs, next.config.ts, package.json, playwright.config.ts, tsconfig.json, vitest.config.ts
│       └── tsconfig.tsbuildinfo         # 🔴 Versionado en Git por error (238 KB)
├── docs/
│   ├── README.md                        # Índice general con rutas absolutas locales hardcodeadas (/home/wilmerabanto/...)
│   └── artifacts/                       # 🔴 27 MB versionados: Demo/completa/ (index.html 7.1MB + WASM Tesseract 18.6MB)
├── packages/
│   ├── db-types/                        # @vittkly/db-types: database.types.ts (939 líneas, mezcla tablas inglés + español)
│   └── shared/                          # @vittkly/shared: esquemas Zod de auth y constantes (usado en web, ignorado en mobile)
├── supabase/
│   ├── migrations/.gitkeep              # 🔴 Vacío: las migraciones reales no están versionadas aquí
│   ├── seed.sql                         # ⚠️ Stub de 2 líneas (el seed real de 215 líneas está en apps/web/src/lib/supabase/seed.sql)
│   └── supabase.md                      # Documentación de 11 tablas en español
├── .gitignore, .lintstagedrc.json, .npmrc, commitlint.config.mjs, package.json, pnpm-lock.yaml, pnpm-workspace.yaml, turbo.json
```

---

## 3. Tabla de Puntuación por Área (1 a 5)

| # | Área Evaluada | Puntos (1-5) | Evidencia Principal (Rutas Verificadas) |
| :-: | :--- | :-: | :--- |
| 1 | **Raíz del monorepo** | **3.0 / 5** | Tiene [package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/package.json), [pnpm-workspace.yaml](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/pnpm-workspace.yaml), [turbo.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/turbo.json), [.npmrc](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/.npmrc) y un único [pnpm-lock.yaml](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/pnpm-lock.yaml). **Faltan** `README.md` raíz, `.nvmrc`, `.editorconfig` y `AGENTS.md` raíz. [.gitignore](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/.gitignore) raíz es incompleto (no ignora `*.tsbuildinfo`, `coverage/`, `playwright-report/`). |
| 2 | **Apps (`apps/web`, `apps/mobile`)** | **3.5 / 5** | Nombres `@vittkly/web` y `@vittkly/mobile` bien definidos; [next.config.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/next.config.ts#L5) transpila `@vittkly/shared` y `@vittkly/db-types`; [metro.config.js](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/metro.config.js#L10-L16) configura `watchFolders` y `nodeModulesPaths`. Sin embargo, ambas apps conservan archivos de raíz propios (`.lintstagedrc.json`, `commitlint.config.*`, `.gitignore`, `husky` en `devDependencies`) y `apps/mobile/package.json` no tiene script `test` ni `build`. |
| 3 | **Paquetes compartidos (`packages/*`)** | **2.5 / 5** | Existen [`@vittkly/db-types`](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/packages/db-types/package.json) y [`@vittkly/shared`](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/packages/shared/package.json). Pero `@vittkly/mobile` **no importa ninguno de los dos en su código fuente**: reimplementa validaciones en [validators.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/features/auth/utils/validators.ts) y tipos en [auth.types.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/features/auth/types/auth.types.ts). No existe paquete de tokens de diseño (`@vittkly/ui-tokens`). |
| 4 | **Configuración compartida** | **2.0 / 5** | No existen paquetes `config-typescript`, `config-eslint` ni configuración Prettier unificada. Hay **2 archivos `.prettierrc` contradictorios**: [apps/web/.prettierrc](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.prettierrc#L5) usa `"trailingComma": "es5"` mientras que [apps/mobile/.prettierrc](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/.prettierrc#L4) usa `"trailingComma": "all"` y `"arrowParens": "avoid"`. Hay **3 archivos `commitlint.config.*`** y **3 `.lintstagedrc.json`**. |
| 5 | **Dependencias** | **2.5 / 5** | Divergencia riesgosa de versiones entre apps: `react`/`react-dom` es `19.3.0` en [apps/web/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/package.json#L27-L28) vs. `19.2.3` en [apps/mobile/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/package.json#L32-L33) (mientras mobile resuelve `@types/react@19.3.0` hoisteado de web). `typescript` es `^5.8.2` en raíz/packages, `^5` en web (resuelve `5.9.3`) y `~6.0.3` en mobile. `husky`, `lint-staged` y `@commitlint/*` están triplicados. No hay imports cruzados entre apps (positivo). |
| 6 | **Turborepo** | **2.5 / 5** | [turbo.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/turbo.json) define `build`, `dev`, `lint`, `typecheck` y `test`, pero **no declara `env` ni `globalEnv`** (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EXPO_PUBLIC_SUPABASE_URL`), lo que en Turbo v2 invalida o contamina el caché de compilación entre entornos (Staging vs. Producción). Además, `lint` y `typecheck` dependen de `^build`, pero `@vittkly/db-types` no tiene script `build`. |
| 7 | **Supabase** | **2.0 / 5** | Seguridad de `service_role` en web muy bien cuidada con `server-only` en [admin.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/lib/supabase/admin.ts#L1). Sin embargo: (1) [supabase/migrations/](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/supabase/migrations/.gitkeep) está vacío; (2) el `seed.sql` real (215 líneas) está metido en [apps/web/src/lib/supabase/seed.sql](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/lib/supabase/seed.sql) mientras [supabase/seed.sql](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/supabase/seed.sql) tiene 2 líneas; (3) **fractura de esquema**: Web consulta tablas en español (`usuarios`, `empresas`, `membresias`, `modulos`) y Mobile consulta tablas en inglés (`profiles`, `organizations`, `memberships`, `work_orders`) sin tipar `createClient<Database>` en [apps/mobile/src/services/supabase.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/services/supabase.ts#L24). |
| 8 | **Variables de entorno** | **3.0 / 5** | Ningún `.env` ni `.env.local` está trackeado en Git (verificado con `git ls-files`). Prefijos `NEXT_PUBLIC_` y `EXPO_PUBLIC_` bien empleados. Problemas: coexisten `.env` y `.env.local` simultáneamente en cada app incluyendo `SUPABASE_PERSONAL_ACCESS_TOKEN`; falta `NEXT_PUBLIC_SITE_URL` en [apps/web/.env.example](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.env.example); y en mobile `.env` define `EXPO_PUBLIC_SUPABASE_KEY` además de `EXPO_PUBLIC_SUPABASE_ANON_KEY`. |
| 9 | **UI kit y diseño** | **3.0 / 5** | Excelente disciplina en componentes (cero colores HEX hardcodeados fuera de `Logo.tsx`, cumplimiento estricto de `#3EC49B`). Pero **no existe paquete compartido de tokens**: los colores, espaciados y tipografías están triplicados manualmente en [apps/web/src/theme/tokens.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/theme/tokens.ts), [apps/web/src/app/globals.css](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/app/globals.css) y [apps/mobile/src/theme/tokens.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/theme/tokens.ts). Los 5 SVGs de marca están duplicados byte por byte en `apps/web/public/brand/` y `apps/mobile/assets/logos/`. |
| 10 | **Calidad y pruebas** | **2.5 / 5** | TypeScript `strict: true` activo en todos los paquetes y reglas ESLint arquitectónicas valiosas (`no-restricted-imports`, `max-lines`). Sin embargo, solo existe **1 archivo de test unitario** en todo el monorepo ([StatusBadge.test.tsx](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/components/ui/__tests__/StatusBadge.test.tsx)), la carpeta `./e2e` configurada en [playwright.config.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/playwright.config.ts#L4) **no existe**, y `apps/mobile` tiene **0 tests**. El hook [.husky/pre-commit](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/.husky/pre-commit) no ejecuta `lint-staged`. |
| 11 | **CI/CD** | **1.0 / 5** | No existe la carpeta `.github/workflows/` ni ningún pipeline de integración continua en el repositorio. |
| 12 | **Preparación para agentes de IA** | **2.5 / 5** | Existen buenas reglas y skills creadas originalmente por separado en `apps/web/.agents/` y `apps/mobile/.agents/`, pero **no existe `AGENTS.md` ni `.agents/` en la raíz del monorepo**. Como Antigravity descubre `.agents/` desde el directorio de trabajo hacia arriba hasta `.git`, al abrir el monorepo en la raíz **ninguna skill de `apps/*/.agents/` se carga automáticamente**. Además, varias reglas tienen comandos con `npm run` en vez de `pnpm` y rutas de tipos obsoletas. |
| 13 | **Documentación** | **2.5 / 5** | Buena calidad técnica en los documentos existentes (ADRs, diseño, auditoría RLS), pero están fragmentados y duplicados entre `apps/web/docs/`, `apps/mobile/docs/` y `docs/`. [docs/README.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/docs/README.md#L15-L19) contiene enlaces con rutas locales absolutas (`/home/wilmerabanto/...`). Además, `docs/artifacts/Demo/completa/` contamina el repo con 27 MB de binarios y código monolítico. |
| 14 | **Seguridad básica** | **4.0 / 5** | Excelente protección en `apps/web` (`server-only` en `admin.ts`, rate-limiting por RPC `ingreso_bloqueado_hasta`/`registrar_intento`, anti-enumeración de usuarios, cookies SSR, y PIN con `expo-secure-store` en móvil). Como puntos a corregir: [apps/mobile/.agents/mcp_config.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/.agents/mcp_config.json) está versionado en Git (aunque hoy contiene el placeholder `${SUPABASE_PERSONAL_ACCESS_TOKEN}`, en `apps/web/.gitignore` está explícitamente ignorado para evitar fugas de PATs reales) y falta forzar el genérico `<Database>` en el cliente móvil. |

---

## 4. Hallazgos Clasificados por Severidad

### 🔴 Severidad Crítica

#### **H-001: Ceguera de descubrimiento de `.agents/` y ausencia de `AGENTS.md` en la raíz del monorepo**
- **Rutas afectadas y evidencia:**
  - Raíz del repositorio `/` (ausencia de `AGENTS.md` y `.agents/`).
  - [apps/web/AGENTS.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/AGENTS.md), [apps/mobile/AGENTS.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/AGENTS.md).
  - `apps/web/.agents/{rules,skills,hooks.json}` y `apps/mobile/.agents/{rules,skills,hooks.json,mcp_config.json}`.
- **Por qué es un problema:**
  El sistema de personalización de Antigravity descubre `.agents/` buscando en la raíz del workspace o caminando desde el directorio de trabajo actual (`CWD`) hacia arriba hasta `.git`. Cuando un agente opera desde la raíz del monorepo (`/home/wilmerabanto/Proyectos/vittkly-monorepo`), **no descubre ninguna de las 12 skills ni los hooks** alojados dentro de `apps/web/.agents/` y `apps/mobile/.agents/`. Además, los archivos `hooks.json` de ambas apps ejecutan `npx tsc --noEmit` sin contexto de paquete, y skills como [apps/web/.agents/skills/sync-db-types/SKILL.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.agents/skills/sync-db-types/SKILL.md#L11) instruyen sobrescribir `src/types/database.types.ts` en lugar de `packages/db-types/src/database.types.ts`.
- **Corrección recomendada:**
  1. Crear `AGENTS.md` en la raíz con el mapa global del monorepo, comandos `pnpm`, arquitectura de paquetes y reglas innegociables (conservando los `AGENTS.md` locales de `apps/web` y `apps/mobile` solo para directivas específicas de Next.js 16 y Expo SDK 57).
  2. Consolidar `.agents/skills/`, `.agents/rules/` y `.agents/hooks.json` en la carpeta raíz `/.agents/`, unificando las skills duplicadas (`pre-flight`, `rls-migration-auditor`, `sync-db-types`) y renombrando con alcance claro las específicas (`vittkly-web-ui-builder`, `vittkly-mobile-ui-builder`, etc.).
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Bajo (no afecta el runtime de Next.js ni Expo).
  - *Mitigación:* Verificar que `next dev` sigue encontrando su bloque `<!-- BEGIN:nextjs-agent-rules -->` en `apps/web/AGENTS.md`.

---

#### **H-002: Fractura del esquema de base de datos (Inglés vs. Español) y `supabase/migrations/` vacío**
- **Rutas afectadas y evidencia:**
  - [supabase/migrations/.gitkeep](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/supabase/migrations/.gitkeep) (0 archivos `.sql` de migración).
  - [supabase/seed.sql](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/supabase/seed.sql) (2 líneas) vs. [apps/web/src/lib/supabase/seed.sql](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/lib/supabase/seed.sql) (215 líneas con el seed real de la historia VIT-29).
  - [packages/db-types/src/database.types.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/packages/db-types/src/database.types.ts#L22-L876) (mezcla 8 tablas en inglés de las líneas 22–357 y 14 tablas en español de las líneas 358–876).
  - [apps/web/src/features/dashboard/services/modules.service.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/features/dashboard/services/modules.service.ts#L147-L165) (consulta `usuarios`, `membresias`, `empresas`, `perfiles`, `cuentas`, `suscripciones`, `planes`, `modulos`).
  - [apps/mobile/src/features/auth/services/auth.service.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/features/auth/services/auth.service.ts#L93-L96) y [tenant.repository.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/features/auth/services/tenant.repository.ts#L72-L120) (consulta `profiles`, `memberships`, `organizations`, `access_profiles`, aunque `tenant.repository.ts` intenta primero la RPC `mi_contexto`).
- **Por qué es un problema:**
  1. No existe una fuente de verdad versionada de las migraciones SQL en `supabase/migrations/`.
  2. El archivo `seed.sql` real quedó escondido dentro de `apps/web/src/lib/supabase/seed.sql`.
  3. Un agente de IA que lea [apps/web/.agents/rules/rls-security-policy.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.agents/rules/rls-security-policy.md) verá que menciona `organizations` y `is_org_member(org_id)`, pero el código productivo reciente de `apps/web` (commits `ad61930` y `8066f09`, historia `VIT-30`) opera sobre las tablas en español (`empresas`, `membresias`, `usuarios`, `es_miembro(p_empresa_id)`). Esto induce a los agentes a escribir consultas contra tablas equivocadas.
- **Corrección recomendada:**
  1. Mover `apps/web/src/lib/supabase/seed.sql` hacia `supabase/seed.sql` (sin tocar la base de datos en la nube).
  2. Incorporar en `supabase/migrations/` los scripts SQL base en orden cronológico (solo como control de versiones en el repositorio, sin ejecutarlos contra Supabase Cloud) y agregar `supabase/config.toml` de referencia.
  3. Documentar explícitamente en `AGENTS.md` y `docs/architecture/` cuál es el esquema canónico vigente (tablas en español `empresas`/`membresias`/`usuarios` + RPC `mi_contexto()`) y cuáles tablas en inglés están en transición o deprecadas.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Medio si se eliminaran tipos en inglés de `database.types.ts` mientras `apps/mobile` aún tiene fallbacks que los referencian.
  - *Mitigación:* Mantener intacto `packages/db-types/src/database.types.ts` hasta que `apps/mobile` migre sus fallbacks, y solo mover `seed.sql`

---

#### **H-003: Artefactos pesados de demostración (27 MB, incluyendo binarios WASM) y `tsconfig.tsbuildinfo` versionados en Git**
- **Rutas afectadas y evidencia:**
  - `docs/artifacts/Demo/completa/` (**27 MB** trackeados en Git: `tess/lang/eng-traineddata-gz.wasm` de 11 MB, ` index.html` de 7.1 MB con imágenes base64 incrustadas, `tesseract-core-*.wasm.js` de 7.6 MB).
  - [apps/web/tsconfig.tsbuildinfo](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/tsconfig.tsbuildinfo) (**238 KB** trackeado en Git porque `.gitignore` raíz no incluye `*.tsbuildinfo` y fue comiteado).
  - `.husky/_/*` (16 scripts internos autogenerados de Husky v9 trackeados en Git a pesar de que `.husky/_/.gitignore` contiene `*`).
- **Por qué es un problema:**
  1. Infla el tamaño del repositorio Git y degrada el rendimiento de búsqueda semántica/indexación de los agentes de IA (como se evidenció al hacer `git grep`, donde `docs/artifacts/Demo/completa/index.html` escupe megabytes de cadenas Base64 y WASM que saturan la ventana de contexto del agente).
  2. `tsconfig.tsbuildinfo` se modifica cada vez que corre `tsc`, generando diffs fantasma en el árbol de trabajo.
- **Corrección recomendada:**
  1. Añadir `*.tsbuildinfo`, `coverage/`, `test-results/`, `playwright-report/` al `.gitignore` raíz y ejecutar `git rm --cached apps/web/tsconfig.tsbuildinfo` y `git rm -r --cached .husky/_`.
  2. Con respecto a `docs/artifacts/Demo/completa/` (que sirve de referencia funcional según `docs/artifacts/doc_artifact.md`): consultar al usuario si desea excluir los binarios WASM (`tess/`) o mover la carpeta `Demo/completa/` fuera del alcance de indexación de código (por ejemplo, ignorada en `.prettierignore`, `.eslintignore` / `globalIgnores` y búsqueda de agentes, o archivada en un branch/release separado conservando únicamente `docs/artifacts/doc_artifact.md`).
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Bajo. `git rm --cached` en `tsconfig.tsbuildinfo` no borra código fuente. Para `docs/artifacts/Demo/completa/`, no se borrará nada sin autorización expresa del usuario.

---

### 🟠 Severidad Alta

#### **H-004: Divergencia de versiones de React (`19.3.0` vs `19.2.3`) y TypeScript (`5.9.3` vs `6.0.3`) entre Web y Mobile**
- **Rutas afectadas y evidencia:**
  - [apps/web/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/package.json#L27-L53): `"react": "19.3.0"`, `"react-dom": "19.3.0"`, `"@types/react": "^19"`, `"typescript": "^5"`.
  - [apps/mobile/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/package.json#L32-L64): `"react": "19.2.3"`, `"react-dom": "19.2.3"`, sin `@types/react` propio, `"typescript": "~6.0.3"`.
  - [package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/package.json#L24), [packages/shared/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/packages/shared/package.json#L18), [packages/db-types/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/packages/db-types/package.json#L15): `"typescript": "^5.8.2"`.
- **Por qué es un problema:**
  En `node_modules/.modules.yaml` se evidencia que `@expo/ui@57.0.25` y `react-native@0.86.3` están recibiendo `@types/react@19.3.0` hoisteado desde `apps/web` junto con el runtime `react@19.2.3`. Además, cuando en fases futuras se creen paquetes compartidos de UI o hooks, coexistirán dos instancias de React en el grafo de dependencias, causando fallos en tiempo de ejecución (`Invalid Hook Call`). Asimismo, compilar `packages/*` con TypeScript 5.9 y `apps/mobile` con TypeScript 6.0.3 puede producir discrepancias de chequeo de tipos.
- **Corrección recomendada:**
  1. Alinear `typescript` en una versión consistente en los paquetes compartidos y la raíz (o fijar `pnpm.overrides` / catálogo de `pnpm-workspace.yaml` si todas las herramientas soportan la misma versión).
  2. Declarar explícitamente `@types/react` en `apps/mobile/package.json` acorde al SDK 57 de Expo, y evaluar si `apps/web` puede fijar la misma versión de React compatible o aislar las dependencias de React si Expo SDK 57 exige estrictamente `19.2.3`.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Medio (Expo Doctor valida versiones exactas de `react` para el SDK 57).
  - *Mitigación:* Respetar la versión que exige `npx expo-doctor` en `apps/mobile` (`19.2.3`) y usar `pnpm` catalog / overrides solo donde sea 100 % compatible con ambas apps.

---

#### **H-005: `apps/mobile` no consume `@vittkly/shared` ni `@vittkly/db-types` y duplica validaciones y tipos**
- **Rutas afectadas y evidencia:**
  - [apps/mobile/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/package.json#L11-L12) declara `@vittkly/db-types` y `@vittkly/shared`, pero `git grep "@vittkly/" apps/mobile/src/` devuelve **0 resultados**.
  - [apps/mobile/src/services/supabase.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/services/supabase.ts#L24): `export const supabase = createClient(resolvedUrl, resolvedKey, ...)` sin el genérico `<Database>`.
  - [apps/mobile/src/features/auth/utils/validators.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/features/auth/utils/validators.ts#L1-L53) reimplementa `isValidEmail`, `isValidPassword`, `getPasswordRules` e `isValidPhone` que ya existen en [@vittkly/shared](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/packages/shared/src/auth/login.schema.ts).
  - [apps/mobile/src/features/auth/types/auth.types.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/features/auth/types/auth.types.ts#L6-L10) redefine `MembershipRole`, `AccessScope` y `SubscriptionStatus` (donde además falta `'unpaid'` que sí está en `@vittkly/db-types`).
  - [apps/mobile/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/package.json#L53) define `"sync:db-types": "... > src/types/database.types.ts"` apuntando a una ruta local inexistente en lugar de `packages/db-types`.
- **Por qué es un problema:**
  Rompe el principio de fuente única de verdad del monorepo: cualquier cambio en reglas de contraseñas, teléfonos o tablas de Supabase en `@vittkly/shared` / `@vittkly/db-types` no se refleja en la app móvil, y el cliente Supabase móvil carece de autocompletado y verificación estática de tablas/columnas.
- **Corrección recomendada:**
  1. Tipar el cliente de Supabase en `apps/mobile/src/services/supabase.ts` con `createClient<Database>` importado de `@vittkly/db-types`.
  2. Re-exportar o delegar las funciones de `apps/mobile/src/features/auth/utils/validators.ts` hacia `@vittkly/shared` manteniendo la misma firma de función para no romper ningún componente existente en móvil.
  3. Re-exportar los tipos comunes (`MembershipRole`, `AccessScope`, `SubscriptionStatus`, `WorkOrderStatus`) desde `@vittkly/db-types` / `@vittkly/shared`.
  4. Corregir el script `sync:db-types` en `apps/mobile/package.json` y `apps/web/package.json` para que deleguen al script raíz.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Medio al añadir `<Database>` en `apps/mobile/src/services/supabase.ts` si alguna consulta existente en móvil tiene tipos incompatibles.
  - *Mitigación:* Ejecutar `pnpm --filter @vittkly/mobile typecheck` inmediatamente después del cambio; mantener adaptadores en `validators.ts` con las firmas actuales.

---

#### **H-006: Triplicación del UI Kit (Tokens y Logos) sin paquete central `@vittkly/ui-tokens`**
- **Rutas afectadas y evidencia:**
  - [apps/web/src/theme/tokens.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/theme/tokens.ts) (187 líneas, espaciados en `'4px'`).
  - [apps/web/src/app/globals.css](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/app/globals.css) (166 líneas, variables CSS `--surface`, `--ink`, etc.).
  - [apps/mobile/src/theme/tokens.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/theme/tokens.ts) (299 líneas, espaciados numéricos `4`, incluye `layout`, `borderWidth`, `opacity`, `duration` que faltan en web).
  - Logos SVG duplicados con idéntico checksum MD5 en `apps/web/public/brand/*.svg` y `apps/mobile/assets/logos/*.svg`.
- **Por qué es un problema:**
  Aunque hoy los valores HEX coinciden, están mantenidos a mano en 3 archivos distintos. Además, `apps/web/src/app/globals.css` define tokens adicionales (`--bg: #fbfcfd`, `--soft`, `--accent`, `--tint`) que no existen en `apps/web/src/theme/tokens.ts`, mientras que `apps/mobile/src/theme/tokens.ts` tiene `borderWidth`, `opacity`, `duration` y `timerDisplay` que no están en `apps/web`.
- **Corrección recomendada:**
  Crear el paquete compartido `packages/ui-tokens` (`@vittkly/ui-tokens`) como única fuente de verdad que exporte:
  1. La paleta semántica canónica (`colors.light`, `colors.dark`), valores numéricos base (`spacingPx`, `radiusPx`, `controlPx`), tipografía, opacidades y duraciones, más las geometrías vectoriales de marca (`logoPaths`).
  2. Adaptadores listos para Web (con unidades `'px'`) y para React Native (numéricos).
  3. En `apps/web/src/theme/tokens.ts` y `apps/mobile/src/theme/tokens.ts`, re-exportar desde `@vittkly/ui-tokens` para **no romper ningún import `@/theme` existente** en las apps.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Bajo si `apps/web/src/theme/tokens.ts` y `apps/mobile/src/theme/tokens.ts` se mantienen como fachadas (barrels) que re-exportan desde `@vittkly/ui-tokens` respetando los tipos exactos (`TextStyle`, `ViewStyle` en móvil).
  - *Mitigación:* Añadir `@vittkly/ui-tokens` a `transpilePackages` en `apps/web/next.config.ts` y verificar con `typecheck` en ambas apps.

---

#### **H-007: Configuración de `turbo.json` incompleta (sin variables de entorno ni tarea `check` y con `dependsOn: ["^build"]` en paquetes sin `build`)**
- **Rutas afectadas y evidencia:**
  - [turbo.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/turbo.json#L4-L22).
  - [packages/db-types/package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/packages/db-types/package.json#L11-L13) (solo tiene `"typecheck"`, no tiene `"build"`).
- **Por qué es un problema:**
  En Turborepo v2 (`^2.5.0`), el modo estricto de variables de entorno filtra las variables no declaradas en `env` o `globalEnv` durante la ejecución de tareas y no invalida el caché cuando cambian las llaves entre el proyecto Supabase de pruebas/staging y el de producción. Además, no existe una tarea unificada `check` ni script `test` en la raíz `package.json`.
- **Corrección recomendada:**
  Actualizar `turbo.json` declarando `globalEnv` (`SUPABASE_PROJECT_ID`, `NODE_ENV`, `CI`) y `env` por tarea (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`), y añadir en el `package.json` raíz los scripts `"test": "turbo run test"` y `"check": "turbo run lint typecheck test"`.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Muy bajo.
  - *Mitigación:* Probar `pnpm lint`, `pnpm typecheck` y `pnpm test` desde la raíz tras actualizar `turbo.json`.

---

#### **H-008: Ausencia total de CI/CD (`.github/workflows/`) y suite de pruebas insuficiente en Mobile y E2E**
- **Rutas afectadas y evidencia:**
  - Ausencia de `.github/` en la raíz.
  - [apps/web/playwright.config.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/playwright.config.ts#L4) apunta a `testDir: './e2e'`, directorio que no existe.
  - `apps/mobile` no tiene ningún runner de pruebas unitarias (Jest / Jest-Expo / Vitest) ni tests en `src/`.
- **Por qué es un problema:**
  En un flujo de desarrollo guiado por agentes de IA, la ausencia de pruebas automatizadas y de un pipeline de CI en Pull Requests elimina la barrera final de verificación. Además, ejecutar `pnpm --filter @vittkly/web test:e2e` falla porque `./e2e` no existe.
- **Corrección recomendada:**
  1. Crear `.github/workflows/ci.yml` que ejecute `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` con caché de Turborepo.
  2. Crear el directorio `apps/web/e2e/` con un smoke test inicial de Playwright para login/registro.
  3. Configurar pruebas unitarias en `apps/mobile` (`jest-expo` + `@testing-library/react-native` o Vitest para lógica pura de servicios/utils).
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Bajo (aditivo).
  - *Mitigación:* Empezar con tests unitarios de servicios/validadores y smoke test en CI.

---

### 🟡 Severidad Media

#### **H-009: Triplicación de herramientas de git hooks y formateo (`husky`, `lint-staged`, `commitlint`, `prettier`) con reglas contradictorias**
- **Rutas afectadas y evidencia:**
  - `commitlint`: [commitlint.config.mjs](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/commitlint.config.mjs) (raíz, acepta `VIT-XX` o Conventional Commits), [apps/web/commitlint.config.mjs](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/commitlint.config.mjs) (solo Conventional), [apps/mobile/commitlint.config.js](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/commitlint.config.js) (CommonJS, solo Conventional).
  - `lint-staged`: [.lintstagedrc.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/.lintstagedrc.json) (raíz, solo prettier), [apps/web/.lintstagedrc.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.lintstagedrc.json) (eslint + prettier), [apps/mobile/.lintstagedrc.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/.lintstagedrc.json) (eslint + prettier).
  - `prettier`: no existe `.prettierrc` en la raíz; [apps/web/.prettierrc](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.prettierrc) usa `"trailingComma": "es5"` y plugin Tailwind; [apps/mobile/.prettierrc](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/.prettierrc) usa `"trailingComma": "all"` y `"arrowParens": "avoid"`.
  - [.husky/pre-commit](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/.husky/pre-commit) solo ejecuta `pnpm turbo run typecheck` y nunca invoca `npx lint-staged`.
- **Por qué es un problema:**
  Si se ejecuta `pnpm format` desde la raíz ([package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/package.json#L13)), Prettier formatea archivos con reglas distintas según la carpeta o sin configuración en `packages/*`. Además, tener `husky`, `lint-staged` y `@commitlint/*` en las `devDependencies` de `apps/web` y `apps/mobile` es peso muerto heredado de cuando eran repositorios separados.
- **Corrección recomendada:**
  1. Centralizar `.prettierrc` y `.prettierignore` en la raíz (o en `packages/config-prettier`), eliminando las copias contradictorias o dejando en `apps/web/.prettierrc` únicamente la extensión del plugin de Tailwind con las mismas reglas base.
  2. Eliminar `apps/web/commitlint.config.mjs`, `apps/mobile/commitlint.config.js`, y las dependencias duplicadas de `husky` y `@commitlint/*` en `apps/web` y `apps/mobile`, manteniendo la configuración raíz (que soporta tanto `VIT-XX` como Conventional Commits).
  3. Actualizar `.husky/pre-commit` para que ejecute `pnpm lint-staged && pnpm turbo run typecheck`.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Bajo.
  - *Mitigación:* Ejecutar `prettier --check` antes de aplicar un formateo masivo y hacerlo en un commit aislado de estilo (`style: unify prettier configuration`).

---

#### **H-010: Archivo `.agents/mcp_config.json` versionado en `apps/mobile` y coexistencia confusa de `.env` + `.env.local`**
- **Rutas afectadas y evidencia:**
  - [apps/mobile/.agents/mcp_config.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/.agents/mcp_config.json) (trackeado en Git; verificado que hoy contiene el literal `"${SUPABASE_PERSONAL_ACCESS_TOKEN}"`, pero en [apps/web/.gitignore](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.gitignore#L42) está ignorado porque los desarrolladores suelen pegar su PAT real ahí).
  - En disco coexisten simultáneamente `apps/web/.env` y `apps/web/.env.local`, y `apps/mobile/.env` y `apps/mobile/.env.local` (todos contienen además `SUPABASE_PERSONAL_ACCESS_TOKEN` y claves duplicadas como `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `EXPO_PUBLIC_SUPABASE_KEY`).
  - [apps/web/.env.example](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/.env.example) no documenta `NEXT_PUBLIC_SITE_URL` (usado en `apps/web/src/features/auth/actions/auth.actions.ts` líneas 253 y 352).
- **Por qué es un problema:**
  Si un desarrollador o agente reemplaza `${SUPABASE_PERSONAL_ACCESS_TOKEN}` en `apps/mobile/.agents/mcp_config.json`, Git lo marcará para commit y se filtrará el Personal Access Token de Supabase (que tiene control total sobre la cuenta de Supabase Cloud). Además, tener tanto `.env` como `.env.local` en cada app dificulta saber qué entorno (Producción vs. Staging/Test) se está cargando.
- **Corrección recomendada:**
  1. Ignorar `**/.agents/mcp_config.json` en el `.gitignore` raíz, hacer `git rm --cached apps/mobile/.agents/mcp_config.json` y conservar solo `mcp_config.example.json`.
  2. Documentar `NEXT_PUBLIC_SITE_URL` en `apps/web/.env.example` y crear `.env.example` en la raíz (para `SUPABASE_PROJECT_ID` usado por `sync:db-types`).
  3. Definir una convención clara de entornos (ej. `.env.local` para desarrollo/staging y variables de plataforma en CI/producción) con validación Zod al arranque (`src/env.ts`).
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Bajo (`git rm --cached` mantiene el archivo local en el disco del usuario sin borrarlo).

---

#### **H-011: Documentación fragmentada en 3 ubicaciones, duplicada byte a byte y con enlaces absolutos rotos**
- **Rutas afectadas y evidencia:**
  - [apps/web/docs/security/auditoria_bd_supabase_rls.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/docs/security/auditoria_bd_supabase_rls.md) y [apps/mobile/docs/security/auditoria_bd_supabase_rls.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/docs/security/auditoria_bd_supabase_rls.md) son **100 % idénticos** (MD5 `e690626243930ca7e205836a1e7a476b`).
  - [docs/README.md](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/docs/README.md#L15-L19) usa URLs `file:///home/wilmerabanto/...` que solo funcionan en la máquina local actual y fallan en GitHub o en contenedores CI.
  - No existe `README.md` en la raíz del monorepo.
- **Por qué es un problema:**
  Cuando un agente o desarrollador actualiza un ADR o documento de seguridad en `apps/web/docs/`, la copia en `apps/mobile/docs/` queda desactualizada. Y la falta de `README.md` en la raíz deja al repositorio sin puerta de entrada estándar.
- **Corrección recomendada:**
  Unificar toda la documentación en la carpeta raíz `docs/` (`docs/architecture/adr/`, `docs/database/`, `docs/design/`, `docs/security/`, `docs/audit/`, `docs/ai/`) usando enlaces Markdown relativos, y crear un `README.md` raíz conciso.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Nulo para el código ejecutable. Actualizar las referencias en las reglas `.agents/rules/*.md` para que apunten a `docs/`.

---

### 🟢 Severidad Baja

#### **H-012: Solapamiento de componentes UI en `apps/mobile/src/components/` vs `apps/mobile/src/components/ui/` y rutas alias redundantes**
- **Rutas afectadas y evidencia:**
  - En `apps/mobile/src/components/` coexisten componentes en el primer nivel (`Button.tsx`, `Logo.tsx`, `OtpInput.tsx`, `PinPad.tsx`, `StatusBadge.tsx`, `WorkOrderCard.tsx`, `ConnectionBanner.tsx`, `MobileTabBar.tsx`) y una subcarpeta `ui/` (`AlertBanner.tsx`, `BackButton.tsx`, `BottomSheet.tsx`, `CompanyCircleButton.tsx`, `FormField.tsx`, `NumericKeypad.tsx`, `OptionCard.tsx`, `PasswordField.tsx`, `PinDots.tsx`), además de componentes específicos en `src/features/auth/components/PinPadLock.tsx` y `OtpVerification.tsx`.
  - En `apps/mobile/src/app/` existen rutas alias de 1 línea como [dashboard.tsx](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/mobile/src/app/dashboard.tsx) (`export { default } from './index'`) y en `apps/web/src/app/(auth)/` coexisten `/register` y `/signup` ([signup/page.tsx](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/app/(auth)/signup/page.tsx) redirige a `/register`).
- **Por qué es un problema:**
  Un agente de IA puede confundirse entre `PinPad.tsx`, `NumericKeypad.tsx` y `PinPadLock.tsx` al modificar el teclado de PIN.
- **Corrección recomendada:**
  Documentar en `docs/design/` qué componentes de `apps/mobile/src/components/` son primitivas del UI Kit general y cuáles de `src/components/ui/` son bloques de formularios/autenticación, sin eliminar los existentes para no romper pantallas en uso.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Nulo si se documenta y se organiza mediante exports limpios sin borrar archivos en uso.

---

#### **H-013: Falta de `.nvmrc`, `.editorconfig` y `engines` en el `package.json` raíz**
- **Rutas afectadas y evidencia:**
  - Raíz del repositorio `/` y [package.json](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/package.json).
- **Por qué es un problema:**
  Aunque `"packageManager": "pnpm@12.10.1"` está fijado, no se especifica la versión requerida de Node (`v24.18.0` en el entorno actual) ni reglas de fin de línea/indentación de editor (`.editorconfig`).
- **Corrección recomendada:**
  Crear `.nvmrc` (`24`), `.editorconfig` y el campo `"engines": { "node": ">=22.0.0", "pnpm": ">=10.0.0" }` en el `package.json` raíz.
- **Riesgo de la corrección y mitigación:**
  - *Riesgo:* Nulo.

---

## 5. Qué Está Bien y Debe Conservarse (Trabajo Valioso)

Es fundamental **NO reescribir ni destruir** los siguientes activos ya construidos y probados:

1. **Autenticación y Seguridad Web (`apps/web/src/features/auth/` y `src/lib/supabase/`):**
   - Implementación SSR limpia con `@supabase/ssr` (`client.ts`, `server.ts`, `middleware.ts`) y cliente administrativo `admin.ts` blindado con `import 'server-only'`.
   - Server Actions en [auth.actions.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/features/auth/actions/auth.actions.ts) con protección anti-fuerza bruta por RPC (`ingreso_bloqueado_hasta`, `registrar_intento`), prevención de enumeración de usuarios, validación de `acceso_web` para impedir que perfiles exclusivamente móviles entren a la Central Web, y auto-aprovisionamiento con `crear_cuenta_y_empresa`.
2. **Dashboard Multi-Tenant con Filtrado Triple en Web (`apps/web/src/features/dashboard/`):**
   - Servicio [modules.service.ts](file:///home/wilmerabanto/Proyectos/vittkly-monorepo/apps/web/src/features/dashboard/services/modules.service.ts) que cruza **Plan (`plan_modulos`) + Perfil (`perfiles`) + Permisos (`perfil_permisos`)** sobre los 39 módulos del catálogo y permite previsualizar perfiles (`previewPerfilCodigo`) y cambiar de empresa (`ContextSelectorBar.tsx`, `ModulesListView.tsx`).
3. **Autenticación Híbrida Online/Offline en Móvil (`apps/mobile/src/features/auth/`):**
   - Flujo completo de bienvenida, login por correo/teléfono OTP, registro en 2 pasos, canje de invitación, configuración de PIN de 4 dígitos con hash en `expo-secure-store` y sincronización en `user_metadata`, biometría con `expo-local-authentication`, sesión offline en `expo-sqlite` (`offline-session.service.ts`), selector multi-empresa (`SelectTenantScreen.tsx`) y bloqueo automático tras 15 minutos de inactividad (`useInactivityLock.ts`).
4. **Guardarraíles de ESLint en Web y Mobile (`eslint.config.mjs`):**
   - Reglas `no-restricted-imports` que prohíben importar el cliente de Supabase en `src/app/` o `src/components/`, forzando el patrón Repositorio/Servicio.
   - En `apps/mobile/eslint.config.mjs`, límites estrictos de modularidad (`max-lines: 80` en rutas de `src/app/**` y `max-lines: 250` en componentes/screens/hooks) y prevención de ciclos de importación en `src/features/auth/`.
5. **Cumplimiento del Sistema de Diseño Vittkly:**
   - Uso disciplinado de la paleta semántica (`surface`, `ink`, `primary`, `vitta`, y reserva estricta de `#3EC49B` `kleanly`/`success`), alturas táctiles de 48 px en móvil (`PinPad` de 72×64 px) y soporte claro/oscuro en ambas plataformas.
6. **Paquetes `@vittkly/shared` y `@vittkly/db-types`:**
   - Ya están creados, enlazados mediante `workspace:*` y configurados en `next.config.ts` (`transpilePackages`) y `metro.config.js` (`watchFolders`).

---

## 6. Estructura Objetivo Adaptada a Este Repo

### Decisiones de Adaptación frente a la Estructura de Referencia
1. **Mantener `@vittkly/db-types` e introducir `@vittkly/supabase` de forma incremental (o unificar con re-export):** `apps/web` ya importa `@vittkly/db-types`. Para no romper imports existentes, podemos mantener `@vittkly/db-types` (o convertirlo en re-export de `@vittkly/supabase`) mientras `@vittkly/supabase` aloja los tipos generados, helpers de validación de entorno y consultas/constantes compartidas de Supabase (manteniendo los clientes específicos de plataforma `@supabase/ssr` con `next/headers` en `apps/web` y `AsyncStorage`/`expo-sqlite` en `apps/mobile`, ya que mezclar `next/headers` con `react-native` en un mismo entrypoint rompe Metro Bundler).
2. **Crear `packages/ui-tokens` (`@vittkly/ui-tokens`), pero NO crear `ui-web` ni `ui-native` todavía:** Solo hay 1 app web y 1 app móvil; los componentes UI (`apps/web/src/components/ui/` y `apps/mobile/src/components/`) están bien acoplados a sus primitivas (`next/image` + Tailwind v4 vs. `react-native` `StyleSheet` + `react-native-svg`). Extraer `ui-web` y `ui-native` hoy añadiría fricción sin reutilización real entre múltiples apps del mismo tipo. En cambio, **`packages/ui-tokens` sí aporta valor inmediato** al unificar colores, espaciados, radios, tipografía y vectores SVG del logo.
3. **Crear `packages/config-typescript` y `packages/config-eslint`:** Permite compartir las reglas base y los guardarraíles arquitectónicos sin duplicación.

### Árbol Objetivo Propuesto

```text
vittkly-monorepo/
├── apps/
│   ├── web/                          # @vittkly/web (Next.js 16 App Router)
│   └── mobile/                       # @vittkly/mobile (Expo SDK 57 + RN 0.86)
├── packages/
│   ├── ui-tokens/                    # [NUEVO] @vittkly/ui-tokens: colores, tipografía, espaciados, radios, paths SVG del logo
│   ├── db-types/                     # @vittkly/db-types: tipos generados de Supabase (database.types.ts)
│   ├── shared/                       # @vittkly/shared: esquemas Zod, validadores, constantes y tipos de dominio
│   ├── config-typescript/            # [NUEVO] @vittkly/config-typescript: base.json, nextjs.json, react-native.json
│   └── config-eslint/                # [NUEVO] @vittkly/config-eslint: reglas base y guardarraíles compartidos
├── supabase/
│   ├── migrations/                   # Migraciones SQL versionadas (000..010 + esquema español VIT-29/VIT-30)
│   ├── seed.sql                      # Seed completo consolidado (movido desde apps/web/src/lib/supabase/seed.sql)
│   ├── supabase.md                   # Diccionario de datos vigente
│   └── config.toml                   # [NUEVO] Configuración declarativa de referencia para Supabase CLI
├── docs/
│   ├── README.md                     # Índice maestro con enlaces relativos limpios
│   ├── architecture/                 # ADRs unificados (web, mobile, monorepo) y mapa de módulos
│   ├── database/                     # Propuestas de esquema y diccionarios SQL
│   ├── design/                       # Documentación unificada del Sistema de Diseño Vittkly (Web + Nativo)
│   ├── security/                     # Auditoría RLS única (sin duplicados)
│   ├── ai/                           # Guía de operación para agentes de IA y flujo de trabajo
│   └── audit/                        # WORKSPACE_AUDIT.md y reportes de auditoría
├── .agents/                          # [NUEVO EN RAÍZ] Reglas, skills unificadas, hooks.json y mcp_config.example.json
│   ├── rules/                        # Reglas globales + específicas por glob (web, mobile, supabase, design)
│   ├── skills/                       # Skills consolidadas descubribles desde la raíz del monorepo
│   ├── hooks.json
│   └── mcp_config.example.json
├── .github/
│   └── workflows/
│       └── ci.yml                    # [NUEVO] Pipeline CI (lint, typecheck, test, build) con caché de Turbo
├── AGENTS.md                         # [NUEVO EN RAÍZ] Contexto global y reglas para agentes de IA
├── turbo.json                        # Pipelines con globalEnv, env y tarea check
├── package.json                      # Workspaces + scripts raíz (dev, build, lint, typecheck, test, check, format)
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── commitlint.config.mjs             # Único commitlint en la raíz
├── .lintstagedrc.json                # Único lint-staged en la raíz
├── .prettierrc                       # [NUEVO EN RAÍZ] Configuración única de formateo
├── .prettierignore                   # [NUEVO EN RAÍZ] Ignorados de formateo
├── .gitignore                        # Consolidado (incluye *.tsbuildinfo, coverage, mcp_config.json)
├── .editorconfig                     # [NUEVO] Consistencia de indentación y saltos de línea
├── .nvmrc                            # [NUEVO] Versión de Node (24)
├── .npmrc
└── README.md                         # [NUEVO EN RAÍZ] Documentación principal de setup y arquitectura del monorepo
```

### Mapa de Migración de Rutas (`Ruta Actual → Ruta Nueva`)

| Ruta Actual | Acción | Ruta Nueva / Destino | Motivo |
| :--- | :---: | :--- | :--- |
| `apps/web/src/lib/supabase/seed.sql` | **Mover** | `supabase/seed.sql` | El seed oficial de 215 líneas no debe vivir dentro de `apps/web/src/lib/` |
| `apps/web/tsconfig.tsbuildinfo` | **Destrackear** (`git rm --cached`) | *(Ignorado en `.gitignore`)* | Archivo de caché de compilación de TypeScript |
| `.husky/_/*` | **Destrackear** (`git rm -r --cached`) | *(Auto-generado por `husky`)* | Archivos internos de Husky v9 |
| `apps/mobile/.agents/mcp_config.json` | **Destrackear** (`git rm --cached`) | `.agents/mcp_config.example.json` | Evitar versionar tokens PAT de Supabase en Git |
| `apps/web/.agents/rules/*` + `apps/mobile/.agents/rules/*` | **Consolidar / Mover** | `.agents/rules/{global,web,mobile,supabase,design}.md` | Permitir descubrimiento automático desde la raíz del monorepo |
| `apps/web/.agents/skills/*` + `apps/mobile/.agents/skills/*` | **Consolidar / Mover** | `.agents/skills/*` | Descubrimiento automático de skills en Antigravity al abrir la raíz |
| `apps/web/.agents/hooks.json` + `apps/mobile/.agents/hooks.json` | **Consolidar / Mover** | `.agents/hooks.json` | Hook unificado en la raíz del workspace |
| `apps/web/docs/adr/*` + `apps/mobile/docs/adr/*` | **Mover** | `docs/architecture/adr/*` | Centralizar ADRs en `docs/architecture/` |
| `apps/web/docs/database/propuesta_010_operaciones_campo.md` | **Mover** | `docs/database/propuesta_010_operaciones_campo.md` | Centralizar documentación de BD |
| `apps/web/docs/design-system/*` + `apps/mobile/docs/design-system/*` | **Mover** | `docs/design/{sistema-diseno-web.md,sistema-diseno-mobile.md}` | Centralizar guías del UI Kit en `docs/design/` |
| `apps/web/docs/security/auditoria_bd_supabase_rls.md` + copia en `mobile` | **Unificar / Mover** | `docs/security/auditoria_bd_supabase_rls.md` | Eliminar copia duplicada idéntica (mismo MD5) |
| `docs/artifacts/doc_artifact.md` | **Mover** | `docs/architecture/ingenieria-inversa-demo.md` | Conservar el análisis arquitectónico en lugar predecible |
| `apps/web/commitlint.config.mjs` y `apps/mobile/commitlint.config.js` | **Eliminar** | `commitlint.config.mjs` (raíz) | Redundantes con el `commitlint.config.mjs` de la raíz |
| `apps/web/.lintstagedrc.json` y `apps/mobile/.lintstagedrc.json` | **Consolidar** | `.lintstagedrc.json` (raíz) | Unificar pre-commit en la raíz |
| `apps/web/.prettierrc` y `apps/mobile/.prettierrc` | **Consolidar** | `.prettierrc` y `.prettierignore` (raíz) | Resolver conflicto `trailingComma: es5` vs `all` |
| `apps/web/src/theme/tokens.ts` + `apps/mobile/src/theme/tokens.ts` | **Extraer base + Re-exportar** | `packages/ui-tokens/src/*` (manteniendo fachadas en `src/theme/tokens.ts`) | Fuente única de verdad sin romper imports `@/theme` |
| `apps/mobile/src/features/auth/utils/validators.ts` | **Delegar a shared** | Consume `packages/shared/src/*` (manteniendo fachada local) | Eliminar duplicación de regex y validadores con Web |

---

## 7. Plan de Migración por Etapas (De Menor a Mayor Riesgo)

Todas las etapas de la Fase 2 se ejecutarán sobre una rama dedicada:
```bash
git checkout -b chore/workspace-restructure
```

---

### Etapa 1: Higiene de Git, Raíz del Monorepo y Variables de Entorno (Riesgo: 🟢 Muy Bajo)
- **Objetivo:** Limpiar archivos trackeados por error en Git, completar archivos estándar de raíz (`.gitignore`, `.nvmrc`, `.editorconfig`, `README.md`, `.env.example`) y asegurar que ningún `mcp_config.json` quede expuesto, sin tocar código de `apps/` ni `packages/`.
- **Pasos:**
  1. Crear `docs/audit/WORKSPACE_AUDIT.md` con este informe.
  2. Actualizar `.gitignore` raíz para cubrir `*.tsbuildinfo`, `coverage/`, `test-results/`, `playwright-report/`, `.vercel/`, `**/.agents/mcp_config.json`, `/ios`, `/android`.
  3. Ejecutar `git rm --cached apps/web/tsconfig.tsbuildinfo`, `git rm --cached apps/mobile/.agents/mcp_config.json` y `git rm -r --cached .husky/_`.
  4. Crear `.nvmrc` (`24`), `.editorconfig`, `.env.example` raíz y `README.md` raíz; agregar `NEXT_PUBLIC_SITE_URL` en `apps/web/.env.example`.
- **Comandos previstos:**
  ```bash
  git rm --cached apps/web/tsconfig.tsbuildinfo apps/mobile/.agents/mcp_config.json
  git rm -r --cached .husky/_
  pnpm turbo run lint typecheck
  git commit -m "chore(workspace): clean git tracked artifacts and add root config files"
  ```
- **Criterio de verificación:** `git status` limpio; `pnpm lint` y `pnpm typecheck` pasan con 0 errores.
- **Plan de reversión:** `git revert HEAD`.

---

### Etapa 2: Consolidación de Documentación, Supabase `seed.sql` y Contexto de Agentes IA en Raíz (Riesgo: 🟢 Bajo)
- **Objetivo:** Hacer que Antigravity y cualquier agente de IA descubran automáticamente las reglas, skills y arquitectura desde la raíz del monorepo, y unificar la documentación y el `seed.sql` de Supabase.
- **Pasos:**
  1. Mover `apps/web/src/lib/supabase/seed.sql` a `supabase/seed.sql` y añadir `supabase/config.toml` informativo.
  2. Mover y deduplicar la documentación de `apps/web/docs/*` y `apps/mobile/docs/*` hacia `docs/{architecture,database,design,security}/` y corregir los enlaces absolutos en `docs/README.md`.
  3. Crear `AGENTS.md` en la raíz y actualizar `apps/web/AGENTS.md` y `apps/mobile/AGENTS.md` para que usen `pnpm` y referencien las rutas correctas.
  4. Consolidar `.agents/rules/`, `.agents/skills/`, `.agents/hooks.json` y `.agents/mcp_config.example.json` en la raíz `/.agents/`, corrigiendo el skill `sync-db-types` para que apunte a `packages/db-types/src/database.types.ts`.
  5. Añadir exclusiones de `docs/artifacts/Demo/**` en `.prettierignore` y configuraciones de búsqueda para evitar contaminar el contexto de IA.
- **Comandos previstos:**
  ```bash
  pnpm turbo run lint typecheck
  pnpm --filter @vittkly/web test
  git commit -m "docs(monorepo): centralize documentation, supabase seed and root AI agent rules"
  ```
- **Criterio de verificación:** Todas las rutas enlazadas en `docs/README.md` y `AGENTS.md` existen; `pnpm lint` y `pnpm typecheck` pasan sin errores.
- **Plan de reversión:** `git revert HEAD`.

---

### Etapa 3: Unificación de Tooling Raíz (`turbo.json`, Prettier, Commitlint, Lint-Staged) y Configuración Compartida (Riesgo: 🟡 Medio-Bajo)
- **Objetivo:** Eliminar la triplicación de `commitlint`, `lint-staged`, `prettier` y `husky`, configurar correctamente las variables de entorno en `turbo.json`, y crear `packages/config-typescript` y `packages/config-eslint`.
- **Pasos:**
  1. Actualizar `turbo.json` añadiendo `globalEnv`, `env` por tarea, y agregar los scripts `test` y `check` en el `package.json` raíz.
  2. Crear `.prettierrc` y `.prettierignore` en la raíz; eliminar `apps/web/commitlint.config.mjs`, `apps/mobile/commitlint.config.js`, `apps/web/.lintstagedrc.json` y `apps/mobile/.lintstagedrc.json`.
  3. Actualizar `.husky/pre-commit` para ejecutar `npx lint-staged && pnpm turbo run typecheck`.
  4. Crear `packages/config-typescript` (`base.json`, `nextjs.json`, `react-native.json`) y hacer que `packages/shared/tsconfig.json`, `packages/db-types/tsconfig.json`, `apps/web/tsconfig.json` y `apps/mobile/tsconfig.json` extiendan de él sin alterar sus `paths` ni `compilerOptions` efectivos.
- **Comandos previstos:**
  ```bash
  pnpm install
  pnpm check
  pnpm --filter @vittkly/web build
  git commit -m "chore(tooling): unify turbo env pipeline, prettier, commitlint and tsconfig presets"
  ```
- **Criterio de verificación:** `pnpm check` (`lint` + `typecheck` + `test`) y `pnpm --filter @vittkly/web build` terminan con código 0.
- **Plan de reversión:** `git revert HEAD && pnpm install`.

---

### Etapa 4: Extracción de `packages/ui-tokens` y Adopción de `@vittkly/shared` / `@vittkly/db-types` en Mobile (Riesgo: 🟡 Medio)
- **Objetivo:** Establecer una única fuente de verdad para los tokens del UI Kit (`@vittkly/ui-tokens`) y conectar `apps/mobile` a `@vittkly/shared` y `@vittkly/db-types` sin romper ningún import existente en las pantallas.
- **Pasos:**
  1. Crear `packages/ui-tokens` (`@vittkly/ui-tokens`) con la paleta `colors` (`light`/`dark`), escalas base (`spacing`, `radius`, `control`, `opacity`, `duration`, `borderWidth`, `fontWeights`), y geometrías SVG de marca.
  2. Añadir `@vittkly/ui-tokens` a las dependencias de `@vittkly/web` y `@vittkly/mobile` y a `transpilePackages` en `apps/web/next.config.ts`.
  3. Refactorizar `apps/web/src/theme/tokens.ts` y `apps/mobile/src/theme/tokens.ts` para que consuman y re-exporten `@vittkly/ui-tokens` manteniendo exactamente las mismas exportaciones y tipos (`ThemeColors`, `tokens`, etc.).
  4. Actualizar `apps/mobile/src/features/auth/utils/validators.ts` para reutilizar las reglas de `@vittkly/shared` conservando sus funciones exportadas (`isValidEmail`, `isValidPassword`, `getPasswordRules`, `isValidPhone`).
  5. Tipar `apps/mobile/src/services/supabase.ts` con `Database` de `@vittkly/db-types` y unificar el script `sync:db-types`.
- **Comandos previstos:**
  ```bash
  pnpm install
  pnpm check
  pnpm --filter @vittkly/web build
  git commit -m "feat(packages): extract @vittkly/ui-tokens and wire shared/db-types in mobile"
  ```
- **Criterio de verificación:** `pnpm --filter @vittkly/web typecheck`, `pnpm --filter @vittkly/mobile typecheck`, `pnpm lint`, `pnpm test` y `pnpm --filter @vittkly/web build` pasan al 100 %.
- **Plan de reversión:** `git revert HEAD && pnpm install`.

---

### Etapa 5: Guardarraíles de CI/CD y Base de Pruebas Automatizadas (Riesgo: 🟢 Bajo)
- **Objetivo:** Añadir el workflow de GitHub Actions (`.github/workflows/ci.yml`), crear la carpeta `apps/web/e2e/` para Playwright y añadir tests unitarios para `@vittkly/shared` y servicios críticos.
- **Pasos:**
  1. Crear `.github/workflows/ci.yml` con jobs de `lint`, `typecheck`, `test` y `build`.
  2. Crear tests unitarios en `packages/shared/` para validar los esquemas Zod (`loginSchema`, `registerSchema`, `passwordSchema`, `pinSchema`).
  3. Crear `apps/web/e2e/auth.spec.ts` para que la configuración existente en `apps/web/playwright.config.ts` tenga su suite base operativa.
- **Comandos previstos:**
  ```bash
  pnpm check
  git commit -m "ci(workflows): add github actions pipeline and shared validation unit tests"
  ```
- **Criterio de verificación:** `pnpm check` ejecuta tests en `packages/shared` y `apps/web` y pasa sin errores.
- **Plan de reversión:** `git revert HEAD`.

---

## 8. Recomendaciones para Trabajo con Agentes de IA

### 8.1. Contenido Propuesto para `AGENTS.md` en la Raíz

```markdown
# Vittkly SaaS Monorepo — Guía Maestra para Agentes de IA

Vittkly es un SaaS B2B multi-tenant para empresas de servicios y operaciones de campo (mantenimiento, limpieza, climatización, saneamiento).

## 1. Stack y Estructura del Monorepo
- **Gestor de paquetes:** `pnpm@12.10.1` (PROHIBIDO usar `npm install` o `yarn`).
- **Orquestador:** Turborepo (`turbo.json`).
- **Aplicaciones (`apps/`):**
  - `apps/web` (`@vittkly/web`): Central Web Administrativa. Next.js 16.4 (App Router, React 19, Tailwind CSS v4, `@supabase/ssr`).
  - `apps/mobile` (`@vittkly/mobile`): App de Campo (Técnicos y Supervisores). Expo SDK 57, React Native 0.86, Expo Router, `expo-sqlite`, `expo-secure-store`.
- **Paquetes Compartidos (`packages/`):**
  - `packages/ui-tokens` (`@vittkly/ui-tokens`): Fuente única de verdad de colores, espaciados, radios, tipografía y logos del UI Kit.
  - `packages/db-types` (`@vittkly/db-types`): Tipos TypeScript generados desde Supabase Cloud (`Database`).
  - `packages/shared` (`@vittkly/shared`): Esquemas de validación Zod, constantes y utilitarios puros.
- **Base de Datos (`supabase/`):** Supabase Cloud (sin Docker local). Dos proyectos en la nube: Staging/Test y Producción, separados exclusivamente por variables de entorno.

## 2. Comandos Clave (Ejecutar desde la raíz)
- `pnpm dev`: Levanta los entornos de desarrollo.
- `pnpm dev:web` / `pnpm dev:mobile`: Levanta solo Web o solo Mobile.
- `pnpm lint`: Ejecuta ESLint en todos los workspaces.
- `pnpm typecheck`: Ejecuta `tsc --noEmit` en todos los workspaces.
- `pnpm test`: Ejecuta pruebas unitarias con Vitest.
- `pnpm build`: Compila paquetes y aplicaciones.
- `pnpm check`: Ejecuta `lint` + `typecheck` + `test` (OBLIGATORIO antes de dar una tarea por terminada).
- `pnpm sync:db-types`: Regenera `packages/db-types/src/database.types.ts` desde Supabase Cloud.

## 3. Reglas Arquitectónicas Innegociables
1. **Fronteras del Monorepo:** `apps/web` y `apps/mobile` NUNCA se importan entre sí. Todo código compartido vive en `packages/*`.
2. **Thin Routing:** `src/app/` (tanto en Next.js como en Expo Router) solo contiene rutas delgadas y layouts (< 80 líneas). Toda la lógica de dominio vive en `src/features/<feature>/`.
3. **Patrón Repositorio en Supabase:** Prohibido importar clientes de Supabase en `src/app/**` o `src/components/**` (bloqueado por ESLint). Todo acceso a datos va en `src/features/<feature>/services/`.
4. **Seguridad Multi-Tenant y Llaves:**
   - `SUPABASE_SERVICE_ROLE_KEY` solo puede usarse en el servidor (`apps/web/src/lib/supabase/admin.ts` con `import 'server-only'`). NUNCA en el cliente web ni en la app móvil.
   - Toda tabla en Supabase debe tener `ENABLE ROW LEVEL SECURITY` y `FORCE ROW LEVEL SECURITY` con políticas atómicas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) y cláusula `WITH CHECK`.
5. **Sistema de Diseño Inmutable:**
   - Prohibido hardcodear colores HEX (`#...`) en componentes. Usar `@vittkly/ui-tokens` (`useTheme()` en móvil, clases semánticas en web).
   - El color `#3EC49B` (`kleanly` / `success`) está reservado EXCLUSIVAMENTE para tareas `completada` o `pagada` y el isotipo de la marca. Nunca en botones de acción general.
   - En móvil, todo control táctil interactivo mide mínimo `48px` (`control.lg`).

## 4. Qué NO Hacer (Prohibiciones para Agentes)
- NO ejecutar comandos de migración destructivos (`supabase db reset`, `DROP TABLE`) ni conectarse a la base de datos de producción.
- NO crear ni editar carpetas nativas `/ios` o `/android` en `apps/mobile` (se usa Continuous Native Generation vía `app.json`).
- NO instalar paquetes en `apps/mobile` sin verificar compatibilidad con Expo SDK 57 (`npx expo-doctor`).
- NO leer ni indexar `docs/artifacts/Demo/completa/` salvo que el usuario lo pida explícitamente.

## 5. Definición de "Terminado" (Definition of Done)
Ninguna tarea está terminada hasta que `pnpm lint`, `pnpm typecheck` y `pnpm test` pasen con 0 errores desde la raíz del monorepo.
```

### 8.2. Organización de Reglas por Área en `/.agents/rules/`
- `.agents/rules/monorepo-boundaries.md`: Reglas de workspaces, prohibición de imports entre apps y uso de `pnpm`.
- `.agents/rules/web-nextjs-ssr.md` (glob: `apps/web/**`): RSC por defecto, Server Actions validadas con Zod de `@vittkly/shared`, patrón repositorio SSR y `server-only`.
- `.agents/rules/mobile-expo-cng.md` (glob: `apps/mobile/**`): Expo Router delgado (`max-lines: 80`), CNG (`app.json`), ergonomía de calle (`48px`, `17px bodyLg`), offline-first con `expo-sqlite` y `expo-secure-store`.
- `.agents/rules/supabase-rls-security.md` (glob: `supabase/**`, `**/supabase/**`, `**/services/**`): `FORCE ROW LEVEL SECURITY`, políticas separadas por comando con `WITH CHECK`, `SET search_path = public, pg_temp` en funciones `SECURITY DEFINER`, y referencia al esquema vigente.
- `.agents/rules/design-tokens-strict.md` (glob: `**/*.tsx`, `**/theme/**`): Uso obligatorio de `@vittkly/ui-tokens`, restricción de `#3EC49B` y números tabulares (`tabular-nums`) para montos y códigos `OT-XXXX`.

### 8.3. Estrategia de Pruebas Automatizadas y Monitoreo de Errores
1. **Unitarias (`Vitest`):** En `packages/shared` (100 % de los esquemas Zod y validadores) y en `apps/web` / `apps/mobile` para funciones puras de negocio y mapeadores de datos (`mapRawContextToTenant`, `evaluatePasswordStrength`, cálculo de bloqueos).
2. **Componentes (`@testing-library/react` en Web y `@testing-library/react-native` en Mobile):** Pruebas de renderizado, estados de error y accesibilidad en los componentes de `src/components/ui/` (ampliando el test actual de `StatusBadge.test.tsx` a `Button`, `PasswordField`, `PinPad`).
3. **Integración contra Supabase Staging/Test:** Pruebas de repositorios y políticas RLS conectadas exclusivamente a las credenciales del proyecto Supabase secundario de pruebas (`SUPABASE_TEST_URL` / `SUPABASE_TEST_ANON_KEY`), **nunca** contra producción.
4. **End-to-End (E2E):**
   - **Web:** `Playwright` (`apps/web/e2e/`) verificando login, bloqueo por intentos fallidos, registro y carga del dashboard de módulos por perfil.
   - **Móvil:** `Maestro` (archivos declarativos YAML en `apps/mobile/.maestro/`) por su simplicidad para agentes de IA y compatibilidad con builds de Expo sin requerir compilación nativa gris compleja como Detox.
5. **Control de Errores y Monitoreo Recomendado:** Integrar `@sentry/nextjs` en `apps/web` y `@sentry/react-native` (con plugin de Expo en `app.json`) en `apps/mobile`, acompañados de un logger estructurado en `@vittkly/shared` que redacte tokens/PII antes de reportar excepciones.

---

## 9. Skills y Recursos Recomendados

Todos los enlaces a continuación han sido verificados:

| Recurso / Skill | URL Verificada | Qué problema previene en Agentes de IA | Parte del Repo donde aplica |
| :--- | :--- | :--- | :--- |
| **Supabase Official Agent Skills** (`supabase-postgres-best-practices`) | https://github.com/supabase/agent-skills | Previene que el agente escriba políticas RLS inseguras (sin `WITH CHECK` o lentas sin `select auth.uid()`), funciones `SECURITY DEFINER` sin `search_path` fijo o migraciones sin índices en llaves foráneas (`empresa_id`/`org_id`). | `supabase/`, `packages/db-types/`, servicios en `apps/*/src/**/services/` |
| **Vercel Official Agent Skills** (`vercel-react-best-practices`) | https://github.com/vercel-labs/agent-skills | Previene cascadas de peticiones (`await` secuenciales en RSC), uso innecesario de `'use client'` en árboles grandes y errores de caché en Next.js App Router. | `apps/web/src/app/`, `apps/web/src/features/` |
| **Expo LLMs Documentation Index (`llms.txt`)** | https://docs.expo.dev/llms.txt | Previene alucinaciones de APIs deprecadas de Expo (como `expo-av` o configuraciones antiguas de `expo-router`), guiando al agente al índice oficial optimizado para LLMs de Expo. | `apps/mobile/` |
| **Expo Official Monorepo Guide** | https://docs.expo.dev/guides/monorepos/ | Previene configuraciones manuales obsoletas en `metro.config.js`, errores de resolución de symlinks con `pnpm` y fallos en builds remotos de EAS. | `apps/mobile/metro.config.js`, `pnpm-workspace.yaml`, `.npmrc` |
| **Turborepo Structuring & Caching Guide** | https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository | Previene tareas raíz mal definidas, ciclos en `dependsOn` y fugas de variables de entorno en el caché de compilación (`env` / `globalEnv`). | `turbo.json`, `package.json` raíz, `packages/*` |
| **Supabase Generating TypeScript Types & RLS Guide** | https://supabase.com/docs/guides/api/rest/generating-types y https://supabase.com/docs/guides/database/postgres/row-level-security | Previene discrepancias manuales en `database.types.ts` y consultas sin tipado estático en `@supabase/supabase-js`. | `packages/db-types/`, `apps/web/src/lib/supabase/`, `apps/mobile/src/services/supabase.ts` |
| **Next.js Bundled Agent Docs** (`node_modules/next/dist/docs/`) | Verificado localmente en `apps/web/node_modules/next/dist/docs/` | Previene que el agente use patrones de Next.js 13/14 (como `cookies()` síncrono) en un proyecto Next.js 16.4 (`cookies()` y `headers()` asíncronos). | `apps/web/` |

---

## 10. Preguntas Abiertas que Requieren tu Decisión

Antes de autorizar el inicio de la **Fase 2**, necesito tu decisión sobre estos 4 puntos:

1. **Esquema de Base de Datos Canónico (Español vs. Inglés):**
   En `packages/db-types/src/database.types.ts` coexisten dos modelos: el nuevo en español (`empresas`, `membresias`, `usuarios`, `perfiles`, `modulos`, usado por `apps/web` y `seed.sql`) y el anterior en inglés (`organizations`, `memberships`, `profiles`, `work_orders`, usado aún en fallbacks de `apps/mobile`).
   - *¿Confirmas que el modelo en español (`empresas`/`membresias`/`usuarios` + RPC `mi_contexto()`) es el estándar definitivo hacia el cual debemos alinear progresivamente `apps/mobile`?*
2. **Destino del paquete de demostración `docs/artifacts/Demo/completa/` (27 MB):**
   Actualmente hay 27 MB de código HTML/JS monolítico y binarios WASM de Tesseract OCR versionados en Git dentro de `docs/artifacts/Demo/completa/`, además del documento resumen `docs/artifacts/doc_artifact.md`.
   - *¿Prefieres (A) mantener `docs/artifacts/Demo/completa/` en el repo pero aislado de ESLint/Prettier y de los agentes de IA, (B) eliminar solo los binarios pesados `tess/*.wasm*` (18.6 MB) conservando los `.js`/`.html` de referencia, o (C) sacar la carpeta `Demo/completa/` del branch principal conservando `doc_artifact.md`?*
3. **Ubicación de los clientes de Supabase (`packages/supabase` vs. `packages/db-types`):**
   Dado que `apps/web` usa `@supabase/ssr` (dependiente de `next/headers` y `next/server`) y `apps/mobile` usa `@react-native-async-storage/async-storage`, unificar ambos clientes runtime en un mismo archivo rompe el bundler de React Native.
   - *¿Estás de acuerdo con mantener los inicializadores runtime en cada app y usar `@vittkly/db-types` (o renombrarlo/aliarlo con `@vittkly/supabase`) exclusivamente para los tipos generados (`Database`), constantes y helpers agnósticos de plataforma?*
4. **Convención de formato en Prettier (`trailingComma`):**
   `apps/web/.prettierrc` usa `"trailingComma": "es5"` y `apps/mobile/.prettierrc` usa `"trailingComma": "all"`.
   - *Al unificar `.prettierrc` en la raíz en la Etapa 3, ¿prefieres estandarizar en `"all"` (valor por defecto de Prettier v3) o en `"es5"`?*
