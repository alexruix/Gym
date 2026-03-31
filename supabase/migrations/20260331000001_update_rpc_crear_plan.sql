-- ACTUALIZACIÓN DE RPC: crear_plan_completo
-- Agrega soporte para rotaciones (Auto-Pilot) y nuevos campos de ejercicio_type y position.

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
  -- 1. Insertar Plan Maestro
  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal)
  VALUES (p_profesor_id, p_nombre, p_duracion_semanas, p_frecuencia_semanal)
  RETURNING id INTO v_plan_id;

  -- 2. Iterar sobre rutinas
  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas)
  LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    -- 3. Iterar sobre ejercicios de la rutina
    IF v_rutina ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina->'ejercicios')
      LOOP
        -- VALIDACIÓN IDOR: El ejercicio debe pertenecer al profesor
        IF NOT EXISTS (SELECT 1 FROM biblioteca_ejercicios WHERE id = (v_ejercicio->>'ejercicio_id')::uuid AND profesor_id = p_profesor_id) THEN
          RAISE EXCEPTION 'IDOR Detectado: El ejercicio % no pertenece al profesor %', (v_ejercicio->>'ejercicio_id'), p_profesor_id;
        END IF;

        INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden, exercise_type, position)
        VALUES (
          v_rutina_id, 
          (v_ejercicio->>'ejercicio_id')::uuid, 
          (v_ejercicio->>'series')::int, 
          v_ejercicio->>'reps_target', 
          (v_ejercicio->>'descanso_seg')::int, 
          (v_ejercicio->>'orden')::int,
          COALESCE((v_ejercicio->>'exercise_type')::exercise_type, 'base'::exercise_type),
          COALESCE((v_ejercicio->>'position')::int, 0)
        );
      END LOOP;
    END IF;
  END LOOP;

  -- 4. Iterar sobre rotaciones
  IF p_rotaciones IS NOT NULL THEN
    FOR v_rotacion IN SELECT * FROM jsonb_array_elements(p_rotaciones)
    LOOP
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
