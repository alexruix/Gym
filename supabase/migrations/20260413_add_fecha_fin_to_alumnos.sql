-- Migration: Agregar fecha de fin para gestión de períodos de vigencia (Ingeniería NODO)
ALTER TABLE alumnos 
ADD COLUMN IF NOT EXISTS fecha_fin DATE NULL;

COMMENT ON COLUMN alumnos.fecha_fin IS 'Fecha de finalización del ciclo de entrenamiento actual. Se usa para calcular la duración en semanas.';
