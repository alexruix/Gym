-- MIGRACIÓN: Seguimiento de recordatorios y automatización de pagos
-- Agregamos columna para evitar spam de WhatsApp y llevar control de notificaciones

ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS ultimo_recordatorio_pago_at timestamptz;

COMMENT ON COLUMN alumnos.ultimo_recordatorio_pago_at IS 'Fecha y hora del último mensaje de recordatorio de pago enviado vía WhatsApp.';

-- RPC para registrar cobro y renovar mes de forma atómica
CREATE OR REPLACE FUNCTION registrar_pago_atomico(
  p_alumno_id uuid,
  p_pago_id text, -- Puede ser UUID real o 'virtual-...'
  p_monto numeric,
  p_profesor_id uuid
) RETURNS json AS $$
DECLARE
  v_alumno_record record;
  v_next_date date;
  v_max_days int;
  v_pago_uuid uuid;
BEGIN
  -- 1. Verificar propiedad y obtener datos del alumno
  SELECT id, dia_pago, monto INTO v_alumno_record
  FROM alumnos WHERE id = p_alumno_id AND profesor_id = p_profesor_id AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'mensaje', 'Alumno no encontrado o sin permisos');
  END IF;

  -- 2. Manejar Pago Actual
  IF p_pago_id LIKE 'virtual-%' THEN
    -- Insertar el pago que era virtual como ya pagado
    INSERT INTO pagos (alumno_id, monto, fecha_vencimiento, estado, fecha_pago)
    VALUES (p_alumno_id, p_monto, CURRENT_DATE, 'pagado', NOW());
  ELSE
    -- Actualizar pago existente
    v_pago_uuid := p_pago_id::uuid;
    UPDATE pagos 
    SET estado = 'pagado', fecha_pago = NOW(), monto = p_monto
    WHERE id = v_pago_uuid AND alumno_id = p_alumno_id;
  END IF;

  -- 3. Calcular Próximo Vencimiento
  v_next_date := CURRENT_DATE + INTERVAL '1 month';
  v_max_days := date_part('days', (date_trunc('month', v_next_date) + interval '1 month - 1 day'))::int;
  
  -- Ajustar al día de pago
  v_next_date := make_date(
    date_part('year', v_next_date)::int,
    date_part('month', v_next_date)::int,
    LEAST(COALESCE(v_alumno_record.dia_pago, 15), v_max_days)
  );

  -- 4. Generar Próxima Cuota (Solo si no existe una pendiente para ese mes/futuro)
  -- Esto evita duplicados si el profesor aprieta dos veces o hay solapamiento
  IF NOT EXISTS (
    SELECT 1 FROM pagos 
    WHERE alumno_id = p_alumno_id 
    AND estado = 'pendiente' 
    AND fecha_vencimiento >= v_next_date
  ) THEN
    INSERT INTO pagos (alumno_id, monto, fecha_vencimiento, estado)
    VALUES (p_alumno_id, p_monto, v_next_date, 'pendiente');
  END IF;

  RETURN json_build_object('success', true, 'mensaje', '✅ Pago registrado y mes renovado con éxito');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
