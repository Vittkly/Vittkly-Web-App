---
name: sync-db-types
description: Procedimiento para sincronizar los tipos de base de datos de Supabase Cloud hacia src/types/database.types.ts usando Supabase CLI.
---

# Sync DB Types

Genera los tipos de TypeScript directamente desde el proyecto de Supabase enlazado:

```bash
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/types/database.types.ts
```

Si no hay conexión directa o se trabaja offline, actualizar manualmente `src/types/database.types.ts` respetando los scripts de migración de `docs/database/`.
