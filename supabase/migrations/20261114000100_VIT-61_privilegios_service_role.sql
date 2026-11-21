-- =====================================================================
-- Migración: 20261114000100_VIT-61_privilegios_service_role.sql
-- Propósito: Otorgar privilegios completos al rol service_role en public
--            y blindar RLS de public.usuarios para aislamiento de identidad
-- =====================================================================

-- 1. Privilegios totales para el rol del sistema service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- 2. Refuerzo de Row Level Security (RLS) en public.usuarios
-- Regla de Identidad Global: Una persona física es dueña de su cuenta global.
-- Un administrador de empresa NO puede mutar los datos personales de otro usuario.
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios FORCE ROW LEVEL SECURITY;

-- Lectura:
-- - El usuario siempre puede leer su propia fila.
-- - Los miembros de una misma empresa pueden ver a sus compañeros si tienen permiso 'usuarios.ver'.
DROP POLICY IF EXISTS "usuarios_select_propio" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_companeros_empresa" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select_miembros" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;

CREATE POLICY "usuarios_select_propio"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "usuarios_select_companeros_empresa"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.membresias m1
        JOIN public.membresias m2 ON m2.empresa_id = m1.empresa_id
       WHERE m1.usuario_id = auth.uid()
         AND m1.activo = true
         AND m1.estado = 'activa'
         AND m2.usuario_id = public.usuarios.id
         AND m2.activo = true
         AND m2.estado <> 'desvinculada'
         AND public.tiene_permiso(m1.empresa_id, 'usuarios.ver')
    )
  );

-- Actualización:
-- ESTRICTAMENTE el propio usuario puede actualizar sus datos personales (nombres, apellidos, celular, avatar).
-- Ningún administrador de empresa puede modificar directamente la fila de otro usuario en public.usuarios.
DROP POLICY IF EXISTS "usuarios_update_propio" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_admin" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;

CREATE POLICY "usuarios_update_propio"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Inserción:
-- Se permite únicamente para el propio usuario autenticado durante el onboarding.
DROP POLICY IF EXISTS "usuarios_insert_propio" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;

CREATE POLICY "usuarios_insert_propio"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
