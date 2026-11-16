-- =====================================================================
-- Migración: 20261116000100_VIT-64_procesos_modulos_19.sql
-- Propósito: Estandarizar los 19 módulos granulares y 5 procesos visuales,
--            reasignar FKs de permisos heredados sin romper RLS/Mobile,
--            actualizar plan_modulos (Inicia 10 / Crece 16 / Empresa 19),
--            unificar perfiles.configuracion con public.perfil_permisos
--            mediante guardar_perfil_empresa() y mantener configuraciones
--            como módulo de sistema oculto para integridad referencial.
-- =====================================================================

-- 1. Upsert de los 19 módulos canónicos + módulo de sistema oculto 'configuraciones'
insert into public.modulos (codigo, nombre, grupo, modelo, etapa, disponible, orden) values
  -- Sin proceso (acceso directo en raíz del Sidebar)
  ('dashboard',           'Inicio',                'sin_grupo',     'comun',       1, true,  1),
  ('calendario',          'Calendario',            'sin_grupo',     'comun',       1, false, 2),
  -- Proceso: Ventas
  ('clientes',            'Clientes',              'ventas',        'comun',       1, false, 3),
  ('cotizaciones',        'Cotizaciones',          'ventas',        'visita',      1, false, 4),
  -- Proceso: Operación
  ('inventario',          'Inventario',            'operacion',     'comun',       2, false, 5),
  ('trabajos',            'Trabajos',              'operacion',     'comun',       1, false, 6),
  ('tiempo',              'Tiempo',                'operacion',     'comun',       2, false, 7),
  ('post_venta',          'Post venta',            'operacion',     'visita',      2, false, 8),
  -- Proceso: Finanzas
  ('cobranzas',           'Cobranzas',             'finanzas',      'comun',       1, false, 9),
  ('comprobantes',        'Comprobantes',          'finanzas',      'comun',       1, false, 10),
  ('liquidaciones',       'Liquidaciones',         'finanzas',      'comun',       1, false, 11),
  ('caja_bancos',         'Caja y bancos',         'finanzas',      'comun',       2, false, 12),
  ('rentabilidad',        'Rentabilidad',          'finanzas',      'comun',       2, false, 13),
  -- Proceso: Equipo
  ('personal',            'Personal',              'equipo',        'comun',       1, false, 14),
  ('pagos_personal',      'Pagos al personal',     'equipo',        'comun',       2, false, 15),
  ('biblioteca_academia', 'Biblioteca y Academia', 'equipo',        'comun',       2, false, 16),
  -- Proceso: Crecimiento
  ('marketing',           'Marketing',             'crecimiento',   'visita',      3, false, 17),
  ('sitio_web_reservas',  'Sitio web y reservas',  'crecimiento',   'visita',      3, false, 18),
  -- Sin proceso (acceso directo inferior en Sidebar)
  ('reportes',            'Reportes',              'reportes',      'comun',       2, false, 19),
  -- Módulo interno de sistema (no asignable en la grilla de 19 módulos; ancla FKs de permisos admin)
  ('configuraciones',     'Configuraciones',       'configuracion', 'comun',       0, true,  99)
on conflict (codigo) do update
   set nombre     = excluded.nombre,
       grupo      = excluded.grupo,
       modelo     = excluded.modelo,
       etapa      = excluded.etapa,
       disponible = excluded.disponible,
       orden      = excluded.orden;

-- 2. Permisos <modulo>.ver para los 19 módulos canónicos
insert into public.permisos (codigo, modulo_codigo, descripcion, con_alcance)
select m.codigo || '.ver', m.codigo, 'Entrar a ' || m.nombre, false
  from public.modulos m
 where m.codigo in (
   'dashboard','calendario','clientes','cotizaciones',
   'inventario','trabajos','tiempo','post_venta',
   'cobranzas','comprobantes','liquidaciones','caja_bancos','rentabilidad',
   'personal','pagos_personal','biblioteca_academia',
   'marketing','sitio_web_reservas','reportes'
 )
on conflict (codigo) do update
   set modulo_codigo = excluded.modulo_codigo,
       descripcion   = excluded.descripcion;

