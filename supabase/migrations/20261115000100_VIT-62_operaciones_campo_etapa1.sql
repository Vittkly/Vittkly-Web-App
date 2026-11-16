-- =====================================================================
-- Migración: 20261115000100_VIT-62_operaciones_campo_etapa1.sql
-- Historia:  VIT-62 · Operaciones de Campo Etapa 1 + Offline-First
-- Tablas:    public.clientes, public.ordenes_trabajo,
--            public.plantillas_formulario, public.respuestas_formulario,
--            public.evidencias_orden, public.registros_tiempo
-- Storage:   bucket privado 'evidencias-campo' + políticas RLS
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Catálogo de permisos Etapa 1 (idempotente en catálogo y perfiles)
-- ---------------------------------------------------------------------
insert into public.permisos (codigo, modulo_codigo, descripcion, con_alcance)
select v.codigo, v.modulo_codigo, v.descripcion, v.con_alcance
from (values
  ('clientes.editar', 'clientes', 'Crear y editar clientes de la empresa', false),
  ('ordenes.ver_todas', 'calendario_trabajos', 'Ver todas las órdenes de trabajo de la empresa', false)
) as v(codigo, modulo_codigo, descripcion, con_alcance)
where exists (
  select 1 from public.modulos m where m.codigo = v.modulo_codigo
)
on conflict (codigo) do nothing;

insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
select p.id, pm.codigo, null
from public.perfiles p
join public.permisos pm on pm.codigo in ('clientes.editar', 'ordenes.ver_todas')
where (p.empresa_id is null or p.es_base = true)
  and p.codigo in ('admin', 'administrador', 'supervisor', 'coordinador')
on conflict (perfil_id, permiso_codigo) do nothing;

-- ---------------------------------------------------------------------
-- 2. Tabla public.clientes
-- ---------------------------------------------------------------------
create table if not exists public.clientes (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references public.empresas(id) on delete cascade,
  nombre_completo   text not null,
  tipo_persona      text not null default 'particular'
                      check (tipo_persona in ('particular', 'empresa')),
  documento_tipo    text
                      check (documento_tipo is null or documento_tipo in ('DNI', 'RUC', 'CE', 'PASAPORTE', 'OTRO')),
  documento_numero  text,
  telefono          text,
  correo            text,
  direccion         text,
  distrito          text,
  referencia        text,
  latitud           numeric(10, 7)
                      check (latitud is null or (latitud >= -90 and latitud <= 90)),
  longitud          numeric(10, 7)
                      check (longitud is null or (longitud >= -180 and longitud <= 180)),
  notas             text,
  activo            boolean not null default true,
  creado_en         timestamptz not null default now(),
  creado_por        uuid default auth.uid(),
  actualizado_en    timestamptz not null default now(),
  actualizado_por   uuid
);

comment on table public.clientes is 'Directorio de clientes por empresa (Etapa 1).';

create index if not exists clientes_empresa_idx
  on public.clientes (empresa_id);
create index if not exists clientes_empresa_activo_idx
  on public.clientes (empresa_id, activo, nombre_completo);
create index if not exists clientes_empresa_doc_idx
  on public.clientes (empresa_id, documento_numero)
  where documento_numero is not null;

drop trigger if exists tocar_clientes on public.clientes;
create trigger tocar_clientes
  before update on public.clientes
  for each row execute function public.tocar_actualizado();

drop trigger if exists auditar on public.clientes;
create trigger auditar
  after insert or update or delete on public.clientes
  for each row execute function public.auditar();

