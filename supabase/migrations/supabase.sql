-- ========================================================
-- MiGym | Esquema de Base de Datos Consolidado (V2.2)
-- Única Fuente de Verdad (SSOT) — Sincronizado con código
-- ========================================================

-- 0. EXTENSIONES Y TIPOS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_type') THEN
        CREATE TYPE exercise_type AS ENUM ('base', 'complementary', 'accessory');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'variation_type') THEN
        CREATE TYPE variation_type AS ENUM ('move_day', 'rest_day', 'redistribute', 'combine_days');
    END IF;
END $$;

-- ============================================================
-- MANTENIMIENTO / SYNC: Asegurar columnas nuevas en tablas existentes
-- ============================================================
DO $$ BEGIN
    -- alumnos maintenance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'telefono') THEN
        ALTER TABLE alumnos ADD COLUMN telefono text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'notas') THEN
        ALTER TABLE alumnos ADD COLUMN notas text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'dia_pago') THEN
        ALTER TABLE alumnos ADD COLUMN dia_pago int DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'monto') THEN
        ALTER TABLE alumnos ADD COLUMN monto numeric;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'dias_asistencia') THEN
        ALTER TABLE alumnos ADD COLUMN dias_asistencia text[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'suscripcion_id') THEN
        ALTER TABLE alumnos ADD COLUMN suscripcion_id uuid;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'monto_personalizado') THEN
        ALTER TABLE alumnos ADD COLUMN monto_personalizado boolean DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'turno_id') THEN
        ALTER TABLE alumnos ADD COLUMN turno_id uuid;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumnos' AND column_name = 'fecha_nacimiento') THEN
        ALTER TABLE alumnos ADD COLUMN fecha_nacimiento DATE;
    END IF;

    -- biblioteca_ejercicios maintenance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biblioteca_ejercicios' AND column_name = 'tags') THEN
        ALTER TABLE biblioteca_ejercicios ADD COLUMN tags text[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biblioteca_ejercicios' AND column_name = 'is_favorite') THEN
        ALTER TABLE biblioteca_ejercicios ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biblioteca_ejercicios' AND column_name = 'usage_count') THEN
        ALTER TABLE biblioteca_ejercicios ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;

    -- planes maintenance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planes' AND column_name = 'is_template') THEN
        ALTER TABLE planes ADD COLUMN is_template boolean DEFAULT true;
    END IF;

    -- sesiones_instanciadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sesiones_instanciadas' AND column_name = 'completed_by_professor') THEN
        ALTER TABLE sesiones_instanciadas ADD COLUMN completed_by_professor boolean DEFAULT false;
    END IF;

    -- sesion_ejercicios_instanciados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sesion_ejercicios_instanciados' AND column_name = 'descanso_plan') THEN
        ALTER TABLE sesion_ejercicios_instanciados ADD COLUMN descanso_plan int DEFAULT 60;
    END IF;

    -- ejercicio_plan_personalizado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ejercicio_plan_personalizado' AND column_name = 'semana_numero') THEN
        ALTER TABLE ejercicio_plan_personalizado ADD COLUMN semana_numero int NOT NULL DEFAULT 1;
    END IF;
END $$;


-- ============================================================
-- 1. PROFESORES
-- Columnas verificadas contra: updateAccountSchema, updatePublicProfileSchema,
-- updateNotificationsSchema, updatePrivacySchema
-- ============================================================
CREATE TABLE IF NOT EXISTS profesores (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nombre text,
  gym_nombre text,
  telefono text,
  bio text,
  ubicacion text,
  foto_url text,
  slug text UNIQUE,
  portada_url text,
  instagram text,
  youtube text,
  tiktok text,
  x_twitter text,
  especialidades text[],
  -- Notificaciones (updateNotificationsSchema)
  notif_cuotas_vencer boolean DEFAULT true,
  notif_cuota_vencida boolean DEFAULT true,
  notif_alumno_completado boolean DEFAULT true,
  notif_nuevo_alumno boolean DEFAULT true,
  notif_email_semanal boolean DEFAULT false,
  notif_frecuencia text DEFAULT 'evento',
  -- Privacidad (updatePrivacySchema)
  perfil_publico boolean DEFAULT false,
  permitir_contacto boolean DEFAULT true,
  mostrar_foto boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. BIBLIOTECA DE EJERCICIOS
-- Columnas verificadas contra: createExercise, updateExercise, importExercises
-- ============================================================
CREATE TABLE IF NOT EXISTS biblioteca_ejercicios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE, -- opcional si es base
  parent_id uuid REFERENCES biblioteca_ejercicios(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  media_url text,
  tags text[] DEFAULT '{}',
  is_template_base boolean DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_biblioteca_ej_tags ON biblioteca_ejercicios USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_exercise_favorites ON biblioteca_ejercicios(profesor_id, is_favorite) WHERE is_favorite = true;

-- ============================================================
-- 3. PLANES (MAESTROS Y FORKS)
-- Columnas verificadas contra: createPlan, updatePlan, duplicatePlan, forkPlan,
-- promotePlan, importPlans, getProfessorMaestroPlans, assignPlanToStudents
-- ============================================================
CREATE TABLE IF NOT EXISTS planes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  duracion_semanas int DEFAULT 4,
  frecuencia_semanal int DEFAULT 3,
  is_template boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 4. RUTINAS DIARIAS
-- Verificado contra: crear_plan_completo RPC, duplicatePlan, addExerciseToStudentPlan
-- ============================================================
CREATE TABLE IF NOT EXISTS rutinas_diarias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  dia_numero int NOT NULL,
  nombre_dia text,
  orden int DEFAULT 0,
  CONSTRAINT unique_plan_dia UNIQUE (plan_id, dia_numero)
);

-- ============================================================
-- 5. EJERCICIOS DEL PLAN (ESTRUCTURAL)
-- Columnas verificadas contra: duplicatePlan (selecciona exercise_type, position),
-- instanciarSesion (selecciona peso_target), swapExerciseInStudentPlan, 
-- removeExerciseFromStudentPlan, addExerciseToStudentPlan
-- ============================================================
CREATE TABLE IF NOT EXISTS ejercicios_plan (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rutina_id uuid REFERENCES rutinas_diarias(id) ON DELETE CASCADE NOT NULL,
  ejercicio_id uuid REFERENCES biblioteca_ejercicios(id) ON DELETE CASCADE NOT NULL,
  series int DEFAULT 3,
  reps_target text DEFAULT '12',
  descanso_seg int DEFAULT 60,
  orden int DEFAULT 0,
  exercise_type exercise_type DEFAULT 'base',
  position int DEFAULT 0,
  peso_target text DEFAULT '',
  notas text DEFAULT '',
  grupo_bloque_id uuid DEFAULT NULL,
  grupo_nombre text DEFAULT NULL,
  deleted_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  CONSTRAINT unique_rutina_position UNIQUE (rutina_id, position)
);

-- ============================================================
-- 6. ALUMNOS
-- Columnas verificadas contra: inviteStudent (telefono, notas, monto, dia_pago),
-- updateStudent (telefono, notas, dia_pago), deleteStudent (deleted_at),
-- getStudentGuestLink (access_token), updateStudentStartDateOffset (fecha_inicio),
-- getProfessorStudentsWithPlans, assignPlanToStudents
-- ============================================================
CREATE TABLE IF NOT EXISTS alumnos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES planes(id) ON DELETE SET NULL,
  suscripcion_id uuid REFERENCES suscripciones(id) ON DELETE SET NULL,
  turno_id uuid REFERENCES turnos(id) ON DELETE SET NULL,
  email text,
  nombre text NOT NULL,
  telefono text,
  notas text,
  dia_pago int DEFAULT 1,
  monto numeric,
  monto_personalizado boolean DEFAULT false,
  dias_asistencia text[] DEFAULT '{}',
  fecha_inicio date DEFAULT current_date,
  fecha_nacimiento date,
  estado text DEFAULT 'activo',
  access_token uuid DEFAULT uuid_generate_v4() UNIQUE,
  deleted_at timestamptz,
  ultimo_recordatorio_pago_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alumnos_turno_id ON alumnos(turno_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_suscripcion_id ON alumnos(suscripcion_id);

-- ============================================================
-- 7. PAGOS Y NOTIFICACIONES
-- Pagos: verificado contra registrar_pago_atomico, inviteStudent
-- Notificaciones: verificado contra completarSesionInstanciada
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  monto numeric NOT NULL,
  fecha_vencimiento date NOT NULL,
  fecha_pago timestamptz,
  estado text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,       -- 'sesion_completada', 'comentario_sesion', 'pago_vencido', etc.
  mensaje text NOT NULL,
  referencia_id uuid,       -- ID de la sesión u objeto que disparó la notificación
  leida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 8. PERSONALIZACIONES Y VARIACIONES
-- ejercicio_plan_personalizado: verificado contra upsertStudentMetricOverride,
-- copyMetricsToNextWeek, updateStudentMetricWithPropagation.
-- IMPORTANTE: onConflict usa "alumno_id, ejercicio_plan_id, semana_numero"
-- por lo que la UNIQUE constraint debe incluir semana_numero.
-- ============================================================
CREATE TABLE IF NOT EXISTS ejercicio_plan_personalizado (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  ejercicio_plan_id uuid REFERENCES ejercicios_plan(id) ON DELETE CASCADE NOT NULL,
  semana_numero int NOT NULL DEFAULT 1,   -- crítico para predicados de propagación
  series int,
  reps_target text,
  descanso_seg int,
  peso_target text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(alumno_id, ejercicio_plan_id, semana_numero)  -- onConflict en el código
);

CREATE TABLE IF NOT EXISTS plan_rotaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  position int NOT NULL,
  applies_to_days text[] NOT NULL,
  cycles jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_variaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  numero_semana int NOT NULL,
  tipo variation_type NOT NULL,
  ajustes jsonb NOT NULL,
  razon text,
  created_at timestamptz DEFAULT now()
);

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

-- ============================================================
-- 9. CALENDARIO OPERATIVO (SESIONES INSTANCIADAS)
-- sesiones_instanciadas: verificado contra instanciarSesion, getWeeklySessions,
-- completeSessionByProfessor, completarSesionInstanciada, swapExerciseInStudentPlan,
-- addExerciseToStudentPlan, removeExerciseFromStudentPlan, updateStudentMetricWithPropagation
--
-- sesion_ejercicios_instanciados: verificado contra instanciarSesion, 
-- logEjercicioInstanciado, swapExerciseInStudentPlan, addExerciseToStudentPlan,
-- removeExerciseFromStudentPlan, updateStudentMetricWithPropagation.
-- IMPORTANTE: updateStudentMetricWithPropagation actualiza "descanso_plan" (no "descanso_seg")
-- ============================================================
CREATE TABLE IF NOT EXISTS sesiones_instanciadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
  numero_dia_plan INT NOT NULL,
  semana_numero INT NOT NULL DEFAULT 1,
  fecha_real DATE NOT NULL DEFAULT CURRENT_DATE,
  nombre_dia TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'omitida')),
  notas_alumno TEXT,
  notas_profesor TEXT,
  completed_by_professor BOOLEAN DEFAULT FALSE,   -- completarSesionInstanciada, completeSessionByProfessor
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sesiones_alumno_fecha ON sesiones_instanciadas (alumno_id, fecha_real);
CREATE INDEX IF NOT EXISTS idx_sesiones_alumno_dia ON sesiones_instanciadas (alumno_id, numero_dia_plan);