-- 3. Reasignar permisos de acción heredados hacia los módulos granulares
insert into public.permisos (codigo, modulo_codigo, descripcion, con_alcance) values
  ('configuracion.editar',    'configuraciones', 'Editar los datos y la configuración de la empresa', false),
  ('usuarios.ver',            'configuraciones', 'Ver a las personas de la empresa y sus perfiles', false),
  ('usuarios.editar',         'configuraciones', 'Invitar, cambiar perfiles y desactivar personas', false),
  ('auditoria.ver',           'configuraciones', 'Ver el historial de cambios', false),
  ('precios.ver',             'cotizaciones',    'Ver precios y cobros', false),
  ('cotizaciones.ver_montos', 'cotizaciones',    'Ver montos de cotizaciones', true),
  ('cotizaciones.editar',     'cotizaciones',    'Editar cotizaciones', true),
  ('cotizaciones.eliminar',   'cotizaciones',    'Enviar cotizaciones a la papelera', true),
  ('programacion.editar',     'calendario',      'Programar y reprogramar', true),
  ('servicios.validar',       'trabajos',        'Validar o devolver los servicios que cierran los técnicos', false),
  ('ordenes.ver_todas',       'trabajos',        'Ver todas las órdenes de trabajo de la empresa', false),
  ('clientes.editar',         'clientes',        'Crear y editar clientes', false),
  ('pagos.registrar',         'cobranzas',       'Ver y registrar pagos de clientes', true),
  ('datos.exportar',          'reportes',        'Descargar datos en Excel', false),
  ('costeo.ver',              'rentabilidad',    'Registrar costos y ver márgenes', true)
on conflict (codigo) do update
   set modulo_codigo = excluded.modulo_codigo,
       descripcion   = excluded.descripcion,
       con_alcance   = excluded.con_alcance;

-- 4. Migrar permisos de visualización (.ver) en perfiles existentes antes de limpiar obsoletos
-- 4.1 Desde códigos agrupados antiguos en perfil_permisos
with mapa_legacy(antiguo, nuevo) as (
  values
    ('calendario_trabajos.ver',    'calendario.ver'),
    ('calendario_trabajos.ver',    'trabajos.ver'),
    ('cobranzas_comprobantes.ver', 'cobranzas.ver'),
    ('cobranzas_comprobantes.ver', 'comprobantes.ver'),
    ('convenios.ver',              'liquidaciones.ver'),
    ('caja_bancos.ver',            'rentabilidad.ver'),
    ('biblioteca.ver',             'biblioteca_academia.ver'),
    ('academia.ver',               'biblioteca_academia.ver'),
    ('sitio_web.ver',              'sitio_web_reservas.ver')
)
insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
select distinct pp.perfil_id, m.nuevo, pp.alcance
  from public.perfil_permisos pp
  join mapa_legacy m on m.antiguo = pp.permiso_codigo
on conflict (perfil_id, permiso_codigo) do nothing;

-- 4.2 Desde perfiles.configuracion->'modulos' (para perfiles personalizados previos)
with json_modulos as (
  select p.id as perfil_id,
         lower(btrim(elem.val)) as codigo_raw
    from public.perfiles p
    cross join lateral jsonb_array_elements_text(coalesce(p.configuracion -> 'modulos', '[]'::jsonb)) as elem(val)
   where jsonb_typeof(p.configuracion -> 'modulos') = 'array'
),
json_normalizados as (
  select distinct perfil_id,
         case codigo_raw
           when 'calendario_trabajos' then 'calendario'
           when 'cobranzas_comprobantes' then 'cobranzas'
           when 'convenios' then 'liquidaciones'
           when 'postventa' then 'post_venta'
           when 'caja' then 'caja_bancos'
           when 'academia' then 'biblioteca_academia'
           when 'biblioteca' then 'biblioteca_academia'
           when 'sitio_web' then 'sitio_web_reservas'
           when 'sitio-web' then 'sitio_web_reservas'
           else codigo_raw
         end as codigo_canonico
    from json_modulos
  union
  select distinct perfil_id, 'trabajos'
    from json_modulos
   where codigo_raw = 'calendario_trabajos'
  union
  select distinct perfil_id, 'comprobantes'
    from json_modulos
   where codigo_raw in ('cobranzas_comprobantes', 'finanzas')
  union
  select distinct perfil_id, unnest(array['cobranzas', 'liquidaciones', 'caja_bancos', 'rentabilidad'])
    from json_modulos
   where codigo_raw = 'finanzas'
)
insert into public.perfil_permisos (perfil_id, permiso_codigo)
select j.perfil_id, j.codigo_canonico || '.ver'
  from json_normalizados j
  join public.permisos pm on pm.codigo = j.codigo_canonico || '.ver'
  join public.modulos md on md.codigo = pm.modulo_codigo and md.codigo <> 'configuraciones'
