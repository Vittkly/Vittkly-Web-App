---
name: sync-db-types
description: Sincroniza y regenera los tipos TypeScript de la base de datos de Supabase hacia src/types/database.types.ts.
---

# Sync Database Types Skill

Esta skill permite regenerar las definiciones de tipos de TypeScript para la base de datos de Supabase.

## Requisitos Previos
- Contar con Supabase CLI instalado localmente o mediante `npx supabase`.
- Tener configurado `SUPABASE_PROJECT_ID` o acceso local en `supabase/`.
- Disponer de `SUPABASE_PERSONAL_ACCESS_TOKEN` o sesión iniciada en la CLI.

## Instrucciones de Ejecución

### Para Proyecto Remoto
```bash
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/types/database.types.ts
```

### Para Instancia Local de Supabase
```bash
npx supabase gen types typescript --local > src/types/database.types.ts
```

## Validación Post-Generación
1. Verificar que `src/types/database.types.ts` no esté vacío.
2. Ejecutar `npx tsc --noEmit` para asegurar que ningún cambio de esquema rompa servicios existentes.
