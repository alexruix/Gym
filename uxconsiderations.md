# UX Considerations — MiGym

> **Propósito:** Este archivo existe para evitar que el frontend esté bien escrito pero visualmente pobre.
> El código impecable no alcanza si el resultado en pantalla no convierte ni genera confianza.

---

## 1. El Problema que Este Archivo Soluciona

Podemos tener Atomic Design perfecto, SSOT prolijo, TypeScript sin errores, y aún así entregar
una landing que se vea como si fuera 2012. ¿Por qué pasa? Porque **el código y el diseño son
disciplinas distintas**. Este archivo actúa como checklist de diseño previo a la implementación.

**Regla de Oro:** Antes de tocar un componente, preguntarse:  
_"¿Si un usuario llega a esto en 3 segundos, entiende qué hace el producto y quiere probarlo?"_

---

## 2. Core Philosophy (Gestión Deportiva > Gestión Financiera)

MiGym es una herramienta para profesores y personal trainers. Su dolor principal es **armar rutinas y seguir el progreso**, el cobro es secundario (ya lo resuelven con MercadoPago/Efectivo).

- **Tablas y Filtros:** Priorizar filtros por "Plan" o "Objetivo" en lugar de "Estado de pago".
- **Llamados a la Acción (CTAs):** La acción principal siempre es "Editar Rutina" o "Ver Progreso", seguida de herramientas técnicas (Magic Link) o de comunicación (WhatsApp). "Registrar Pago" es útil pero no es la estrella.
- **Micro-interacciones de tabla:** Cada alumno debe tener un menú de acciones rápidas (Dropdown) que le permita al profesor resolver cualquier necesidad en 1 clic sin salir del Dashboard.

---

## 3. Jerarquía Visual (Lo más importante)

La jerarquía visual guía el ojo del usuario. Sin ella, todo se ve igual de importante → nada importa.

### Escala Tipográfica de Landing

| Elemento    | Tamaño         | Peso          | Propósito                          |
| ----------- | -------------- | ------------- | ---------------------------------- |
| H1 Hero     | `text-7xl/9xl` | `font-bold`   | Primer impacto, debe ser memorable |
| H2 Sección  | `text-4xl/6xl` | `font-bold`   | Ancla de cada sección              |
| H3 Card     | `text-xl/2xl`  | `font-bold`   | Jerarquía dentro de componentes    |
| Body        | `text-lg/xl`   | `font-medium` | Legible, sin competir con títulos  |
| Label/Badge | `text-xs`      | `font-bold`   | UPPERCASE + `tracking-widest`      |
| Caption     | `text-sm`      | `font-medium` | Metadata, secundaria               |

### Regla de los 3 Niveles

Cada sección debe tener exactamente 3 niveles visuales:

1. **El ancla** (título o número grande) → atrae el ojo
2. **El soporte** (subtítulo/descripción) → da contexto
3. **El detalle** (features/benefits list) → convence al ya interesado

---

## 3. Profundidad Visual (El problema del "fondo plano")

Una UI sin profundidad parece hecha en Word. La profundidad se crea con:

### Capas (Layering)

```
Capa 0 (fondo): gradiente suave o color sólido
Capa 1 (decorativa): blobs blur, grids, líneas sutiles → opacity 5-15%
Capa 2 (cards/contenido): con border + shadow bien definido
Capa 3 (CTAs/acciones): elemento de mayor contraste → atrae la acción
```

### Sombras que se Usan en el Proyecto

```css
/* Sutil — cards en reposo */
shadow-sm + border border-zinc-200

/* Media — cards en hover */
shadow-xl shadow-zinc-900/10

/* Fuerte — CTAs primarios */
shadow-2xl shadow-lime-500/20

/* Glow de Acento */
box-shadow: 0 0 40px rgba(from var(--color-lime-400) r g b / 0.3);
```

### Elementos Decorativos Obligatorios por Sección

Cada sección de landing DEBE tener al menos uno:

- `blur-3xl` blob en color de marca (opacity 10-20%)
- Grid de fondo (`bg-[url(...svg...)]` en opacity 30%)
- Línea/borde superior/inferior como separador de ritmo
- Número grande decorativo (`text-[200px]` en `opacity-5`)

---

## 4. Flujo de Conversión: Reglas por Sección

### Hero

- **Objetivo:** Capturar la atención en 3 segundos y comunicar el valor.
- **Must-have:** H1 con highlight de color acento, un subheadline que responda "¿para quién?", y 2 CTAs (primario oscuro + secundario outline).
- **Must-have visual:** Elemento hero que ancle (imagen/gráfico/mockup de producto). Un hero solo con texto es una oportunidad perdida.
- **Error común:** Subtítulo demasiado largo (>2 líneas) o demasiado genérico.

### Social Proof

- **Objetivo:** Eliminar el escepticismo inicial.
- **Must-have:** Logos reales o avatares. Los logos de texto simulados pierden credibilidad.
- **Formato recomendado:** `X gimnasios confían en MiGym` + logos en fila + número de reseñas.
- **Error común:** Tratar este bloque como decoración. Es la segunda cosa más importante de la landing.

### Features

- **Objetivo:** Explicar "cómo" resuelve el problema.
- **Must-have:** Cada feature tiene icono, título corto (<4 palabras) y descripción de beneficio (no de función).
- **Formato recomendado:** Grid 2x2 o 3 cards + 1 grande alternando imagen con texto.
- **Error común:** Describir _qué hace_ el sistema en lugar de _qué gana_ el usuario.
  - ❌ "Sistema de gestión de rutinas"
  - ✅ "Convertí tus excels en rutinas en 30 segundos"

### Testimonials

