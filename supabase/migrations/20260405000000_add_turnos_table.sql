-- Migración: Agregar soporte para Turnos y Agenda Colectiva
-- Fecha: 2026-04-05

-- 1. Crear tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  capacidad_max int DEFAULT 10,
  color_tag text,
  created_at timestamptz DEFAULT now()
);

-- 2. Vincular alumnos con turnos
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'turno_id') THEN
        ALTER TABLE alumnos ADD COLUMN turno_id uuid REFERENCES turnos(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Habilitar RLS
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Profesores gestionan sus turnos" ON turnos;
CREATE POLICY "Profesores gestionan sus turnos" ON turnos FOR ALL USING (auth.uid() = profesor_id);

-- 5. Índices para performance en la Agenda
CREATE INDEX IF NOT EXISTS idx_alumnos_turno_id ON alumnos(turno_id);
CREATE INDEX IF NOT EXISTS idx_turnos_profesor_id ON turnos(profesor_id);
