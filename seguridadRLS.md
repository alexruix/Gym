# 🛑 Plan de Hardening: Seguridad RLS y Auditoría Proactiva

Este documento detalla la hoja de ruta para implementar una seguridad de **Alto Rendimiento** en MiGym, centrada en proteger la privacidad de los alumnos y detectar intentos de acceso no autorizados (IDOR).

---

## 1. Hardening del RLS (Modo Barrio)

Actualmente, el "Modo Barrio" utiliza el cliente Admin (`service_role`), lo que delega toda la seguridad al filtrado manual en el código Astro. La mejora propuesta consiste en activar una "Red de Seguridad" en la base de datos.

### Estrategia: Sesión Virtual mediante Cabeceras
Se refactorizará `getAuthenticatedClient` para que, en el caso de invitados, devuelva un cliente con el rol `anon`, pero inyectando la identidad del alumno en las cabeceras de la petición.

**Cabeceras Requeridas:**
- `x-gym-access-token`: El token único del alumno (sacado de la cookie `gym_access`).
- `x-gym-student-id`: El ID del alumno (validado previamente en el middleware).

### 📄 Script de Migración Manual (`migracion_seguridad.sql`)
> [!IMPORTANT]
> Este SQL debe ejecutarse manualmente en el SQL Editor de Supabase.

```sql
-- 1. Tabla de Logs de Seguridad
CREATE TABLE public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,        -- Alumno que intenta el acceso
    target_id UUID,               -- Recurso al que intenta acceder
    reason TEXT,                  -- 'IDOR_ATTEMPT', 'UNAUTHORIZED_QUERY'
    severity TEXT DEFAULT 'warning', -- 'warning', 'critical'
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Funciones de extracción de contexto (Headers)
CREATE OR REPLACE FUNCTION get_gym_token() RETURNS TEXT AS $$
  SELECT (current_setting('request.headers', true)::jsonb)->>'x-gym-access-token';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_gym_student_id() RETURNS TEXT AS $$
  SELECT (current_setting('request.headers', true)::jsonb)->>'x-gym-student-id';
$$ LANGUAGE sql STABLE;

-- 3. Ejemplo de Política RLS Reforzada (Tabla ALUMNOS)
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student access via secure headers" ON alumnos
FOR SELECT USING (
  -- Permite acceso solo si el token y el ID coinciden con lo enviado en las cabeceras
  access_token = get_gym_token() 
  AND id = get_gym_student_id()::uuid
);

-- 4. Ejemplo para RUTINAS (Join indirecto)
CREATE POLICY "Student access routines via header" ON rutinas_diarias
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM alumnos 
    WHERE alumnos.plan_id = rutinas_diarias.plan_id 
    AND alumnos.access_token = get_gym_token()
    AND alumnos.id = get_gym_student_id()::uuid
  )
);
```

---

## 2. Auditoría de Intrusiones (IDS)

Se implementará un middleware de auditoría interna que compare la identidad del contexto (`locals.user.id`) con la identidad del recurso solicitado en las Astro Actions.

### Lógica de Notificaciones
- **Urgencia en Dashboard:** Todo intento de bypass disparará una notificación inmediata en el Dashboard del Profesor con un indicador visual de alta urgencia (punto rojo / `bg-destructive`).
- **Alertas por Email:** Reservadas **exclusivamente** para incidentes de severidad `critical`. Se define como critical cuando se detectan múltiples fallos de validación en pocos segundos desde una misma identidad (indicativo de *scraping* automatizado).

---

## 3. Regla de Oro de Seguridad (SSOT)

A incorporarse en el manual operativo:

> [!CAUTION]
> **SEGURIDAD MANDATORIA:**
> Todo fetch realizado bajo el contexto de Alumno **DEBE** incluir el filtro explícito de identidad (`.eq('id', user.id)` o `.eq('alumno_id', user.id)`), incluso si el RLS está activo. La seguridad debe ser redundante: Red en el Código + Red en la DB.

---

## 4. Próximos Pasos

1. Ejecutar el SQL de migración en el entorno de Staging.
2. Refactorizar `src/lib/supabase-ssr.ts` (solo tras confirmación de SQL exitoso).
3. Testear la denegación de servicio al remover manualmente las cabeceras de una petición.