-- ---------------------------------------------------------------------
-- 3. Tabla public.ordenes_trabajo
-- ---------------------------------------------------------------------
create table if not exists public.ordenes_trabajo (
  id                      uuid primary key default gen_random_uuid(),
  empresa_id              uuid not null references public.empresas(id) on delete cascade,
  codigo                  text not null,
  cliente_id              uuid not null references public.clientes(id) on delete restrict,
  tecnico_id              uuid references public.usuarios(id) on delete set null,
  tipo                    text not null default 'servicio'
                            check (tipo in ('servicio', 'visita')),
  titulo                  text not null,
  descripcion             text,
  instrucciones           text,
  estado                  text not null default 'programada'
                            check (estado in ('programada', 'en_ruta', 'en_curso', 'completada', 'pagada', 'cancelada')),
  fecha_programada        date not null,
  hora_inicio_estimada    time,
  duracion_estimada_min   integer not null default 60
                            check (duracion_estimada_min > 0),
  direccion_servicio      text,
  distrito                text,
  latitud                 numeric(10, 7)
                            check (latitud is null or (latitud >= -90 and latitud <= 90)),
  longitud                numeric(10, 7)
                            check (longitud is null or (longitud >= -180 and longitud <= 180)),
  en_ruta_eta_min         integer
                            check (en_ruta_eta_min is null or en_ruta_eta_min > 0),
  frecuencia_recurrencia  text,
  monto_total             numeric(12, 2) not null default 0
                            check (monto_total >= 0),
  moneda                  text not null default 'PEN',
  metodo_pago             text not null default 'pendiente'
                            check (metodo_pago in ('efectivo', 'yape_plin', 'transferencia', 'tarjeta', 'pendiente')),
  pagado_en               timestamptz,
  iniciado_en             timestamptz,
  completado_en           timestamptz,
  estado_validacion       text not null default 'pendiente'
                            check (estado_validacion in ('pendiente', 'aprobado', 'observado')),
  validado_por            uuid references public.usuarios(id) on delete set null,
  validado_en             timestamptz,
  observacion_validacion  text,
  creado_en               timestamptz not null default now(),
  creado_por              uuid default auth.uid(),
  actualizado_en          timestamptz not null default now(),
  actualizado_por         uuid,
  constraint ordenes_trabajo_empresa_codigo_uq unique (empresa_id, codigo)
);

comment on table public.ordenes_trabajo is 'Órdenes de trabajo y visitas técnicas de campo (Etapa 1).';

create index if not exists ordenes_trabajo_empresa_idx
  on public.ordenes_trabajo (empresa_id);
create index if not exists ordenes_trabajo_cliente_idx
  on public.ordenes_trabajo (cliente_id);
create index if not exists ordenes_trabajo_tecnico_idx
  on public.ordenes_trabajo (tecnico_id);
create index if not exists ordenes_trabajo_fecha_idx
  on public.ordenes_trabajo (fecha_programada);
create index if not exists ordenes_trabajo_estado_idx
  on public.ordenes_trabajo (estado);
create index if not exists ordenes_trabajo_empresa_fecha_estado_idx
  on public.ordenes_trabajo (empresa_id, fecha_programada, estado);
create index if not exists ordenes_trabajo_empresa_tecnico_fecha_idx
  on public.ordenes_trabajo (empresa_id, tecnico_id, fecha_programada);

drop trigger if exists tocar_ordenes_trabajo on public.ordenes_trabajo;
create trigger tocar_ordenes_trabajo
  before update on public.ordenes_trabajo
  for each row execute function public.tocar_actualizado();

drop trigger if exists auditar on public.ordenes_trabajo;
create trigger auditar
  after insert or update or delete on public.ordenes_trabajo
  for each row execute function public.auditar();

-- ---------------------------------------------------------------------
-- 4. Tabla public.plantillas_formulario
-- ---------------------------------------------------------------------
create table if not exists public.plantillas_formulario (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references public.empresas(id) on delete cascade,
  codigo            text not null default 'orden_conformidad',
  nombre            text not null default 'Orden y conformidad',
  descripcion       text,
  tipo              text not null default 'cierre_orden'
                      check (tipo in ('cierre_orden', 'pre_check', 'procedimiento')),
  version           integer not null default 1 check (version >= 1),
  esquema_campos    jsonb not null default '[]'::jsonb
                      check (jsonb_typeof(esquema_campos) = 'array'),
  activa            boolean not null default true,
  es_predeterminada boolean not null default false,
  creado_en         timestamptz not null default now(),
  creado_por        uuid default auth.uid(),
  actualizado_en    timestamptz not null default now(),
  actualizado_por   uuid,
  constraint plantillas_formulario_empresa_codigo_ver_uq unique (empresa_id, codigo, version)
);

comment on table public.plantillas_formulario is 'Plantillas configurables para cierre de servicio, checklists y procedimientos.';

create index if not exists plantillas_formulario_empresa_idx
  on public.plantillas_formulario (empresa_id);
create index if not exists plantillas_formulario_activa_idx
  on public.plantillas_formulario (empresa_id, activa, tipo);

