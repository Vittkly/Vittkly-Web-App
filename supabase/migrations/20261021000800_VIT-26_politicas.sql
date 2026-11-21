-- =====================================================================
-- Migración 8 · Permisos de acceso (grants) y políticas RLS de las tablas 1 a 7
-- Historia: VIT-26
--
-- En el proyecto Vittkly-Web está desactivado «Automatically expose new tables»:
-- ninguna tabla nueva es visible por la API hasta darle acceso aquí, a propósito.
-- Los grants abren la puerta; las políticas RLS deciden qué filas pasan.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Grants: solo usuarios autenticados. anon (sin sesión) no entra a nada.
-- ---------------------------------------------------------------------
grant usage on schema public to authenticated;

grant select on public.planes, public.modulos, public.plan_modulos, public.permisos to authenticated;
grant insert, update, delete on public.planes, public.modulos, public.plan_modulos, public.permisos to authenticated;

grant select, insert, update, delete on public.staff_plataforma to authenticated;
grant select, update on public.usuarios to authenticated;
grant select, update on public.cuentas to authenticated;
grant select on public.suscripciones to authenticated;
grant select, update on public.empresas to authenticated;
grant select, update on public.empresa_configuracion to authenticated;
grant select, insert, update, delete on public.perfiles to authenticated;
grant select, insert, update, delete on public.perfil_permisos to authenticated;
grant select, update on public.membresias to authenticated;

grant execute on function public.es_staff(text) to authenticated;
grant execute on function public.es_miembro(uuid) to authenticated;
grant execute on function public.tiene_permiso(uuid, text) to authenticated;
grant execute on function public.alcance_permiso(uuid, text) to authenticated;
grant execute on function public.tiene_modulo(uuid, text) to authenticated;
grant execute on function public.directorio_empresa(uuid) to authenticated;
revoke execute on function public.crear_usuario_desde_auth() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Plataforma: lee cualquier autenticado; escribe solo el staff admin.
-- ---------------------------------------------------------------------
create policy "leer planes" on public.planes for select to authenticated using (true);
create policy "staff escribe planes" on public.planes for all to authenticated
  using (public.es_staff('admin')) with check (public.es_staff('admin'));

create policy "leer modulos" on public.modulos for select to authenticated using (true);
create policy "staff escribe modulos" on public.modulos for all to authenticated
  using (public.es_staff('admin')) with check (public.es_staff('admin'));

create policy "leer plan_modulos" on public.plan_modulos for select to authenticated using (true);
create policy "staff escribe plan_modulos" on public.plan_modulos for all to authenticated
  using (public.es_staff('admin')) with check (public.es_staff('admin'));

create policy "leer permisos" on public.permisos for select to authenticated using (true);
create policy "staff escribe permisos" on public.permisos for all to authenticated
  using (public.es_staff('admin')) with check (public.es_staff('admin'));

-- ---------------------------------------------------------------------
-- staff_plataforma: cada uno ve su propia fila; el staff admin ve y escribe todo.
-- ---------------------------------------------------------------------
create policy "ver mi fila de staff" on public.staff_plataforma for select to authenticated
  using (usuario_id = auth.uid() or public.es_staff('admin'));
create policy "staff admin escribe staff" on public.staff_plataforma for all to authenticated
  using (public.es_staff('admin')) with check (public.es_staff('admin'));

-- ---------------------------------------------------------------------
-- usuarios: cada persona ve y edita solo su fila.
-- Los compañeros se ven con directorio_empresa() (nombre y foto, sin correo ni celular).
-- ---------------------------------------------------------------------
create policy "ver mi usuario" on public.usuarios for select to authenticated
  using (id = auth.uid());
create policy "editar mi usuario" on public.usuarios for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- cuentas: el propietario y quien puede configurar alguna de sus empresas.
-- Crear: solo la función del servidor crear_cuenta_y_empresa (migración 9).
-- ---------------------------------------------------------------------
create policy "ver cuenta" on public.cuentas for select to authenticated
  using (
    propietario_id = auth.uid()
    or exists (select 1 from public.empresas e
               where e.cuenta_id = cuentas.id
                 and public.tiene_permiso(e.id, 'configuracion.editar'))
    or public.es_staff()
  );
create policy "propietario edita cuenta" on public.cuentas for update to authenticated
  using (propietario_id = auth.uid()) with check (propietario_id = auth.uid());

