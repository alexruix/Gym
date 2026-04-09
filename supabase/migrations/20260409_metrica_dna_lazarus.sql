-- MiGym | Migración: ADN y Efecto Lázaro (V4) - HARDENING
-- Fecha: 2026-04-09
-- Descripción: Implementa el Soft Delete corporativo, preservación de métricas y refuerzo de seguridad RLS/RPC.

-- 1. Actualizar esquema de tabla
ALTER TABLE ejercicios_plan ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Asegurar que 'position' sea un identificador único por rutina para la conciliación
UPDATE ejercicios_plan SET position = (random() * 1000000000)::int WHERE position = 0;

ALTER TABLE ejercicios_plan DROP CONSTRAINT IF EXISTS unique_rutina_position;
ALTER TABLE ejercicios_plan ADD CONSTRAINT unique_rutina_position UNIQUE (rutina_id, position);

-- 3. Refactorizar RPC: crear_plan_completo (HARDENING + SECURITY)
CREATE OR REPLACE FUNCTION crear_plan_completo(
  p_profesor_id uuid,
  p_nombre text,
  p_duracion_semanas int,
  p_frecuencia_semanal int,
  p_rutinas jsonb,
  p_rotaciones jsonb DEFAULT '[]'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_plan_id uuid;
  v_rutina_id uuid;
  v_rutina jsonb;
  v_ejercicio jsonb;
  v_rotacion jsonb;
BEGIN
  -- SEGURIDAD: Validar que el profesor que ejecuta sea el dueño
  IF p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado: El ID de profesor no coincide con el usuario autenticado';
  END IF;

  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, is_template)
  VALUES (p_profesor_id, p_nombre, p_duracion_semanas, p_frecuencia_semanal, true)
  RETURNING id INTO v_plan_id;

  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas) LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    IF v_rutina ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina->'ejercicios') LOOP
          rutina_id, ejercicio_id, series, reps_target, peso_target, descanso_seg,
          orden, exercise_type, position, grupo_bloque_id, grupo_nombre, notas
        )
        VALUES (
          v_rutina_id,
          (v_ejercicio->>'ejercicio_id')::uuid,
          0,    -- ADN: Neutral
          NULL, -- ADN: Neutral
          NULL, -- ADN: Neutral
          0,    -- ADN: Neutral
          COALESCE((v_ejercicio->>'orden')::int, 0),
          COALESCE((v_ejercicio->>'exercise_type')::exercise_type, 'base'::exercise_type),
          COALESCE((v_ejercicio->>'position')::int, (random() * 1000000000)::int),
          (v_ejercicio->>'grupo_bloque_id')::uuid,
          v_ejercicio->>'grupo_nombre',
          COALESCE(v_ejercicio->>'notas', '')
        );
      END LOOP;
    END IF;
  END LOOP;

  IF p_rotaciones IS NOT NULL AND jsonb_array_length(p_rotaciones) > 0 THEN
    FOR v_rotacion IN SELECT * FROM jsonb_array_elements(p_rotaciones) LOOP
      INSERT INTO plan_rotaciones (plan_id, position, applies_to_days, cycles)
      VALUES (
        v_plan_id,
        (v_rotacion->>'position')::int,
        ARRAY(SELECT jsonb_array_elements_text(v_rotacion->'applies_to_days')),
        v_rotacion->'cycles'
      );
    END LOOP;
  END IF;

  RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Refactorizar RPC: actualizar_plan_completo (HARDENING + SECURITY)
CREATE OR REPLACE FUNCTION actualizar_plan_completo(
  p_plan_id uuid,
  p_profesor_id uuid,
  p_nombre text,
  p_duracion_semanas int,
  p_frecuencia_semanal int,
  p_rutinas jsonb,
  p_rotaciones jsonb DEFAULT '[]'::jsonb
) RETURNS boolean AS $$
DECLARE
  v_rutina_id uuid;
  v_rutina jsonb;
  v_ejercicio jsonb;
  v_rotacion jsonb;
  v_is_template boolean;
