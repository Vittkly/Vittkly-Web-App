---
description: Reglas de seguridad RLS, aislamiento multi-tenant y migraciones SQL en Supabase Cloud
globs: ["supabase/**/*.sql", "**/supabase/**", "**/services/**"]
---

# Supabase Multi-Tenant RLS & Security Policy

1. **FORCE ROW LEVEL SECURITY Universal:**
   - Toda tabla en Supabase debe crearse con `ENABLE ROW LEVEL SECURITY` y `FORCE ROW LEVEL SECURITY`.
2. **Aislamiento Multi-Tenant Estricto:**
   - Toda tabla operativa debe incluir `empresa_id` (o la referencia de tenant correspondiente) con clave foránea e índice.
   - Prohibido utilizar `USING (true)` o `WITH CHECK (true)` en tablas privadas o transaccionales.
3. **Políticas Atómicas por Comando:**
   - Descomponer las políticas en sentencias independientes para `SELECT`, `INSERT`, `UPDATE` y `DELETE`.
   - Toda mutación (`INSERT` y `UPDATE`) debe incluir cláusula `WITH CHECK` para prevenir transferencias cross-tenant.
4. **Funciones SECURITY DEFINER Blindadas:**
   - Toda función `SECURITY DEFINER` debe fijar explícitamente `SET search_path = public, pg_temp` para prevenir secuestro de esquema.
5. **Esquema Canónico:**
   - El esquema canónico oficial de la plataforma es el definido en `supabase/migrations/` (tablas de la Etapa 0: `empresas`, `membresias`, `usuarios`, `cuentas`, `planes`, `modulos`, `perfiles`, `permisos`).
