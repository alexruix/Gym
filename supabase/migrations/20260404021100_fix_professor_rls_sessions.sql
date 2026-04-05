-- 1. Permitir a los profesores ver/editar sesiones para sus alumnos
DROP POLICY IF EXISTS "profesor_select_alumno_sesiones" ON sesiones_instanciadas;
CREATE POLICY "profesor_select_alumno_sesiones" ON sesiones_instanciadas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM alumnos a
      WHERE a.id = sesiones_instanciadas.alumno_id AND a.profesor_id = auth.uid()
    )
  );

-- 2. Permitir a los profesores ver/editar ejercicios en las sesiones de sus alumnos
DROP POLICY IF EXISTS "profesor_select_alumno_ej" ON sesion_ejercicios_instanciados;
CREATE POLICY "profesor_select_alumno_ej" ON sesion_ejercicios_instanciados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sesiones_instanciadas s
      JOIN alumnos a ON a.id = s.alumno_id
      WHERE s.id = sesion_ejercicios_instanciados.sesion_id AND a.profesor_id = auth.uid()
    )
  );
