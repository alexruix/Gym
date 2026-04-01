-- Migración: Tabla de personalización de métricas (Overrides)
-- Fecha: 2026-04-01
-- Objetivo: Almacenar ajustes de peso, reps y series por alumno sin duplicar el plan maestro.

-- 1. Crear tabla de personalización
CREATE TABLE IF NOT EXISTS ejercicio_plan_personalizado (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  ejercicio_plan_id uuid REFERENCES ejercicios_plan(id) ON DELETE CASCADE NOT NULL,
  series int,
  reps_target text,
  descanso_seg int,
  peso_target text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(alumno_id, ejercicio_plan_id)
);

-- 2. Habilitar RLS
ALTER TABLE ejercicio_plan_personalizado ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad
DROP POLICY IF EXISTS "Profesores gestionan personalizaciones de sus alumnos" ON ejercicio_plan_personalizado;
CREATE POLICY "Profesores gestionan personalizaciones de sus alumnos" ON ejercicio_plan_personalizado
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM alumnos a
      WHERE a.id = ejercicio_plan_personalizado.alumno_id AND a.profesor_id = auth.uid()
    )
  );

-- 4. Trigger para auto-update de updated_at (Si no existe la función general)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_set_updated_at_personalizacion ON ejercicio_plan_personalizado;
CREATE TRIGGER trigger_set_updated_at_personalizacion
    BEFORE UPDATE ON ejercicio_plan_personalizado
    FOR EACH ROW
    EXECUTE PROCEDURE set_updated_at();

-- 5. Comentarios
COMMENT ON TABLE ejercicio_plan_personalizado IS 'Almacena métricas (targets) personalizadas por alumno que sobrescriben los valores del plan maestro.';
