-- =====================================================================
-- Migración 9 · Ingreso: invitaciones, intentos de ingreso y funciones del registro
-- Historias: VIT-30 (bloqueo), VIT-33 (crear cuenta), VIT-34 (invitar), VIT-35 (canjear)
--
-- Las funciones que crean varias filas a la vez van aquí, dentro de la base, para que
-- todo pase en una sola transacción: o se crea todo, o no se crea nada.
-- La web las llama con la sesión del usuario (supabase.rpc). Enviar el correo o el
-- WhatsApp con el código lo hace una función del servidor (Edge Function) después.
-- =====================================================================

create table public.invitaciones (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references public.empresas(id) on delete cascade,
  correo        text,
  celular       text check (celular is null or celular ~ '^\+[1-9][0-9]{7,14}$'),
  perfil_id     uuid not null references public.perfiles(id),
  acceso_web    boolean not null default true,
  codigo_hash   text not null unique,
  vence_en      timestamptz not null default now() + interval '7 days',
  estado        text not null default 'pendiente' check (estado in ('pendiente','usada','vencida','anulada')),
  usada_en      timestamptz,
  usada_por     uuid references public.usuarios(id),
  creado_en     timestamptz not null default now(),
  creado_por    uuid default auth.uid(),
  actualizado_en  timestamptz not null default now(),
  actualizado_por uuid,
  constraint invitacion_con_contacto check (correo is not null or celular is not null)
);
create index invitaciones_empresa_idx on public.invitaciones (empresa_id, estado);
create index invitaciones_correo_idx on public.invitaciones (lower(correo)) where estado = 'pendiente';
create index invitaciones_celular_idx on public.invitaciones (celular) where estado = 'pendiente';

create trigger tocar_invitaciones before update on public.invitaciones
  for each row execute function public.tocar_actualizado();

create table public.intentos_ingreso (
  identificador    text primary key,
  fallidos         integer not null default 0,
  ultimo_fallo_en  timestamptz,
  bloqueado_hasta  timestamptz
);
comment on table public.intentos_ingreso is 'Solo la usan funciones del servidor. 3 fallos = 30 segundos; 5 fallos = 15 minutos.';

alter table public.invitaciones     enable row level security;
alter table public.intentos_ingreso enable row level security;   -- sin políticas: nadie la toca desde la web

grant select, update on public.invitaciones to authenticated;
create policy "ver invitaciones" on public.invitaciones for select to authenticated
  using (public.tiene_permiso(empresa_id, 'usuarios.editar'));
create policy "anular invitaciones" on public.invitaciones for update to authenticated
  using (public.tiene_permiso(empresa_id, 'usuarios.editar'))
  with check (public.tiene_permiso(empresa_id, 'usuarios.editar') and estado in ('pendiente','anulada'));