on conflict (perfil_id, permiso_codigo) do nothing;

-- 4.3 Normalizar los módulos canónicos en perfiles base (globales y ya clonados con es_base = true)
-- Plantilla Gerente Comercial global si aún no existiera en empresa_id IS NULL
insert into public.perfiles (empresa_id, codigo, nombre, descripcion, recomendado_para, es_base)
select null,
       'gerente_comercial',
       'Gerente Comercial',
       'Lidera el equipo de ventas, aprueba descuentos, revisa márgenes y gestiona el embudo comercial.',
       'Jefes de ventas y gerentes comerciales',
       true
 where not exists (
   select 1 from public.perfiles where empresa_id is null and lower(codigo) = 'gerente_comercial'
 );

with base_profiles as (
  select p.id
    from public.perfiles p
   where p.es_base = true
)
delete from public.perfil_permisos pp
 using base_profiles bp
 where pp.perfil_id = bp.id
   and pp.permiso_codigo like '%.ver'
   and pp.permiso_codigo not in ('precios.ver', 'usuarios.ver', 'auditoria.ver', 'costeo.ver');

with presets(perfil_key, modulo) as (
  values
    ('admin','dashboard'),('admin','calendario'),('admin','clientes'),('admin','cotizaciones'),
    ('admin','inventario'),('admin','trabajos'),('admin','tiempo'),('admin','post_venta'),
    ('admin','cobranzas'),('admin','comprobantes'),('admin','liquidaciones'),('admin','caja_bancos'),
    ('admin','rentabilidad'),('admin','personal'),('admin','pagos_personal'),('admin','biblioteca_academia'),
    ('admin','marketing'),('admin','sitio_web_reservas'),('admin','reportes'),
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
    ('tecnico','biblioteca_academia'),
    ('gerente_comercial','dashboard'),('gerente_comercial','calendario'),('gerente_comercial','clientes'),
    ('gerente_comercial','cotizaciones'),('gerente_comercial','trabajos'),('gerente_comercial','post_venta'),
    ('gerente_comercial','marketing'),('gerente_comercial','sitio_web_reservas'),('gerente_comercial','reportes')
),
base_profiles as (
  select p.id,
         case
           when lower(coalesce(p.codigo, '')) in ('admin', 'administrador') then 'admin'
           when lower(coalesce(p.codigo, '')) in ('coordinador', 'coordinador_agenda') then 'coordinador'
           when lower(coalesce(p.codigo, '')) in ('postventa', 'atencion_cliente') then 'postventa'
           when lower(coalesce(p.codigo, '')) in ('analista', 'analista_gerencia') then 'analista'
           else lower(coalesce(p.codigo, ''))
         end as perfil_key
    from public.perfiles p
   where p.es_base = true
)
insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
select bp.id,
       pr.modulo || '.ver',
       case when bp.perfil_key = 'admin' then 'todas' else null end
  from base_profiles bp
  join presets pr on pr.perfil_key = bp.perfil_key
on conflict (perfil_id, permiso_codigo) do nothing;

-- Garantizar permisos administrativos y de acción para base 'admin' (solo catálogo oficial)
insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
select p.id, pm.codigo, case when pm.con_alcance then 'todas' else null end
  from public.perfiles p
  cross join public.permisos pm
 where p.es_base = true
   and lower(coalesce(p.codigo, '')) in ('admin', 'administrador')
   and pm.codigo in (
     'dashboard.ver','calendario.ver','clientes.ver','cotizaciones.ver',
     'inventario.ver','trabajos.ver','tiempo.ver','post_venta.ver',
     'cobranzas.ver','comprobantes.ver','liquidaciones.ver','caja_bancos.ver','rentabilidad.ver',
     'personal.ver','pagos_personal.ver','biblioteca_academia.ver',
     'marketing.ver','sitio_web_reservas.ver','reportes.ver',
     'configuracion.editar','usuarios.ver','usuarios.editar','auditoria.ver',
     'precios.ver','cotizaciones.ver_montos','cotizaciones.editar','cotizaciones.eliminar',
     'programacion.editar','servicios.validar','ordenes.ver_todas','clientes.editar',
     'pagos.registrar','datos.exportar','costeo.ver'
   )
