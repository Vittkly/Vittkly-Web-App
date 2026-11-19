-- =====================================================================
-- Migración: 20261117000100_VIT-65_auditoria_detallada_triggers.sql
-- Historia: VIT-65
-- Propósito:
--   1. Extender public.auditoria con columnas semánticas, diff estructurado,
--      actor snapshot e índices compuestos + Búsqueda FTS/trigram para R4.
--   2. Incorporar sanitización de secretos/PII (auditoria_sanitizar_fila) y
--      helper es_propietario_empresa(uuid).
--   3. Actualizar public.auditar() con resolución segura de empresa_id,
--      registro_id (empresa_configuracion), actor bajo service_role,
--      supresión de no-ops/ruido, detección de reenvío de invitaciones,
--      descripciones claras en español y metadatos estructurados.
--   4. Optimizar guardar_perfil_empresa() y copiar_perfiles_base() para evitar
--      ruido masivo en perfil_permisos usando diffing real.
--   5. Conectar trigger auditar a public.verificaciones y verificar cobertura
--      en todas las tablas auditables (excluyendo intentos_ingreso y auditoria).
--   6. Blindar inmutabilidad de public.auditoria (incluyendo service_role),
--      permitir acceso al propietario en RLS y completar FORCE ROW LEVEL
--      SECURITY en el 100% de las tablas públicas.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columnas aditivas e idempotentes en public.auditoria
--    (Preserva intactas las 9 columnas existentes para retrocompatibilidad)
-- ---------------------------------------------------------------------
alter table public.auditoria
  add column if not exists tipo_evento text,
  add column if not exists origen text,
  add column if not exists actor_nombre text,
  add column if not exists actor_correo text,
  add column if not exists entidad_nombre text,
  add column if not exists campos_modificados text[] not null default '{}'::text[],
  add column if not exists detalle text,
  add column if not exists metadatos jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------
-- 2. Helpers de autorización y sanitización
-- ---------------------------------------------------------------------
create or replace function public.es_propietario_empresa(p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.membresias m
     where m.empresa_id = p_empresa_id
       and m.usuario_id = (select auth.uid())
       and m.activo = true
       and m.estado = 'activa'
       and m.es_propietario = true
  );
$$;

revoke all on function public.es_propietario_empresa(uuid) from public, anon;
grant execute on function public.es_propietario_empresa(uuid) to authenticated, service_role;

create or replace function public.auditoria_sanitizar_fila(
  p_table text,
  p_row jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_clean jsonb;
  v_doc text;
  v_destino text;
begin
  if p_row is null then
    return null;
  end if;

  -- Eliminar hashes y secretos criptográficos antes de persistir o comparar diffs
  v_clean := p_row - 'codigo_hash' - 'token_hash' - 'password_hash';

  -- Enmascarar documentos de identidad en tablas de personas/invitaciones/soporte
  if v_clean ? 'numero_documento' then
    v_doc := nullif(btrim(coalesce(v_clean ->> 'numero_documento', '')), '');
    if v_doc is not null then
      v_clean := jsonb_set(
        v_clean,
        '{numero_documento}',
        to_jsonb(public.enmascarar_documento_identidad(v_doc)),
        false
      );
    end if;
  end if;

  if p_table = 'clientes' and v_clean ? 'documento_numero' then
    v_doc := nullif(btrim(coalesce(v_clean ->> 'documento_numero', '')), '');
    if v_doc is not null then
      v_clean := jsonb_set(
        v_clean,
        '{documento_numero}',
        to_jsonb(public.enmascarar_documento_identidad(v_doc)),
        false
      );
    end if;
  end if;

  -- Enmascarar destino de OTPs en verificaciones (correo o celular)
  if p_table = 'verificaciones' and v_clean ? 'destino' then
    v_destino := nullif(btrim(coalesce(v_clean ->> 'destino', '')), '');
    if v_destino is not null then
      if position('@' in v_destino) > 0 then
        v_clean := jsonb_set(
          v_clean,
          '{destino}',
          to_jsonb(public.enmascarar_correo_identidad(v_destino)),
          false
        );
      else
        v_clean := jsonb_set(
          v_clean,
          '{destino}',
          to_jsonb(public.enmascarar_celular_identidad(v_destino)),
          false
        );
      end if;
    end if;
  end if;

  return v_clean;
end;
$$;

revoke all on function public.auditoria_sanitizar_fila(text, jsonb) from public, anon, authenticated;
grant execute on function public.auditoria_sanitizar_fila(text, jsonb) to service_role;

-- ---------------------------------------------------------------------
-- 3. Backfill idempotente y saneamiento de filas históricas
-- ---------------------------------------------------------------------
update public.auditoria a
   set antes = case
                 when a.antes is null then null
                 else public.auditoria_sanitizar_fila(a.tabla, a.antes)
               end,
       despues = case
                   when a.despues is null then null
                   else public.auditoria_sanitizar_fila(a.tabla, a.despues)
                 end,
       tipo_evento = coalesce(
                       a.tipo_evento,
                       case
                         when a.accion = 'crear' and a.tabla = 'invitaciones' then 'invitar'
                         when a.accion = 'crear' and a.tabla in ('solicitudes_salida', 'casos_soporte', 'verificaciones') then 'solicitar'
                         when a.accion = 'crear' then 'crear'
                         when a.accion = 'borrar' then 'borrar'
                         when a.tabla = 'membresias' and a.despues ->> 'estado' = 'desactivada' and coalesce(a.antes ->> 'estado', '') <> 'desactivada' then 'suspender'
                         when a.tabla = 'membresias' and a.despues ->> 'estado' = 'activa' and coalesce(a.antes ->> 'estado', '') in ('desactivada', 'desvinculada') then 'reactivar'
                         when a.tabla = 'membresias' and a.despues ->> 'estado' = 'desvinculada' and coalesce(a.antes ->> 'estado', '') <> 'desvinculada' then 'desvincular'
                         when a.tabla = 'invitaciones' and a.despues ->> 'estado' in ('aceptada', 'usada') and coalesce(a.antes ->> 'estado', '') not in ('aceptada', 'usada') then 'aceptar'
                         when a.tabla = 'invitaciones' and a.despues ->> 'estado' = 'rechazada' and coalesce(a.antes ->> 'estado', '') <> 'rechazada' then 'rechazar'
                         when a.tabla = 'invitaciones' and a.despues ->> 'estado' = 'anulada' and coalesce(a.antes ->> 'estado', '') <> 'anulada' then 'anular'
                         when a.tabla = 'invitaciones' and a.despues ->> 'estado' = 'vencida' and coalesce(a.antes ->> 'estado', '') <> 'vencida' then 'vencer'
                         when a.tabla = 'solicitudes_salida' and a.despues ->> 'estado' = 'aprobada' and coalesce(a.antes ->> 'estado', '') <> 'aprobada' then 'aprobar'
                         when a.tabla = 'solicitudes_salida' and a.despues ->> 'estado' = 'rechazada' and coalesce(a.antes ->> 'estado', '') <> 'rechazada' then 'rechazar'
                         when a.tabla = 'ordenes_trabajo' and a.despues ->> 'estado' = 'cancelada' and coalesce(a.antes ->> 'estado', '') <> 'cancelada' then 'anular'
                         when a.tabla = 'ordenes_trabajo' and a.despues ->> 'estado_validacion' = 'aprobado' and coalesce(a.antes ->> 'estado_validacion', '') <> 'aprobado' then 'aprobar'
                         when a.tabla = 'ordenes_trabajo' and a.despues ->> 'estado_validacion' = 'observado' and coalesce(a.antes ->> 'estado_validacion', '') <> 'observado' then 'rechazar'
                         else 'editar'
                       end
                     ),
       origen = coalesce(
                  a.origen,
                  case a.tabla
                    when 'membresias' then 'equipo_accesos'
                    when 'perfiles' then 'perfiles_permisos'
                    when 'perfil_permisos' then 'perfiles_permisos'
                    when 'invitaciones' then 'invitaciones'
                    when 'solicitudes_salida' then 'solicitudes_salida'
                    when 'empresas' then 'empresa_configuracion'
                    when 'empresa_configuracion' then 'empresa_configuracion'
                    when 'clientes' then 'operaciones_clientes'
                    when 'ordenes_trabajo' then 'operaciones_ordenes'
                    when 'evidencias_orden' then 'operaciones_ordenes'
                    when 'plantillas_formulario' then 'operaciones_formularios'
                    when 'respuestas_formulario' then 'operaciones_formularios'
                    when 'registros_tiempo' then 'operaciones_tiempo'
                    when 'casos_soporte' then 'soporte'
                    when 'cuentas' then 'cuenta_suscripcion'
                    when 'suscripciones' then 'cuenta_suscripcion'
                    when 'usuarios' then case when a.empresa_id is not null then 'equipo_accesos' else 'plataforma' end
                    else 'plataforma'
                  end
                ),
       actor_nombre = coalesce(
                        a.actor_nombre,
                        (
                          select coalesce(
                                   nullif(btrim(u.nombre), ''),
                                   nullif(btrim(concat_ws(' ', u.nombres, u.apellidos)), ''),
                                   nullif(btrim(u.correo), ''),
                                   'Usuario'
                                 )
                            from public.usuarios u
                           where u.id = a.usuario_id
                        ),
                        case when a.usuario_id is null then 'Sistema' else 'Usuario' end
                      ),
       actor_correo = coalesce(
                        a.actor_correo,
                        (
                          select nullif(btrim(u.correo), '')
                            from public.usuarios u
                           where u.id = a.usuario_id
                        )
                      ),
       entidad_nombre = coalesce(
                          a.entidad_nombre,
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'nombre'), ''),
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'nombre_completo'), ''),
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'nombre_comercial'), ''),
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'razon_social'), ''),
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'titulo'), ''),
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'codigo'), ''),
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'permiso_codigo'), ''),
                          nullif(btrim(coalesce(a.despues, a.antes) ->> 'correo'), ''),
                          a.registro_id
                        ),
       detalle = coalesce(
                   a.detalle,
                   case a.accion
                     when 'crear' then 'Creó registro en ' || a.tabla
                     when 'editar' then 'Actualizó registro en ' || a.tabla
                     else 'Eliminó registro en ' || a.tabla
                   end
                 )
 where a.tipo_evento is null
    or a.origen is null
    or a.actor_nombre is null
    or a.detalle is null
    or (a.antes is not null and (a.antes ? 'codigo_hash' or a.antes ? 'token_hash' or a.antes ? 'password_hash' or a.antes ? 'numero_documento'))
    or (a.despues is not null and (a.despues ? 'codigo_hash' or a.despues ? 'token_hash' or a.despues ? 'password_hash' or a.despues ? 'numero_documento'));