CREATE TABLE IF NOT EXISTS sesion_ejercicios_instanciados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES sesiones_instanciadas(id) ON DELETE CASCADE,
  ejercicio_id UUID NOT NULL REFERENCES biblioteca_ejercicios(id) ON DELETE CASCADE,
  ejercicio_plan_id UUID REFERENCES ejercicios_plan(id) ON DELETE SET NULL, -- nullable: ejercicios ad-hoc del día no tienen plan_id
  orden INT NOT NULL DEFAULT 0,
  series_plan INT NOT NULL DEFAULT 3,
  reps_plan TEXT NOT NULL DEFAULT '10',
  peso_plan DECIMAL(7,2),
  descanso_seg INT DEFAULT 60,                    -- valor original del plan en el momento de instanciar
  descanso_plan INT DEFAULT 60,                   -- actualizado por updateStudentMetricWithPropagation
  series_real INT,
  reps_real TEXT,
  peso_real DECIMAL(7,2),
  exercise_type TEXT DEFAULT 'base' CHECK (exercise_type IN ('base', 'complementary', 'accessory')),
  is_variation BOOLEAN DEFAULT FALSE,
  nota_alumno TEXT,
  respuesta_profesor TEXT,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sesion_ej_sesion_id ON sesion_ejercicios_instanciados (sesion_id);
