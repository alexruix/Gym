# 🏆 Mejores Prácticas y Estándares de Desarrollo - MiGym

**Fuente única de verdad (SSOT) para código, componentes, datos y decisiones técnicas en MiGym.**

Objetivo: Escalabilidad, legibilidad, testabilidad, y coherencia en un proyecto SaaS para gimnasios.

---

## 1. Diseño Atómico Estricto (Atomic Design)

Toda la UI sigue Atomic Design para maximizar reutilización y testabilidad aislada.

### Jerarquía en `src/components/`

```
src/components/
├── ui/                          # Shadcn/ui base (sin lógica negocio)
│   ├── button.tsx              # shadcn/ui import
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── table.tsx
│   └── ...
│
├── atoms/                       # Elementos mínimos, indivisibles (MiGym-specific)
│   ├── StatusBadge.tsx          # "Activo", "Pausado", "Vencido"
│   ├── RoleIcon.tsx             # Icono profesor/alumno
│   ├── PaymentStatus.tsx        # ✅ Pagado / ⚠️ Por vencer / ❌ Vencido
│   ├── SessionCounter.tsx       # "5/8 sesiones"
│   ├── ProgressBar.tsx          # Barra de progreso
│   └── EmptyState.tsx           # Estado vacío (sin planes, alumnos, etc)
│
├── molecules/                   # Átomos + UI agrupados (sin lógica pesada)
│   ├── SearchInput.tsx          # Input + Ícono búsqueda
│   ├── UserAvatar.tsx           # Avatar + Nombre
│   ├── PaginationControls.tsx   # Botones prev/next + info
│   ├── FilterChips.tsx          # Chips de filtros (Estado, Plan, etc)
│   ├── ExerciseCard.tsx         # Ejercicio resumido (nombre, series, reps)
│   ├── StudentRow.tsx           # Una fila de tabla de alumno
│   └── NotificationBell.tsx     # Campana + badge count
│
├── organisms/                   # Secciones complejas con lógica/estado
│   ├── profesor/
│   │   ├── PlanForm.tsx         # Form crear plan (4 pasos multi-state)
│   │   ├── ExerciseLibrary.tsx  # Búsqueda + lista ejercicios
│   │   ├── StudentImporter.tsx  # Upload Excel + preview + confirm
│   │   ├── PaymentDashboard.tsx # Tablero pagos completo
│   │   ├── DashboardMetrics.tsx # Tarjetas resumen
│   │   ├── AlertsPanel.tsx      # Acordeón alertas
│   │   └── PlanEditor.tsx       # Editar plan (drag-drop ejercicios)
│   │
│   └── alumno/
│       ├── SessionTracker.tsx   # Tracker sesión (ejercicio por ejercicio)
│       ├── PlanTimeline.tsx     # Acordeón semanas/sesiones
│       ├── ProgressCharts.tsx   # Gráficos + stats
│       └── ProfileForm.tsx      # Editar perfil
│
└── layouts/                     # (en Astro)
    ├── ProfesorLayout.astro    # Sidebar + contenido
    └── AlumnoLayout.astro      # Bottom nav + contenido
```

### Reglas por Nivel

| Nivel | Responsabilidad | Ejemplo |
|-------|-----------------|---------|
| **UI** | Ninguna lógica. Solo estilo. | `<Button>` de shadcn |
| **Atoms** | Presentación pura + styles. No state. | `<StatusBadge status="activo" />` |
| **Molecules** | Composición de átomos. Mínimo estado (ej: input value). | `<SearchInput onSearch={() => {}} />` |
| **Organisms** | Lógica compleja, estado, efectos. Integración de datos. | `<PlanForm onSubmit={} />` |
| **Pages (Astro)** | Orquestación. Fetch datos. Pass a organisms. | `dashboard.astro` + Islands |

---

## 2. SSOT: Single Source of Truth

### 2.1 Textos & Copy (UI)

**Nunca hardcodear textos.** Todos viven en `src/data/` centralizado.

