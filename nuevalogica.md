# 🧠 Nueva Lógica MiGym: Arquitectura ADN vs Organismo

Este documento describe la refactorización profunda realizada en el sistema de planificación y ejecución, diseñada para desacoplar la **estructura del entrenamiento** de los **datos técnicos personalizados**.

---

## 1. Concepto Fundamental: ADN vs Organismo

Para resolver el problema de la pérdida de datos cuando el profesor modificaba un plan, hemos implementado una arquitectura biológica:

### 🧬 ADN (Plan Maestro)
- **Definición**: Es el mapa estructural (los ejercicios y su orden).
- **Estado Técnico**: Es "estéril/neutral". No guarda series, reps ni pesos específicos (o los guarda como `0/NULL`).
- **UI**: En el editor, muestra placeholders industriales (`3 × -- @ --kg`) para indicar que es una plantilla.

### 🌿 Organismo (Plan del Alumno)
- **Definición**: Es el plan "vivo" asignado a un atleta específico.
- **Estado Técnico**: Es el portador de la **Carga Personalizada**.
- **Persistencia**: Los datos técnicos (kilos, reps reales) viven aquí y están protegidos contra cambios en la estructura maestra.

---

## 2. Los 3 Pilares Técnicos

### A. Sincronización Quirúrgica (Ancla `position`)
En lugar de depender de IDs de base de datos volátiles o el índice de la lista, cada ejercicio tiene una columna `position` (un entero aleatorio de 9 dígitos). 
- **Por qué**: Si el profesor mueve un ejercicio de la posición 1 a la 5, el sistema usa el ancla `position` para saber que es el mismo ejercicio y "mudar" sus pesos y notas sin error.

### B. Efecto Lázaro (Soft Delete)
Se añadió la columna `deleted_at` a la tabla `ejercicios_plan`.
- **Lógica**: Cuando un profesor quita un ejercicio del plan, el sistema lo marca como archivado en lugar de borrarlo físicamente.
- **Magia**: Si el profesor se arrepiente y vuelve a agregar el ejercicio (o el sistema detecta la misma `position`), el ejercicio "resucita" con todos sus pesos previos intactos.

### C. Propagación de Carga (Deep Sync)
- **Feedback Loop**: Cuando el alumno ajusta un peso durante su entrenamiento en vivo, el sistema ofrece (o ejecuta) una **Propagación Futura**.
- **Implementación**: Si el plan es privado (`is_template = false`), el cambio actualiza directamente la estructura del Organismo (tabla `ejercicios_plan`), asegurando que la próxima semana el peso ya esté actualizado.

---

## 3. Impacto en el Modelo de Datos

| Tabla | Cambio Clave | Propósito |
| :--- | :--- | :--- |
| `ejercicios_plan` | `deleted_at` (timestamp) | Habilitar Soft Delete / Efecto Lázaro. |
| `ejercicios_plan` | `position` (BIGINT) | Clave primaria lógica para sincronización UI-DB. |
| RPC `actualizar_plan_completo` | Lógica `ON CONFLICT` | Filtra qué columnas se actualizan (estructura) y cuáles se preservan (métricas). |

---

## 4. Guía de Interacción (Voz y Tono)

- **Profesor**: Se le informa mediante "Nudges" cuando está en modo ADN para que no intente cargar pesos globales.
- **Alumno**: Se le presenta una "Estación de Control" de alta visibilidad donde sus datos reales retroalimentan al sistema.

> [!IMPORTANT]
> **Regla de Oro**: Nunca borrar físicamente de `ejercicios_plan` durante un `UPDATE`. Siempre usar el sistema de conciliación por `position`.
