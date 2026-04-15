-- 🔥 Fix: Replace non-existent array_accum with array_agg

-- 1. Redefine instanciar_sesion_alumno
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
  -- FIX: Replace array_accum with array_agg
  SELECT array_agg(idx) INTO v_dias_asistencia_nums
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
    (COALESCE(epp.peso_target, ep.peso_target))::decimal,
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


-- 2. Redefine get_student_dashboard_data
CREATE OR REPLACE FUNCTION get_student_dashboard_data(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_alumno record;
  v_plan record;
  v_sesion_hoy json;
  v_proxima_sesion json;
  v_routine_preview json;
  v_dias_asistencia_nums int[];
  v_available_dia_nums int[];
  v_hoy date;
  v_iter date;
  v_safe int := 0;
  v_dia_estructural_hoy int;
  v_fecha_inicio date;
BEGIN
  v_hoy := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;

  -- 1. Alumno
  SELECT * INTO v_alumno FROM alumnos WHERE user_id = p_user_id OR id = p_user_id LIMIT 1;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Perfil no encontrado'); END IF;
  
  IF v_alumno.plan_id IS NOT NULL THEN
    SELECT * INTO v_plan FROM planes WHERE id = v_alumno.plan_id;
  END IF;

  v_fecha_inicio := COALESCE(v_alumno.fecha_inicio, v_alumno.created_at::date);

  -- 2. Mapeo de días de asistencia
  -- FIX: Replace array_accum with array_agg
  SELECT array_agg(idx) INTO v_dias_asistencia_nums
  FROM (
    SELECT CASE lower(d)
      WHEN 'domingo' THEN 0 WHEN 'lunes' THEN 1 WHEN 'martes' THEN 2 
      WHEN 'miércoles' THEN 3 WHEN 'miercoles' THEN 3 WHEN 'jueves' THEN 4 
      WHEN 'viernes' THEN 5 WHEN 'sábado' THEN 6 WHEN 'sabado' THEN 6
    END as idx
    FROM unnest(v_alumno.dias_asistencia) d
  ) t WHERE idx IS NOT NULL;

  -- 3. Sesión de Hoy (Instanciada)
  SELECT json_build_object(
    'id', s.id, 'estado', s.estado, 'nombre_dia', s.nombre_dia, 'numero_dia_plan', s.numero_dia_plan, 'semana_numero', s.semana_numero,
    'sesion_ejercicios_instanciados', (
      SELECT json_agg(ej) FROM (
        SELECT sei.id, sei.orden, sei.series_plan, sei.reps_plan, sei.peso_plan, sei.descanso_seg, sei.completado, 
               json_build_object('id', be.id, 'nombre', be.nombre, 'media_url', be.media_url) as biblioteca_ejercicios
        FROM sesion_ejercicios_instanciados sei
        JOIN biblioteca_ejercicios be ON sei.ejercicio_id = be.id
        WHERE sei.sesion_id = s.id
        ORDER BY sei.orden
      ) ej
    )
  ) INTO v_sesion_hoy
  FROM sesiones_instanciadas s
  WHERE s.alumno_id = v_alumno.id AND s.fecha_real = v_hoy;

  -- 4. Routine Preview (Si no hay sesión instanciada y hoy toca)
  IF v_sesion_hoy IS NULL AND v_alumno.plan_id IS NOT NULL THEN
    SELECT array_agg(dia_numero ORDER BY dia_numero) INTO v_available_dia_nums
    FROM rutinas_diarias WHERE plan_id = v_alumno.plan_id;

    v_dia_estructural_hoy := get_structural_day_sql(v_fecha_inicio, v_hoy, v_available_dia_nums, v_dias_asistencia_nums);
    
    IF v_dia_estructural_hoy > 0 THEN
      SELECT json_build_object(
        'nombre_dia', rd.nombre_dia,
        'numero_dia_plan', rd.dia_numero,
        'ejercicios', (
          SELECT json_agg(ej) FROM (
            SELECT ep.id as ejercicio_plan_id, ep.orden, ep.series as series_plan, ep.reps_target as reps_plan, ep.peso_target as peso_plan, ep.descanso_seg,
                   be.nombre, be.media_url, false as completado
            FROM ejercicios_plan ep
            JOIN biblioteca_ejercicios be ON ep.ejercicio_id = be.id
            WHERE ep.rutina_id = rd.id
            ORDER BY ep.orden
          ) ej
        )
      ) INTO v_routine_preview
      FROM rutinas_diarias rd
      WHERE rd.plan_id = v_alumno.plan_id AND rd.dia_numero = v_dia_estructural_hoy;
    END IF;
  END IF;

  -- 5. Próxima Sesión
  IF v_alumno.plan_id IS NOT NULL THEN
    IF v_available_dia_nums IS NULL THEN
      SELECT array_agg(dia_numero ORDER BY dia_numero) INTO v_available_dia_nums
      FROM rutinas_diarias WHERE plan_id = v_alumno.plan_id;
    END IF;

    v_iter := v_hoy + 1;
    WHILE v_proxima_sesion IS NULL AND v_safe < 14 LOOP
      IF v_dias_asistencia_nums IS NULL OR array_length(v_dias_asistencia_nums, 1) = 0 OR extract(dow from v_iter) = ANY(v_dias_asistencia_nums) THEN
        IF get_structural_day_sql(v_fecha_inicio, v_iter, v_available_dia_nums, v_dias_asistencia_nums) > 0 THEN
          SELECT json_build_object(
            'fecha', v_iter,
            'nombre_dia', rd.nombre_dia,
            'dia_numero', rd.dia_numero
          ) INTO v_proxima_sesion
          FROM rutinas_diarias rd
          WHERE rd.plan_id = v_alumno.plan_id 
            AND rd.dia_numero = get_structural_day_sql(v_fecha_inicio, v_iter, v_available_dia_nums, v_dias_asistencia_nums);
        END IF;
      END IF;
      v_iter := v_iter + 1;
      v_safe := v_safe + 1;
    END LOOP;
  END IF;

  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'alumno', json_build_object(
        'id', v_alumno.id, 
        'nombre', v_alumno.nombre, 
        'perfil_completado', v_alumno.perfil_completado, 
        'fecha_inicio', v_fecha_inicio,
        'has_plan', v_alumno.plan_id IS NOT NULL,
        'dias_asistencia', v_alumno.dias_asistencia
      ),
      'sesionHoy', v_sesion_hoy,
      'routinePreview', v_routine_preview,
      'proximaSesion', v_proxima_sesion,
      'fechaHoyISO', v_hoy
    )
  );
END;
$$ LANGUAGE plpgsql;
