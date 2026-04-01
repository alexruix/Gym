-- 20260331000003_add_exercise_tags.sql
-- Añadir soporte para etiquetas (tags) en la biblioteca de ejercicios

-- 1. Añadir columna tags como array de texto
ALTER TABLE biblioteca_ejercicios 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Índice para mejorar búsqueda por tags (GIn index es ideal para arrays)
CREATE INDEX IF NOT EXISTS idx_biblioteca_ejercicios_tags ON biblioteca_ejercicios USING GIN (tags);

-- 3. Comentario descriptivo
COMMENT ON COLUMN biblioteca_ejercicios.tags IS 'Etiquetas de clasificación del ejercicio (ej: grupo muscular, dificultad).';