```
src/data/
├── es/
│   ├── auth.ts              # Magic link, login, onboarding
│   ├── profesor/
│   │   ├── dashboard.ts     # Tarjetas, alertas, acciones
│   │   ├── planes.ts        # Crear, editar, listar planes
│   │   ├── alumnos.ts       # Invitar, importar, fichas
│   │   ├── ejercicios.ts    # CRUD ejercicios
│   │   └── pagos.ts         # Tablero, historial
│   │
│   └── alumno/
│       ├── dashboard.ts     # Home, racha, próximas sesiones
│       ├── plan.ts          # Mi plan, sesiones
│       ├── sesion.ts        # Tracker, ejercicios
│       ├── progreso.ts      # Gráficos, stats
│       └── perfil.ts        # Perfil, ajustes
│
└── notifications.ts         # Emails, push (plantillas)
```

**Ejemplo: `src/data/es/profesor/dashboard.ts`**

```typescript
export const dashboardCopy = {
  title: "Dashboard",
  cards: {
    activeStudents: {
      label: "Alumnos Activos",
      tooltip: "Alumnos siguiendo un plan activamente",
    },
    plans: {
      label: "Planes",
      tooltip: "Planes de entrenamiento creados",
    },
    expiringToday: {
      label: "Vencen Hoy",
      tooltip: "Cuotas que vencen en las próximas 24 horas",
    },
    late: {
      label: "Morosos",
      tooltip: "Cuotas vencidas sin pagar",
    },
  },
  alerts: {
    title: "Alertas Rápidas",
    expiring: "cuota(s) vencen en los próximos 7 días",
    expired: "cuota(s) vencida(s)",
  },
  actions: {
    newStudent: "Nuevo alumno",
    createPlan: "Crear plan",
    seePays: "Ver pagos",
    seeProgress: "Ver progreso",
  },
};
```

**Uso en componente:**

```tsx
import { dashboardCopy } from "@/data/es/profesor/dashboard";

export function DashboardMetrics() {
  return (
    <Card>
      <h2>{dashboardCopy.title}</h2>
      <div className="grid gap-4">
        <MetricCard
          label={dashboardCopy.cards.activeStudents.label}
          value={45}
        />
        {/* ... */}
      </div>
    </Card>
  );
}
```

### 2.2 Tipos & Interfaces

Todos los tipos viven en archivos `.types.ts` **junto a sus módulos**.

```
src/lib/
├── validators.ts        # Zod schemas (SSOT para validación)
├── types.ts            # Tipos globales (Auth, User, etc)

src/components/
├── organisms/profesor/
│   ├── PlanForm.tsx
│   └── plan.types.ts    # Tipos específicos PlanForm
```

**Ejemplo: `src/lib/validators.ts`**

```typescript
import { z } from "zod";

// Plan validation
export const planSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres").max(100),
  duracion_semanas: z.number().min(1).max(52),
  ejercicios: z.array(
    z.object({
      nombre: z.string().min(1),
      series: z.number().min(1),
      reps: z.number().min(1),
      descanso_seg: z.number().min(0),
    })
  ),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Alumno validation
export const studentSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  plan_id: z.string().uuid("Plan inválido").optional(),
  fecha_inicio: z.coerce.date(),
  dia_pago: z.number().min(1).max(31),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Pago validation
export const paymentSchema = z.object({
  monto: z.number().min(0),
  dia_pago: z.number().min(1).max(31),
  estado: z.enum(["pagado", "por_vencer", "vencido"]),
});
```

### 2.3 Constantes & Enums

```typescript
// src/lib/constants.ts

export const PLAN_DAYS = [2, 3, 4] as const;
export const SESSION_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export const PAYMENT_STATUS = {
  PAID: "pagado",
  EXPIRING: "por_vencer",    // < 7 días
  EXPIRED: "vencido",        // > 0 días vencido
} as const;

export const USER_ROLES = {
  PROFESSOR: "profesor",
  STUDENT: "alumno",
} as const;
```

---

## 3. Convenciones de Nomenclatura (Naming Conventions)

### Archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| **Componentes React** | PascalCase | `PlanForm.tsx`, `StatusBadge.tsx` |
| **Shadcn/ui** | kebab-case | `button.tsx`, `dialog.tsx` |
| **Páginas Astro** | kebab-case | `mi-plan.astro`, `dashboard.astro` |
| **Hooks** | camelCase, prefix `use` | `useStudentData.ts`, `usePlanForm.ts` |
| **Utilidades** | camelCase | `formatCurrency.ts`, `calculateAge.ts` |
| **Datos/Copy** | camelCase, suffix `Copy` | `dashboardCopy.ts`, `authCopy.ts` |
| **Tipos** | Suffix `.types.ts` | `plan.types.ts`, `student.types.ts` |
| **Validadores** | `validators.ts` | Centralizado: `src/lib/validators.ts` |

