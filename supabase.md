# 🗄️ Esquema de Base de Datos (Supabase) - v3.0 (Final Audit Corrected)

Este archivo contiene el código SQL final corregido para **MiGym**, incluyendo identidad vinculada a Auth, frecuencia de planes y métricas granulares de ejercicios.

---

## 🛠️ Configuración Global

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📊 Tablas Principales

### 1. Profesores

```sql
CREATE TABLE profesores (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  nombre text, -- Nombre público (Personal o Gimnasio)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dueño puede ver su propio perfil" ON profesores FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Dueño puede actualizar su propio perfil" ON profesores FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Inserción vía onboarding" ON profesores FOR INSERT WITH CHECK (true);
```

### 2. Biblioteca de Ejercicios

```sql
CREATE TABLE biblioteca_ejercicios (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  media_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE biblioteca_ejercicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesores gestionan su biblioteca" ON biblioteca_ejercicios FOR ALL USING (auth.uid() = profesor_id);
```

### 3. Planes

Agregado: `frecuencia_semanal` para filtros y organización.

```sql
CREATE TABLE planes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id uuid REFERENCES profesores(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  duracion_semanas int DEFAULT 4,
  frecuencia_semanal int DEFAULT 3, -- Días por semana
  created_at timestamptz DEFAULT now()
);

ALTER TABLE planes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesores gestionan sus planes" ON planes FOR ALL USING (auth.uid() = profesor_id);
```

### 4. Rutinas Diarias

```sql
CREATE TABLE rutinas_diarias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id uuid REFERENCES planes(id) ON DELETE CASCADE NOT NULL,
  dia_numero int NOT NULL,
  nombre_dia text,
  orden int DEFAULT 0
);

ALTER TABLE rutinas_diarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesores gestionan sus rutinas" ON rutinas_diarias
  FOR ALL USING (EXISTS (SELECT 1 FROM planes WHERE planes.id = rutinas_diarias.plan_id AND planes.profesor_id = auth.uid()));
```

### 5. Ejercicios del Plan (Métricas Granulares)

Agregado: Separación de `series`, `reps_target` y `descanso_seg`.

```sql
CREATE TABLE ejercicios_plan (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rutina_id uuid REFERENCES rutinas_diarias(id) ON DELETE CASCADE NOT NULL,
  ejercicio_id uuid REFERENCES biblioteca_ejercicios(id) ON DELETE CASCADE NOT NULL,
  series int DEFAULT 3,
  reps_target text DEFAULT '12', -- Puede ser "10-12", "Al fallo", etc.
  descanso_seg int DEFAULT 60,    -- Clave para el cronómetro de la app
  orden int DEFAULT 0
);

ALTER TABLE ejercicios_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesores gestionan ejercicios del plan" ON ejercicios_plan
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rutinas_diarias rd
      JOIN planes p ON rd.plan_id = p.id
      WHERE rd.id = ejercicios_plan.rutina_id AND p.profesor_id = auth.uid()
    )
  );
```

### 6. Alumnos (Identidad Segura)

Agregado: `user_id` para vincular con `auth.users` y evitar pérdida de historial.

```sql
CREATE TABLE alumnos (
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

CREATE POLICY "Profesores gestionan sus alumnos" ON alumnos FOR ALL USING (auth.uid() = profesor_id);
CREATE POLICY "Alumnos ven su propio perfil heredado" ON alumnos FOR SELECT USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
```

### 7. Pagos y Tracking

```sql
CREATE TABLE pagos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  monto numeric NOT NULL,
  fecha_vencimiento date NOT NULL,
  fecha_pago timestamptz,
  estado text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE sesiones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id uuid REFERENCES alumnos(id) ON DELETE CASCADE NOT NULL,
  fecha date NOT NULL,
  completada boolean DEFAULT false,
  notas text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ejercicio_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id uuid REFERENCES sesiones(id) ON DELETE CASCADE NOT NULL,
  ejercicio_id uuid REFERENCES ejercicios_plan(id) ON DELETE CASCADE NOT NULL,
  series_reales int,
  reps_reales int,
  peso_kg numeric,
  rpe int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicio_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS telefono text,
ADD COLUMN IF NOT EXISTS dia_pago int DEFAULT 15,
ADD COLUMN IF NOT EXISTS monto numeric,
ADD COLUMN IF NOT EXISTS notas text;


-- Políticas simplificadas: El profesor ve todo lo de sus alumnos. El alumno ve lo propio vía user_id o email.
```

-- 1. Eliminamos la política problemática
DROP POLICY IF EXISTS "Alumnos ven su propio perfil heredado" ON alumnos;

-- 2. La recreamos usando auth.jwt()
CREATE POLICY "Alumnos ven su propio perfil heredado" ON alumnos
FOR SELECT
USING (
auth.uid() = user_id
OR
email = (auth.jwt() ->> 'email')
);
