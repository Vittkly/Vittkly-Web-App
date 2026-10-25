-- =====================================================================
-- Migración 7 · Membresías y funciones de seguridad
-- Historias: VIT-25 (membresias) y VIT-26 (funciones)
-- =====================================================================

create table public.membresias (
  id               uuid primary key default gen_random_uuid(),
  empresa_id       uuid not null references public.empresas(id) on delete cascade,
  usuario_id       uuid not null references public.usuarios(id) on delete cascade,
  perfil_id        uuid not null references public.perfiles(id),
  es_propietario   boolean not null default false,
  acceso_web       boolean not null default true,
  activo           boolean not null default true,
  invitado_por     uuid references public.usuarios(id),
  creado_en        timestamptz not null default now(),
  creado_por       uuid default auth.uid(),
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid,
  constraint membresia_unica unique (empresa_id, usuario_id)
);
create index membresias_usuario_idx on public.membresias (usuario_id) where activo;

create trigger tocar_membresias before update on public.membresias
  for each row execute function public.tocar_actualizado();

-- El perfil de una membresía debe ser de la misma empresa (no una plantilla ni de otra empresa).
create or replace function public.validar_perfil_membresia()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.perfiles p where p.id = new.perfil_id and p.empresa_id = new.empresa_id) then
    raise exception 'El perfil no pertenece a esta empresa';
  end if;
  return new;
end;
$$;
create trigger validar_perfil before insert or update of perfil_id, empresa_id on public.membresias
  for each row execute function public.validar_perfil_membresia();

-- ---------------------------------------------------------------------
-- Funciones que usa RLS. security definer = leen membresias sin chocar con su propia RLS.
-- ---------------------------------------------------------------------

-- ¿El usuario actual tiene membresía activa en esta empresa?
create or replace function public.es_miembro(p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.membresias m
    where m.empresa_id = p_empresa_id
      and m.usuario_id = auth.uid()
      and m.activo
  );
$$;

-- ¿Su perfil en esta empresa tiene este permiso? (un alcance «ninguna» cuenta como no)
create or replace function public.tiene_permiso(p_empresa_id uuid, p_permiso text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.membresias m
    join public.perfil_permisos pp on pp.perfil_id = m.perfil_id
    where m.empresa_id = p_empresa_id
      and m.usuario_id = auth.uid()
      and m.activo
      and pp.permiso_codigo = p_permiso
      and coalesce(pp.alcance, 'todas') <> 'ninguna'
  );
$$;

-- ¿Con qué alcance tiene este permiso? (todas, equipo, propias, ninguna; vacío = no lo tiene)
create or replace function public.alcance_permiso(p_empresa_id uuid, p_permiso text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(pp.alcance, 'todas')
  from public.membresias m
  join public.perfil_permisos pp on pp.perfil_id = m.perfil_id
  where m.empresa_id = p_empresa_id
    and m.usuario_id = auth.uid()
    and m.activo
    and pp.permiso_codigo = p_permiso
  limit 1;
$$;

-- ¿El plan de la cuenta de esta empresa incluye este módulo, y la suscripción no está suspendida ni cancelada?
create or replace function public.tiene_modulo(p_empresa_id uuid, p_modulo text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.empresas e
    join public.suscripciones s on s.cuenta_id = e.cuenta_id
    join public.plan_modulos pm on pm.plan_id = s.plan_id
    where e.id = p_empresa_id
      and pm.modulo_codigo = p_modulo
      and s.estado not in ('suspendida','cancelada')
  );
$$;

-- Nombre y foto de las personas de una empresa (sin correo ni celular), para quien es miembro.
create or replace function public.directorio_empresa(p_empresa_id uuid)
returns table (usuario_id uuid, nombre text, avatar_ruta text, perfil text, activo boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.nombre, u.avatar_ruta, p.nombre, m.activo
  from public.membresias m
  join public.usuarios u on u.id = m.usuario_id
  join public.perfiles p on p.id = m.perfil_id
  where m.empresa_id = p_empresa_id
    and public.es_miembro(p_empresa_id);
$$;

alter table public.membresias enable row level security;