drop trigger if exists tocar_plantillas_formulario on public.plantillas_formulario;
create trigger tocar_plantillas_formulario
  before update on public.plantillas_formulario
  for each row execute function public.tocar_actualizado();

drop trigger if exists auditar on public.plantillas_formulario;
create trigger auditar
  after insert or update or delete on public.plantillas_formulario
  for each row execute function public.auditar();

-- ---------------------------------------------------------------------
-- 5. Tabla public.respuestas_formulario
-- ---------------------------------------------------------------------
create table if not exists public.respuestas_formulario (
  id                       uuid primary key default gen_random_uuid(),
  empresa_id               uuid not null references public.empresas(id) on delete cascade,
  orden_trabajo_id         uuid not null references public.ordenes_trabajo(id) on delete cascade,
  plantilla_id             uuid references public.plantillas_formulario(id) on delete set null,
  usuario_id               uuid not null references public.usuarios(id) on delete restrict,
  estado                   text not null default 'borrador'
                             check (estado in ('borrador', 'completado')),
  paso_actual              integer not null default 0 check (paso_actual >= 0),
  respuestas               jsonb not null default '{}'::jsonb
                             check (jsonb_typeof(respuestas) = 'object'),
  firma_inicio_path        text,
  firma_inicio_en          timestamptz,
  firma_conformidad_path   text,
  firma_conformidad_en     timestamptz,
  nombre_firmante          text,
  calificacion_csat        numeric(3, 2)
                             check (calificacion_csat is null or (calificacion_csat >= 1 and calificacion_csat <= 5)),
  nps_score                smallint
                             check (nps_score is null or (nps_score >= 0 and nps_score <= 10)),
  encuesta_omitida         boolean not null default false,
  completado_en            timestamptz,
  creado_en                timestamptz not null default now(),
  creado_por               uuid default auth.uid(),
  actualizado_en           timestamptz not null default now(),
  actualizado_por          uuid,
  constraint respuestas_formulario_orden_uq unique (orden_trabajo_id)
);

comment on table public.respuestas_formulario is 'Respuestas del wizard de cierre ("Orden y conformidad"), firmas y encuesta CSAT/NPS.';

create index if not exists respuestas_formulario_empresa_idx
  on public.respuestas_formulario (empresa_id);
create index if not exists respuestas_formulario_orden_idx
  on public.respuestas_formulario (orden_trabajo_id);
create index if not exists respuestas_formulario_plantilla_idx
  on public.respuestas_formulario (plantilla_id);
create index if not exists respuestas_formulario_usuario_idx
  on public.respuestas_formulario (usuario_id);

drop trigger if exists tocar_respuestas_formulario on public.respuestas_formulario;
create trigger tocar_respuestas_formulario
  before update on public.respuestas_formulario
  for each row execute function public.tocar_actualizado();

drop trigger if exists auditar on public.respuestas_formulario;
create trigger auditar
  after insert or update or delete on public.respuestas_formulario
  for each row execute function public.auditar();

-- ---------------------------------------------------------------------
-- 6. Tabla public.evidencias_orden (append-only, sin tocar_actualizado)
-- ---------------------------------------------------------------------
create table if not exists public.evidencias_orden (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references public.empresas(id) on delete cascade,
  orden_trabajo_id  uuid not null references public.ordenes_trabajo(id) on delete cascade,
  usuario_id        uuid not null references public.usuarios(id) on delete restrict,
  tipo              text not null
                      check (tipo in ('antes', 'despues', 'firma_inicio', 'firma_cliente', 'comprobante_pago', 'general')),
  item_codigo       text,
  storage_path      text not null,
  nota              text,
  creado_en         timestamptz not null default now(),
  creado_por        uuid default auth.uid()
);

comment on table public.evidencias_orden is 'Evidencias fotográficas, firmas y comprobantes asociados a una orden (append-only).';

create index if not exists evidencias_orden_empresa_idx
  on public.evidencias_orden (empresa_id);
create index if not exists evidencias_orden_orden_idx
  on public.evidencias_orden (orden_trabajo_id, tipo);
create index if not exists evidencias_orden_usuario_idx
  on public.evidencias_orden (usuario_id);

drop trigger if exists auditar on public.evidencias_orden;
create trigger auditar
  after insert or update or delete on public.evidencias_orden
  for each row execute function public.auditar();

