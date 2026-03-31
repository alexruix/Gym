# 🔄 Rutinas Variables Semanales - Análisis de Impacto

**Requisito Real del Usuario:** Profesor arma planes que cambian semanalmente (rotación de accesorios) y se adaptan dinámicamente (ausencias, feriados, grupos musculares redistribuidos en menos días).

---

## 1. Entendimiento del Caso de Uso

### 1.1 Escenarios Reales

#### **Escenario A: Rotación de Accesorios Semanal**

```
SEMANA 1:
Lunes: Pecho + Tríceps
  - Bench press 4x8
  - Incline dumbbell 3x10
  - Tricep dips 3x8 ← ACCESORIO 1

Miércoles: Espalda + Bíceps
  - Deadlift 4x6
  - Barbell rows 4x8
  - Barbell curls 3x8 ← ACCESORIO 1

─────────────────────────

SEMANA 2: (Mismo split, DIFERENTE accesorio)
Lunes: Pecho + Tríceps
  - Bench press 4x8    (igual)
  - Incline dumbbell 3x10 (igual)
  - Rope pushdown 3x12 ← ACCESORIO 2 (cambió)

Miércoles: Espalda + Bíceps
  - Deadlift 4x6    (igual)
  - Barbell rows 4x8 (igual)
  - Machine curls 3x10 ← ACCESORIO 2 (cambió)
```

**Patrón:** Accesorios rotan en ciclos de 3-4 semanas. Movimientos principales (Bench, Deadlift) fijos.

---

#### **Escenario B: Redistribución por Ausencias**

```
PLAN ORIGINAL:
Lunes: Pecho
Martes: OFF
Miércoles: Espalda
Jueves: OFF
Viernes: Piernas

─────────────────────────

PROFESOR DICE: "Este mes el gimnasio cierra los viernes (feriados)"
Y: "Muchos alumnos faltan los miércoles"

PLAN ADAPTADO:
Lunes: Pecho
Martes: Piernas (movido de viernes)
Miércoles: OFF (conocer ausencias)
Jueves: Espalda (movido de miércoles)
Viernes: OFF
```

---

#### **Escenario C: Compresión de Grupo Muscular**

```
PLAN ORIGINAL (5 días disponibles):
L: Pecho + Tríceps
M: Espalda + Bíceps
M: Hombro
J: Piernas
V: OFF

─────────────────────────

ALUMNO SOLO PUEDE 3 DÍAS:
L: Pecho + Tríceps + Hombro (mucho)
M: OFF
M: Espalda + Bíceps
J: Piernas
V: OFF

O MEJOR:

L: Pecho + Tríceps
M: Espalda + Bíceps + Hombro
M: OFF
J: Piernas
V: OFF
```

---

### 1.2 Implicaciones Técnicas

| Aspecto                    | Antes                       | Ahora                                        | Impacto  |
| -------------------------- | --------------------------- | -------------------------------------------- | -------- |
| **Estructura del plan**    | 1 rutina fija para todos    | Múltiples variaciones + reglas               | 🔴 Alto  |
| **Generación de sesiones** | Linear: semana 1 = semana 4 | Dinámico: reglas + lógica                    | 🔴 Alto  |
| **Asignación a alumnos**   | Mismo plan = misma rutina   | Mismo plan + variaciones personalizadas      | 🟡 Medio |
| **Tracking**               | Sesión = un ejecución       | Sesión + variación (tracking)                | 🔴 Alto  |
| **Modificaciones en vivo** | Profesor edita plan base    | Profesor edita reglas + instancia específica | 🔴 Alto  |

---

## 2. Cambios en Modelo de Datos (ERD)

### 2.1 Antes (Actual)

```
PLANES
├─ id
├─ profesor_id
├─ nombre
├─ duracion_semanas
└─ created_at

SESIONES
├─ numero_sesion (1, 2, 3...)
├─ plan_id
├─ fecha
└─ completada

EJERCICIOS (en sesión)
├─ nombre
├─ series x reps
└─ orden
```

### 2.2 Después (Con Variaciones)

