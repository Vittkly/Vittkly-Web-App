-- =====================================================================
-- Migración 1 · Plataforma: planes, módulos, plan_modulos y permisos
-- Historia: VIT-23 · Documento: «Vittkly: modelo de datos», Etapa 0
-- =====================================================================

-- Función común: llena actualizado_en y actualizado_por en cada cambio.
create or replace function public.tocar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  new.actualizado_por := auth.uid();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- planes: los planes que vende Vittkly (Inicia, Crece, Empresa)
-- ---------------------------------------------------------------------
create table public.planes (
  id                       uuid primary key default gen_random_uuid(),
  codigo                   text not null unique,
  nombre                   text not null,
  precio_mensual_centimos  bigint check (precio_mensual_centimos >= 0),
  precio_anual_centimos    bigint check (precio_anual_centimos >= 0),
  moneda                   text not null default 'PEN',
  usuarios_incluidos       integer not null default 1 check (usuarios_incluidos >= 0),
  orden                    integer not null default 0,
  activo                   boolean not null default true,
  creado_en                timestamptz not null default now(),
  creado_por               uuid default auth.uid(),
  actualizado_en           timestamptz not null default now(),
  actualizado_por          uuid
);
comment on table public.planes is 'Planes que vende Vittkly. Los precios se llenan cuando se definan.';

-- ---------------------------------------------------------------------
-- modulos: los 39 módulos del mapa maestro, como datos
-- ---------------------------------------------------------------------
create table public.modulos (
  codigo           text primary key,
  nombre           text not null,
  grupo            text not null check (grupo in ('sin_grupo','ventas','operacion','finanzas','equipo','crecimiento','reportes','configuracion','plataforma')),
  modelo           text not null check (modelo in ('comun','visita','contrato','publico','crecimiento')),
  etapa            integer not null check (etapa between 0 and 7),
  disponible       boolean not null default false,
  orden            integer not null default 0,
  creado_en        timestamptz not null default now(),
  creado_por       uuid default auth.uid(),
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid
);
comment on column public.modulos.disponible is 'Falso = se muestra como «Pronto» y solo lo ve el administrador.';

-- ---------------------------------------------------------------------
-- plan_modulos: qué módulos trae cada plan
-- ---------------------------------------------------------------------
create table public.plan_modulos (
  plan_id        uuid not null references public.planes(id) on delete cascade,
  modulo_codigo  text not null references public.modulos(codigo) on update cascade,
  creado_en      timestamptz not null default now(),
  creado_por     uuid default auth.uid(),
  primary key (plan_id, modulo_codigo)
);

-- ---------------------------------------------------------------------
-- permisos: catálogo de lo que se puede hacer, por módulo
-- ---------------------------------------------------------------------
create table public.permisos (
  codigo           text primary key,
  modulo_codigo    text not null references public.modulos(codigo) on update cascade,
  descripcion      text not null,
  con_alcance      boolean not null default false,
  creado_en        timestamptz not null default now(),
  creado_por       uuid default auth.uid(),
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid
);
comment on column public.permisos.con_alcance is 'Verdadero si el permiso se da con alcance: todas, equipo, propias o ninguna (como en la Central).';

create trigger tocar_planes   before update on public.planes   for each row execute function public.tocar_actualizado();
create trigger tocar_modulos  before update on public.modulos  for each row execute function public.tocar_actualizado();
create trigger tocar_permisos before update on public.permisos for each row execute function public.tocar_actualizado();

-- RLS activado desde ya: nadie lee ni escribe hasta que la migración 8 dé acceso.
alter table public.planes       enable row level security;
alter table public.modulos      enable row level security;
alter table public.plan_modulos enable row level security;
alter table public.permisos     enable row level security;