-- ---------------------------------------------------------------------
-- 7. Tabla public.registros_tiempo
-- ---------------------------------------------------------------------
create table if not exists public.registros_tiempo (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references public.empresas(id) on delete cascade,
  usuario_id          uuid not null references public.usuarios(id) on delete restrict,
  orden_trabajo_id    uuid references public.ordenes_trabajo(id) on delete set null,
  tipo                text not null
                        check (tipo in ('jornada', 'visita', 'traslado', 'oficina', 'compra', 'descanso', 'general')),
  iniciado_en         timestamptz not null,
  finalizado_en       timestamptz,
  duracion_segundos   integer
                        check (duracion_segundos is null or duracion_segundos >= 0),
  nota                text,
  creado_en           timestamptz not null default now(),
  creado_por          uuid default auth.uid(),
  actualizado_en      timestamptz not null default now(),
  actualizado_por     uuid,
  constraint registros_tiempo_rango_valido check (finalizado_en is null or finalizado_en >= iniciado_en)
);

comment on table public.registros_tiempo is 'Fichajes de jornada laboral y actividades operativas de campo.';

create index if not exists registros_tiempo_empresa_idx
  on public.registros_tiempo (empresa_id);
create index if not exists registros_tiempo_usuario_fecha_idx
  on public.registros_tiempo (empresa_id, usuario_id, iniciado_en desc);
create index if not exists registros_tiempo_orden_idx
  on public.registros_tiempo (orden_trabajo_id)
  where orden_trabajo_id is not null;
create unique index if not exists registros_tiempo_jornada_abierta_uq
  on public.registros_tiempo (empresa_id, usuario_id)
  where tipo = 'jornada' and finalizado_en is null;
create unique index if not exists registros_tiempo_actividad_abierta_uq
  on public.registros_tiempo (empresa_id, usuario_id)
  where tipo <> 'jornada' and finalizado_en is null;

drop trigger if exists tocar_registros_tiempo on public.registros_tiempo;
create trigger tocar_registros_tiempo
  before update on public.registros_tiempo
  for each row execute function public.tocar_actualizado();

drop trigger if exists auditar on public.registros_tiempo;
create trigger auditar
  after insert or update or delete on public.registros_tiempo
  for each row execute function public.auditar();

-- ---------------------------------------------------------------------
-- 8. Helpers SECURITY DEFINER para integridad cross-tenant y protección de columnas
-- ---------------------------------------------------------------------
create or replace function public.cliente_pertenece_empresa(p_cliente_id uuid, p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.clientes c
    where c.id = p_cliente_id
      and c.empresa_id = p_empresa_id
  );
$$;

create or replace function public.orden_pertenece_empresa(p_orden_id uuid, p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.ordenes_trabajo ot
    where ot.id = p_orden_id
      and ot.empresa_id = p_empresa_id
  );
$$;

create or replace function public.plantilla_pertenece_empresa(p_plantilla_id uuid, p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.plantillas_formulario pf
    where pf.id = p_plantilla_id
      and pf.empresa_id = p_empresa_id
  );
$$;

create or replace function public.tecnico_asignado_a_cliente(p_cliente_id uuid, p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.ordenes_trabajo ot
    where ot.empresa_id = p_empresa_id
      and ot.cliente_id = p_cliente_id
      and ot.tecnico_id = auth.uid()
  );
$$;

create or replace function public.puede_operar_orden(p_orden_id uuid, p_empresa_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.ordenes_trabajo ot
    where ot.id = p_orden_id
      and ot.empresa_id = p_empresa_id
      and (
        ot.tecnico_id = auth.uid()
        or public.tiene_permiso(p_empresa_id, 'programacion.editar')
        or public.tiene_permiso(p_empresa_id, 'servicios.validar')
        or public.tiene_permiso(p_empresa_id, 'configuracion.editar')
      )
  );
$$;

revoke execute on function public.cliente_pertenece_empresa(uuid, uuid) from public, anon;
revoke execute on function public.orden_pertenece_empresa(uuid, uuid) from public, anon;
revoke execute on function public.plantilla_pertenece_empresa(uuid, uuid) from public, anon;
revoke execute on function public.tecnico_asignado_a_cliente(uuid, uuid) from public, anon;
revoke execute on function public.puede_operar_orden(uuid, uuid) from public, anon;

