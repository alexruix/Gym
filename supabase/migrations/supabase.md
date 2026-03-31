-- Asegurar que la extensión de UUIDs esté activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--- 1. Profesores
CREATE TABLE IF NOT EXISTS profesores (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nombre text,
  gym_nombre text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dueño puede ver su propio perfil" ON profesores;
CREATE POLICY "Dueño puede ver su propio perfil" ON profesores FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Dueño puede actualizar su propio perfil" ON profesores;
CREATE POLICY "Dueño puede actualizar su propio perfil" ON profesores FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Inserción vía onboarding" ON profesores;
CREATE POLICY "Inserción vía onboarding" ON profesores FOR INSERT WITH CHECK (true);


--- 2. Biblioteca de Ejercicios
CREATE TABLE IF NOT EXISTS biblioteca_ejercicios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  media_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE biblioteca_ejercicios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan su biblioteca" ON biblioteca_ejercicios;
CREATE POLICY "Profesores gestionan su biblioteca" ON biblioteca_ejercicios FOR ALL USING (auth.uid() = profesor_id);


--- 3. Planes
CREATE TABLE IF NOT EXISTS planes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  duracion_semanas int DEFAULT 4,
  frecuencia_semanal int DEFAULT 3, -- Días por semana
  created_at timestamptz DEFAULT now()
);

ALTER TABLE planes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan sus planes" ON planes;
CREATE POLICY "Profesores gestionan sus planes" ON planes FOR ALL USING (auth.uid() = profesor_id);


--- 4. Rutinas Diarias
CREATE TABLE IF NOT EXISTS rutinas_diarias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  dia_numero int NOT NULL,
  nombre_dia text,
  orden int DEFAULT 0
);

ALTER TABLE rutinas_diarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan sus rutinas" ON rutinas_diarias;
CREATE POLICY "Profesores gestionan sus rutinas" ON rutinas_diarias
  FOR ALL USING (EXISTS (SELECT 1 FROM planes WHERE id = rutinas_diarias.plan_id AND profesor_id = auth.uid()));


--- 5. Ejercicios del Plan (Métricas Granulares)
CREATE TABLE IF NOT EXISTS ejercicios_plan (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rutina_id uuid REFERENCES rutinas_diarias(id) ON DELETE CASCADE NOT NULL,
  ejercicio_id uuid REFERENCES biblioteca_ejercicios(id) ON DELETE CASCADE NOT NULL,
  series int DEFAULT 3,
  reps_target text DEFAULT '12', -- Puede ser "10-12", "Al fallo", etc.
  descanso_seg int DEFAULT 60,    -- Clave para el cronómetro de la app
  orden int DEFAULT 0
);

ALTER TABLE ejercicios_plan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan ejercicios del plan" ON ejercicios_plan;
CREATE POLICY "Profesores gestionan ejercicios del plan" ON ejercicios_plan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rutinas_diarias rd
      JOIN planes p ON rd.plan_id = p.id
      WHERE rd.id = ejercicios_plan.rutina_id AND p.profesor_id = auth.uid()
    )
  );


--- 6. Alumnos (Identidad Segura)
CREATE TABLE IF NOT EXISTS alumnos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Identidad real
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES planes(id) ON DELETE SET NULL,
  email text,
  nombre text NOT NULL,
  fecha_inicio date DEFAULT current_date,
  estado text DEFAULT 'activo',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan sus alumnos" ON alumnos;
CREATE POLICY "Profesores gestionan sus alumnos" ON alumnos FOR ALL USING (auth.uid() = profesor_id);