```
PLANES
├─ id
├─ profesor_id
├─ nombre
├─ duracion_semanas
├─ estructura (JSON: {lunes, martes, ...})
├─ reglas_rotacion (JSON)
├─ grupos_musculares (JSON)
└─ created_at

PLAN_EJERCICIOS (relación)
├─ id
├─ plan_id
├─ ejercicio_id
├─ categoria (primary, secondary, accesorio)
├─ grupo_muscular (pecho, espalda, piernas...)
├─ semana_inicio (en qué semana aparece)
└─ rotacion_id (para tracking de cambios)

PLAN_ROTACIONES (define ciclos)
├─ id
├─ plan_id
├─ tipo (accesorio_3semanas, accesorio_4semanas)
├─ ejercicios (array de arrays: [[ejer_1, ejer_2], [ejer_3, ejer_4], ...])
└─ duracion (3, 4 semanas)

PLAN_VARIACIONES (instancia de una semana)
├─ id
├─ plan_id
├─ numero_semana
├─ fecha_inicio
├─ ajustes (JSON: {"lunes": {...cambios}, "miercoles": {...}})
├─ razon (feriado, ausencia, redistribución)
└─ profesor_nota

SESIONES (actualizado)
├─ id
├─ alumno_id
├─ plan_id
├─ numero_sesion
├─ fecha
├─ variacion_id (FK a PLAN_VARIACIONES)
├─ dia_semana (para tracking)
├─ completada
└─ series_log (JSON con reps reales)

SESION_EJERCICIOS (nuevo)
├─ id
├─ sesion_id
├─ ejercicio_id
├─ serie
├─ reps_plan
├─ reps_real
├─ peso_plan
├─ peso_real
├─ completado
```

### 2.3 Visualización ERD Simplificada

```
PLANES
   ↓ 1:N
   ├─→ PLAN_EJERCICIOS (define qué ejercicios)
   ├─→ PLAN_ROTACIONES (define ciclos de cambio)
   │    ↓ 1:N
   │    └─→ SESIONES (instance de una sesión)
   │         ↓ 1:N
   │         └─→ SESION_EJERCICIOS (reps reales)
   │
   └─→ PLAN_VARIACIONES (ajustes por semana)
        ↓ 1:N
        └─→ SESIONES (apunta a variación si aplica)
```

---

## 3. Flujo de Creación de Plan (Nuevo)

### 3.1 Paso 1: Estructura Base

```
ANTES:
┌──────────────────┐
│ Nombre: "Plan A" │
│ Duración: 4 sem  │
│ Días: L, M, M, J │
└──────────────────┘

AHORA:
┌──────────────────────────────────────┐
│ Nombre: "Plan A"                     │
│ Duración: 4 semanas                  │
│                                      │
│ ESTRUCTURA SEMANAL:                  │
│ Lunes: [Pecho] (permite cambios)     │
│ Martes: [Espalda]                    │
│ Miércoles: OFF                       │
│ Jueves: [Piernas]                    │
│ Viernes: OFF                         │
│                                      │
│ ☑ Permitir rotación de accesorios    │
│ ☑ Permitir ajustes por ausencias     │
└──────────────────────────────────────┘
```

---

### 3.2 Paso 2: Ejercicios + Categoría

```
ANTES:
┌─────────────────┐
│ Agregar:        │
│ • Bench press   │
│ • Incline DB    │
│ • Tricep dips   │
└─────────────────┘

AHORA:
┌──────────────────────────────────────┐
│ Agregar a LUNES (Pecho):             │
│                                      │
│ PRIMARY (lo toca 2x/mes):            │
│ ☑ Bench press 4x8                    │
│                                      │
│ SECONDARY (complementario):          │
│ ☑ Incline DB 3x10                    │
│                                      │
│ ACCESORIO (rota cada 2-3 sem):       │
│ ☑ Tricep dips 3x8                    │
│   [Usar rotación de accesorios] ✓    │
│                                      │
│ NOTA: "Tricep dips alterna con      │
│        rope pushdown y cable press"  │
│                                      │
│ [Siguiente]                          │
└──────────────────────────────────────┘
```

---

### 3.3 Paso 3: Definir Rotaciones

```
┌──────────────────────────────────────┐
│ CONFIGURAR ROTACIONES                │
│                                      │
│ Accesorio LUNES (Pecho/Tríceps):    │
│ Semanas 1-2: Tricep dips            │
│ Semanas 3-4: Rope pushdown           │
│                                      │
│ [+ Agregar más variación] ✓          │
│                                      │
│ Accesorio MARTES (Espalda/Bíceps):  │
│ Semanas 1-2: Barbell curls           │
│ Semanas 3-4: Machine curls           │
│                                      │
│ [Siguiente]                          │
└──────────────────────────────────────┘
```

### 3.4 Paso 4: Revisión + Crear

```
┌──────────────────────────────────────┐
│ REVISIÓN                             │
│                                      │
│ Plan: "Plan A (4 semanas)"           │
│                                      │
│ Lunes: Pecho                         │
│  - Bench press 4x8 (fixed)           │
│  - Incline DB 3x10 (fixed)           │
│  - [Accesorio rota cada 2 sem] ✓     │
│                                      │
│ Martes: Espalda                      │
│  - Deadlift 4x6 (fixed)              │
│  - Rows 4x8 (fixed)                  │
│  - [Accesorio rota cada 2 sem] ✓     │
│                                      │
│ Jueves: Piernas                      │
│  - Squat 4x6 (fixed)                 │
│  - Leg press 3x8 (fixed)             │
│                                      │
│ ✓ 4 rotaciones de accesorios         │
│ ✓ Permite 0 ajustes manuales         │
│                                      │
│ [Crear plan]                         │
└──────────────────────────────────────┘
```

