# Rule: Repository & Service Pattern para Supabase

## Principio
El cliente de Supabase (`@/services/supabase`) es privado para la capa de acceso a datos. La interfaz de usuario (componentes, pantallas y rutas) NUNCA debe interactuar directamente con el SDK de Supabase.

## Arquitectura de 3 Capas
1. **Capa de Repositorio / Servicio (`src/services/repositories/*`):**
   - Ejecuta consultas tipadas a Supabase (`supabase.from(...)`).
   - Mapea errores de PostgreSQL a tipos de error de dominio claros.
   - Aplica filtros de tenant (`org_id`) obligatorios.
2. **Capa de Custom Hooks / State (`src/hooks/*` o `src/features/*/hooks/*`):**
   - Consume los repositorios.
   - Gestiona estado de carga (`isLoading`), errores (`error`) y mutaciones.
3. **Capa de Presentación (UI):**
   - Consume exclusivamente los Custom Hooks.
   - Permanece completamente desacoplada de la implementación de la base de datos.

## Restricción de ESLint
Cualquier importación de `@/services/supabase` en `src/app/**` o `src/components/**` está bloqueada por la regla `no-restricted-imports` de ESLint y detendrá el pipeline de compilación.
