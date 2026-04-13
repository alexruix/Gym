-- ========================================================
-- MiGym | Migración: Blindaje Master Plan y Ejercicios Base
-- Fecha: 2026-04-13
-- Objetivo: SSOT Inmutable (Solo Borrado bloqueado)
-- ========================================================

-- 1. FLEXIBILIDAD: Permitir planes globales (sin dueño)
ALTER TABLE planes ALTER COLUMN profesor_id DROP NOT NULL;

-- 2. BLINDAJE: Función que impide el borrado de Blueprints (profesor_id IS NULL)
CREATE OR REPLACE FUNCTION fn_prevent_master_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.profesor_id IS NULL THEN
    RAISE EXCEPTION 'Error de Ingeniería: No se puede borrar un registro Maestro Global (profesor_id es NULL). Estas son bases inmutables del gimnasio.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 3. APLICAR GATILLOS DE SEGURIDAD
DROP TRIGGER IF EXISTS tr_lock_master_planes ON planes;
CREATE TRIGGER tr_lock_master_planes
BEFORE DELETE ON planes
FOR EACH ROW EXECUTE FUNCTION fn_prevent_master_deletion();

DROP TRIGGER IF EXISTS tr_lock_master_ejercicios ON biblioteca_ejercicios;
CREATE TRIGGER tr_lock_master_ejercicios
BEFORE DELETE ON biblioteca_ejercicios
FOR EACH ROW EXECUTE FUNCTION fn_prevent_master_deletion();

-- 4. VISIBILIDAD: RLS para lectura global
DROP POLICY IF EXISTS "Global plans are visible to all" ON planes;
CREATE POLICY "Global plans are visible to all" ON planes
FOR SELECT USING (profesor_id IS NULL OR auth.uid() = profesor_id);

DROP POLICY IF EXISTS "Global exercises are visible to all" ON biblioteca_ejercicios;
CREATE POLICY "Global exercises are visible to all" ON biblioteca_ejercicios
FOR SELECT USING (profesor_id IS NULL OR auth.uid() = profesor_id);

-- 5. ACTUALIZACIÓN DE RPCS: Permitir profesor_id NULL (Silent Sync)

-- RPC 1: crear_plan_completo (Ajustado)
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
  -- SEGURIDAD: Solo validar si p_profesor_id no es nulo. Si es nulo, se asume siembra de sistema.
  IF p_profesor_id IS NOT NULL AND p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado: El ID de profesor no coincide con el usuario autenticado';
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
          orden, exercise_type, position, grupo_bloque_id, grupo_nombre, notas
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

-- RPC 2: actualizar_plan_completo (Ajustado)
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
  v_is_template boolean;
BEGIN
  -- SEGURIDAD: Solo validar si p_profesor_id no es nulo.
  IF p_profesor_id IS NOT NULL AND p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- 1. Actualizar metadatos
  UPDATE planes
  SET nombre = p_nombre, 
      duracion_semanas = p_duracion_semanas,
      frecuencia_semanal = p_frecuencia_semanal, 
      updated_at = now()
  WHERE id = p_plan_id;

  -- 2. Limpiar rotaciones y ejercicios previos para reconstruir
  DELETE FROM plan_rotaciones WHERE plan_id = p_plan_id;
  DELETE FROM rutinas_diarias WHERE plan_id = p_plan_id;

  -- 3. Reconstrucción masiva (ADN)
  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas) LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (p_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    IF v_rutina ? 'ejercicios' THEN
      INSERT INTO ejercicios_plan (
        rutina_id, ejercicio_id, series, reps_target, peso_target, descanso_seg,
        orden, exercise_type, position, grupo_bloque_id, grupo_nombre, notas
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
        COALESCE(ej->>'notas', '')
      FROM jsonb_array_elements(v_rutina->'ejercicios') AS ej;
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