on conflict (perfil_id, permiso_codigo) do nothing;

-- 5. Eliminar permisos, plan_modulos y módulos obsoletos en orden seguro de FKs
delete from public.perfil_permisos pp
 where pp.permiso_codigo not in (
   'dashboard.ver','calendario.ver','clientes.ver','cotizaciones.ver',
   'inventario.ver','trabajos.ver','tiempo.ver','post_venta.ver',
   'cobranzas.ver','comprobantes.ver','liquidaciones.ver','caja_bancos.ver','rentabilidad.ver',
   'personal.ver','pagos_personal.ver','biblioteca_academia.ver',
   'marketing.ver','sitio_web_reservas.ver','reportes.ver',
   'configuracion.editar','usuarios.ver','usuarios.editar','auditoria.ver',
   'precios.ver','cotizaciones.ver_montos','cotizaciones.editar','cotizaciones.eliminar',
   'programacion.editar','servicios.validar','ordenes.ver_todas','clientes.editar',
   'pagos.registrar','datos.exportar','costeo.ver'
 );

delete from public.permisos pm
 where pm.codigo not in (
   'dashboard.ver','calendario.ver','clientes.ver','cotizaciones.ver',
   'inventario.ver','trabajos.ver','tiempo.ver','post_venta.ver',
   'cobranzas.ver','comprobantes.ver','liquidaciones.ver','caja_bancos.ver','rentabilidad.ver',
   'personal.ver','pagos_personal.ver','biblioteca_academia.ver',
   'marketing.ver','sitio_web_reservas.ver','reportes.ver',
   'configuracion.editar','usuarios.ver','usuarios.editar','auditoria.ver',
   'precios.ver','cotizaciones.ver_montos','cotizaciones.editar','cotizaciones.eliminar',
   'programacion.editar','servicios.validar','ordenes.ver_todas','clientes.editar',
   'pagos.registrar','datos.exportar','costeo.ver'
 );

-- 6. Reconstruir public.plan_modulos con la matriz exacta 10 / 16 / 19
delete from public.plan_modulos;

with plan_matrix(plan_codigo, modulo_codigo) as (
  values
    -- Plan Inicia (10)
    ('inicia','dashboard'),('inicia','calendario'),('inicia','clientes'),('inicia','cotizaciones'),
    ('inicia','inventario'),('inicia','trabajos'),('inicia','tiempo'),
    ('inicia','cobranzas'),('inicia','comprobantes'),('inicia','personal'),
    -- Plan Crece (16 = Inicia + 6)
    ('crece','dashboard'),('crece','calendario'),('crece','clientes'),('crece','cotizaciones'),
    ('crece','inventario'),('crece','trabajos'),('crece','tiempo'),('crece','post_venta'),
    ('crece','cobranzas'),('crece','comprobantes'),('crece','liquidaciones'),('crece','rentabilidad'),
    ('crece','personal'),('crece','pagos_personal'),('crece','biblioteca_academia'),('crece','reportes'),
    -- Plan Empresa (19 = Crece + 3)
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
on conflict (plan_id, modulo_codigo) do nothing;

-- Limpiar filas obsoletas de public.modulos
delete from public.modulos
 where codigo not in (
   'dashboard','calendario','clientes','cotizaciones',
   'inventario','trabajos','tiempo','post_venta',
   'cobranzas','comprobantes','liquidaciones','caja_bancos','rentabilidad',
   'personal','pagos_personal','biblioteca_academia',
   'marketing','sitio_web_reservas','reportes','configuraciones'
 );

-- 7. Sincronizar perfiles.configuracion->'modulos' en todos los perfiles con sus filas reales en perfil_permisos
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
       );