---

## 4. Generación Dinámicas de Sesiones

### 4.1 Estrategia de Generación "Lazy" (Sugerencia)

En lugar de pre-generar todas las sesiones al inicio del plan, utilizaremos un enfoque **"Just-in-Time"**:

- **Cuándo**: La sesión/semana se genera cuando el alumno abre la app el lunes de cada semana (o el primer día de su ciclo).
- **Ventaja**: El plan siempre está actualizado según la última rotación o variación sin necesidad de procesos de "regeneración" complejos si el profesor cambia algo a mitad de mes.
- **Dopamina**: El alumno siente que su app " se prepara" para él cada inicio de semana.

### 4.2 Lógica de Generador

```typescript
// Al crear alumno + asignar plan, generar sesiones:

function generateSessions(
  alumno_id: string,
  plan_id: string,
  fecha_inicio: Date,
  variaciones?: PlanVariacion[],
) {
  const plan = await getPlan(plan_id);
  const duracion_semanas = plan.duracion_semanas;
  const rotaciones = await getRotaciones(plan_id);

  for (let semana = 1; semana <= duracion_semanas; semana++) {
    for (let dia in plan.estructura) {
      // 1. Obtener variación si existe (por feriado, ausencia)
      const variacion = variaciones?.find(
        (v) => v.numero_semana === semana && v.ajustes[dia],
      );

      // 2. Si hay variación, aplicar cambios
      const sesion_datos = variacion
        ? aplicarVariacion(plan, semana, dia, variacion)
        : generarSesionBase(plan, semana, dia);

      // 3. Resolver accesorios (qué ejercicio de la rotación?)
      const ejercicios = resolverEjercicios(
        sesion_datos.ejercicios,
        rotaciones,
        semana,
      );

      // 4. Crear sesión en DB
      await createSesion({
        alumno_id,
        plan_id,
        numero_sesion: semana * 7 + (dias.indexOf(dia) + 1),
        fecha: addDays(fecha_inicio, semana * 7 + dias.indexOf(dia)),
        variacion_id: variacion?.id,
        ejercicios,
      });
    }
  }
}

function resolverEjercicios(
  ejercicios_plan: Ejercicio[],
  rotaciones: PlanRotacion[],
  semana: number,
) {
  return ejercicios_plan.map((ej) => {
    if (ej.categoria === "accesorio") {
      // Encontrar cuál de los accesorios toca esta semana
      const rotacion = rotaciones.find((r) => r.includes(ej.id));
      const indice =
        Math.floor((semana - 1) / rotacion.duracion) %
        rotacion.ejercicios.length;
      return rotacion.ejercicios[indice];
    }
    return ej;
  });
}
```

---

### 4.2 Ejemplo: Plan de 4 Semanas con Rotación

```
PLAN: "Push/Pull/Legs"
Duracion: 4 semanas
Rotación accesorios: 2 semanas

GENERACIÓN AUTOMÁTICA:

Semana 1:
  - Lunes: Bench press, Incline DB, Tricep dips ← accesorio v1
  - Miércoles: Deadlift, Rows, Barbell curls ← accesorio v1
  - Viernes: Squat, Leg press, Leg curl ← accesorio v1

Semana 2:
  - Lunes: Bench press, Incline DB, Tricep dips ← accesorio v1 (aún)
  - Miércoles: Deadlift, Rows, Barbell curls ← accesorio v1 (aún)
  - Viernes: Squat, Leg press, Leg curl ← accesorio v1 (aún)

Semana 3: (rotan accesorios)
  - Lunes: Bench press, Incline DB, Rope pushdown ← accesorio v2
  - Miércoles: Deadlift, Rows, Machine curls ← accesorio v2
  - Viernes: Squat, Leg press, Hamstring curl ← accesorio v2

Semana 4:
  - Lunes: Bench press, Incline DB, Rope pushdown ← accesorio v2
  - Miércoles: Deadlift, Rows, Machine curls ← accesorio v2
  - Viernes: Squat, Leg press, Hamstring curl ← accesorio v2
```

---

## 5. Sistema de Variaciones (Ausencias/Feriados)

### 5.1 Crear Variación Manual