DROP POLICY IF EXISTS "Alumnos ven su propio perfil heredado" ON alumnos;
CREATE POLICY "Alumnos ven su propio perfil heredado" ON alumnos FOR SELECT USING (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Alumnos reclaman su perfil" ON alumnos;
CREATE POLICY "Alumnos reclaman su perfil" ON alumnos FOR UPDATE USING (email = (auth.jwt() ->> 'email') AND user_id IS NULL) WITH CHECK (user_id = auth.uid());


--- 7. Pagos y Tracking
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  monto numeric NOT NULL,
  fecha_vencimiento date NOT NULL,
  fecha_pago timestamptz,
  estado text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sesiones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  fecha date NOT NULL,
  completada boolean DEFAULT false,
  notas text,
  notas_alumno text,
  notas_profesor text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ejercicio_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id uuid REFERENCES sesiones(id) ON DELETE CASCADE NOT NULL,
  ejercicio_id uuid REFERENCES ejercicios_plan(id) ON DELETE CASCADE NOT NULL,
  series_reales int,
  reps_reales int,
  peso_kg numeric,
  rpe int,
  nota_alumno text,
  respuesta_profesor text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicio_logs ENABLE ROW LEVEL SECURITY;

--- Políticas de Herencia Ligera para Pagos y Sesiones (Soft Delete Aware)
DROP POLICY IF EXISTS "Acceso a pagos vía alumnos" ON pagos;
CREATE POLICY "Acceso a pagos vía alumnos" ON pagos FOR ALL USING (
  EXISTS (SELECT 1 FROM alumnos WHERE id = pagos.alumno_id AND profesor_id = auth.uid())
);

DROP POLICY IF EXISTS "Acceso a sesiones vía alumnos" ON sesiones;
CREATE POLICY "Acceso a sesiones vía alumnos" ON sesiones FOR ALL USING (
  EXISTS (SELECT 1 FROM alumnos WHERE id = sesiones.alumno_id AND profesor_id = auth.uid())
);

DROP POLICY IF EXISTS "Acceso a logs vía sesiones" ON ejercicio_logs;
CREATE POLICY "Acceso a logs vía sesiones" ON ejercicio_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sesiones s
    JOIN alumnos a ON s.alumno_id = a.id
    WHERE s.id = ejercicio_logs.sesion_id AND a.profesor_id = auth.uid()
  )
);


--- MIGRACIONES / ACTUALIZACIONES (Seguras para re-run)

-- 1. Agregar nuevas columnas a tabla profesores
ALTER TABLE profesores
ADD COLUMN IF NOT EXISTS telefono text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS gimnasio text,
ADD COLUMN IF NOT EXISTS ubicacion text,
ADD COLUMN IF NOT EXISTS foto_url text,
ADD COLUMN IF NOT EXISTS notif_cuotas_vencer boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_cuota_vencida boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_alumno_completado boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_nuevo_alumno boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notif_email_semanal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notif_frecuencia text DEFAULT 'evento',
ADD COLUMN IF NOT EXISTS perfil_publico boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS permitir_contacto boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mostrar_foto boolean DEFAULT true;

-- 2. Crear bucket de Storage para avatars (Si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS para Storage 'avatars'

-- A) Lectura Pública
DROP POLICY IF EXISTS "Avatares son de lectura publica" ON storage.objects;
CREATE POLICY "Avatares son de lectura publica" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- B) Subir avatar
DROP POLICY IF EXISTS "Profesor sube su propio avatar" ON storage.objects;
CREATE POLICY "Profesor sube su propio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- C) Actualizar avatar
DROP POLICY IF EXISTS "Profesor actualiza su propio avatar" ON storage.objects;
CREATE POLICY "Profesor actualiza su propio avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- D) Eliminar avatar
DROP POLICY IF EXISTS "Profesor elimina su propio avatar" ON storage.objects;
CREATE POLICY "Profesor elimina su propio avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

--- 8. ACTUALIZACIONES DE LA ITERACIÓN 1 (Soft Delete y Funciones)

-- 1. SOPORTE PARA BORRADO LÓGICO (SOFT DELETE) EN ALUMNOS
ALTER TABLE alumnos ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. ACTUALIZAR RLS PARA FILTRAR ELIMINADOS
-- Al usar DROP IF EXISTS nos aseguramos de no duplicar la política al re-ejecutar
DROP POLICY IF EXISTS "Profesores gestionan sus alumnos" ON alumnos;
CREATE POLICY "Profesores gestionan sus alumnos" ON alumnos 
FOR ALL USING (auth.uid() = profesor_id AND deleted_at IS NULL);

