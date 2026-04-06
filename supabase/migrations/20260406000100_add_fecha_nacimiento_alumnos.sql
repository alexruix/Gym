-- Migration: Agregar fecha de nacimiento a alumnos (v2.5)
-- Referencia: Requerimiento de cálculo de edad automática

DO $$ BEGIN
    PERFORM 1 FROM information_schema.columns 
    WHERE table_name = 'alumnos' AND column_name = 'fecha_nacimiento';
    
    IF NOT FOUND THEN 
        ALTER TABLE alumnos ADD COLUMN fecha_nacimiento DATE;
    END IF;
END $$;

COMMENT ON COLUMN alumnos.fecha_nacimiento IS 'Fecha de nacimiento del alumno para cálculo de edad (opcional)';
