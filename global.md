@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark \*));

/_ ============================================================================
MIGYM DESIGN SYSTEM v2.0
Industrial Accessible Design — Optimized for Tailwind v4
============================================================================ _/

/\* ────────────────────────────────────────────────────────────────────────────

1.  TYPOGRAPHY SYSTEM
    ──────────────────────────────────────────────────────────────────────────── \*/

@theme {
/_ Font families: Geist for all (neutral, geometric, accessibility-first) _/
--font-sans: "Geist", "Inter", system-ui, -apple-system, sans-serif;
--font-mono: "Geist Mono", "Fira Code", monospace;

/_ Spacing scale: 4px base unit _/
--spacing-4: 1rem;
--spacing-8: 2rem;
--spacing-12: 3rem;
--spacing-16: 4rem;
--spacing-20: 5rem;
}

/_ ──────────────────────────────────────────────────────────────────────────── 2. COLOR TOKENS (OKLCH - Perceptually Uniform)
──────────────────────────────────────────────────────────────────────────── _/

:root {
/_ ── Primarios: Neutrales (Zinc Refinado) ──────────────────────────────── _/
--color-white: oklch(1 0 0);
--color-black: oklch(0.145 0 0);

/_ ── Grises de Base (Zinc Palette) ──────────────────────────────────────── _/
--color-zinc-50: oklch(0.985 0.001 0);
--color-zinc-100: oklch(0.97 0.001 0);
--color-zinc-200: oklch(0.922 0.001 0);
--color-zinc-300: oklch(0.890 0.002 0);
--color-zinc-400: oklch(0.765 0.004 0);
--color-zinc-500: oklch(0.556 0.005 0);
--color-zinc-600: oklch(0.424 0.007 0);
--color-zinc-700: oklch(0.290 0 0);
--color-zinc-800: oklch(0.210 0.001 0);
--color-zinc-900: oklch(0.145 0.001 0);
--color-zinc-950: oklch(0.082 0 0);

/_ ── Accent: Lime (Verde Energético - MiGym Brand) ──────────────────────── _/
--color-lime-400: oklch(0.865 0.19 144.978);
--color-lime-500: oklch(0.822 0.191 145.026);
--color-lime-600: oklch(0.745 0.166 144.798);

/_ ── Semánticos: Status Colors ──────────────────────────────────────────── _/
--color-success: oklch(0.577 0.245 27.325); /_ Green _/
--color-warning: oklch(0.688 0.206 48.305); /_ Orange _/
--color-error: oklch(0.577 0.245 27.325); /_ Red _/
--color-info: oklch(0.525 0.209 248.721); /_ Blue _/

/_ ── UI Foundation Colors ──────────────────────────────────────────────── _/
--background: var(--color-white);
--foreground: var(--color-black);
--card: var(--color-white);
--card-foreground: var(--color-black);
--popover: var(--color-white);
--popover-foreground: var(--color-black);

/_ ── Interactive Colors ─────────────────────────────────────────────────── _/
--primary: var(--color-black);
--primary-foreground: var(--color-white);
--secondary: var(--color-zinc-100);
--secondary-foreground: var(--color-black);

/_ ── UI Layers ─────────────────────────────────────────────────────────── _/
--muted: var(--color-zinc-100);
--muted-foreground: var(--color-zinc-500);
--accent: var(--color-lime-400);
--accent-foreground: var(--color-black);

/_ ── Borders & Inputs ──────────────────────────────────────────────────── _/
--border: var(--color-zinc-200);
--input: var(--color-zinc-200);
--ring: var(--color-zinc-300);

/_ ── Radius Scale (Rounded Corners) ────────────────────────────────────── _/
--radius: 0.5rem;
}

/_ ──────────────────────────────────────────────────────────────────────────── 3. DARK MODE OVERRIDES
──────────────────────────────────────────────────────────────────────────── _/

.dark {
--background: var(--color-zinc-950);
--foreground: var(--color-zinc-50);
--card: var(--color-zinc-900);
--card-foreground: var(--color-zinc-50);
--popover: var(--color-zinc-900);
--popover-foreground: var(--color-zinc-50);

--primary: var(--color-white);
--primary-foreground: var(--color-black);
--secondary: var(--color-zinc-800);
--secondary-foreground: var(--color-zinc-50);

--muted: var(--color-zinc-800);
--muted-foreground: var(--color-zinc-400);

--border: var(--color-zinc-800);
--input: var(--color-zinc-800);
--ring: var(--color-zinc-700);
}

/_ ──────────────────────────────────────────────────────────────────────────── 4. TAILWIND THEME INTEGRATION
──────────────────────────────────────────────────────────────────────────── _/

