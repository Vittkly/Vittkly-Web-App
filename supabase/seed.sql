-- =====================================================================
-- seed.sql · Datos de ejemplo locales/staging alineados a VIT-64 y VIT-65
--
-- SOLO para la base local y staging. Nunca se corre en producción:
--   supabase db reset --local  → borra la base local, aplica migraciones y corre este archivo.
--
-- Contraseña de todos los usuarios de prueba: Prueba123!
-- =====================================================================

-- ---------------------------------------------------------------------
-- PARTE 1 · Catálogos idempotentes (alineados con VIT-64)
-- ---------------------------------------------------------------------

insert into public.planes (codigo, nombre, usuarios_incluidos, orden) values
  ('inicia',  'Inicia',  2, 1),
  ('crece',   'Crece',   5, 2),
  ('empresa', 'Empresa', 15, 3)
on conflict (codigo) do nothing;

-- Garantizar módulos base y matriz 10 / 16 / 19 (VIT-64 ya los siembra, aquí es idempotente)
with plan_matrix(plan_codigo, modulo_codigo) as (
  values
    -- Plan Inicia (10)
    ('inicia','dashboard'),('inicia','calendario'),('inicia','clientes'),('inicia','cotizaciones'),
    ('inicia','inventario'),('inicia','trabajos'),('inicia','tiempo'),
    ('inicia','cobranzas'),('inicia','comprobantes'),('inicia','personal'),
    -- Plan Crece (16)
    ('crece','dashboard'),('crece','calendario'),('crece','clientes'),('crece','cotizaciones'),
    ('crece','inventario'),('crece','trabajos'),('crece','tiempo'),('crece','post_venta'),
    ('crece','cobranzas'),('crece','comprobantes'),('crece','liquidaciones'),('crece','rentabilidad'),
    ('crece','personal'),('crece','pagos_personal'),('crece','biblioteca_academia'),('crece','reportes'),
    -- Plan Empresa (19)
    ('empresa','dashboard'),('empresa','calendario'),('empresa','clientes'),('empresa','cotizaciones'),
    ('empresa','inventario'),('empresa','trabajos'),('empresa','tiempo'),('empresa','post_venta'),
    ('empresa','cobranzas'),('empresa','comprobantes'),('empresa','liquidaciones'),('empresa','caja_bancos'),
    ('empresa','rentabilidad'),('empresa','personal'),('empresa','pagos_personal'),('empresa','biblioteca_academia'),
    ('empresa','marketing'),('empresa','sitio_web_reservas'),('empresa','reportes')
)
insert into public.plan_modulos (plan_id, modulo_codigo)
select p.id, m.modulo_codigo
  from plan_matrix m
  join public.planes p on p.codigo = m.plan_codigo
  join public.modulos md on md.codigo = m.modulo_codigo
on conflict (plan_id, modulo_codigo) do nothing;

-- Perfiles base globales (sin duplicar 'gerente_comercial' ni existentes)
insert into public.perfiles (empresa_id, codigo, nombre, descripcion, es_base)
select null, v.codigo, v.nombre, v.descripcion, true
  from (values
    ('admin',        'Administrador',         'Ve y hace todo, incluida la configuración, las finanzas y los reportes.'),
    ('supervisor',   'Supervisor',            'Como Ventas, y además valida los servicios que cierran los técnicos.'),
    ('ventas',       'Ventas',                'Cotiza, atiende clientes, programa trabajos y hace seguimiento.'),
    ('coordinador',  'Coordinador de agenda', 'Arma la agenda y las rutas. No cotiza ni ve finanzas.'),
    ('contabilidad', 'Contabilidad',          'Cobranzas, comprobantes, rentabilidad y reportes, con el directorio de clientes.'),
    ('postventa',    'Atención al cliente',   'Seguimiento, encuestas y reclamos, con clientes y calendario.'),
    ('analista',     'Analista / Gerencia',   'Mira los resultados: reportes, finanzas y calendario. No cotiza ni configura.'),
    ('tecnico',      'Técnico',               'Ve la agenda y los trabajos, sin precios ni cobros.')
  ) as v(codigo, nombre, descripcion)
 where not exists (
   select 1 from public.perfiles p where p.empresa_id is null and p.codigo = v.codigo
 );

