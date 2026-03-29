# 🏗️ MiGym: System Architecture

## Visión General

MiGym es una plataforma SaaS donde **Profesores** crean planes de entrenamiento y **Alumnos** los siguen con tracking de progreso. La arquitectura prioriza:

1. **Velocidad:** Carga instantánea (SSR + Static Generation)
2. **Simplicidad:** UX sin fricción para profesor ocupado
3. **Escalabilidad:** Multi-gimnasio / multi-profesor futuro
4. **Confiabilidad:** Datos seguros (Supabase RLS)

---

## 🏷️ Glosario de Términos (Training Domain)

Para evitar ambigüedad en el código y la UX, MiGym utiliza esta jerarquía:

- **Plan:** El contenedor de alto nivel (ej: "Hipertrofia 3 Días"). Define el objetivo general y la frecuencia semanal.
- **Rutina (Diaria):** Una unidad de entrenamiento dentro de un plan (ej: "Día A: Pecho/Biceps"). Un plan contiene N rutinas.
- **Ejercicio del Plan:** La instancia de un ejercicio de la biblioteca dentro de una rutina específica, con variables de carga (series, reps, descanso).
- **Sesión:** El registro histórico de cuando un alumno ejecuta una rutina un día específico.
- **Biblioteca de Ejercicios:** El catálogo global de movimientos del profesor, sin variables de carga asignadas.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito | Razón |
|------|-----------|----------|-------|
| **Frontend Framework** | Astro 5 (SSR + Islands) | Renderizado híbrido (estático + dinámico) | Páginas de profesor (dashboard) cargan como HTML. Componentes interactivos (crear plan) como Islands React. |
| **UI Library** | shadcn/ui (Radix + Tailwind) | Componentes accesibles y consistentes | Buttonss, Forms, Tables, Dialogs listos. Sin dependencias externas. |
| **Styling** | Tailwind CSS v4 | Utilidad-first, responsive | Mobile-first design. Dark mode gratis. |
| **State Management** | React Hooks + Astro Actions | Estado en cliente + Server Actions | Sin Redux. Profesor crea plan → envía action → DB responde → UI actualiza. |
| **Backend / BaaS** | Supabase (PostgreSQL + Auth) | DB, Auth, RLS, Storage | Open source. Row-level security para permisos. Webhook-ready. |
| **Database** | PostgreSQL | RDBMS relacional | Integridad referencial (Profesor → Planes → Ejercicios → Sesiones). |
| **Realtime** | Supabase Realtime (WebSocket) | Push en vivo | Profesor ve cuando alumno completó sesión. Alumno ve ajustes de plan en tiempo real. |
| **Auth** | Supabase Auth (Magic Links) | Passwordless vía Email | Sin contraseñas. Acceso simple. Email magic link o futura integración WhatsApp. |
| **File Storage** | Supabase Storage | Imágenes de ejercicios | Vídeos, fotos de técnica. CDN incluido. |
| **Data Import** | SheetJS (xlsx parser) | Importar alumnos desde Excel | Profesor: "Acá tengo mis alumnos en Excel". Importa, vincula a planes. |
| **Deployment** | Vercel | Hosting Edge + CI/CD | Deploys automáticos. Vercel + Supabase = zero-config. |

---

## 📊 Modelo de Datos (ERD simplificado)

### Entidades Principales