```
INTERFAZ: /profesor/planes/[id]/variaciones/new

┌──────────────────────────────────────┐
│ Crear Variación                      │
├──────────────────────────────────────┤
│                                      │
│ Semana: [3] (de 4)                   │
│ Razón: [Feriado ▼]                   │
│         • Feriado                    │
│         • Ausencia alumno            │
│         • Redistribución             │
│         • Otro                       │
│                                      │
│ Nota: "Este mes el gym cierra"       │
│                                      │
│ CAMBIOS EN SESIONES:                 │
│ ─────────────────────────────────    │
│                                      │
│ Miércoles (Espalda):                 │
│   ☐ Mover a Martes                   │
│   ☐ Dividir en 2 días                │
│   ☐ Saltear                          │
│                                      │
│ Viernes (Piernas):                   │
│   ☑ Mover a Jueves ← SELECCIONADO    │
│   Sesión original: Squat 4x6, ...    │
│                                      │
│ [Cancelar] [Crear variación]         │
└──────────────────────────────────────┘
```

---

### 5.2 Variación Aplicada a Alumno

```
RESULTADO: Alumno ve en su app:

Semana 3 (adaptada):
─────────────────────

Lunes: Bench press, Incline DB, Rope pushdown
       (como estaba planeado)

Martes: Deadlift, Rows, Machine curls
        ⚠️ (movido de miércoles por feriado)

Miércoles: OFF

Jueves: Squat, Leg press, Hamstring curl
        ⚠️ (movido de viernes)

Viernes: OFF
```

---

## 6. Cambios en UX Alumno

### 6.1 Mi Plan (Mostrar Variaciones)

```
ANTES:
┌──────────────────┐
│ Semana 1         │
│ Lunes: Pecho     │
│ Miércoles: Espalda
│ Viernes: Piernas │
│                  │
│ Semana 2         │
│ Lunes: Pecho     │
│ Miércoles: Espalda
│ Viernes: Piernas │
└──────────────────┘

AHORA:
┌──────────────────────────┐
│ Semana 1                 │
│ Lunes: Pecho             │
│  • Bench, Incline, Dips  │
│ Miércoles: Espalda       │
│  • Deadlift, Rows, Curls │
│ Viernes: Piernas         │
│  • Squat, Leg press, Curl│
│                          │
│ Semana 3 ⚠️ (ADAPTADA)    │
│ Lunes: Pecho             │
│  • Bench, Incline, Dips  │
│ Martes: Espalda          │
│  • Deadlift, Rows, Curls │ ← MOVIDO
│ Jueves: Piernas          │ ← MOVIDO
│  • Squat, Leg press, Curl│
│ Viernes: OFF             │
│                          │
│ 📌 Nota: Gym cerrado 17-18
└──────────────────────────┘
```

---

### 6.2 Tracker de Sesión (Nota de Accesorio)

```
┌───────────────────────────────────┐
│ Sesión 10 de 24                   │
│ Lunes (Semana 3)                  │
├───────────────────────────────────┤
│                                   │
│ Bench press                       │
│ 4 x 8  [Reps: 8, 8, 7, 6]        │
│ [✓ Hecho]                         │
│                                   │
│ Incline Dumbbell                  │
│ 3 x 10  [Reps: 10, 9, 8]          │
│ [✓ Hecho]                         │
│                                   │
│ Rope Pushdown ← (rotó de Dips)    │
│ 3 x 12  [Reps: 12, 11, 10]        │
│ [✓ Hecho]                         │
│                                   │
│ Notas: "Hoy muy cansado"          │
│                                   │
│ [✓ COMPLETAR SESIÓN]              │
│                                   │
└───────────────────────────────────┘
```

---

## 7. Cambios en Tracking de Sesiones

### 7.1 Tabla SESION_EJERCICIOS

```typescript
interface SesionEjercicio {
  id: string;
  sesion_id: string;
  ejercicio_id: string;

  // Plan
  serie: number;
  reps_plan: number;
  peso_plan: number;

  // Real (qué hizo el alumno)
  reps_real: number;
  peso_real: number;
  completado: boolean;

  // Accesorio
  es_accesorio: boolean;
  accesorio_rotacion?: {
    tipo: "semana_1";
    semana_2;
    etc;
    ejercicio_original_id?: string;
  };
}
```

### 7.2 Queries para Progreso

```typescript
// Comparar mismo ejercicio en distintas semanas
async function getProgressionForExercise(
  alumno_id: string,
  ejercicio_id: string,
) {
  return await db
    .from("sesion_ejercicios se")
    .join("sesiones s", "s.id = se.sesion_id")
    .select("s.fecha, se.reps_real, se.peso_real")
    .where("s.alumno_id", alumno_id)
    .where("se.ejercicio_id", ejercicio_id)
    .orderBy("s.fecha");

  // Resultado:
  // 2024-03-04: 10 reps x 40kg
  // 2024-03-11: 10 reps x 42kg (+2kg)
  // 2024-03-18: 11 reps x 42kg (mejoró reps)
  // 2024-03-25: 12 reps x 45kg (mejor progreso)
}
```

