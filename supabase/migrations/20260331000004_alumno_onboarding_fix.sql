--- MIGRACIÓN FIX: AUTO-ONBOARDING DE ALUMNOS (RLS UPDATE)

-- Permitir a un alumno vincular su cuenta Auth real (user_id)
-- si y solo si:
-- 1. El email que usa para loguearse coincide con el insertado por el profesor.
-- 2. La columna user_id en la base sigue vacía (previniendo robos).
-- 3. Sólo está intentando actualizar el 'user_id' para que coincida con su identidad Real.

DROP POLICY IF EXISTS "Alumnos reclaman su perfil" ON alumnos;

CREATE POLICY "Alumnos reclaman su perfil" ON alumnos 
  FOR UPDATE USING (
    email = (auth.jwt() ->> 'email') AND 
    user_id IS NULL
  ) 
  WITH CHECK (
    user_id = auth.uid()
  );
