# 🔄 Rutinas Dinámicas y Motor JIT (Just-In-Time)

Este documento detalla el funcionamiento del sistema de variaciones semanales y rotaciones de ejercicios de **MiGym**. El sistema permite que los planes de entrenamiento no sean estáticos, sino que evolucionen dinámicamente según el progreso y las necesidades del alumno.

---

## 1. Escenarios de Uso Operativos 🇦🇷

### 1.1 Rotación de Accesorios (Escenario A)
**Estado: ✅ OPERATIVO**

El profesor define "Slots" de ejercicios que rotan automáticamente cada $N$ semanas para evitar el estancamiento y mantener la motivación.
- **Ejemplo**: Un slot de "Tríceps" que alterna entre *Dips* (Semana 1-2) y *Rope Pushdown* (Semana 3-4).
- **Lógica**: El motor JIT resuelve qué ejercicio mostrar al alumno en tiempo real.

### 1.2 Variaciones por Feriados y Ausencias (Escenario B/C)
**Estado: 🏗️ INFRAESTRUCTURA LISTA / UI EN ROADMAP**

El sistema permite modificar la estructura de una semana específica (mover días, combinar rutinas) sin alterar la plantilla maestra del plan.
- **Global**: Para feriados institucionales (Cierre del gimnasio).
- **Personal**: Para ausencias específicas de un alumno (Viaje, enfermedad).

---

## 2. Modelo de Datos Real (ERD) 📊

Basado en las migraciones actuales (`supabase/migrations/`):

### 2.1 Tabla: `plan_rotaciones`
Almacena los ciclos de cambio para ejercicios específicos en un plan.
- `id`: UUID (PK)
- `plan_id`: FK a `planes`
- `position`: INT (Vincula el ejercicio en la rutina con su rotación)
- `applies_to_days`: TEXT[] (Días de la semana donde aplica, ej: `['Lunes', 'Miércoles']`)
- `cycles`: JSONB (Estructura: `[{ duration_weeks: 2, exercises: [uuid1, uuid2] }]`)

### 2.2 Tabla: `plan_variaciones` (Globales)
Gestiona cambios para todos los alumnos asignados a un plan en una semana específica.
- `id`: UUID (PK)
- `plan_id`: FK a `planes`
- `numero_semana`: INT
- `tipo`: ENUM (`move_day`, `rest_day`, `redistribute`, `combine_days`)
- `ajustes`: JSONB (Configuración del cambio)
- `razon`: TEXT (Ej: "Feriado de Pascuas")

### 2.3 Tabla: `student_plan_customizations` (Personales)
Ajustes únicos para un alumno individual.
- `id`: UUID (PK)
- `alumno_id`: FK a `alumnos`
- `plan_id`: FK a `planes`
- `numero_semana`: INT
- `tipo`: ENUM (`move_day`, `rest_day`, etc.)
- `ajustes`: JSONB
- `razon`: TEXT (Ej: "Cirugía de muela")

---

## 3. Motor JIT (Just-In-Time) ⚙️

La resolución de la rutina no se pre-genera, sino que ocurre "al vuelo" cuando el alumno accede a su sesión.

### 3.1 Clase `PlanGenerator` (`src/lib/plan-generator.ts`)
Es el corazón del sistema dinámico. Su función principal es `resolveSessionExercises`.

```typescript
static resolveSessionExercises(
  ejerciciosBase: EjercicioPlan[],
  rotaciones: PlanRotacion[],
  currentWeek: number,
  diaSemanaStr: string
): EjercicioPlan[] {
  return ejerciciosBase.map(ej => {
    // Si es un accesorio y tiene una posición asignada, buscamos rotación
    if (ej.exercise_type === 'accessory' && ej.position > 0) {
      const rotacionActiva = rotaciones.find(r => 
        r.position === ej.position && 
        r.applies_to_days.includes(diaSemanaStr)
      );

      if (rotacionActiva && rotacionActiva.cycles?.length > 0) {
        // Determinar qué ciclo corresponde basado en la semana actual
        const cycleIndex = (currentWeek - 1) % rotacionActiva.cycles.length;
        const cycleVariation = rotacionActiva.cycles[cycleIndex];

        return {
          ...ej,
          biblioteca_ejercicios: {
             nombre: cycleVariation.name || ej.nombre,
             media_url: cycleVariation.media_url || ej.media_url,
          },
          is_variation: cycleIndex > 0 // Flag para la UI
        };
      }
    }
    return ej;
  });
}
```

---

## 4. Próximamente (Roadmap) 🚀

- **Generación Lazy Semanal**: Implementar un worker que pre-genere las sesiones cada lunes para mejorar el tiempo de carga inicial y permitir notificaciones push personalizadas.
- **UI de Variaciones**: Pantalla para que el profesor pueda arrastrar y soltar (Drag & Drop) rutinas entre días en caso de imprevistos.
- **Historial de Rotaciones**: Visualización gráfica de qué accesorios tocó cada semana para un análisis de progreso a largo plazo.

---

## 5. Referencia de Componentes
- **Frontend**: `RotationDialog.tsx` (Configura los ciclos en `PlanForm`).
- **Backend API**: RPC `actualizar_plan_completo` (Persiste la data en `plan_rotaciones`).
- **Utility**: `PlanGenerator.ts` (Lógica de resolución JIT).
