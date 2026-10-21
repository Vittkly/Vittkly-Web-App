<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Vittkly SaaS Web Platform — Reglas para Agentes IA

Esta es la plataforma web SaaS oficial de **Vittkly** para empresas de servicios en campo (despacho, cuadrillas, CRM, cotizaciones y facturación).

## 1. Reglas Arquitectónicas Innegociables

- **Thin Routing en `src/app/`:** Solo layouts, páginas delgadas y metadatos. La lógica de negocio reside en `src/features/`.
- **Patrón Repositorio en Supabase SSR:** Prohibido importar `@/lib/supabase/*` en componentes de presentación o rutas. Todo acceso a datos pasa por `src/features/[feature]/services/`.
- **Tokens Inmutables de Marca:** Usar siempre tokens semánticos (`bg-surface`, `bg-surface-raised`, `text-ink`, `border-line`). `#3EC49B` (`kleanly`/`success`) está estrictamente reservado para estados completados o cobrados.
- **RSC por Defecto:** Server Components por defecto; `'use client'` solo en hojas interactivas con estado o eventos.
- **Seguridad RLS Multi-Tenant:** Toda consulta y mutación debe estar aislada por `org_id` y protegida por las políticas RLS y funciones `is_org_member()` / `is_org_admin()`.

## 2. Comandos de Verificación

```bash
npm run typecheck    # npx tsc --noEmit
npm run lint         # npx eslint .
npm run test         # npx vitest run
npm run pre-flight   # typecheck + lint + test
```