### Variables & Funciones

| Contexto | Idioma | Ejemplo |
|----------|--------|---------|
| **Código (variables, funciones)** | 🇬🇧 Inglés | `const students = []`, `function getPlanById()` |
| **Comentarios (lógica)** | 🇪🇸 Español | `// Validar que la cuota no haya vencido hace más de 30 días` |
| **UI / Copy** | 🇪🇸 Español | `"Crear plan"`, `"Alumno pagado"` |
| **Git commits** | 🇪🇸 Español | `feat: agregar tracker de sesión`, `fix: validar email duplicado` |

### Variables Booleanas

Prefijo `is`, `has`, `should`:

```typescript
const isActive = student.status === "active";
const hasExpired = payment.expires_at < today;
const shouldNotify = daysUntilExpire < 7;
```

---

## 4. Astro Actions y Server Functions

**Astro Actions** reemplazan API routes tradicionales. Son type-safe y reutilizables.

### Estructura

```
src/actions/
├── profesor.ts          # createPlan, updatePlan, inviteStudent, etc
├── alumno.ts           # completeSesion, getProgress, etc
└── pagos.ts            # updatePayment, markAsPaid, etc
```

### Ejemplo: `src/actions/profesor.ts`

```typescript
import { defineAction } from "astro:actions";
import { z } from "astro:content";
import { supabase } from "@/lib/supabase";
import { planSchema } from "@/lib/validators";

export const createPlan = defineAction({
  accept: "json",
  input: planSchema,
  handler: async (input, context) => {
    // 1. Auth check (viene del middleware)
    const user = context.locals.user;
    if (!user) throw new Error("Unauthenticated");

    // 2. Create plan en DB
    const { data: plan, error } = await supabase
      .from("planes")
      .insert({
        profesor_id: user.id,
        nombre: input.nombre,
        duracion_semanas: input.duracion_semanas,
      })
      .select()
      .single();

    if (error) throw new Error(`DB error: ${error.message}`);

    // 3. Insert ejercicios
    const ejercicios = input.ejercicios.map((e, idx) => ({
      plan_id: plan.id,
      nombre: e.nombre,
      series: e.series,
      reps: e.reps,
      descanso_seg: e.descanso_seg,
      orden: idx,
    }));

    const { error: ejercError } = await supabase
      .from("ejercicios")
      .insert(ejercicios);

    if (ejercError) throw new Error(`Ejercicio error: ${ejercError.message}`);

    // 4. Return success
    return {
      success: true,
      plan_id: plan.id,
      mensaje: `✅ Plan "${plan.nombre}" creado`,
    };
  },
});

export const inviteStudent = defineAction({
  accept: "json",
  input: z.object({
    email: z.string().email(),
    nombre: z.string(),
    plan_id: z.string().uuid(),
    fecha_inicio: z.coerce.date(),
    dia_pago: z.number().min(1).max(31),
  }),
  handler: async (input, context) => {
    const user = context.locals.user;
    if (!user) throw new Error("Unauthenticated");

    // 1. Create student in DB
    const { data: student, error } = await supabase
      .from("alumnos")
      .insert({
        profesor_id: user.id,
        email: input.email,
        nombre: input.nombre,
        plan_id: input.plan_id,
        fecha_inicio: input.fecha_inicio,
        dia_pago: input.dia_pago,
      })
      .select()
      .single();

    if (error) throw new Error(`Student creation failed: ${error.message}`);

    // 2. Send magic link email
    const { error: signError } = await supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        emailRedirectTo: `${context.url.origin}/alumno`,
        data: {
          student_id: student.id,
          plan_id: input.plan_id,
        },
      },
    });

    if (signError) throw new Error(`Email send failed: ${signError.message}`);

    return {
      success: true,
      student_id: student.id,
      mensaje: `✅ Magic link enviado a ${input.email}`,
    };
  },
});
```

### Uso en Componentes React (Island)

```tsx
import { actions } from "astro:actions";

export function PlanForm() {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: PlanFormData) => {
    setIsPending(true);
    try {
      const result = await actions.profesor.createPlan(formData);
      if (result.success) {
        toast.success(result.mensaje);
        navigate(`/profesor/planes/${result.plan_id}`);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 5. Seguridad: Row-Level Security (RLS) & Data Access

**Crítico:** MiGym maneja datos sensibles (alumnos, pagos, planes). RLS es mandatorio.

### 5.1 RLS Policies (Supabase)

```sql
-- 1. Profesor solo ve sus planes
CREATE POLICY "profesor_own_plans" ON planes
  FOR SELECT USING (profesor_id = auth.uid());

