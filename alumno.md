# Experiencia del Alumno: El Dashboard de Alto Rendimiento 🚀

Este documento define la interfaz y experiencia del usuario final (alumno) en **MiGym**. No es solo un tracker de gimnasio; es un **dashboard de carreras con inteligencia deportiva**, diseñado con una estética **High-energy gaming** (Fast & Furious vibes) y optimizado para la dopamina inmediata.

---

## 1. Filosofía: "La Rutina Está Viva" (JIT)

En MiGym, el alumno no ve un PDF estático. La rutina se genera **Just-in-Time (JIT)** cada vez que el usuario entra a entrenar.

- **Configuración Maestra**: El profesor define un plan con ejercicios Base, Complementarios y Accesorios.
- **Resolución Dinámica**: El sistema calcula la sesión de hoy basándose en la fecha de inicio del alumno y las rotaciones programadas.
- **Voz del sistema**: "Hoy te toca castigar el pecho. ¿Estás listo?" (Voseo rioplatense, motivador pero técnico).

---

## 2. UI Aesthetics: High-Energy Gaming 🏎️

La interfaz debe sentirse como el cockpit de un auto de carreras. 

### Sistema de Diseño (Visual Depth)
- **Fondo**: Zinc-950 (negro industrial) con un sutil grid de fondo (opacity 5%).
- **Acentos**: `lime-400` para éxito/progreso y `rose-500` para esfuerzo máximo/errores.
- **Profundidad**: Uso intensivo de `glassmorphism` (fondos con blur) y `shadow-2xl` con glow de color (ej: `shadow-lime-500/20`).

### Tipografía
- **Títulos**: *Plus Jakarta Sans* peso 800 (Extra Bold), en mayúsculas para labels técnicos.
- **Lectura**: *Plus Jakarta Sans* peso 500/600 para instrucciones de ejercicios.

---

## 3. UX: La "Zona del Pulgar" 📱

Siguiendo nuestras [Consideraciones de UX](file:///c:/Users/alexr/github/Gym/uxconsiderations.md), la interfaz del alumno está diseñada para usarse con una sola mano mientras se entrena.

- **CTAs Flotantes**: El botón de "Completar Serie" o "Siguiente Ejercicio" siempre está en el tercio inferior de la pantalla.
- **Acciones Rápidas**: Menú de fácil acceso para reportar molestias ("Me dolió el hombro") o pedir cambio de ejercicio, integrado con el sistema de notificaciones al profesor.

---

## 4. Micro-interacciones de Dopamina ⚡

El entrenamiento es duro; la app debe hacerlo gratificante.

- **Check-in visual**: Al marcar una serie como completada, el borde de la card emite un pulso neón y el número de reps se "ancla" con una animación de rebote.
- **Descanso Activo**: Un cronómetro circular que cambia de color de `zinc-500` a `lime-400` a medida que se acerca el final, con una vibración haptica suave al terminar.
- **Level Up**: Al terminar la sesión, una pantalla de resumen tipo "Misión Cumplida" muestra el volumen total movido hoy con estética de videojuego.

---

## 5. Voz y Tono: Tu Coach en el Bolsillo 🗣️

Aplicamos el [Voseo Rioplatense](file:///c:/Users/alexr/github/Gym/vozytono.md) de forma natural:

- **Instrucción**: "Mantené la espalda recta y bajá controlado."
- **Motivación**: "Dale, sacá una más. Vos sabés que podés."
- **Feedback**: "Hiciste la sesión. Sos una máquina. 💪"

---

## 6. Checklist de Implementación Premium

Para que un componente de la experiencia del alumno esté "terminado", debe cumplir:

- [ ] **Jerarquía Visual**: Tres niveles claros (Ancla, Soporte, Detalle).
- [ ] **Feedback Inmediato**: Cada toque genera una respuesta visual o sonora (sutil).
- [ ] **Mobile-First**: Operable al 100% con el pulgar.
- [ ] **Zero Noise**: En el "Modo Sesión", se oculta todo lo que no sea el ejercicio actual.
- [ ] **Accesibilidad**: Contraste AA mínimo, incluso sobre fondos oscuros.

---

> [!IMPORTANT]
> **Privacidad Atómica**: El alumno jamás ve el `plan_id` de otros, ni el listado de otros alumnos del profesor. Su espacio es sagrado y privado.

> [!TIP]
> Usá la utilidad `formatCurrency()` para cualquier referencia a pagos o montos, y asegurate de que las fechas sigan el formato `DD/MM/YYYY`.
