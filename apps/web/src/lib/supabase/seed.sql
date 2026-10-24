-- =====================================================================
-- seed.sql · Datos de ejemplo de la Etapa 0 (historia VIT-29)
--
-- SOLO para la base local y staging. Nunca se corre en producción:
--   supabase db reset   → borra la base local, aplica las migraciones y corre este archivo.
--
-- Parte 1 (catálogos: planes, módulos, permisos y perfiles base) también se necesita
-- en producción: se pasa a una migración propia cuando se confirmen los planes.
-- Parte 2 (usuarios y empresas de prueba) es solo para probar.
-- Contraseña de todos los usuarios de prueba: Prueba123!
-- =====================================================================

-- ---------------------------------------------------------------------
-- PARTE 1 · Catálogos
-- ---------------------------------------------------------------------

-- Planes. Los precios se llenan cuando se definan (por ahora vacíos).
insert into public.planes (codigo, nombre, usuarios_incluidos, orden) values
  ('inicia',  'Inicia',  2, 1),
  ('crece',   'Crece',   5, 2),
  ('empresa', 'Empresa', 15, 3);

-- Los 39 módulos del mapa maestro (20 comunes, 4 por visita, 11 por contrato, 2 sector público, 2 crecimiento).
insert into public.modulos (codigo, nombre, grupo, modelo, etapa, disponible, orden) values
  -- Comunes (20)
  ('empresa_usuarios',       'Empresa, usuarios y perfiles',        'configuracion', 'comun', 0, true,  1),
  ('clientes',               'Clientes y CRM',                      'ventas',        'comun', 1, false, 1),
  ('tarifario',              'Tarifario y servicios',               'configuracion', 'comun', 1, false, 2),
  ('calendario_trabajos',    'Calendario y Trabajos',               'sin_grupo',     'comun', 1, false, 1),
  ('app_campo',              'App de campo',                        'operacion',     'comun', 1, false, 1),
  ('ocurrencias',            'Ocurrencias e incidencias',           'operacion',     'comun', 1, false, 2),
  ('personal',               'Personal y habilidades',              'equipo',        'comun', 1, false, 1),
  ('tiempo',                 'Tiempo y asistencia',                 'operacion',     'comun', 2, false, 3),
  ('inventario',             'Inventario y repuestos',              'operacion',     'comun', 2, false, 4),
  ('equipos_cliente',        'Equipos del cliente',                 'operacion',     'comun', 2, false, 5),
  ('biblioteca',             'Biblioteca',                          'equipo',        'comun', 2, false, 3),
  ('academia',               'Academia',                            'equipo',        'comun', 2, false, 4),
  ('cobranzas_comprobantes', 'Cobranzas y comprobantes',            'finanzas',      'comun', 1, false, 1),
  ('convenios',              'Convenios y liquidaciones',           'finanzas',      'comun', 1, false, 2),
  ('caja_bancos',            'Caja y bancos',                       'finanzas',      'comun', 2, false, 3),
  ('reportes',               'Reportes y Dashboard',                'reportes',      'comun', 2, false, 1),
  ('configuraciones',        'Configuraciones',                     'configuracion', 'comun', 0, true,  3),
  ('cuenta_vittkly',         'Cuenta Vittkly',                      'configuracion', 'comun', 2, false, 4),
  ('panel_plataforma',       'Panel de la plataforma',              'plataforma',    'comun', 0, true,  1),
  ('soporte_comunidad',      'Soporte, Comunidad y Centro de ayuda','plataforma',    'comun', 2, false, 2),
  -- Por visita (4)
  ('cotizaciones',           'Cotizaciones',                        'ventas',        'visita', 1, false, 2),
  ('post_venta',             'Post venta',                          'operacion',     'visita', 2, false, 6),
  ('sitio_web',              'Sitio web y reservas',                'crecimiento',   'visita', 3, false, 1),
  ('marketing',              'Marketing',                           'crecimiento',   'visita', 3, false, 2),
  -- Por contrato (11)
  ('sedes_areas',            'Sedes y áreas',                       'ventas',        'contrato', 4, false, 3),
  ('contratos',              'Contratos y adendas',                 'ventas',        'contrato', 4, false, 4),
  ('puestos_turnos',         'Puestos y turnos',                    'operacion',     'contrato', 4, false, 7),
  ('asistencia_sede',        'Asistencia en sede',                  'operacion',     'contrato', 4, false, 8),
  ('rutinas',                'Rutinas y planes de trabajo',         'operacion',     'contrato', 5, false, 9),
  ('inspecciones',           'Inspecciones y calidad',              'operacion',     'contrato', 5, false, 10),
  ('pedidos_adicionales',    'Pedidos y adicionales',               'operacion',     'contrato', 5, false, 11),
  ('aprobaciones',           'Aprobaciones',                        'operacion',     'contrato', 5, false, 12),
  ('portal_b2b',             'Portal del cliente B2B',              'configuracion', 'contrato', 5, false, 5),
  ('valorizaciones',         'Valorización y conformidad',          'finanzas',      'contrato', 4, false, 4),
  ('inventario_sede_sst',    'Inventario por sede y SST',           'operacion',     'contrato', 5, false, 13),
  -- Sector público (2)
  ('licitaciones',           'Licitaciones',                        'ventas',        'publico', 6, false, 5),
  ('contratos_estado',       'Contratos con el Estado',             'ventas',        'publico', 6, false, 6),
  -- Crecimiento (2)
  ('api_integraciones',      'API e integraciones',                 'configuracion', 'crecimiento', 7, false, 6),
  ('multi_pais',             'Multi país',                          'configuracion', 'crecimiento', 7, false, 7);

