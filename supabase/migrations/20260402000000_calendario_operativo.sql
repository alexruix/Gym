-- =============================================
-- FASE 1: Calendario Operativo Real
-- Drop tablas legacy y creación de tablas nuevas
-- =============================================

-- 1. Drop tablas legacy (aún en desarrollo, sin historial real)
DROP TABLE IF EXISTS ejercicio_logs CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;

-- =============================================
-- 2. sesiones_instanciadas
-- Cabecera de cada día de entrenamiento real del alumno
-- =============================================
CREATE TABLE sesiones_instanciadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
  numero_dia_plan INT NOT NULL, -- Qué día del plan es (ej: 4)
  semana_numero INT NOT NULL DEFAULT 1, -- Semana del ciclo (ej: 1)
  fecha_real DATE NOT NULL DEFAULT CURRENT_DATE,
  nombre_dia TEXT, -- Ej: "Pecho + Tríceps"
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'omitida')),
  notas_alumno TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices para la query crítica (alumno abre app → buscar sesión de hoy)
CREATE UNIQUE INDEX idx_sesiones_alumno_fecha ON sesiones_instanciadas (alumno_id, fecha_real);
CREATE INDEX idx_sesiones_alumno_dia ON sesiones_instanciadas (alumno_id, numero_dia_plan);

-- =============================================
-- 3. sesion_ejercicios_instanciados
-- Ejercicios concretos de cada sesión, con plan y realidad
-- =============================================
CREATE TABLE sesion_ejercicios_instanciados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES sesiones_instanciadas(id) ON DELETE CASCADE,
  ejercicio_id UUID NOT NULL REFERENCES biblioteca_ejercicios(id) ON DELETE CASCADE,
  orden INT NOT NULL DEFAULT 0,
  -- Métricas del plan (lo que dice el programa)
  series_plan INT NOT NULL DEFAULT 3,
  reps_plan TEXT NOT NULL DEFAULT '10', -- Puede ser "8-12" o "10"
  peso_plan DECIMAL(7,2), -- Null si no aplica (bodyweight)
  descanso_seg INT DEFAULT 60,
  -- Métricas reales (lo que hizo el alumno)
  series_real INT,
  reps_real TEXT,
  peso_real DECIMAL(7,2),
  -- Metadata
  exercise_type TEXT DEFAULT 'base' CHECK (exercise_type IN ('base', 'complementary', 'accessory')),
  is_variation BOOLEAN DEFAULT FALSE, -- Si es un accesorio rotado
  nota_alumno TEXT,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sesion_ej_sesion_id ON sesion_ejercicios_instanciados (sesion_id);

-- =============================================
-- 4. RLS (Row Level Security)
-- =============================================
ALTER TABLE sesiones_instanciadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesion_ejercicios_instanciados ENABLE ROW LEVEL SECURITY;

-- Alumno: solo ve sus propias sesiones
CREATE POLICY "alumno_select_own_sesiones" ON sesiones_instanciadas
  FOR SELECT USING (alumno_id = auth.uid());

CREATE POLICY "alumno_insert_own_sesiones" ON sesiones_instanciadas
  FOR INSERT WITH CHECK (alumno_id = auth.uid());

CREATE POLICY "alumno_update_own_sesiones" ON sesiones_instanciadas
  FOR UPDATE USING (alumno_id = auth.uid());

-- Ejercicios instanciados: el alumno puede ver/modificar los de sus sesiones
CREATE POLICY "alumno_select_own_ej_instanciados" ON sesion_ejercicios_instanciados
  FOR SELECT USING (
    sesion_id IN (
      SELECT id FROM sesiones_instanciadas WHERE alumno_id = auth.uid()
    )
  );

CREATE POLICY "alumno_update_own_ej_instanciados" ON sesion_ejercicios_instanciados
  FOR UPDATE USING (
    sesion_id IN (
      SELECT id FROM sesiones_instanciadas WHERE alumno_id = auth.uid()
    )
  );

-- Profesor: puede ver las sesiones de sus alumnos
CREATE POLICY "profesor_select_alumno_sesiones" ON sesiones_instanciadas
  FOR SELECT USING (
    alumno_id IN (
      SELECT id FROM alumnos WHERE profesor_id = auth.uid()
    )
  );

CREATE POLICY "profesor_select_alumno_ej" ON sesion_ejercicios_instanciados
  FOR SELECT USING (
    sesion_id IN (
      SELECT s.id FROM sesiones_instanciadas s
      JOIN alumnos a ON a.id = s.alumno_id
      WHERE a.profesor_id = auth.uid()
    )
  );