@theme inline {
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-card: var(--card);
--color-card-foreground: var(--card-foreground);
--color-popover: var(--popover);
--color-popover-foreground: var(--popover-foreground);
--color-primary: var(--primary);
--color-primary-foreground: var(--primary-foreground);
--color-secondary: var(--secondary);
--color-secondary-foreground: var(--secondary-foreground);
--color-muted: var(--muted);
--color-muted-foreground: var(--muted-foreground);
--color-accent: var(--accent);
--color-accent-foreground: var(--accent-foreground);
--color-border: var(--border);
--color-input: var(--input);
--color-ring: var(--ring);

/_ Semantic tokens para fácil referencia _/
--color-ui-label: var(--color-zinc-600); /_ Labels de UI _/
--color-ui-muted: var(--color-zinc-500); /_ Texto secundario _/
--color-ui-soft: var(--color-zinc-50); /_ Backgrounds suaves _/
--color-ui-accent: var(--color-lime-400); /_ Accent principal _/

/_ Radius variants _/
--radius-xs: calc(var(--radius) - 6px);
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
--radius-2xl: calc(var(--radius) + 8px);
--radius-3xl: calc(var(--radius) + 12px);
}

/_ ──────────────────────────────────────────────────────────────────────────── 5. BASE LAYER RESET & DEFAULTS
──────────────────────────────────────────────────────────────────────────── _/

@layer base {

- {
  @apply border-border outline-ring/50;
  }

html {
@apply scroll-smooth;
}

body {
@apply bg-background text-foreground;
font-family: var(--font-sans);
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
font-family: var(--font-sans);
@apply font-bold tracking-tight;
}

h1 { @apply text-4xl; }
h2 { @apply text-3xl; }
h3 { @apply text-2xl; }
h4 { @apply text-xl; }
h5 { @apply text-lg; }
h6 { @apply text-base; }

p {
@apply leading-relaxed;
}

a {
@apply transition-colors outline-none;
}

button {
@apply outline-none transition-all;
}

input, textarea, select {
@apply outline-none transition-colors;
}

/_ Selection styling _/
::selection {
@apply bg-accent text-accent-foreground;
}
}

/_ ──────────────────────────────────────────────────────────────────────────── 6. COMPONENT LAYER — Industrial Design System
──────────────────────────────────────────────────────────────────────────── _/

