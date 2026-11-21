-- =============================================================================
-- VIT-65: Submódulo /dashboard/configuraciones/empresa (Mi Negocio -> Empresa)
-- Migración aditiva e idempotente:
-- 1. Columnas rubro, ciudad e icono_menu_ruta en public.empresas
-- 2. Función de autorización public.puede_editar_configuracion_empresa(uuid)
-- 3. FORCE ROW LEVEL SECURITY + políticas RLS en empresas y empresa_configuracion
-- 4. RPC atómica public.actualizar_configuracion_empresa(...)
-- 5. Bucket público 'brand-assets' y políticas RLS en storage.objects
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Columnas aditivas en public.empresas
-- -----------------------------------------------------------------------------
alter table public.empresas
  add column if not exists rubro text,
  add column if not exists ciudad text,
  add column if not exists icono_menu_ruta text;

-- Asegurar que todas las empresas existentes tengan su fila en empresa_configuracion
insert into public.empresa_configuracion (empresa_id)
select e.id
from public.empresas e
on conflict (empresa_id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Función de autorización: Propietario, Admin/Administrador o configuracion.editar
--    Autocontenida en PL/pgSQL (sin depender de es_staff ni funciones anidadas con search_path='')
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 3. RLS estricto y políticas en public.empresas y public.empresa_configuracion
-- -----------------------------------------------------------------------------
alter table public.empresas enable row level security;
alter table public.empresas force row level security;

alter table public.empresa_configuracion enable row level security;
alter table public.empresa_configuracion force row level security;

grant select, insert, update on public.empresa_configuracion to authenticated;

drop policy if exists "editar empresa" on public.empresas;
create policy "editar empresa"
  on public.empresas
  for update
  to authenticated
  using (public.puede_editar_configuracion_empresa(id))
  with check (public.puede_editar_configuracion_empresa(id));

drop policy if exists "ver configuracion" on public.empresa_configuracion;
create policy "ver configuracion"
  on public.empresa_configuracion
  for select
  to authenticated
  using (public.es_miembro(empresa_id));

drop policy if exists "insertar configuracion" on public.empresa_configuracion;
create policy "insertar configuracion"
  on public.empresa_configuracion
  for insert
  to authenticated
  with check (public.puede_editar_configuracion_empresa(empresa_id));

drop policy if exists "editar configuracion" on public.empresa_configuracion;
create policy "editar configuracion"
  on public.empresa_configuracion
  for update
  to authenticated
  using (public.puede_editar_configuracion_empresa(empresa_id))
  with check (public.puede_editar_configuracion_empresa(empresa_id));

-- -----------------------------------------------------------------------------
-- 4. RPC atómica para guardar configuración de empresa + menú/modelo de operación
-- -----------------------------------------------------------------------------
create or replace function public.actualizar_configuracion_empresa(
  p_empresa_id uuid,
  p_razon_social text,
  p_nombre_comercial text,
  p_ruc text default null,
  p_direccion text default null,
  p_rubro text default null,
  p_ciudad text default null,
  p_whatsapp_telefono text default null,
  p_encabezado_documento text default null,
  p_pie_pagina_documento text default null,
  p_logo_ruta text default null,
  p_icono_menu_ruta text default null,
  p_color_marca text default '#2AA8DE',
  p_modelo_operacion text default 'ambos',
  p_menu_acordeon boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ruc text := nullif(btrim(coalesce(p_ruc, '')), '');
  v_razon_social text := btrim(coalesce(p_razon_social, ''));
  v_nombre_comercial text := btrim(coalesce(p_nombre_comercial, ''));
  v_color_marca text := coalesce(nullif(btrim(p_color_marca), ''), '#2AA8DE');
  v_modelo text := coalesce(nullif(btrim(p_modelo_operacion), ''), 'ambos');
  v_ajustes_actuales jsonb := '{}'::jsonb;
  v_ajustes_nuevos jsonb;
begin
  if not public.puede_editar_configuracion_empresa(p_empresa_id) then
    raise exception 'No tienes permisos para editar la configuración de esta empresa.'
      using errcode = '42501';
  end if;

  if char_length(v_razon_social) < 3 then
    raise exception 'La razón social debe tener al menos 3 caracteres.'
      using errcode = '22023';
  end if;

  if char_length(v_nombre_comercial) < 2 then
    raise exception 'El nombre comercial de la empresa debe tener al menos 2 caracteres.'
      using errcode = '22023';
  end if;

  if v_ruc is not null and v_ruc !~ '^[0-9]{11}$' then
    raise exception 'El RUC debe contener exactamente 11 dígitos numéricos.'
      using errcode = '22023';
  end if;

  if v_color_marca !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'El color de marca debe estar en formato hexadecimal (#RRGGBB).'
      using errcode = '22023';
  end if;

  if v_modelo not in ('visita', 'contrato', 'ambos') then
    raise exception 'El modelo de operación debe ser visita, contrato o ambos.'
      using errcode = '22023';
  end if;

  update public.empresas
  set
    razon_social = v_razon_social,
    nombre_comercial = v_nombre_comercial,
    ruc = v_ruc,
    direccion = nullif(btrim(coalesce(p_direccion, '')), ''),
    rubro = nullif(btrim(coalesce(p_rubro, '')), ''),
    ciudad = nullif(btrim(coalesce(p_ciudad, '')), ''),
    logo_ruta = nullif(btrim(coalesce(p_logo_ruta, '')), ''),
    icono_menu_ruta = nullif(btrim(coalesce(p_icono_menu_ruta, '')), ''),
    color_marca = v_color_marca,
    modelo_operacion = v_modelo,
    actualizado_en = now(),
    actualizado_por = auth.uid()
  where id = p_empresa_id;

  select coalesce(ec.ajustes, '{}'::jsonb)
  into v_ajustes_actuales
  from public.empresa_configuracion ec
  where ec.empresa_id = p_empresa_id;

  v_ajustes_nuevos := (v_ajustes_actuales - 'menu_acordeon') || jsonb_build_object(
    'whatsapp_telefono', nullif(btrim(coalesce(p_whatsapp_telefono, '')), ''),
    'encabezado_documento', nullif(btrim(coalesce(p_encabezado_documento, '')), ''),
    'pie_pagina_documento', nullif(btrim(coalesce(p_pie_pagina_documento, '')), '')
  );

  insert into public.empresa_configuracion (
    empresa_id,
    menu_acordeon,
    ajustes,
    creado_por,
    actualizado_por
  )
  values (
    p_empresa_id,
    coalesce(p_menu_acordeon, false),
    v_ajustes_nuevos,
    auth.uid(),
    auth.uid()
  )
  on conflict (empresa_id) do update
  set
    menu_acordeon = excluded.menu_acordeon,
    ajustes = excluded.ajustes,
    actualizado_en = now(),
    actualizado_por = auth.uid();

  return jsonb_build_object(
    'empresa_id', p_empresa_id,
    'actualizado', true
  );
end;
$$;

revoke all on function public.actualizar_configuracion_empresa(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, boolean
) from public;
grant execute on function public.actualizar_configuracion_empresa(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, boolean
) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Supabase Storage: Bucket 'brand-assets' + Políticas RLS
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
