-- =====================================================================
-- Migración 11 · Nuevo acceso y Accesos a empresa (13 nov 2026)
-- Historia: VIT-60 · Usuarios, Membresías, Invitaciones, Perfiles,
-- Verificaciones, Solicitudes de salida y Casos de soporte
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabla public.usuarios: columnas de identidad y verificación
-- ---------------------------------------------------------------------
alter table public.usuarios
  add column if not exists tipo_documento text check (tipo_documento in ('DNI', 'carné de extranjería', 'pasaporte')),
  add column if not exists numero_documento text,
  add column if not exists nombres text,
  add column if not exists apellidos text,
  add column if not exists correo_verificado_en timestamptz,
  add column if not exists celular_verificado_en timestamptz,
  add column if not exists prueba_usada_en timestamptz;

create unique index if not exists usuarios_documento_uq
  on public.usuarios (tipo_documento, numero_documento)
  where tipo_documento is not null and numero_documento is not null;

-- Sincronizar nombre completo a partir de nombres y apellidos para retrocompatibilidad
create or replace function public.sincronizar_nombre_usuario()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.nombres is not null or new.apellidos is not null) then
    new.nombre := btrim(concat_ws(' ', nullif(btrim(new.nombres), ''), nullif(btrim(new.apellidos), '')));
  elsif coalesce(btrim(new.nombre), '') <> '' and new.nombres is null then
    new.nombres := new.nombre;
  end if;
  return new;
end;
$$;

drop trigger if exists sincronizar_nombre_usuario_trg on public.usuarios;
create trigger sincronizar_nombre_usuario_trg
  before insert or update on public.usuarios
  for each row execute function public.sincronizar_nombre_usuario();

alter table public.usuarios force row level security;

-- ---------------------------------------------------------------------
-- 2. Tabla public.perfiles: metadatos de recomendación y configuración
-- ---------------------------------------------------------------------
alter table public.perfiles
  add column if not exists recomendado_para text,
  add column if not exists configuracion jsonb not null default '{}'::jsonb;

alter table public.perfiles force row level security;
alter table public.perfil_permisos force row level security;

