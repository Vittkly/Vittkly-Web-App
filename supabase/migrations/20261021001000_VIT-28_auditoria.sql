-- =====================================================================
-- Migración 10 · Auditoría: el historial que nadie puede editar ni borrar
-- Historia: VIT-28
-- =====================================================================

create table public.auditoria (
  id           bigint generated always as identity primary key,
  empresa_id   uuid,            -- vacío = cambio de la plataforma
  usuario_id   uuid,            -- quién lo hizo (vacío = el sistema)
  accion       text not null check (accion in ('crear','editar','borrar')),
  tabla        text not null,
  registro_id  text,            -- id de la fila; en tablas de llave doble, las dos juntas
  antes        jsonb,
  despues      jsonb,
  creado_en    timestamptz not null default now()
);
create index auditoria_empresa_idx on public.auditoria (empresa_id, creado_en desc);
create index auditoria_registro_idx on public.auditoria (tabla, registro_id);

alter table public.auditoria enable row level security;

grant select on public.auditoria to authenticated;
create policy "ver auditoria de mi empresa" on public.auditoria for select to authenticated
  using (empresa_id is not null and public.tiene_permiso(empresa_id, 'auditoria.ver'));
create policy "staff ve auditoria" on public.auditoria for select to authenticated
  using (public.es_staff('admin'));

-- Ni la web, ni la app, ni el staff, ni la clave de servicio pueden cambiarla.
revoke insert, update, delete, truncate on public.auditoria from public, anon, authenticated, service_role;

-- Trigger genérico: guarda el antes y el después de cada cambio.
create or replace function public.auditar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fila    jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_emp   uuid;
  v_reg   text;
begin
  v_emp := case
             when tg_table_name = 'empresas' then (fila ->> 'id')::uuid
             when fila ? 'empresa_id' then (fila ->> 'empresa_id')::uuid
             else null
           end;
  v_reg := coalesce(fila ->> 'id',
                    fila ->> 'usuario_id',
                    nullif(concat_ws('/', fila ->> 'plan_id', fila ->> 'perfil_id',
                                          fila ->> 'modulo_codigo', fila ->> 'permiso_codigo'), ''),
                    fila ->> 'codigo');

  insert into public.auditoria (empresa_id, usuario_id, accion, tabla, registro_id, antes, despues)
  values (
    v_emp,
    auth.uid(),
    case tg_op when 'INSERT' then 'crear' when 'UPDATE' then 'editar' else 'borrar' end,
    tg_table_name,
    v_reg,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;
revoke execute on function public.auditar() from public, anon, authenticated;

-- Se conecta a todas las tablas de la Etapa 0 (menos intentos_ingreso y la propia auditoría).
create trigger auditar after insert or update or delete on public.planes                for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.modulos               for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.plan_modulos          for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.permisos              for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.staff_plataforma      for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.usuarios              for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.cuentas               for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.suscripciones         for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.empresas              for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.empresa_configuracion for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.perfiles              for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.perfil_permisos       for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.membresias            for each row execute function public.auditar();
create trigger auditar after insert or update or delete on public.invitaciones          for each row execute function public.auditar();