-- Administrador: todos los permisos canónicos (con alcance 'todas' cuando aplica)
insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
select p.id, x.codigo, case when x.con_alcance then 'todas' end
  from public.perfiles p
  cross join public.permisos x
 where p.empresa_id is null
   and p.codigo = 'admin'
on conflict (perfil_id, permiso_codigo) do nothing;

-- Resto de perfiles base con los módulos canónicos de VIT-64
with presets(perfil, modulo) as (
  values
    ('supervisor','dashboard'),('supervisor','calendario'),('supervisor','clientes'),('supervisor','inventario'),
    ('supervisor','trabajos'),('supervisor','tiempo'),('supervisor','post_venta'),('supervisor','personal'),
    ('supervisor','biblioteca_academia'),
    ('ventas','calendario'),('ventas','clientes'),('ventas','cotizaciones'),('ventas','trabajos'),
    ('ventas','post_venta'),('ventas','biblioteca_academia'),
    ('coordinador','dashboard'),('coordinador','calendario'),('coordinador','clientes'),('coordinador','inventario'),
    ('coordinador','trabajos'),('coordinador','tiempo'),('coordinador','post_venta'),('coordinador','personal'),
    ('coordinador','biblioteca_academia'),
    ('contabilidad','dashboard'),('contabilidad','clientes'),('contabilidad','cotizaciones'),
    ('contabilidad','cobranzas'),('contabilidad','comprobantes'),('contabilidad','liquidaciones'),
    ('contabilidad','caja_bancos'),('contabilidad','rentabilidad'),('contabilidad','pagos_personal'),('contabilidad','reportes'),
    ('postventa','calendario'),('postventa','clientes'),('postventa','trabajos'),
    ('postventa','post_venta'),('postventa','biblioteca_academia'),
    ('analista','dashboard'),('analista','calendario'),('analista','clientes'),('analista','cotizaciones'),
    ('analista','inventario'),('analista','trabajos'),('analista','tiempo'),('analista','cobranzas'),
    ('analista','comprobantes'),('analista','liquidaciones'),('analista','caja_bancos'),('analista','rentabilidad'),
    ('analista','reportes'),
    ('tecnico','calendario'),('tecnico','inventario'),('tecnico','trabajos'),('tecnico','tiempo'),
    ('tecnico','biblioteca_academia')
)
insert into public.perfil_permisos (perfil_id, permiso_codigo)
select p.id, a.modulo || '.ver'
  from presets a
  join public.perfiles p on p.empresa_id is null and p.codigo = a.perfil
  join public.permisos pm on pm.codigo = a.modulo || '.ver'
on conflict (perfil_id, permiso_codigo) do nothing;

insert into public.perfil_permisos (perfil_id, permiso_codigo)
select p.id, 'precios.ver'
  from public.perfiles p
  join public.permisos pm on pm.codigo = 'precios.ver'
 where p.empresa_id is null
   and p.codigo in ('supervisor','ventas','coordinador','contabilidad','postventa','analista','gerente_comercial')
on conflict (perfil_id, permiso_codigo) do nothing;

insert into public.perfil_permisos (perfil_id, permiso_codigo)
select p.id, 'servicios.validar'
  from public.perfiles p
  join public.permisos pm on pm.codigo = 'servicios.validar'
 where p.empresa_id is null
   and p.codigo = 'supervisor'
on conflict (perfil_id, permiso_codigo) do nothing;

-- Sincronizar perfiles.configuracion->'modulos' en plantillas globales desde perfil_permisos
update public.perfiles p
   set configuracion = jsonb_set(
         coalesce(p.configuracion, '{}'::jsonb),
         '{modulos}',
         coalesce(
           (
             select jsonb_agg(m.codigo order by m.orden)
               from public.perfil_permisos pp
               join public.permisos pm on pm.codigo = pp.permiso_codigo
               join public.modulos m on m.codigo = pm.modulo_codigo
              where pp.perfil_id = p.id
                and pp.permiso_codigo = m.codigo || '.ver'
                and coalesce(pp.alcance, 'todas') <> 'ninguna'
                and m.codigo <> 'configuraciones'
           ),
           '[]'::jsonb
         ),
         true
       )
 where p.empresa_id is null;