```
┌─────────────────┐
│    PROFESOR     │
├─────────────────┤
│ id (PK)         │
│ email           │
│ nombre (público)│
│ created_at      │
└────────┬────────┘
         │ 1:N
         ├──────────────────────────────────┐
         ▼                                  ▼
┌─────────────────┐                ┌──────────────────┐
│      PLAN       │                │BIBLIO_EJERCICIOS │
├─────────────────┤                ├──────────────────┤
│ id (PK)         │                │ id (PK)          │
│ profesor_id (FK)│                │ profesor_id (FK) │
│ nombre          │                │ nombre           │
│ duracion_semanas│                │ descripcion      │
│ frecuencia_sem  │                │ media_url        │
└────────┬────────┘                └────────┬─────────┘
         │ 1:N                              │ 1:N
         ▼                                  │
┌─────────────────┐                         │
│ RUTINA_DIARIA   │                         │
├─────────────────┤                         │
│ id (PK)         │                         │
│ plan_id (FK)    │                         │
│ dia_numero      │                         │
│ nombre_dia      │                         ▼
└────────┬────────┘                ┌──────────────────┐
         │ 1:N                     │  EJERCICIO_PLAN  │
         ▼                         ├──────────────────┤
┌─────────────────┐                │ id (PK)          │
│     ALUMNO      │◀───────────────┤ rutina_id (FK)   │
├─────────────────┤                │ ejercicio_id (FK)│
│ id (PK)         │                │ series (int)     │
│ user_id (FK)    │                │ reps_target(txt) │
│ profesor_id (FK)│                │ descanso_seg(int)│
│ email           │                │ orden            │
└────────┬────────┘                └──────────────────┘
         │ 1:N
         ├──────────────────────────────────┐
         ▼                                  ▼
┌─────────────────┐                ┌──────────────────┐
│     SESION      │                │      PAGOS       │
├─────────────────┤                ├──────────────────┤
│ id (PK)         │                │ id (PK)          │
│ alumno_id (FK)  │                │ alumno_id (FK)   │
│ fecha           │                │ monto            │
│ completada      │                │ fecha_venc       │
│ estado           │               │ estado           │
└────────┬────────┘                └──────────────────┘
         │ 1:N
         ▼
┌──────────────────┐
│ EJERCICIO_LOGS   │
├──────────────────┤
│ id (PK)          │
│ sesion_id (FK)   │
│ ejercicio_id (FK)│
│ series_reales    │
│ reps_reales      │
│ peso_kg          │
│ rpe (opcional)   │
└──────────────────┘
```

### Campos Clave

**PROFESOR**
- `id` (UUID)
- `email` (único)
- `nombre` (Identidad pública: ej. "CrossFit Sur" o "Nico Varela")
- `created_at`

**BIBLIOTECA_EJERCICIOS**
- `id` (UUID)
- `profesor_id` (FK → PROFESOR)
- `nombre` (ej: "Press de Banca")
- `descripcion` (instrucciones técnicas globales)
- `media_url` (Video/Imagen)

**PLAN** (Contenedor Maestro)
- `id` (UUID)
- `profesor_id` (FK → PROFESOR)
- `nombre` (ej: "Plan Principiante")
- `duracion_semanas` (int: 2, 3, 4 etc)
- `frecuencia_semanal` (int: Cantidad de rutinas distintas que componen el plan)
- `created_at`

**RUTINA_DIARIA** (Día de entrenamiento)
- `id` (UUID)
- `plan_id` (FK → PLAN)
- `dia_numero` (int: 1, 2, 3...)
- `nombre_dia` (ej: "Día 1: Empuje")

**EJERCICIO_PLAN** (Instancia con carga)
- `id` (UUID)
- `rutina_id` (FK → RUTINA_DIARIA)
- `ejercicio_id` (FK → BIBLIOTECA_EJERCICIOS)
- `series` (int: 4)
- `reps_target` (text: "12" o "Al fallo")
- `descanso_seg` (int: 90)
- `orden` (int)

**ALUMNO**
- `id` (UUID)
- `user_id` (FK → auth.users.id, permite cambio de email/social login)
- `profesor_id` (FK → PROFESOR)
- `email`, `nombre`, `plan_id`, `fecha_inicio`
- `estado` (activo, pausado, moroso)

**PAGOS**
- `id` (UUID)
- `alumno_id` (FK → ALUMNO)
- `monto` (ARS)
- `fecha_vencimiento` (date)
- `estado` (pagado, pendiente, vencido)

**SESION**
- `id` (UUID)
- `alumno_id` (FK → ALUMNO)
- `fecha`, `completada`, `notas`

**EJERCICIO_LOGS**
- `id` (UUID)
- `sesion_id` (FK → SESION)
- `ejercicio_id` (FK → EJERCICIO_PLAN)
- `series_reales`, `reps_reales`, `peso_kg`, `rpe`
*(Nota: Reemplaza JSON para facilitar queries analíticas de evolución del volumen de carga).*

---

