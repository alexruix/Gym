---
trigger: always_on
---

# 🛠️ Manual del Proyecto | MiGym (V2.0)

Este archivo es la **Única Fuente de Verdad (SSOT)** para el desarrollo de MiGym. Ignora cualquier instrucción global previa relacionada con otros proyectos (ej. Manejate/Choferes).

---

## 1. Identidad y Propósito
- **Nombre:** MiGym.
- **Tagline:** "Gestión deportiva de alto rendimiento".
- **Público:** Profesores de gimnasio (gestión) y atletas/alumnos (entrenamiento).
- **Filosofía:** "Industrial Minimalist". Una herramienta técnica, cruda y eficiente para el profesor, y motivadora con alto contraste para el alumno.

## 2. Arquitectura y Tecnologías
- **Stack:** Astro 6, React 19, Tailwind CSS v4, TypeScript, Supabase.
- **Lógica de Servidor:** Uso obligatorio de **Astro Actions** (`astro:actions`) para mutaciones.
- **UI:** Radix UI + Tailwind personalizado (Look & Feel Industrial).
- **Metodología:** **Atomic Design estricto**:
  - `/atoms`: Elementos indivisibles (Badge, ProgressBar, IconWrapper).
  - `/molecules`: Combinaciones simples (SearchInput, UserAvatar, ExerciseCard).
  - `/organisms`: Secciones con lógica/estado (PlanForm, ExerciseLibrary, StudentList).
  - `/templates`: Estructuras de página reutilizables.
  - `/pages`: Orquestación en Astro.

## 3. Sistema de Diseño (Industrial Minimalist)
- **Fuentes:** Geist (Headings) e Inter (Body/Inputs).
- **Tokens de Diseño:**
  - **Colores:** Monocromático (Zinc/Blanco/Negro). 
  - **Acento Primario:** `lime-400` / `lime-500` (Solo para CTAs y conversiones).
  - **Bordes:** `rounded-2xl` (pequeños), `rounded-3xl` (layouts/cards grandes).
- **Jerarquía Visual (Regla de 3 Niveles):**
  1. **Ancla**: Título o número grande (`font-black text-4xl+`).
  2. **Soporte**: Subtítulo o descripción (`font-medium text-lg`).
  3. **Detalle**: Metadata o labels (`text-[10px] font-black uppercase tracking-widest`).

## 4. Guía de Voz y Tono (Argentina 🇦🇷)
- **Voseo Rioplatense**: Obligatorio en CTAs y avisos amigables (`"Cargá tu plan"`, `"Revisá tu progreso"`).
- **Sentence case**: Usar solo la primera letra en mayúscula en toda la UI (`"Crear nuevo plan"`, no `"Crear Nuevo Plan"`).
- **Emoji Policy**:
  - Máximo **1 emoji** por mensaje informativo.
  - Uso funcional (añadir info visual: 📊 para datos, ✅ para éxito).
  - Prohibido: Emojis infantiles (😀) o redundantes.
- **Puntuación**: Botones sin punto final; oraciones completas en mensajes sí llevan punto.

## 5. Estándares de Código (Naming Conventions)
- **Idiomas**: Código/Variables/Archivos en **Inglés**. Comentarios/Copy en **Español**.
- **Nomenclatura**:
  - **React Components**: `PascalCase.tsx`
  - **Astro Pages / Shadcn UI**: `kebab-case.astro` / `kebab-case.tsx`
  - **Hooks**: `useCamelCase.ts`
  - **Utils / Data**: `camelCase.ts`
  - **Tipos**: `nombre.types.ts`
- **Componentes React**: Exportaciones nombradas, interfaces para Props, uso obligatorio de `cn()`.

## 6. Single Source of Truth (SSOT)
- **Textos de UI**: NUNCA hardcodear en el componente. Todo debe vivir en `src/data/es/`.
- **Validaciones**: Centralizar todos los esquemas Zod en `src/lib/validators.ts`.

## 7. Rendimiento y Seguridad
- **Hidratación**: Solo hidratar lo necesario (`client:load`, `client:idle`).
- **RLS (Supabase)**: Mandatorio validar pertenencia de datos en cada Astro Action.
- **Localización**: 
  - **Moneda**: Peso Argentino (ARS). Formato: `$3.482,50`.
  - **Fecha**: `DD/MM/YYYY`. Hora: `24hs`.

---

## ✅ Checklist de Validación para Antigravity
Antes de dar por terminado un componente/tarea, verificá:
1. ¿Usa los tokens de `design-system.md` (rounded-3xl, lime-400)?
2. ¿Respeta el Atomic Design y el naming de archivos?
3. ¿El copy usa **voseo rioplatense** y **Sentence case**?
4. ¿Los textos están en `src/data/es/`?
5. ¿La lógica de mutación usa **Astro Actions**?
6. ¿Es accesible (ARIA labels inclusos)?