grant execute on function public.cliente_pertenece_empresa(uuid, uuid) to authenticated, service_role;
grant execute on function public.orden_pertenece_empresa(uuid, uuid) to authenticated, service_role;
grant execute on function public.plantilla_pertenece_empresa(uuid, uuid) to authenticated, service_role;
grant execute on function public.tecnico_asignado_a_cliente(uuid, uuid) to authenticated, service_role;
grant execute on function public.puede_operar_orden(uuid, uuid) to authenticated, service_role;

-- Trigger de protección de columnas sensibles en ordenes_trabajo
create or replace function public.proteger_campos_orden_trabajo()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_puede_programar boolean;
  v_puede_pagos boolean;
  v_puede_validar boolean;
begin
  -- El backend privilegiado (service_role / admin SQL) no está sujeto a restricción de UI de campo
  if current_setting('role', true) <> 'authenticated' then
    return new;
  end if;

  if new.empresa_id is distinct from old.empresa_id then
    raise exception 'No está permitido transferir una orden de trabajo entre empresas';
  end if;

  v_puede_programar := public.tiene_permiso(old.empresa_id, 'programacion.editar')
                    or public.tiene_permiso(old.empresa_id, 'configuracion.editar');
  v_puede_pagos     := public.tiene_permiso(old.empresa_id, 'pagos.registrar')
                    or public.tiene_permiso(old.empresa_id, 'configuracion.editar');
  v_puede_validar   := public.tiene_permiso(old.empresa_id, 'servicios.validar')
                    or v_puede_programar;

  if not v_puede_programar then
    if new.codigo is distinct from old.codigo
      or new.cliente_id is distinct from old.cliente_id
      or new.tecnico_id is distinct from old.tecnico_id
      or new.tipo is distinct from old.tipo
      or new.titulo is distinct from old.titulo
      or new.descripcion is distinct from old.descripcion
      or new.instrucciones is distinct from old.instrucciones
      or new.fecha_programada is distinct from old.fecha_programada
      or new.hora_inicio_estimada is distinct from old.hora_inicio_estimada
      or new.duracion_estimada_min is distinct from old.duracion_estimada_min
      or new.direccion_servicio is distinct from old.direccion_servicio
      or new.distrito is distinct from old.distrito
      or new.latitud is distinct from old.latitud
      or new.longitud is distinct from old.longitud
      or new.frecuencia_recurrencia is distinct from old.frecuencia_recurrencia
      or new.monto_total is distinct from old.monto_total
      or new.moneda is distinct from old.moneda
    then
      raise exception 'Solo usuarios con permiso de programación pueden modificar datos comerciales o de asignación';
    end if;

    if new.estado = 'cancelada' and new.estado is distinct from old.estado then
      raise exception 'Solo usuarios con permiso de programación pueden cancelar una orden';
    end if;
  end if;

  if not v_puede_pagos then
    if new.metodo_pago is distinct from old.metodo_pago
      or new.pagado_en is distinct from old.pagado_en
      or (new.estado = 'pagada' and new.estado is distinct from old.estado)
    then
      raise exception 'Solo usuarios con permiso de pagos pueden registrar o modificar cobros';
    end if;
  end if;

  if not v_puede_validar then
    if new.estado_validacion is distinct from old.estado_validacion
      or new.validado_por is distinct from old.validado_por
      or new.validado_en is distinct from old.validado_en
      or new.observacion_validacion is distinct from old.observacion_validacion
    then
      raise exception 'Solo supervisores con permiso de validación pueden aprobar o devolver servicios';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists proteger_campos_orden_trabajo_trg on public.ordenes_trabajo;
create trigger proteger_campos_orden_trabajo_trg
  before update on public.ordenes_trabajo
  for each row execute function public.proteger_campos_orden_trabajo();

revoke execute on function public.proteger_campos_orden_trabajo() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 9. Row Level Security (ENABLE + FORCE) y Grants explícitos
-- ---------------------------------------------------------------------
alter table public.clientes              enable row level security;
alter table public.clientes              force row level security;
alter table public.ordenes_trabajo       enable row level security;
alter table public.ordenes_trabajo       force row level security;
alter table public.plantillas_formulario enable row level security;
alter table public.plantillas_formulario force row level security;
alter table public.respuestas_formulario enable row level security;
alter table public.respuestas_formulario force row level security;
alter table public.evidencias_orden      enable row level security;
alter table public.evidencias_orden      force row level security;
alter table public.registros_tiempo      enable row level security;
alter table public.registros_tiempo      force row level security;