## 🔄 Flujos de Datos (Data Flow)

### Flujo 1: Profesor Crea un Plan

```
┌─────────────┐
│  Profesor   │
│ en MiGym    │
└──────┬──────┘
       │ 1. Click "Crear Plan"
       ▼
┌─────────────────────────────────┐
│ Astro Page: /profesor/planes/new │ (SSR)
└──────┬──────────────────────────┘
       │ 2. Form con shadcn/ui
       │    - Nombre plan
       │    - Duración (semanas)
       │    - Agregar ejercicios
       ▼
┌──────────────────────────┐
│ Island de React          │ (handleSubmit)
│ - Validación cliente     │
│ - Estado local           │
└──────┬───────────────────┘
       │ 3. Envía Astro Action
       │    { name, weeks, exercises[] }
       ▼
┌──────────────────────────┐
│ Supabase RPC / Action    │ (Server)
│ - INSERT PLAN            │
│ - INSERT EJERCICIOS      │
│ - RLS: profesor_id = auth.uid() │
└──────┬───────────────────┘
       │ 4. Respuesta: { plan_id, status }
       ▼
┌──────────────────────────┐
│ UI actualiza (revalidate)│
│ Redirect → /planes/{id}  │
│ "✅ Plan guardado"       │
└──────────────────────────┘
```

### Flujo 2: Profesor Invita Alumno

```
┌─────────────┐
│  Profesor   │
└──────┬──────┘
       │ 1. Click "Agregar alumno"
       ▼
┌──────────────────────────┐
│ Modal shadcn/ui          │
│ - Email alumno           │
│ - Seleccionar plan       │
│ - Fecha inicio           │
└──────┬───────────────────┘
       │ 2. Astro Action: inviteAlumno()
       ▼
┌──────────────────────────┐
│ Supabase                 │
│ - INSERT ALUMNO          │
│ - SEND EMAIL (Supabase Fn)│ Magic Link
└──────┬───────────────────┘
       │ 3. Email llega a alumno
       │    "Tu profesor te invitó a MiGym"
       │    Magic link
       ▼
┌─────────────────────────┐
│ Alumno hace click       │
│ Se loguea automático    │
│ Redirect → /mi-plan     │
└─────────────────────────┘
```

### Flujo 3: Alumno Completa Sesión

```
┌─────────────┐
│   Alumno    │
│ Viendo plan │
└──────┬──────┘
       │ 1. Click "Hoy"
       ▼
┌──────────────────────────┐
│ Página: /mi-plan/sesion/ │
│ (SSR con datos actuales) │
│                          │
│ Muestra ejercicios       │
│ Botón "Marcar como hecho"│
└──────┬───────────────────┘
       │ 2. Island React
       │    - User logra X reps
       │    - Click "Guardar"
       ▼
┌──────────────────────────┐
│ Astro Action             │
│ { alumno_id, sesion_id,  │
│   series_log: JSON }     │
└──────┬───────────────────┘
       │ 3. Supabase
       │    - UPDATE SESION
       │    - completada = true
       │    - Trigger: notify profesor
       ▼
┌──────────────────────────┐
│ Profesor recibe notif    │
│ (via Supabase Realtime)  │
│                          │
│ "Juan completó hoy"      │
└──────────────────────────┘
```

### Flujo 4: Profesor Importa Alumnos desde Excel

```
┌──────────────┐
│   Profesor   │
│ con archivo  │
└──────┬───────┘
       │ 1. File input
       │    alumno_list.xlsx
       ▼
┌──────────────────────────┐
│ Island React             │
│ SheetJS parsea Excel     │
│ { nombre, email }[]      │
└──────┬───────────────────┘
       │ 2. Preview table
       │    ¿Está bien?
       ▼
┌──────────────────────────┐
│ Click "Importar"         │
│ Astro Action: bulkImport │
└──────┬───────────────────┘
       │ 3. Supabase
       │    INSERT alumnos (batch)
       │    Asigna plan (si aplica)
       ▼
┌──────────────────────────┐
│ "✅ Importados 23 alumnos"│
│ Tabla se actualiza       │
└──────────────────────────┘
```

---

## 🔐 Seguridad y Permisos (RLS)

