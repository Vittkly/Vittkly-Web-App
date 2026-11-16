-- =====================================================================
-- Migración: 20261115000200_VIT-63_buscar_persona_privacidad.sql
-- Propósito: Privacidad end-to-end para el flujo "+ Agregar persona",
--            normalización canónica de documentos, bloqueo por colisión
--            de identidad y fechas reales de membresía/invitación.
-- =====================================================================

-- 1. Columnas y constraints base (aditivas e idempotentes)
alter table public.membresias
  add column if not exists desde timestamptz;

alter table public.invitaciones
  add column if not exists datos_enmascarados jsonb;

alter table public.invitaciones
  drop constraint if exists invitacion_con_contacto;

alter table public.invitaciones
  add constraint invitacion_con_contacto
  check (usuario_id is not null or correo is not null or celular is not null);

-- 2. Funciones canónicas de normalización y enmascarado (IMMUTABLE)
create or replace function public.normalizar_tipo_documento(p_raw text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_clean text;
begin
  v_clean := lower(btrim(coalesce(p_raw, '')));
  v_clean := translate(v_clean, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU');
  v_clean := regexp_replace(v_clean, '\s+', ' ', 'g');

  if v_clean = 'dni' then
    return 'DNI';
  elsif v_clean in ('ce', 'carne_extranjeria', 'carne de extranjeria', 'carne extranjeria') then
    return 'carné de extranjería';
  elsif v_clean in ('pasaporte', 'passport') then
    return 'pasaporte';
  end if;

  raise exception 'Tipo de documento inválido. Usa DNI, carné de extranjería o pasaporte.';
end;
$$;

create or replace function public.normalizar_numero_documento(
  p_tipo_canonico text,
  p_raw text
)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_clean text;
begin
  v_clean := upper(btrim(coalesce(p_raw, '')));

  if p_tipo_canonico <> 'DNI' then
    v_clean := regexp_replace(v_clean, '\s+', '', 'g');
  end if;

  if p_tipo_canonico = 'DNI' then
    if v_clean !~ '^[0-9]{8}$' then
      raise exception 'El DNI debe tener exactamente 8 dígitos numéricos.';
    end if;
  elsif p_tipo_canonico = 'carné de extranjería' then
    if v_clean !~ '^[A-Z0-9]{9,12}$' then
      raise exception 'El carné de extranjería debe tener entre 9 y 12 caracteres alfanuméricos.';
    end if;
  elsif p_tipo_canonico = 'pasaporte' then
    if v_clean !~ '^[A-Z0-9]{6,16}$' then
      raise exception 'El pasaporte debe tener entre 6 y 16 caracteres alfanuméricos.';
    end if;
  else
    raise exception 'Tipo de documento inválido.';
  end if;

  return v_clean;
end;
$$;

create or replace function public.enmascarar_nombre_identidad(
  p_nombre_completo text,
  p_nombres text default null,
  p_apellidos text default null
)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_joined text;
  v_source text;
  v_result text;
begin
  v_joined := nullif(
    btrim(
      concat_ws(
        ' ',
        nullif(btrim(coalesce(p_nombres, '')), ''),
        nullif(btrim(coalesce(p_apellidos, '')), '')
      )
    ),
    ''
  );
  v_source := coalesce(v_joined, nullif(btrim(coalesce(p_nombre_completo, '')), ''));

  if v_source is null then
    return 'U****';
  end if;

  select string_agg(
           case
             when char_length(w) <= 2 then left(w, 1) || '****'
             else left(w, 2) || '****'
           end,
           ' ' order by idx
         )
    into v_result
    from unnest(regexp_split_to_array(v_source, '\s+')) with ordinality as t(w, idx)
   where w <> '';

  return coalesce(v_result, 'U****');
end;
$$;

create or replace function public.enmascarar_correo_identidad(p_correo text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_clean text := lower(btrim(coalesce(p_correo, '')));
  v_at integer;
  v_local text;
  v_domain text;
begin
  v_at := strpos(v_clean, '@');
  if v_at <= 1 or v_at = char_length(v_clean) then
    return '****';
  end if;

  v_local := left(v_clean, v_at - 1);
  v_domain := substr(v_clean, v_at + 1);

  return (case when char_length(v_local) <= 2 then left(v_local, 1) else left(v_local, 2) end)
    || '****@' || v_domain;
end;
$$;

create or replace function public.enmascarar_documento_identidad(p_numero text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_clean text := upper(btrim(coalesce(p_numero, '')));
  v_len integer := char_length(v_clean);
begin
  if v_len >= 9 then
    return left(v_clean, 3) || '****' || right(v_clean, 2);
  elsif v_len = 8 then
    return left(v_clean, 4) || '**' || right(v_clean, 2);
  elsif v_len >= 6 then
    return left(v_clean, 2) || '**' || right(v_clean, 2);
  elsif v_len >= 3 then
    return left(v_clean, 1) || '****' || right(v_clean, 1);
  end if;
  return '****';
end;
$$;

create or replace function public.enmascarar_celular_identidad(p_celular text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_raw text := btrim(coalesce(p_celular, ''));
  v_digits text := regexp_replace(v_raw, '[^0-9]', '', 'g');
  v_local text := v_digits;
  v_prefix text;
  v_prefixes text[] := array['593', '51', '56', '57', '52', '58', '54', '34', '1'];
begin
  if v_digits = '' then
    return '****';
  end if;

  if v_raw like '+%' then
    foreach v_prefix in array v_prefixes loop
      if v_digits like v_prefix || '%' and char_length(v_digits) - char_length(v_prefix) >= 6 then
        v_local := substr(v_digits, char_length(v_prefix) + 1);
        exit;
      end if;
    end loop;

    if v_local = v_digits and char_length(v_digits) > 9 then
      v_local := right(v_digits, 9);
    end if;
  elsif char_length(v_digits) = 11 and left(v_digits, 2) = '51' then
    v_local := substr(v_digits, 3);
  end if;

  if char_length(v_local) >= 6 then
    return left(v_local, 3) || '****' || right(v_local, 2);
  elsif char_length(v_local) >= 2 then
    return left(v_local, 1) || '****' || right(v_local, 1);
  end if;
  return '****';
end;
$$;

-- 3. Limpieza idempotente previa a los índices únicos parciales y saneamiento PII
update public.invitaciones
   set estado = 'vencida'
 where estado = 'pendiente'
   and vence_en < now();

with ranked_usuario as (
  select id,
         row_number() over (
           partition by empresa_id, usuario_id
           order by creado_en desc, id desc
         ) as rn
    from public.invitaciones
   where estado = 'pendiente'
     and usuario_id is not null
)
update public.invitaciones i
   set estado = 'anulada'
  from ranked_usuario r
 where i.id = r.id
   and r.rn > 1;

with ranked_doc as (
  select id,
         row_number() over (
           partition by empresa_id, tipo_documento, upper(btrim(numero_documento))
           order by creado_en desc, id desc
         ) as rn
    from public.invitaciones
   where estado = 'pendiente'
     and usuario_id is null
     and tipo_documento is not null
     and numero_documento is not null
     and btrim(numero_documento) <> ''
)
update public.invitaciones i
   set estado = 'anulada'
  from ranked_doc r
 where i.id = r.id
   and r.rn > 1;

-- Backfill seguro para invitaciones 'cuenta_existente' pendientes legadas con PII
update public.invitaciones i
   set datos_enmascarados = coalesce(
         i.datos_enmascarados,
         jsonb_build_object(
           'nombre', public.enmascarar_nombre_identidad(u.nombre, u.nombres, u.apellidos),
           'correo', public.enmascarar_correo_identidad(coalesce(u.correo, i.correo)),
           'documento', public.enmascarar_documento_identidad(coalesce(u.numero_documento, i.numero_documento)),
           'celular', public.enmascarar_celular_identidad(coalesce(u.celular, i.celular)),
           'tipo_documento', coalesce(u.tipo_documento, i.tipo_documento)
         )
       ),
       nombres = public.enmascarar_nombre_identidad(u.nombre, u.nombres, u.apellidos),
       apellidos = null,
       correo = null,
       celular = null,
       numero_documento = null
  from public.usuarios u
 where i.tipo = 'cuenta_existente'
   and i.usuario_id = u.id
   and i.estado = 'pendiente'
   and (i.correo is not null or i.celular is not null or i.numero_documento is not null or i.apellidos is not null);

drop index if exists public.invitaciones_pendiente_usuario_uq;
create unique index invitaciones_pendiente_usuario_uq
  on public.invitaciones (empresa_id, usuario_id)
  where estado = 'pendiente' and usuario_id is not null;

drop index if exists public.invitaciones_pendiente_doc_uq;
create unique index invitaciones_pendiente_doc_uq
  on public.invitaciones (empresa_id, tipo_documento, upper(btrim(numero_documento)))
  where estado = 'pendiente'
    and usuario_id is null
    and tipo_documento is not null
    and numero_documento is not null;

-- 4. Helper de autorización y políticas RLS endurecidas
create or replace function public.puede_gestionar_personas_empresa(p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.membresias m
      join public.perfiles p on p.id = m.perfil_id
     where m.empresa_id = p_empresa_id
       and m.usuario_id = auth.uid()
       and m.activo = true
       and m.estado = 'activa'
       and (
         m.es_propietario = true
         or lower(coalesce(p.codigo, '')) in ('admin', 'administrador')
         or public.tiene_permiso(p_empresa_id, 'usuarios.editar')
       )
  );
$$;

revoke all on function public.puede_gestionar_personas_empresa(uuid) from public, anon;
grant execute on function public.puede_gestionar_personas_empresa(uuid) to authenticated, service_role;

drop policy if exists "admin empresa ve usuarios de su empresa" on public.usuarios;
create policy "admin empresa ve usuarios de su empresa"
  on public.usuarios
  for select
  to authenticated
  using (
    exists (
      select 1
        from public.membresias m_target
        join public.membresias m_actor
          on m_actor.empresa_id = m_target.empresa_id
       where m_target.usuario_id = public.usuarios.id
         and m_target.estado in ('activa', 'desactivada')
         and m_actor.usuario_id = auth.uid()
         and m_actor.activo = true
         and m_actor.estado = 'activa'
         and (
           public.tiene_permiso(m_actor.empresa_id, 'usuarios.ver')
           or public.puede_gestionar_personas_empresa(m_actor.empresa_id)
         )
    )
  );

drop policy if exists "ver invitaciones" on public.invitaciones;
create policy "ver invitaciones"
  on public.invitaciones
  for select
  to authenticated
  using (
    public.tiene_permiso(empresa_id, 'usuarios.ver')
    or public.puede_gestionar_personas_empresa(empresa_id)
  );

drop policy if exists "crear invitaciones" on public.invitaciones;
create policy "crear invitaciones"
  on public.invitaciones
  for insert
  to authenticated
  with check (public.puede_gestionar_personas_empresa(empresa_id));

drop policy if exists "anular invitaciones" on public.invitaciones;
create policy "anular invitaciones"
  on public.invitaciones
  for update
  to authenticated
  using (public.puede_gestionar_personas_empresa(empresa_id))
  with check (public.puede_gestionar_personas_empresa(empresa_id));

-- Eliminar el RPC legado menos estricto para evitar bypasses
revoke all on function public.buscar_persona(uuid, text, text) from public, anon, authenticated;
drop function if exists public.buscar_persona(uuid, text, text);

-- 5. RPC buscar_persona_por_documento (4 estados, cero PII al navegador)
create or replace function public.buscar_persona_por_documento(
  p_empresa_id uuid,
  p_tipo_documento text,
  p_numero_documento text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tipo text;
  v_numero text;
  v_usuario record;
  v_membresia record;
  v_inv record;
  v_desde timestamptz;
begin
  if auth.role() <> 'service_role' and not public.puede_gestionar_personas_empresa(p_empresa_id) then
    raise exception 'No tienes permisos para buscar personas en esta empresa';
  end if;

  v_tipo := public.normalizar_tipo_documento(p_tipo_documento);
  v_numero := public.normalizar_numero_documento(v_tipo, p_numero_documento);

  select u.id,
         u.nombre,
         u.nombres,
         u.apellidos,
         u.correo,
         u.celular,
         u.tipo_documento,
         u.numero_documento
    into v_usuario
    from public.usuarios u
   where u.tipo_documento = v_tipo
     and upper(btrim(coalesce(u.numero_documento, ''))) = v_numero
   limit 1;

  if v_usuario.id is not null then
    -- 1) Verificar si ya es miembro (activa o desactivada)
    select m.id,
           m.estado,
           coalesce(m.desde, m.creado_en) as registrado_en,
           p.nombre as perfil_nombre
      into v_membresia
      from public.membresias m
      join public.perfiles p on p.id = m.perfil_id
     where m.empresa_id = p_empresa_id
       and m.usuario_id = v_usuario.id
       and m.estado in ('activa', 'desactivada')
     limit 1;

    if v_membresia.id is not null then
      v_desde := coalesce(v_membresia.registrado_en, now());
      return jsonb_build_object(
        'estado', 'ya_es_miembro',
        'nombre_enmascarado', public.enmascarar_nombre_identidad(v_usuario.nombre, v_usuario.nombres, v_usuario.apellidos),
        'perfil_nombre', v_membresia.perfil_nombre,
        'estado_membresia', v_membresia.estado,
        'registrado_en', v_desde,
        'dias_desde_registro', greatest(0, floor(extract(epoch from (now() - v_desde)) / 86400)::int)
      );
    end if;

    -- 2) Verificar si tiene invitación pendiente vigente en la empresa
    select i.id,
           i.creado_en,
           i.vence_en,
           i.datos_enmascarados,
           p.nombre as perfil_nombre
      into v_inv
      from public.invitaciones i
      join public.perfiles p on p.id = i.perfil_id
     where i.empresa_id = p_empresa_id
       and i.estado = 'pendiente'
       and i.vence_en >= now()
       and (
         i.usuario_id = v_usuario.id
         or (
           i.tipo_documento = v_tipo
           and upper(btrim(coalesce(i.numero_documento, ''))) = v_numero
         )
       )
     order by i.creado_en desc
     limit 1;

    if v_inv.id is not null then
      return jsonb_build_object(
        'estado', 'invitacion_pendiente',
        'invitacion_id', v_inv.id,
        'nombre_enmascarado', coalesce(
          v_inv.datos_enmascarados ->> 'nombre',
          public.enmascarar_nombre_identidad(v_usuario.nombre, v_usuario.nombres, v_usuario.apellidos)
        ),
        'perfil_nombre', v_inv.perfil_nombre,
        'enviada_en', v_inv.creado_en,
        'vence_en', v_inv.vence_en,
        'horas_desde_envio', greatest(0, floor(extract(epoch from (now() - v_inv.creado_en)) / 3600)::int),
        'dias_desde_envio', greatest(0, floor(extract(epoch from (now() - v_inv.creado_en)) / 86400)::int)
      );
    end if;

    -- 3) Cuenta existente (solo campos enmascarados, sin PII ni UUID interno)
    return jsonb_build_object(
      'estado', 'cuenta_existente',
      'tipo_documento', v_tipo,
      'nombre_enmascarado', public.enmascarar_nombre_identidad(v_usuario.nombre, v_usuario.nombres, v_usuario.apellidos),
      'correo_enmascarado', public.enmascarar_correo_identidad(v_usuario.correo),
      'documento_enmascarado', public.enmascarar_documento_identidad(v_numero),
      'celular_enmascarado', public.enmascarar_celular_identidad(v_usuario.celular)
    );
  end if;

  -- Sin cuenta global aún: revisar si existe invitación pendiente vigente por documento
  select i.id,
         i.creado_en,
         i.vence_en,
         i.nombres,
         i.apellidos,
         i.datos_enmascarados,
         p.nombre as perfil_nombre
    into v_inv
    from public.invitaciones i
    join public.perfiles p on p.id = i.perfil_id
   where i.empresa_id = p_empresa_id
     and i.estado = 'pendiente'
     and i.vence_en >= now()
     and i.tipo_documento = v_tipo
     and upper(btrim(coalesce(i.numero_documento, ''))) = v_numero
   order by i.creado_en desc
   limit 1;

  if v_inv.id is not null then
    return jsonb_build_object(
      'estado', 'invitacion_pendiente',
      'invitacion_id', v_inv.id,
      'nombre_enmascarado', coalesce(
        v_inv.datos_enmascarados ->> 'nombre',
        public.enmascarar_nombre_identidad(null, v_inv.nombres, v_inv.apellidos)
      ),
      'perfil_nombre', v_inv.perfil_nombre,
      'enviada_en', v_inv.creado_en,
      'vence_en', v_inv.vence_en,
      'horas_desde_envio', greatest(0, floor(extract(epoch from (now() - v_inv.creado_en)) / 3600)::int),
      'dias_desde_envio', greatest(0, floor(extract(epoch from (now() - v_inv.creado_en)) / 86400)::int)
    );
  end if;

  -- 4) Persona nueva en Vittkly
  return jsonb_build_object(
    'estado', 'no_encontrado',
    'tipo_documento', v_tipo,
    'documento_normalizado', v_numero
  );
end;
$$;

revoke all on function public.buscar_persona_por_documento(uuid, text, text) from public, anon;
grant execute on function public.buscar_persona_por_documento(uuid, text, text) to authenticated, service_role;

-- 6. RPC crear_invitacion_empresa (atómica, deriva tipo en servidor y bloquea colisiones)
create or replace function public.crear_invitacion_empresa(
  p_empresa_id uuid,
  p_tipo_documento text,
  p_numero_documento text,
  p_perfil_id uuid,
  p_acceso_web boolean,
  p_acceso_app boolean,
  p_cargo text default null,
  p_nombres text default null,
  p_apellidos text default null,
  p_correo text default null,
  p_celular text default null,
  p_token_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_tipo text;
  v_numero text;
  v_token_hash text := nullif(btrim(coalesce(p_token_hash, '')), '');
  v_cargo text := nullif(btrim(coalesce(p_cargo, '')), '');
  v_perfil_id uuid;
  v_perfil_nombre text;
  v_usuario record;
  v_membresia record;
  v_colision_id uuid;
  v_inv_id uuid;
  v_creado_en timestamptz;
  v_vence_en timestamptz;
  v_mask_nombre text;
  v_mask_correo text;
  v_mask_doc text;
  v_mask_celular text;
  v_datos_enmascarados jsonb;
  v_nombres text;
  v_apellidos text;
  v_correo text;
  v_celular text;
begin
  if auth.role() <> 'service_role' and not public.puede_gestionar_personas_empresa(p_empresa_id) then
    raise exception 'No tienes permisos para invitar personas a esta empresa';
  end if;

  if v_token_hash is null or char_length(v_token_hash) < 32 then
    raise exception 'Token de invitación inválido.';
  end if;

  if not coalesce(p_acceso_web, false) and not coalesce(p_acceso_app, false) then
    raise exception 'Debes habilitar al menos un canal de acceso (web o app).';
  end if;

  select p.id, p.nombre
    into v_perfil_id, v_perfil_nombre
    from public.perfiles p
   where p.id = p_perfil_id
     and p.empresa_id = p_empresa_id
   limit 1;

  if v_perfil_id is null then
    raise exception 'El perfil seleccionado no pertenece a esta empresa.';
  end if;

  v_tipo := public.normalizar_tipo_documento(p_tipo_documento);
  v_numero := public.normalizar_numero_documento(v_tipo, p_numero_documento);

  -- Expirar pendientes vencidas antes de validar unicidad
  update public.invitaciones
     set estado = 'vencida'
   where empresa_id = p_empresa_id
     and estado = 'pendiente'
     and vence_en < now();

  -- Derivar autoritativamente en servidor si el documento pertenece a una cuenta global
  select u.id,
         u.nombre,
         u.nombres,
         u.apellidos,
         lower(btrim(u.correo)) as correo,
         u.celular
    into v_usuario
    from public.usuarios u
   where u.tipo_documento = v_tipo
     and upper(btrim(coalesce(u.numero_documento, ''))) = v_numero
   limit 1;

  if v_usuario.id is not null then
    select m.id, m.estado
      into v_membresia
      from public.membresias m
     where m.empresa_id = p_empresa_id
       and m.usuario_id = v_usuario.id
       and m.estado in ('activa', 'desactivada')
     limit 1;

    if v_membresia.id is not null then
      raise exception 'Esta persona ya pertenece a la empresa (%).', v_membresia.estado;
    end if;

    if exists (
      select 1
        from public.invitaciones i
       where i.empresa_id = p_empresa_id
         and i.estado = 'pendiente'
         and i.vence_en >= now()
         and (
           i.usuario_id = v_usuario.id
           or (
             i.tipo_documento = v_tipo
             and upper(btrim(coalesce(i.numero_documento, ''))) = v_numero
           )
         )
    ) then
      raise exception 'Ya existe una invitación pendiente para esta persona en la empresa.';
    end if;

    v_mask_nombre := public.enmascarar_nombre_identidad(v_usuario.nombre, v_usuario.nombres, v_usuario.apellidos);
    v_mask_correo := public.enmascarar_correo_identidad(v_usuario.correo);
    v_mask_doc := public.enmascarar_documento_identidad(v_numero);
    v_mask_celular := public.enmascarar_celular_identidad(v_usuario.celular);

    v_datos_enmascarados := jsonb_build_object(
      'nombre', v_mask_nombre,
      'correo', v_mask_correo,
      'documento', v_mask_doc,
      'celular', v_mask_celular,
      'tipo_documento', v_tipo
    );

    insert into public.invitaciones (
      empresa_id,
      tipo,
      usuario_id,
      tipo_documento,
      numero_documento,
      nombres,
      apellidos,
      correo,
      celular,
      datos_enmascarados,
      perfil_id,
      cargo,
      acceso_web,
      acceso_app,
      codigo_hash,
      token_hash,
      estado,
      creado_por
    )
    values (
      p_empresa_id,
      'cuenta_existente',
      v_usuario.id,
      v_tipo,
      null,
      v_mask_nombre,
      null,
      null,
      null,
      v_datos_enmascarados,
      v_perfil_id,
      v_cargo,
      coalesce(p_acceso_web, false),
      coalesce(p_acceso_app, true),
      v_token_hash,
      v_token_hash,
      'pendiente',
      v_actor_id
    )
    returning id, creado_en, vence_en
      into v_inv_id, v_creado_en, v_vence_en;

    return jsonb_build_object(
      'invitacion_id', v_inv_id,
      'tipo', 'cuenta_existente',
      'perfil_id', v_perfil_id,
      'perfil_nombre', v_perfil_nombre,
      'cargo', v_cargo,
      'acceso_web', coalesce(p_acceso_web, false),
      'acceso_app', coalesce(p_acceso_app, true),
      'creado_en', v_creado_en,
      'vence_en', v_vence_en,
      'nombre_enmascarado', v_mask_nombre,
      'correo_enmascarado', v_mask_correo,
      'documento_enmascarado', v_mask_doc,
      'celular_enmascarado', v_mask_celular
    );
  end if;

  -- Flujo nueva_cuenta: validación estricta + bloqueo por colisión con cualquier usuario
  v_nombres := nullif(btrim(coalesce(p_nombres, '')), '');
  v_apellidos := nullif(btrim(coalesce(p_apellidos, '')), '');
  v_correo := nullif(lower(btrim(coalesce(p_correo, ''))), '');
  v_celular := nullif(btrim(coalesce(p_celular, '')), '');

  if v_nombres is null or char_length(v_nombres) < 2 then
    raise exception 'Los nombres son obligatorios (mínimo 2 caracteres).';
  end if;

  if v_apellidos is null or char_length(v_apellidos) < 2 then
    raise exception 'Los apellidos son obligatorios (mínimo 2 caracteres).';
  end if;

  if v_correo is null or v_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'El correo electrónico es obligatorio y debe tener un formato válido.';
  end if;

  if v_celular is null or v_celular !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'El número de celular es obligatorio en formato internacional E.164 (ej. +51999888777).';
  end if;

  if v_celular like '+51%' and v_celular !~ '^\+519[0-9]{8}$' then
    raise exception 'El celular en Perú (+51) debe iniciar en 9 y tener 9 dígitos.';
  end if;

  select u.id
    into v_colision_id
    from public.usuarios u
   where lower(btrim(coalesce(u.correo, ''))) = v_correo
      or (u.celular is not null and btrim(u.celular) = v_celular)
   limit 1;

  if v_colision_id is not null then
    raise exception 'El correo electrónico o número de celular ingresado ya está asociado a otra cuenta en Vittkly. Verifica el documento de identidad de la persona.'
      using errcode = '23505';
  end if;

  if exists (
    select 1
      from public.invitaciones i
     where i.empresa_id = p_empresa_id
       and i.estado = 'pendiente'
       and i.vence_en >= now()
       and (
         (
           i.tipo_documento = v_tipo
           and upper(btrim(coalesce(i.numero_documento, ''))) = v_numero
         )
         or (i.correo is not null and lower(btrim(i.correo)) = v_correo)
         or (i.celular is not null and btrim(i.celular) = v_celular)
       )
  ) then
    raise exception 'Ya existe una invitación pendiente en esta empresa con ese documento, correo o celular.';
  end if;

  v_mask_nombre := public.enmascarar_nombre_identidad(null, v_nombres, v_apellidos);
  v_mask_correo := public.enmascarar_correo_identidad(v_correo);
  v_mask_doc := public.enmascarar_documento_identidad(v_numero);
  v_mask_celular := public.enmascarar_celular_identidad(v_celular);

  v_datos_enmascarados := jsonb_build_object(
    'nombre', v_mask_nombre,
    'correo', v_mask_correo,
    'documento', v_mask_doc,
    'celular', v_mask_celular,
    'tipo_documento', v_tipo
  );

  insert into public.invitaciones (
    empresa_id,
    tipo,
    usuario_id,
    tipo_documento,
    numero_documento,
    nombres,
    apellidos,
    correo,
    celular,
    datos_enmascarados,
    perfil_id,
    cargo,
    acceso_web,
    acceso_app,
    codigo_hash,
    token_hash,
    estado,
    creado_por
  )
  values (
    p_empresa_id,
    'nueva_cuenta',
    null,
    v_tipo,
    v_numero,
    v_nombres,
    v_apellidos,
    v_correo,
    v_celular,
    v_datos_enmascarados,
    v_perfil_id,
    v_cargo,
    coalesce(p_acceso_web, false),
    coalesce(p_acceso_app, true),
    v_token_hash,
    v_token_hash,
    'pendiente',
    v_actor_id
  )
  returning id, creado_en, vence_en
    into v_inv_id, v_creado_en, v_vence_en;

  return jsonb_build_object(
    'invitacion_id', v_inv_id,
    'tipo', 'nueva_cuenta',
    'perfil_id', v_perfil_id,
    'perfil_nombre', v_perfil_nombre,
    'cargo', v_cargo,
    'acceso_web', coalesce(p_acceso_web, false),
    'acceso_app', coalesce(p_acceso_app, true),
    'creado_en', v_creado_en,
    'vence_en', v_vence_en,
    'nombre_completo', trim(v_nombres || ' ' || v_apellidos),
    'correo', v_correo,
    'celular', v_celular,
    'documento_enmascarado', v_mask_doc
  );
end;
$$;

revoke all on function public.crear_invitacion_empresa(
  uuid, text, text, uuid, boolean, boolean, text, text, text, text, text, text
) from public, anon;

grant execute on function public.crear_invitacion_empresa(
  uuid, text, text, uuid, boolean, boolean, text, text, text, text, text, text
) to authenticated, service_role;

-- 7. RPC reenviar_invitacion_empresa (atómica, preserva privacidad en cuenta_existente)
create or replace function public.reenviar_invitacion_empresa(
  p_invitacion_id uuid,
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_token_hash text := nullif(btrim(coalesce(p_token_hash, '')), '');
  v_old public.invitaciones;
  v_perfil_nombre text;
  v_usuario record;
  v_new_id uuid;
  v_creado_en timestamptz;
  v_vence_en timestamptz;
  v_mask_nombre text;
  v_mask_correo text;
  v_mask_doc text;
  v_mask_celular text;
  v_datos_enmascarados jsonb;
  v_es_existente boolean;
begin
  if v_token_hash is null or char_length(v_token_hash) < 32 then
    raise exception 'Token de invitación inválido.';
  end if;

  select *
    into v_old
    from public.invitaciones i
   where i.id = p_invitacion_id
   for update;

  if v_old.id is null then
    raise exception 'No se encontró la invitación solicitada.';
  end if;

  if auth.role() <> 'service_role' and not public.puede_gestionar_personas_empresa(v_old.empresa_id) then
    raise exception 'No tienes permisos para reenviar invitaciones en esta empresa.';
  end if;

  if v_old.estado not in ('pendiente', 'vencida') then
    raise exception 'Solo se pueden reenviar invitaciones pendientes o vencidas.';
  end if;

  select p.nombre
    into v_perfil_nombre
    from public.perfiles p
   where p.id = v_old.perfil_id
     and p.empresa_id = v_old.empresa_id;

  -- Si la invitación no tenía usuario_id pero esa persona ya registró cuenta con el mismo doc, asociarla de forma segura
  if v_old.usuario_id is not null then
    select u.id, u.nombre, u.nombres, u.apellidos, lower(btrim(u.correo)) as correo, u.celular, u.tipo_documento, u.numero_documento
      into v_usuario
      from public.usuarios u
     where u.id = v_old.usuario_id;
  elsif v_old.tipo_documento is not null and v_old.numero_documento is not null then
    select u.id, u.nombre, u.nombres, u.apellidos, lower(btrim(u.correo)) as correo, u.celular, u.tipo_documento, u.numero_documento
      into v_usuario
      from public.usuarios u
     where u.tipo_documento = v_old.tipo_documento
       and upper(btrim(coalesce(u.numero_documento, ''))) = upper(btrim(v_old.numero_documento))
     limit 1;
  end if;

  v_es_existente := (v_old.tipo = 'cuenta_existente' or v_usuario.id is not null);

  if v_es_existente then
    if v_usuario.id is null then
      raise exception 'No se pudo localizar la cuenta de Vittkly vinculada a esta invitación.';
    end if;

    if exists (
      select 1
        from public.membresias m
       where m.empresa_id = v_old.empresa_id
         and m.usuario_id = v_usuario.id
         and m.estado in ('activa', 'desactivada')
    ) then
      raise exception 'Esta persona ya forma parte de la empresa.';
    end if;

    v_mask_nombre := public.enmascarar_nombre_identidad(v_usuario.nombre, v_usuario.nombres, v_usuario.apellidos);
    v_mask_correo := public.enmascarar_correo_identidad(v_usuario.correo);
    v_mask_doc := public.enmascarar_documento_identidad(v_usuario.numero_documento);
    v_mask_celular := public.enmascarar_celular_identidad(v_usuario.celular);

    v_datos_enmascarados := coalesce(
      v_old.datos_enmascarados,
      jsonb_build_object(
        'nombre', v_mask_nombre,
        'correo', v_mask_correo,
        'documento', v_mask_doc,
        'celular', v_mask_celular,
        'tipo_documento', coalesce(v_usuario.tipo_documento, v_old.tipo_documento)
      )
    );
  end if;

  -- Anular invitación anterior antes de insertar la nueva (libera índices parciales pendientes)
  update public.invitaciones
     set estado = 'anulada'
   where id = v_old.id;

  if v_es_existente then
    insert into public.invitaciones (
      empresa_id,
      tipo,
      usuario_id,
      tipo_documento,
      numero_documento,
      nombres,
      apellidos,
      correo,
      celular,
      datos_enmascarados,
      perfil_id,
      cargo,
      acceso_web,
      acceso_app,
      codigo_hash,
      token_hash,
      estado,
      creado_por
    )
    values (
      v_old.empresa_id,
      'cuenta_existente',
      v_usuario.id,
      coalesce(v_usuario.tipo_documento, v_old.tipo_documento),
      null,
      v_mask_nombre,
      null,
      null,
      null,
      v_datos_enmascarados,
      v_old.perfil_id,
      v_old.cargo,
      v_old.acceso_web,
      v_old.acceso_app,
      v_token_hash,
      v_token_hash,
      'pendiente',
      v_actor_id
    )
    returning id, creado_en, vence_en
      into v_new_id, v_creado_en, v_vence_en;

    return jsonb_build_object(
      'invitacion_id', v_new_id,
      'tipo', 'cuenta_existente',
      'perfil_id', v_old.perfil_id,
      'perfil_nombre', coalesce(v_perfil_nombre, 'Colaborador'),
      'cargo', v_old.cargo,
      'acceso_web', v_old.acceso_web,
      'acceso_app', v_old.acceso_app,
      'creado_en', v_creado_en,
      'vence_en', v_vence_en,
      'nombre_enmascarado', v_mask_nombre,
      'correo_enmascarado', v_mask_correo,
      'documento_enmascarado', v_mask_doc,
      'celular_enmascarado', v_mask_celular
    );
  else
    v_mask_nombre := public.enmascarar_nombre_identidad(null, v_old.nombres, v_old.apellidos);
    v_mask_correo := public.enmascarar_correo_identidad(v_old.correo);
    v_mask_doc := public.enmascarar_documento_identidad(v_old.numero_documento);
    v_mask_celular := public.enmascarar_celular_identidad(v_old.celular);

    v_datos_enmascarados := jsonb_build_object(
      'nombre', v_mask_nombre,
      'correo', v_mask_correo,
      'documento', v_mask_doc,
      'celular', v_mask_celular,
      'tipo_documento', v_old.tipo_documento
    );

    insert into public.invitaciones (
      empresa_id,
      tipo,
      usuario_id,
      tipo_documento,
      numero_documento,
      nombres,
      apellidos,
      correo,
      celular,
      datos_enmascarados,
      perfil_id,
      cargo,
      acceso_web,
      acceso_app,
      codigo_hash,
      token_hash,
      estado,
      creado_por
    )
    values (
      v_old.empresa_id,
      'nueva_cuenta',
      null,
      v_old.tipo_documento,
      v_old.numero_documento,
      v_old.nombres,
      v_old.apellidos,
      v_old.correo,
      v_old.celular,
      v_datos_enmascarados,
      v_old.perfil_id,
      v_old.cargo,
      v_old.acceso_web,
      v_old.acceso_app,
      v_token_hash,
      v_token_hash,
      'pendiente',
      v_actor_id
    )
    returning id, creado_en, vence_en
      into v_new_id, v_creado_en, v_vence_en;

    return jsonb_build_object(
      'invitacion_id', v_new_id,
      'tipo', 'nueva_cuenta',
      'perfil_id', v_old.perfil_id,
      'perfil_nombre', coalesce(v_perfil_nombre, 'Colaborador'),
      'cargo', v_old.cargo,
      'acceso_web', v_old.acceso_web,
      'acceso_app', v_old.acceso_app,
      'creado_en', v_creado_en,
      'vence_en', v_vence_en,
      'nombre_completo', trim(coalesce(v_old.nombres, '') || ' ' || coalesce(v_old.apellidos, '')),
      'correo', v_old.correo,
      'celular', v_old.celular,
      'documento_enmascarado', v_mask_doc
    );
  end if;
end;
$$;

revoke all on function public.reenviar_invitacion_empresa(uuid, text) from public, anon;
grant execute on function public.reenviar_invitacion_empresa(uuid, text) to authenticated, service_role;

-- 8. Actualizar mis_accesos() y responder_invitacion() con aislamiento por usuario_id y fecha desde
create or replace function public.mis_accesos()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid              uuid := auth.uid();
  v_correo           text;
  v_celular          text;
  v_nombre           text;
  v_ultima_empresa   uuid;
  v_prueba_usada_en  timestamptz;
  v_cuenta_actual    jsonb;
  v_empresas_propias jsonb;
  v_empresas_miembro jsonb;
  v_invitaciones     jsonb;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select u.nombre,
         lower(u.correo),
         u.celular,
         u.ultima_empresa_id,
         u.prueba_usada_en
    into v_nombre, v_correo, v_celular, v_ultima_empresa, v_prueba_usada_en
    from public.usuarios u
   where u.id = v_uid;

  select jsonb_build_object(
           'cuenta_id', c.id,
           'cuenta_nombre', c.nombre,
           'plan_codigo', pl.codigo,
           'plan_nombre', pl.nombre,
           'precio_mensual_centimos', pl.precio_mensual_centimos,
           'empresa_actual_nombre', coalesce(e.nombre_comercial, e.razon_social)
         )
    into v_cuenta_actual
    from public.cuentas c
    join public.suscripciones s on s.cuenta_id = c.id
    join public.planes pl on pl.id = s.plan_id
    left join public.empresas e on e.cuenta_id = c.id and e.eliminado_en is null
   where c.propietario_id = v_uid
     and c.eliminado_en is null
     and s.estado not in ('cancelada')
   order by c.creado_en asc, e.creado_en asc
   limit 1;

  select coalesce(jsonb_agg(item order by item->>'nombre' asc), '[]'::jsonb)
    into v_empresas_propias
    from (
      select jsonb_build_object(
        'membresia_id', m.id,
        'empresa_id', e.id,
        'nombre', coalesce(e.nombre_comercial, e.razon_social),
        'rubro', coalesce(nullif(btrim(e.rubro), ''), e.modelo_operacion, 'Servicios'),
        'ciudad', coalesce(nullif(btrim(e.ciudad), ''), e.pais, 'Perú'),
        'perfil_id', p.id,
        'perfil_nombre', p.nombre,
        'perfil_codigo', p.codigo,
        'es_propietario', true,
        'acceso_web', m.acceso_web,
        'acceso_app', m.acceso_app
      ) as item
      from public.membresias m
      join public.empresas e on e.id = m.empresa_id
      join public.perfiles p on p.id = m.perfil_id
      where m.usuario_id = v_uid
        and m.estado = 'activa'
        and m.activo = true
        and m.es_propietario = true
        and e.activa = true
        and e.eliminado_en is null
    ) sub;

  select coalesce(jsonb_agg(item order by item->>'nombre' asc), '[]'::jsonb)
    into v_empresas_miembro
    from (
      select jsonb_build_object(
        'membresia_id', m.id,
        'empresa_id', e.id,
        'nombre', coalesce(e.nombre_comercial, e.razon_social),
        'rubro', coalesce(nullif(btrim(e.rubro), ''), e.modelo_operacion, 'Servicios'),
        'ciudad', coalesce(nullif(btrim(e.ciudad), ''), e.pais, 'Perú'),
        'perfil_id', p.id,
        'perfil_nombre', p.nombre,
        'perfil_codigo', p.codigo,
        'es_propietario', false,
        'acceso_web', m.acceso_web,
        'acceso_app', m.acceso_app,
        'solicitud_salida', (
          select jsonb_build_object(
            'id', ss.id,
            'estado', ss.estado,
            'motivo', ss.motivo,
            'soporte_desde', ss.soporte_desde,
            'puede_pedir_soporte', (now() >= ss.soporte_desde),
            'creado_en', ss.creado_en
          )
          from public.solicitudes_salida ss
          where ss.membresia_id = m.id
            and ss.estado = 'pendiente'
          order by ss.creado_en desc
          limit 1
        )
      ) as item
      from public.membresias m
      join public.empresas e on e.id = m.empresa_id
      join public.perfiles p on p.id = m.perfil_id
      where m.usuario_id = v_uid
        and m.estado = 'activa'
        and m.activo = true
        and m.es_propietario = false
        and e.activa = true
        and e.eliminado_en is null
    ) sub;

  select coalesce(jsonb_agg(item order by item->>'creado_en' desc), '[]'::jsonb)
    into v_invitaciones
    from (
      select jsonb_build_object(
        'id', i.id,
        'empresa_id', e.id,
        'empresa_nombre', coalesce(e.nombre_comercial, e.razon_social),
        'perfil_id', p.id,
        'perfil_nombre', p.nombre,
        'invitador_nombre', coalesce(nullif(btrim(inv_u.nombre), ''), 'Administrador'),
        'acceso_web', i.acceso_web,
        'acceso_app', i.acceso_app,
        'vence_en', i.vence_en,
        'creado_en', i.creado_en
      ) as item
      from public.invitaciones i
      join public.empresas e on e.id = i.empresa_id
      join public.perfiles p on p.id = i.perfil_id
      left join public.usuarios inv_u on inv_u.id = i.creado_por
      where i.estado = 'pendiente'
        and i.vence_en >= now()
        and e.activa = true
        and e.eliminado_en is null
        and (
          i.usuario_id = v_uid
          or (
            i.usuario_id is null
            and (
              (v_correo is not null and lower(i.correo) = v_correo)
              or (v_celular is not null and i.celular = v_celular)
            )
          )
        )
    ) sub;

  return jsonb_build_object(
    'usuario', jsonb_build_object(
      'id', v_uid,
      'nombre', coalesce(nullif(btrim(v_nombre), ''), v_correo, 'Usuario'),
      'correo', v_correo,
      'ultima_empresa_id', v_ultima_empresa,
      'prueba_usada_en', v_prueba_usada_en
    ),
    'cuenta_actual', v_cuenta_actual,
    'empresas_propias', v_empresas_propias,
    'empresas_miembro', v_empresas_miembro,
    'invitaciones', v_invitaciones
  );
end;
$$;

revoke all on function public.mis_accesos() from public, anon;
grant execute on function public.mis_accesos() to authenticated;

create or replace function public.responder_invitacion(
  p_invitacion_id uuid,
  p_acepta boolean,
  p_motivo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid     uuid := auth.uid();
  v_correo  text;
  v_celular text;
  v_inv     public.invitaciones;
begin
  if v_uid is null then
    raise exception 'Hay que iniciar sesión para responder una invitación';
  end if;

  select lower(u.correo), u.celular
    into v_correo, v_celular
    from public.usuarios u
   where u.id = v_uid;

  select *
    into v_inv
    from public.invitaciones i
   where i.id = p_invitacion_id
     and (
       i.usuario_id = v_uid
       or (
         i.usuario_id is null
         and (
           (v_correo is not null and lower(i.correo) = v_correo)
           or (v_celular is not null and i.celular = v_celular)
         )
       )
     )
   for update;

  if v_inv.id is null then
    raise exception 'No se encontró la invitación para tu cuenta';
  end if;

  if v_inv.estado <> 'pendiente' then
    raise exception 'Esta invitación ya fue procesada o anulada';
  end if;

  if v_inv.vence_en < now() then
    update public.invitaciones set estado = 'vencida' where id = v_inv.id;
    raise exception 'La invitación ha vencido; solicita una nueva al administrador';
  end if;

  if p_acepta then
    insert into public.membresias (
      empresa_id,
      usuario_id,
      perfil_id,
      acceso_web,
      acceso_app,
      cargo,
      estado,
      activo,
      desde,
      invitacion_id,
      invitado_por,
      creado_por
    )
    values (
      v_inv.empresa_id,
      v_uid,
      v_inv.perfil_id,
      v_inv.acceso_web,
      v_inv.acceso_app,
      v_inv.cargo,
      'activa',
      true,
      now(),
      v_inv.id,
      v_inv.creado_por,
      v_uid
    )
    on conflict (empresa_id, usuario_id)
    do update set
      perfil_id = excluded.perfil_id,
      acceso_web = excluded.acceso_web,
      acceso_app = excluded.acceso_app,
      cargo = coalesce(excluded.cargo, public.membresias.cargo),
      estado = 'activa',
      activo = true,
      desde = case
        when public.membresias.estado = 'desvinculada' then now()
        else coalesce(public.membresias.desde, public.membresias.creado_en, now())
      end,
      desvinculada_en = null,
      invitacion_id = excluded.invitacion_id;

    -- Backfill de identidad documental solo si la invitación fue de nueva cuenta y el usuario aún no la tiene
    if v_inv.tipo = 'nueva_cuenta' and v_inv.tipo_documento is not null and v_inv.numero_documento is not null then
      update public.usuarios u
         set tipo_documento = v_inv.tipo_documento,
             numero_documento = upper(btrim(v_inv.numero_documento))
       where u.id = v_uid
         and (u.tipo_documento is null or u.numero_documento is null)
         and not exists (
           select 1
             from public.usuarios u2
            where u2.id <> v_uid
              and u2.tipo_documento = v_inv.tipo_documento
              and upper(btrim(coalesce(u2.numero_documento, ''))) = upper(btrim(v_inv.numero_documento))
         );
    end if;

    update public.invitaciones
       set estado = 'aceptada',
           respondida_en = now(),
           usada_en = now(),
           usada_por = v_uid
     where id = v_inv.id;

    return jsonb_build_object(
      'empresa_id', v_inv.empresa_id,
      'acceso_web', v_inv.acceso_web,
      'aceptada', true
    );
  else
    update public.invitaciones
       set estado = 'rechazada',
           motivo_rechazo = nullif(btrim(p_motivo), ''),
           respondida_en = now()
     where id = v_inv.id;

    return jsonb_build_object(
      'empresa_id', v_inv.empresa_id,
      'aceptada', false
    );
  end if;
end;
$$;

revoke all on function public.responder_invitacion(uuid, boolean, text) from public, anon;
grant execute on function public.responder_invitacion(uuid, boolean, text) to authenticated;

comment on column public.membresias.desde is 'Fecha efectiva de inicio de la membresía (o de reincorporación si fue desvinculada previamente).';
comment on column public.invitaciones.datos_enmascarados is 'Instantánea enmascarada sin PII para cuenta_existente o visualización segura mientras está pendiente.';
comment on function public.buscar_persona_por_documento(uuid, text, text) is 'Búsqueda por documento con privacidad estricta: retorna ya_es_miembro, invitacion_pendiente, cuenta_existente (solo enmascarado) o no_encontrado.';
comment on function public.crear_invitacion_empresa(uuid, text, text, uuid, boolean, boolean, text, text, text, text, text, text) is 'Crea invitación atómica derivando tipo en servidor, aislando PII en cuenta_existente y bloqueando colisiones de correo/celular en nueva_cuenta.';
comment on function public.reenviar_invitacion_empresa(uuid, text) is 'Anula de forma atómica una invitación pendiente/vencida y genera una nueva preservando el aislamiento PII.';
