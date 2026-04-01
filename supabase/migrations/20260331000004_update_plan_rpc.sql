-- RPC: actualizar_plan_completo
-- Permite actualizar un plan completo (nombre, rutinas, ejercicios, rotaciones) en una sola transacción.

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
BEGIN
  -- 1. Verificar propiedad y existencia
  IF NOT EXISTS (SELECT 1 FROM planes WHERE id = p_plan_id AND profesor_id = p_profesor_id) THEN
    RAISE EXCEPTION 'Plan no encontrado o no pertenece al profesor';
  END IF;

  -- 2. Actualizar Plan Maestro
  UPDATE planes 
  SET 
    nombre = p_nombre,
    duracion_semanas = p_duracion_semanas,
    frecuencia_semanal = p_frecuencia_semanal,
    updated_at = now()
  WHERE id = p_plan_id;

  -- 3. Limpiar rutinas y rotaciones existentes (CASCADE borrará ejercicios_plan)
  DELETE FROM rutinas_diarias WHERE plan_id = p_plan_id;
  DELETE FROM plan_rotaciones WHERE plan_id = p_plan_id;

  -- 4. Re-insertar Rutinas y Ejercicios
  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas)
  LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (p_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

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

  -- 5. Re-insertar Rotaciones
  IF p_rotaciones IS NOT NULL AND jsonb_array_length(p_rotaciones) > 0 THEN
    FOR v_rotacion IN SELECT * FROM jsonb_array_elements(p_rotaciones)
    LOOP
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