CREATE POLICY "profesor_update_plans" ON planes
  FOR UPDATE USING (profesor_id = auth.uid());

-- 2. Profesor solo ve sus alumnos
CREATE POLICY "profesor_own_students" ON alumnos
  FOR SELECT USING (profesor_id = auth.uid());

-- 3. Alumno solo ve su plan asignado
CREATE POLICY "student_own_sessions" ON sesiones
  FOR SELECT USING (
    alumno_id IN (
      SELECT id FROM alumnos WHERE id = auth.uid()
    )
  );

-- 4. Alumno no puede editar su plan (solo profesor)
CREATE POLICY "student_cannot_edit_plans" ON planes
  FOR UPDATE USING (false);
```

### 5.2 Validación en Actions

```typescript
// ❌ MAL: Sin validar pertenencia
export const updatePlan = defineAction({
  accept: "json",
  input: z.object({ plan_id: z.string(), nombre: z.string() }),
  handler: async (input) => {
    // Directamente actualiza sin verificar que sea del profesor
    await supabase.from("planes").update(...);
  },
});

// ✅ BIEN: Validar que plan pertenece al profesor
export const updatePlan = defineAction({
  accept: "json",
  input: z.object({ plan_id: z.string(), nombre: z.string() }),
  handler: async (input, context) => {
    const user = context.locals.user;

    // 1. Verificar que plan pertenece al profesor
    const { data: plan, error } = await supabase
      .from("planes")
      .select("id")
      .eq("id", input.plan_id)
      .eq("profesor_id", user.id)
      .single();

    if (!plan) throw new Error("Plan no encontrado o no es tuyo");

    // 2. Actualizar
    const { error: updateError } = await supabase
      .from("planes")
      .update({ nombre: input.nombre })
      .eq("id", input.plan_id);

    if (updateError) throw new Error(updateError.message);

    return { success: true };
  },
});
```

---

## 6. Testing

### 6.1 Tipos de Tests

| Tipo | Herramienta | Cobertura | Ejemplo |
|------|-----------|-----------|---------|
| **Unit** | Vitest | Funciones puras | `formatCurrency()`, `calculateProgress()` |
| **Component** | Vitest + @testing-library | Atoms, Molecules | `<StatusBadge />`, `<SearchInput />` |
| **Integration** | Vitest + @testing-library | Organisms + Data | `<PlanForm />` con Astro Actions mock |
| **E2E** | Playwright | Happy paths completos | Profesor crea plan → invita alumno → alumno entrena |

### 6.2 Estructura

```
src/
├── __tests__/
│   ├── unit/
│   │   └── formatCurrency.test.ts
│   ├── components/
│   │   ├── atoms/
│   │   │   └── StatusBadge.test.tsx
│   │   └── organisms/
│   │       └── PlanForm.test.tsx
│   └── e2e/
│       └── profesor-create-plan.spec.ts
```

### 6.3 Ejemplo: Test de Componente

```typescript
import { render, screen, userEvent } from "@testing-library/react";
import { StatusBadge } from "@/components/atoms/StatusBadge";

