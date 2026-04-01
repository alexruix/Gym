# 🔧 Referencia UX: Componente PlanForm

Este documento detalla la lógica de negocio, los atajos de teclado y el diseño de experiencia de usuario del creador de planes (**PlanForm**). MiGym prioriza la velocidad del profesor mediante una interfaz industrial y funcional.

---

## 1. Filosofía de Diseño: "Velocidad de Flujo" 🇦🇷

El profesor no debe "navegar" la app, debe "operar" el plan. El diseño se basa en 3 pilares:
1.  **Contexto Total**: Siempre sabe en qué semana y día está.
2.  **Acciones Atómicas**: Una sola zona de edición para evitar distracciones.
3.  **Zero-Latency UX**: Atajos de teclado y validación en vivo para eliminar la fricción del botón "Guardar".

---

## 2. Atajos de Teclado (Power User) ⚡

El `PlanForm` está optimizado para su uso sin ratón/mouse:

- **`W`**: Cambiar a la siguiente **S**emana (Week). Al llegar a la última, vuelve a la primera.
- **`D`**: Cambiar al siguiente **D**ía (Day). Navegación secuencial por todo el cronograma.
- **`S`**: **G**uardar Plan (Save). Solo funciona si el formulario es válido (Check en el footer).

---

## 3. Funcionalidades Clave

### 3.1 Navegación Inteligente (`PlanNavigator`)
Un encabezado fixed que separa la estructura del plan en dos niveles:
- **Nivel 1 (Semanas)**: Selector horizontal de semanas (W1, W2...).
- **Nivel 2 (Días)**: Selector de Lunes a Domingo con indicadores visuales:
    - **Punto Verde**: Indica que el día ya tiene ejercicios cargados.
    - **CheckCircle**: Indica el día activo actual.

### 3.2 Modo Auto-Pilot (Rotaciones)
Permite programar la rotación de ejercicios accesorios de forma dinámica:
- **Lógica**: Si un ejercicio se marca para rotar, el sistema alterna automáticamente entre las variantes elegidas (ej: Semana 1: Bíceps Barra, Semana 2: Bíceps Martillo).
- **Control**: Se gestiona desde el `RotationDialog` accediendo desde cada `ExerciseCard`.

### 3.3 Copia Inteligente con Deshacer (Undo)
El botón **[Copiar Día]** abre el `BulkActionDialog`:
- Permite duplicar la rutina del día actual a múltiples semanas en un solo clic.
- **Seguridad**: Al confirmar, aparece un Toast con la opción **[Deshacer]** que revierte los cambios instantáneamente usando una referencia de historial (`historyRef`).

### 3.4 Validación Atómica en Tiempo Real
El footer del formulario muestra el estado de integridad del plan:
- **Checkmark**: Indica que el plan tiene nombre y al menos un ejercicio cargado.
- **Alert**: Advierte si el plan está vacío, deshabilitando el botón **[Guardar]**.

---

## 4. Problemas Identificados (Pendientes de Resolución) 🔴

A pesar de las mejoras, existen puntos de fricción que deben abordarse en futuras iteraciones:

- **Búsqueda de Ejercicio no Inline**: Actualmente se requiere abrir un diálogo (`ExerciseSearchDialog`) para añadir ejercicios. Se propone cambiar a un **Input Autocomplete Inline** directamente en la lista para evitar el cambio de contexto visual.
- **Carga de Trabajo Proyectada**: El profesor no puede ver una estimación de tiempo total del entrenamiento (ej: "~45 min") basada en series y descansos.
- **Copia de Semanas Completas**: La lógica actual solo permite copiar días individuales. Falta una función para "Clonar Semana 1 a Semana 2" completa.
- **Historial Completo de Cambios**: No existe un flujo de `Undo/Redo` (Ctrl+Z) para acciones de edición individual de ejercicios (cambio de reps, series, pesas), solo para la copia masiva.

---

## 5. Arquitectura de Componentes

- **`PlanForm.tsx`**: Orquestador principal y gestión de estado (React Hook Form + Zod).
- **`PlanNavigator.tsx`**: Maneja el cronograma y la navegación temporal.
- **`ExerciseCard.tsx`**: Item individual con edición de series/reps y acceso a rotaciones.
- **`BulkActionDialog.tsx`**: Lógica de replicación masiva entre semanas.
- **`RotationDialog.tsx`**: Configuración del motor de Auto-Pilot.
- **`ExerciseSearchDialog.tsx`**: Buscador de la biblioteca general.