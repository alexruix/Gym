-- AGREGAR PESO TARGET A EJERCICIOS DEL PLAN
-- Esto permite la personalización granular requerida para atletas.

ALTER TABLE ejercicios_plan 
ADD COLUMN IF NOT EXISTS peso_target text DEFAULT '';

COMMENT ON COLUMN ejercicios_plan.peso_target IS 'Carga u objetivo de peso para el ejercicio (ej: "80kg", "Carga máxima", "RPE 8").';
