-- =============================================================================
-- VIT-65 (Hotfix RLS Storage & Empresa):
-- Elimina la dependencia de public.es_staff() y funciones LANGUAGE sql con
-- search_path='' dentro de public.puede_editar_configuracion_empresa(uuid)
-- y protege la evaluación de foldername()::uuid en storage.objects.
-- =============================================================================

begin;

create or replace function public.puede_editar_configuracion_empresa(p_empresa_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_ok boolean := false;
begin
  if v_uid is null or p_empresa_id is null then
    return false;
  end if;

  select exists (
    select 1
    from public.membresias m
    left join public.perfiles p on p.id = m.perfil_id
    where m.empresa_id = p_empresa_id
      and m.usuario_id = v_uid
      and m.activo = true
      and m.estado = 'activa'
      and m.desvinculada_en is null
      and (
        m.es_propietario = true
        or lower(coalesce(p.codigo, '')) in ('admin', 'administrador')
        or exists (
          select 1
          from public.perfil_permisos pp
          where pp.perfil_id = m.perfil_id
            and pp.permiso_codigo = 'configuracion.editar'
            and coalesce(pp.alcance, 'todas') <> 'ninguna'
        )
      )
  )
  into v_ok;

  return coalesce(v_ok, false);
end;
$$;

revoke all on function public.puede_editar_configuracion_empresa(uuid) from public, anon;
grant execute on function public.puede_editar_configuracion_empresa(uuid) to authenticated, service_role;

drop policy if exists "ver configuracion" on public.empresa_configuracion;
create policy "ver configuracion"
  on public.empresa_configuracion
  for select
  to authenticated
  using (public.es_miembro(empresa_id));

drop policy if exists "brand_assets_select" on storage.objects;
create policy "brand_assets_select"
  on storage.objects
  for select
  to public
  using (bucket_id = 'brand-assets');

drop policy if exists "brand_assets_insert" on storage.objects;
create policy "brand_assets_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'brand-assets'
    and public.puede_editar_configuracion_empresa(
      case
        when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then ((storage.foldername(name))[1])::uuid
        else null
      end
    )
  );

drop policy if exists "brand_assets_update" on storage.objects;
create policy "brand_assets_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'brand-assets'
    and public.puede_editar_configuracion_empresa(
      case
        when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then ((storage.foldername(name))[1])::uuid
        else null
      end
    )
  )
  with check (
    bucket_id = 'brand-assets'
    and public.puede_editar_configuracion_empresa(
      case
        when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then ((storage.foldername(name))[1])::uuid
        else null
      end
    )
  );

drop policy if exists "brand_assets_delete" on storage.objects;
create policy "brand_assets_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'brand-assets'
    and public.puede_editar_configuracion_empresa(
      case
        when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then ((storage.foldername(name))[1])::uuid
        else null
      end
    )
  );

commit;