CREATE INDEX IF NOT EXISTS idx_sesion_ej_plan_id ON sesion_ejercicios_instanciados (ejercicio_plan_id);

-- ============================================================
-- 10. SEGURIDAD (RLS) — PATRÓN CONSOLIDADO
-- ============================================================
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rutinas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicios_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicio_plan_personalizado ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_rotaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_variaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_plan_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_instanciadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesion_ejercicios_instanciados ENABLE ROW LEVEL SECURITY;

-- Propietario directo
DROP POLICY IF EXISTS "Dueño gestiona su perfil" ON profesores;
CREATE POLICY "Dueño gestiona su perfil" ON profesores FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profesores gestionan su biblioteca" ON biblioteca_ejercicios;
CREATE POLICY "Profesores gestionan su biblioteca" ON biblioteca_ejercicios FOR ALL USING (auth.uid() = profesor_id);

DROP POLICY IF EXISTS "Profesores gestionan sus planes" ON planes;
CREATE POLICY "Profesores gestionan sus planes" ON planes FOR ALL USING (auth.uid() = profesor_id);

-- Alumnos: El profesor sus alumnos (con soft delete), el alumno se ve a sí mismo
DROP POLICY IF EXISTS "Profesores gestionan sus alumnos" ON alumnos;
CREATE POLICY "Profesores gestionan sus alumnos" ON alumnos
  FOR ALL USING (auth.uid() = profesor_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Alumnos ven su propio perfil" ON alumnos;
CREATE POLICY "Alumnos ven su propio perfil" ON alumnos
  FOR SELECT USING (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Alumnos reclaman su perfil" ON alumnos;
CREATE POLICY "Alumnos reclaman su perfil" ON alumnos
  FOR UPDATE USING (email = (auth.jwt() ->> 'email') AND user_id IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Jerarquía de propietario (a través del plan)
DROP POLICY IF EXISTS "acceso_rutinas" ON rutinas_diarias;
CREATE POLICY "acceso_rutinas" ON rutinas_diarias FOR ALL USING (
  EXISTS (SELECT 1 FROM planes p WHERE p.id = rutinas_diarias.plan_id AND p.profesor_id = auth.uid())
);

DROP POLICY IF EXISTS "acceso_ejercicios_plan" ON ejercicios_plan;
CREATE POLICY "acceso_ejercicios_plan" ON ejercicios_plan FOR ALL USING (
  EXISTS (
    SELECT 1 FROM rutinas_diarias rd
    JOIN planes p ON rd.plan_id = p.id
    WHERE rd.id = ejercicios_plan.rutina_id AND p.profesor_id = auth.uid()
  )
);

-- Pagos y notificaciones
DROP POLICY IF EXISTS "acceso_pagos" ON pagos;
CREATE POLICY "acceso_pagos" ON pagos FOR ALL USING (
  EXISTS (SELECT 1 FROM alumnos a WHERE a.id = pagos.alumno_id AND a.profesor_id = auth.uid())
);

DROP POLICY IF EXISTS "Propietario gestiona notificaciones" ON notificaciones;
CREATE POLICY "Propietario gestiona notificaciones" ON notificaciones FOR ALL USING (auth.uid() = profesor_id);

DROP POLICY IF EXISTS "Alumnos insertan notificaciones" ON notificaciones;
CREATE POLICY "Alumnos insertan notificaciones" ON notificaciones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM alumnos WHERE id = notificaciones.alumno_id AND (auth.uid() = user_id OR email = (auth.jwt() ->> 'email')))
);

-- Personalizaciones
DROP POLICY IF EXISTS "acceso_personalizaciones" ON ejercicio_plan_personalizado;
CREATE POLICY "acceso_personalizaciones" ON ejercicio_plan_personalizado FOR ALL USING (
  EXISTS (SELECT 1 FROM alumnos a WHERE a.id = ejercicio_plan_personalizado.alumno_id AND a.profesor_id = auth.uid())
);

DROP POLICY IF EXISTS "acceso_rotaciones" ON plan_rotaciones;
CREATE POLICY "acceso_rotaciones" ON plan_rotaciones FOR ALL USING (
  EXISTS (SELECT 1 FROM planes p WHERE p.id = plan_rotaciones.plan_id AND p.profesor_id = auth.uid())
);

DROP POLICY IF EXISTS "acceso_variaciones" ON plan_variaciones;
CREATE POLICY "acceso_variaciones" ON plan_variaciones FOR ALL USING (
  EXISTS (SELECT 1 FROM planes p WHERE p.id = plan_variaciones.plan_id AND p.profesor_id = auth.uid())
);

DROP POLICY IF EXISTS "acceso_spc" ON student_plan_customizations;
CREATE POLICY "acceso_spc" ON student_plan_customizations FOR ALL USING (
  EXISTS (SELECT 1 FROM alumnos a WHERE a.id = student_plan_customizations.alumno_id AND a.profesor_id = auth.uid())
);

-- Sesiones: Visible para el profesor del alumno O el propio alumno (via user_id)
DROP POLICY IF EXISTS "acceso_sesiones" ON sesiones_instanciadas;
CREATE POLICY "acceso_sesiones" ON sesiones_instanciadas FOR ALL USING (
  EXISTS (
    SELECT 1 FROM alumnos a
    WHERE a.id = sesiones_instanciadas.alumno_id
    AND (a.profesor_id = auth.uid() OR a.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "acceso_ej_operativos" ON sesion_ejercicios_instanciados;
CREATE POLICY "acceso_ej_operativos" ON sesion_ejercicios_instanciados FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sesiones_instanciadas s
    JOIN alumnos a ON a.id = s.alumno_id
    WHERE s.id = sesion_ejercicios_instanciados.sesion_id
    AND (a.profesor_id = auth.uid() OR a.user_id = auth.uid())
  )
);

-- ============================================================
-- 11. RPCS / FUNCIONES NUCLEARES
-- ============================================================

-- Limpiar firmas previas para evitar ambigüedades (PGRST202)
DROP FUNCTION IF EXISTS crear_plan_completo(uuid, text, int, int, jsonb);
DROP FUNCTION IF EXISTS crear_plan_completo(uuid, text, int, int, jsonb, jsonb);
DROP FUNCTION IF EXISTS actualizar_plan_completo(uuid, uuid, text, int, int, jsonb);
DROP FUNCTION IF EXISTS actualizar_plan_completo(uuid, uuid, text, int, int, jsonb, jsonb);
DROP FUNCTION IF EXISTS fork_plan(uuid, uuid, text);

-- RPC 1: crear_plan_completo
-- Usada por: createPlan, duplicatePlan
CREATE OR REPLACE FUNCTION crear_plan_completo(
  p_profesor_id uuid,
  p_nombre text,
  p_duracion_semanas int,
  p_frecuencia_semanal int,
  p_rutinas jsonb,
  p_rotaciones jsonb DEFAULT '[]'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_plan_id uuid;
  v_rutina_id uuid;
  v_rutina jsonb;
  v_ejercicio jsonb;
  v_rotacion jsonb;
BEGIN
  -- SEGURIDAD: Validar que el profesor que ejecuta sea el dueño
  IF p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado: El ID de profesor no coincide con el usuario autenticado';
  END IF;

  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, is_template)
  VALUES (p_profesor_id, p_nombre, p_duracion_semanas, p_frecuencia_semanal, true)
  RETURNING id INTO v_plan_id;

  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas) LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    IF v_rutina ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina->'ejercicios') LOOP
        INSERT INTO ejercicios_plan (
          rutina_id, ejercicio_id, series, reps_target, peso_target, descanso_seg,
          orden, exercise_type, position, grupo_bloque_id, grupo_nombre, notas
        )
        VALUES (
          v_rutina_id,
          (v_ejercicio->>'ejercicio_id')::uuid,
          0,    -- ADN: Neutral
          NULL, -- ADN: Neutral
          NULL, -- ADN: Neutral
          0,    -- ADN: Neutral
          COALESCE((v_ejercicio->>'orden')::int, 0),
          COALESCE((v_ejercicio->>'exercise_type')::exercise_type, 'base'::exercise_type),
          COALESCE((v_ejercicio->>'position')::int, (random() * 1000000000)::int),
          (v_ejercicio->>'grupo_bloque_id')::uuid,
          v_ejercicio->>'grupo_nombre',
          COALESCE(v_ejercicio->>'notas', '')
        );
      END LOOP;
    END IF;
  END LOOP;

  IF p_rotaciones IS NOT NULL AND jsonb_array_length(p_rotaciones) > 0 THEN
    FOR v_rotacion IN SELECT * FROM jsonb_array_elements(p_rotaciones) LOOP
      INSERT INTO plan_rotaciones (plan_id, position, applies_to_days, cycles)
      VALUES (
        v_plan_id,
        (v_rotacion->>'position')::int,
        ARRAY(SELECT jsonb_array_elements_text(v_rotacion->'applies_to_days')),
        v_rotacion->'cycles'
      );
    END LOOP;
  END IF;

  RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC 2: actualizar_plan_completo
