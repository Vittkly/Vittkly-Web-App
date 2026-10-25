---
name: supabase-ssr-repository-hook
description: Procedimiento para crear un Repositorio en Supabase SSR + Server Action con validación Zod + Custom Hook de TanStack Query para Vittkly Web.
---

# Supabase SSR Repository & Hook Builder

## Flujo de Trabajo

1. **Definir Tipos y Esquema Zod:** En `src/features/[feature]/types/index.ts`.
2. **Crear Repositorio:** En `src/features/[feature]/services/[feature]Repository.ts`.
   - Usar `createClient()` de `@/lib/supabase/server`.
   - Filtrar siempre por `org_id`.
3. **Crear Server Action:** En `src/features/[feature]/actions/[feature]Actions.ts`.
   - Validar con Zod antes de llamar al repositorio.
   - Retornar `{ success: true, data }` o `{ success: false, error }`.
4. **Crear Hook de Cliente:** En `src/features/[feature]/hooks/use[Feature].ts`.
   - Usar `useQuery` o `useMutation` de `@tanstack/react-query`.
