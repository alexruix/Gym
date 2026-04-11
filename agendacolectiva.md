Agenda Colectiva: El Centro de Operaciones (v2.1)
La Agenda Colectiva es la evolución final del archivo Horarios_.xlsx. Es una interfaz de Live Ops que transforma la lista de alumnos en una línea de tiempo reactiva. El sistema ya no espera a que el profesor busque; el sistema le sirve al profesor la información que necesita según el reloj.

1. El Triángulo de Datos (Arquitectura)
Para que esta vista funcione con Fricción Cero, la agenda cruza tres capas de información en una sola consulta (SSR + Realtime):

Capa Temporal (Schedule): Define el "Cuándo" (Lunes, Miércoles, Viernes).

Capa Logística (Blocks): Define el "Turno" (Bloques de 60/90 min con cupos máximos).

Capa Técnica (Routine): Define el "Qué" (La sesión instanciada del alumno para esa fecha específica).

2. Visual Excellence: La Interfaz de Telemetría
La visualización sigue un patrón de Timeline Vertical con estética de consola de comando:

🟢 Bloque Activo (High Priority)
Highlight: Borde izquierdo de 4px en lime-400.

Auto-Scroll: Al entrar en el horario de un bloque, la UI lo ancla en la parte superior.

Cards en Paralelo: Grid adaptativo que muestra a los alumnos del turno.

📊 Card de Alumno (Atomic Detail)
Cada ficha de alumno en la agenda es una unidad de Telemetría Rápida:

Status Ring: Un borde circular progresivo que se completa a medida que el alumno (o el profe) marca ejercicios como hechos.

Top Performance: Muestra el ejercicio "Core" del día (ej: Sentadilla) y el peso objetivo vs. el peso real de la última serie.

Quick Swap: Botón para cambiar al alumno de turno "solo por hoy" (Drag & Drop o Selector rápido).

3. Inteligencia de Salón (Fase 4)
A. Gestión de Capacidad y "Heatmap"
El sistema visualiza la saturación del gimnasio para optimizar el flujo:

Indicador de Cupo: (Inscriptos / Capacidad Máxima).

Visual: Si el turno está al 100%, la cabecera del bloque se tiñe de zinc-800 con un badge de "LLENO".

Recuperos: Si un alumno falta, el "hueco" se libera visualmente, permitiendo que el profesor asigne a otro alumno que deba recuperar una clase con un solo tap.

B. Modo "Multi-Atención" (The God View)
Gracias a la navegación semántica (<a> con asChild), el profesor opera como un director de orquesta:

Mantiene la Agenda en la pantalla principal del iPad/Celular.

Abre la rutina completa de un alumno en una nueva pestaña para ajustes finos sin perder el "Live Feed" de los demás.

Sincronización: Cualquier cambio en la pestaña del alumno se refleja instantáneamente en la Agenda Colectiva vía Supabase Realtime.

4. El "Killer Feature": Importador de Horarios
Para jubilar el Excel sin dolor, el importador de alumnos ahora reconocerá una columna de "Turno Preferido".

Automatización: El sistema crea los bloques horarios (9 a 10hs, 10 a 11hs, etc.) basándose en tu archivo Horarios_.xlsx y mete a los alumnos adentro automáticamente.

5. Evolución: El "Organismo Vivo" (Fase 5)
Para que la Agenda no sea solo una lista de tareas, sino un organismo que respira y evoluciona:

A. Micro-Sparklines de Tendencia
Cada ejercicio en la card del alumno incluirá un sparkline (gráfico de líneas minimalista) con la progresión del peso de las últimas 4 sesiones. El profesor decide el peso de hoy con "visión de rayos X" histórica.

B. Zonas de Fatiga / Heatmap Muscular
Si un alumno reporta una molestia, el sistema marcará visualmente los grupos musculares afectados. Los ejercicios de esa zona aparecerán con un aviso de precaución en la agenda hasta que el profesor limpie la alerta.

C. Nudge de Progresión (Inteligencia de Carga)
El sistema analizará el volumen acumulado. Si el alumno marcando "Fácil" durante 2 semanas, un ícono de ⚡ sugerirá un aumento de carga proactivo, transformando al sistema en un asistente de alto rendimiento.

D. Modo "En Vivo" (Telemetría en Tiempo Real)
Cuando el alumno abre su app y empieza a entrenar, su card en la Agenda Colectiva pulsará levemente en lime-400. El profesor podrá ver "en vivo" qué peso está cargando el alumno y dar feedback instantáneo.

[!IMPORTANT]
Definición de Éxito: El profesor entra al gimnasio, abre la Agenda Colectiva y no toca el buscador en todo el día. La información fluye sola a medida que pasan las horas. El sistema no solo muestra datos, sino que propone victorias.