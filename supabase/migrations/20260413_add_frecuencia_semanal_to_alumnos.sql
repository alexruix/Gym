-- Migration: Add frecuencia_semanal to alumnos table
-- Description: Adds a column to track the student's intended weekly training frequency.

ALTER TABLE public.alumnos 
ADD COLUMN IF NOT EXISTS frecuencia_semanal INTEGER DEFAULT 3;

COMMENT ON COLUMN public.alumnos.frecuencia_semanal IS 'Frecuencia semanal de entrenamiento declarada por el alumno.';