-- Usada por: updatePlan
CREATE OR REPLACE FUNCTION actualizar_plan_completo(
  p_plan_id uuid,
  p_profesor_id uuid,
  p_nombre text,
  p_duracion_semanas int,
  p_frecuencia_semanal int,
  p_rutinas jsonb,
  p_rotaciones jsonb DEFAULT '[]'::jsonb
) RETURNS boolean AS $$
DECLARE
  v_rutina_id uuid;
  v_rutina jsonb;
  v_ejercicio jsonb;
  v_rotacion jsonb;
  v_is_template boolean;
BEGIN
  -- SEGURIDAD: Validar que el profesor que ejecuta sea el dueño
  IF p_profesor_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado: El ID de profesor no coincide con el usuario autenticado';
  END IF;

  -- Verificar propiedad del plan específico
  SELECT is_template INTO v_is_template FROM planes WHERE id = p_plan_id AND profesor_id = p_profesor_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan no encontrado o no pertenece al profesor';
  END IF;

  -- 1. Actualizar metadatos del plan
  UPDATE planes
  SET nombre = p_nombre, 
      duracion_semanas = p_duracion_semanas,
      frecuencia_semanal = p_frecuencia_semanal, 
      updated_at = now()
  WHERE id = p_plan_id;

  -- 2. Limpiar rotaciones
  DELETE FROM plan_rotaciones WHERE plan_id = p_plan_id;

  -- 3. Conciliación de Rutinas y Ejercicios
  UPDATE ejercicios_plan 
  SET deleted_at = now() 
  WHERE rutina_id IN (SELECT id FROM rutinas_diarias WHERE plan_id = p_plan_id);

  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas) LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (p_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    ON CONFLICT (plan_id, dia_numero) DO UPDATE 
    SET nombre_dia = EXCLUDED.nombre_dia, orden = EXCLUDED.orden
    RETURNING id INTO v_rutina_id;

    IF v_rutina ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina->'ejercicios') LOOP
        INSERT INTO ejercicios_plan (
          rutina_id, ejercicio_id, position, orden, 
          series, reps_target, peso_target, descanso_seg,
          exercise_type, grupo_bloque_id, grupo_nombre, notas, deleted_at
        )
        VALUES (
          v_rutina_id,
          (v_ejercicio->>'ejercicio_id')::uuid,
          (v_ejercicio->>'position')::int,
          (v_ejercicio->>'orden')::int,
          CASE WHEN v_is_template THEN 0 ELSE 3 END,
          CASE WHEN v_is_template THEN NULL ELSE '12' END,
          CASE WHEN v_is_template THEN NULL ELSE '10' END,
          CASE WHEN v_is_template THEN 0 ELSE 60 END,
          COALESCE((v_ejercicio->>'exercise_type')::exercise_type, 'base'::exercise_type),
          (v_ejercicio->>'grupo_bloque_id')::uuid,
          v_ejercicio->>'grupo_nombre',
          COALESCE(v_ejercicio->>'notas', ''),
          NULL 
        )
        ON CONFLICT (rutina_id, position) DO UPDATE SET
          ejercicio_id = EXCLUDED.ejercicio_id,
          orden = EXCLUDED.orden,
          exercise_type = EXCLUDED.exercise_type,
          grupo_bloque_id = EXCLUDED.grupo_bloque_id,
          grupo_nombre = EXCLUDED.grupo_nombre,
          notas = EXCLUDED.notas,
          deleted_at = NULL, 
          updated_at = now();
      END LOOP;
    END IF;
  END LOOP;

  -- 4. Recrear rotaciones
  IF p_rotaciones IS NOT NULL AND jsonb_array_length(p_rotaciones) > 0 THEN
    FOR v_rotacion IN SELECT * FROM jsonb_array_elements(p_rotaciones) LOOP
      INSERT INTO plan_rotaciones (plan_id, position, applies_to_days, cycles)
      VALUES (
        p_plan_id,
        (v_rotacion->>'position')::int,
        ARRAY(SELECT jsonb_array_elements_text(v_rotacion->'applies_to_days')),
        v_rotacion->'cycles'
      );
    END LOOP;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC 3: fork_plan