-- Qué trae cada plan. PUNTO DE PARTIDA: se confirma cuando se definan los planes.
-- Decidido: Inventario, Academia y Convenios desde Crece. Los módulos por contrato
-- se venden como el complemento Contratos (no van en ningún plan).
insert into public.plan_modulos (plan_id, modulo_codigo)
select p.id, m.codigo
from public.planes p
join public.modulos m on m.modelo in ('comun','visita')
where p.codigo in ('crece','empresa')
   or (p.codigo = 'inicia' and m.codigo not in ('inventario','equipos_cliente','biblioteca','academia','convenios'));

insert into public.plan_modulos (plan_id, modulo_codigo)
select p.id, m.codigo
from public.planes p join public.modulos m on m.modelo in ('publico','crecimiento')
where p.codigo = 'empresa';

-- Permisos: uno de acceso por módulo (<modulo>.ver) …
insert into public.permisos (codigo, modulo_codigo, descripcion)
select m.codigo || '.ver', m.codigo, 'Entrar a ' || m.nombre
from public.modulos m;

-- … más los permisos especiales y los que van con alcance (como en la Central).
insert into public.permisos (codigo, modulo_codigo, descripcion, con_alcance) values
  ('configuracion.editar',     'configuraciones',        'Editar los datos y la configuración de la empresa', false),
  ('usuarios.ver',             'empresa_usuarios',       'Ver a las personas de la empresa y sus perfiles', false),
  ('usuarios.editar',          'empresa_usuarios',       'Invitar, cambiar perfiles y desactivar personas', false),
  ('auditoria.ver',            'configuraciones',        'Ver el historial de cambios', false),
  ('precios.ver',              'cotizaciones',           'Ver precios y cobros', false),
  ('servicios.validar',        'calendario_trabajos',    'Validar o devolver los servicios que cierran los técnicos', false),
  ('datos.exportar',           'reportes',               'Descargar datos en Excel', false),
  ('cotizaciones.ver_montos',  'cotizaciones',           'Ver montos de cotizaciones', true),
  ('cotizaciones.editar',      'cotizaciones',           'Editar cotizaciones', true),
  ('cotizaciones.eliminar',    'cotizaciones',           'Enviar cotizaciones a la papelera', true),
  ('programacion.editar',      'calendario_trabajos',    'Programar y reprogramar', true),
  ('pagos.registrar',          'cobranzas_comprobantes', 'Ver y registrar pagos de clientes', true),
  ('costeo.ver',               'reportes',               'Registrar costos y ver márgenes', true);

-- Perfiles base (plantillas), los mismos de la Central v171.
insert into public.perfiles (empresa_id, codigo, nombre, descripcion, es_base) values
  (null, 'admin',        'Administrador',         'Ve y hace todo, incluida la configuración, las finanzas y los reportes.', true),
  (null, 'supervisor',   'Supervisor',            'Como Ventas, y además valida los servicios que cierran los técnicos.', true),
  (null, 'ventas',       'Ventas',                'Cotiza, atiende clientes, programa trabajos y hace seguimiento.', true),
  (null, 'coordinador',  'Coordinador de agenda', 'Arma la agenda y las rutas. No cotiza ni ve finanzas.', true),
  (null, 'contabilidad', 'Contabilidad',          'Cobranzas, comprobantes, rentabilidad y reportes, con el directorio de clientes.', true),
  (null, 'postventa',    'Atención al cliente',   'Seguimiento, encuestas y reclamos, con clientes y calendario.', true),
  (null, 'analista',     'Analista / Gerencia',   'Mira los resultados: reportes, finanzas y calendario. No cotiza ni configura.', true),
  (null, 'tecnico',      'Técnico',               'Ve la agenda y los trabajos, sin precios ni cobros.', true);

-- Administrador: todo, con alcance «todas».
insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
select p.id, x.codigo, case when x.con_alcance then 'todas' end
from public.perfiles p cross join public.permisos x
where p.empresa_id is null and p.codigo = 'admin';

