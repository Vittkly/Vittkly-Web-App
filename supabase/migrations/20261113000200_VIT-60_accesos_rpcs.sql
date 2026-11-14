-- =====================================================================
-- Migración 12 · Accesos a empresa (/accesos), RPCs y Creación Multi-Empresa
-- Historia: VIT-60 · Documento: «Vittkly: nuevo acceso y Accesos a empresa»
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columnas aditivas en empresas y solicitudes_salida
-- ---------------------------------------------------------------------
alter table public.empresas
  add column if not exists rubro text,
  add column if not exists ciudad text;

alter table public.solicitudes_salida
  add column if not exists soporte_desde timestamptz not null default (now() + interval '7 days');

-- ---------------------------------------------------------------------
-- 2. RPC mis_accesos(): consulta segura de membresías, invitaciones,
--    solicitudes de salida, última empresa y estado de prueba gratis
-- ---------------------------------------------------------------------
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

  -- Cuenta actual donde es propietario (si existe) para la opción "Sumarla a mi cuenta"
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

  -- Empresas donde es propietario
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

  -- Empresas a las que pertenece (no propietario) + solicitud de salida activa si existe
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

  -- Invitaciones pendientes dirigidas a este usuario (por usuario_id, correo o celular)
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
          or (v_correo is not null and lower(i.correo) = v_correo)
          or (v_celular is not null and i.celular = v_celular)
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

-- ---------------------------------------------------------------------
-- 3. RPC responder_invitacion(p_invitacion_id, p_acepta, p_motivo)
-- ---------------------------------------------------------------------
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
       or (v_correo is not null and lower(i.correo) = v_correo)
       or (v_celular is not null and i.celular = v_celular)
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
      desvinculada_en = null,
      invitacion_id = excluded.invitacion_id;

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

