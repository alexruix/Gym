-- 🔥 OPTIMIZACIÓN DE RENDIMIENTO | ALUMNO CONSOLE (V2.5)
-- Refinado: Incluye previsualización de rutina de hoy y ejercicios detallados de la próxima sesión.

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
  SELECT array_accum(idx) INTO v_dias_asistencia_nums
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
    -- Reutilizar v_available_dia_nums si ya se calculó arriba
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

  -- 6. Calendario (Próximos 7 días para el Strip)
  -- Esto se puede calcular en el cliente para no sobrecargar el RPC, o aquí para SSOT total.
  -- Lo calcularemos en el cliente para mantener el RPC enfocado en datos pesados.

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
