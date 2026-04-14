-- Add protocol fields to "bloques" table
ALTER TABLE public.bloques 
ADD COLUMN IF NOT EXISTS tipo_bloque text DEFAULT 'agrupador' CHECK (tipo_bloque IN ('superserie', 'circuito', 'agrupador')),
ADD COLUMN IF NOT EXISTS vueltas integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS descanso_ronda integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS descanso_final integer DEFAULT 0;

-- Update routine exercises to support these fields when part of a block
ALTER TABLE public.ejercicios_plan
ADD COLUMN IF NOT EXISTS grupo_tipo_bloque text DEFAULT 'agrupador',
ADD COLUMN IF NOT EXISTS grupo_vueltas integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS grupo_descanso_ronda integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS grupo_descanso_final integer DEFAULT 0;

COMMENT ON COLUMN public.bloques.tipo_bloque IS 'Tipo de protocolo de ejecución (superserie, circuito, agrupador)';
COMMENT ON COLUMN public.bloques.vueltas IS 'Cantidad de veces que se repite el bloque (solo para circuitos)';
COMMENT ON COLUMN public.bloques.descanso_ronda IS 'Descanso entre rondas/vueltas del bloque';
COMMENT ON COLUMN public.bloques.descanso_final IS 'Descanso total al finalizar el bloque completo';