describe("StatusBadge", () => {
  it("muestra status 'Activo' correctamente", () => {
    render(<StatusBadge status="activo" />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("aplica clase correcta para status vencido", () => {
    render(<StatusBadge status="vencido" />);
    expect(screen.getByText("Vencido")).toHaveClass("bg-red-100");
  });
});
```

### 6.4 Ejemplo: Test E2E (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("Profesor crea plan y alumno lo ve", async ({ page }) => {
  // 1. Login profesor
  await page.goto("/login");
  await page.fill('input[name="email"]', "profesor@test.com");
  await page.click("button[type=submit]");
  // Magic link automation...

  // 2. Crear plan
  await page.goto("/profesor/planes/new");
  await page.fill('input[name="nombre"]', "Plan Test");
  await page.selectOption('select[name="dias"]', "2");
  await page.click("button:has-text('Crear plan')");

  // 3. Verificar plan creado
  await expect(page).toHaveURL(/\/profesor\/planes\/\d+/);
  await expect(screen.getByText("Plan Test")).toBeVisible();

  // 4. Invitar alumno
  await page.click("button:has-text('Invitar alumno')");
  await page.fill('input[name="email"]', "alumno@test.com");
  await page.click("button:has-text('Enviar')");

  // 5. Login como alumno (simular magic link)
  await page.goto("/alumno");
  await expect(screen.getByText("Mi Plan: Plan Test")).toBeVisible();
});
```

---

## 7. Rendimiento & Astro Islands

### 7.1 Hidratación Selectiva

```astro
---
// src/pages/profesor/dashboard.astro

import DashboardMetrics from "@/components/organisms/profesor/DashboardMetrics.astro";
import AlertsPanel from "@/components/organisms/profesor/AlertsPanel";
import ActionsButtons from "@/components/organisms/profesor/ActionsButtons";

const metrics = await db.getMetrics(profesorId);
---

<ProfesorLayout>
  <!-- Estático: no necesita JS -->
  <DashboardMetrics {...metrics} />

  <!-- Island: necesita interactividad -->
  <AlertsPanel client:load data={metrics.alerts} />

  <!-- Island: larga carga, puede esperar -->
  <ActionsButtons client:idle />
</ProfesorLayout>
```

### 7.2 Directivas de Astro

| Directiva | Cuándo | Caso de uso |
|-----------|--------|-----------|
| `client:load` | Inmediato | Botones CTA, forms críticos |
| `client:idle` | Post-navegación | Modales, componentes pesados |
| `client:visible` | Visible en viewport | Gráficos, componentes abajo |
| `client:only` | Solo cliente | Componentes sin contenido estático |

**Regla de Oro:** Si no necesita interactividad, NO lo hidratas.

---

## 8. Gestión de Estado

### 8.1 Server State (Supabase)

- ✅ Usar `useEffect` + `supabase.from().select()` para fetch
- ✅ Usar SWR o React Query para cachéo automático
- ✅ Manejar loading, error, data en componentes

```typescript
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

export function StudentList() {
  const { data: students, isLoading, error } = useSWR(
    "/api/students",
    fetcher
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;

  return <StudentTable students={students} />;
}
```

### 8.2 Client State (React)

- ✅ UseState para formularios, toggle, tabs
- ✅ useReducer para lógica compleja (ej: PlanForm multi-step)
- ❌ NO Redux/Context a menos que sea necesario (MiGym es simple)

```typescript
export function PlanForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>({});

  const handleNext = () => {
    if (validateStep(step, formData)) {
      setStep(step + 1);
    }
  };

  return (
    <>
      {step === 1 && <StepDays onChange={setFormData} />}
      {step === 2 && <StepName onChange={setFormData} />}
      {step === 3 && <StepExercises onChange={setFormData} />}
      {step === 4 && <StepReview data={formData} />}
    </>
  );
}
```

---

## 9. Error Handling & Logging

### 9.1 En Astro Actions

```typescript
export const createPlan = defineAction({
  accept: "json",
  input: planSchema,
  handler: async (input, context) => {
    try {
      // ... lógica
    } catch (error) {
      // Log para debugging
      console.error("[createPlan] Error:", {
        profesor_id: context.locals.user?.id,
        input,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      // Retornar error user-friendly
      return {
        success: false,
        error: "No se pudo crear el plan. Intenta de nuevo o contacta soporte.",
      };
    }
  },
});
```

### 9.2 En Componentes React

```typescript
export function PlanForm() {
  const handleSubmit = async (formData) => {
    try {
      const result = await actions.profesor.createPlan(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("✅ Plan creado");
    } catch (error) {
      // Error inesperado (network, etc)
      console.error("Unexpected error:", error);
      toast.error("Error inesperado. Recargá la página.");
    }
  };
}
```

---

## 10. Performance Checklist

### 10.1 Bundle & Assets

- [ ] No importar librerías completas si solo necesitas una función
- [ ] Lazy load componentes pesados (gráficos, canvas)
- [ ] Comprimir imágenes (WebP, AVIF)
- [ ] Usar `next/image` equivalent en Astro

### 10.2 Database Queries

- [ ] Seleccionar solo columnas necesarias (no `SELECT *`)
- [ ] Usar índices en columnas de filtro (profesor_id, alumno_id)
- [ ] N+1 queries: usar `JOIN` en lugar de loops

**❌ Mal:**

```typescript
const planes = await supabase.from("planes").select("*");
for (const plan of planes) {
  const students = await supabase
    .from("alumnos")
    .select("*")
    .eq("plan_id", plan.id); // N queries!
}
```

**✅ Bien:**

```typescript
const planes = await supabase
  .from("planes")
  .select(
    `
    id, nombre, duracion_semanas,
    alumnos:alumnos(id, nombre, email)
  `
  )
  .eq("profesor_id", user.id);
```

### 10.3 UI Rendering

- [ ] Memoizar componentes que reciben props complejas
- [ ] Evitar re-renders innecesarios (useCallback, useMemo)
- [ ] Lazy load listas largas (virtualization)

---

## 11. Git & Versionado

### 11.1 Commits

```
feat: agregar tracker de sesión alumno
fix: validar email duplicado en import
refactor: simplificar lógica de pago
docs: actualizar bestpractices.md
test: agregar tests para PlanForm
```

### 11.2 Branches

- `main`: Producción. Solo PRs mergeadas.
- `develop`: Rama de integración. Todos los features aquí.
- `feature/nombre`: Rama por feature.
- `bugfix/nombre`: Rama por bug.

---

## 12. Checklist de Código Limpio (Code Review)

Antes de hacer commit, verifica:

- [ ] **Nombres claros**: Variables, funciones, componentes con nombres descriptivos
- [ ] **Sin hardcoding**: Todos los textos en `src/data/`
- [ ] **Tipado**: Sin `any`. Interfaces/types explícitas
- [ ] **DRY**: ¿Hay código duplicado? Extraer a función/componente
- [ ] **SOLID**: Single Responsibility. ¿El componente hace 1 cosa?
- [ ] **Logging**: Errors loguados. No `console.log` en prod
- [ ] **Tests**: Unit tests para funciones. Component tests para UI
- [ ] **Performance**: ¿Hay queries N+1? ¿Se hidratan Islands innecesarias?
- [ ] **Seguridad**: ¿Se valida input? ¿RLS en DB? ¿Se sanitiza user data?
- [ ] **Accesibilidad**: ¿aria-labels? ¿Keyboard navigation?
- [ ] **Responsive**: ¿Se ve bien en mobile y desktop?

---

## 13. Stack Específico de MiGym

### 13.1 Astro

- **Version:** 5.x
- **Rendering:** SSR + Islands
- **Actions:** Para server functions type-safe
- **Slots:** Pasar contenido estático a Islands

### 13.2 React (Islands)

- **Version:** 18.x
- **Hooks:** useState, useEffect, useReducer
- **Form:** react-hook-form + Zod
- **Data Fetching:** SWR o React Query
- **UI:** shadcn/ui + Tailwind

### 13.3 Supabase

- **Auth:** Magic links (Passwordless)
- **DB:** PostgreSQL
- **RLS:** Policies en tablas sensibles
- **Realtime:** Para notificaciones (futuro)
- **Storage:** Para imágenes/videos ejercicios

### 13.4 Styling

- **Framework:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Variables CSS:** Tokens de MiGym (no arbitrarias)

---

## 14. Decisiones Arquitectónicas (ADRs)

Cuando tomes decisiones importantes, documéntalo en `docs/adr/`:

```
docs/adr/001-use-astro-islands.md
docs/adr/002-magic-links-passwordless.md
docs/adr/003-shadcn-ui-over-custom.md
```

**Formato:**

```markdown
# ADR-001: Usar Astro Islands para interactividad

## Contexto
MiGym necesita balance entre performance (HTML estático) e interactividad (React).

## Decisión
Usar Astro 5 con Islands Architecture. Componentes estáticos en Astro, interactivos en React.

## Alternativas consideradas
1. SPA (Next.js) - Demasiado JS en cliente
2. Astro puro - No suficiente para formularios complejos

## Consecuencias
✅ Rápido (HTML estático)
✅ Flexible (React para lógica)
❌ Más complejidad (dos runtimes)
```

---

## 15. Recursos & Referencias

- [Atomic Design en React](https://bradfrost.com/blog/post/atomic-web-design/)
- [Astro Islands](https://docs.astro.build/en/concepts/islands/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Playwright Testing](https://playwright.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última actualización:** Marzo 2026  
**Versión:** 2.0  
**Owner:** NODO Studio | MiGym  
**Próxima revisión:** Junio 2026