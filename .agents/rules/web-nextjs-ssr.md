---
description: Reglas de arquitectura para Next.js 16 App Router y Supabase SSR en la Central Web
globs: ["apps/web/**"]
---

# Web Architecture: Next.js 16 & Supabase SSR

1. **Thin Routing en `src/app/`:**
   - Las rutas (`page.tsx`) y layouts (`layout.tsx`) deben ser orquestadores ultraligeros (< 80 líneas).
   - La lógica de negocio, consultas de datos y Server Actions residen en `src/features/<feature>/`.
2. **Server Components por Defecto:**
   - Los componentes son RSC por defecto. Solo agregar `'use client'` en hojas del árbol que manejen estado local interactivo (`useState`, `useEffect`) o eventos de usuario.
3. **Patrón Repositorio en Supabase SSR:**
   - Prohibido importar `@/lib/supabase/*` en componentes de presentación (`src/components/**`) o rutas de `src/app/**`.
   - El acceso a datos se aísla en `src/features/<feature>/services/`.
4. **Seguridad de Service Role (`admin.ts`):**
   - El cliente administrativo con `SUPABASE_SERVICE_ROLE_KEY` debe incluir `import 'server-only'` y usarse exclusivamente en Server Actions para operaciones de autenticación seguras (bloqueo por fuerza bruta).
5. **Validación de Formularios:**
   - Todas las mutaciones y Server Actions validan el payload con esquemas Zod de `@vittkly/shared` antes de interactuar con la base de datos.
