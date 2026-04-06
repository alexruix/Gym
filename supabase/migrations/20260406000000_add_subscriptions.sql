-- ============================================================
-- MiGym | Migración: Suscripciones y Precios SSOT (v2.5)
-- ============================================================

-- 1. Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  monto numeric NOT NULL DEFAULT 0,
  cantidad_dias int NOT NULL DEFAULT 0, -- 0 = Libre, 2, 3, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Habilitar RLS para suscripciones
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan sus suscripciones" ON suscripciones;
CREATE POLICY "Profesores gestionan sus suscripciones" ON suscripciones 
  FOR ALL USING (auth.uid() = profesor_id);

-- 3. Modificar tabla alumnos para vincular con suscripciones
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'suscripcion_id') THEN
        ALTER TABLE alumnos ADD COLUMN suscripcion_id uuid REFERENCES suscripciones(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'monto_personalizado') THEN
        ALTER TABLE alumnos ADD COLUMN monto_personalizado boolean DEFAULT false;
    END IF;
END $$;

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_alumnos_suscripcion_id ON alumnos(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_profesor_id ON suscripciones(profesor_id);

-- 5. Función helper para inicializar suscripciones por defecto (si no existen)
-- Esto se puede llamar desde la UI del profesor o un trigger
CREATE OR REPLACE FUNCTION inicializar_suscripciones_profesor(p_profesor_id uuid) 
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM suscripciones WHERE profesor_id = p_profesor_id) THEN
    INSERT INTO suscripciones (profesor_id, nombre, monto, cantidad_dias) VALUES
    (p_profesor_id, 'Plan 2 días', 15000, 2),
    (p_profesor_id, 'Plan 3 días', 18000, 3),
    (p_profesor_id, 'Pase Libre', 22000, 0);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN suscripciones.cantidad_dias IS 'Frecuencia semanal asociada al plan. 0 indica pase libre/sin limite.';
COMMENT ON COLUMN alumnos.monto_personalizado IS 'Si es TRUE, el alumno mantiene un monto diferencial y se ignora en updates masivos.';
