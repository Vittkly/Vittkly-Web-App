# Vittkly Web SaaS (`@vittkly/web`) 💻

Central de administración web de **Vittkly** para despachadores, supervisores y administradores de empresas de mantenimiento técnico y servicios en campo.

Desarrollada sobre **Next.js 16 (App Router)** con Server Components de **React 19**, **Tailwind CSS v4** y autenticación SSR aislada por `org_id` con **Supabase Cloud**.

---

## 🚀 1. Stack Tecnológico Real

- **Framework:** [Next.js 16.4.2](https://nextjs.org) (App Router con React Server Components)
- **Runtime React:** React 19.3.0
- **Estilos:** Tailwind CSS v4 (`@tailwindcss/turbopack`)
- **Backend & Auth:** `@supabase/ssr` (`^0.12.7`) y `@supabase/supabase-js` (`^2.118.0`)
- **Estado Global:** Zustand (`^5.0.15`) y TanStack Query (`^5.104.3`)
- **Validación:** Zod (`^4.6.7`) y `@vittkly/shared`
- **Testing:** Vitest (`^5.0.5`), `@testing-library/react` (`^16.3.3`) y Playwright E2E (`^1.64.1`)
- **Integración Monorepo:** `transpilePackages: ['@vittkly/shared', '@vittkly/db-types']` en `next.config.ts`

---

## 📊 2. Estado Actual de la Base de Código vs. Roadmap

### ✅ Lo que ya está construido en el repositorio:
1. **Infraestructura Supabase SSR (`src/lib/supabase/`):**
   - `client.ts`: Cliente de navegación para Client Components.
   - `server.ts`: Cliente seguro para Server Components y Server Actions con gestión de cookies.
   - `middleware.ts`: Verificación de sesión y renovación de cookies en el borde (`src/middleware.ts`).
2. **Sistema de Temas y Tokens Semánticos (`src/components/providers/ThemeProvider.tsx` y `src/theme/`):**
   - Soporte completo para modo oscuro y claro con `next-themes` y variables CSS en `src/app/globals.css`.
   - Regla estricta de color: `#3EC49B` (`kleanly` / `success`) únicamente para transacciones u órdenes exitosas.
3. **UI Kit Base Tipado (`src/components/ui/`):**
   - `Button`: Botones accesibles con variantes primarias, secundarias y de peligro.
   - `Card`: Contenedores semánticos con sombras y bordes acordes al sistema de diseño.
   - `StatusBadge`: Insignias de estado operativo (con suite de tests unitarios en Vitest).
   - `TextField`: Inputs de formulario con validación y estados de foco.
   - `ThemeToggle`: Selector accesible de modo claro/oscuro.
   - `VittklyLogo`: Logotipo institucional vectorizado.

### 🚧 Roadmap de Funcionalidades Pendientes (Próximos Sprints):
- **`src/features/auth/`**: Pantallas de Login con magic link / contraseña, registro de empresa y recuperación.
- **`src/features/dashboard/`**: Panel analítico general de la empresa con métricas de órdenes de trabajo.
- **`src/features/work-orders/`**: Creación, programación y despacho de órdenes a técnicos en campo.
- **`src/features/crm/`**: Gestión de clientes, contratos y ubicaciones de servicio.
- **`src/features/billing/`**: Liquidación de servicios, cobros y facturación.

---

## ⚙️ 3. Variables de Entorno

Genera el archivo `.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

### Variables Requeridas:
```env
# URL de tu instancia en Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Llave anónima pública
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
```

---

## 💻 4. Scripts y Flujo de Desarrollo

Desde la raíz del monorepo:
```bash
# Iniciar servidor de desarrollo en http://localhost:3000
pnpm dev:web

# Ejecutar verificación de tipos
pnpm --filter @vittkly/web typecheck

# Ejecutar suite de pruebas unitarias con Vitest
pnpm --filter @vittkly/web test

# Ejecutar pruebas End-to-End con Playwright
pnpm --filter @vittkly/web test:e2e
```

---

## ☁️ 5. Despliegue Objetivo (Production Target)

La Central Web está optimizada para desplegarse de manera fluida en arquitecturas de borde o serverless modernas (como **Cloudflare Pages / Workers** mediante `@cloudflare/next-on-pages` o **Vercel**), aprovechando la ejecución ultrarrápida del middleware de Supabase SSR.
