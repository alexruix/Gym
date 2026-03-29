# 🏋️‍♂️ MiGym (Pivot: Sports Management)

**Dashboard minimalista e industrial para profesores y entrenadores.**  
Un sistema SaaS enfocado en la **gestión deportiva**, priorizando herramientas de prescripción de planes multidía y seguimiento técnico, resolviendo de yapa la cuestión financiera (pagos, vencimientos) de manera automatizada.

---

## 🚀 Filosofía del Proyecto

1. **Gestión Deportiva por sobre Finanzas:** El corazón de MiGym es facilitarle el día a día al profe. Herramientas complejas de periodización pero con UX de "videojuego": fluidas, visuales y sin fricción.
2. **Identidad "Industrial Minimalist":** Alto contraste (Zinc y Lime), interfaces limpias de estilo "dashboard de avión", priorizando tipografías fuertes (`Geist` e `Inter`) con pesos en extrabold (800) y mayúsculas espaciadas. Todo escrito en español rioplatense (voseo).
3. **Escalabilidad y Velocidad:** Rendimiento brutal con SSR y React Islands para que el profesor no tenga que esperar tiempos de carga, ideal para la operación de un gimnasio concurrido.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Astro 5, React (React Hook Form para estados complejos como Creadores de Planes).
- **Estilos:** Tailwind CSS v4, componentes Shadcn/ui (Radix), Animaciones nativas CSS. Iconos de `lucide-react`.
- **Backend & Auth:** Supabase (Auth passwordless con Magic Links, PostgreSQL con Row Level Security para protección de datos cross-tenant).
- **Validación:** Zod (Esquemas unificados para cliente y SSR).

---

## 📂 Arquitectura (Atomic Design + Astro Islands)

El proyecto sigue estrictamente el modelo de **Diseño Atómico** para garantizar la testabilidad y reutilización en UI:
- `/src/components/atoms/`: Botones básicos, badges de estado, avatares.
- `/src/components/molecules/`: Tarjetas de ejercicios, inputs de búsqueda complejos.
- `/src/components/organisms/`: Sectores interactivos enormes (Islands) como el `PlanForm` o la `ExerciseLibrary`.

Los textos del sistema NUNCA se hardcodean en los componentes; consumimos copys centralizados (*Single Source of Truth*) desde `/src/data/es/` asegurando el tono adecuado de comunicación.

---

## 🔑 Funcionalidades Principales

1. **Biblioteca de Ejercicios:**
   El profe crea su propia enciclopedia de movimientos, centralizando los datos técnicos en tarjetas dinámicas. Si no hay nada, el "*Empty State*" invita con un onboarding claro.

2. **Creador de Planes Multidía:**
   El profe no diseña series "planas". Aquí configura un *Master Plan* -> *Frecuencia (Tabs)* -> *Rutinas Diarias* -> *Ejercicios*. Todo mapeado vía Astro Actions e interactividad extrema de Pestañas con estado enlazado por array de diccionarios.

3. **Dashboard de Onboarding (Docente & Financiero):**
   - Vistas generales con métricas: alumnos inactivos, próximos vencimientos y morosos.
   - Listado rápido con acciones mediante *Dropdown Menus* (WhatsApp, Modificar Rutina, Registrar Pagos rápidos).

4. **Autenticación sin Contraseñas:**
   Fricción cero. Los alumnos o profes entran con Magic Link a su bandeja de entrada (PKCE Verification en Astro). Flujo de Onboarding segmentado.

---

## 📝 Documentación Interna

Este proyecto utiliza archivos Markdown de referencia como SSOT técnico para que todo el equipo (y futuros Devs/IA) sigan los mismos estándares:
* `architecture.md`: Diccionario de datos, ERD y flujogramas completos.
* `bestpractices.md`: Patrones autorizados en el código (RLS en Supabase, uso de Astro Slots).
* `design-system.md`: Reglas estéticas, bordes, tipografía y CSS tokens aprobados.
* `supabase.md`: Archivo maestro SQL con toda la estructura relacional y reglas de acceso cruzadas actualizadas.

---

## 🏗️ Cómo levantar el proyecto localmente

1. Clonar este repo e instalar dependencias con `npm install` (usar `npx astro check` siempre para validar tipado).
2. Crear variables `.env.local` con `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
3. Levantar dev server con `npm run dev`.

*Desarrollado con foco en velocidad y experiencia, pensando siempre en la "zona del pulgar" para la app móvil y en la eficiencia del escritorio del Profe.*