---

## 8. Cambios en Componentes

### 8.1 Nuevos Componentes Necesarios

| Componente               | Ubicación                     | Propósito                                    |
| ------------------------ | ----------------------------- | -------------------------------------------- |
| **PlanStructureBuilder** | `/profesor/planes/new` paso 1 | Define L,M,M,J,V y grupos musculares         |
| **ExerciseCategoryizer** | `/profesor/planes/new` paso 2 | Clasifica: primary, secondary, accesorio     |
| **RotationConfigurator** | `/profesor/planes/new` paso 3 | Configura ciclos de accesorios               |
| **VariationManager**     | `/profesor/planes/[id]/`      | CRUD variaciones (ausencias, feriados)       |
| **PlanCalendar**         | `/profesor/planes/[id]/`      | Timeline visual con rotaciones + variaciones |
| **ExerciseComparison**   | `/alumno/progreso`            | Compara mismo ejercicio en semanas           |

---

### 8.2 Cambios en Componentes Existentes

#### **SessionTracker (alumno)**

```tsx
// Antes: componente simple que guarda sesión

// Ahora:
// 1. Detectar si es accesorio (mostrar nota "Este es Rope pushdown, alternancia con...")
// 2. Track variación_id (para queries de progreso)
// 3. Guardar es_accesorio + tipo en sesion_ejercicios

export function SessionTracker({ sesion, variacion }) {
  return (
    <>
      {sesion.ejercicios.map((ej) => (
        <div key={ej.id}>
          <h4>{ej.nombre}</h4>

          {/* Mostrar si es accesorio */}
          {ej.es_accesorio && (
            <WarningBadge>
              Este es el accesorio de semana {variacion.numero_rotacion}
            </WarningBadge>
          )}

          {/* Inputs de reps/peso */}
          <Input label="Reps realizados" />
          <Input label="Peso usado" />

          <Button>✓ Hecho</Button>
        </div>
      ))}
    </>
  );
}
```

---

## 9. Impacto en Migración de Datos

### 9.1 Planes Existentes

```
PROBLEMA: Planes creados con modelo viejo
          no tienen metadata de rotaciones

SOLUCIONES:

A) NO hacer nada
   - Planes viejos siguen siendo estáticos
   - Solo nuevos planes tienen variaciones

B) Migración opcional
   - Profesor puede "convertir" plan viejo
   - Sistema sugiere: "¿Quieres agregar rotaciones?"
   - Profesor clickea, define rotaciones retroactivamente

C) Migración automática
   - Asumir accesorios (ejercicio que más aparece)
   - Default: rotación de 2 semanas
   - Profesor revisa + ajusta

RECOMENDACIÓN: Opción B (no fuerza, pero permite)
```

---

## 10. Cambios en Validaciones

### 10.1 Nuevas Reglas Zod

```typescript
export const planWithRotationsSchema = z.object({
  nombre: z.string().min(1),
  duracion_semanas: z.number().min(1).max(52),

  // NUEVO: Estructura semanal
  estructura: z.record(
    z.enum(["lunes", "martes", "miercoles", "jueves", "viernes"]),
    z.object({
      grupo_muscular: z.string(),
      permitir_variaciones: z.boolean(),
    }),
  ),

  // NUEVO: Ejercicios con categoría
  ejercicios: z.array(
    z.object({
      nombre: z.string(),
      categoria: z.enum(["primary", "secondary", "accesorio"]),
      grupo_muscular: z.string(),
      series: z.number(),
      reps: z.number(),
      dia: z.enum(["lunes", "martes", "miercoles", "jueves", "viernes"]),
    }),
  ),

  // NUEVO: Rotaciones
  rotaciones: z.array(
    z.object({
      tipo: z.enum(["accesorio_2sem", "accesorio_3sem", "accesorio_4sem"]),
      ejercicios: z.array(z.string()), // IDs o nombres
      duracion: z.number(),
    }),
  ),
});
```

---

## 11. Cambios en Astro Actions

### 11.1 createPlanWithRotations (NUEVA)

```typescript
export const createPlanWithRotations = defineAction({
  accept: "json",
  input: planWithRotationsSchema,
  handler: async (input, context) => {
    const user = context.locals.user;

    // 1. Crear plan base
    const plan = await supabase
      .from("planes")
      .insert({
        profesor_id: user.id,
        nombre: input.nombre,
        duracion_semanas: input.duracion_semanas,
        estructura: input.estructura,
      })
      .select()
      .single();

    // 2. Agregar ejercicios con categoría
    const ejercicios = input.ejercicios.map((ej) => ({
      plan_id: plan.id,
      nombre: ej.nombre,
      categoria: ej.categoria,
      grupo_muscular: ej.grupo_muscular,
      dia: ej.dia,
      series: ej.series,
      reps: ej.reps,
    }));
    await supabase.from("plan_ejercicios").insert(ejercicios);

    // 3. Crear rotaciones
    const rotaciones = input.rotaciones.map((rot) => ({
      plan_id: plan.id,
      tipo: rot.tipo,
      ejercicios: rot.ejercicios, // JSON array
      duracion: rot.duracion,
    }));
    await supabase.from("plan_rotaciones").insert(rotaciones);

    // 4. Generar sesiones (todas las instancias)
    await generateAllSessions(plan.id);

    return { success: true, plan_id: plan.id };
  },
});
```

