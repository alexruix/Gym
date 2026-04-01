-- MIGRACIÓN: Agregar columna updated_at a planes para consistencia operacional
-- Fecha: 2026-04-01

ALTER TABLE planes 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN planes.updated_at IS 'Fecha y hora de la última modificación estructural del plan.';