@layer components {
/_ ══════════════════════════════════════════════════════════════════════════
MODALS & DIALOGS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-dialog {
@apply rounded-3xl p-0 gap-0 overflow-hidden
bg-background dark:bg-card
border-none shadow-2xl relative;
}

.industrial-dialog-header {
@apply px-8 py-6 border-b border-border flex items-center justify-between;
}

.industrial-dialog-title {
@apply text-xl font-bold tracking-tight text-foreground;
}

.industrial-dialog-content {
@apply px-8 py-6 space-y-4;
}

/_ ══════════════════════════════════════════════════════════════════════════
CARDS & CONTAINERS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-card {
@apply rounded-2xl px-6 py-5
bg-card dark:bg-card
border border-border dark:border-border
hover:border-foreground dark:hover:border-accent
shadow-sm hover:shadow-lg
transition-all duration-300
flex items-center gap-4;
}

.industrial-card-md {
@apply rounded-3xl px-6 py-6
bg-card dark:bg-card/50
border border-border dark:border-border
hover:shadow-xl
transition-all duration-500
animate-in fade-in slide-in-from-bottom-2;
}

.industrial-card-lg {
@apply rounded-3xl px-8 py-8
bg-card dark:bg-card
border border-border dark:border-border
shadow-sm hover:shadow-2xl
transition-all duration-300;
}

.industrial-card-ghost {
@apply p-12 border-2 border-dashed border-border
dark:border-border/50
rounded-3xl
flex flex-col items-center justify-center space-y-4
cursor-pointer
hover:border-foreground dark:hover:border-accent
transition-all text-muted-foreground
select-none;
}

.industrial-section-container {
@apply bg-muted/30 dark:bg-muted/10
p-6 sm:p-8
rounded-3xl
border border-border dark:border-border/50
space-y-8
transition-all
hover:bg-muted/50 dark:hover:bg-muted/20
hover:shadow-xl
duration-500;
}

/_ ══════════════════════════════════════════════════════════════════════════
FORM INPUTS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-input {
@apply h-14 px-5 py-3
bg-muted/50 dark:bg-muted
border border-input dark:border-input
rounded-2xl
text-sm font-medium
placeholder:text-muted-foreground
transition-all duration-200
focus:ring-2 focus:ring-accent/50 focus:border-accent
focus:bg-card
dark:focus:border-accent
disabled:opacity-50 disabled:cursor-not-allowed;
}

.industrial-input-lg {
@apply h-16 px-6 py-4
bg-muted/50 dark:bg-muted
border border-input dark:border-input
rounded-2xl
text-base font-medium
placeholder:text-muted-foreground
transition-all duration-200
focus:ring-2 focus:ring-accent/50 focus:border-accent
focus:bg-card
dark:focus:border-accent;
}

.industrial-textarea {
@apply px-5 py-3
bg-muted/50 dark:bg-muted
border border-input dark:border-input
rounded-2xl
text-sm font-medium
placeholder:text-muted-foreground
transition-all duration-200
focus:ring-2 focus:ring-accent/50 focus:border-accent
focus:bg-card
dark:focus:border-accent
resize-vertical;
}

.industrial-select {
@apply h-14 px-5 py-3
bg-card dark:bg-card
border border-border dark:border-border
rounded-2xl
text-sm font-medium
transition-all duration-200
focus:ring-2 focus:ring-accent/50
focus:border-accent;
}

/_ ══════════════════════════════════════════════════════════════════════════
BUTTONS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-button {
@apply h-12 px-6 py-2.5
bg-primary text-primary-foreground
border border-primary
rounded-2xl
font-bold text-sm uppercase tracking-widest
transition-all duration-200
hover:scale-105 active:scale-95
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100;
}

.industrial-button-outline {
@apply h-12 px-6 py-2.5
bg-transparent
border border-border
text-foreground
rounded-2xl
font-bold text-sm uppercase tracking-widest
transition-all duration-200
hover:bg-muted hover:border-foreground
dark:hover:border-accent
active:scale-95
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
disabled:opacity-50 disabled:cursor-not-allowed;
}

.industrial-button-ghost {
@apply h-10 px-4 py-2
bg-transparent text-foreground
border border-transparent
rounded-lg
font-medium text-xs
transition-all duration-200
hover:bg-muted hover:border-border
active:scale-95
focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent;
}

.industrial-button-muted {
@apply h-10 px-4 py-2
bg-muted dark:bg-muted
border border-border dark:border-border
text-muted-foreground hover:text-foreground
rounded-xl
transition-all duration-200
hover:bg-border dark:hover:bg-border
hover:scale-105 active:scale-95;
}

.industrial-button-sm {
@apply h-9 px-4 py-1.5
bg-primary text-primary-foreground
border border-primary
rounded-lg
font-semibold text-xs
transition-all duration-200
hover:scale-105 active:scale-95
disabled:opacity-50 disabled:cursor-not-allowed;
}

/_ ══════════════════════════════════════════════════════════════════════════
ICON BOXES
══════════════════════════════════════════════════════════════════════════ _/

.industrial-icon-box {
@apply w-16 h-16
rounded-3xl
bg-primary dark:bg-primary
border border-primary dark:border-primary
flex items-center justify-center
shrink-0
text-primary-foreground
shadow-lg
transition-all duration-300
group-hover:scale-110 group-hover:border-accent;
}

.industrial-icon-box-sm {
@apply w-10 h-10
rounded-xl
bg-muted dark:bg-muted
border border-border dark:border-border
flex items-center justify-center
text-foreground
transition-all duration-200
hover:bg-border dark:hover:bg-border
group-hover:scale-110;
}

/_ ══════════════════════════════════════════════════════════════════════════
TYPOGRAPHY UTILITIES
══════════════════════════════════════════════════════════════════════════ _/

.industrial-label {
@apply text-xs font-bold uppercase tracking-widest text-muted-foreground;
}

.industrial-label-lg {
@apply text-sm font-bold uppercase tracking-wide text-foreground;
}

.industrial-metadata {
@apply text-[10px] font-semibold uppercase tracking-widest text-muted-foreground;
}

.industrial-description {
@apply text-sm font-normal text-muted-foreground leading-relaxed;
}

.industrial-title {
@apply text-2xl font-bold tracking-tight text-foreground;
}

.industrial-title-lg {
@apply text-3xl sm:text-4xl font-bold tracking-tighter text-foreground uppercase;
}

.industrial-subtitle {
@apply text-lg font-semibold text-muted-foreground;
}

/_ ══════════════════════════════════════════════════════════════════════════
TABS & NAVIGATION
══════════════════════════════════════════════════════════════════════════ _/

.industrial-tab-trigger {
@apply px-6 py-2.5
rounded-xl
text-xs font-bold uppercase tracking-wider
transition-all duration-200
outline-none
data-[state=active]:bg-card data-[state=active]:border-border
data-[state=active]:text-foreground
data-[state=active]:shadow-sm
dark:data-[state=active]:bg-card
text-muted-foreground
hover:text-foreground
border border-transparent
hover:border-border;
}

.industrial-nav-link {
@apply inline-flex items-center gap-2
text-xs font-bold uppercase tracking-widest
text-muted-foreground
hover:text-foreground
transition-colors duration-200;
}

/_ ══════════════════════════════════════════════════════════════════════════
BADGES & TAGS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-badge {
@apply inline-flex items-center gap-1.5
px-3 py-1.5
rounded-full
text-xs font-bold uppercase tracking-wider
bg-muted dark:bg-muted
text-muted-foreground
border border-border dark:border-border;
}

.industrial-badge-accent {
@apply inline-flex items-center gap-1.5
px-3 py-1.5
rounded-full
text-xs font-bold uppercase tracking-wider
bg-accent/10 dark:bg-accent/10
text-accent dark:text-accent
border border-accent/30 dark:border-accent/30;
}

.industrial-badge-success {
@apply inline-flex items-center gap-1.5
px-3 py-1.5
rounded-full
text-xs font-bold uppercase tracking-wider
bg-success/10
text-success
border border-success/30;
}

.industrial-badge-warning {
@apply inline-flex items-center gap-1.5
px-3 py-1.5
rounded-full
text-xs font-bold uppercase tracking-wider
bg-warning/10
text-warning
border border-warning/30;
}

.industrial-badge-error {
@apply inline-flex items-center gap-1.5
px-3 py-1.5
rounded-full
text-xs font-bold uppercase tracking-wider
bg-error/10
text-error
border border-error/30;
}

/_ ══════════════════════════════════════════════════════════════════════════
DIVIDERS & SEPARATORS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-divider {
@apply h-px bg-border dark:bg-border w-full;
}

.industrial-divider-vertical {
@apply w-px bg-border dark:bg-border h-full;
}

/_ ══════════════════════════════════════════════════════════════════════════
ALERTS & STATUS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-alert {
@apply rounded-2xl border border-border
bg-card dark:bg-card
px-6 py-4
flex gap-4 items-start;
}

.industrial-alert-success {
@apply rounded-2xl border border-success/30
bg-success/10 dark:bg-success/5
px-6 py-4
flex gap-4 items-start
text-success;
}

.industrial-alert-warning {
@apply rounded-2xl border border-warning/30
bg-warning/10 dark:bg-warning/5
px-6 py-4
flex gap-4 items-start
text-warning;
}

.industrial-alert-error {
@apply rounded-2xl border border-error/30
bg-error/10 dark:bg-error/5
px-6 py-4
flex gap-4 items-start
text-error;
}

/_ ══════════════════════════════════════════════════════════════════════════
LOADERS & SPINNERS
══════════════════════════════════════════════════════════════════════════ _/

.industrial-spinner {
@apply inline-block animate-spin
w-6 h-6
border-2 border-current border-t-transparent
rounded-full;
}

.industrial-spinner-sm {
@apply inline-block animate-spin
w-4 h-4
border-2 border-current border-t-transparent
rounded-full;
}
}