-- ---------------------------------------------------------------------
-- suscripciones: la ven los miembros de sus empresas y el staff. Solo el servidor escribe.
-- ---------------------------------------------------------------------
create policy "ver suscripcion" on public.suscripciones for select to authenticated
  using (
    exists (select 1 from public.empresas e
            where e.cuenta_id = suscripciones.cuenta_id and public.es_miembro(e.id))
    or public.es_staff()
  );

-- ---------------------------------------------------------------------
-- empresas y su configuración: la ven sus miembros; edita quien tiene configuracion.editar.
-- ---------------------------------------------------------------------
create policy "ver empresa" on public.empresas for select to authenticated
  using (public.es_miembro(id) or public.es_staff());
create policy "editar empresa" on public.empresas for update to authenticated
  using (public.tiene_permiso(id, 'configuracion.editar'))
  with check (public.tiene_permiso(id, 'configuracion.editar'));

create policy "ver configuracion" on public.empresa_configuracion for select to authenticated
  using (public.es_miembro(empresa_id));
create policy "editar configuracion" on public.empresa_configuracion for update to authenticated
  using (public.tiene_permiso(empresa_id, 'configuracion.editar'))
  with check (public.tiene_permiso(empresa_id, 'configuracion.editar'));

-- ---------------------------------------------------------------------
-- perfiles: los ven sus miembros (y todos ven las plantillas); escribe usuarios.editar.
-- Los perfiles base no se borran.
-- ---------------------------------------------------------------------
create policy "ver perfiles" on public.perfiles for select to authenticated
  using (empresa_id is null or public.es_miembro(empresa_id));
create policy "crear perfiles" on public.perfiles for insert to authenticated
  with check (empresa_id is not null and not es_base and public.tiene_permiso(empresa_id, 'usuarios.editar'));
create policy "editar perfiles" on public.perfiles for update to authenticated
  using (empresa_id is not null and public.tiene_permiso(empresa_id, 'usuarios.editar'))
  with check (empresa_id is not null and public.tiene_permiso(empresa_id, 'usuarios.editar'));
create policy "borrar perfiles" on public.perfiles for delete to authenticated
  using (empresa_id is not null and not es_base and public.tiene_permiso(empresa_id, 'usuarios.editar'));

create policy "ver permisos de perfil" on public.perfil_permisos for select to authenticated
  using (exists (select 1 from public.perfiles p
                 where p.id = perfil_permisos.perfil_id
                   and (p.empresa_id is null or public.es_miembro(p.empresa_id))));
create policy "escribir permisos de perfil" on public.perfil_permisos for all to authenticated
  using (exists (select 1 from public.perfiles p
                 where p.id = perfil_permisos.perfil_id
                   and p.empresa_id is not null
                   and public.tiene_permiso(p.empresa_id, 'usuarios.editar')))
  with check (exists (select 1 from public.perfiles p
                 where p.id = perfil_permisos.perfil_id
                   and p.empresa_id is not null
                   and public.tiene_permiso(p.empresa_id, 'usuarios.editar')));

-- ---------------------------------------------------------------------
-- membresias: cada uno ve las suyas; quien tiene usuarios.ver ve las de su empresa.
-- Editar (perfil, acceso web, activar o desactivar): usuarios.editar.
-- Crear: solo funciones del servidor (registro y canje de invitación).
-- ---------------------------------------------------------------------
create policy "ver membresias" on public.membresias for select to authenticated
  using (usuario_id = auth.uid() or public.tiene_permiso(empresa_id, 'usuarios.ver'));
create policy "editar membresias" on public.membresias for update to authenticated
  using (public.tiene_permiso(empresa_id, 'usuarios.editar'))
  with check (public.tiene_permiso(empresa_id, 'usuarios.editar'));

-- Nadie se queda sin administrador: no se puede quitar ni desactivar al último que tiene usuarios.editar.
create or replace function public.proteger_ultimo_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quedan integer;
begin
  select count(*) into quedan
  from public.membresias m
  join public.perfil_permisos pp on pp.perfil_id = m.perfil_id and pp.permiso_codigo = 'usuarios.editar'
  where m.empresa_id = old.empresa_id
    and m.activo
    and m.id <> old.id;
  if quedan = 0 and (
       not new.activo
       or not exists (select 1 from public.perfil_permisos pp
                      where pp.perfil_id = new.perfil_id and pp.permiso_codigo = 'usuarios.editar')
     ) then
    raise exception 'La empresa no puede quedarse sin un administrador';
  end if;
  return new;
end;
$$;
create trigger proteger_ultimo_admin before update of activo, perfil_id on public.membresias
  for each row execute function public.proteger_ultimo_admin();
