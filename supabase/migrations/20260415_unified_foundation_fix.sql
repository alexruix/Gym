-- 🔥 MiGym | Unified Foundation Fix (V2.7)
-- Restauración de RPCs críticas y blindaje de esquema para Bloques.

-- 1. HARDENING DE ESQUEMA: Columnas de Bloques en ejercicios_plan
ALTER TABLE public.ejercicios_plan 
ADD COLUMN IF NOT EXISTS grupo_tipo_bloque text DEFAULT 'agrupador' CHECK (grupo_tipo_bloque IN ('superserie', 'circuito', 'agrupador')),
ADD COLUMN IF NOT EXISTS grupo_vueltas integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS grupo_descanso_ronda integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS grupo_descanso_final integer DEFAULT 0;

-- 2. RPC: get_structural_day_sql
-- Versión SQL de la lógica de calendario operativo (schedule.ts).
CREATE OR REPLACE FUNCTION get_structural_day_sql(
  p_fecha_inicio date,
  p_fecha_objetivo date,
  p_available_dia_nums int[],
  p_dias_asistencia_nums int[]
) RETURNS int AS $$
DECLARE
  v_count int := 0;
  v_iter date;
  v_dia_semana int;
  v_es_asistencia boolean;
  v_dia_abs int;
BEGIN
  -- 1. Validar hoy si se proveen días de asistencia específicos
  IF p_dias_asistencia_nums IS NOT NULL AND array_length(p_dias_asistencia_nums, 1) > 0 THEN
    IF NOT (extract(dow from p_fecha_objetivo)::int = ANY(p_dias_asistencia_nums)) THEN
      RETURN 0;
    END IF;
  END IF;

  -- 2. Calcular número de día absoluto de entrenamiento (Día 1, Día 2...)
  -- El Día 1 es el primer día de asistencia >= p_fecha_inicio
  v_iter := p_fecha_inicio;
  WHILE v_iter <= p_fecha_objetivo LOOP
    v_dia_semana := extract(dow from v_iter)::int;
    v_es_asistencia := (p_dias_asistencia_nums IS NULL OR array_length(p_dias_asistencia_nums, 1) = 0 OR v_dia_semana = ANY(p_dias_asistencia_nums));
    
    IF v_es_asistencia THEN
      v_count := v_count + 1;
    END IF;
    v_iter := v_iter + interval '1 day';
  END LOOP;

  IF v_count <= 0 OR array_length(p_available_dia_nums, 1) = 0 THEN
    RETURN 0;
  END IF;

  -- 3. Mapear al día estructural del plan (cíclico)
  RETURN p_available_dia_nums[((v_count - 1) % array_length(p_available_dia_nums, 1)) + 1];
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. RPC: instanciar_sesion_alumno
-- Centraliza la creación de una sesión operativa a partir de la estructura.
CREATE OR REPLACE FUNCTION instanciar_sesion_alumno(
  p_alumno_id uuid,
  p_fecha_real date,
  p_force_rutina_id uuid DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_alumno record;
  v_rutina record;
  v_sesion_id uuid;
  v_fecha_inicio date;
  v_dias_asistencia_nums int[];
  v_available_dia_nums int[];
  v_dia_estructural int;
  v_semana_numero int;
  v_count_asistencia int := 0;
  v_iter date;
BEGIN
  -- 1. Obtener contexto del alumno
  SELECT * INTO v_alumno FROM alumnos WHERE id = p_alumno_id;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Alumno no encontrado'); END IF;
  IF v_alumno.plan_id IS NULL THEN RETURN json_build_object('error', 'El alumno no tiene un plan asignado'); END IF;

  v_fecha_inicio := COALESCE(v_alumno.fecha_inicio, v_alumno.created_at::date);

  -- 2. Resolver días de asistencia (indices 0-6)
  SELECT array_accum(idx) INTO v_dias_asistencia_nums
  FROM (
    SELECT CASE lower(d)
      WHEN 'domingo' THEN 0 WHEN 'lunes' THEN 1 WHEN 'martes' THEN 2 
      WHEN 'miércoles' THEN 3 WHEN 'miercoles' THEN 3 WHEN 'jueves' THEN 4 
      WHEN 'viernes' THEN 5 WHEN 'sábado' THEN 6 WHEN 'sabado' THEN 6
    END as idx
    FROM unnest(v_alumno.dias_asistencia) d
  ) t WHERE idx IS NOT NULL;

  -- 3. Resolver día estructural y semana
  IF p_force_rutina_id IS NOT NULL THEN
    SELECT * INTO v_rutina FROM rutinas_diarias WHERE id = p_force_rutina_id;
  ELSE
    SELECT array_agg(dia_numero ORDER BY dia_numero) INTO v_available_dia_nums
    FROM rutinas_diarias WHERE plan_id = v_alumno.plan_id;

    v_dia_estructural := get_structural_day_sql(v_fecha_inicio, p_fecha_real, v_available_dia_nums, v_dias_asistencia_nums);
    
    IF v_dia_estructural = 0 THEN
      RETURN json_build_object('error', 'Hoy no es un día de entrenamiento programado para este alumno');
    END IF;

    SELECT * INTO v_rutina FROM rutinas_diarias WHERE plan_id = v_alumno.plan_id AND dia_numero = v_dia_estructural;
  END IF;

  IF v_rutina.id IS NULL THEN RETURN json_build_object('error', 'No se encontró la rutina para este día'); END IF;

  -- Calcular semana (Nº de visitas / Frecuencia)
  v_iter := v_fecha_inicio;
  WHILE v_iter <= p_fecha_real LOOP
    IF v_dias_asistencia_nums IS NULL OR array_length(v_dias_asistencia_nums, 1) = 0 OR extract(dow from v_iter)::int = ANY(v_dias_asistencia_nums) THEN
      v_count_asistencia := v_count_asistencia + 1;
    END IF;
    v_iter := v_iter + interval '1 day';
  END LOOP;
  
  IF v_dias_asistencia_nums IS NOT NULL AND array_length(v_dias_asistencia_nums, 1) > 0 THEN
    v_semana_numero := ceil(v_count_asistencia::float / array_length(v_dias_asistencia_nums, 1));
  ELSE
    v_semana_numero := ceil(v_count_asistencia::float / 7);
  END IF;

  -- 4. Crear Sesión
  INSERT INTO sesiones_instanciadas (alumno_id, plan_id, numero_dia_plan, semana_numero, fecha_real, nombre_dia, estado)
  VALUES (p_alumno_id, v_alumno.plan_id, v_rutina.dia_numero, v_semana_numero, p_fecha_real, v_rutina.nombre_dia, 'pendiente')
  RETURNING id INTO v_sesion_id;

  -- 5. Copiar Ejercicios con ADN y Overrides
  INSERT INTO sesion_ejercicios_instanciados (
    sesion_id, ejercicio_id, ejercicio_plan_id, orden, 
    series_plan, reps_plan, peso_plan, descanso_seg, 
    completado, is_variation
  )
  SELECT 
    v_sesion_id,
    ep.ejercicio_id,
    ep.id,
    ep.orden,
    COALESCE(epp.series, ep.series),
    COALESCE(epp.reps_target, ep.reps_target),
    (COALESCE(epp.peso_target, ep.peso_target))::decimal, -- Cast simple
    COALESCE(epp.descanso_seg, ep.descanso_seg),
    false,
    false
  FROM ejercicios_plan ep
  LEFT JOIN ejercicio_plan_personalizado epp ON ep.id = epp.ejercicio_plan_id 
    AND epp.alumno_id = p_alumno_id 
    AND epp.semana_numero = v_semana_numero
  WHERE ep.rutina_id = v_rutina.id AND ep.deleted_at IS NULL;

  RETURN json_build_object('success', true, 'sesion_id', v_sesion_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ACTUALIZACIÓN DE RPCS DE PLANES (Compatibilidad de Bloques)

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
  v_rutina record;
  v_ejercicio record;
BEGIN
  IF p_profesor_id IS NOT NULL AND p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, is_template)
  VALUES (p_profesor_id, p_nombre, p_duracion_semanas, p_frecuencia_semanal, true)
  RETURNING id INTO v_plan_id;

  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas) LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_plan_id, (v_rutina.value->>'dia_numero')::int, v_rutina.value->>'nombre_dia', (v_rutina.value->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    IF v_rutina.value ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina.value->'ejercicios') LOOP
        INSERT INTO ejercicios_plan (
          rutina_id, ejercicio_id, series, reps_target, peso_target, descanso_seg,
          orden, exercise_type, position, grupo_bloque_id, grupo_nombre, 
          grupo_tipo_bloque, grupo_vueltas, grupo_descanso_ronda, grupo_descanso_final, notas
        )
        VALUES (
          v_rutina_id,
          (v_ejercicio.value->>'ejercicio_id')::uuid,
          COALESCE((v_ejercicio.value->>'series')::int, 0),
          v_ejercicio.value->>'reps_target',
          v_ejercicio.value->>'peso_target',
          COALESCE((v_ejercicio.value->>'descanso_seg')::int, 0),
          COALESCE((v_ejercicio.value->>'orden')::int, 0),
          COALESCE((v_ejercicio.value->>'exercise_type')::exercise_type, 'base'::exercise_type),
          COALESCE((v_ejercicio.value->>'position')::int, (random() * 1000000000)::int),
          (v_ejercicio.value->>'grupo_bloque_id')::uuid,
          v_ejercicio.value->>'grupo_nombre',
          COALESCE(v_ejercicio.value->>'grupo_tipo_bloque', 'agrupador'),
          COALESCE((v_ejercicio.value->>'grupo_vueltas')::int, 1),
          COALESCE((v_ejercicio.value->>'grupo_descanso_ronda')::int, 0),
          COALESCE((v_ejercicio.value->>'grupo_descanso_final')::int, 0),
          COALESCE(v_ejercicio.value->>'notas', '')
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  v_rutina record;
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
    VALUES (p_plan_id, (v_rutina.value->>'dia_numero')::int, v_rutina.value->>'nombre_dia', (v_rutina.value->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    IF v_rutina.value ? 'ejercicios' THEN
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
      FROM jsonb_array_elements(v_rutina.value->'ejercicios') AS ej;
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