-- ---------------------------------------------------------------------
-- Ayudas internas
-- ---------------------------------------------------------------------
create or replace function public.hash_codigo(p_codigo text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(sha256(convert_to(upper(btrim(p_codigo)), 'UTF8')), 'hex');
$$;

-- Código VK-XXXX-XXXX con letras y números que no se confunden (sin 0, O, 1, I).
create or replace function public.generar_codigo_invitacion()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  abc  constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b    bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  idx  int[] := array[0, 1, 2, 3, 10, 11, 12, 13];
  sal  text := '';
  i    int;
begin
  foreach i in array idx loop
    sal := sal || substr(abc, (get_byte(b, i) % 32) + 1, 1);
  end loop;
  return 'VK-' || substr(sal, 1, 4) || '-' || substr(sal, 5, 4);
end;
$$;

-- Copia los perfiles base (plantillas) y sus permisos a una empresa nueva.
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
    insert into public.perfiles (empresa_id, codigo, nombre, descripcion, es_base)
    values (p_empresa_id, pl.codigo, pl.nombre, pl.descripcion, true)
    returning id into nuevo;
    insert into public.perfil_permisos (perfil_id, permiso_codigo, alcance)
    select nuevo, pp.permiso_codigo, pp.alcance
    from public.perfil_permisos pp where pp.perfil_id = pl.id;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Registro: el que crea la cuenta es propietario de su empresa (VIT-33)
-- ---------------------------------------------------------------------
create or replace function public.crear_cuenta_y_empresa(
  p_nombre_empresa text,
  p_ruc text default null,
  p_plan_codigo text default 'inicia'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  yo        uuid := auth.uid();
  v_plan    uuid;
  v_cuenta  uuid;
  v_empresa uuid;
  v_perfil  uuid;
begin
  if yo is null then
    raise exception 'Hay que iniciar sesión para crear una cuenta';
  end if;
  if exists (select 1 from public.cuentas c where c.propietario_id = yo and c.eliminado_en is null) then
    raise exception 'Esta persona ya es propietaria de una cuenta';
  end if;
  if coalesce(btrim(p_nombre_empresa), '') = '' then
    raise exception 'Falta el nombre de la empresa';
  end if;

  select id into v_plan from public.planes where codigo = p_plan_codigo and activo;
  if v_plan is null then
    raise exception 'El plan % no existe o no está activo', p_plan_codigo;
  end if;

  insert into public.cuentas (nombre, propietario_id, correo_facturacion, creado_por)
  values (btrim(p_nombre_empresa), yo, (select correo from public.usuarios where id = yo), yo)
  returning id into v_cuenta;

  insert into public.suscripciones (cuenta_id, plan_id, estado, prueba_hasta, creado_por)
  values (v_cuenta, v_plan, 'prueba', now() + interval '30 days', yo);

  insert into public.empresas (cuenta_id, razon_social, ruc, creado_por)
  values (v_cuenta, btrim(p_nombre_empresa), nullif(btrim(p_ruc), ''), yo)
  returning id into v_empresa;

  insert into public.empresa_configuracion (empresa_id, creado_por) values (v_empresa, yo);

  perform public.copiar_perfiles_base(v_empresa);

  select id into v_perfil from public.perfiles where empresa_id = v_empresa and codigo = 'admin';
  if v_perfil is null then
    raise exception 'Falta el perfil base «admin» en las plantillas';
  end if;

  insert into public.membresias (empresa_id, usuario_id, perfil_id, es_propietario, acceso_web, creado_por)
  values (v_empresa, yo, v_perfil, true, true, yo);

  update public.usuarios set ultima_empresa_id = v_empresa where id = yo;

  return v_empresa;
end;
$$;

-- ---------------------------------------------------------------------
-- Invitar: devuelve el código UNA sola vez; en la base queda solo su hash (VIT-34)
-- ---------------------------------------------------------------------
create or replace function public.crear_invitacion(
  p_empresa_id uuid,
  p_perfil_id uuid,
  p_correo text default null,
  p_celular text default null,
  p_acceso_web boolean default true
)
returns table (invitacion_id uuid, codigo text, vence_en timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_codigo text;
  v_id     uuid;
  v_vence  timestamptz;
begin
  if not public.tiene_permiso(p_empresa_id, 'usuarios.editar') then
    raise exception 'No tienes permiso para invitar en esta empresa';
  end if;
  if not exists (select 1 from public.perfiles p where p.id = p_perfil_id and p.empresa_id = p_empresa_id) then
    raise exception 'El perfil no pertenece a esta empresa';
  end if;
  if p_correo is null and p_celular is null then
    raise exception 'La invitación necesita un correo o un celular';
  end if;

  loop
    v_codigo := public.generar_codigo_invitacion();
    exit when not exists (select 1 from public.invitaciones i where i.codigo_hash = public.hash_codigo(v_codigo));
  end loop;

  insert into public.invitaciones (empresa_id, correo, celular, perfil_id, acceso_web, codigo_hash, creado_por)
  values (p_empresa_id, nullif(lower(btrim(p_correo)), ''), nullif(btrim(p_celular), ''), p_perfil_id,
          p_acceso_web, public.hash_codigo(v_codigo), auth.uid())
  returning id, invitaciones.vence_en into v_id, v_vence;

  return query select v_id, v_codigo, v_vence;
end;
$$;

-- Usa una invitación ya validada: crea (o reactiva) la membresía y la marca como usada.
create or replace function public.aplicar_invitacion(p_inv public.invitaciones, p_usuario uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.membresias (empresa_id, usuario_id, perfil_id, acceso_web, invitado_por, creado_por)
  values (p_inv.empresa_id, p_usuario, p_inv.perfil_id, p_inv.acceso_web, p_inv.creado_por, p_usuario)
  on conflict (empresa_id, usuario_id)
  do update set perfil_id = excluded.perfil_id, acceso_web = excluded.acceso_web, activo = true;

  update public.invitaciones
     set estado = 'usada', usada_en = now(), usada_por = p_usuario
   where id = p_inv.id;

  update public.usuarios set ultima_empresa_id = coalesce(ultima_empresa_id, p_inv.empresa_id)
   where id = p_usuario;

  return p_inv.empresa_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Canjear con el código: «Tengo una invitación» (VIT-35)
-- ---------------------------------------------------------------------
create or replace function public.canjear_invitacion(p_codigo text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.invitaciones;
begin
  if auth.uid() is null then
    raise exception 'Hay que iniciar sesión para usar la invitación';
  end if;

  select * into inv from public.invitaciones
   where codigo_hash = public.hash_codigo(p_codigo)
   for update;

  if inv.id is null then
    raise exception 'El código no existe';
  elsif inv.estado = 'usada' then
    raise exception 'Este código ya se usó';
  elsif inv.estado = 'anulada' then
    raise exception 'Esta invitación fue anulada';
  elsif inv.estado = 'vencida' or inv.vence_en < now() then
    update public.invitaciones set estado = 'vencida' where id = inv.id;
    raise exception 'La invitación venció; pide una nueva';
  end if;

  return public.aplicar_invitacion(inv, auth.uid());
end;
$$;

-- ---------------------------------------------------------------------
-- Al entrar con Google, Microsoft o correo: se une solo a las invitaciones de su correo o celular
-- ---------------------------------------------------------------------
create or replace function public.unir_invitaciones_pendientes()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  yo      uuid := auth.uid();
  v_corr  text;
  v_cel   text;
  inv     public.invitaciones;
  n       integer := 0;
begin
  if yo is null then return 0; end if;

  -- Solo correos y celulares confirmados por Supabase Auth.
  select case when u.email_confirmed_at is not null then lower(u.email) end,
         case when u.phone_confirmed_at is not null then '+' || ltrim(u.phone, '+') end
    into v_corr, v_cel
    from auth.users u where u.id = yo;

  for inv in
    select * from public.invitaciones i
     where i.estado = 'pendiente' and i.vence_en >= now()
       and ((v_corr is not null and lower(i.correo) = v_corr) or (v_cel is not null and i.celular = v_cel))
     for update
  loop
    perform public.aplicar_invitacion(inv, yo);
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- ---------------------------------------------------------------------
-- Bloqueo por intentos fallidos (VIT-30). Solo la usa una función del servidor.
-- ---------------------------------------------------------------------
create or replace function public.ingreso_bloqueado_hasta(p_identificador text)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select case when bloqueado_hasta > now() then bloqueado_hasta end
  from public.intentos_ingreso where identificador = lower(btrim(p_identificador));
$$;

create or replace function public.registrar_intento(p_identificador text, p_exito boolean)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  ident text := lower(btrim(p_identificador));
  f     integer;
  hasta timestamptz;
begin
  if p_exito then
    delete from public.intentos_ingreso where identificador = ident;
    return null;
  end if;

  insert into public.intentos_ingreso as t (identificador, fallidos, ultimo_fallo_en)
  values (ident, 1, now())
  on conflict (identificador) do update
     set fallidos = t.fallidos + 1, ultimo_fallo_en = now()
  returning t.fallidos into f;

  hasta := case when f >= 5 then now() + interval '15 minutes'
                when f >= 3 then now() + interval '30 seconds'
                else null end;
  update public.intentos_ingreso set bloqueado_hasta = hasta where identificador = ident;
  return hasta;
end;
$$;

-- ---------------------------------------------------------------------
-- Quién puede llamar a cada función
-- ---------------------------------------------------------------------
revoke execute on function public.copiar_perfiles_base(uuid) from public, anon, authenticated;
revoke execute on function public.aplicar_invitacion(public.invitaciones, uuid) from public, anon, authenticated;
revoke execute on function public.generar_codigo_invitacion() from public, anon, authenticated;
revoke execute on function public.ingreso_bloqueado_hasta(text) from public, anon, authenticated;
revoke execute on function public.registrar_intento(text, boolean) from public, anon, authenticated;
revoke execute on function public.crear_cuenta_y_empresa(text, text, text) from public, anon;
revoke execute on function public.crear_invitacion(uuid, uuid, text, text, boolean) from public, anon;
revoke execute on function public.canjear_invitacion(text) from public, anon;
revoke execute on function public.unir_invitaciones_pendientes() from public, anon;

grant execute on function public.crear_cuenta_y_empresa(text, text, text) to authenticated;
grant execute on function public.crear_invitacion(uuid, uuid, text, text, boolean) to authenticated;
grant execute on function public.canjear_invitacion(text) to authenticated;
grant execute on function public.unir_invitaciones_pendientes() to authenticated;
grant execute on function public.ingreso_bloqueado_hasta(text) to service_role;
grant execute on function public.registrar_intento(text, boolean) to service_role;