-- ---------------------------------------------------------------------
-- 4. Constraints CHECK idempotentes (PG16 no soporta ADD CONSTRAINT IF NOT EXISTS)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'auditoria_tipo_evento_check'
       and conrelid = 'public.auditoria'::regclass
  ) then
    alter table public.auditoria
      add constraint auditoria_tipo_evento_check
      check (
        tipo_evento is null or tipo_evento in (
          'crear', 'editar', 'borrar',
          'invitar', 'reenviar', 'aceptar', 'aprobar', 'rechazar',
          'suspender', 'reactivar', 'anular', 'desvincular',
          'vencer', 'solicitar', 'acceso'
        )
      );
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conname = 'auditoria_origen_check'
       and conrelid = 'public.auditoria'::regclass
  ) then
    alter table public.auditoria
      add constraint auditoria_origen_check
      check (
        origen is null or origen in (
          'equipo_accesos',
          'perfiles_permisos',
          'invitaciones',
          'solicitudes_salida',
          'empresa_configuracion',
          'operaciones_clientes',
          'operaciones_ordenes',
          'operaciones_formularios',
          'operaciones_tiempo',
          'soporte',
          'cuenta_suscripcion',
          'plataforma'
        )
      );
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conname = 'auditoria_metadatos_obj_check'
       and conrelid = 'public.auditoria'::regclass
  ) then
    alter table public.auditoria
      add constraint auditoria_metadatos_obj_check
      check (jsonb_typeof(metadatos) = 'object');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 5. Índices compuestos para filtros combinables R4 y búsqueda de texto
-- ---------------------------------------------------------------------
create index if not exists auditoria_empresa_usuario_creado_idx
  on public.auditoria (empresa_id, usuario_id, creado_en desc);

create index if not exists auditoria_empresa_origen_creado_idx
  on public.auditoria (empresa_id, origen, creado_en desc);

create index if not exists auditoria_empresa_tipo_evento_creado_idx
  on public.auditoria (empresa_id, tipo_evento, creado_en desc);

create index if not exists auditoria_empresa_accion_creado_idx
  on public.auditoria (empresa_id, accion, creado_en desc);

create index if not exists auditoria_busqueda_fts_idx
  on public.auditoria
  using gin (
    to_tsvector(
      'spanish',
      coalesce(detalle, '') || ' ' ||
      coalesce(actor_nombre, '') || ' ' ||
      coalesce(actor_correo, '') || ' ' ||
      coalesce(entidad_nombre, '') || ' ' ||
      coalesce(origen, '') || ' ' ||
      coalesce(tabla, '')
    )
  );

do $$
declare
  v_schema text;
begin
  begin
    create extension if not exists pg_trgm with schema extensions;
  exception
    when insufficient_privilege or undefined_file or undefined_object then
      null;
  end;

  select n.nspname
    into v_schema
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
   where e.extname = 'pg_trgm'
   limit 1;

  if v_schema is not null then
    execute format(
      'create index if not exists auditoria_busqueda_trgm_idx on public.auditoria using gin ((' ||
      'coalesce(detalle, '''') || '' '' || coalesce(actor_nombre, '''') || '' '' || ' ||
      'coalesce(actor_correo, '''') || '' '' || coalesce(entidad_nombre, '''') || '' '' || ' ||
      'coalesce(origen, '''') || '' '' || coalesce(tabla, '''')' ||
      ') %I.gin_trgm_ops)',
      v_schema
    );
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 6. Trigger central mejorado: public.auditar()
-- ---------------------------------------------------------------------
create or replace function public.auditar()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old_raw               jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  v_new_raw               jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  v_old                   jsonb;
  v_new                   jsonb;
  v_fila                  jsonb;
  v_emp                   uuid;
  v_reg                   text;
  v_accion                text;
  v_tipo_evento           text;
  v_origen                text;
  v_actor_id              uuid;
  v_actor_nombre          text;
  v_actor_correo          text;
  v_entidad_nombre        text;
  v_detalle               text;
  v_perfil_nombre         text;
  v_perfil_prev_nombre    text;
  v_target_nombre         text;
  v_orden_codigo          text;
  v_plan_nombre           text;
  v_es_reenvio            boolean := false;
  v_es_propietario_row    boolean := false;
  v_ignored               text[];
  v_changed_keys          text[] := '{}'::text[];
  v_cambios               jsonb := '[]'::jsonb;
  v_metadatos             jsonb := '{}'::jsonb;
  v_old_estado            text;
  v_new_estado            text;
  v_old_validacion        text;
  v_new_validacion        text;