-- Actualizar copiar_perfiles_base para incluir recomendado_para y configuracion
create or replace function public.copiar_perfiles_base(p_empresa_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  pl record;
  nuevo uuid;
begin
  for pl in select * from public.perfiles where empresa_id is null order by nombre loop
    if not exists (
      select 1 from public.perfiles p
      where p.empresa_id = p_empresa_id
        and (p.codigo = pl.codigo or p.nombre = pl.nombre)
    ) then
      insert into public.perfiles (empresa_id, codigo, nombre, descripcion, recomendado_para, configuracion, es_base)
      values (p_empresa_id, pl.codigo, pl.nombre, pl.descripcion, pl.recomendado_para, coalesce(pl.configuracion, '{}'::jsonb), true)
      returning id into nuevo;

      insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
      select nuevo, pp.permiso_codigo, pp.alcance
      from public.perfil_permisos pp where pp.perfil_id = pl.id
      on conflict do nothing;
    end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Tabla public.invitaciones: nuevo modelo sin VK-XXXX-XXXX
-- ---------------------------------------------------------------------
alter table public.invitaciones
  add column if not exists tipo text not null default 'nueva_cuenta' check (tipo in ('nueva_cuenta', 'cuenta_existente')),
  add column if not exists usuario_id uuid references public.usuarios(id) on delete set null,
  add column if not exists nombres text,
  add column if not exists apellidos text,
  add column if not exists tipo_documento text check (tipo_documento in ('DNI', 'carné de extranjería', 'pasaporte')),
  add column if not exists numero_documento text,
  add column if not exists cargo text,
  add column if not exists acceso_app boolean not null default true,
  add column if not exists token_hash text,
  add column if not exists motivo_rechazo text,
  add column if not exists respondida_en timestamptz;

-- Sincronizar token_hash con codigo_hash para compatibilidad con filas previas
update public.invitaciones
   set token_hash = codigo_hash
 where token_hash is null and codigo_hash is not null;

-- Ampliar constraint de estado en invitaciones ('pendiente','aceptada','rechazada','vencida','anulada','usada')
alter table public.invitaciones drop constraint if exists invitaciones_estado_check;
alter table public.invitaciones
  add constraint invitaciones_estado_check
  check (estado in ('pendiente', 'aceptada', 'rechazada', 'vencida', 'anulada', 'usada'));

alter table public.invitaciones force row level security;

grant insert on public.invitaciones to authenticated;
drop policy if exists "crear invitaciones" on public.invitaciones;
create policy "crear invitaciones"
  on public.invitaciones for insert to authenticated
  with check (public.tiene_permiso(empresa_id, 'usuarios.editar'));

drop policy if exists "anular invitaciones" on public.invitaciones;
create policy "anular invitaciones"
  on public.invitaciones for update to authenticated
  using (public.tiene_permiso(empresa_id, 'usuarios.editar'))
  with check (public.tiene_permiso(empresa_id, 'usuarios.editar'));

-- ---------------------------------------------------------------------
-- 4. Tabla public.membresias: estado ('activa','desactivada','desvinculada'),
--    acceso_app, cargo, invitacion_id y desvinculada_en
-- ---------------------------------------------------------------------
alter table public.membresias
  add column if not exists estado text not null default 'activa' check (estado in ('activa', 'desactivada', 'desvinculada')),
  add column if not exists acceso_app boolean not null default true,
  add column if not exists cargo text,
  add column if not exists invitacion_id uuid references public.invitaciones(id) on delete set null,
  add column if not exists desvinculada_en timestamptz;

update public.membresias
   set estado = case when activo then 'activa' else 'desactivada' end
 where estado is null;

create or replace function public.sincronizar_estado_membresia()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.estado is distinct from old.estado then
      new.activo := (new.estado = 'activa');
      if new.estado = 'desvinculada' and new.desvinculada_en is null then
        new.desvinculada_en := now();
      elsif new.estado <> 'desvinculada' then
        new.desvinculada_en := null;
      end if;
    elsif new.activo is distinct from old.activo then
      new.estado := case when new.activo then 'activa' else 'desactivada' end;
    end if;
  else
    new.activo := (new.estado = 'activa');
    if new.estado = 'desvinculada' and new.desvinculada_en is null then
      new.desvinculada_en := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists sincronizar_estado_membresia_trg on public.membresias;
create trigger sincronizar_estado_membresia_trg
  before insert or update on public.membresias
  for each row execute function public.sincronizar_estado_membresia();

-- Proteger al propietario y al último administrador ante desactivación o desvinculación
create or replace function public.proteger_ultimo_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quedan integer;
begin
  if old.es_propietario and (new.estado <> 'activa' or not new.activo) then
    raise exception 'No se puede suspender ni desvincular al propietario de la cuenta';
  end if;

  select count(*) into quedan
  from public.membresias m
  join public.perfil_permisos pp on pp.perfil_id = m.perfil_id and pp.permiso_codigo = 'usuarios.editar'
  where m.empresa_id = old.empresa_id
    and m.activo
    and m.estado = 'activa'
    and m.id <> old.id;

  if quedan = 0 and (
       not new.activo
       or new.estado <> 'activa'
       or not exists (select 1 from public.perfil_permisos pp
                      where pp.perfil_id = new.perfil_id and pp.permiso_codigo = 'usuarios.editar')
     ) then
    raise exception 'La empresa no puede quedarse sin un administrador';
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_ultimo_admin on public.membresias;
create trigger proteger_ultimo_admin
  before update of activo, estado, perfil_id on public.membresias
  for each row execute function public.proteger_ultimo_admin();

alter table public.membresias force row level security;

-- Políticas RLS adicionales en public.usuarios (dependen de membresias.estado)
drop policy if exists "admin empresa ve usuarios de su empresa" on public.usuarios;
create policy "admin empresa ve usuarios de su empresa"
  on public.usuarios for select to authenticated
  using (
    exists (
      select 1 from public.membresias m
      where m.usuario_id = usuarios.id
        and public.tiene_permiso(m.empresa_id, 'usuarios.ver')
    )
  );

drop policy if exists "admin empresa edita datos basicos de usuarios" on public.usuarios;
create policy "admin empresa edita datos basicos de usuarios"
  on public.usuarios for update to authenticated
  using (
    exists (
      select 1 from public.membresias m
      where m.usuario_id = usuarios.id
        and m.estado <> 'desvinculada'
        and public.tiene_permiso(m.empresa_id, 'usuarios.editar')
    )
  )
  with check (
    exists (
      select 1 from public.membresias m
      where m.usuario_id = usuarios.id
        and m.estado <> 'desvinculada'
        and public.tiene_permiso(m.empresa_id, 'usuarios.editar')
    )
  );

-- ---------------------------------------------------------------------
-- 5. Nuevas tablas oficiales: verificaciones, solicitudes_salida, casos_soporte
-- ---------------------------------------------------------------------
create table if not exists public.verificaciones (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references public.usuarios(id) on delete cascade,
  canal           text not null check (canal in ('correo', 'celular', 'whatsapp')),
  destino         text not null,
  codigo_hash     text not null,
  intentos        integer not null default 0,
  vence_en        timestamptz not null default now() + interval '10 minutes',
  verificado_en   timestamptz,
  creado_en       timestamptz not null default now()
);

alter table public.verificaciones enable row level security;
alter table public.verificaciones force row level security;

grant select, insert, update on public.verificaciones to authenticated;
drop policy if exists "ver mis verificaciones" on public.verificaciones;
create policy "ver mis verificaciones"
  on public.verificaciones for select to authenticated
  using (usuario_id = auth.uid());

drop policy if exists "crear mis verificaciones" on public.verificaciones;
create policy "crear mis verificaciones"
  on public.verificaciones for insert to authenticated
  with check (usuario_id = auth.uid());

drop policy if exists "actualizar mis verificaciones" on public.verificaciones;
create policy "actualizar mis verificaciones"
  on public.verificaciones for update to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create table if not exists public.solicitudes_salida (
  id                    uuid primary key default gen_random_uuid(),
  empresa_id            uuid not null references public.empresas(id) on delete cascade,
  membresia_id          uuid not null references public.membresias(id) on delete cascade,
  usuario_id            uuid not null references public.usuarios(id) on delete cascade,
  motivo                text,
  estado                text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  comentario_resolucion text,
  servicios_futuros     integer not null default 0,
  resuelto_por          uuid references public.usuarios(id),
  resuelto_en           timestamptz,
  creado_en             timestamptz not null default now(),
  actualizado_en        timestamptz not null default now(),
  actualizado_por       uuid
);

create index if not exists solicitudes_salida_empresa_idx
  on public.solicitudes_salida (empresa_id, estado);

drop trigger if exists tocar_solicitudes_salida on public.solicitudes_salida;
create trigger tocar_solicitudes_salida
  before update on public.solicitudes_salida
  for each row execute function public.tocar_actualizado();

alter table public.solicitudes_salida enable row level security;
alter table public.solicitudes_salida force row level security;

grant select, insert, update on public.solicitudes_salida to authenticated;

drop policy if exists "ver solicitudes de salida" on public.solicitudes_salida;
create policy "ver solicitudes de salida"
  on public.solicitudes_salida for select to authenticated
  using (
    usuario_id = auth.uid()
    or public.tiene_permiso(empresa_id, 'usuarios.ver')
  );

drop policy if exists "crear solicitud de salida propia" on public.solicitudes_salida;
create policy "crear solicitud de salida propia"
  on public.solicitudes_salida for insert to authenticated
  with check (
    usuario_id = auth.uid()
    and public.es_miembro(empresa_id)
  );

drop policy if exists "resolver solicitudes de salida" on public.solicitudes_salida;
create policy "resolver solicitudes de salida"
  on public.solicitudes_salida for update to authenticated
  using (public.tiene_permiso(empresa_id, 'usuarios.editar'))
  with check (public.tiene_permiso(empresa_id, 'usuarios.editar'));

create table if not exists public.casos_soporte (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid references public.empresas(id) on delete set null,
  usuario_id      uuid references public.usuarios(id) on delete set null,
  tipo_documento  text,
  numero_documento text,
  correo_contacto text,
  celular_contacto text,
  motivo          text not null,
  estado          text not null default 'abierto' check (estado in ('abierto', 'en_revision', 'resuelto', 'cerrado')),
  resolucion      text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid
);

drop trigger if exists tocar_casos_soporte on public.casos_soporte;
create trigger tocar_casos_soporte
  before update on public.casos_soporte
  for each row execute function public.tocar_actualizado();

alter table public.casos_soporte enable row level security;
alter table public.casos_soporte force row level security;

grant select, insert, update on public.casos_soporte to authenticated;

drop policy if exists "ver casos soporte" on public.casos_soporte;
create policy "ver casos soporte"
  on public.casos_soporte for select to authenticated
  using (
    usuario_id = auth.uid()
    or (empresa_id is not null and public.tiene_permiso(empresa_id, 'usuarios.ver'))
    or public.es_staff()
  );

drop policy if exists "crear casos soporte" on public.casos_soporte;
create policy "crear casos soporte"
  on public.casos_soporte for insert to authenticated
  with check (usuario_id = auth.uid() or public.es_staff());

drop policy if exists "actualizar casos soporte" on public.casos_soporte;
create policy "actualizar casos soporte"
  on public.casos_soporte for update to authenticated
  using (public.es_staff())
  with check (public.es_staff());

-- Conectar trigger auditar() a las nuevas tablas
drop trigger if exists auditar on public.solicitudes_salida;
create trigger auditar
  after insert or update or delete on public.solicitudes_salida
  for each row execute function public.auditar();

drop trigger if exists auditar on public.casos_soporte;
create trigger auditar
  after insert or update or delete on public.casos_soporte
  for each row execute function public.auditar();

-- ---------------------------------------------------------------------
-- 6. Funciones RPC de negocio: buscar_persona (enmascarada) y gestión de invitaciones
-- ---------------------------------------------------------------------
create or replace function public.enmascarar_palabra(p_texto text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_texto is null or btrim(p_texto) = '' then ''
    when char_length(btrim(p_texto)) <= 1 then btrim(p_texto) || '***'
    else substr(btrim(p_texto), 1, 1) || '***'
  end;
$$;

create or replace function public.enmascarar_correo(p_correo text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_correo is null or position('@' in p_correo) = 0 then '***'
    else substr(split_part(p_correo, '@', 1), 1, least(3, char_length(split_part(p_correo, '@', 1))))
         || '***@' || split_part(p_correo, '@', 2)
  end;
$$;

create or replace function public.buscar_persona(
  p_empresa_id uuid,
  p_tipo_documento text,
  p_numero_documento text
)
returns table (
  encontrado boolean,
  usuario_id uuid,
  nombre_mascara text,
  correo_mascara text,
  celular_mascara text,
  ya_es_miembro boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  u record;
  v_miembro boolean := false;
begin
  if not public.tiene_permiso(p_empresa_id, 'usuarios.editar') then
    raise exception 'No tienes permiso para buscar e invitar personas en esta empresa';
  end if;

  select id, nombres, apellidos, nombre, correo, celular
    into u
    from public.usuarios
   where tipo_documento = p_tipo_documento
     and numero_documento = btrim(p_numero_documento)
   limit 1;

  if u.id is null then
    return query select false, null::uuid, null::text, null::text, null::text, false;
    return;
  end if;

  select exists (
    select 1 from public.membresias m
    where m.empresa_id = p_empresa_id
      and m.usuario_id = u.id
      and m.estado <> 'desvinculada'
  ) into v_miembro;

  return query select
    true,
    u.id,
    btrim(
      public.enmascarar_palabra(coalesce(u.nombres, split_part(u.nombre, ' ', 1)))
      || ' ' ||
      public.enmascarar_palabra(coalesce(u.apellidos, split_part(u.nombre, ' ', 2)))
    ),
    public.enmascarar_correo(u.correo),
    case
      when u.celular is null or char_length(u.celular) < 4 then '***'
      else '***' || right(u.celular, 3)
    end,
    v_miembro;
end;
$$;

grant execute on function public.buscar_persona(uuid, text, text) to authenticated;