### Row-Level Security en Supabase

**Regla 1: Profesor solo ve sus planes**
```sql
CREATE POLICY "professor_own_plans" ON planes
  FOR SELECT USING (profesor_id = auth.uid());
```

**Regla 2: Profesor solo ve sus alumnos**
```sql
CREATE POLICY "professor_own_alumnos" ON alumnos
  FOR SELECT USING (profesor_id = auth.uid());
```

**Regla 3: Alumno solo ve su plan asignado**
```sql
CREATE POLICY "alumno_own_sesiones" ON sesiones
  FOR SELECT USING (
    alumno_id IN (
      SELECT id FROM alumnos WHERE id = auth.uid()
    )
  );
```

**Regla 4: Solo profesor puede modificar plan**
```sql
CREATE POLICY "profesor_update_plan" ON planes
  FOR UPDATE USING (profesor_id = auth.uid());
```

---

## 🏗️ Estructura de Directorios (Astro)

```
migym/
├── src/
│   ├── components/
│   │   ├── ui/               (shadcn/ui - Components Librería)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── atoms/            (Átomos de negocio)
│   │   │   ├── StatusBadge.tsx
│   │   │   └── RoleIcon.tsx
│   │   ├── molecules/        (Agrupaciones simples)
│   │   │   ├── UserAvatar.tsx
│   │   │   └── SearchInput.tsx
│   │   └── organisms/        (Bloques complejos e Islands)
│   │       ├── PlanForm.tsx  (React Island)
│   │       ├── ExerciseCard.tsx
│   │       ├── ImportExcelForm.tsx (Island + SheetJS)
│   │       └── DashboardSummary.tsx
│   ├── layouts/
│   │   ├── ProfesorLayout.astro
│   │   └── AlumnoLayout.astro
│   ├── pages/
│   │   ├── index.astro          (Landing)
│   │   ├── login.astro
│   │   ├── profesor/
│   │   │   ├── dashboard.astro
│   │   │   ├── planes/
│   │   │   │   ├── index.astro
│   │   │   │   ├── [id].astro
│   │   │   │   └── new.astro
│   │   │   ├── alumnos/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   └── reportes.astro
│   │   └── alumno/
│   │       ├── mi-plan.astro
│   │       ├── sesion/
│   │       │   ├── index.astro
│   │       │   └── [numero].astro
│   │       └── progreso.astro
│   ├── actions/           (Astro Actions)
│   │   ├── profesor.ts
│   │   │   ├── createPlan()
│   │   │   ├── inviteAlumno()
│   │   │   ├── updatePlan()
│   │   │   └── importAlumnos()
│   │   └── alumno.ts
│   │       ├── completarSesion()
│   │       └── getProgreso()
│   ├── data/
│   │   ├── authContent.ts   (Textos y Copy SSOT)
│   │   └── landingCopy.ts
│   ├── lib/
│   │   ├── supabase.ts      (Cliente Supabase)
│   │   ├── auth.ts          (Helpers auth)
│   │   ├── validators.ts    (Zod schemas SSOT)
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css      (Tailwind imports)
│   └── env.d.ts
├── public/
│   ├── logo.svg
│   └── og-image.png
├── astro.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## 🚀 Flows de Rendering

### Página estática (Profesor dashboard)

```
Astro page: /profesor/index.astro
  ↓
getStaticProps(userId) → Query Supabase
  ↓
Render HTML + CSS (Tailwind)
  ↓
Island: <DashboardSummary /> (React) con onClick handlers
  ↓
Envía al navegador como HTML + JS mínimo
```

**Beneficio:** Primera carga ~200ms. Caché en Vercel Edge.

### Página dinámica (Plan específico)

```
Astro page: /profesor/planes/[id].astro
  ↓
SSR: Fetch plan de Supabase
  ↓
Render HTML
  ↓
Island: <PlanForm /> (React) → editar ejercicios
  ↓