-- ---------------------------------------------------------------------
-- 4. RPC solicitar_salida(p_membresia_id, p_motivo)
-- ---------------------------------------------------------------------
create or replace function public.solicitar_salida(
  p_membresia_id uuid,
  p_motivo text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_mem public.membresias;
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select *
    into v_mem
    from public.membresias m
   where m.id = p_membresia_id
     and m.usuario_id = v_uid
     and m.estado = 'activa';

  if v_mem.id is null then
    raise exception 'No se encontró una membresía activa asociada a tu cuenta';
  end if;

  if v_mem.es_propietario then
    raise exception 'Como propietario debes transferir la propiedad antes de salir de la empresa';
  end if;

  if exists (
    select 1 from public.solicitudes_salida ss
    where ss.membresia_id = v_mem.id
      and ss.estado = 'pendiente'
  ) then
    raise exception 'Ya existe una solicitud de salida pendiente para esta empresa';
  end if;

  insert into public.solicitudes_salida (
    empresa_id,
    membresia_id,
    usuario_id,
    motivo,
    estado,
    soporte_desde
  )
  values (
    v_mem.empresa_id,
    v_mem.id,
    v_uid,
    nullif(btrim(p_motivo), ''),
    'pendiente',
    now() + interval '7 days'
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.solicitar_salida(uuid, text) from public, anon;
grant execute on function public.solicitar_salida(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- 5. RPC pedir_soporte_salida(p_solicitud_id)
-- ---------------------------------------------------------------------
create or replace function public.pedir_soporte_salida(p_solicitud_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_sol   public.solicitudes_salida;
  v_user  public.usuarios;
  v_caso  uuid;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select *
    into v_sol
    from public.solicitudes_salida ss
   where ss.id = p_solicitud_id
     and ss.usuario_id = v_uid
     and ss.estado = 'pendiente';

  if v_sol.id is null then
    raise exception 'No se encontró la solicitud de salida pendiente';
  end if;

  if now() < v_sol.soporte_desde then
    raise exception 'El soporte directo se habilita 7 días después de enviar tu solicitud';
  end if;

  select * into v_user from public.usuarios where id = v_uid;

  insert into public.casos_soporte (
    empresa_id,
    usuario_id,
    tipo_documento,
    numero_documento,
    correo_contacto,
    celular_contacto,
    motivo,
    estado
  )
  values (
    v_sol.empresa_id,
    v_uid,
    v_user.tipo_documento,
    v_user.numero_documento,
    v_user.correo,
    v_user.celular,
    coalesce('Solicitud de salida sin respuesta tras 7 días. ' || nullif(btrim(v_sol.motivo), ''), 'Solicitud de salida sin respuesta tras 7 días.'),
    'abierto'
  )
  returning id into v_caso;

  return v_caso;
end;
$$;

revoke all on function public.pedir_soporte_salida(uuid) from public, anon;
grant execute on function public.pedir_soporte_salida(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 6. Actualizar crear_cuenta_y_empresa(...) para soportar modo
--    ('sumar_cuenta' | 'plan_propio'), rubro, ciudad y control de prueba gratis
-- ---------------------------------------------------------------------
create or replace function public.crear_cuenta_y_empresa(
  p_nombre_empresa text,
  p_ruc text default null,
  p_plan_codigo text default 'inicia',
  p_rubro text default null,
  p_ciudad text default null,
  p_modo text default 'plan_propio',
  p_periodo text default 'mensual'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid           uuid := auth.uid();
  v_prueba_usada  timestamptz;
  v_plan_id       uuid;
  v_cuenta_id     uuid;
  v_empresa_id    uuid;
  v_perfil_id     uuid;
  v_estado_sub    text;
  v_prueba_hasta  timestamptz;
  v_periodo_norm  text := case when p_periodo = 'anual' then 'anual' else 'mensual' end;
begin
  if v_uid is null then
    raise exception 'Hay que iniciar sesión para crear una empresa';
  end if;

  if coalesce(btrim(p_nombre_empresa), '') = '' then
    raise exception 'Falta el nombre de la empresa';
  end if;

  -- Bloquear fila de usuario para evaluar atómicamente si ya usó su prueba gratis
  select u.prueba_usada_en
    into v_prueba_usada
    from public.usuarios u
   where u.id = v_uid
   for update;

  select id into v_plan_id
    from public.planes
   where codigo = coalesce(nullif(btrim(p_plan_codigo), ''), 'inicia')
     and activo = true
   limit 1;

  if v_plan_id is null then
    raise exception 'El plan % no existe o no está activo', p_plan_codigo;
  end if;

  if p_modo = 'sumar_cuenta' then
    select c.id
      into v_cuenta_id
      from public.cuentas c
     where c.propietario_id = v_uid
       and c.eliminado_en is null
     order by c.creado_en asc
     limit 1;

    if v_cuenta_id is null then
      raise exception 'No tienes una cuenta activa a la cual sumar esta empresa';
    end if;

    -- Si eligió subir de plan (por ejemplo de Inicia a Crece), actualizar suscripción existente
    update public.suscripciones
       set plan_id = v_plan_id,
           actualizado_por = v_uid
     where cuenta_id = v_cuenta_id
       and estado not in ('cancelada');
  else
    -- Plan propio: crea una nueva cuenta y suscripción
    insert into public.cuentas (nombre, propietario_id, correo_facturacion, creado_por)
    values (
      btrim(p_nombre_empresa),
      v_uid,
      (select correo from public.usuarios where id = v_uid),
      v_uid
    )
    returning id into v_cuenta_id;

    if v_prueba_usada is null then
      v_estado_sub := 'prueba';
      v_prueba_hasta := now() + interval '30 days';
      update public.usuarios
         set prueba_usada_en = now()
       where id = v_uid
         and prueba_usada_en is null;
    else
      v_estado_sub := 'activa';
      v_prueba_hasta := null;
    end if;

    insert into public.suscripciones (
      cuenta_id,
      plan_id,
      estado,
      periodo,
      prueba_hasta,
      creado_por
    )
    values (
      v_cuenta_id,
      v_plan_id,
      v_estado_sub,
      v_periodo_norm,
      v_prueba_hasta,
      v_uid
    );
  end if;

  insert into public.empresas (
    cuenta_id,
    razon_social,
    ruc,
    rubro,
    ciudad,
    creado_por
  )
  values (
    v_cuenta_id,
    btrim(p_nombre_empresa),
    nullif(btrim(p_ruc), ''),
    nullif(btrim(p_rubro), ''),
    nullif(btrim(p_ciudad), ''),
    v_uid
  )
  returning id into v_empresa_id;

  insert into public.empresa_configuracion (empresa_id, creado_por)
  values (v_empresa_id, v_uid);

  perform public.copiar_perfiles_base(v_empresa_id);

  select id into v_perfil_id
    from public.perfiles
   where empresa_id = v_empresa_id
     and codigo = 'admin'
   limit 1;

  if v_perfil_id is null then
    raise exception 'Falta el perfil base «admin» en las plantillas';
  end if;

  insert into public.membresias (
    empresa_id,
    usuario_id,
    perfil_id,
    es_propietario,
    acceso_web,
    acceso_app,
    estado,
    activo,
    creado_por
  )
  values (
    v_empresa_id,
    v_uid,
    v_perfil_id,
    true,
    true,
    true,
    'activa',
    true,
    v_uid
  );

  update public.usuarios
     set ultima_empresa_id = v_empresa_id
   where id = v_uid;

  return v_empresa_id;
end;
$$;

revoke all on function public.crear_cuenta_y_empresa(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.crear_cuenta_y_empresa(text, text, text, text, text, text, text) to authenticated;
