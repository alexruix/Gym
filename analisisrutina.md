# 🔬 Validación de Diseño: Rutinas Dinámicas (JIT)

Este documento registra el análisis crítico, las lecciones aprendidas y el diseño técnico final del motor de rutinas variables de **MiGym**.

---

## 1. Lecciones Aprendidas (Evolución del Proyecto) 🧠

Durante la fase de diseño inicial, identificamos los siguientes problemas críticos que moldearon la arquitectura actual:

### 1.1 El Problema de la Categoría "Accesorio"
**Problema:** Inicialmente pensamos en categorizar ejercicios como "primarios" o "accesorios".
**Lección:** Descubrimos que la rotación no depende del tipo de ejercicio, sino de su **Posición** en la sesión.
**Resolución:** Implementamos `exercise_type` para semántica, pero la rotación se vincula a la `position` (ej: el ejercicio 3 es el que rota).

### 1.2 Ambigüedad en los Ciclos
**Problema:** El uso de `% modulo` para rotar ejercicios era frágil y asumía repetición infinita sin control de duración.
**Lección:** El profesor necesita definir ciclos explícitos (`duration_weeks`).
**Resolución:** El esquema final de `plan_rotaciones` usa un array de `cycles` con duración y ejercicios específicos.

### 1.3 Variaciones Globales vs Personales
**Problema:** No estaba claro si un feriado (global) se gestionaba igual que una falta de un alumno (personal).
**Lección:** Requieren tablas y flujos distintos para no ensuciar la plantilla maestra.
**Resolución:** Separamos en `plan_variaciones` (global) y `student_plan_customizations` (personal).

---

## 2. Validación Técnica (IMPLEMENTADO) ✅

### 2.1 Motor JIT (Just-In-Time)
El sistema no pre-genera sesiones estáticas, lo que evita el problema de "re-calcular" todo si el profesor edita el plan. La resolución ocurre en `PlanGenerator.ts` cada vez que el alumno carga su día.

### 2.2 Sincronización de Modelos
El modelo propuesto en el análisis fue validado e implementado íntegramente en `validators.ts`:

```typescript
// Estructura Final de Rotaciones
rotaciones: [{
  position: number,        // Posición del slot en la rutina
  applies_to_days: string[], // Días donde aplica (Lunes, Miércoles, etc.)
  cycles: [{
    duration_weeks: number,  // Cada cuánto rota (2, 3, 4 semanas)
    exercises: string[]      // UUIDs de los ejercicios de la biblioteca
  }]
}]
```

---

## 3. Casos de Prueba Validados 🧪

Hemos validado el motor contra los siguientes escenarios del mundo real:

| # | Escenario | Resultado Esperado | Estado |
|---|-----------|-------------------|--------|
| 1 | **Rotación 2 sem** | Sem 1-2 = Ejer A; Sem 3-4 = Ejer B. | ✅ OK |
| 2 | **Feriado (Mover día)** | La sesión de un viernes se mueve al jueves sin perder el ciclo de accesorios. | ✅ OK |
| 3 | **Unión tardía** | Alumno se une en Semana 3 de un plan de 4; el motor detecta que le toca el ciclo de la Sem 3. | ✅ OK |
| 4 | **Edición en vivo** | El profesor cambia un accesorio futuro y el alumno lo ve reflejado instantáneamente. | ✅ OK |
| 5 | **Días salteados** | El motor calcula la semana absoluta basada en `fecha_inicio`, no en sesiones completadas. | ✅ OK |

---

## 4. Referencia del Motor
- **Core**: `src/lib/plan-generator.ts` (`resolveSessionExercises`)
- **Schema**: `src/lib/validators.ts` (`planSchema`)
- **UI**: `RotationDialog.tsx` (Gestión de ciclos en el formulario del plan)

---

**Última actualización:** Abril 2026  
**Versión:** 2.0 (Validado y Cerrado)  
**Owner:** NODO Studio | MiGym