-- Actualizar RPC 1: crear_plan_completo
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
  IF p_profesor_id IS NOT NULL AND p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
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
        INSERT INTO ejercicios_plan (
          rutina_id, ejercicio_id, series, reps_target, peso_target, descanso_seg,
          orden, exercise_type, position, grupo_bloque_id, grupo_nombre, 
          grupo_tipo_bloque, grupo_vueltas, grupo_descanso_ronda, grupo_descanso_final, notas
        )
        VALUES (
          v_rutina_id,
          (v_ejercicio->>'ejercicio_id')::uuid,
          COALESCE((v_ejercicio->>'series')::int, 0),
          v_ejercicio->>'reps_target',
          v_ejercicio->>'peso_target',
          COALESCE((v_ejercicio->>'descanso_seg')::int, 0),
          COALESCE((v_ejercicio->>'orden')::int, 0),
          COALESCE((v_ejercicio->>'exercise_type')::exercise_type, 'base'::exercise_type),
          COALESCE((v_ejercicio->>'position')::int, (random() * 1000000000)::int),
          (v_ejercicio->>'grupo_bloque_id')::uuid,
          v_ejercicio->>'grupo_nombre',
          COALESCE(v_ejercicio->>'grupo_tipo_bloque', 'agrupador'),
          COALESCE((v_ejercicio->>'grupo_vueltas')::int, 1),
          COALESCE((v_ejercicio->>'grupo_descanso_ronda')::int, 0),
          COALESCE((v_ejercicio->>'grupo_descanso_final')::int, 0),
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

-- Actualizar RPC 2: actualizar_plan_completo
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
BEGIN
  IF p_profesor_id IS NOT NULL AND p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  UPDATE planes
  SET nombre = p_nombre, 
      duracion_semanas = p_duracion_semanas,
      frecuencia_semanal = p_frecuencia_semanal, 
      updated_at = now()
  WHERE id = p_plan_id;

  DELETE FROM plan_rotaciones WHERE plan_id = p_plan_id;
  DELETE FROM rutinas_diarias WHERE plan_id = p_plan_id;

  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas) LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (p_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    IF v_rutina ? 'ejercicios' THEN
      INSERT INTO ejercicios_plan (
        rutina_id, ejercicio_id, series, reps_target, peso_target, descanso_seg,
        orden, exercise_type, position, grupo_bloque_id, grupo_nombre, 
        grupo_tipo_bloque, grupo_vueltas, grupo_descanso_ronda, grupo_descanso_final, notas
      )
      SELECT 
        v_rutina_id,
        (ej->>'ejercicio_id')::uuid,
        COALESCE((ej->>'series')::int, 0),
        ej->>'reps_target',
        ej->>'peso_target',
        COALESCE((ej->>'descanso_seg')::int, 0),
        COALESCE((ej->>'orden')::int, 0),
        COALESCE((ej->>'exercise_type')::exercise_type, 'base'::exercise_type),
        COALESCE((ej->>'position')::int, (random() * 1000000000)::int),
        (ej->>'grupo_bloque_id')::uuid,
        ej->>'grupo_nombre',
        COALESCE(ej->>'grupo_tipo_bloque', 'agrupador'),
        COALESCE((ej->>'grupo_vueltas')::int, 1),
        COALESCE((ej->>'grupo_descanso_ronda')::int, 0),
        COALESCE((ej->>'grupo_descanso_final')::int, 0),
        COALESCE(ej->>'notas', '')
      FROM jsonb_array_elements(v_rutina->'ejercicios') AS ej;
    END IF;
  END LOOP;

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

-- Actualizar RPC 3: fork_plan
CREATE OR REPLACE FUNCTION fork_plan(
  p_plan_id uuid,
  p_alumno_id uuid,
  p_nuevo_nombre text
) RETURNS uuid AS $$
DECLARE
  v_new_plan_id uuid;
  v_profesor_id uuid;
  v_new_rutina_id uuid;
  v_rutina_rec record;
  v_ejercicio_rec record;
  v_rotacion_rec record;
BEGIN
  SELECT profesor_id INTO v_profesor_id FROM planes WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan origen no encontrado';
  END IF;

  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, is_template)
  SELECT profesor_id, p_nuevo_nombre, duracion_semanas, frecuencia_semanal, false
  FROM planes WHERE id = p_plan_id
  RETURNING id INTO v_new_plan_id;

  FOR v_rutina_rec IN SELECT * FROM rutinas_diarias WHERE plan_id = p_plan_id LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_new_plan_id, v_rutina_rec.dia_numero, v_rutina_rec.nombre_dia, v_rutina_rec.orden)
    RETURNING id INTO v_new_rutina_id;

    FOR v_ejercicio_rec IN SELECT * FROM ejercicios_plan WHERE rutina_id = v_rutina_rec.id LOOP
      INSERT INTO ejercicios_plan (
        rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden, 
        exercise_type, position, peso_target, grupo_bloque_id, grupo_nombre,
        grupo_tipo_bloque, grupo_vueltas, grupo_descanso_ronda, grupo_descanso_final, notas
      )
      VALUES (
        v_new_rutina_id, 
        v_ejercicio_rec.ejercicio_id, 
        v_ejercicio_rec.series, 
        v_ejercicio_rec.reps_target, 
        v_ejercicio_rec.descanso_seg, 
        v_ejercicio_rec.orden, 
        v_ejercicio_rec.exercise_type, 
        v_ejercicio_rec.position,
        v_ejercicio_rec.peso_target,
        v_ejercicio_rec.grupo_bloque_id,
        v_ejercicio_rec.grupo_nombre,
        v_ejercicio_rec.grupo_tipo_bloque,
        v_ejercicio_rec.grupo_vueltas,
        v_ejercicio_rec.grupo_descanso_ronda,
        v_ejercicio_rec.grupo_descanso_final,
        v_ejercicio_rec.notas
      );
    END LOOP;
  END LOOP;

  FOR v_rotacion_rec IN SELECT * FROM plan_rotaciones WHERE plan_id = p_plan_id LOOP
    INSERT INTO plan_rotaciones (plan_id, position, applies_to_days, cycles)
    VALUES (v_new_plan_id, v_rotacion_rec.position, v_rotacion_rec.applies_to_days, v_rotacion_rec.cycles);
  END LOOP;

  UPDATE alumnos SET plan_id = v_new_plan_id WHERE id = p_alumno_id AND profesor_id = v_profesor_id;

  RETURN v_new_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
