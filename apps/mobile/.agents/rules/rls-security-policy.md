---
description: Reglas de seguridad RLS (Row Level Security) y aislamiento multi-tenant en Supabase
globs: ["supabase/**/*.sql", "supabase/migrations/*.sql", "src/services/**/*.ts"]
---

# Supabase Multi-tenant RLS & Security Policy

Alineado con `docs/security/auditoria_bd_supabase_rls.md`, toda interacción con la base de datos y cada migración SQL debe cumplir estrictamente estas directrices:

## 1. RLS Habilitado por Defecto
- Cada tabla creada o modificada DEBE tener RLS activado inmediatamente:
  ```sql
  ALTER TABLE public.nombre_tabla ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.nombre_tabla FORCE ROW LEVEL SECURITY;
  ```

## 2. Aislamiento Multi-tenant Estricto
- Ninguna política RLS puede usar `USING (true)` o `WITH CHECK (true)` para operaciones públicas o de usuarios comunes.
- El aislamiento tenant/usuario se valida siempre contra `auth.uid()` o la función de pertenencia a organización/tenant:
  ```sql
  USING (user_id = auth.uid())
  ```
- Para operaciones multi-tenant de equipo, validar membresía explícita en tabla intermedia (p. ej. `organization_members` o `tenant_users`).

## 3. Principio de Menor Privilegio (POLP)
- Nunca usar la clave `service_role` en la aplicación cliente (React Native / Expo).
- Todas las consultas cliente usan `anon` o el JWT autenticado (`auth.uid()`).
- Operaciones privilegiadas (como billing, triggers administrativos o provisionamiento de esquemas) residen en Edge Functions con verificación de rol y firma HMAC/JWT.

## 4. Auditoría de Migraciones SQL
- Antes de aplicar cualquier migración en Supabase, auditar usando el skill `rls-migration-auditor`.
- Verificar cobertura de operaciones `SELECT`, `INSERT`, `UPDATE`, `DELETE` por separado; evitar `ALL` salvo cuando los permisos coincidan exactamente.
