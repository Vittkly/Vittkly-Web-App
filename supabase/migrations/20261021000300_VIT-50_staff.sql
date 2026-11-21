-- =====================================================================
-- Migración 3 · Staff de Vittkly
-- Historia: VIT-50
-- =====================================================================

create table public.staff_plataforma (
  usuario_id       uuid primary key references public.usuarios(id) on delete cascade,
  rol              text not null check (rol in ('admin','soporte')),
  activo           boolean not null default true,
  creado_en        timestamptz not null default now(),
  creado_por       uuid default auth.uid(),
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid
);
comment on table public.staff_plataforma is 'Equipo Vittkly. Los roles completos llegan con el panel en la Etapa 2.';

create trigger tocar_staff before update on public.staff_plataforma
  for each row execute function public.tocar_actualizado();

-- ¿El usuario actual es del staff? Sin rol = cualquier rol.
create or replace function public.es_staff(p_rol text default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_plataforma s
    where s.usuario_id = auth.uid()
      and s.activo
      and (p_rol is null or s.rol = p_rol)
  );
$$;

alter table public.staff_plataforma enable row level security;
