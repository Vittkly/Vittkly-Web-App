-- =====================================================================
-- Migración: 20261114000200_saneamiento_usuarios.sql
-- Propósito: Alinear constraints de tipo_documento al estándar VIT-60
--            y ejecutar saneamiento idempotente de usuarios e invitaciones
--            (DNI ficticio secuencial, nombres/apellidos y celular +51)
-- =====================================================================

-- 0. Alinear constraints de tipo_documento en public.usuarios y public.invitaciones
--    (En entornos donde la columna existía antes de VIT-60 con valores en minúsculas
--     como 'dni' / 'ce', ADD COLUMN IF NOT EXISTS conservó el CHECK anterior).
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT n.nspname AS schema_name,
           cl.relname AS table_name,
           con.conname AS constraint_name
      FROM pg_constraint con
      JOIN pg_class cl ON cl.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = cl.relnamespace
     WHERE con.contype = 'c'
       AND n.nspname = 'public'
       AND cl.relname IN ('usuarios', 'invitaciones')
       AND pg_get_constraintdef(con.oid) ILIKE '%tipo_documento%'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
      c.schema_name,
      c.table_name,
      c.constraint_name
    );
  END LOOP;
END $$;

-- Normalizar valores legados si existieran antes de aplicar el constraint oficial
UPDATE public.usuarios
   SET tipo_documento = CASE lower(btrim(tipo_documento))
     WHEN 'dni' THEN 'DNI'
     WHEN 'ce' THEN 'carné de extranjería'
     WHEN 'carne de extranjeria' THEN 'carné de extranjería'
     WHEN 'carné de extranjería' THEN 'carné de extranjería'
     WHEN 'pasaporte' THEN 'pasaporte'
     ELSE NULL
   END
 WHERE tipo_documento IS NOT NULL
   AND tipo_documento NOT IN ('DNI', 'carné de extranjería', 'pasaporte');

UPDATE public.invitaciones
   SET tipo_documento = CASE lower(btrim(tipo_documento))
     WHEN 'dni' THEN 'DNI'
     WHEN 'ce' THEN 'carné de extranjería'
     WHEN 'carne de extranjeria' THEN 'carné de extranjería'
     WHEN 'carné de extranjería' THEN 'carné de extranjería'
     WHEN 'pasaporte' THEN 'pasaporte'
     ELSE NULL
   END
 WHERE tipo_documento IS NOT NULL
   AND tipo_documento NOT IN ('DNI', 'carné de extranjería', 'pasaporte');

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_tipo_documento_check
  CHECK (tipo_documento IS NULL OR tipo_documento IN ('DNI', 'carné de extranjería', 'pasaporte'));

ALTER TABLE public.invitaciones
  ADD CONSTRAINT invitaciones_tipo_documento_check
  CHECK (tipo_documento IS NULL OR tipo_documento IN ('DNI', 'carné de extranjería', 'pasaporte'));

-- Saneamiento principal
DO $$
DECLARE
  r RECORD;
  v_num INT := 70000001;
  v_doc_type TEXT;
  v_full TEXT;
  v_words TEXT[];
  v_word_count INT;
  v_nombres TEXT;
  v_apellidos TEXT;
  v_clean_phone TEXT;
BEGIN
  -- 1. Asignar tipo_documento = 'DNI' (o conservar válido) y numero_documento ficticio único
  FOR r IN
    SELECT id, tipo_documento, numero_documento
      FROM public.usuarios
     WHERE numero_documento IS NULL OR btrim(numero_documento) = ''
     ORDER BY creado_en ASC
     FOR UPDATE
  LOOP
    v_doc_type := coalesce(nullif(btrim(r.tipo_documento), ''), 'DNI');

    WHILE EXISTS (
      SELECT 1
        FROM public.usuarios
       WHERE tipo_documento = v_doc_type
         AND numero_documento = v_num::text
    ) LOOP
      v_num := v_num + 1;
    END LOOP;

    UPDATE public.usuarios
       SET tipo_documento = v_doc_type,
           numero_documento = v_num::text
     WHERE id = r.id;

    v_num := v_num + 1;
  END LOOP;

  -- 2. Separar nombres y apellidos estructurados sin alterar el nombre completo
  FOR r IN
    SELECT id, nombre, nombres, apellidos
      FROM public.usuarios
     WHERE (nombres IS NULL OR btrim(nombres) = '')
        OR (apellidos IS NULL OR btrim(apellidos) = '')
     FOR UPDATE
  LOOP
    v_full := btrim(regexp_replace(coalesce(nullif(btrim(r.nombre), ''), nullif(btrim(r.nombres), ''), 'Usuario'), '\s+', ' ', 'g'));
    v_words := string_to_array(v_full, ' ');
    v_word_count := coalesce(array_length(v_words, 1), 0);

    IF v_word_count >= 4 THEN
      -- E.g. "Abraham Paolo Navarrete Requena" -> "Abraham Paolo" / "Navarrete Requena"
      v_nombres := array_to_string(v_words[1:2], ' ');
      v_apellidos := array_to_string(v_words[3:v_word_count], ' ');
    ELSIF v_word_count >= 2 THEN
      -- E.g. "Wilmer Abanto" o "Andree Alegre Sevilla" -> 1ra palabra / resto
      v_nombres := v_words[1];
      v_apellidos := array_to_string(v_words[2:v_word_count], ' ');
    ELSE
      v_nombres := v_full;
      v_apellidos := coalesce(nullif(btrim(r.apellidos), ''), '');
    END IF;

    UPDATE public.usuarios
       SET nombres = v_nombres,
           apellidos = nullif(v_apellidos, ''),
           nombre = v_full
     WHERE id = r.id;
  END LOOP;

  -- 3. Normalizar teléfonos con prefijo +51 en usuarios (cumpliendo regex ^\+[1-9][0-9]{7,14}$)
  FOR r IN
    SELECT id, celular
      FROM public.usuarios
     WHERE celular IS NOT NULL
       AND btrim(celular) <> ''
       AND NOT celular LIKE '+%'
     FOR UPDATE
  LOOP
    v_clean_phone := regexp_replace(r.celular, '\D', '', 'g');
    IF v_clean_phone ~ '^[1-9][0-9]{8}$' THEN
      UPDATE public.usuarios
         SET celular = '+51' || v_clean_phone
       WHERE id = r.id;
    END IF;
  END LOOP;

  -- 4. Normalizar teléfonos en invitaciones
  FOR r IN
    SELECT id, celular
      FROM public.invitaciones
     WHERE celular IS NOT NULL
       AND btrim(celular) <> ''
       AND NOT celular LIKE '+%'
     FOR UPDATE
  LOOP
    v_clean_phone := regexp_replace(r.celular, '\D', '', 'g');
    IF v_clean_phone ~ '^[1-9][0-9]{8}$' THEN
      UPDATE public.invitaciones
         SET celular = '+51' || v_clean_phone
       WHERE id = r.id;
    END IF;
  END LOOP;

  -- 5. Garantizar que toda membresía tenga un perfil_id válido (códigos base 'admin' / 'tecnico')
  UPDATE public.membresias m
     SET perfil_id = (
       SELECT p.id
         FROM public.perfiles p
        WHERE p.empresa_id = m.empresa_id
          AND p.codigo = CASE WHEN m.es_propietario THEN 'admin' ELSE 'tecnico' END
        LIMIT 1
     )
   WHERE m.perfil_id IS NULL;

END $$;
