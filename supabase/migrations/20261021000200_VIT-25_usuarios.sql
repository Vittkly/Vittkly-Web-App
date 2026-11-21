-- =====================================================================
-- Migración 2 · Personas: usuarios, una fila por persona
-- Historia: VIT-25
-- =====================================================================

create table public.usuarios (
  id                  uuid primary key references auth.users(id) on delete cascade,
  nombre              text not null default '',
  correo              text,
  celular             text check (celular is null or celular ~ '^\+[1-9][0-9]{7,14}$'),
  avatar_ruta         text,
  ultima_empresa_id   uuid,              -- su llave foránea se agrega en la migración 5
  ultimo_ingreso_en   timestamptz,
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now(),
  actualizado_por     uuid
);
comment on table public.usuarios is 'Una fila por persona, aunque trabaje en varias empresas. El id es el mismo de auth.users.';
comment on column public.usuarios.celular is 'Formato internacional: +51987654321.';

create trigger tocar_usuarios before update on public.usuarios
  for each row execute function public.tocar_actualizado();

-- Al crearse una cuenta en Supabase Auth (correo, Google, Microsoft o WhatsApp),
-- se crea su fila en usuarios.
create or replace function public.crear_usuario_desde_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, nombre, correo, celular)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    case when new.phone is null or new.phone = '' then null
         when left(new.phone, 1) = '+' then new.phone
         else '+' || new.phone end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger al_crear_usuario_auth
  after insert on auth.users
  for each row execute function public.crear_usuario_desde_auth();

alter table public.usuarios enable row level security;