-- 3. FUNCIÓN RPC: CREAR PLAN COMPLETO (TRANSACCIONAL)
-- CREATE OR REPLACE asegura que la función se actualice limpia en cada ejecución
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
  -- 1. Insertar Plan Maestro
  INSERT INTO planes (profesor_id, nombre, duracion_semanas, frecuencia_semanal)
  VALUES (p_profesor_id, p_nombre, p_duracion_semanas, p_frecuencia_semanal)
  RETURNING id INTO v_plan_id;

  -- 2. Iterar sobre rutinas
  FOR v_rutina IN SELECT * FROM jsonb_array_elements(p_rutinas)
  LOOP
    INSERT INTO rutinas_diarias (plan_id, dia_numero, nombre_dia, orden)
    VALUES (v_plan_id, (v_rutina->>'dia_numero')::int, v_rutina->>'nombre_dia', (v_rutina->>'dia_numero')::int)
    RETURNING id INTO v_rutina_id;

    -- 3. Iterar sobre ejercicios de la rutina
    IF v_rutina ? 'ejercicios' THEN
      FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_rutina->'ejercicios')
      LOOP
        -- VALIDACIÓN IDOR: El ejercicio debe pertenecer al profesor
        IF NOT EXISTS (SELECT 1 FROM biblioteca_ejercicios WHERE id = (v_ejercicio->>'ejercicio_id')::uuid AND profesor_id = p_profesor_id) THEN
          RAISE EXCEPTION 'IDOR Detectado: El ejercicio % no pertenece al profesor %', (v_ejercicio->>'ejercicio_id'), p_profesor_id;
        END IF;

        INSERT INTO ejercicios_plan (rutina_id, ejercicio_id, series, reps_target, descanso_seg, orden, exercise_type, position)
        VALUES (
          v_rutina_id, 
          (v_ejercicio->>'ejercicio_id')::uuid, 
          (v_ejercicio->>'series')::int, 
          v_ejercicio->>'reps_target', 
          (v_ejercicio->>'descanso_seg')::int, 
          (v_ejercicio->>'orden')::int,
          COALESCE((v_ejercicio->>'exercise_type')::exercise_type, 'base'::exercise_type),
          COALESCE((v_ejercicio->>'position')::int, 0)
        );
      END LOOP;
    END IF;
  END LOOP;

  -- 4. Iterar sobre rotaciones
  IF p_rotaciones IS NOT NULL THEN
    FOR v_rotacion IN SELECT * FROM jsonb_array_elements(p_rotaciones)
    LOOP
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


--- 9. ACTUALIZACIONES DE LA ITERACIÓN 2 (Perfil Público)

-- 1. SOPORTE PARA CAMPOS DE LANDING PAGE Y REDES SOCIALES
ALTER TABLE profesores
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS portada_url text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS youtube text,
ADD COLUMN IF NOT EXISTS tiktok text,
ADD COLUMN IF NOT EXISTS x_twitter text,
ADD COLUMN IF NOT EXISTS especialidades text[];

--- 10. RUTINAS DINÁMICAS (SPRINT 1)

-- A) Tipos ENUM Idempotentes
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_type') THEN
        CREATE TYPE exercise_type AS ENUM ('base', 'complementary', 'accessory');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'variation_type') THEN
        CREATE TYPE variation_type AS ENUM ('move_day', 'rest_day', 'redistribute', 'combine_days');
    END IF;
END $$;

-- B) Modificación de ejercicios_plan
ALTER TABLE ejercicios_plan 
ADD COLUMN IF NOT EXISTS exercise_type exercise_type DEFAULT 'base',
ADD COLUMN IF NOT EXISTS position int DEFAULT 0;

-- C) Tabla Plan Rotaciones
CREATE TABLE IF NOT EXISTS plan_rotaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  position int NOT NULL,
  applies_to_days text[] NOT NULL, -- Ej: ['lunes', 'miercoles']
  cycles jsonb NOT NULL, -- Estructura de ciclos descrita en rutinasvariables.md
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_rotaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profesores gestionan rotaciones" ON plan_rotaciones;
CREATE POLICY "Profesores gestionan rotaciones" ON plan_rotaciones
  FOR ALL USING (EXISTS (SELECT 1 FROM planes WHERE id = plan_rotaciones.plan_id AND profesor_id = auth.uid()));

-- D) Tabla Plan Variaciones (Globales)
CREATE TABLE IF NOT EXISTS plan_variaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  numero_semana int NOT NULL,
  tipo variation_type NOT NULL,
  ajustes jsonb NOT NULL,
  razon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plan_variaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profesores gestionan variaciones" ON plan_variaciones;
CREATE POLICY "Profesores gestionan variaciones" ON plan_variaciones
  FOR ALL USING (EXISTS (SELECT 1 FROM planes WHERE id = plan_variaciones.plan_id AND profesor_id = auth.uid()));

-- E) Tabla Personalizaciones de Alumno (Personal)
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