Cambios → Astro Action → DB → Revalidate
```

**Beneficio:** Datos frescos, sin SPA overhead.

### Patrón de Astro Slots para Islands
Para potenciar la carga rápida y reducir el bundle de JavaScript, al utilizar componentes interactivos (React Islands), emplearemos un **patrón de slots de Astro** siempre que sea posible. Esto implica pasar los bloques de contenido estático desde el servidor como *children* al componente de UI interactivo, limitando el código de React puramente al state management y a los event listeners.

---

## 📡 Astro Actions (Server Functions)

Reemplazan API routes. Tipo-safe.

### Ejemplo: Crear Plan

```typescript
// src/actions/profesor.ts

import { defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { supabase } from '@/lib/supabase';

export const createPlan = defineAction({
  accept: 'json',
  input: z.object({
    nombre: z.string().min(3),
    duracion_semanas: z.number().min(1).max(52),
    ejercicios: z.array(z.object({
      nombre: z.string(),
      series_reps: z.string(),
    })),
  }),
  handler: async (input, context) => {
    const user = context.locals.user; // Auth middleware
    
    if (!user) throw new Error('Not authenticated');

    // Insert plan
    const { data: plan, error } = await supabase
      .from('planes')
      .insert({
        profesor_id: user.id,
        nombre: input.nombre,
        duracion_semanas: input.duracion_semanas,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert ejercicios
    const ejercicios = input.ejercicios.map((e, idx) => ({
      plan_id: plan.id,
      nombre: e.nombre,
      series_reps: e.series_reps,
      orden: idx,
    }));

    const { error: ejercError } = await supabase
      .from('ejercicios')
      .insert(ejercicios);

    if (ejercError) throw ejercError;

    return { plan_id: plan.id, status: 'created' };
  },
});
```

**Uso en componente:**

```tsx
import { actions } from 'astro:actions';

export function PlanForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await actions.profesor.createPlan({
      nombre: 'Mi plan',
      duracion_semanas: 4,
      ejercicios: [...],
    });
    console.log(result);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🔌 Extensibilidad Futura

### 1. Reportes (PDF/Imagen)

```typescript
// Generar imagen de progreso (Satori)
const image = await satori(
  <ProgressCard alumno={data} />,
  { width: 1200, height: 600 }
);
// Devuelve PNG para compartir Instagram
```

### 2. Multi-gimnasio (SaaS)

```sql
-- Agregar tabla GIMNASIO
ALTER TABLE profesores ADD COLUMN gimnasio_id UUID;

-- RLS actualizado
CREATE POLICY "profesor_same_gym" ON planes
  FOR SELECT USING (
    profesor_id IN (
      SELECT id FROM profesores 
      WHERE gimnasio_id = (
        SELECT gimnasio_id FROM profesores 
        WHERE id = auth.uid()
      )
    )
  );
```

### 3. Webhooks (Notificaciones)

```typescript
// Supabase function
on('sesions.completada') → 
  → Enviar email profesor
  → Notif push (futuro)
  → Actualizar stats en tiempo real
```

### 4. Integración con WhatsApp

```typescript
// Reemplazar email magic link con WhatsApp
const { data } = await supabase.auth.signInWithOtp({
  phone: profesor.whatsapp,
  channel: 'whatsapp',
});
```

---

## 📋 Checklist de Implementación

- [ ] **DB Schema**: Crear tablas + RLS policies
- [ ] **Auth Setup**: Magic links en Supabase
- [ ] **Astro Scaffold**: Directorios + config
- [ ] **shadcn/ui**: Instalar componentes base (Button, Input, Table, Dialog, Form)
- [ ] **Páginas core**: dashboard, crear plan, mi-plan
- [ ] **Astro Actions**: createPlan, inviteAlumno, completarSesion
- [ ] **Validación**: Zod schemas para inputs
- [ ] **Estilos**: Tailwind config + brand colors
- [ ] **Auth Middleware**: Proteger rutas /profesor, /alumno
- [ ] **Testing**: Unit + E2E (Playwright)
- [ ] **Deploy**: Vercel + Supabase production
- [ ] **Documentación**: API docs + UX flow diagrams
- [ ] **Monitoreo**: Error tracking (Sentry) + analytics (Vercel)

---

## 🔗 Referencias

- [Astro Documentation](https://docs.astro.build)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [Astro Actions](https://docs.astro.build/en/guides/actions/)

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0  
**Owner:** NODO Studio | MiGym