begin
  -- 1. Supresión temprana para seed/creación inicial de perfil_permisos
  if tg_table_name = 'perfil_permisos'
     and nullif(current_setting('app.omitir_auditoria_perfil_permisos', true), '') = 'true' then
    return coalesce(new, old);
  end if;

  v_old := public.auditoria_sanitizar_fila(tg_table_name, v_old_raw);
  v_new := public.auditoria_sanitizar_fila(tg_table_name, v_new_raw);
  v_fila := coalesce(v_new, v_old);

  -- 2. Si es perfil_permisos, resolver perfil padre (y suprimir CASCADE al borrar perfil)
  if tg_table_name = 'perfil_permisos' then
    select p.empresa_id, p.nombre
      into v_emp, v_perfil_nombre
      from public.perfiles p
     where p.id = nullif(v_fila ->> 'perfil_id', '')::uuid;

    if tg_op = 'DELETE' and not found then
      return old;
    end if;
  end if;

  -- 3. Cálculo de campos modificados y supresión de no-ops/ruido en UPDATE
  if tg_op = 'UPDATE' then
    v_ignored := array[
      'actualizado_en',
      'actualizado_por',
      'codigo_hash',
      'token_hash',
      'password_hash'
    ]::text[];

    if tg_table_name = 'empresa_configuracion' then
      v_ignored := array_append(v_ignored, 'version');
    end if;

    select coalesce(array_agg(k order by k), '{}'::text[])
      into v_changed_keys
      from (
        select k from jsonb_object_keys(v_new) as t(k)
        union
        select k from jsonb_object_keys(v_old) as t(k)
      ) keys
     where not (k = any(v_ignored))
       and (v_old -> k) is distinct from (v_new -> k);

    if coalesce(array_length(v_changed_keys, 1), 0) = 0 then
      return new;
    end if;

    if tg_table_name = 'usuarios'
       and v_changed_keys <@ array['ultimo_ingreso_en', 'ultima_empresa_id', 'prueba_usada_en']::text[] then
      return new;
    end if;

    if tg_table_name = 'verificaciones'
       and v_changed_keys <@ array['intentos']::text[] then
      return new;
    end if;

    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'campo', k,
          'antes', v_old -> k,
          'despues', v_new -> k
        )
        order by k
      ),
      '[]'::jsonb
    )
      into v_cambios
      from unnest(v_changed_keys) as k;
  end if;

  -- 4. Resolver empresa_id (v_emp) sin contaminar tenants
  if tg_table_name <> 'perfil_permisos' then
    v_emp := case
      when tg_table_name = 'empresas' then nullif(v_fila ->> 'id', '')::uuid
      when tg_table_name = 'cuentas' then coalesce(
        nullif(current_setting('app.empresa_id', true), '')::uuid,
        (
          select case when count(*) = 1 then (array_agg(e.id))[1] else null end
            from public.empresas e
           where e.cuenta_id = nullif(v_fila ->> 'id', '')::uuid
             and e.eliminado_en is null
        )
      )
      when tg_table_name = 'suscripciones' then coalesce(
        nullif(current_setting('app.empresa_id', true), '')::uuid,
        (
          select case when count(*) = 1 then (array_agg(e.id))[1] else null end
            from public.empresas e
           where e.cuenta_id = nullif(v_fila ->> 'cuenta_id', '')::uuid
             and e.eliminado_en is null
        )
      )
      when tg_table_name = 'usuarios' then nullif(current_setting('app.empresa_id', true), '')::uuid
      when tg_table_name = 'verificaciones' then null::uuid
      when v_fila ? 'empresa_id' then nullif(v_fila ->> 'empresa_id', '')::uuid
      else null::uuid
    end;
  end if;

  -- 5. Resolver registro_id (incluye empresa_configuracion PK = empresa_id)
  v_reg := coalesce(
    nullif(v_fila ->> 'id', ''),
    case when tg_table_name = 'empresa_configuracion' then nullif(v_fila ->> 'empresa_id', '') end,
    nullif(v_fila ->> 'usuario_id', ''),
    nullif(
      concat_ws(
        '/',
        nullif(v_fila ->> 'plan_id', ''),
        nullif(v_fila ->> 'perfil_id', ''),
        nullif(v_fila ->> 'modulo_codigo', ''),
        nullif(v_fila ->> 'permiso_codigo', '')
      ),
      ''
    ),
    nullif(v_fila ->> 'codigo', '')
  );

  -- 6. Resolver actor (auth.uid() -> app.actor_id -> actualizado_por -> fallback contextual estricto -> creado_por)
  v_old_estado := coalesce(v_old ->> 'estado', '');
  v_new_estado := coalesce(v_new ->> 'estado', '');
  v_old_validacion := coalesce(v_old ->> 'estado_validacion', '');
  v_new_validacion := coalesce(v_new ->> 'estado_validacion', '');

  v_actor_id := coalesce(
    auth.uid(),
    nullif(current_setting('app.actor_id', true), '')::uuid,
    nullif(v_fila ->> 'actualizado_por', '')::uuid,
    case
      when tg_table_name = 'usuarios' then nullif(v_fila ->> 'id', '')::uuid
      when tg_table_name = 'verificaciones' then nullif(v_fila ->> 'usuario_id', '')::uuid
      when tg_table_name = 'invitaciones'
           and tg_op = 'UPDATE'
           and v_new_estado in ('aceptada', 'usada')
        then nullif(v_new ->> 'usada_por', '')::uuid
      when tg_table_name = 'invitaciones'
           and tg_op = 'UPDATE'
           and v_new_estado = 'rechazada'
        then nullif(v_new ->> 'usuario_id', '')::uuid
      when tg_table_name = 'membresias'
           and (tg_op = 'INSERT' or v_old_estado = 'desvinculada')
           and v_new_estado = 'activa'
           and nullif(v_new ->> 'invitacion_id', '') is not null
        then nullif(v_new ->> 'usuario_id', '')::uuid
      when tg_table_name = 'solicitudes_salida'
           and tg_op = 'UPDATE'
           and v_new_estado in ('aprobada', 'rechazada')
        then nullif(v_new ->> 'resuelto_por', '')::uuid
      when tg_table_name = 'ordenes_trabajo'
           and tg_op = 'UPDATE'
           and v_new_validacion in ('aprobado', 'observado')
        then nullif(v_new ->> 'validado_por', '')::uuid
      else null
    end,
    case when tg_op = 'INSERT' then nullif(v_fila ->> 'creado_por', '')::uuid end
  );

  if v_actor_id is not null then
    select coalesce(
             nullif(btrim(u.nombre), ''),
             nullif(btrim(concat_ws(' ', u.nombres, u.apellidos)), ''),
             nullif(btrim(u.correo), '')
           ),
           nullif(btrim(u.correo), '')
      into v_actor_nombre, v_actor_correo
      from public.usuarios u
     where u.id = v_actor_id;
  end if;

  if v_actor_nombre is null then
    v_actor_nombre := case when v_actor_id is null then 'Sistema' else 'Usuario' end;
  end if;

  -- 7. Resolver accion base (compatibilidad con constraint 'crear'|'editar'|'borrar')
  v_accion := case tg_op
    when 'INSERT' then 'crear'
    when 'UPDATE' then 'editar'
    else 'borrar'
  end;

  -- 8. Resolver origen canónico, tipo_evento, entidad_nombre, detalle y metadatos contextuales
  v_origen := case tg_table_name
    when 'membresias' then 'equipo_accesos'
    when 'perfiles' then 'perfiles_permisos'
    when 'perfil_permisos' then 'perfiles_permisos'
    when 'invitaciones' then 'invitaciones'
    when 'solicitudes_salida' then 'solicitudes_salida'
    when 'empresas' then 'empresa_configuracion'
    when 'empresa_configuracion' then 'empresa_configuracion'
    when 'clientes' then 'operaciones_clientes'
    when 'ordenes_trabajo' then 'operaciones_ordenes'
    when 'evidencias_orden' then 'operaciones_ordenes'
    when 'plantillas_formulario' then 'operaciones_formularios'
    when 'respuestas_formulario' then 'operaciones_formularios'
    when 'registros_tiempo' then 'operaciones_tiempo'
    when 'casos_soporte' then 'soporte'
    when 'cuentas' then 'cuenta_suscripcion'
    when 'suscripciones' then 'cuenta_suscripcion'
    when 'usuarios' then case when v_emp is not null then 'equipo_accesos' else 'plataforma' end
    else 'plataforma'
  end;

  -- Lookups de nombres legibles según tabla
  if nullif(v_fila ->> 'perfil_id', '') is not null and v_perfil_nombre is null then
    select p.nombre
      into v_perfil_nombre
      from public.perfiles p
     where p.id = nullif(v_fila ->> 'perfil_id', '')::uuid;
  end if;

  if tg_op = 'UPDATE'
     and nullif(v_old ->> 'perfil_id', '') is not null
     and (v_old ->> 'perfil_id') is distinct from (v_new ->> 'perfil_id') then
    select p.nombre
      into v_perfil_prev_nombre
      from public.perfiles p
     where p.id = nullif(v_old ->> 'perfil_id', '')::uuid;
  end if;

  -- Clasificación granular por tabla
  if tg_table_name = 'membresias' then
    select coalesce(
             nullif(btrim(u.nombre), ''),
             nullif(btrim(concat_ws(' ', u.nombres, u.apellidos)), ''),
             nullif(btrim(u.correo), '')
           )
      into v_target_nombre
      from public.usuarios u
     where u.id = nullif(v_fila ->> 'usuario_id', '')::uuid;

    v_entidad_nombre := coalesce(v_target_nombre, v_reg);
    v_es_propietario_row := coalesce((v_fila ->> 'es_propietario')::boolean, false);

    if tg_op = 'INSERT' then
      v_tipo_evento := 'crear';
      if v_es_propietario_row then
        v_detalle := 'Registró al propietario «' || coalesce(v_entidad_nombre, 'usuario') || '»' ||
          case when v_perfil_nombre is not null then ' con perfil «' || v_perfil_nombre || '»' else '' end;
      else
        v_detalle := 'Incorporó a «' || coalesce(v_entidad_nombre, 'usuario') || '» al equipo' ||
          case when v_perfil_nombre is not null then ' con perfil «' || v_perfil_nombre || '»' else '' end;
      end if;
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó la membresía de «' || coalesce(v_entidad_nombre, 'usuario') || '»';
    else
      if v_old_estado is distinct from v_new_estado and v_new_estado = 'desactivada' then
        v_tipo_evento := 'suspender';
        v_detalle := 'Suspendió el acceso de «' || coalesce(v_entidad_nombre, 'usuario') || '» en la empresa';
      elsif v_old_estado is distinct from v_new_estado and v_new_estado = 'activa' then
        v_tipo_evento := 'reactivar';
        v_detalle := 'Reactivó el acceso de «' || coalesce(v_entidad_nombre, 'usuario') || '» en la empresa';
      elsif v_old_estado is distinct from v_new_estado and v_new_estado = 'desvinculada' then
        v_tipo_evento := 'desvincular';
        v_detalle := 'Desvinculó a «' || coalesce(v_entidad_nombre, 'usuario') || '» de la empresa';
      else
        v_tipo_evento := 'editar';
        v_detalle := 'Actualizó perfil o accesos de «' || coalesce(v_entidad_nombre, 'usuario') || '»';
      end if;
    end if;

  elsif tg_table_name = 'invitaciones' then
    if coalesce(v_fila ->> 'tipo', '') = 'cuenta_existente' then
      v_target_nombre := coalesce(
        nullif(btrim(v_fila -> 'datos_enmascarados' ->> 'nombre'), ''),
        nullif(btrim(v_fila ->> 'nombres'), ''),
        'Cuenta existente'
      );
    else
      v_target_nombre := coalesce(
        nullif(btrim(concat_ws(' ', v_fila ->> 'nombres', v_fila ->> 'apellidos')), ''),
        nullif(btrim(v_fila ->> 'correo'), ''),
        nullif(btrim(v_fila ->> 'celular'), ''),
        'Persona invitada'
      );
    end if;

    v_entidad_nombre := coalesce(v_target_nombre, v_reg);

    if tg_op = 'INSERT' then
      -- Detectar reenvío en la misma transacción (reenviar_invitacion_empresa anula la anterior antes de insertar)
      select exists (
        select 1
          from public.invitaciones i
         where i.empresa_id = v_emp
           and i.estado = 'anulada'
           and i.actualizado_en = now()
           and i.id <> nullif(v_new ->> 'id', '')::uuid
           and (
             (i.usuario_id is not null and i.usuario_id = nullif(v_new ->> 'usuario_id', '')::uuid)
             or (i.correo is not null and lower(btrim(i.correo)) = lower(btrim(coalesce(v_new ->> 'correo', ''))))
             or (
               i.tipo_documento is not null
               and i.tipo_documento = (v_new ->> 'tipo_documento')
               and (
                 (
                   nullif(v_new_raw ->> 'numero_documento', '') is not null
                   and upper(btrim(coalesce(i.numero_documento, ''))) = upper(btrim(v_new_raw ->> 'numero_documento'))
                 )
                 or (
                   coalesce(i.datos_enmascarados ->> 'documento', '') <> ''
                   and i.datos_enmascarados ->> 'documento' = v_new -> 'datos_enmascarados' ->> 'documento'
                 )
               )
             )
           )
      ) into v_es_reenvio;

      if v_es_reenvio then
        v_tipo_evento := 'reenviar';
        v_detalle := 'Reenvió invitación a ' || v_entidad_nombre ||
          case when v_perfil_nombre is not null then ' con perfil «' || v_perfil_nombre || '»' else '' end;
      else
        v_tipo_evento := 'invitar';
        v_detalle := 'Envió invitación a ' || v_entidad_nombre ||
          case when v_perfil_nombre is not null then ' con perfil «' || v_perfil_nombre || '»' else '' end;
      end if;
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó la invitación de ' || v_entidad_nombre;
    else
      if v_old_estado is distinct from v_new_estado and v_new_estado in ('aceptada', 'usada') then
        v_tipo_evento := 'aceptar';
        v_detalle := 'Aceptó la invitación (' || v_entidad_nombre || ')';
      elsif v_old_estado is distinct from v_new_estado and v_new_estado = 'rechazada' then
        v_tipo_evento := 'rechazar';
        v_detalle := 'Rechazó la invitación (' || v_entidad_nombre || ')';
      elsif v_old_estado is distinct from v_new_estado and v_new_estado = 'anulada' then
        v_tipo_evento := 'anular';
        v_detalle := 'Anuló la invitación de ' || v_entidad_nombre;
      elsif v_old_estado is distinct from v_new_estado and v_new_estado = 'vencida' then
        v_tipo_evento := 'vencer';
        v_detalle := 'Marcó como vencida la invitación de ' || v_entidad_nombre;
      else
        v_tipo_evento := 'editar';
        v_detalle := 'Actualizó los datos o permisos de la invitación de ' || v_entidad_nombre;
      end if;
    end if;

  elsif tg_table_name = 'solicitudes_salida' then
    select coalesce(
             nullif(btrim(u.nombre), ''),
             nullif(btrim(concat_ws(' ', u.nombres, u.apellidos)), ''),
             nullif(btrim(u.correo), '')
           )
      into v_target_nombre
      from public.usuarios u
     where u.id = nullif(v_fila ->> 'usuario_id', '')::uuid;

    v_entidad_nombre := coalesce(v_target_nombre, v_reg);

    if tg_op = 'INSERT' then
      v_tipo_evento := 'solicitar';
      v_detalle := '«' || coalesce(v_entidad_nombre, 'Usuario') || '» solicitó salir de la empresa';
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó la solicitud de salida de «' || coalesce(v_entidad_nombre, 'Usuario') || '»';
    else
      if v_old_estado is distinct from v_new_estado and v_new_estado = 'aprobada' then
        v_tipo_evento := 'aprobar';
        v_detalle := 'Aprobó la solicitud de salida de «' || coalesce(v_entidad_nombre, 'Usuario') || '»';
      elsif v_old_estado is distinct from v_new_estado and v_new_estado = 'rechazada' then
        v_tipo_evento := 'rechazar';
        v_detalle := 'Rechazó la solicitud de salida de «' || coalesce(v_entidad_nombre, 'Usuario') || '»';
      else
        v_tipo_evento := 'editar';
        v_detalle := 'Actualizó la solicitud de salida de «' || coalesce(v_entidad_nombre, 'Usuario') || '»';
      end if;
    end if;

  elsif tg_table_name = 'perfiles' then
    v_entidad_nombre := coalesce(nullif(btrim(v_fila ->> 'nombre'), ''), nullif(btrim(v_fila ->> 'codigo'), ''), v_reg);
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Creó el perfil «' || v_entidad_nombre || '»'
      when 'UPDATE' then 'Actualizó el perfil «' || v_entidad_nombre || '»'
      else 'Eliminó el perfil «' || v_entidad_nombre || '»'
    end;

  elsif tg_table_name = 'perfil_permisos' then
    v_entidad_nombre := coalesce(
      nullif(concat_ws(' · ', nullif(v_perfil_nombre, ''), nullif(v_fila ->> 'permiso_codigo', '')), ''),
      v_reg
    );
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Asignó el permiso «' || coalesce(v_fila ->> 'permiso_codigo', '') || '»' ||
        case when v_perfil_nombre is not null then ' al perfil «' || v_perfil_nombre || '»' else '' end
      when 'UPDATE' then 'Modificó el permiso «' || coalesce(v_fila ->> 'permiso_codigo', '') || '»' ||
        case when v_perfil_nombre is not null then ' en el perfil «' || v_perfil_nombre || '»' else '' end
      else 'Quitó el permiso «' || coalesce(v_fila ->> 'permiso_codigo', '') || '»' ||
        case when v_perfil_nombre is not null then ' del perfil «' || v_perfil_nombre || '»' else '' end
    end;

  elsif tg_table_name = 'empresas' then
    v_entidad_nombre := coalesce(
      nullif(btrim(v_fila ->> 'nombre_comercial'), ''),
      nullif(btrim(v_fila ->> 'razon_social'), ''),
      v_reg
    );
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Registró la empresa «' || v_entidad_nombre || '»'
      when 'UPDATE' then 'Actualizó datos de la empresa «' || v_entidad_nombre || '»'
      else 'Eliminó la empresa «' || v_entidad_nombre || '»'
    end;

  elsif tg_table_name = 'empresa_configuracion' then
    select coalesce(nullif(btrim(e.nombre_comercial), ''), nullif(btrim(e.razon_social), ''))
      into v_target_nombre
      from public.empresas e
     where e.id = v_emp;

    v_entidad_nombre := coalesce(v_target_nombre, 'Configuración general');
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Inicializó la configuración general de la empresa'
      when 'UPDATE' then 'Actualizó la configuración general de la empresa'
      else 'Eliminó la configuración general de la empresa'
    end;

  elsif tg_table_name = 'cuentas' then
    v_entidad_nombre := coalesce(nullif(btrim(v_fila ->> 'nombre'), ''), v_reg);
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Registró la cuenta de facturación «' || v_entidad_nombre || '»'
      when 'UPDATE' then 'Actualizó la cuenta de facturación «' || v_entidad_nombre || '»'
      else 'Eliminó la cuenta de facturación «' || v_entidad_nombre || '»'
    end;

  elsif tg_table_name = 'suscripciones' then
    select p.nombre
      into v_plan_nombre
      from public.planes p
     where p.id = nullif(v_fila ->> 'plan_id', '')::uuid;

    v_entidad_nombre := coalesce(
      nullif(
        concat_ws(
          ' ',
          coalesce(v_plan_nombre, 'Plan'),
          case when nullif(v_fila ->> 'periodo', '') is not null then '(' || (v_fila ->> 'periodo') || ')' end
        ),
        ''
      ),
      v_reg
    );

    if tg_op = 'INSERT' then
      v_tipo_evento := 'crear';
      v_detalle := 'Activó la suscripción al plan «' || v_entidad_nombre || '»';
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó la suscripción al plan «' || v_entidad_nombre || '»';
    else
      if v_old_estado is distinct from v_new_estado and v_new_estado = 'suspendida' then
        v_tipo_evento := 'suspender';
        v_detalle := 'Suspendió la suscripción al plan «' || v_entidad_nombre || '»';
      elsif v_old_estado = 'suspendida' and v_new_estado = 'activa' then
        v_tipo_evento := 'reactivar';
        v_detalle := 'Reactivó la suscripción al plan «' || v_entidad_nombre || '»';
      elsif v_old_estado is distinct from v_new_estado and v_new_estado = 'cancelada' then
        v_tipo_evento := 'anular';
        v_detalle := 'Canceló la suscripción al plan «' || v_entidad_nombre || '»';
      else
        v_tipo_evento := 'editar';
        v_detalle := 'Actualizó la suscripción al plan «' || v_entidad_nombre || '»';
      end if;
    end if;

  elsif tg_table_name = 'usuarios' then
    v_entidad_nombre := coalesce(
      nullif(btrim(v_fila ->> 'nombre'), ''),
      nullif(btrim(concat_ws(' ', v_fila ->> 'nombres', v_fila ->> 'apellidos')), ''),
      nullif(btrim(v_fila ->> 'correo'), ''),
      v_reg
    );
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Registró al usuario «' || v_entidad_nombre || '»'
      when 'UPDATE' then 'Actualizó los datos del usuario «' || v_entidad_nombre || '»'
      else 'Eliminó al usuario «' || v_entidad_nombre || '»'
    end;

  elsif tg_table_name = 'casos_soporte' then
    if nullif(v_fila ->> 'usuario_id', '') is not null then
      select coalesce(
               nullif(btrim(u.nombre), ''),
               nullif(btrim(concat_ws(' ', u.nombres, u.apellidos)), ''),
               nullif(btrim(u.correo), '')
             )
        into v_target_nombre
        from public.usuarios u
       where u.id = nullif(v_fila ->> 'usuario_id', '')::uuid;
    end if;

    v_entidad_nombre := coalesce(v_target_nombre, nullif(btrim(v_fila ->> 'correo_contacto'), ''), 'Caso de soporte');
    if tg_op = 'INSERT' then
      v_tipo_evento := 'solicitar';
      v_detalle := 'Registró caso de soporte para ' || v_entidad_nombre;
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó caso de soporte de ' || v_entidad_nombre;
    else
      v_tipo_evento := 'editar';
      v_detalle := 'Actualizó caso de soporte de ' || v_entidad_nombre;
    end if;

  elsif tg_table_name = 'clientes' then
    v_entidad_nombre := coalesce(nullif(btrim(v_fila ->> 'nombre_completo'), ''), v_reg);
    if tg_op = 'INSERT' then
      v_tipo_evento := 'crear';
      v_detalle := 'Registró al cliente «' || v_entidad_nombre || '»';
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó al cliente «' || v_entidad_nombre || '»';
    else
      if coalesce((v_old ->> 'activo')::boolean, true) = true
         and coalesce((v_new ->> 'activo')::boolean, true) = false then
        v_tipo_evento := 'suspender';
        v_detalle := 'Desactivó al cliente «' || v_entidad_nombre || '»';
      elsif coalesce((v_old ->> 'activo')::boolean, false) = false
         and coalesce((v_new ->> 'activo')::boolean, false) = true then
        v_tipo_evento := 'reactivar';
        v_detalle := 'Reactivó al cliente «' || v_entidad_nombre || '»';
      else
        v_tipo_evento := 'editar';
        v_detalle := 'Actualizó datos del cliente «' || v_entidad_nombre || '»';
      end if;
    end if;

  elsif tg_table_name = 'ordenes_trabajo' then
    v_entidad_nombre := coalesce(
      nullif(concat_ws(' · ', nullif(btrim(v_fila ->> 'codigo'), ''), nullif(btrim(v_fila ->> 'titulo'), '')), ''),
      v_reg
    );
    if tg_op = 'INSERT' then
      v_tipo_evento := 'crear';
      v_detalle := 'Creó la orden de trabajo «' || v_entidad_nombre || '»';
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó la orden de trabajo «' || v_entidad_nombre || '»';
    else
      if v_old_estado is distinct from v_new_estado and v_new_estado = 'cancelada' then
        v_tipo_evento := 'anular';
        v_detalle := 'Canceló la orden de trabajo «' || v_entidad_nombre || '»';
      elsif v_old_validacion is distinct from v_new_validacion and v_new_validacion = 'aprobado' then
        v_tipo_evento := 'aprobar';
        v_detalle := 'Aprobó la validación de la orden «' || v_entidad_nombre || '»';
      elsif v_old_validacion is distinct from v_new_validacion and v_new_validacion = 'observado' then
        v_tipo_evento := 'rechazar';
        v_detalle := 'Observó la validación de la orden «' || v_entidad_nombre || '»';
      else
        v_tipo_evento := 'editar';
        v_detalle := 'Actualizó la orden de trabajo «' || v_entidad_nombre || '»';
      end if;
    end if;

  elsif tg_table_name = 'plantillas_formulario' then
    v_entidad_nombre := coalesce(nullif(btrim(v_fila ->> 'nombre'), ''), nullif(btrim(v_fila ->> 'codigo'), ''), v_reg);
    if tg_op = 'INSERT' then
      v_tipo_evento := 'crear';
      v_detalle := 'Creó la plantilla de formulario «' || v_entidad_nombre || '»';
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó la plantilla de formulario «' || v_entidad_nombre || '»';
    else
      if coalesce((v_old ->> 'activa')::boolean, true) = true
         and coalesce((v_new ->> 'activa')::boolean, true) = false then
        v_tipo_evento := 'suspender';
        v_detalle := 'Desactivó la plantilla de formulario «' || v_entidad_nombre || '»';
      elsif coalesce((v_old ->> 'activa')::boolean, false) = false
         and coalesce((v_new ->> 'activa')::boolean, false) = true then
        v_tipo_evento := 'reactivar';
        v_detalle := 'Reactivó la plantilla de formulario «' || v_entidad_nombre || '»';
      else
        v_tipo_evento := 'editar';
        v_detalle := 'Actualizó la plantilla de formulario «' || v_entidad_nombre || '»';
      end if;
    end if;

  elsif tg_table_name = 'respuestas_formulario' then
    select ot.codigo
      into v_orden_codigo
      from public.ordenes_trabajo ot
     where ot.id = nullif(v_fila ->> 'orden_trabajo_id', '')::uuid;

    v_entidad_nombre := 'Formulario ' || coalesce(v_orden_codigo, v_fila ->> 'orden_trabajo_id', v_reg);
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Registró respuesta de formulario en orden ' || coalesce(v_orden_codigo, v_reg)
      when 'UPDATE' then 'Actualizó respuesta de formulario en orden ' || coalesce(v_orden_codigo, v_reg)
      else 'Eliminó respuesta de formulario en orden ' || coalesce(v_orden_codigo, v_reg)
    end;

  elsif tg_table_name = 'evidencias_orden' then
    select ot.codigo
      into v_orden_codigo
      from public.ordenes_trabajo ot
     where ot.id = nullif(v_fila ->> 'orden_trabajo_id', '')::uuid;

    v_entidad_nombre := coalesce(
      nullif(concat_ws(' · ', coalesce(v_orden_codigo, v_fila ->> 'orden_trabajo_id'), nullif(v_fila ->> 'tipo', '')), ''),
      v_reg
    );
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Adjuntó evidencia (' || coalesce(v_fila ->> 'tipo', 'archivo') || ') en orden ' || coalesce(v_orden_codigo, v_reg)
      when 'UPDATE' then 'Actualizó evidencia (' || coalesce(v_fila ->> 'tipo', 'archivo') || ') en orden ' || coalesce(v_orden_codigo, v_reg)
      else 'Eliminó evidencia (' || coalesce(v_fila ->> 'tipo', 'archivo') || ') en orden ' || coalesce(v_orden_codigo, v_reg)
    end;

  elsif tg_table_name = 'registros_tiempo' then
    select coalesce(
             nullif(btrim(u.nombre), ''),
             nullif(btrim(concat_ws(' ', u.nombres, u.apellidos)), ''),
             nullif(btrim(u.correo), '')
           )
      into v_target_nombre
      from public.usuarios u
     where u.id = nullif(v_fila ->> 'usuario_id', '')::uuid;

    v_entidad_nombre := coalesce(
      nullif(concat_ws(' · ', coalesce(v_target_nombre, 'Técnico'), nullif(v_fila ->> 'tipo', '')), ''),
      v_reg
    );
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Inició registro de tiempo (' || coalesce(v_fila ->> 'tipo', 'general') || ')'
      when 'UPDATE' then
        case when nullif(v_old ->> 'finalizado_en', '') is null and nullif(v_new ->> 'finalizado_en', '') is not null
             then 'Finalizó registro de tiempo (' || coalesce(v_fila ->> 'tipo', 'general') || ')'
             else 'Actualizó registro de tiempo (' || coalesce(v_fila ->> 'tipo', 'general') || ')'
        end
      else 'Eliminó registro de tiempo (' || coalesce(v_fila ->> 'tipo', 'general') || ')'
    end;

  elsif tg_table_name = 'verificaciones' then
    v_entidad_nombre := coalesce(
      nullif(concat_ws(' · ', nullif(v_fila ->> 'canal', ''), nullif(v_fila ->> 'destino', '')), ''),
      v_reg
    );
    if tg_op = 'INSERT' then
      v_tipo_evento := 'solicitar';
      v_detalle := 'Solicitó verificación por ' || coalesce(v_fila ->> 'canal', 'canal');
    elsif tg_op = 'DELETE' then
      v_tipo_evento := 'borrar';
      v_detalle := 'Eliminó registro de verificación (' || coalesce(v_fila ->> 'canal', 'canal') || ')';
    elsif nullif(v_old ->> 'verificado_en', '') is null and nullif(v_new ->> 'verificado_en', '') is not null then
      v_tipo_evento := 'acceso';
      v_detalle := 'Verificó identidad por ' || coalesce(v_fila ->> 'canal', 'canal');
    else
      v_tipo_evento := 'editar';
      v_detalle := 'Actualizó verificación por ' || coalesce(v_fila ->> 'canal', 'canal');
    end if;

  else
    v_entidad_nombre := coalesce(
      nullif(btrim(v_fila ->> 'nombre'), ''),
      nullif(btrim(v_fila ->> 'codigo'), ''),
      nullif(btrim(v_fila ->> 'modulo_codigo'), ''),
      v_reg
    );
    v_tipo_evento := v_accion;
    v_detalle := case tg_op
      when 'INSERT' then 'Creó registro en ' || tg_table_name
      when 'UPDATE' then 'Actualizó registro en ' || tg_table_name
      else 'Eliminó registro en ' || tg_table_name
    end;
  end if;

  -- 9. Construir metadatos estructurados (objeto JSON garantizado)
  v_metadatos := jsonb_build_object('cambios', v_cambios);
  if v_perfil_nombre is not null then
    v_metadatos := v_metadatos || jsonb_build_object('perfil_nombre', v_perfil_nombre);
  end if;
  if v_perfil_prev_nombre is not null then
    v_metadatos := v_metadatos || jsonb_build_object('perfil_anterior_nombre', v_perfil_prev_nombre);
  end if;
  if v_orden_codigo is not null then
    v_metadatos := v_metadatos || jsonb_build_object('orden_codigo', v_orden_codigo);
  end if;
  if v_plan_nombre is not null then
    v_metadatos := v_metadatos || jsonb_build_object('plan_nombre', v_plan_nombre);
  end if;

  insert into public.auditoria (
    empresa_id,
    usuario_id,
    accion,
    tabla,
    registro_id,
    antes,
    despues,
    tipo_evento,
    origen,
    actor_nombre,
    actor_correo,
    entidad_nombre,
    campos_modificados,
    detalle,
    metadatos
  )
  values (
    v_emp,
    v_actor_id,
    v_accion,
    tg_table_name,
    v_reg,
    v_old,
    v_new,
    v_tipo_evento,
    v_origen,
    v_actor_nombre,
    v_actor_correo,
    v_entidad_nombre,
    v_changed_keys,
    v_detalle,
    v_metadatos
  );

  return coalesce(new, old);
