# 🎨 Design System | MiGym

**Fuente única de verdad visual para MiGym.** Estética "Industrial Minimalist" de alto contraste, optimizada para gestión de gimnasios de barrio en Light Mode.

---

## 1. Identidad Visual: "Industrial Minimalist"

Estética clara, funcional y de alto rendimiento. Diseño orientado a:
- **Profesor:** Eficiencia operacional. Mucha data en poco espacio con jerarquía clara.
- **Alumno:** Motivación visual. Uso inteligente de contraste y tipografía fuerte.

### 1.1 Paleta de Colores Base (Zinc Refinado OKLCH)

**Variables CSS (Tailwind v4) en `src/styles/global.css`:**

```css
:root {
  --color-zinc-50: oklch(0.985 0.001 0);
  --color-zinc-100: oklch(0.97 0.001 0);
  --color-zinc-200: oklch(0.922 0.001 0);
  --color-zinc-400: oklch(0.765 0.004 0);
  --color-zinc-500: oklch(0.556 0.005 0);
  --color-zinc-900: oklch(0.145 0.001 0);
  --color-zinc-950: oklch(0.082 0 0);

  /* Acento MiGym */
  --color-lime-400: oklch(0.865 0.19 144.978);
  
  /* Status Colors */
  --color-success: oklch(0.627 0.194 149.214);
  --color-warning: oklch(0.769 0.188 70.08);
  --color-error: oklch(0.577 0.245 27.325);
}
```

### 1.2 Tokens Semánticos (Standard MiGym)

| Token | Variable CSS | Uso |
|-------|--------------|-----|
| `ui-label` | `--color-zinc-500` | Labels técnicos (font-black, tracking-[0.4em]). |
| `ui-muted` | `--color-zinc-400` | Textos secundarios/descripciones. |
| `ui-soft` | `--color-zinc-50` | Fondos de superficie sutiles. |
| `ui-accent`| `--color-lime-400`| Branding / CTAs. |

---

## 2. Tipografía

### 2.1 Familia Tipográfica

**Geist e Inter**:
- Headings: `font-heading` (Geist). Peso: `font-black`.
- Body: `font-sans` (Inter/Geist). Peso: `font-medium`.

### 2.2 Uso y Jerarquía (v2.5)

- **Headings Técnicos:** No usamos cursivas. El impacto viene del peso `font-black` y el `tracking-tighter`.
- **Labels Industriales:** Siempre `uppercase` con `tracking-[0.4em]`.

---

## 3. Componentes Regulados (SSOT)

### 3.1 Layout y Contenedores
| Clase CSS | Descripción |
|-----------|-------------|
| `.industrial-dialog` | Modales premium (rounded-3xl, shadow, no border). |
| `.industrial-card` | Cards principales (**rounded-3xl**, border, shadow). |
| `.industrial-card-glass`| Variante Alumno: backdrop-blur-2xl + bg-zinc-900/60. |
| `.industrial-section-container` | Contenedor de grupo de campos (rounded-3xl, bg soft). |

### 3.2 Formularios y Acciones
| Clase CSS | Descripción |
|-----------|-------------|
| `.industrial-input` | Inputs h-14, rounded-2xl, bg-zinc-100. |
| `.industrial-button-premium`| El botón con "glow" (solo en Dark Mode / Alumno). |
| `.industrial-action-btn` | h-14 rounded-2xl, tracking-widest, uppercase. |

### 3.3 Tipografía de Sistema
| Clase CSS | Descripción |
|-----------|-------------|
| `.industrial-title-xl` | Títulos principales (text-4xl, font-black, NO italic). |
| `.industrial-label` | Label técnico (text-[10px], font-black, tracking-[0.4em]). |

### 3.4 Status & Utilities
| Clase CSS | Descripción |
|-----------|-------------|
| `.industrial-alert-success` | Alertas de éxito (rounded-2xl, success colors). |
| `.industrial-spinner` | Loader animado estandarizado. |
| `.industrial-divider` | Línea divisoria estándar. |

---

**Última actualización:** Abril 2026  
**Versión:** 2.5 (Unified Industrial — 3xl Borders & Unified OKLCH)  
**Owner:** NODO Studio | MiGym