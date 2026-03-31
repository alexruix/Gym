-- MIGRACIÓN: Soporte para Forking Silencioso y Planes de Instancia
-- 1. Agregar flag is_template a planes
ALTER TABLE planes ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT true;

-- 2. RPC: fork_plan
-- Crea una copia profunda de un plan y lo asigna a un alumno específico.
CREATE OR REPLACE FUNCTION fork_plan(
  p_plan_id uuid,
  p_alumno_id uuid,
  p_nuevo_nombre text
) RETURNS uuid AS $$
DECLARE
  v_new_plan_id uuid;
  v_profesor_id uuid;
  v_rutina_map jsonb := '{}'::jsonb;
  v_old_rutina_id uuid;
  v_new_rutina_id uuid;
  v_rutina_rec record;
  v_ejercicio_rec record;
  v_rotacion_rec record;
BEGIN
  -- 1. Obtener profesor_id y validar existencia
  SELECT profesor_id INTO v_profesor_id FROM planes WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan origen no encontrado';
  END IF;

  -- 2. Insertar nuevo plan (is_template = false)
  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, monto, is_template)
  SELECT profesor_id, p_nuevo_nombre, duracion_semanas, frecuencia_semanal, monto, false
  FROM planes WHERE id = p_plan_id
  RETURNING id INTO v_new_plan_id;

  -- 3. Copiar rutinas_diarias y mapear IDs
  FOR v_rutina_rec IN SELECT * FROM rutinas_diarias WHERE plan_id = p_plan_id LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_new_plan_id, v_rutina_rec.dia_numero, v_rutina_rec.nombre_dia, v_rutina_rec.orden)
    RETURNING id INTO v_new_rutina_id;

    -- 4. Copiar ejercicios de esta rutina
    FOR v_ejercicio_rec IN SELECT * FROM ejercicios_plan WHERE rutina_id = v_rutina_rec.id LOOP
      INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden, exercise_type, position)
      VALUES (v_new_rutina_id, v_ejercicio_rec.ejercicio_id, v_ejercicio_rec.series, v_ejercicio_rec.reps_target, v_ejercicio_rec.descanso_seg, v_ejercicio_rec.orden, v_ejercicio_rec.exercise_type, v_ejercicio_rec.position);
    END LOOP;
  END LOOP;

  -- 5. Copiar rotaciones
  FOR v_rotacion_rec IN SELECT * FROM plan_rotaciones WHERE plan_id = p_plan_id LOOP
    INSERT INTO plan_rotaciones (plan_id, position, applies_to_days, cycles)
    VALUES (v_new_plan_id, v_rotacion_rec.position, v_rotacion_rec.applies_to_days, v_rotacion_rec.cycles);
  END LOOP;

  -- 6. Asignar el nuevo plan al alumno
  UPDATE alumnos SET plan_id = v_new_plan_id WHERE id = p_alumno_id AND profesor_id = v_profesor_id;

  RETURN v_new_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