revoke all on table
  public.clientes,
  public.ordenes_trabajo,
  public.plantillas_formulario,
  public.respuestas_formulario,
  public.evidencias_orden,
  public.registros_tiempo
from public, anon;

grant select, insert, update, delete on table
  public.clientes,
  public.ordenes_trabajo,
  public.plantillas_formulario,
  public.respuestas_formulario,
  public.evidencias_orden,
  public.registros_tiempo
to authenticated, service_role;

-- Políticas: public.clientes
drop policy if exists "clientes_select" on public.clientes;
create policy "clientes_select"
  on public.clientes for select to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'clientes.ver')
      or public.tiene_permiso(empresa_id, 'clientes.editar')
      or public.tiene_permiso(empresa_id, 'ordenes.ver_todas')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
      or public.tecnico_asignado_a_cliente(id, empresa_id)
    )
  );

drop policy if exists "clientes_insert" on public.clientes;
create policy "clientes_insert"
  on public.clientes for insert to authenticated
  with check (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'clientes.editar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "clientes_update" on public.clientes;
create policy "clientes_update"
  on public.clientes for update to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'clientes.editar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  )
  with check (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'clientes.editar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "clientes_delete" on public.clientes;
create policy "clientes_delete"
  on public.clientes for delete to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'clientes.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

-- Políticas: public.ordenes_trabajo
drop policy if exists "ordenes_trabajo_select" on public.ordenes_trabajo;
create policy "ordenes_trabajo_select"
  on public.ordenes_trabajo for select to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      tecnico_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'ordenes.ver_todas')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'pagos.registrar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "ordenes_trabajo_insert" on public.ordenes_trabajo;
create policy "ordenes_trabajo_insert"
  on public.ordenes_trabajo for insert to authenticated
  with check (
    public.es_miembro(empresa_id)
    and public.cliente_pertenece_empresa(cliente_id, empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "ordenes_trabajo_update" on public.ordenes_trabajo;
create policy "ordenes_trabajo_update"
  on public.ordenes_trabajo for update to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      tecnico_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'pagos.registrar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  )
  with check (
    public.es_miembro(empresa_id)
    and public.cliente_pertenece_empresa(cliente_id, empresa_id)
    and (
      tecnico_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'pagos.registrar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "ordenes_trabajo_delete" on public.ordenes_trabajo;
create policy "ordenes_trabajo_delete"
  on public.ordenes_trabajo for delete to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

-- Políticas: public.plantillas_formulario
drop policy if exists "plantillas_formulario_select" on public.plantillas_formulario;
create policy "plantillas_formulario_select"
  on public.plantillas_formulario for select to authenticated
  using (public.es_miembro(empresa_id));

drop policy if exists "plantillas_formulario_insert" on public.plantillas_formulario;
create policy "plantillas_formulario_insert"
  on public.plantillas_formulario for insert to authenticated
  with check (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'configuracion.editar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'servicios.validar')
    )
  );

drop policy if exists "plantillas_formulario_update" on public.plantillas_formulario;
create policy "plantillas_formulario_update"
  on public.plantillas_formulario for update to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'configuracion.editar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'servicios.validar')
    )
  )
  with check (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'configuracion.editar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'servicios.validar')
    )
  );

drop policy if exists "plantillas_formulario_delete" on public.plantillas_formulario;
create policy "plantillas_formulario_delete"
  on public.plantillas_formulario for delete to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      public.tiene_permiso(empresa_id, 'configuracion.editar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
    )
  );

-- Políticas: public.respuestas_formulario
drop policy if exists "respuestas_formulario_select" on public.respuestas_formulario;
create policy "respuestas_formulario_select"
  on public.respuestas_formulario for select to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.puede_operar_orden(orden_trabajo_id, empresa_id)
      or public.tiene_permiso(empresa_id, 'ordenes.ver_todas')
    )
  );

drop policy if exists "respuestas_formulario_insert" on public.respuestas_formulario;
create policy "respuestas_formulario_insert"
  on public.respuestas_formulario for insert to authenticated
  with check (
    public.es_miembro(empresa_id)
    and usuario_id = (select auth.uid())
    and public.puede_operar_orden(orden_trabajo_id, empresa_id)
    and (plantilla_id is null or public.plantilla_pertenece_empresa(plantilla_id, empresa_id))
  );