-- Usada por: forkPlan, swapExerciseInStudentPlan, addExerciseToStudentPlan, removeExerciseFromStudentPlan
CREATE OR REPLACE FUNCTION fork_plan(
  p_plan_id uuid,
  p_alumno_id uuid,
  p_nuevo_nombre text
) RETURNS uuid AS $$
DECLARE
  v_new_plan_id uuid;
  v_profesor_id uuid;
  v_new_rutina_id uuid;
  v_rutina_rec record;
  v_ejercicio_rec record;
  v_rotacion_rec record;
BEGIN
  -- 1. Obtener profesor_id y validar existencia
  SELECT profesor_id INTO v_profesor_id FROM planes WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan origen no encontrado';
  END IF;

  -- 2. Insertar nuevo plan (is_template = false)
  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal, is_template)
  SELECT profesor_id, p_nuevo_nombre, duracion_semanas, frecuencia_semanal, false
  FROM planes WHERE id = p_plan_id
  RETURNING id INTO v_new_plan_id;

  -- 3. Copiar rutinas_diarias
  FOR v_rutina_rec IN SELECT * FROM rutinas_diarias WHERE plan_id = p_plan_id LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_new_plan_id, v_rutina_rec.dia_numero, v_rutina_rec.nombre_dia, v_rutina_rec.orden)
    RETURNING id INTO v_new_rutina_id;

    -- 4. Copiar ejercicios de esta rutina
    FOR v_ejercicio_rec IN SELECT * FROM ejercicios_plan WHERE rutina_id = v_rutina_rec.id LOOP
      INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden, exercise_type, position, peso_target)
      VALUES (
        v_new_rutina_id, 
        v_ejercicio_rec.ejercicio_id, 
        v_ejercicio_rec.series, 
        v_ejercicio_rec.reps_target, 
        v_ejercicio_rec.descanso_seg, 
        v_ejercicio_rec.orden, 
        v_ejercicio_rec.exercise_type, 
        v_ejercicio_rec.position,
        v_ejercicio_rec.peso_target
      );
    END LOOP;
  END LOOP;

  -- 5. Copiar rotaciones
  FOR v_rotacion_rec IN SELECT * FROM plan_rotaciones WHERE plan_id = p_plan_id LOOP
    INSERT INTO plan_rotaciones (plan_id, position, applies_to_days, cycles)
    VALUES (v_new_plan_id, v_rotacion_rec.position, v_rotacion_rec.applies_to_days, v_rotacion_rec.cycles);
  END LOOP;

  -- 6. Asignar el nuevo plan al alumno
  UPDATE alumnos SET plan_id = v_new_plan_id WHERE id = p_alumno_id AND profesor_id = v_profesor_id;

  RETURN v_new_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC 4: registrar_pago_atomico
