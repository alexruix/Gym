# 🎨 Design System: Alumno | MiGym

**Única Fuente de Verdad para la Interfaz del Atleta.** Estética "Industrial Minimalist" adaptada a un entorno de alto rendimiento, optimizada para Dark Mode y operatividad táctil extrema.

---

## 1. Identidad Visual: "Cockpit Dinámico"

La interfaz del alumno no es un panel de gestión, es un **cockpit**. Está diseñada para eliminar distracciones y centrar la dopamina visual en el rendimiento físico.

- **Filosofía**: "La Rutina Está Viva". El diseño debe sentirse reactivo, técnico y motivador.
- **Atmósfera**: Oscura, profunda y técnica (Vibras de cockpit de avión o auto de carreras).

### 1.1 Regla de Color: 70/20/10

Para mantener el alto contraste y la elegancia industrial, aplicamos la siguiente distribución cromática:

- **70% Base (Dominante)**: `bg-black` puro (#000). Optimizado para pantallas OLED y reducción de fatiga visual.
- **20% Secundario (Identidad)**: `lime-400`. Para CTAs, estados de éxito y anclas visuales.
- **10% Terciario (Especial)**: `fuchsia-500`. Para variaciones semanales, rotaciones de ejercicios o métricas de récord personal (PR).

---

## 2. Tipografía y Jerarquía

Utilizamos el sistema **Geist + Inter** con una jerarquía de "3 Niveles de Impacto":

1.  **Nivel 1: El Ancla (Métricas)**: `font-heading` (Geist), `font-bold`, `text-4xl` o superior. Tracking `tighter`. Para el nombre del ejercicio o los kilos/reps.
2.  **Nivel 2: El Soporte (Contexto)**: `font-sans` (Inter), `font-medium`, `text-lg/xl`. Para instrucciones o descripción de bloques.
3.  **Nivel 3: El Detalle (Técnico)**: `text-[10px]`, `font-bold`, `uppercase`, `tracking-[0.4em]`. Para labels industriales (ej: "DESCANSO", "SERIE ACTUAL").

---

## 3. Tailwind Recipes (Componentes Alumno)

### 3.1 Glassmorphism (Superficies)
Usamos `industrial-card-glass` para cards que requieren profundidad sin perder la noción del fondo.

```tsx
// Recipe
const glassCard = "bg-zinc-900/60 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl";
```

### 3.2 Premium Glow (Botones y Acentos)
El "Glow" MiGym se activa en acciones críticas para guiar el ojo mediante la sombra de acento.

```tsx
// Botón Primario (Glow)
const buttonPremium = "bg-lime-400 text-black font-bold rounded-2xl h-14 px-8 shadow-[0_0_20px_rgba(163,230,53,0.3)] active:scale-95 transition-all uppercase tracking-widest text-xs";

// Borde de Acento Fuchsia (Variaciones)
const variationBorder = "border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]";
```

### 3.3 Grid Background
Fondo técnico sutil para todas las páginas principales del alumno.

```css
/* global.css o inline style */
.bg-grid-alumno {
  background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 30px 30px;
}
```

---

## 4. UX: Reglas del Pulgar y Haptics

- **Thumb Zone Design**: El 100% de los botones de acción (`Siguiente`, `OK`, `Timer`) deben vivir en el tercio inferior de la pantalla (`pb-10`).
- **One-hand Operations**: Targets táctiles de mínimo `h-14` (56px).
- **Haptic Feedback**: (Futuro v2.1) Vibración corta al terminar el timer de descanso. Vibración larga al completar la última serie de la sesión.
- **Visual Dopamine**: Al completar un ejercicio, la métrica debe emitir un "pulso" sutil en `lime-400`.

---

## 5. Guía de Voz (Argentina 🇦🇷)

Para el alumno, el tono es un **Coach Cercano**. Usamos voseo rioplatense motivacional pero profesional.

- **✅ Bien**: "Dale, sacá una más. Vos podés. 💪"
- **✅ Bien**: "Hiciste la sesión. Sos una máquina. 🔥"
- **✅ Bien**: "Revisá tu progreso de la semana."
- **❌ Mal**: "Has completado tu sesión correctamente." (Demasiado formal/español neutro).

---

**Última actualización:** Abril 2026  
**Versión:** 1.0 (Student Experience Refactor)  
**Owner:** NODO Studio | MiGym
