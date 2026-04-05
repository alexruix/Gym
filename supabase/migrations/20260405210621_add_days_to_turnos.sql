-- ============================================================
-- MiGym | Migración: Días de Asistencia en Turnos (v2.4)
-- ============================================================

-- Agregar la columna dias_asistencia a la tabla turnos
-- Permite filtrar qué bloques horarios están activos cada día
DO $$ BEGIN
    PERFORM 1 FROM information_schema.columns 
    WHERE table_name = 'turnos' AND column_name = 'dias_asistencia';
    
    IF NOT FOUND THEN 
        ALTER TABLE turnos ADD COLUMN dias_asistencia text[] DEFAULT '{}';
    END IF;
END $$;

-- Comentario para la tabla
COMMENT ON COLUMN turnos.dias_asistencia IS 'Días de la semana en los que el turno está activo (ej: {Lunes, Miércoles, Viernes})';
