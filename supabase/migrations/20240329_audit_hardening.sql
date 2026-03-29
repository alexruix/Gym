-- 1. SOPORTE PARA BORRADO LÓGICO (SOFT DELETE) EN ALUMNOS
ALTER TABLE alumnos ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. ACTUALIZAR RLS PARA FILTRAR ELIMINADOS
DROP POLICY IF EXISTS "Profesores gestionan sus alumnos" ON alumnos;
CREATE POLICY "Profesores gestionan sus alumnos" ON alumnos 
FOR ALL USING (auth.uid() = profesor_id AND deleted_at IS NULL);

-- 3. FUNCIÓN RPC: CREAR PLAN COMPLETO (TRANSACCIONAL)
-- Esta función garantiza que si algo falla al insertar un ejercicio, NO se crea el plan.
CREATE OR REPLACE FUNCTION crear_plan_completo(
  p_profesor_id uuid,
  p_nombre text,
  p_duracion_semanas int,
  p_frecuencia_semanal int,
  p_rutinas jsonb
) RETURNS uuid AS $$
DECLARE
  v_plan_id uuid;
  v_rutina_id uuid;
  v_rutina jsonb;
  v_ejercicio jsonb;
BEGIN
  -- Insertar Plan Maestro
  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal)
  VALUES (p_profesor_id, p_nombre, p_duracion_semanas, p_frecuencia_semanal)
  RETURNING id INTO v_plan_id;

  -- Iterar sobre rutinas
  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas)
  LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    -- Iterar sobre ejercicios de la rutina
    IF v_rutina ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina->'ejercicios')
      LOOP
        -- VALIDACIÓN IDOR: El ejercicio debe pertenecer al profesor
        IF NOT EXISTS (SELECT 1 FROM biblioteca_ejercicios WHERE id = (v_ejercicio->>'ejercicio_id')::uuid AND profesor_id = p_profesor_id) THEN
          RAISE EXCEPTION 'IDOR Detectado: El ejercicio % no pertenece al profesor %', (v_ejercicio->>'ejercicio_id'), p_profesor_id;
        END IF;

        INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden)
        VALUES (
          v_rutina_id, 
          (v_ejercicio->>'ejercicio_id')::uuid, 
          (v_ejercicio->>'series')::int, 
          v_ejercicio->>'reps_target', 
          (v_ejercicio->>'descanso_seg')::int, 
          (v_ejercicio->>'orden')::int
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