-- Usada por: pagos.ts (registrarPago action)
CREATE OR REPLACE FUNCTION registrar_pago_atomico(
  p_alumno_id uuid,
  p_pago_id text,
  p_monto numeric,
  p_profesor_id uuid
) RETURNS json AS $$
DECLARE
  v_alumno_record record;
  v_next_date date;
  v_max_days int;
  v_pago_uuid uuid;
BEGIN
  SELECT id, dia_pago, monto INTO v_alumno_record
  FROM alumnos WHERE id = p_alumno_id AND profesor_id = p_profesor_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'mensaje', 'Alumno no encontrado o sin permisos');
  END IF;

  IF p_pago_id LIKE 'virtual-%' THEN
    INSERT INTO pagos (alumno_id, monto, fecha_vencimiento, estado, fecha_pago)
    VALUES (p_alumno_id, p_monto, CURRENT_DATE, 'pagado', NOW());
  ELSE
    v_pago_uuid := p_pago_id::uuid;
    UPDATE pagos SET estado = 'pagado', fecha_pago = NOW(), monto = p_monto
    WHERE id = v_pago_uuid AND alumno_id = p_alumno_id;
  END IF;

  v_next_date := CURRENT_DATE + INTERVAL '1 month';
  v_max_days := date_part('days', (date_trunc('month', v_next_date) + interval '1 month - 1 day'))::int;
  v_next_date := make_date(
    date_part('year', v_next_date)::int,
    date_part('month', v_next_date)::int,
    LEAST(COALESCE(v_alumno_record.dia_pago, 1), v_max_days)
  );

  IF NOT EXISTS (
    SELECT 1 FROM pagos WHERE alumno_id = p_alumno_id AND estado = 'pendiente' AND fecha_vencimiento >= v_next_date
  ) THEN
    INSERT INTO pagos (alumno_id, monto, fecha_vencimiento, estado)
    VALUES (p_alumno_id, p_monto, v_next_date, 'pendiente');
  END IF;

  RETURN json_build_object('success', true, 'mensaje', '✅ Pago registrado y mes renovado con éxito');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 12. STORAGE (AVATARS)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Lectura publica avatars" ON storage.objects;
