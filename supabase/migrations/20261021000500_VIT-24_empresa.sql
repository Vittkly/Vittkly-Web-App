-- =====================================================================
-- Migración 5 · Empresa: empresas y empresa_configuracion
-- Historia: VIT-24
-- =====================================================================

create table public.empresas (
  id                uuid primary key default gen_random_uuid(),
  cuenta_id         uuid not null references public.cuentas(id),
  razon_social      text not null,
  nombre_comercial  text,
  ruc               text check (ruc is null or ruc ~ '^[0-9]{11}$'),
  direccion         text,
  logo_ruta         text,
  color_marca       text check (color_marca is null or color_marca ~ '^#[0-9A-Fa-f]{6}$'),
  modelo_operacion  text not null default 'visita' check (modelo_operacion in ('visita','contrato','ambos')),
  zona_horaria      text not null default 'America/Lima',
  pais              text not null default 'PE',
  moneda            text not null default 'PEN',
  activa            boolean not null default true,
  creado_en         timestamptz not null default now(),
  creado_por        uuid default auth.uid(),
  actualizado_en    timestamptz not null default now(),
  actualizado_por   uuid,
  eliminado_en      timestamptz
);
create index empresas_cuenta_idx on public.empresas (cuenta_id);

create table public.empresa_configuracion (
  empresa_id       uuid primary key references public.empresas(id) on delete cascade,
  menu_acordeon    boolean not null default false,
  ajustes          jsonb not null default '{}'::jsonb check (jsonb_typeof(ajustes) = 'object'),
  version          integer not null default 1,
  creado_en        timestamptz not null default now(),
  creado_por       uuid default auth.uid(),
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid
);
comment on column public.empresa_configuracion.ajustes is 'Validado con Zod en packages/shared. Cada módulo suma su parte en su etapa.';

-- La versión sube con cada cambio, para no pisar el cambio de otra persona.
create or replace function public.subir_version_config()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.version := old.version + 1;
  return new;
end;
$$;

create trigger tocar_empresas       before update on public.empresas              for each row execute function public.tocar_actualizado();
create trigger tocar_config         before update on public.empresa_configuracion for each row execute function public.tocar_actualizado();
create trigger version_config       before update on public.empresa_configuracion for each row execute function public.subir_version_config();

-- Ahora que existe empresas, se agrega la llave foránea de usuarios.ultima_empresa_id.
alter table public.usuarios
  add constraint usuarios_ultima_empresa_fk
  foreign key (ultima_empresa_id) references public.empresas(id) on delete set null;

alter table public.empresas              enable row level security;
alter table public.empresa_configuracion enable row level security;
