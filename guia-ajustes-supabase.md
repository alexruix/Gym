# Guía de Ajustes para Supabase (MiGym)

Sigue estos pasos para alinear tu base de datos y configuración de Supabase con el flujo de **Magic Link + Server-side Binding**.

## 1. Configuración de Autenticación (Dashboard)

1.  **Entra a Supabase**: Ve a tu proyecto en [supabase.com](https://supabase.com).
2.  **Proveedores de Auth**:
    *   Ve a **Authentication > Providers > Email**.
    *   Asegúrate de que **"Confirm email"** esté activado.
    *   Asegúrate de que **"Magic Link"** esté activado.
3.  **Configuración de URLs**:
    *   Ve a **Authentication > URL Configuration**.
    *   **Site URL**: Pon tu dominio principal (ej: `https://migym.app` o `http://localhost:4321` en desarrollo).
    *   **Redirect URLs**: Agrega exactamente esta ruta:
        *   `${TU_DOMINIO}/api/auth/callback`

---

## 2. Aplicación de la Lógica de Vinculación (SQL Editor)

Si aún no has corrido las últimas migraciones, ve al **SQL Editor** de Supabase y ejecuta este bloque para habilitar el "reclamo" de perfil seguro:

```sql
--- PERMITIR QUE EL ALUMNO VINCULE SU CUENTA AL PRIMER LOGIN
--- Usamos DROP primero para asegurar que no haya duplicados
DROP POLICY IF EXISTS "Alumnos reclaman su perfil" ON alumnos;

CREATE POLICY "Alumnos reclaman su perfil" ON alumnos 
  FOR UPDATE USING (
    email = (auth.jwt() ->> 'email') AND 
    user_id IS NULL
  ) 
  WITH CHECK (
    user_id = auth.uid()
  );

-- Habilitar RLS (si no estaba habilitado)
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
```

> [!NOTE]
> **¿Por qué esto es seguro?**: Porque `auth.jwt() ->> 'email'` es un valor verificado por Supabase Auth. Nadie puede "mentir" sobre su email para robar un perfil ajeno.

---

## 3. Notificaciones y Comentarios (Opcional)

Si también necesitas activar las tablas de feedback que discutimos, corre este SQL:

```sql
-- Columnas de Feedback en Sesiones y Logs
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS notas_alumno text;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS notas_profesor text;
ALTER TABLE ejercicio_logs ADD COLUMN IF NOT EXISTS nota_alumno text;
ALTER TABLE ejercicio_logs ADD COLUMN IF NOT EXISTS respuesta_profesor text;

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,
  mensaje text NOT NULL,
  referencia_id uuid,
  leida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Política de lectura para el profesor
DROP POLICY IF EXISTS "Profesores gestionan sus notificaciones" ON notificaciones;
CREATE POLICY "Profesores gestionan sus notificaciones" ON notificaciones 
  FOR ALL USING (auth.uid() = profesor_id);
```

---

## 4. Verificación de Funcionamiento

Para probar que todo está alineado:
1.  **Crea un alumno** desde el panel del profesor (esto insertará el email con `user_id = NULL`).
2.  **Cierra sesión** y entra como alumno usando ese email (Magic Link).
3.  **Revisa la DB**: El campo `user_id` en la tabla `alumnos` debería haberse llenado automáticamente con el UUID del alumno gracias a la lógica del `callback.ts` y estas políticas.
