# Vittkly SaaS Web Platform

Plataforma web oficial de **Vittkly** para empresas de servicios en campo (limpieza especializada, mantenimiento técnico, despacho de cuadrillas, CRM, cotizaciones y facturación).

---

## 1. Stack Tecnológico

- **Framework:** [Next.js 16](https://nextjs.org) (App Router con React 19 Server Components)
- **Lenguaje:** TypeScript 5 (Modo estricto)
- **Estilos:** Tailwind CSS v4 con variables CSS bitemáticas (Light/Dark mode)
- **Tipografía:** Manrope (400-800) y JetBrains Mono con `tabular-nums`
- **Backend / Auth:** Supabase SSR (`@supabase/ssr`) con aislamiento RLS Multi-Tenant por `org_id`
- **Estado Cliente / Servidor:** TanStack Query (`@tanstack/react-query`) y Zustand
- **Validación:** Zod
- **Testing:** Vitest, React Testing Library y Playwright E2E
- **Calidad de Código:** ESLint (Flat Config con reglas arquitectónicas), Prettier, Husky, lint-staged y Commitlint

---

## 2. Reglas Arquitectónicas Innegociables

1. **Thin Routing en `src/app/`:** Las rutas solo orquestan layouts, páginas delgadas y metadatos. La lógica de negocio reside en `src/features/`.
2. **Patrón Repositorio en Supabase SSR:** Prohibido importar `@/lib/supabase/*` directamente en componentes de presentación o rutas. Todo acceso a datos pasa por `src/features/[feature]/services/`.
3. **Tokens Inmutables de Marca:** Usar siempre tokens semánticos (`bg-surface`, `bg-surface-raised`, `text-ink`, `border-line`). `#3EC49B` (`kleanly`/`success`) está estrictamente reservado para estados completados o cobrados.
4. **RSC por Defecto:** Server Components por defecto; `'use client'` solo en hojas interactivas con estado o eventos.
5. **Seguridad RLS Multi-Tenant:** Toda consulta y mutación debe estar aislada por `org_id` y protegida por las políticas RLS y funciones `is_org_member()` / `is_org_admin()`.

---

## 3. Scripts de Verificación y Desarrollo

```bash
# Desarrollo local
npm run dev

# Verificación de tipos TypeScript
npm run typecheck

# Linter de código y reglas arquitectónicas
npm run lint

# Pruebas unitarias
npm run test

# Pruebas End-to-End
npm run test:e2e

# Protocolo pre-flight completo (typecheck + lint + test)
npm run pre-flight

# Compilación de producción
npm run build
```

---

## 4. Estructura del Proyecto

```text
Vittkly-Web/
├── .agents/          # Ecosistema de Agentes IA (rules, skills, mcp, hooks)
├── docs/             # Docs-as-Code (seguridad RLS, arquitectura, sistema de diseño)
├── public/           # Activos públicos (brand, icons, favicons)
└── src/
    ├── app/          # Thin Routing (App Router)
    ├── components/   # UI Kit base (brand, icons, ui, providers)
    ├── lib/          # Clientes Supabase SSR (client, server, middleware)
    ├── theme/        # Tokens semánticos de diseño y constantes
    └── types/        # Tipos TypeScript de base de datos Supabase
```