-- ---------------------------------------------------------------------
-- PARTE 2 · Usuarios, empresas y mutaciones reales auditadas (solo local/staging)
-- ---------------------------------------------------------------------
create or replace function pg_temp.crear_usuario_prueba(p_correo text, p_nombre text)
returns uuid
language plpgsql
as $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = p_correo limit 1;
  if uid is not null then
    return uid;
  end if;

  uid := gen_random_uuid();
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', p_correo,
          extensions.crypt('Prueba123!', extensions.gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', p_nombre), now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text,
          jsonb_build_object('sub', uid::text, 'email', p_correo, 'email_verified', true),
          'email', now(), now(), now());
  return uid;
end;
$$;

do $$
declare
  v_staff       uuid;
  v_vk          uuid;
  v_prueba      uuid;
  v_sup         uuid;
  v_tecnico     uuid;
  e_vk          uuid;
  e_prueba      uuid;
  v_custom_prof uuid;
  v_sup_mem_id  uuid;
  v_inv_id      uuid;
  v_cli_id      uuid;
  v_ot_id       uuid;
  u             uuid;
  r             record;
  v_aud_ids     bigint[];
begin
  -- Staff de Vittkly
  v_staff := pg_temp.crear_usuario_prueba('staff@vittkly.test', 'Staff Vittkly');
  insert into public.staff_plataforma (usuario_id, rol)
  values (v_staff, 'admin')
  on conflict (usuario_id) do nothing;

  -- Vitta Kleanly: su administrador crea la cuenta como en el registro real
  v_vk := pg_temp.crear_usuario_prueba('admin@vittakleanly.test', 'Administrador VK');
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_vk::text, true);

  select e.id into e_vk
    from public.empresas e
    join public.cuentas c on c.id = e.cuenta_id
   where c.propietario_id = v_vk
   limit 1;

  if e_vk is null then
    e_vk := public.crear_cuenta_y_empresa(
      'Vitta Kleanly SAC'::text,
      null::text,
      'empresa'::text,
      'Limpieza y mantenimiento'::text,
      'Lima'::text,
      'plan_propio'::text,
      'mensual'::text
    );
    update public.empresas
       set nombre_comercial = 'Vitta Kleanly', modelo_operacion = 'ambos'
     where id = e_vk;
  end if;

  -- Empresa Prueba: segunda empresa para aislar multi-tenant
  v_prueba := pg_temp.crear_usuario_prueba('admin@empresaprueba.test', 'Administrador Prueba');
  perform set_config('request.jwt.claim.sub', v_prueba::text, true);
  if not exists (
    select 1 from public.cuentas c where c.propietario_id = v_prueba and c.eliminado_en is null
  ) then
    e_prueba := public.crear_cuenta_y_empresa(
      'Empresa Prueba SAC'::text,
      null::text,
      'crece'::text,
      'Servicios generales'::text,
      'Lima'::text,
      'plan_propio'::text,
      'mensual'::text
    );
  end if;

  -- Miembros base de Vitta Kleanly bajo actor Administrador VK
  perform set_config('request.jwt.claim.sub', v_vk::text, true);
  for r in select id, codigo, nombre from public.perfiles where empresa_id = e_vk and codigo <> 'admin' loop
    u := pg_temp.crear_usuario_prueba(r.codigo || '@vittakleanly.test', r.nombre || ' VK');
    insert into public.membresias (empresa_id, usuario_id, perfil_id, acceso_web)
    values (e_vk, u, r.id, r.codigo <> 'tecnico')
    on conflict (empresa_id, usuario_id) do nothing;

    if r.codigo = 'supervisor' then
      v_sup := u;
    elsif r.codigo = 'tecnico' then
      v_tecnico := u;
    end if;
  end loop;

  -- Mutaciones reales para poblar auditoría detallada multi-módulo, multi-actor y multi-rango
  if not exists (
    select 1 from public.auditoria a where a.empresa_id = e_vk and a.origen = 'operaciones_ordenes'
  ) then
    -- 1. Configuración de empresa (Administrador VK)
    update public.empresa_configuracion
       set menu_acordeon = true
     where empresa_id = e_vk;

    -- 2. Crear y actualizar perfil personalizado (Administrador VK)
    v_custom_prof := public.guardar_perfil_empresa(
      e_vk,
      null,
      'Supervisor de Campo',
      'Supervisa trabajos en campo y valida cierres.',
      'Jefes de cuadrilla',
      '{"modulos":["dashboard","calendario","clientes","trabajos","tiempo"],"opciones":{"ve_precios_montos":false,"valida_servicios":true},"restricciones":{"programar_reprogramar":"equipo"},"descargar_archivos":false,"aprueba_solicitudes":true,"dispositivo_acceso":"cualquiera"}'::jsonb
    );

    perform public.guardar_perfil_empresa(
      e_vk,
      v_custom_prof,
      'Supervisor de Campo Senior',
      'Supervisa trabajos en campo, valida cierres y consulta inventario.',
      'Jefes de cuadrilla y operaciones',
      '{"modulos":["dashboard","calendario","clientes","inventario","trabajos","tiempo"],"opciones":{"ve_precios_montos":false,"valida_servicios":true},"restricciones":{"programar_reprogramar":"todas"},"descargar_archivos":false,"aprueba_solicitudes":true,"dispositivo_acceso":"cualquiera"}'::jsonb
    );

    -- 3. Suspender y reactivar membresía (Administrador VK)
    select m.id into v_sup_mem_id
      from public.membresias m
     where m.empresa_id = e_vk and m.usuario_id = v_tecnico
     limit 1;

    if v_sup_mem_id is not null then
      update public.membresias set estado = 'desactivada' where id = v_sup_mem_id;
      update public.membresias set estado = 'activa' where id = v_sup_mem_id;
    end if;

    -- 4. Crear y anular invitación (Administrador VK)
    insert into public.invitaciones (
      empresa_id, tipo, correo, nombres, apellidos, tipo_documento, numero_documento,
      perfil_id, acceso_web, acceso_app, codigo_hash, token_hash, creado_por
    ) values (
      e_vk, 'nueva_cuenta', 'nuevo.tecnico@vittakleanly.test', 'Mateo', 'Rojas', 'DNI', '71234567',
      (select id from public.perfiles where empresa_id = e_vk and codigo = 'tecnico' limit 1),
      false, true, public.hash_codigo('DEMO-INV-01'), public.hash_codigo('DEMO-TOK-01'), v_vk
    )
    returning id into v_inv_id;

    update public.invitaciones set estado = 'anulada' where id = v_inv_id;

    -- 5. Operaciones bajo segundo actor (Supervisor VK): cliente y orden de trabajo
    if v_sup is not null then
      perform set_config('request.jwt.claim.sub', v_sup::text, true);
    end if;

    insert into public.clientes (
      empresa_id, nombre_completo, tipo_persona, documento_tipo, documento_numero,
      telefono, correo, direccion, distrito, creado_por
    ) values (
      e_vk, 'Clínica San Pablo SAC', 'empresa', 'RUC', '20100099988',
      '+51999111222', 'mantenimiento@sanpablo.pe', 'Av. El Polo 789', 'Surco', coalesce(v_sup, v_vk)
    )
    returning id into v_cli_id;

    update public.clientes
       set distrito = 'Santiago de Surco', referencia = 'Torre B - Piso 2'
     where id = v_cli_id;

    insert into public.ordenes_trabajo (
      empresa_id, codigo, cliente_id, tecnico_id, tipo, titulo, descripcion,
      estado, fecha_programada, distrito, monto_total, creado_por
    ) values (
      e_vk, 'OT-0101', v_cli_id, v_tecnico, 'servicio',
      'Mantenimiento preventivo de climatización',
      'Limpieza de ductos y recarga de refrigerante.',
      'programada', current_date + 1, 'Santiago de Surco', 450.00, coalesce(v_sup, v_vk)
    )
    returning id into v_ot_id;

    update public.ordenes_trabajo
       set estado = 'en_curso', iniciado_en = now()
     where id = v_ot_id;

    -- Distribuir fechas en los eventos sembrados para probar filtros 1d / 7d / 15d / 30d / Sin límite
    select array_agg(id order by id asc)
      into v_aud_ids
      from public.auditoria
     where empresa_id = e_vk;

    if coalesce(array_length(v_aud_ids, 1), 0) >= 6 then
      update public.auditoria set creado_en = now() - interval '45 days' where id = v_aud_ids[1];
      update public.auditoria set creado_en = now() - interval '20 days' where id = v_aud_ids[2];
      update public.auditoria set creado_en = now() - interval '10 days' where id = v_aud_ids[3];
      update public.auditoria set creado_en = now() - interval '3 days'  where id = v_aud_ids[4];
      update public.auditoria set creado_en = now() - interval '6 hours' where id = v_aud_ids[5];
    end if;
  end if;

  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);
end;
$$;
