<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Vittkly Web SaaS (`@vittkly/web`) — Reglas de Desarrollo

Central web de administración de Vittkly (Next.js 16.4 App Router, React 19, Tailwind CSS v4, `@supabase/ssr`).

## Comandos de Verificación (desde la raíz o en apps/web)

```bash
pnpm --filter @vittkly/web typecheck    # Verificación de TypeScript
pnpm --filter @vittkly/web lint         # ESLint 9 Flat Config
pnpm --filter @vittkly/web test         # Vitest unit tests
pnpm --filter @vittkly/web test:e2e     # Playwright E2E tests
```

## Reglas Específicas
- Consumir siempre `@vittkly/shared` para esquemas de validación Zod y tipos de dominio.
- Todo acceso a la base de datos se aísla en `src/features/<feature>/services/`.
- `createAdminClient()` en `src/lib/supabase/admin.ts` está blindado por `import 'server-only'`.