-- Los demás: acceso a los módulos de su perfil en la Central (pestañas → módulos).
-- Los alcances de cotizaciones, programación, pagos y costeo se completan en la
-- especificación de la Etapa 1, copiándolos de la Central.
with acceso(perfil, modulo) as (values
  ('supervisor','calendario_trabajos'),('supervisor','app_campo'),('supervisor','clientes'),('supervisor','cotizaciones'),
  ('supervisor','tiempo'),('supervisor','post_venta'),('supervisor','inventario'),('supervisor','equipos_cliente'),
  ('supervisor','academia'),('supervisor','biblioteca'),
  ('ventas','calendario_trabajos'),('ventas','clientes'),('ventas','cotizaciones'),('ventas','post_venta'),
  ('ventas','academia'),('ventas','biblioteca'),
  ('coordinador','calendario_trabajos'),('coordinador','app_campo'),('coordinador','clientes'),('coordinador','tiempo'),
  ('coordinador','post_venta'),('coordinador','inventario'),('coordinador','equipos_cliente'),('coordinador','academia'),
  ('coordinador','biblioteca'),
  ('contabilidad','cobranzas_comprobantes'),('contabilidad','convenios'),('contabilidad','caja_bancos'),
  ('contabilidad','reportes'),('contabilidad','clientes'),('contabilidad','inventario'),
  ('postventa','clientes'),('postventa','post_venta'),('postventa','calendario_trabajos'),('postventa','academia'),
  ('postventa','biblioteca'),
  ('analista','reportes'),('analista','cobranzas_comprobantes'),('analista','convenios'),('analista','caja_bancos'),
  ('analista','calendario_trabajos'),('analista','inventario'),('analista','academia'),('analista','biblioteca'),
  ('tecnico','tiempo'),('tecnico','calendario_trabajos'),('tecnico','app_campo'),('tecnico','inventario'),
  ('tecnico','academia'),('tecnico','biblioteca')
)
insert into public.perfil_permisos (perfil_id, permiso_codigo)
select p.id, a.modulo || '.ver'
from acceso a join public.perfiles p on p.empresa_id is null and p.codigo = a.perfil;

-- Todos menos Técnico ven precios; Supervisor también valida servicios.
insert into public.perfil_permisos (perfil_id, permiso_codigo)
select p.id, 'precios.ver' from public.perfiles p
where p.empresa_id is null and p.codigo in ('supervisor','ventas','coordinador','contabilidad','postventa','analista');
insert into public.perfil_permisos (perfil_id, permiso_codigo)
select p.id, 'servicios.validar' from public.perfiles p
where p.empresa_id is null and p.codigo = 'supervisor';

-- ---------------------------------------------------------------------
-- PARTE 2 · Usuarios y empresas de prueba (solo local y staging)
-- ---------------------------------------------------------------------
create or replace function pg_temp.crear_usuario_prueba(p_correo text, p_nombre text)
returns uuid
language plpgsql
as $$
declare
  uid uuid := gen_random_uuid();
begin
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
  v_staff  uuid;
  v_vk     uuid;
  v_prueba uuid;
  e_vk     uuid;
  e_prueba uuid;
  u        uuid;
  r        record;
begin
  -- Staff de Vittkly
  v_staff := pg_temp.crear_usuario_prueba('staff@vittkly.test', 'Staff Vittkly');
  insert into public.staff_plataforma (usuario_id, rol) values (v_staff, 'admin');

  -- Vitta Kleanly: su administrador crea la cuenta como en el registro real
  v_vk := pg_temp.crear_usuario_prueba('admin@vittakleanly.test', 'Administrador VK');
  perform set_config('request.jwt.claim.sub', v_vk::text, true);
  e_vk := public.crear_cuenta_y_empresa('Vitta Kleanly SAC', null, 'empresa');
  update public.empresas set nombre_comercial = 'Vitta Kleanly', modelo_operacion = 'ambos' where id = e_vk;

  -- Empresa Prueba: la segunda empresa para la prueba de «otra empresa»
  v_prueba := pg_temp.crear_usuario_prueba('admin@empresaprueba.test', 'Administrador Prueba');
  perform set_config('request.jwt.claim.sub', v_prueba::text, true);
  e_prueba := public.crear_cuenta_y_empresa('Empresa Prueba SAC', null, 'crece');

  perform set_config('request.jwt.claim.sub', '', true);

  -- Un usuario de prueba por cada perfil base de Vitta Kleanly
  for r in select id, codigo, nombre from public.perfiles where empresa_id = e_vk and codigo <> 'admin' loop
    u := pg_temp.crear_usuario_prueba(r.codigo || '@vittakleanly.test', r.nombre || ' VK');
    insert into public.membresias (empresa_id, usuario_id, perfil_id, acceso_web)
    values (e_vk, u, r.id, r.codigo <> 'tecnico');
  end loop;
end;
$$;
