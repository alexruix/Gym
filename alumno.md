# Experiencia del Alumno: Rutina Dinámica & JIT 🚀

Este documento define la experiencia del usuario final (alumno) basada en la filosofía **Manejate: "Dashboard de carreras con inteligencia financiera"**, adaptada al mundo del fitness con una estética **High-energy gaming**.

## 1. El Concepto: "La Rutina Está Viva"
A diferencia de los planes estáticos tradicionales, aquí la rutina se genera **Just-in-Time (JIT)**. 
- **Entrada**: Fecha Actual + Fecha de Inicio del Alumno + Plan Maestro (con Rotaciones).
- **Salida**: La sesión exacta que corresponde hoy, resolviendo automáticamente qué variante de "Accesorio" toca.

## 2. El Dashboard (Home Alumno)
- **Vibra Fast & Furious**: Fondo oscuro, acentos en neón (limón/magenta).
- **CTA Principal**: Botón gigante "EMPEZAR SESIÓN" con brillo exterior (aura).
- **Preview Inteligente**: Muestra los 3 primeros ejercicios de hoy, destacando con un badge si alguno es una **"Variación de esta Semana"** (indicando que la rotación de accesorios está activa).

## 3. Tracker de Sesión (Inmersión Total)
- **Modo Enfoque**: Oculta la navegación global para centrarse en el ejercicio actual.
- **Micro-animaciones de Dopamina**:
    - Al marcar una serie: Sonido sutil + destello neón.
    - Al completar ejercicio: Animación de "Level Up" y transición suave al siguiente.
- **Cronómetro de Descanso**: Superpuesto, con cuenta regresiva en tipografía **Plus Jakarta Sans 800**.

## 4. Lógica de Resolución (PlanGenerator)
El sistema usará la utilidad `PlanGenerator.resolveSession()` en cada carga de página:
1. Obtiene la semana actual: `currentWeek = floor((today - startDate) / 7) + 1`.
2. Mapea el día de la semana.
3. Filtra ejercicios por `exercise_type`.
4. Si hay una `plan_rotaciones` para la `position` del ejercicio, resuelve el ciclo basándose en la `currentWeek`.

## 5. Próximos Pasos (Sprint 3 - Futuro)
- [ ] Implementar `src/actions/alumno.ts` con `getTodaySession`.
- [ ] Desarrollar component `ActiveSession.tsx` (Organismo React).
- [ ] Refactorizar `/alumno/sesion/[numero].astro` para hidratar el tracker.

---
> [!TIP]
> La estética debe ser **Premium**. No usamos colores planos; usamos gradientes y sombras dinámicas (glassmorphism) sobre fondos oscuros.

> [!IMPORTANT]
> **Privacidad**: El alumno solo tiene acceso a sus propias sesiones resueltas y personalizaciones, nunca al `plan_id` maestro de otros alumnos.