end;
$$;

revoke execute on function public.auditar() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. Optimización sin ruido en guardar_perfil_empresa y copiar_perfiles_base
-- ---------------------------------------------------------------------
create or replace function public.copiar_perfiles_base(p_empresa_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  pl record;
  nuevo uuid;
begin
  perform set_config('app.omitir_auditoria_perfil_permisos', 'true', true);

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

  perform set_config('app.omitir_auditoria_perfil_permisos', 'false', true);
end;
$$;

revoke execute on function public.copiar_perfiles_base(uuid) from public, anon, authenticated;

create or replace function public.guardar_perfil_empresa(
  p_empresa_id uuid,
  p_profile_id uuid default null,
  p_nombre text default null,
  p_descripcion text default null,
  p_recomendado_para text default null,
  p_configuracion jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_nombre text := nullif(btrim(coalesce(p_nombre, '')), '');
  v_descripcion text := nullif(btrim(coalesce(p_descripcion, '')), '');
  v_recomendado text := nullif(btrim(coalesce(p_recomendado_para, '')), '');
  v_target_id uuid;
  v_es_base boolean;
  v_plan_id uuid;
  v_plan_nombre text := 'actual';
  v_plan_modulos text[];
  v_modulos_raw text[];
  v_modulos_validados text[];
  v_bloqueados text[];
  v_slug text;
  v_config_limpia jsonb;
  v_opciones jsonb;
  v_restricciones jsonb;
  v_scope text;
  v_desired_perms jsonb := '{}'::jsonb;
begin
  if auth.role() <> 'service_role' and not public.puede_gestionar_personas_empresa(p_empresa_id) then
    raise exception 'No tienes permisos para administrar perfiles en esta empresa.';
  end if;

  if v_nombre is null or char_length(v_nombre) < 2 then
    raise exception 'El nombre del perfil es obligatorio (mínimo 2 caracteres).';
  end if;

  -- Resolver plan contratado por la empresa
  select s.plan_id, pl.nombre
    into v_plan_id, v_plan_nombre
    from public.empresas e
    join public.suscripciones s on s.cuenta_id = e.cuenta_id
    join public.planes pl on pl.id = s.plan_id
   where e.id = p_empresa_id
   order by s.creado_en desc
   limit 1;

  if v_plan_id is not null then
    select coalesce(array_agg(pm.modulo_codigo), array[]::text[])
      into v_plan_modulos
      from public.plan_modulos pm
     where pm.plan_id = v_plan_id;
  else
    select coalesce(array_agg(m.codigo), array[]::text[])
      into v_plan_modulos
      from public.modulos m
     where m.codigo <> 'configuraciones';
  end if;

  -- Extraer módulos solicitados restringidos exclusivamente a los 19 códigos oficiales
  select coalesce(array_agg(distinct m.codigo order by m.codigo), array[]::text[])
    into v_modulos_raw
    from jsonb_array_elements_text(coalesce(p_configuracion -> 'modulos', '[]'::jsonb)) as t(code)
    join public.modulos m on m.codigo = btrim(t.code)
   where m.codigo <> 'configuraciones';

  -- Verificar si alguno no está cubierto por el plan de la empresa
  select coalesce(array_agg(m.nombre order by m.orden), array[]::text[])
    into v_bloqueados
    from unnest(v_modulos_raw) as req(code)
    join public.modulos m on m.codigo = req.code
   where not (req.code = any(v_plan_modulos));

  if array_length(v_bloqueados, 1) > 0 then
    raise exception 'Los siguientes módulos requieren un plan superior al plan %: %.',
      coalesce(v_plan_nombre, 'actual'),
      array_to_string(v_bloqueados, ', ');
  end if;

  -- Ordenar módulos validados conforme al orden canónico
  select coalesce(array_agg(m.codigo order by m.orden), array[]::text[])
    into v_modulos_validados
    from public.modulos m
   where m.codigo = any(v_modulos_raw)
     and m.codigo = any(v_plan_modulos);

  v_config_limpia := jsonb_set(
    coalesce(p_configuracion, '{}'::jsonb),
    '{modulos}',
    to_jsonb(v_modulos_validados),
    true
  );

  if p_profile_id is not null then
    select p.id, p.es_base
      into v_target_id, v_es_base
      from public.perfiles p
     where p.id = p_profile_id
       and p.empresa_id = p_empresa_id
     for update;

    if v_target_id is null then
      raise exception 'El perfil no existe o no pertenece a esta empresa.';
    end if;

    if v_es_base then
      raise exception 'Los perfiles estándar no se modifican directamente; duplícalo para personalizarlo.';
    end if;

    update public.perfiles
       set nombre           = v_nombre,
           descripcion      = v_descripcion,
           recomendado_para = v_recomendado,
           configuracion    = v_config_limpia
     where id = v_target_id;
  else
    v_slug := regexp_replace(
      lower(translate(v_nombre, 'áéíóúÁÉÍÓÚñÑ', 'aeiouAEIOUnN')),
      '[^a-z0-9]+',
      '_',
      'g'
    );
    v_slug := btrim(v_slug, '_');
    if v_slug = '' then
      v_slug := 'perfil';
    end if;
    v_slug := v_slug || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);

    insert into public.perfiles (
      empresa_id,
      codigo,
      nombre,
      descripcion,
      recomendado_para,
      configuracion,
      es_base,
      creado_por
    )
    values (
      p_empresa_id,
      v_slug,
      v_nombre,
      v_descripcion,
      v_recomendado,
      v_config_limpia,
      false,
      v_actor_id
    )
    returning id into v_target_id;
  end if;

  -- Calcular conjunto objetivo de permisos gestionados para sincronización por diferencias (sin ruido)
  select coalesce(jsonb_object_agg(pm.codigo, null::text), '{}'::jsonb)
    into v_desired_perms
    from unnest(v_modulos_validados) as req(code)
    join public.permisos pm on pm.codigo = req.code || '.ver';

  v_opciones := coalesce(v_config_limpia -> 'opciones', '{}'::jsonb);
  v_restricciones := coalesce(v_config_limpia -> 'restricciones', '{}'::jsonb);

  if coalesce((v_opciones ->> 've_precios_montos')::boolean, false) then
    v_desired_perms := v_desired_perms || jsonb_build_object('precios.ver', null);
  end if;

  if coalesce((v_opciones ->> 'valida_servicios')::boolean, false) then
    v_desired_perms := v_desired_perms || jsonb_build_object('servicios.validar', null);
  end if;

  if coalesce((v_config_limpia ->> 'descargar_archivos')::boolean, false)
     and 'reportes' = any(v_modulos_validados) then
    v_desired_perms := v_desired_perms || jsonb_build_object('datos.exportar', null);
  end if;

  if 'cotizaciones' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'ver_montos_cotizaciones', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      v_desired_perms := v_desired_perms || jsonb_build_object('cotizaciones.ver_montos', v_scope);
    end if;

    v_scope := coalesce(v_restricciones ->> 'editar_cotizaciones', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      v_desired_perms := v_desired_perms || jsonb_build_object('cotizaciones.editar', v_scope);
    end if;

    v_scope := coalesce(v_restricciones ->> 'eliminar_cotizaciones', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      v_desired_perms := v_desired_perms || jsonb_build_object('cotizaciones.eliminar', v_scope);
    end if;
  end if;

  if 'calendario' = any(v_modulos_validados) or 'trabajos' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'programar_reprogramar', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      v_desired_perms := v_desired_perms || jsonb_build_object('programacion.editar', v_scope);
      if v_scope in ('todas', 'equipo') then
        v_desired_perms := v_desired_perms || jsonb_build_object('ordenes.ver_todas', null);
      end if;
    end if;
  end if;

  if 'cobranzas' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'pagos_clientes', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      v_desired_perms := v_desired_perms || jsonb_build_object('pagos.registrar', v_scope);
    end if;
  end if;

  if 'rentabilidad' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'costeo_margenes', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      v_desired_perms := v_desired_perms || jsonb_build_object('costeo.ver', v_scope);
    end if;
  end if;

  if 'clientes' = any(v_modulos_validados) and (
    coalesce(v_restricciones ->> 'editar_cotizaciones', 'ninguna') <> 'ninguna'
    or coalesce(v_restricciones ->> 'programar_reprogramar', 'ninguna') <> 'ninguna'
    or coalesce((v_opciones ->> 'valida_servicios')::boolean, false)
  ) then
    v_desired_perms := v_desired_perms || jsonb_build_object('clientes.editar', null);
  end if;

  if p_profile_id is null then
    perform set_config('app.omitir_auditoria_perfil_permisos', 'true', true);
  end if;

  -- Eliminar únicamente permisos gestionados que ya no aplican
  delete from public.perfil_permisos pp
   where pp.perfil_id = v_target_id
     and (
       (pp.permiso_codigo like '%.ver' and pp.permiso_codigo not in ('usuarios.ver', 'auditoria.ver'))
       or pp.permiso_codigo in (
         'precios.ver',
         'servicios.validar',
         'programacion.editar',
         'ordenes.ver_todas',
         'clientes.editar',
         'pagos.registrar',
         'cotizaciones.ver_montos',
         'cotizaciones.editar',
         'cotizaciones.eliminar',
         'costeo.ver',
         'datos.exportar'
       )
     )
     and not (v_desired_perms ? pp.permiso_codigo);

  -- Insertar faltantes o actualizar únicamente si cambió el alcance
  insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
  select v_target_id, d.key, d.value
    from jsonb_each_text(v_desired_perms) as d(key, value)
    join public.permisos pm on pm.codigo = d.key
  on conflict (perfil_id, permiso_codigo) do update
     set alcance = excluded.alcance
   where public.perfil_permisos.alcance is distinct from excluded.alcance;

  if p_profile_id is null then
    perform set_config('app.omitir_auditoria_perfil_permisos', 'false', true);
  end if;

  return v_target_id;
end;
$$;

revoke all on function public.guardar_perfil_empresa(uuid, uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.guardar_perfil_empresa(uuid, uuid, text, text, text, jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- 8. Cobertura de triggers auditar() en tablas activas (23 auditadas;
--    intentos_ingreso y auditoria excluidas intencionalmente).
--    Usa to_regclass para verificar existencia previa de cada tabla
--    y evitar errores si algunas tablas de etapas posteriores no existen aún.
-- ---------------------------------------------------------------------
do $$
declare
  v_tabla text;
  v_tablas text[] := array[
    'planes',
    'modulos',
    'plan_modulos',
    'permisos',
    'staff_plataforma',
    'usuarios',
    'cuentas',
    'suscripciones',
    'empresas',
    'empresa_configuracion',
    'perfiles',
    'perfil_permisos',
    'membresias',
    'invitaciones',
    'solicitudes_salida',
    'casos_soporte',
    'clientes',
    'ordenes_trabajo',
    'plantillas_formulario',
    'respuestas_formulario',
    'evidencias_orden',
    'registros_tiempo',
    'verificaciones'
  ];
begin
  foreach v_tabla in array v_tablas loop
    if to_regclass(format('public.%I', v_tabla)) is not null then
      if not exists (
        select 1
          from pg_trigger t
          join pg_class c on c.oid = t.tgrelid
          join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public'
           and c.relname = v_tabla
           and t.tgname = 'auditar'
           and not t.tgisinternal
      ) then
        execute format(
          'create trigger auditar after insert or update or delete on public.%I for each row execute function public.auditar();',
          v_tabla
        );
      end if;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 9. Blindaje RLS e inmutabilidad de public.auditoria y cobertura FORCE RLS
-- ---------------------------------------------------------------------
alter table public.auditoria enable row level security;
alter table public.auditoria force row level security;

revoke all on table public.auditoria from public, anon;
revoke insert, update, delete, truncate on table public.auditoria from public, anon, authenticated, service_role;
grant select on table public.auditoria to authenticated, service_role;

drop policy if exists "ver auditoria de mi empresa" on public.auditoria;
create policy "ver auditoria de mi empresa"
  on public.auditoria
  for select
  to authenticated
  using (
    empresa_id is not null
    and (
      public.es_propietario_empresa(empresa_id)
      or public.tiene_permiso(empresa_id, 'auditoria.ver')
    )
  );

drop policy if exists "staff ve auditoria" on public.auditoria;
create policy "staff ve auditoria"
  on public.auditoria
  for select
  to authenticated
  using (public.es_staff('admin'));

-- Completar FORCE ROW LEVEL SECURITY en tablas Etapa 0 restantes (25/25)
do $$
declare
  v_tabla text;
  v_tablas text[] := array[
    'planes',
    'modulos',
    'plan_modulos',
    'permisos',
    'staff_plataforma',
    'cuentas',
    'suscripciones',
    'empresas',
    'empresa_configuracion',
    'intentos_ingreso'
  ];
begin
  foreach v_tabla in array v_tablas loop
    if to_regclass(format('public.%I', v_tabla)) is not null then
      execute format('alter table public.%I enable row level security;', v_tabla);
      execute format('alter table public.%I force row level security;', v_tabla);
    end if;
  end loop;
end $$;
