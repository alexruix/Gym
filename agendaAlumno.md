# 📅 Calendario Operativo: Registro de Implementación (SSOT)

Este documento es la **Única Fuente de Verdad** sobre el sistema de agenda y entrenamiento dinámico de MiGym. Refleja la arquitectura real y las capacidades operativas implementadas.

---

## 1. Arquitectura Temporal (El Motor)

El sistema abandona el concepto de "rutinas estáticas" por una **Agenda de Entrenamiento** basada en fechas reales.

### 1.1 El Punto de Ancla: `fecha_inicio`
Cada alumno tiene una `fecha_inicio` definida en su perfil. Esta fecha marca el **Día 1** del plan asignado.
- **Mapeo**: `(fecha_real - fecha_inicio) + 1 = numero_dia_plan`.
- **Día Cíclico**: Si el plan tiene 4 días y el alumno está en su día 10, el sistema calcula el `dia_ciclico` (Día 2 del plan) usando el módulo sobre el total de rutinas.

### 1.2 Instanciación Just-in-Time (JIT)
Las sesiones no se crean masivamente al inicio. Se instancian en la base de datos cuando:
1. El alumno abre la aplicación en una fecha específica.
2. El profesor accede a esa fecha en el calendario del alumno.

---

## 2. Estructura de Datos Final

### 2.1 `sesiones_instanciadas` (La Cabecera)
Representa la intención de entrenar en una fecha real.
- `estado`: `pendiente`, `en_progreso`, `completada`, `omitida`.
- `semana_numero`: Calculada dinámicamente para agrupar progresos.

### 2.2 `sesion_ejercicios_instanciados` (El Detalle)
Los ejercicios específicos que el alumno debe realizar "hoy".
- **Inteligencia de Carga**: Hereda las métricas (`series`, `reps`, `peso`) del **Plan Maestro** del alumno, pero permite overrides.
- `is_variation`: Marca si el ejercicio fue sustituido por el profesor para ese día.

---

## 3. Inteligencia Operativa y Propagación

### 3.1 Forward Propagation (Propagación hacia adelante)
Cuando el profesor ajusta una métrica (ej. subir 5kg en Sentadilla) en el calendario:
- El cambio se guarda en `ejercicio_plan_personalizado` para la semana actual.
- **Propagación Automática**: El sistema actualiza todas las semanas futuras del plan del alumno de forma permanente.
- **Sincronización Inmediata**: Si ya existen sesiones futuras instanciadas pero no completadas, se actualizan sus objetivos al instante.

### 3.2 Variaciones Puntuales (Swap)
El profesor puede sustituir un ejercicio por otro solo por hoy.
- No afecta al Plan Maestro.
- Genera una entrada en la sesión con el flag `is_variation`.
- **Alerta Estructural**: Si se detectan múltiples variaciones, el sistema sugiere guardar la nueva estructura como un nuevo **Plan Maestro**.

---

## 4. Buffer de Desfase (Offset/Pausas Inteligentes)

El sistema opera con una **Red de Seguridad Temporal** para evitar que las inasistencias del alumno rompan la coherencia técnica del plan.

### 4.1 Detección Automática de Inasistencias
Si el sistema detecta **3 sesiones consecutivas** en estado `omitida` antes de la fecha actual, disparará una alerta al profesor.

### 4.2 Reajuste de Fecha de Inicio (Offset)
El profesor puede optar por realizar un **Desplazamiento Temporal** (`offset_days`):
- **Efecto**: Se suma N días a la `fecha_inicio` del alumno en la base de datos.
- **Resultado**: El "Día 4" técnico que el alumno no pudo hacer se desplaza al día del calendario real actual, permitiendo que el entrenamiento continúe exactamente donde se interrumpió sin saltarse sesiones.

---

## 5. Capacidades del Profesor (Centro de Comando)

El profesor opera el progreso del alumno desde la pestaña **Rutina**:
- **Edición Inline**: Ajuste rápido de objetivos usando la `MetricConsole`.
- **Lookback Histórico**: Visualización de las últimas 3 ejecuciones reales del alumno antes de asignar pesos.
- **Asistencia (Cierre de Sesión)**: Capacidad de marcar una sesión como "completada" en nombre del alumno ahorrando errores de registro.
- **Undo (Deshacer)**: Red de seguridad mediante toasts para revertir cambios accidentales en la base de datos.

---

## 5. Glosario de Estados

| Estado | Significado | Visual (Calendario) |
| :--- | :--- | :--- |
| **Pendiente** | Fecha actual o pasada sin registro. | Círculo vacío / Punto |
| **En Progreso** | El alumno inició pero no cerró. | Indicador azul |
| **Completada** | Sesión cerrada con éxito. | Check Lime (`lime-400`) |
| **Omitida** | El alumno no fue a entrenar. | Indicador rojo |
| **Futura** | Días próximos programados. | Opacidad reducida |

---

**Última actualización:** Abril 2026  
**Versión:** 2.0 (Realidad Implementada)  
**Owner:** NODO Studio | MiGym