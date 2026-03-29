# 🎨 Design System | MiGym

**Fuente única de verdad visual para MiGym.** Estética "Industrial Minimalist" de alto contraste, optimizada para gestión de gimnasios de barrio en Light Mode.

---

## 1. Identidad Visual: "Industrial Minimalist"

Estética clara, funcional y de alto rendimiento. Diseño orientado a:
- **Profesor:** Eficiencia operacional. Mucha data en poco espacio con jerarquía clara.
- **Alumno:** Motivación visual. Uso inteligente de contraste y tipografía fuerte.

### 1.1 Paleta de Colores Base (Shadcn Default Light Mode + Acentos)

**Variables CSS (Tailwind v4) en `src/styles/global.css`:**

```css
/* Light Mode (Shadcn Default) */
:root {
  --background: oklch(1 0 0);           /* Blanco puro */
  --foreground: oklch(0.145 0 0);       /* Casi negro */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);          /* Zinc muy oscuro/Negro */
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);         /* Gris clarito */
  --secondary-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325); /* Rojo */
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.87 0 0);
}
```

### 1.2 Paleta de Acentos (Industrial)

Además de los tokens de Shadcn, la identidad de MiGym usa combinaciones crudas e industriales:

| Uso | Tailwind Clases | Rol UI |
|-------|-----|-----|
| **Brand Accent** | `bg-lime-400`, `text-lime-500` | Acciones principales de conversión (crear plan, enviar), detalles visuales para romper con lo monocromático. |
| **Heavy UI** | `bg-zinc-950`, `text-zinc-950` | Botones secundarios pesados, headers, contenedores que requieren máximo contraste. |
| **Soft Backgrounds**| `bg-zinc-50`, `bg-zinc-100` | Fondos de tarjetas, input backgrounds, áreas contenidas. |

---

## 2. Tipografía

### 2.1 Familia Tipográfica

**Geist y Inter** (Por defecto, alta legibilidad técnica e impacto):
- Descarga/Uso: `https://fonts.googleapis.com/css2?family=Geist:wght@400;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
- Variantes necesarias: Regular (400), Medium (500), Bold (700), ExtraBold/Black (800/900).

**En `src/styles/global.css`:**

```css
@theme {
  --font-sans: "Inter", "Geist", system-ui, sans-serif;
  --font-heading: "Geist Sans", "Inter", system-ui, sans-serif;
}
```

### 2.2 Uso y Jerarquía

- **Headings (Títulos):** `font-heading font-extrabold` o `font-black`. Títulos de sección como "DASHBOARD", "CREAR PLAN", etc. (Suelen ir acompañados de `uppercase tracking-widest` para labels técnicos).
- **Cuerpo (Body/Inputs):** `font-sans font-medium` para alta legibilidad en números y textos instructivos.

---

## 3. Componentes Regulados

### 3.1 Anatomía del Botón MiGym

- **Primario (El más importante en la vista):** Fondo `bg-lime-400`, Texto `text-zinc-950 font-black uppercase tracking-widest`. Grande, pesado, invita al click.
- **Secundario Pesado (Heavy Secondary):** Fondo `bg-zinc-950`, Texto `text-white font-black uppercase tracking-widest`.
- **Outline (Acciones menores):** Borde `border-zinc-200`, Texto `text-zinc-400 font-bold uppercase` (cambia a oscuro en hover).
- **Forma:** Usamos bordes muy redondeados (`rounded-2xl` o `rounded-3xl` dependiendo del tamaño del botón/campo).

### 3.2 Componentes Shadcn/ui

| Componente | Uso en MiGym | Estilo Adicional |
|-----------|--------------|-------------------|
| **Button** | CTAs, acciones | Sobreescritos frecuentemente con Tailwind para el look Industrial. |
| **Card** | Contenedores de secciones | Bordes `rounded-3xl border-zinc-200`, sin sombra o `shadow-sm`. |
| **Dialog** | Modales y avisos | El mismo estándar de `global.css`. |
| **Input**| Formularios | Alta altura (`h-14` o `h-16`), borde claro, focus en `ring-0` pero `border-zinc-950` para un feeling "crudo". |
| **Label**| Etiquetas de inputs | `text-[10px] font-black uppercase tracking-widest text-zinc-400`. Estilo "Dashboard de avión". |

---

## 4. Spacing & Formas (Tokens fijos)

- **Bordes Muy Redondeados:** La estética prescinde de bordes duros.
  - Inputs, Botones y Tarjetas pequeñas: `rounded-2xl` (aprox 16px/24px)
  - Layouts, Modales, Tarjetas grandes: `rounded-3xl`
  - Elementos diminutos (badges, iconos pequeños): `rounded-xl`
- **Gaps y Espaciados:** Abundante espacio en blanco (`space-y-6`, `gap-4`) para evitar claustrofobia en móviles.

---

## 5. El "Gesto" de la App (Voice & Micro-interacciones)

1. **Feedback Visual Fuerte:** Botones activos que se sienten pesados o cambian a fondos oscuros dramáticos.
2. **Animaciones de Entrada:** Al avanzar de paso en forms, usar `animate-in slide-in-from-right-4 duration-300` para dar sensación de flujo direccional.
3. **Skeleton / Carga:** Los botones deben usar estados de "Cargando..." deshabilitando y oscureciendo el elemento para evitar dobles submits.

---

## 6. Documentación del SSOT (Single Source of Truth)

**Regla de Oro:** NUNCA quemar textos visuales (español) dentro de los componentes `.tsx` o `.astro`.
- El diseño debe mantenerse 100% separado de las palabras que el usuario lee.
- Todos los textos de interfaz habitan en `/src/data/es/`.

### Estructura SSOT:
```
src/data/es/
 ├── global.ts         // Palabras genéricas: "Guardar", "Cargando", "Volver"
 ├── profesor/
 │    └── planes.ts    // Textos específicos a la creación/edición de planes
 └── ...
```

---

**Última actualización:** Marzo 2026  
**Versión:** 2.0 (Industrial Minimalist Official)  
**Owner:** NODO Studio | MiGym