# Regla de Seguridad: Políticas RLS y Aislamiento Multi-Tenant

## Principio Fundamental

Vittkly es un SaaS multi-tenant. Cada tabla que pertenezca a la organización (`customers`, `work_orders`, `form_templates`, `form_submissions`, `memberships`, etc.) debe garantizar aislamiento estricto por `org_id`.

## Checklist Obligatorio

1. **FORCE ROW LEVEL SECURITY:**
   Toda tabla creada o alterada debe tener activado tanto `ENABLE ROW LEVEL SECURITY` como `FORCE ROW LEVEL SECURITY`.
2. **Políticas Atómicas por Comando:**
   No utilizar políticas monolíticas `FOR ALL`. Crear políticas separadas para `SELECT`, `INSERT`, `UPDATE` y `DELETE`.
3. **Cláusula WITH CHECK en Mutaciones:**
   Todo `INSERT` y `UPDATE` debe incluir `WITH CHECK (public.is_org_member(org_id))` o la validación equivalente para evitar mutaciones cross-tenant (VULN-02).
4. **Funciones con search_path Seguro:**
   Toda función `SECURITY DEFINER` debe tener `SET search_path = public, pg_temp` para prevenir inyecciones de esquema.
