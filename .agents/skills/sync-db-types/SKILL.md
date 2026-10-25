---
name: sync-db-types
description: Procedimiento para sincronizar y regenerar los tipos de TypeScript de Supabase Cloud en packages/db-types.
---

# Sync Database Types Skill

Esta skill permite regenerar las definiciones de tipos TypeScript para la base de datos de Supabase Cloud directamente en el paquete `@vittkly/db-types`.

## Requisitos Previos

- Tener configurada la variable `SUPABASE_PROJECT_ID` en el entorno o en el `.env` raíz.
- Disponer de sesión en Supabase CLI (`npx supabase login`) o `SUPABASE_PERSONAL_ACCESS_TOKEN`.

## Ejecución

Desde la raíz del monorepo:

```bash
pnpm sync:db-types
```

O comando directo equivalente:

```bash
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > packages/db-types/src/database.types.ts
```

## Validación

1. Verificar que `packages/db-types/src/database.types.ts` se haya generado correctamente.
2. Ejecutar `pnpm turbo run typecheck` para asegurar que las aplicaciones no tengan errores de tipado.
