-- Migración: Fix RLS en tabla Alumnos para permitir archivado (Soft Delete)
-- Fecha: 2026-04-04
-- Descripción: Refactoriza políticas RLS de la tabla 'alumnos' para separar SELECT de UPDATE,
-- evitando el error "new row violates row-level security policy" al setear deleted_at.

-- 1. Eliminar políticas conflictivas previas
DROP POLICY IF EXISTS "Profesores ven y gestionan alumnos activos" ON alumnos;
DROP POLICY IF EXISTS "Profesores archivan alumnos" ON alumnos;

-- 2. Crear políticas granulares y precisas

-- SELECT: El profesor solo ve alumnos que NO han sido borrados (Soft Delete activo)
CREATE POLICY "profesor_select_alumnos_activos" ON alumnos
  FOR SELECT USING (
    auth.uid() = profesor_id AND deleted_at IS NULL
  );

-- INSERT: El profesor puede invitar nuevos alumnos
CREATE POLICY "profesor_insert_alumnos" ON alumnos
  FOR INSERT WITH CHECK (
    auth.uid() = profesor_id
  );

-- UPDATE: El profesor puede editar sus alumnos e incluso ARCHIVARLOS
-- El USING asegura que solo edite alumnos que eran suyos y estaban activos.
-- El WITH CHECK asegura que el alumno resultante siga siendo suyo (pero permite que deleted_at cambie).
CREATE POLICY "profesor_update_alumnos" ON alumnos
  FOR UPDATE USING (
    auth.uid() = profesor_id AND deleted_at IS NULL
  )
  WITH CHECK (
    auth.uid() = profesor_id
  );

-- 3. Comentario de auditoría
COMMENT ON TABLE alumnos IS 'Tabla de alumnos con Soft Delete (deleted_at). RLS configurada para permitir archivado.';