- **Objetivo:** Prueba social específica.
- **Must-have:** Nombre real, rol/empresa, foto o inicial con avatar + rating de estrellas si aplica.
- **Regla:** El quote debe mencionar un problema concreto que resolvió. Quotes genéricos no convierten.
- **Error común:** Solo 2 testimonios. El mínimo para credibilidad es 3.

### Pricing

- **Objetivo:** Eliminar la fricción del precio.
- **Must-have:** Precio claro, lista de features con checkmarks, garantía/política de cancelación, CTA.
- **Formato recomendado:** Card flotante con `shadow-2xl`, badge "más popular" y la sombra de glow de acento.
- **Error común:** No mostrar el precio (genera desconfianza) o no aclarar qué pasa si cancela.

### CTA Final

- **Objetivo:** Una última oportunidad de convertir al que llegó hasta acá.
- **Must-have:** Propuesta diferente al Hero CTA. Si arriba fue "Empezar", acá puede ser "Unite a X profesores".
- **Formato recomendado:** Fondo de alto contraste (lime-400 o zinc-950), copy emocional, un solo CTA grande.
- **Error común:** Repetir textualmente el Hero. El usuario que llegó hasta acá necesita otro ángulo.

---

## 5. Mobile-First: Reglas de Pulgar

```
──────────────────────────
  ZONA MUERTA (pulgar no llega)
  Header/Navbar - solo branding e icons
──────────────────────────
  ZONA CÓMODA
  Contenido principal - cards, texto, imágenes
──────────────────────────
  ZONA DEL PULGAR  ← CTAs y acciones AQUÍ
  px-6 pb-8 - botones siempre en el tercio inferior
──────────────────────────
```

- Los CTAs en mobile son `w-full`, nunca inline.
- El padding horizontal mínimo es `px-5` (20px).
- Los textos hero en mobile máximo `text-5xl`, nunca más.
- Touch targets mínimo `h-12` (48px). Preferido `h-14` o `h-16`.

---

## 6. Animaciones y Microinteracciones

### Regla General

Las animaciones deben ser **funcionales** (guiar la atención) o **de feedback** (confirmar una acción).
Nunca decorativas-sin-propósito.

### Tiempos Estándar del Proyecto

```css
/* Hover de UI */
transition-all duration-200

/* Cambio de sección / reveal */
transition-all duration-300

/* Entrada al viewport */
transition-all duration-500 delay-100/200/300 (escalonar por ítem)

/* Transición de página */
transition-all duration-700
```

### Must-Have por Componente

- **Cards:** `hover:-translate-y-1` + `hover:shadow-xl` — sensación de "flotación"
- **Botones primarios:** `active:scale-95` — feedback táctil inmediato
- **Íconos en botones:** `group-hover:scale-110` o rotación sutil
- **Reveal on scroll:** `animate-in fade-in slide-in-from-bottom-4 duration-500`

---

## 7. Checklist Pre-Entrega de Componente UI

Antes de dar una sección de landing por terminada:

- [ ] ¿Tiene los 3 niveles de jerarquía visual (ancla, soporte, detalle)?
- [ ] ¿Tiene al menos un elemento decorativo de profundidad (blob, grid, sombra)?
- [ ] ¿El CTA es visible sin hacer scroll dentro de la sección en mobile?
- [ ] ¿El texto describe **beneficios** del usuario, no **funciones** del sistema?
- [ ] ¿Las animaciones de hover están presentes en cards y botones?
- [ ] ¿En mobile, los CTAs son `w-full` y tienen `h-14` mínimo?
- [ ] ¿El contraste de texto cumple WCAG AA (4.5:1 para body, 3:1 para large text)?
- [ ] ¿Los números/stats tienen "ancla" visual grande si los hay?
- [ ] ¿Se usaron colores de la paleta del proyecto (lime/zinc)? ¿Sin valores arbitrarios?
- [ ] ¿Los íconos son de `lucide-react` con `aria-hidden="true"`?

---

## 8. Patrones Visuales Prohibidos

Estos patrones generan una UI de baja calidad:

| ❌ Anti-patrón                      | ✅ Solución                                       |
| ----------------------------------- | ------------------------------------------------- |
| Hero solo con texto                 | Agregar mockup/imagen/gráfico como elemento ancla |
| Logos de marcas en texto plano      | SVGs reales o no incluir el bloque                |
| Todos los fondos en el mismo color  | Alternar `bg-white / bg-zinc-50 / bg-zinc-950`    |
| Cards sin shadow ni border          | `border border-zinc-200 shadow-sm` como mínimo    |
| Grid de features sin íconos         | Ícono de `lucide-react` siempre en cada card      |
| Seccion sin separación visual       | `border-b border-zinc-100` o cambio de bg         |
| CTA sin microinteracción            | `hover:scale-105 active:scale-95` siempre         |
| Copy genérico ("solución integral") | Copy específico con número o resultado concreto   |

---

## 9. Referencia de Diseño: Trainer Studio → MiGym

Al analizar https://trainerstudio.com se identificaron los siguientes patrones de alta conversión:

| Patrón Trainer Studio                | Aplicación en MiGym                                   |
| ------------------------------------ | ----------------------------------------------------- |
| Hero con mockup de app               | Agregar screenshot/mockup del dashboard               |
| Stats numéricos (X usuarios, Y %)    | "500+ profesores", "85% menos tiempo en admin"        |
| Alternancia imagen+texto en features | Feature grande alternada con grid de cards            |
| Testimonials con foto de perfil      | Avatar con inicial en `bg-lime-500` hasta tener fotos |
| Pricing con guarantee text           | "Cancelás cuando querés. Sin contratos."              |
| Footer con social links              | Ya implementado en `Layout.astro`                     |

---

_Última actualización: Marzo 2026 — Landing Page v2.0 Refactor_
