--- MIGRACIÓN FASE 3: COMENTARIOS Y NOTIFICACIONES

-- 1. Agregar columnas para comentarios a sesiones (Nivel día)
ALTER TABLE sesiones
ADD COLUMN IF NOT EXISTS notas_alumno text,
ADD COLUMN IF NOT EXISTS notas_profesor text;

COMMENT ON COLUMN sesiones.notas_alumno IS 'Feedback general del alumno al terminar la sesión (día completo).';
COMMENT ON COLUMN sesiones.notas_profesor IS 'Respuesta general o anotación del profesor sobre este día específico.';

-- 2. Agregar columnas para comentarios a ejercicio_logs (Nivel de ejercicio puntual)
ALTER TABLE ejercicio_logs
ADD COLUMN IF NOT EXISTS nota_alumno text,
ADD COLUMN IF NOT EXISTS respuesta_profesor text;

COMMENT ON COLUMN ejercicio_logs.nota_alumno IS 'Comentario del alumno sobre un ejercicio específico (ej: "Me dolió el hombro").';
COMMENT ON COLUMN ejercicio_logs.respuesta_profesor IS 'Respuesta del profesor a esa nota (independiente de la semana siguiente).';

-- 3. Crear tabla de Notificaciones para el Profesor
CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL, -- Valores esperados: 'comentario_sesion', 'comentario_ejercicio', 'sesion_completada', 'pago_vencido'
  mensaje text NOT NULL,
  referencia_id uuid, -- ID de la sesión o ejercicio_log que disparó la notificación
  leida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Política: Profesores solo ven y editan sus propias notificaciones
DROP POLICY IF EXISTS "Profesores gestionan sus notificaciones" ON notificaciones;
CREATE POLICY "Profesores gestionan sus notificaciones" ON notificaciones 
  FOR ALL USING (auth.uid() = profesor_id);

-- Política: Alumnos pueden insertar notificaciones (vía un Trigger o API cuando comentan)
-- Nota: La app usará logicamente triggers o actions con service_role,
-- pero si lo hacen directo, validamos que el alumno pertenezca al profesor.
DROP POLICY IF EXISTS "Alumnos/Sistema envían notificaciones" ON notificaciones;
CREATE POLICY "Alumnos/Sistema envían notificaciones" ON notificaciones 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM alumnos WHERE id = notificaciones.alumno_id AND (auth.uid() = user_id OR email = (auth.jwt() ->> 'email')))
  );