-- 8. RPC atómica para crear/editar perfiles sincronizando configuracion y perfil_permisos
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

  -- Sincronización atómica de perfil_permisos
  delete from public.perfil_permisos
   where perfil_id = v_target_id
     and (
       (permiso_codigo like '%.ver' and permiso_codigo not in ('usuarios.ver', 'auditoria.ver'))
       or permiso_codigo in (
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
     );

  -- 1) Permisos de entrada por módulo (<modulo>.ver)
  insert into public.perfil_permisos (perfil_id, permiso_codigo)
  select v_target_id, req.code || '.ver'
    from unnest(v_modulos_validados) as req(code)
    join public.permisos pm on pm.codigo = req.code || '.ver'
  on conflict (perfil_id, permiso_codigo) do nothing;

  -- 2) Capacidades y restricciones granulares
  v_opciones := coalesce(v_config_limpia -> 'opciones', '{}'::jsonb);
  v_restricciones := coalesce(v_config_limpia -> 'restricciones', '{}'::jsonb);

  if coalesce((v_opciones ->> 've_precios_montos')::boolean, false) then
    insert into public.perfil_permisos (perfil_id, permiso_codigo)
    values (v_target_id, 'precios.ver')
    on conflict (perfil_id, permiso_codigo) do nothing;
  end if;

  if coalesce((v_opciones ->> 'valida_servicios')::boolean, false) then
    insert into public.perfil_permisos (perfil_id, permiso_codigo)
    values (v_target_id, 'servicios.validar')
    on conflict (perfil_id, permiso_codigo) do nothing;
  end if;

  if coalesce((v_config_limpia ->> 'descargar_archivos')::boolean, false)
     and 'reportes' = any(v_modulos_validados) then
    insert into public.perfil_permisos (perfil_id, permiso_codigo)
    values (v_target_id, 'datos.exportar')
    on conflict (perfil_id, permiso_codigo) do nothing;
  end if;

  if 'cotizaciones' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'ver_montos_cotizaciones', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
      values (v_target_id, 'cotizaciones.ver_montos', v_scope)
      on conflict (perfil_id, permiso_codigo) do update set alcance = excluded.alcance;
    end if;

    v_scope := coalesce(v_restricciones ->> 'editar_cotizaciones', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
      values (v_target_id, 'cotizaciones.editar', v_scope)
      on conflict (perfil_id, permiso_codigo) do update set alcance = excluded.alcance;
    end if;

    v_scope := coalesce(v_restricciones ->> 'eliminar_cotizaciones', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
      values (v_target_id, 'cotizaciones.eliminar', v_scope)
      on conflict (perfil_id, permiso_codigo) do update set alcance = excluded.alcance;
    end if;
  end if;

  if 'calendario' = any(v_modulos_validados) or 'trabajos' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'programar_reprogramar', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
      values (v_target_id, 'programacion.editar', v_scope)
      on conflict (perfil_id, permiso_codigo) do update set alcance = excluded.alcance;
      if v_scope in ('todas', 'equipo') then
        insert into public.perfil_permisos (perfil_id, permiso_codigo)
        values (v_target_id, 'ordenes.ver_todas')
        on conflict (perfil_id, permiso_codigo) do nothing;
      end if;
    end if;
  end if;

  if 'cobranzas' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'pagos_clientes', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
      values (v_target_id, 'pagos.registrar', v_scope)
      on conflict (perfil_id, permiso_codigo) do update set alcance = excluded.alcance;
    end if;
  end if;

  if 'rentabilidad' = any(v_modulos_validados) then
    v_scope := coalesce(v_restricciones ->> 'costeo_margenes', 'ninguna');
    if v_scope in ('todas', 'equipo', 'propias') then
      insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
      values (v_target_id, 'costeo.ver', v_scope)
      on conflict (perfil_id, permiso_codigo) do update set alcance = excluded.alcance;
    end if;
  end if;

  if 'clientes' = any(v_modulos_validados) and (
    coalesce(v_restricciones ->> 'editar_cotizaciones', 'ninguna') <> 'ninguna'
    or coalesce(v_restricciones ->> 'programar_reprogramar', 'ninguna') <> 'ninguna'
    or coalesce((v_opciones ->> 'valida_servicios')::boolean, false)
  ) then
    insert into public.perfil_permisos (perfil_id, permiso_codigo)
    values (v_target_id, 'clientes.editar')
    on conflict (perfil_id, permiso_codigo) do nothing;
  end if;

  return v_target_id;
end;
$$;

revoke all on function public.guardar_perfil_empresa(uuid, uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.guardar_perfil_empresa(uuid, uuid, text, text, text, jsonb) to authenticated, service_role;

comment on function public.guardar_perfil_empresa(uuid, uuid, text, text, text, jsonb) is 'Crea o actualiza un perfil personalizado de empresa validando contra plan_modulos y sincronizando de forma atómica perfiles.configuracion y public.perfil_permisos.';
