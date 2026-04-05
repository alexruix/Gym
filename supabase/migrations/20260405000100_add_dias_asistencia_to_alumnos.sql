-- ============================================================
-- MiGym | Migración: Días de Asistencia (v2.3)
-- ============================================================

-- Agregar la columna dias_asistencia a la tabla alumnos
-- Usamos text[] para representar 'Lunes', 'Martes', etc.
DO $$ BEGIN
    PERFORM 1 FROM information_schema.columns 
    WHERE table_name = 'alumnos' AND column_name = 'dias_asistencia';
    
    IF NOT FOUND THEN 
        ALTER TABLE alumnos ADD COLUMN dias_asistencia text[] DEFAULT '{}';
    END IF;
END $$;

-- Comentario para la tabla
COMMENT ON COLUMN alumnos.dias_asistencia IS 'Días de la semana en los que el alumno asiste (ej: {Lunes, Miércoles, Viernes})';