### 11.2 createVariation (NUEVA)

```typescript
export const createVariation = defineAction({
  accept: "json",
  input: z.object({
    plan_id: z.string().uuid(),
    numero_semana: z.number(),
    razon: z.enum(['feriado', 'ausencia', 'redistribucion', 'otro']),
    ajustes: z.record(
      z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes']),
      z.object({
        accion: z.enum(['mover_a', 'dividir', 'saltear']),
        target_dia?: z.string(),
      })
    ),
    profesor_nota: z.string().optional(),
  }),
  handler: async (input, context) => {
    const user = context.locals.user;

    // 1. Crear variación
    const variacion = await supabase
      .from('plan_variaciones')
      .insert({
        plan_id: input.plan_id,
        numero_semana: input.numero_semana,
        razon: input.razon,
        ajustes: input.ajustes,
        profesor_nota: input.profesor_nota,
      })
      .select()
      .single();

    // 2. Regenerar sesiones para esa semana
    await regenerateSessionsForWeek(
      input.plan_id,
      input.numero_semana,
      variacion.id
    );

    // 3. Notificar alumnos si ya están dentro del plan
    await notifyStudentsAboutVariation(input.plan_id, variacion.id);

    return { success: true };
  },
});
```

## 12. Filosofía UX (Modo "Auto-Pilot")

Para evitar la "Fatiga de Configuración" (donde el profesor siente que tiene que "programar" en lugar de "entrenar"), implementaremos un modo asistido.

### 12.1 Sugerencias Proactivas de Rotación

En lugar de pedir PLAN_ROTACIONES con arrays complejos:

- Al agregar un ejercicio, el sistema muestra el botón: **"Alternar Accesorio"**.
- Al clickear, el sistema sugiere automáticamente: _¿Querés alternar 'Tricep Dips' con 'Rope Pushdown' cada 2 semanas?_
- El profesor solo hace **un click** para aceptar la lógica sugerida.

### 12.2 Solicitud de Adaptación (Trigger Alumno)

El flujo de cambios por ausencias no debe nacer siempre del profesor:

1. **Alumno**: Informa en la app: _"Esta semana falto el miércoles"_.
2. **Sistema**: Analiza el plan y propone una **Compresión Automática** (ej: pasar el volumen de hombros del miércoles al martes/jueves).
3. **Profesor**: Recibe una notificación en su dashboard: _"¿Aceptás adaptar la semana de Juan Pérez por su ausencia del miércoles?"_
4. **Acción**: El profesor hace **Click en Aceptar** y la `PLAN_VARIACION` se genera sola.

### 12.3 Ventajas del Enfoque

- **Alumno**: Se siente escuchado y su plan es 100% dinámico.
- **Profesor**: Mantiene el control final pero con **cero carga cognitiva** de re-armado manual.
- **Sistema**: Mantiene los datos limpios y transaccionales.

---

## 13. Cambios en Sitemap

### Nuevas Rutas

```
/profesor/planes/[id]/variaciones/
├─ new                    (crear variación)
├─ [variacion_id]/edit    (editar variación)
└─ [variacion_id]/delete  (eliminar variación)

/profesor/planes/[id]/rotaciones/
├─ [rotacion_id]/edit     (editar ciclo)

/alumno/progreso/
├─ [ejercicio_id]/        (progresión detallada de 1 ejercicio)
```

---

## 14. Cambios en Voice & Tone

### Nuevos Contextos

```
### I. Al Configurar Rotaciones

**Contexto:** Profesor define ciclos de cambio.
**Tono:** Educativo, enseña el patrón.

| ❌ Mal | ✅ Bien |
|--------|---------|
| "Agregar elemento a array" | "¿Qué accesorios rotan?" |
| "Duración en semanas" | "Cada cuánto cambia (2, 3 o 4 semanas)" |

### J. Al Mostrar Variación al Alumno

**Contexto:** Alumno ve que rutina cambió por feriado.
**Tono:** Transparente, explica por qué.

| ❌ Mal | ✅ Bien |
|--------|---------|
| "Ajuste de variación aplicado" | "⚠️ Tu rutina cambió: hoy es Espalda en vez de Piernas (por feriado del gym)" |
```