BEGIN
  -- SEGURIDAD: Validar que el profesor que ejecuta sea el dueño
  IF p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado: El ID de profesor no coincide con el usuario autenticado';
  END IF;

  -- Verificar propiedad del plan específico
  SELECT is_template INTO v_is_template FROM planes WHERE id = p_plan_id AND profesor_id = p_profesor_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan no encontrado o no pertenece al profesor';
  END IF;

  -- 1. Actualizar metadatos del plan
  UPDATE planes
  SET nombre = p_nombre, 
      duracion_semanas = p_duracion_semanas,
      frecuencia_semanal = p_frecuencia_semanal, 
      updated_at = now()
  WHERE id = p_plan_id;

  -- 2. Limpiar rotaciones
  DELETE FROM plan_rotaciones WHERE plan_id = p_plan_id;

  -- 3. Conciliación de Rutinas y Ejercicios
  UPDATE ejercicios_plan 
  SET deleted_at = now() 
  WHERE rutina_id IN (SELECT id FROM rutinas_diarias WHERE plan_id = p_plan_id);

  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas) LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (p_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    ON CONFLICT (plan_id, dia_numero) DO UPDATE 
    SET nombre_dia = EXCLUDED.nombre_dia, orden = EXCLUDED.orden
    RETURNING id INTO v_rutina_id;

    IF v_rutina ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina->'ejercicios') LOOP
        INSERT INTO ejercicios_plan (
          rutina_id, ejercicio_id, position, orden, 
          series, reps_target, peso_target, descanso_seg,
          exercise_type, grupo_bloque_id, grupo_nombre, notas, deleted_at
        )
        VALUES (
          v_rutina_id,
          (v_ejercicio->>'ejercicio_id')::uuid,
          (v_ejercicio->>'position')::int,
          (v_ejercicio->>'orden')::int,
          CASE WHEN v_is_template THEN 0 ELSE 3 END,
          CASE WHEN v_is_template THEN NULL ELSE '12' END,
          CASE WHEN v_is_template THEN NULL ELSE '10' END,
          CASE WHEN v_is_template THEN 0 ELSE 60 END,
          COALESCE((v_ejercicio->>'exercise_type')::exercise_type, 'base'::exercise_type),
          (v_ejercicio->>'grupo_bloque_id')::uuid,
          v_ejercicio->>'grupo_nombre',
          COALESCE(v_ejercicio->>'notas', ''),
          NULL 
        )
        ON CONFLICT (rutina_id, position) DO UPDATE SET
          ejercicio_id = EXCLUDED.ejercicio_id,
          orden = EXCLUDED.orden,
          exercise_type = EXCLUDED.exercise_type,
          grupo_bloque_id = EXCLUDED.grupo_bloque_id,
          grupo_nombre = EXCLUDED.grupo_nombre,
          notas = EXCLUDED.notas,
          deleted_at = NULL, 
          updated_at = now();
      END LOOP;
    END IF;
  END LOOP;

  -- 4. Recrear rotaciones
  IF p_rotaciones IS NOT NULL AND jsonb_array_length(p_rotaciones) > 0 THEN
    FOR v_rotacion IN SELECT * FROM jsonb_array_elements(p_rotaciones) LOOP
      INSERT INTO plan_rotaciones (plan_id, position, applies_to_days, cycles)
      VALUES (
        p_plan_id,
        (v_rotacion->>'position')::int,
        ARRAY(SELECT jsonb_array_elements_text(v_rotacion->'applies_to_days')),
        v_rotacion->'cycles'
      );
    END LOOP;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REFUERZO DE RLS PARA ALUMNOS (VITAL PARA EL ORGANISMO)

-- A. Permitir que los alumnos lean los ejercicios de su propio plan
DROP POLICY IF EXISTS "alumnos_leen_sus_ejercicios" ON ejercicios_plan;
CREATE POLICY "alumnos_leen_sus_ejercicios" ON ejercicios_plan FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM alumnos a
    JOIN rutinas_diarias rd ON rd.plan_id = a.plan_id
    WHERE (a.user_id = auth.uid() OR a.email = (auth.jwt() ->> 'email')) AND rd.id = ejercicios_plan.rutina_id
  )
);

-- B. Permitir que los alumnos gestionen sus propias personalizaciones (Overrides)
DROP POLICY IF EXISTS "alumnos_gestionan_personalizaciones" ON ejercicio_plan_personalizado;
CREATE POLICY "alumnos_gestionan_personalizaciones" ON ejercicio_plan_personalizado FOR ALL USING (
  EXISTS (
    SELECT 1 FROM alumnos a
    WHERE a.id = ejercicio_plan_personalizado.alumno_id 
    AND (a.user_id = auth.uid() OR a.email = (auth.jwt() ->> 'email'))
  )
);

-- C. Permitir que los alumnos actualicen su propio plan privado (DEEP SYNC)
DROP POLICY IF EXISTS "alumnos_actualizan_su_propio_plan" ON ejercicios_plan;
CREATE POLICY "alumnos_actualizan_su_propio_plan" ON ejercicios_plan FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM alumnos a
    JOIN planes p ON a.plan_id = p.id
    JOIN rutinas_diarias rd ON rd.plan_id = p.id
    WHERE (a.user_id = auth.uid() OR a.email = (auth.jwt() ->> 'email')) 
    AND rd.id = ejercicios_plan.rutina_id
    AND p.is_template = false -- Solo en planes privados/forked
  )
);

-- 6. Limpieza de Templates existentes (ADN Estéril)
UPDATE ejercicios_plan 
SET series = 0, reps_target = NULL, peso_target = NULL, descanso_seg = 0
WHERE rutina_id IN (
  SELECT rd.id FROM rutinas_diarias rd
  JOIN planes p ON rd.plan_id = p.id
  WHERE p.is_template = true
);

COMMENT ON COLUMN ejercicios_plan.deleted_at IS 'Marca de archivado lógico para preservación de métricas de alumnos (Efecto Lázaro).';
