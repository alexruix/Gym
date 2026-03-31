-- MIGRACIÓN PARA RUTINAS DINÁMICAS (SPRINT 1)
-- Implementa rotaciones de accesorios y variaciones por feriados/ausencias.

-- 1. TIPOS ENUM
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_type') THEN
        CREATE TYPE exercise_type AS ENUM ('base', 'complementary', 'accessory');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'variation_type') THEN
        CREATE TYPE variation_type AS ENUM ('move_day', 'rest_day', 'redistribute', 'combine_days');
    END IF;
END $$;

-- 2. MODIFICACIÓN DE EJERCICIOS_PLAN
-- Agregamos categoría y posición para identificar qué rota.
ALTER TABLE ejercicios_plan 
ADD COLUMN IF NOT EXISTS exercise_type exercise_type DEFAULT 'base',
ADD COLUMN IF NOT EXISTS position int DEFAULT 0;

-- Actualizar existentes como 'base'
UPDATE ejercicios_plan SET exercise_type = 'base' WHERE exercise_type IS NULL;

-- 3. TABLA PLAN_ROTACIONES
-- Guarda los ciclos de accesorios para cada slot (position) del plan.
CREATE TABLE IF NOT EXISTS plan_rotaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  position int NOT NULL,
  applies_to_days text[] NOT NULL,
  cycles jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS para plan_rotaciones
ALTER TABLE plan_rotaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profesores gestionan rotaciones" ON plan_rotaciones;
CREATE POLICY "Profesores gestionan rotaciones" ON plan_rotaciones
  FOR ALL USING (EXISTS (SELECT 1 FROM planes WHERE id = plan_rotaciones.plan_id AND profesor_id = auth.uid()));

-- 4. TABLA PLAN_VARIACIONES (GLOBALES)
-- Para feriados y cambios institucionales.
CREATE TABLE IF NOT EXISTS plan_variaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  numero_semana int NOT NULL,
  tipo variation_type NOT NULL,
  ajustes jsonb NOT NULL,
  razon text,
  created_at timestamptz DEFAULT now()
);

-- RLS para plan_variaciones
ALTER TABLE plan_variaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profesores gestionan variaciones" ON plan_variaciones;
CREATE POLICY "Profesores gestionan variaciones" ON plan_variaciones
  FOR ALL USING (EXISTS (SELECT 1 FROM planes WHERE id = plan_variaciones.plan_id AND profesor_id = auth.uid()));

-- 5. TABLA STUDENT_PLAN_CUSTOMIZATIONS (PERSONALES)
-- Para ausencias o necesidades específicas de un alumno.
CREATE TABLE IF NOT EXISTS student_plan_customizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  numero_semana int NOT NULL,
  tipo variation_type NOT NULL,
  ajustes jsonb NOT NULL,
  razon text,
  created_at timestamptz DEFAULT now()
);

-- RLS para student_plan_customizations
ALTER TABLE student_plan_customizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan personalizaciones" ON student_plan_customizations;
CREATE POLICY "Profesores gestionan personalizaciones" ON student_plan_customizations
  FOR ALL USING (EXISTS (SELECT 1 FROM alumnos WHERE id = student_plan_customizations.alumno_id AND profesor_id = auth.uid()));

DROP POLICY IF EXISTS "Alumnos ven sus personalizaciones" ON student_plan_customizations;
CREATE POLICY "Alumnos ven sus personalizaciones" ON student_plan_customizations
  FOR SELECT USING (EXISTS (SELECT 1 FROM alumnos WHERE id = student_plan_customizations.alumno_id AND (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'))));

-- 6. COMENTARIOS PARA DOCUMENTACIÓN DE TABLAS
COMMENT ON COLUMN plan_rotaciones.cycles IS 'Estructura: Array de objetos {duration_weeks: int, exercises: uuid[]}';
COMMENT ON COLUMN plan_variaciones.ajustes IS 'Configuración del cambio según el tipo (move_day, redistribute, etc)';
