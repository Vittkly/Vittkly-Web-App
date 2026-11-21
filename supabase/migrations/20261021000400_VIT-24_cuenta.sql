-- =====================================================================
-- Migración 4 · Cuenta: cuentas y suscripciones
-- Historia: VIT-24
-- =====================================================================

create table public.cuentas (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  propietario_id      uuid not null references public.usuarios(id),
  correo_facturacion  text,
  creado_en           timestamptz not null default now(),
  creado_por          uuid default auth.uid(),
  actualizado_en      timestamptz not null default now(),
  actualizado_por     uuid,
  eliminado_en        timestamptz
);
comment on table public.cuentas is 'Quien paga. Una cuenta tiene una suscripción y una o varias empresas.';

create table public.suscripciones (
  id              uuid primary key default gen_random_uuid(),
  cuenta_id       uuid not null unique references public.cuentas(id) on delete cascade,
  plan_id         uuid not null references public.planes(id),
  estado          text not null default 'prueba'
                  check (estado in ('prueba','activa','pago_fallido','solo_lectura','suspendida','cancelada')),
  periodo         text not null default 'mensual' check (periodo in ('mensual','anual')),
  prueba_hasta    timestamptz,
  inicio_en       timestamptz not null default now(),
  renueva_en      timestamptz,
  cancelada_en    timestamptz,
  creado_en       timestamptz not null default now(),
  creado_por      uuid default auth.uid(),
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid
);

create trigger tocar_cuentas       before update on public.cuentas       for each row execute function public.tocar_actualizado();
create trigger tocar_suscripciones before update on public.suscripciones for each row execute function public.tocar_actualizado();

alter table public.cuentas       enable row level security;
alter table public.suscripciones enable row level security;