drop policy if exists "respuestas_formulario_update" on public.respuestas_formulario;
create policy "respuestas_formulario_update"
  on public.respuestas_formulario for update to authenticated
  using (
    public.es_miembro(empresa_id)
    and public.puede_operar_orden(orden_trabajo_id, empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  )
  with check (
    public.es_miembro(empresa_id)
    and public.puede_operar_orden(orden_trabajo_id, empresa_id)
    and (plantilla_id is null or public.plantilla_pertenece_empresa(plantilla_id, empresa_id))
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "respuestas_formulario_delete" on public.respuestas_formulario;
create policy "respuestas_formulario_delete"
  on public.respuestas_formulario for delete to authenticated
  using (
    public.es_miembro(empresa_id)
    and public.tiene_permiso(empresa_id, 'configuracion.editar')
  );

-- Políticas: public.evidencias_orden
drop policy if exists "evidencias_orden_select" on public.evidencias_orden;
create policy "evidencias_orden_select"
  on public.evidencias_orden for select to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.puede_operar_orden(orden_trabajo_id, empresa_id)
      or public.tiene_permiso(empresa_id, 'ordenes.ver_todas')
    )
  );

drop policy if exists "evidencias_orden_insert" on public.evidencias_orden;
create policy "evidencias_orden_insert"
  on public.evidencias_orden for insert to authenticated
  with check (
    public.es_miembro(empresa_id)
    and usuario_id = (select auth.uid())
    and public.puede_operar_orden(orden_trabajo_id, empresa_id)
  );

drop policy if exists "evidencias_orden_update" on public.evidencias_orden;
create policy "evidencias_orden_update"
  on public.evidencias_orden for update to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  )
  with check (
    public.es_miembro(empresa_id)
    and public.orden_pertenece_empresa(orden_trabajo_id, empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "evidencias_orden_delete" on public.evidencias_orden;
create policy "evidencias_orden_delete"
  on public.evidencias_orden for delete to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

-- Políticas: public.registros_tiempo
drop policy if exists "registros_tiempo_select" on public.registros_tiempo;
create policy "registros_tiempo_select"
  on public.registros_tiempo for select to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'usuarios.ver')
      or public.tiene_permiso(empresa_id, 'servicios.validar')
      or public.tiene_permiso(empresa_id, 'programacion.editar')
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "registros_tiempo_insert" on public.registros_tiempo;
create policy "registros_tiempo_insert"
  on public.registros_tiempo for insert to authenticated
  with check (
    public.es_miembro(empresa_id)
    and usuario_id = (select auth.uid())
    and (orden_trabajo_id is null or public.orden_pertenece_empresa(orden_trabajo_id, empresa_id))
  );

drop policy if exists "registros_tiempo_update" on public.registros_tiempo;
create policy "registros_tiempo_update"
  on public.registros_tiempo for update to authenticated
  using (
    public.es_miembro(empresa_id)
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  )
  with check (
    public.es_miembro(empresa_id)
    and (orden_trabajo_id is null or public.orden_pertenece_empresa(orden_trabajo_id, empresa_id))
    and (
      usuario_id = (select auth.uid())
      or public.tiene_permiso(empresa_id, 'configuracion.editar')
    )
  );

drop policy if exists "registros_tiempo_delete" on public.registros_tiempo;
create policy "registros_tiempo_delete"
  on public.registros_tiempo for delete to authenticated
  using (
    public.es_miembro(empresa_id)
    and public.tiene_permiso(empresa_id, 'configuracion.editar')
  );

-- ---------------------------------------------------------------------
-- 10. Storage Bucket privado 'evidencias-campo' y políticas RLS
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidencias-campo',
  'evidencias-campo',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "evidencias_campo_select" on storage.objects;
create policy "evidencias_campo_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'evidencias-campo'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.es_miembro(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "evidencias_campo_insert" on storage.objects;
create policy "evidencias_campo_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'evidencias-campo'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.es_miembro(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "evidencias_campo_update" on storage.objects;
create policy "evidencias_campo_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'evidencias-campo'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.es_miembro(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'evidencias-campo'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.es_miembro(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "evidencias_campo_delete" on storage.objects;
create policy "evidencias_campo_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'evidencias-campo'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.es_miembro(((storage.foldername(name))[1])::uuid)
  );
