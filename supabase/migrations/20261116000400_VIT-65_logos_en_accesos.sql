-- =============================================================================
-- VIT-65: Exponer logo_ruta, icono_menu_ruta y color_marca en mis_accesos()
-- Permite mostrar el logo/ícono real de cada empresa en /accesos, selectores
-- web y app móvil sin consultas adicionales.
-- =============================================================================

begin;

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
        'logo_ruta', e.logo_ruta,
        'icono_menu_ruta', e.icono_menu_ruta,
        'color_marca', e.color_marca,
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
        'logo_ruta', e.logo_ruta,
        'icono_menu_ruta', e.icono_menu_ruta,
        'color_marca', e.color_marca,
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
        'empresa_logo_ruta', e.logo_ruta,
        'empresa_icono_menu_ruta', e.icono_menu_ruta,
        'empresa_color_marca', e.color_marca,
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

commit;