---

## 15. Checklist de Implementación

### FASE 1: Modelo de Datos (Backend)

- [ ] Crear tablas: PLAN_EJERCICIOS, PLAN_ROTACIONES, PLAN_VARIACIONES, SESION_EJERCICIOS
- [ ] RLS policies para variaciones (solo profesor puede editar)
- [ ] Índices en numero_semana, variacion_id

### FASE 2: Generación de Sesiones

- [ ] Algoritmo de generador (resolverEjercicios + rotaciones)
- [ ] Astro Action: createPlanWithRotations
- [ ] Astro Action: generateAllSessions
- [ ] Tests: verificar sesiones generadas correctamente

### FASE 3: Variaciones

- [ ] UI: VariationManager (/profesor/planes/[id]/variaciones/)
- [ ] Astro Action: createVariation
- [ ] Astro Action: regenerateSessionsForWeek
- [ ] Notificación a alumnos cuando variación aplica

### FASE 4: UX Alumno

- [ ] SessionTracker detecta accesorios + muestra nota
- [ ] Mi Plan muestra variaciones con icono ⚠️
- [ ] Tracker guarda es_accesorio + tipo en DB

### FASE 5: Progreso

- [ ] Queries: getProgressionForExercise (compara semanas)
- [ ] UI: ExerciseComparison gráfica
- [ ] Teste: progreso de accesorios (misma línea vs diferentes semanas)

### FASE 6: Refactor Existente

- [ ] Migración data planes viejos (opcional)
- [ ] Tests E2E: crear plan con rotaciones → invitar alumno → sesiones varían
- [ ] Copy Voice & Tone actualizado

---

## 16. Estimación de Esfuerzo

| Componente             | Tiempo     | Severidad  |
| ---------------------- | ---------- | ---------- |
| DB Schema              | 2-3h       | 🔴 Crítico |
| Generador Sesiones     | 3-4h       | 🔴 Crítico |
| VariationManager UI    | 2-3h       | 🟡 Alto    |
| SessionTracker updates | 1-2h       | 🟡 Alto    |
| ExerciseComparison     | 2-3h       | 🟢 Medio   |
| Validaciones Zod       | 1h         | 🟢 Medio   |
| Astro Actions          | 2-3h       | 🔴 Crítico |
| Tests                  | 3-4h       | 🔴 Crítico |
| Documentation          | 2h         | 🟢 Medio   |
| **TOTAL**              | **18-25h** |            |

---

## 17. Impacto en Existentes

| Componente       | Cambio                         | Breaking? |
| ---------------- | ------------------------------ | --------- |
| createPlan       | Mantener legacy, agregar nuevo | ❌ No     |
| SessionTracker   | Agregar detección accesorio    | ❌ No     |
| /profesor/planes | Agregar tab "Variaciones"      | ❌ No     |
| Sitemap          | +3 rutas nuevas                | ❌ No     |
| Voice & Tone     | +2 contextos nuevos            | ❌ No     |

---

**Conclusión:** Implementable sin breaking changes. Mejor hacerlo gradualmente: primero modelo + generador, luego UI, luego variaciones.

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0  
**Owner:** NODO Studio | MiGym

🔄 Rutinas Variables Semanales - Análisis & Plan de Implementación

**Propósito:** Definir un sistema que permita al profesor crear planes que cambian semanalmente (rotación de accesorios) y se adaptan dinámicamente (ausencias, feriados, grupos musculares redistribuidos), con **baja fricción** para el profesor y **alta percepción de valor** para el alumno.

---

## 1. Entendimiento del Caso de Uso (Aclarado)

### 1.1 Definición de "Accesorio"

No es solo una etiqueta; se define por su **posición** y **rol** en la sesión:

- **Base (Primary)**: Ejercicios de fuerza estructurales (Caminata, Bench, Squat). Son fijos.
- **Complementario (Secondary)**: Apoyo al grupo muscular. Pueden rotar en ciclos largos.
- **Accesorio (Accessory)**: Ejercicios de aislamiento que suelen rotar cada 1-4 semanas para evitar el aburrimiento y variar el estímulo.

### 1.2 Alcance de las Variaciones

- **Variación Global (Nivel Plan)**: Afecta a todos los alumnos asignados. Ideal para feriados o cambios en el gimnasio.
- **Personalización (Nivel Alumno)**: Ajustes específicos por ausencias, lesiones o viajes. Solo afecta a un individuo.

---

## 2. Modelo de Datos Refactorizado (Industrial Robust)

### 2.1 Estructura del Plan

#### `PLAN_EJERCICIOS`

