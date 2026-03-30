-- Migración: Actualizamos la tabla profesores y configuramos el Storage para Avatares

-- 1. Agregar nuevas columnas a tabla profesores
ALTER TABLE profesores
ADD COLUMN telefono text,
ADD COLUMN bio text,
ADD COLUMN gimnasio text,
ADD COLUMN ubicacion text,
ADD COLUMN foto_url text,
ADD COLUMN notif_cuotas_vencer boolean DEFAULT true,
ADD COLUMN notif_cuota_vencida boolean DEFAULT true,
ADD COLUMN notif_alumno_completado boolean DEFAULT true,
ADD COLUMN notif_nuevo_alumno boolean DEFAULT true,
ADD COLUMN notif_email_semanal boolean DEFAULT false,
ADD COLUMN notif_frecuencia text DEFAULT 'evento',
ADD COLUMN perfil_publico boolean DEFAULT false,
ADD COLUMN permitir_contacto boolean DEFAULT true,
ADD COLUMN mostrar_foto boolean DEFAULT true;

-- 2. Crear bucket de Storage para avatars (Si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS para Storage 'avatars'
-- A) Lectura Pública (Cualquiera puede ver los avatares)
CREATE POLICY "Avatares son de lectura publica" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- B) Subir avatar (Solo autenticados, a su propia carpeta)
CREATE POLICY "Profesor sube su propio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- C) Actualizar avatar (Solo el dueño)
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

-- D) Eliminar avatar (Solo el dueño)
CREATE POLICY "Profesor elimina su propio avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
