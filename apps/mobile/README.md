# Vittkly Mobile App 📱

Aplicación móvil universal de **Vittkly** desarrollada con **React Native (Expo SDK 57)**, **Expo Router**, **Supabase Multi-tenant** y un **Ecosistema de Agentes de IA**.

---

## 🚀 Inicio Rápido y Onboarding

### 1. Requisitos Previos

- **Node.js**: v20.x o superior
- **npm**: v10.x o superior
- **Expo Go** o build de desarrollo en dispositivo móvil / emulador

### 2. Instalación de Dependencias

Al clonar o actualizar el repositorio, ejecuta:

```bash
npm install
```

> [!NOTE]
> La instalación de dependencias activa automáticamente **Husky** (`npm run prepare`), configurando los hooks de `pre-commit` y `commit-msg` en tu entorno local.

### 3. Configuración de Variables de Entorno

Copia la plantilla de entorno:

```bash
cp .env.example .env.local
```

Edita `.env.local` con las credenciales de tu proyecto:

```env
# Conexión Supabase (Cliente Expo)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key

# Token Personal de Supabase (Para MCP Server y Supabase CLI)
SUPABASE_PERSONAL_ACCESS_TOKEN=your-supabase-pat-token
```

> [!IMPORTANT]
> El archivo `.env.local` está protegido en `.gitignore`. **Nunca commitees claves reales al repositorio**.

### 4. Iniciar el Servidor de Desarrollo

```bash
npm start
```

---

## 🛠️ Scripts de Calidad y Mantenimiento

Disponemos de herramientas automatizadas para asegurar la estabilidad del proyecto:

| Comando                 | Acción                                                                 |
| :---------------------- | :--------------------------------------------------------------------- |
| `npm run typecheck`     | Valida tipos TypeScript sin compilar (`tsc --noEmit`).                 |
| `npm run lint`          | Ejecuta ESLint (Flat Config) con reglas de arquitectura Vittkly.       |
| `npm run format`        | Aplica formato con Prettier en todo el proyecto.                       |
| `npm run format:check`  | Verifica que el código cumpla con el formato de Prettier.              |
| `npm run pre-flight`    | Suite integral previa a entrega: **Typecheck + ESLint + Expo Doctor**. |
| `npm run sync:db-types` | Regenera `src/types/database.types.ts` conectándose a Supabase.        |

---

## 🏛️ Pilares de Arquitectura Obligatorios

Todo código nuevo en el proyecto debe alinearse con estos 4 pilares:

### 1. Thin Routing (`src/app/`)

- Los archivos en `src/app/` son exclusivamente pantallas y layouts de **Expo Router**.
- **Prohibido** incluir llamadas a red, queries pesadas o manipulación compleja de estado dentro de las pantallas. La lógica de negocio reside en `src/features/` o Custom Hooks en `src/hooks/`.

### 2. Repository & Custom Hook Pattern (Supabase)

- **Prohibido** importar `@/services/supabase` dentro de `src/app/**` o `src/components/**`. Una regla de ESLint (`no-restricted-imports`) bloqueará el commit si se detecta un acceso directo.
- Todo acceso a base de datos debe pasar por un servicio tipado (`src/services/<entity>.service.ts`) y exponerse a la UI mediante un Custom Hook (`src/hooks/use<Entity>.ts`).

### 3. Design Tokens de Marca Vittkly (`@/theme`)

- **Cero Magic Numbers o Colores Arbitrarios**: No utilices valores hexadecimales ni márgenes hardcodeados en los estilos.
- Todo valor estético debe provenir de `@/theme` (`tokens`, `useTheme`, `colors`, `typography`, `spacing`, `radii`).
- **Dimensión Táctil Mínima**: Los botones, inputs y controles principales deben tener un alto mínimo de `tokens.sizes.control.lg` (48px) para accesibilidad táctil.
- **Semántica Kleanly**: El color verde Kleanly (`tokens.colors.primary.kleanly` / `#3EC49B`) está reservado **exclusivamente** para estados completados, pagados o transacciones exitosas.

### 4. Continuous Native Generation (CNG)

- **Nunca** modifiques manualmente las carpetas `ios/` o `android/`.
- Cualquier configuración o plugin nativo debe definirse de manera declarativa en `app.json`.

---

## 🤖 Ecosistema de Agentes de IA (`.agents/`)

El repositorio incluye herramientas integradas para asistentes y agentes de IA (Antigravity / Cursor / Claude):

- **Rules (`.agents/rules/`)**: Reglas de contexto activo que guían la generación de código:
  - `thin-routing.md`
  - `supabase-repository-pattern.md`
  - `strict-brand-tokens.md`
  - `component-architecture.md`
  - `rls-security-policy.md`
  - `expo-cng.md`
- **Skills (`.agents/skills/`)**: Procedimientos paso a paso para tareas complejas:
  - `vittkly-ui-builder`: Construcción de componentes UI accesibles y tipados.
  - `supabase-repository-hook`: Creación del flujo Tipos -> Repositorio -> Custom Hook.
  - `rls-migration-auditor`: Checklist de seguridad para migraciones SQL.
  - `pre-flight`: Verificación automática de calidad.
  - `sync-db-types`: Guía para refrescar tipos de la base de datos.
- **MCP Servers (`.agents/mcp_config.json`)**: Configuración lista para conectar `supabase-mcp` (lectura de esquema real) y `context7-mcp` (documentación oficial actualizada).
- **Hooks (`.agents/hooks.json`)**: Auto-typecheck post-edición al escribir o modificar código.

---

## 📝 Convención de Commits (Conventional Commits)

El proyecto utiliza **Commitlint** junto con **Husky** para estandarizar los mensajes de Git:

```text
<tipo>(<alcance opcional>): <descripción concisa>
```

### Tipos Permitidos:

- `feat`: Nueva característica para el usuario.
- `fix`: Corrección de un bug.
- `docs`: Cambios exclusivamente en documentación.
- `style`: Formateo, espaciado, comas (sin cambios en lógica de código).
- `refactor`: Refactorización de código sin alterar comportamiento.
- `perf`: Mejoras de rendimiento.
- `test`: Adición o corrección de pruebas.
- `chore`: Tareas de mantenimiento, dependencias o configuración del repositorio.

_Ejemplo:_

```bash
git commit -m "feat(auth): implement OTP pinpad component with accessibility labels"
```
