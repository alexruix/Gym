-- 🔥 OPTIMIZACIÓN DE RENDIMIENTO | PROFESOR DASHBOARD (V2.3)
-- Este script consolida las métricas del dashboard en un solo RPC para reducir latencia.

-- 1. ÍNDICES ESTRATÉGICOS (Si no existen)
CREATE INDEX IF NOT EXISTS idx_sesiones_completadas_fecha ON sesiones_instanciadas(alumno_id, completed_at) WHERE estado = 'completada';
CREATE INDEX IF NOT EXISTS idx_pagos_dashboard ON pagos(alumno_id, estado, fecha_pago, fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_alumnos_profesor_id ON alumnos(profesor_id) WHERE deleted_at IS NULL;

-- 2. RPC CONSOLIDADO: get_professor_dashboard_stats
CREATE OR REPLACE FUNCTION get_professor_dashboard_stats(p_profesor_id uuid)
RETURNS json AS $$
DECLARE
  v_today_arg date;
  v_seven_days_ago date;
  v_month_start_arg date;
  v_total_active int;
  v_trained_recently int;
  v_adherence_rate int;
  v_monthly_revenue numeric;
  v_no_plan_students json;
  v_at_risk_students json;
  v_expiring_payments json;
  v_recent_activities json;
  v_recent_students json;
BEGIN
  -- SEGURIDAD: Validar usuario
  IF p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- Configuración de fechas (Ajustado a Argentina)
  v_today_arg := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
  v_seven_days_ago := v_today_arg - INTERVAL '7 days';
  v_month_start_arg := date_trunc('month', v_today_arg)::date;

  -- 1. Métricas Base
  SELECT COUNT(*) INTO v_total_active 
  FROM alumnos WHERE profesor_id = p_profesor_id AND estado = 'activo' AND deleted_at IS NULL;

  -- 2. Adherencia (Alumnos activos que entrenaron en los últimos 7 días)
  SELECT COUNT(DISTINCT alumno_id) INTO v_trained_recently
  FROM sesiones_instanciadas si
  JOIN alumnos a ON si.alumno_id = a.id
  WHERE a.profesor_id = p_profesor_id 
    AND a.estado = 'activo' 
    AND a.deleted_at IS NULL
    AND si.estado = 'completada'
    AND si.completed_at::date >= v_seven_days_ago;

  v_adherence_rate := CASE WHEN v_total_active > 0 THEN ROUND((v_trained_recently::float / v_total_active::float) * 100) ELSE 0 END;

  -- 3. Ingresos Mensuales (Caja del mes en Argentina)
  SELECT COALESCE(SUM(p.monto), 0) INTO v_monthly_revenue
  FROM pagos p
  JOIN alumnos a ON p.alumno_id = a.id
  WHERE a.profesor_id = p_profesor_id
    AND p.estado = 'pagado'
    AND p.fecha_pago::date >= v_month_start_arg;

  -- 4. Alertas: Sin Plan
  SELECT json_agg(t) INTO v_no_plan_students
  FROM (
    SELECT id, nombre as "studentName"
    FROM alumnos
    WHERE profesor_id = p_profesor_id AND plan_id IS NULL AND deleted_at IS NULL
  ) t;

  -- 5. Alertas: En Riesgo (Sin sesión completada en 7 días)
  SELECT json_agg(t) INTO v_at_risk_students
  FROM (
    SELECT 
      a.id, 
      a.nombre as "studentName", 
      a.telefono as "phone",
      (v_today_arg - MAX(si.completed_at)::date) as "daysInactive"
    FROM alumnos a
    LEFT JOIN sesiones_instanciadas si ON a.id = si.alumno_id AND si.estado = 'completada'
    WHERE a.profesor_id = p_profesor_id 
      AND a.estado = 'activo' 
      AND a.deleted_at IS NULL
      AND a.plan_id IS NOT NULL
    GROUP BY a.id, a.nombre, a.telefono
    HAVING MAX(si.completed_at) IS NULL OR MAX(si.completed_at)::date < v_seven_days_ago
  ) t;

  -- 6. Alertas: Pagos Pendientes/Vencidos
  SELECT json_agg(t) INTO v_expiring_payments
  FROM (
    SELECT 
      a.id, 
      a.nombre as "studentName", 
      a.telefono as "phone", 
      p.id as "pagoId",
      (v_today_arg - p.fecha_vencimiento::date) as "daysLate"
    FROM pagos p
    JOIN alumnos a ON p.alumno_id = a.id
    WHERE a.profesor_id = p_profesor_id
      AND p.estado IN ('pendiente', 'vencido')
      AND a.deleted_at IS NULL
    ORDER BY p.fecha_vencimiento ASC
  ) t;

  -- 7. Actividad Reciente (Últimas 10 sesiones)
  SELECT json_agg(t) INTO v_recent_activities
  FROM (
    SELECT 
      si.id,
      'session_completed' as "type",
      a.nombre as "studentName",
      CASE 
        WHEN si.fecha_real = v_today_arg THEN 'Hoy'
        WHEN si.fecha_real = v_today_arg - 1 THEN 'Ayer'
        ELSE 'Hace ' || (v_today_arg - si.fecha_real) || ' días'
      END as "timeAgo"
    FROM sesiones_instanciadas si
    JOIN alumnos a ON si.alumno_id = a.id
    WHERE a.profesor_id = p_profesor_id AND si.estado = 'completada'
    ORDER BY si.completed_at DESC
    LIMIT 10
  ) t;

  -- 8. Alumnos Recientes (Últimos 5)
  SELECT json_agg(t) INTO v_recent_students
  FROM (
    SELECT 
      a.id, 
      a.nombre as "name", 
      a.email, 
      pl.nombre as "planName", 
      a.estado
    FROM alumnos a
    LEFT JOIN planes pl ON a.plan_id = pl.id
    WHERE a.profesor_id = p_profesor_id AND a.deleted_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT 5
  ) t;

  RETURN json_build_object(
    'stats', json_build_object(
      'activeStudents', v_total_active,
      'adherenceRate', v_adherence_rate,
      'monthlyRevenue', v_monthly_revenue
    ),
    'expiringPayments', COALESCE(v_expiring_payments, '[]'::json),
    'atRiskStudents', COALESCE(v_at_risk_students, '[]'::json),
    'noPlanStudents', COALESCE(v_no_plan_students, '[]'::json),
    'recentStudents', COALESCE(v_recent_students, '[]'::json),
    'activities', COALESCE(v_recent_activities, '[]'::json),
    'lastUpdated', TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires', 'HH24:MI')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