CREATE POLICY "Lectura publica avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Gestión propia de avatar" ON storage.objects;
CREATE POLICY "Gestión propia de avatar" ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 1. Limpiamos políticas anteriores para el soft delete
DROP POLICY IF EXISTS "Profesores gestionan sus alumnos" ON alumnos;
DROP POLICY IF EXISTS "Profesores ven y gestionan alumnos activos" ON alumnos;
DROP POLICY IF EXISTS "Profesores archivan alumnos" ON alumnos;

-- 2. Política para ver y gestionar alumnos ACTIVOS
CREATE POLICY "Profesores ven y gestionan alumnos activos" ON alumnos
  FOR ALL USING (auth.uid() = profesor_id AND deleted_at IS NULL);

-- 3. Política específica para PERMITIR el archivado (soft delete)
-- Permite el UPDATE de un registro que era NULL a cualquier valor (timestamp)
CREATE POLICY "Profesores archivan alumnos" ON alumnos
  FOR UPDATE USING (auth.uid() = profesor_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = profesor_id);

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


-- ============================================================
-- MiGym | Migración: Días de Asistencia (v2.3)
-- ============================================================

-- Agregar la columna dias_asistencia a la tabla alumnos
-- Usamos text[] para representar 'Lunes', 'Martes', etc.
DO $$ BEGIN
    PERFORM 1 FROM information_schema.columns 
    WHERE table_name = 'alumnos' AND column_name = 'dias_asistencia';
    
    IF NOT FOUND THEN 
        ALTER TABLE alumnos ADD COLUMN dias_asistencia text[] DEFAULT '{}';
    END IF;