| Campo           | Tipo | Nota                                                     |
| --------------- | ---- | -------------------------------------------------------- |
| `id`            | UUID | PK                                                       |
| `plan_id`       | UUID | FK                                                       |
| `ejercicio_id`  | UUID | FK                                                       |
| `exercise_type` | enum | `base`, `complementary`, `accessory`                     |
| `position`      | int  | Identifica qué slot de la sesión ocupa (ej: slot 3 rota) |
| `dia`           | enum | lunes, martes, etc.                                      |

#### `PLAN_ROTACIONES` (El Cerebro)

Define ciclos específicos para posiciones determinadas.

```json
{
  "id": "rot_123",
  "plan_id": "plan_1",
  "position": 3,
  "applies_to_days": ["lunes", "miercoles"],
  "cycles": [
    { "duration_weeks": 2, "exercises": ["tricep_dips", "rope_pushdown"] },
    { "duration_weeks": 2, "exercises": ["cable_press", "machine_dips"] }
  ]
}
```

### 2.2 Registro de Variaciones

#### `PLAN_VARIACIONES` (Global/Feriados)

| Campo           | Tipo | Nota                                                   |
| --------------- | ---- | ------------------------------------------------------ |
| `plan_id`       | UUID | FK                                                     |
| `numero_semana` | int  | Semana afectada                                        |
| `tipo`          | enum | `move_day`, `rest_day`, `redistribute`, `combine_days` |
| `ajustes`       | JSON | Configuración del cambio                               |

#### `STUDENT_PLAN_CUSTOMIZATIONS` (Personal/Ausencias)

Misma estructura que la anterior pero vinculada a un `alumno_id` específico.

---

## 3. Filosofía UX: Modo "Auto-Pilot"

Para evitar la "Fatiga de Configuración", el sistema actúa como un asistente inteligente:

### 3.1 Sugerencias Proactivas

En lugar de pedirle al profesor que configure arrays de rotación manualmente:

- Al agregar un ejercicio, el sistema muestra: **"Alternar Accesorio"**.
- Sugerencia automática: _¿Querés alternar 'Tricep Dips' con 'Rope Pushdown' cada 2 semanas?_
- El profesor solo hace **un click** para aceptar.

### 3.2 Trigger de Alumno (Solicitud de Adaptación)

1. **Alumno**: Informa en su app: _"Esta semana falto el miércoles"_.
2. **Sistema**: Analiza el plan y propone una **Compresión Automática** (ej: pasar el volumen del miércoles al martes/jueves).
3. **Profesor**: Recibe notificación: _"¿Juan falta el miércoles, aceptás adaptar su semana?"_.
4. **Acción**: El profesor acepta y la personalización se genera automáticamente.

---

## 4. Generación Dinámica "Lazy" (Just-in-Time)

Las sesiones **NO** se pre-generan para todo el plan al inicio.

- **Cuándo**: La sesión/semana se genera cuando el alumno abre la app el lunes de cada semana.
- **Ventaja**: Permite ajustes de último minuto sin romper la integridad de la base de datos (no hay que "borrar y volver a crear" sesiones futuras).
- **Proceso**: El generador consulta la estructura base + rotaciones vigentes + variaciones aplicables para ese alumno en esa semana específica.

---

## 5. Plan de Implementación MVP (15-18h)

### FASE 1: Core de Datos & Generador (7h) 🔴 CRÍTICO

- Tablas `PLAN_EJERCICIOS` con `position` y `PLAN_ROTACIONES` con `cycles`.
- Algoritmo `resolverSesionWeekly()` (el motor Lazy).
- **Testing**: 20+ casos cubriendo solapamientos, alumnos que se unen a mitad de ciclo, etc.

### FASE 2: Variaciones Globales (3h) 🟡 ALTO

- UI para "Mover Día" (feriados).
- Sincronización inmediata con el generador Lazy.

### FASE 3: UX Alumno & Progresión (4h) 🟡 ALTO

- `SessionTracker` inteligente que detecta rotaciones.
- Gráficas de progreso que comparan el mismo ejercicio a través de diferentes semanas rotativas (ej: cómo le fue en "Dips" hace 2 semanas vs hoy).

---

## 6. Checklist de Validación Final (Antes de Sprints)

- [ ] **Aclaración de Accesorios**: ¿El profesor entiende que al marcar "Posición 3" como rotativa, todos los ejercicios ahí cambiarán?
- [ ] **RLS Policies**: ¿El alumno tiene visibilidad de las `PLAN_VARIACIONES` globales pero NO de las personalizaciones de otros alumnos?
- [ ] **Edge Cases**: ¿Qué pasa si una rotación de 2 semanas se encuentra con un feriado movido al día siguiente?
- [ ] **Dopamina**: ¿El alumno recibe una notificación tipo "Tu rutina de esta semana se adaptó para cubrir tus objetivos"?

---
