-- Migración: Soporte Multidimensional (Semanas) para Overrides de Alumnos
-- Fecha: 2026-04-01
-- Objetivo: Permitir que un alumno tenga métricas distintas por cada semana del plan.

-- 1. Añadir columna semana_numero
ALTER TABLE ejercicio_plan_personalizado 
ADD COLUMN IF NOT EXISTS semana_numero int NOT NULL DEFAULT 1;

-- 2. Actualizar la restricción Unique
-- Primero eliminamos la anterior si existe (basada en el nombre estándar o el que hayamos definido)
-- Como antes era UNIQUE(alumno_id, ejercicio_plan_id), buscamos el nombre del indice único
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ejercicio_plan_personalizado_alumno_id_ejercicio_plan_id_key') THEN
        ALTER TABLE ejercicio_plan_personalizado DROP CONSTRAINT ejercicio_plan_personalizado_alumno_id_ejercicio_plan_id_key;
    END IF;
END $$;

-- 3. Crear nueva restricción Unique tripartita
ALTER TABLE ejercicio_plan_personalizado 
ADD CONSTRAINT unique_alumno_ejercicio_semana UNIQUE(alumno_id, ejercicio_plan_id, semana_numero);

-- 4. Comentario
COMMENT ON COLUMN ejercicio_plan_personalizado.semana_numero IS 'Número de la semana a la que corresponden estas métricas personalizadas.';
