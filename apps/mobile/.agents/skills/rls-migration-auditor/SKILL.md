---
name: rls-migration-auditor
description: Procedimiento de auditoría de seguridad para migraciones SQL y políticas RLS multi-tenant en Supabase.
---

# RLS Migration Auditor Skill

Esta skill permite auditar y validar que las políticas de Row Level Security (RLS) y migraciones de Supabase cumplan con los estándares de seguridad de Vittkly documentados en `docs/security/auditoria_bd_supabase_rls.md`.

## Checklist de Auditoría RLS

Cada migración SQL nueva o modificada debe pasar la siguiente lista de verificación:

### 1. Activación de RLS
- [ ] ¿La tabla tiene `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`?
- [ ] ¿La tabla tiene `ALTER TABLE ... FORCE ROW LEVEL SECURITY;` para evitar que los owners de tablas evadan RLS?

### 2. Aislamiento Multi-tenant
- [ ] ¿Las políticas `USING` y `WITH CHECK` restringen por `auth.uid()` o por membresía de tenant (`tenant_id = auth.jwt()->>'tenant_id'` o subconsulta a tabla de miembros)?
- [ ] ¿Existe alguna política con `USING (true)` o `WITH CHECK (true)` en tablas que contienen información privada o transaccional? (Si existe, debe ser rechazada inmediatamente).

### 3. Cobertura de Operaciones CRUD
- [ ] ¿Están definidas explícitamente las políticas para `SELECT`, `INSERT`, `UPDATE` y `DELETE`?
- [ ] Para `INSERT`: ¿Existe cláusula `WITH CHECK` que valide que el registro nuevo pertenezca al usuario que lo crea?
- [ ] Para `UPDATE`: ¿Se validan tanto `USING` (registro previo) como `WITH CHECK` (registro resultante) para evitar que un usuario transfiera un registro a otro tenant/usuario?

### 4. Permisos de Roles (Grants)
- [ ] ¿La tabla revoca permisos a `PUBLIC` y sólo otorga los necesarios a `authenticated` y `anon`?
  ```sql
  REVOKE ALL ON public.mi_tabla FROM PUBLIC;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.mi_tabla TO authenticated;
  ```

### 5. Prevención de Ataques de Recursión
- [ ] En políticas que consultan tablas de membresía u organizaciones, ¿se utilizan funciones `SECURITY DEFINER` o índices adecuados en `(user_id, organization_id)` para prevenir bucles de recursión infinita en RLS?