ALTER TABLE student_plan_customizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profesores gestionan personalizaciones" ON student_plan_customizations;
CREATE POLICY "Profesores gestionan personalizaciones" ON student_plan_customizations
  FOR ALL USING (EXISTS (SELECT 1 FROM alumnos WHERE id = student_plan_customizations.alumno_id AND profesor_id = auth.uid()));

DROP POLICY IF EXISTS "Alumnos ven sus personalizaciones" ON student_plan_customizations;
CREATE POLICY "Alumnos ven sus personalizaciones" ON student_plan_customizations
  FOR SELECT USING (EXISTS (SELECT 1 FROM alumnos WHERE id = student_plan_customizations.alumno_id AND (auth.uid() = user_id OR email = (auth.jwt() ->> 'email'))));


--- 11. SEGUIMIENTO DE RECORDATORIOS Y PAGOS ATÓMICOS (PAGOS V2)

-- A) Columna para evitar spam de WhatsApp
ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS ultimo_recordatorio_pago_at timestamptz;

COMMENT ON COLUMN alumnos.ultimo_recordatorio_pago_at IS 'Fecha y hora del último mensaje de recordatorio de pago enviado vía WhatsApp.';

-- B) RPC para registrar cobro y renovar mes de forma atómica
CREATE OR REPLACE FUNCTION registrar_pago_atomico(
  p_alumno_id uuid,
  p_pago_id text, -- Puede ser UUID real o 'virtual-...'
  p_monto numeric,
  p_profesor_id uuid
) RETURNS json AS $$
DECLARE
  v_alumno_record record;
  v_next_date date;
  v_max_days int;
  v_pago_uuid uuid;
BEGIN
  -- 1. Verificar propiedad y obtener datos del alumno
  SELECT id, dia_pago, monto INTO v_alumno_record
  FROM alumnos WHERE id = p_alumno_id AND profesor_id = p_profesor_id AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'mensaje', 'Alumno no encontrado o sin permisos');
  END IF;

  -- 2. Manejar Pago Actual
  IF p_pago_id LIKE 'virtual-%' THEN
    -- Insertar el pago que era virtual como ya pagado
    INSERT INTO pagos (alumno_id, monto, fecha_vencimiento, estado, fecha_pago)
    VALUES (p_alumno_id, p_monto, CURRENT_DATE, 'pagado', NOW());
  ELSE
    -- Actualizar pago existente
    v_pago_uuid := p_pago_id::uuid;
    UPDATE pagos 
    SET estado = 'pagado', fecha_pago = NOW(), monto = p_monto
    WHERE id = v_pago_uuid AND alumno_id = p_alumno_id;
  END IF;

  -- 3. Calcular Próximo Vencimiento
  v_next_date := CURRENT_DATE + INTERVAL '1 month';
  v_max_days := date_part('days', (date_trunc('month', v_next_date) + interval '1 month - 1 day'))::int;
  
  -- Ajustar al día de pago
  v_next_date := make_date(
    date_part('year', v_next_date)::int,
    date_part('month', v_next_date)::int,
    LEAST(COALESCE(v_alumno_record.dia_pago, 15), v_max_days)
  );

  -- 4. Generar Próxima Cuota (Solo si no existe una pendiente para ese mes/futuro)
  IF NOT EXISTS (
    SELECT 1 FROM pagos 
    WHERE alumno_id = p_alumno_id 
    AND estado = 'pendiente' 
    AND fecha_vencimiento >= v_next_date
  ) THEN
    INSERT INTO pagos (alumno_id, monto, fecha_vencimiento, estado)
    VALUES (p_alumno_id, p_monto, v_next_date, 'pendiente');
  END IF;

  RETURN json_build_object('success', true, 'mensaje', '✅ Pago registrado y mes renovado con éxito');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--- 12. NOTIFICACIONES AL PROFESOR
CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL, -- 'comentario_sesion', 'comentario_ejercicio'
  mensaje text NOT NULL,
  referencia_id uuid,
  leida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profesores gestionan sus notificaciones" ON notificaciones;
CREATE POLICY "Profesores gestionan sus notificaciones" ON notificaciones 
  FOR ALL USING (auth.uid() = profesor_id);

DROP POLICY IF EXISTS "Alumnos/Sistema envían notificaciones" ON notificaciones;
CREATE POLICY "Alumnos/Sistema envían notificaciones" ON notificaciones 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM alumnos WHERE id = notificaciones.alumno_id AND (auth.uid() = user_id OR email = (auth.jwt() ->> 'email')))
  );