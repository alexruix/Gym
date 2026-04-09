-- MiGym | Migración: Hotfix Columnas Faltantes en ejercicios_plan
-- Fecha: 2026-04-09
-- Descripción: Añade columnas necesarias para notas y agrupación de bloques que faltaban en el esquema físico.

DO $$ BEGIN
    -- 1. Columna de Notas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ejercicios_plan' AND column_name = 'notas') THEN
        ALTER TABLE ejercicios_plan ADD COLUMN notas TEXT DEFAULT '';
    END IF;

    -- 2. Columnas de Agrupación (Bloques en Plan)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ejercicios_plan' AND column_name = 'grupo_bloque_id') THEN
        ALTER TABLE ejercicios_plan ADD COLUMN grupo_bloque_id UUID DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ejercicios_plan' AND column_name = 'grupo_nombre') THEN
        ALTER TABLE ejercicios_plan ADD COLUMN grupo_nombre TEXT DEFAULT NULL;
    END IF;

    -- 3. Asegurar peso_target (por si acaso no se aplicó correctamente antes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ejercicios_plan' AND column_name = 'peso_target') THEN
        ALTER TABLE ejercicios_plan ADD COLUMN peso_target TEXT DEFAULT '';
    END IF;

END $$;

COMMENT ON COLUMN ejercicios_plan.notas IS 'Notas técnicas del profesor para este ejercicio específico en el plan.';
COMMENT ON COLUMN ejercicios_plan.grupo_bloque_id IS 'ID del bloque al que pertenece este ejercicio (si fue añadido como bloque).';
COMMENT ON COLUMN ejercicios_plan.grupo_nombre IS 'Nombre descriptivo del grupo/bloque para visualización en el plan.';
