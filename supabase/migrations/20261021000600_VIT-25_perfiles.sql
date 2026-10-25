-- =====================================================================
-- Migración 6 · Perfiles y sus permisos
-- Historia: VIT-25 (y VIT-42 para los perfiles base)
-- =====================================================================

create table public.perfiles (
  id               uuid primary key default gen_random_uuid(),
  empresa_id       uuid references public.empresas(id) on delete cascade,
  codigo           text,
  nombre           text not null,
  descripcion      text,
  es_base          boolean not null default false,
  creado_en        timestamptz not null default now(),
  creado_por       uuid default auth.uid(),
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid,
  -- empresa_id vacío = plantilla de la plataforma: se copia a cada empresa nueva.
  constraint plantilla_es_base check (empresa_id is not null or es_base)
);
-- Un nombre por empresa; y un nombre por plantilla.
create unique index perfiles_nombre_empresa_uq on public.perfiles (empresa_id, nombre) where empresa_id is not null;
create unique index perfiles_nombre_plantilla_uq on public.perfiles (nombre) where empresa_id is null;
create unique index perfiles_codigo_empresa_uq on public.perfiles (empresa_id, codigo) where empresa_id is not null and codigo is not null;
create unique index perfiles_codigo_plantilla_uq on public.perfiles (codigo) where empresa_id is null and codigo is not null;

create table public.perfil_permisos (
  perfil_id       uuid not null references public.perfiles(id) on delete cascade,
  permiso_codigo  text not null references public.permisos(codigo) on update cascade,
  alcance         text check (alcance in ('todas','equipo','propias','ninguna')),
  creado_en       timestamptz not null default now(),
  creado_por      uuid default auth.uid(),
  primary key (perfil_id, permiso_codigo)
);
comment on column public.perfil_permisos.alcance is 'Solo para permisos con alcance (por ejemplo, editar cotizaciones: todas, del equipo o propias). Vacío en los demás.';

create trigger tocar_perfiles before update on public.perfiles
  for each row execute function public.tocar_actualizado();

alter table public.perfiles        enable row level security;
alter table public.perfil_permisos enable row level security;
