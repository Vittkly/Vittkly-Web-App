---
name: rls-migration-auditor
description: Procedimiento de auditoría RLS en scripts de migración PostgreSQL para prevenir VULN-01 (fuga cross-tenant), VULN-02 (mutación sin check) y VULN-03 (bypass de RLS).
---

# RLS Migration Auditor

## Checklist de Verificación en cada Migración

- [ ] ¿La tabla tiene `ALTER TABLE ... FORCE ROW LEVEL SECURITY`?
- [ ] ¿Las políticas SELECT están restringidas a miembros activos con `is_org_member(org_id)`?
- [ ] ¿Las políticas INSERT/UPDATE tienen `WITH CHECK` que valide que el `org_id` no sea adulterado?
- [ ] ¿Las funciones `SECURITY DEFINER` tienen `SET search_path = public, pg_temp`?
- [ ] ¿Los índices de clave foránea en `org_id` existen para optimizar el rendimiento de las consultas RLS?