END $$;

-- Comentario para la tabla
COMMENT ON COLUMN alumnos.dias_asistencia IS 'Días de la semana en los que el alumno asiste (ej: {Lunes, Miércoles, Viernes})';

-- ============================================================
-- MiGym | Migración: Días de Asistencia en Turnos (v2.4)
-- ============================================================

-- Agregar la columna dias_asistencia a la tabla turnos
-- Permite filtrar qué bloques horarios están activos cada día
DO $$ BEGIN
    PERFORM 1 FROM information_schema.columns 
    WHERE table_name = 'turnos' AND column_name = 'dias_asistencia';
    
    IF NOT FOUND THEN 
        ALTER TABLE turnos ADD COLUMN dias_asistencia text[] DEFAULT '{}';
    END IF;
END $$;

-- Comentario para la tabla
COMMENT ON COLUMN turnos.dias_asistencia IS 'Días de la semana en los que el turno está activo (ej: {Lunes, Miércoles, Viernes})';

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

-- 1. Crear tabla de Bloques Maestros
CREATE TABLE IF NOT EXISTS bloques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profesor_id UUID NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de Ejercicios dentro de los Bloques
CREATE TABLE IF NOT EXISTS bloques_ejercicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bloque_id UUID NOT NULL REFERENCES bloques(id) ON DELETE CASCADE,
    ejercicio_id UUID NOT NULL REFERENCES biblioteca_ejercicios(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    series INTEGER DEFAULT 3,
    reps_target TEXT DEFAULT '12',
    descanso_seg INTEGER DEFAULT 60,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Actualizar la tabla de Ejercicios del Plan (para trazabilidad)
-- Evitamos errores si las columnas ya existen
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ejercicios_plan' AND column_name='grupo_bloque_id') THEN
        ALTER TABLE ejercicios_plan ADD COLUMN grupo_bloque_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ejercicios_plan' AND column_name='grupo_nombre') THEN
        ALTER TABLE ejercicios_plan ADD COLUMN grupo_nombre TEXT;
    END IF;
END $$;

-- 4. Políticas de Seguridad (RLS) - Opcional pero Recomendado
ALTER TABLE bloques ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloques_ejercicios ENABLE ROW LEVEL SECURITY;

-- Profesores solo ven y editan sus propios bloques
DROP POLICY IF EXISTS "Profesores gestionan sus bloques" ON bloques;
CREATE POLICY "Profesores gestionan sus bloques" ON bloques
    FOR ALL USING (auth.uid() = profesor_id);

-- Profesores solo ven ejercicios de bloques que les pertenecen
DROP POLICY IF EXISTS "Profesores gestionan ejercicios de sus bloques" ON bloques_ejercicios;
CREATE POLICY "Profesores gestionan ejercicios de sus bloques" ON bloques_ejercicios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bloques 
            WHERE bloques.id = bloques_ejercicios.bloque_id 
            AND bloques.profesor_id = auth.uid()
        )
    );

-- ============================================================
-- FIN DEL ESQUEMA CONSOLIDADO
-- ============================================================
-- ============================================================
-- FIN DEL ESQUEMA CONSOLIDADO
-- ============================================================
