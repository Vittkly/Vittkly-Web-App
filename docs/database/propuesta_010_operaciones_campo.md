# Propuesta Técnica: Módulo 010 — Operaciones de Campo, Clientes y Órdenes de Trabajo

**Plataforma Vittkly SaaS**

---

## 1. Alcance y Objetivos

Este documento define la estructura de datos, restricciones de integridad y matriz de políticas RLS para las operaciones de campo en Vittkly SaaS:

- Gestión centralizada de Clientes (`customers`).
- Órdenes de Trabajo (`work_orders`) para cuadrillas y técnicos.
- Formularios dinámicos y actas de servicio (`form_templates` y `form_submissions`).
- Evidencias fotográficas y firmas (`work_order_evidence`).
- Registro de tiempos de cuadrilla (`time_entries`).

---

## 2. Esquema Relacional PostgreSQL (Supabase)

```sql
-- 1. TABLA: customers (Directorio de clientes del tenant)
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  company_name text,
  doc_type text DEFAULT 'DNI' CHECK (doc_type IN ('DNI', 'RUC', 'CE', 'PASAPORTE')),
  doc_number text,
  email text,
  phone text,
  address text,
  city text DEFAULT 'Lima',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. TABLA: work_orders (Órdenes de servicio y despacho)
CREATE TABLE IF NOT EXISTS public.work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code text NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE RESTRICT,
  technician_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'programada' CHECK (
    status IN ('programada', 'en-ruta', 'en-curso', 'completada', 'pagada', 'pendiente', 'atrasada', 'por-vencer', 'cancelada')
  ),
  scheduled_date date,
  start_time time,
  end_time time,
  address text,
  latitude double precision,
  longitude double precision,
  total_amount numeric(12,2) DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'PEN' CHECK (currency IN ('PEN', 'USD')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_work_orders_org_code UNIQUE (org_id, code)
);

-- 3. TABLA: form_templates (Plantillas de actas e inspección)
CREATE TABLE IF NOT EXISTS public.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. TABLA: form_submissions (Respuestas y actas completadas)
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.form_templates(id) ON DELETE RESTRICT,
  submitted_by uuid NOT NULL REFERENCES public.profiles(id),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_signature_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. TABLA: work_order_evidence (Fotos antes/durante/después)
CREATE TABLE IF NOT EXISTS public.work_order_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('antes', 'durante', 'despues', 'conformidad')),
  file_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. TABLA: time_entries (Horas y cronometraje de servicio)
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 3. Matriz de Seguridad RLS y Aislamiento por `org_id`

Todas las tablas operativas cuentan obligatoriamente con `FORCE ROW LEVEL SECURITY`:

```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders FORCE ROW LEVEL SECURITY;

ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates FORCE ROW LEVEL SECURITY;

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.work_order_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_evidence FORCE ROW LEVEL SECURITY;

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries FORCE ROW LEVEL SECURITY;

-- Políticas SELECT atómicas basadas en is_org_member()
CREATE POLICY "customers_select_member" ON public.customers
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "work_orders_select_member" ON public.work_orders
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

-- Políticas de Mutación protegidas con WITH CHECK
CREATE POLICY "customers_insert_admin" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id));

CREATE POLICY "work_orders_insert_member" ON public.work_orders
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id));
```