/_ ──────────────────────────────────────────────────────────────────────────── 7. UTILITIES LAYER
──────────────────────────────────────────────────────────────────────────── _/

@layer utilities {
/_ Scrollbar hiding _/
.hide-scrollbar::-webkit-scrollbar {
display: none;
}

.hide-scrollbar {
-ms-overflow-style: none;
scrollbar-width: none;
}

/_ Focus visible alternative _/
.focus-ring {
@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent;
}

/_ Transitions presets _/
.transition-smooth {
@apply transition-all duration-300 ease-out;
}

.transition-fast {
@apply transition-all duration-200 ease-out;
}

.transition-slow {
@apply transition-all duration-500 ease-out;
}

/_ Backdrop effects _/
.backdrop-blur-lg {
backdrop-filter: blur(12px);
}

/_ Text truncation _/
.truncate-2 {
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
}

.truncate-3 {
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
}

/_ Grid utilities _/
.grid-auto-fit {
@apply grid auto-cols-fr gap-4;
}

.grid-cols-fluid {
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/_ Aspect ratios _/
.aspect-square {
@apply aspect-square;
}

.aspect-video {
@apply aspect-video;
}

/_ Shadows presets _/
.shadow-sm-soft {
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.shadow-md-soft {
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.shadow-lg-soft {
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
}

/_ ──────────────────────────────────────────────────────────────────────────── 8. RESPONSIVE BREAKPOINTS
──────────────────────────────────────────────────────────────────────────── _/

@media (max-width: 640px) {
.industrial-dialog-header,
.industrial-dialog-content {
@apply px-6;
}

.industrial-title-lg {
@apply text-2xl;
}

.industrial-section-container {
@apply p-4 sm:p-6;
}
}

/_ ──────────────────────────────────────────────────────────────────────────── 9. PRINT STYLES (Opcional)
──────────────────────────────────────────────────────────────────────────── _/

@media print {
body {
@apply bg-white text-black;
}

.no-print {
@apply hidden;
}
}
