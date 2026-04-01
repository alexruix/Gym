# 🔧 Mejoras UX: Componente PlanForm

**Análisis de la imagen actual + propuestas de mejora (sin código)**

---

## 1. Problemas Identificados en Imagen Actual

### 🔴 CRÍTICO: Información Dispersa

```
AHORA (En la imagen):
┌────────────────────────────────────────────┐
│ CRONOGRAMA (izq)  │ CONFIGURACIÓN (der)   │
│ - Días 1-7 lista  │ - Nombre del plan     │
│ - Mini calendario │ - Duración (selector) │
│ - Confuso         │ - Frecuencia          │
│                   │ - Otros campos        │
│                                          │
│ Resultado: Professor se pierde            │
│ - ¿Por dónde empiezo?                     │
│ - ¿Dónde está el cronograma real?         │
│ - Demasiados inputs a la vez              │
└────────────────────────────────────────────┘

PROBLEMA: Profesor abruma por opciones
```

---

### 🟡 MEDIO: Cronograma Poco Intuitivo

```
ACTUAL:
┌────────────────────┐
│ DÍA 1 (foco)       │
│ DÍA 2              │
│ DÍA 3              │
│ DÍA 4              │
│ ... (7 más)        │
│ DÍA 11 (sem 2)     │
└────────────────────┘

PROBLEMA:
- Numeración confunde (Día 1 vs Día 1 semana 2)
- No ve "semanal" claramente (lunes-domingo)
- Scroll infinito (84 días = mucho scrolling)
- No sabe dónde está el fin de semana
```

---

### 🟡 MEDIO: Flujo No Lineal

```
PROFESOR ABRE:
1. Ve nombre, duración, frecuencia
2. ¿Próximo paso? Confuso
3. Ve "AÑADIR EJERCICIO" pero ¿dónde?
4. ¿Cómo copia un día a otra semana?

PROBLEMA: Falta guía de "qué hacer después"
```

---

### 🟡 MEDIO: Mobile Colapsado

```
ACTUAL (Mobile):
- Menu hamburguesa (abre sidebar)
- Cronograma en drawer (bien)
- Pero: Perders contexto al navegar
- No ve resumen mientras edita
```

---

### 🟢 BAJO: Validaciones No Claras

```
PROFESOR GUARDA:
- ¿Qué pasa si un día no tiene ejercicios?
- ¿Validación antes o después de guardar?
- ¿Mensajes de error dónde aparecen?
```

---

## 2. Flujo Ideal del Profesor

### Escenario Real

```
PROFESOR ABRE MIGYM:

1. VE ESTADO DEL PLAN (no inputs aún)
   ✓ Nombre: [editable pero secundario]
   ✓ Duración: 4 semanas
   ✓ Días activos: 3 (L, M, V)
   ✓ Total ejercicios: 12

2. ELIGE DÍA PARA TRABAJAR
   ✓ Calendar visual: L M M J V S D
   ✓ L (Lunes) = "Pecho" (si ya tiene nombre)
   ✓ Hoy: M (Miércoles)

3. AGREGA EJERCICIOS AL DÍA ACTUAL
   ✓ Click [+ AÑADIR EJERCICIO]
   ✓ Busca "Bench"
   ✓ Agrega
   ✓ Ve listado instantáneo

4. REPITE PARA OTROS DÍAS

5. REVISA RESUMEN FINAL

6. GUARDA
```

**Tiempo ideal: 15 minutos (no 45)**

---

## 3. Propuestas de Rediseño (Sin Código)

### PROPUESTA 1: Estructura de 3 Zonas

```
┌─────────────────────────────────────────────────────────┐
│                    TOP BAR                              │
│  [< Volver] "Diseñar nuevo plan" [?]                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────┐  ┌──────────────────────────────┐  │
│ │   COLUMNA IZQ   │  │   ZONA PRINCIPAL             │  │
│ │  (NAVEGACIÓN)   │  │  (EDICIÓN)                   │  │
│ │                 │  │                              │  │
│ │ RESUMEN RÁPIDO  │  │ DÍA ACTUAL: Lunes            │  │
│ │ ✓ 4 semanas     │  │ [Nombre editable]            │  │
│ │ ✓ 3 días/sem    │  │                              │  │
│ │ ✓ 12 ejercicios │  │ Ejercicios:                  │  │
│ │                 │  │ 1. Bench 4x8                 │  │
│ │ CALENDAR        │  │ 2. Incline 3x10              │  │
│ │ L M M J V S D   │  │ 3. Dips 3x8                  │  │
│ │ 1 2 3 4 5 6 7   │  │ (total: 3)                   │  │
│ │ 8 9 10...       │  │                              │  │
│ │ (click = cambiar) │ │ [+ AÑADIR EJERCICIO]        │  │
│ │                 │  │                              │  │
│ │ TABS POR SEMANA │  │ ─────────────────────────    │  │
│ │ [Sem 1] [Sem 2] │  │ HISTORIAL DE COPIAS          │  │
│ │ [Sem 3] [Sem 4] │  │ "Copiado a Sem 2 y 3"       │  │
│ │                 │  │ [Deshacer]                   │  │
│ │                 │  │                              │  │
│ └─────────────────┘  └──────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ FOOTER (Navegación día + Guardar)                       │
│ [< Día ant] Día 1/28 [Día sig >]  [GUARDAR PLAN]      │
└─────────────────────────────────────────────────────────┘
```

**Ventajas:**
- Resumen visible siempre
- Calendario intuitivo (L-D, 1-7)
- Zona principal clara (solo un día a la vez)
- Navegación fluida

---

### PROPUESTA 2: Mejor Nomenclatura (Lunes vs Día 1)

```
ACTUAL:
"Día 1" - Confunde (¿de qué?)

MEJOR:
"Lunes (Semana 1)" 
o
"L1" (Lunes, Semana 1)

VISUAL:
┌──────────────────────────────────────┐
│ CALENDARIO                           │
├──────────────────────────────────────┤
│                                      │
│ SEMANA 1                             │
│ [L] [M] [M] [J] [V] [S] [D]         │
│  1   2   3   4   5   6   7          │
│                                      │
│ SEMANA 2                             │
│ [L] [M] [M] [J] [V] [S] [D]         │
│  8   9  10  11  12  13  14          │
│                                      │
│ Hoy: Lunes Semana 1 (clic = cambiar) │
│                                      │
└──────────────────────────────────────┘
```

---

### PROPUESTA 3: Funcionalidad "Copiar Día a Semanas"

```
ACTUAL:
- Botón "Opciones de copia" confuso
- Abre dialog
- Selecciona semanas
- Guarda

MEJOR:
1. Profesor hace click en DÍA (ej: Lunes)
2. Ve botón [⚡ COPIAR A...] (hover visible)
3. Click
4. Aparece popup:
   ┌──────────────────────┐
   │ Copiar a otras sem   │
   ├──────────────────────┤
   │ ☑ Semana 2           │
   │ ☑ Semana 3           │
   │ ☑ Semana 4           │
   │                      │
   │ [Copiar] [Cancelar]  │
   └──────────────────────┘
5. Confirma
6. ✅ "Copiado a 3 semanas"
   [Deshacer] link visible
```

**Ventaja:** Inline, rápido, con undo

---

### PROPUESTA 4: Validaciones Visuales

```
ANTES (Sin validación clara):
Profesor agrega ejercicio
¿Queda bien? No sabe

DESPUÉS:
┌──────────────────────────────────────┐
│ Lunes (Semana 1)                     │
│                                      │
│ ✓ 3 Ejercicios             OK        │
│ ✓ Total ~40 min            OK        │
│ ✓ Ejercicios base + acessorios       │
│                                      │
│ Serie OK                             │
│ Reps OK                              │
│ Descanso OK                          │
│                                      │
│ [GUARDAR] está ENABLED (todo OK)     │
└──────────────────────────────────────┘

VERSUS si hay problema:

┌──────────────────────────────────────┐
│ Miércoles (Semana 2)                 │
│                                      │
│ ⚠️  0 Ejercicios             ERROR    │
│                                      │
│ [GUARDAR] está DISABLED              │
│ "Agrega al menos 1 ejercicio"        │
│                                      │
│ [+ AÑADIR EJERCICIO]                 │
└──────────────────────────────────────┘
```

---

## 4. Layout Mejorado (Mobile-First)

### Mobile (Current - OK, pero puede mejorar)

```
HEADER:
[☰ Menú] "Diseñar nuevo plan" [?]

CUERPO (Lo más importante):
─────────────────────────────
RESUMEN:
┌─────────────────────┐
│ 4 Semanas           │
│ 3 días/sem          │
│ 12 ejercicios       │
└─────────────────────┘

CALENDARIO (Tabbable):
[L] [M] [M] [J] [V]
1   2   3   4   5

ZONA DE EDICIÓN:
─────────────────────────────
"Lunes (Semana 1)"
[Editar nombre]

Ejercicios (3):
1. Bench 4x8 [Editar] [X]
2. Incline 3x10 [Editar] [X]
3. Dips 3x8 [Editar] [X]

[+ AÑADIR EJERCICIO]

FOOTER:
[< Ant] Día 1 [Sig >] [GUARDAR]
```

### Desktop (Mejorado)

```
┌─────────────────────────────────────────────────────┐
│ [< Volver] "Diseñar nuevo plan" [?]                │
├─────────┬─────────────────────────────────────────┤
│ SIDEBAR │ CONTENIDO PRINCIPAL                      │
│         │                                          │
│ RESUMEN │ ENCABEZADO:                              │
│ ✓ 4 sem │ Nombre del plan: [Editable]              │
│ ✓ 3 d/s │ Duración: 4 semanas                      │
│ ✓ 12 ej │ Frecuencia: 3 días/semana                │
│         │                                          │
│ CAL     │ SELECTOR DE DÍA:                         │
│ L M M J │ Semana 1: [L] [M] [M] [J] [V] [S] [D]   │
│ V S D   │ Semana 2: [L] [M] [M] [J] [V] [S] [D]   │
│ 1 2 3.. │ Semana 3: [L] [M] [M] [J] [V] [S] [D]   │
│         │ Semana 4: [L] [M] [M] [J] [V] [S] [D]   │
│ TABS    │                                          │
│ Sem 1   │ EDICIÓN (Lunes, Semana 1):               │
│ Sem 2   │ Nombre: [Pecho]                          │
│ Sem 3   │ Ejercicios: 3                            │
│ Sem 4   │ 1. Bench 4x8 [Editar] [X]                │
│         │ 2. Incline 3x10 [Editar] [X]            │
│         │ 3. Dips 3x8 [Editar] [X]                 │
│         │                                          │
│         │ [⚡ COPIAR A...] [+ AÑADIR]              │
│         │                                          │
└─────────┴─────────────────────────────────────────┤
│ FOOTER: [< Ant] Día 1/28 [Sig >] [GUARDAR]        │
└────────────────────────────────────────────────────┘
```

---

## 5. Mejoras en Componentes Específicos

### Mejora 1: Cronograma (Calendar)

```
ACTUAL:
Numeración confusa (Día 1, Día 2...)
Difícil saber qué es fin de semana

MEJOR:
┌─────────────────────────────────┐
│ SEMANA 1                        │
├─────────────────────────────────┤
│ L    M    M    J    V    S    D │
│ 1    2    3    4    5  [6]   7  │
│                        ↑        │
│               (Hoy, sábado)    │
│                                 │
│ SEMANA 2                        │
├─────────────────────────────────┤
│ L    M    M    J    V    S    D │
│ 8    9   10   11   12   13   14 │
│ ✓    ✓    ✓                      │ ← checkmarks = tiene ejercicios
│                                 │
└─────────────────────────────────┘

Click en número = cambiar a ese día
```

**Ventajas:**
- L-D es claro
- Números secuenciales
- Checkmarks muestran qué días tienen contenido
- Activo resaltado

---

### Mejora 2: Diálogo de Copiar

```
ACTUAL (desde código):
BulkActionDialog complejo

MEJOR:
┌──────────────────────────────────┐
│ Copiar Lunes (Sem 1) a...        │
├──────────────────────────────────┤
│                                  │
│ ☑ Semana 2                       │
│ ☑ Semana 3                       │
│ ☑ Semana 4                       │
│ (radio o checkbox)               │
│                                  │
│ ℹ️ "Copiará todos los ejercicios" │
│                                  │
│ [Cancelar] [Copiar]              │
│                                  │
└──────────────────────────────────┘

Si presiona [Copiar]:
Toast: "✅ Copiado a 3 semanas"
[Deshacer] visible 5 segundos
```

---

### Mejora 3: Agregar Ejercicio

```
ACTUAL:
Click verde [+ AÑADIR EJERCICIO]
Abre ExerciseSearchDialog
Busca
Agrega

MEJOR (Cambio UX):
┌──────────────────────────────────┐
│ Bench press     4x8              │
│ Incline DB      3x10             │
│ Dips            3x8              │
│ ──────────────────────────────── │
│ [+ Agregar otro ejercicio]       │
│                                  │
│ Al click:                        │
│ Input "Buscar ejercicio" aparece │
│ Debajo: sugerencias              │
│ ─────────────────────            │
│ Bench press                      │
│ Deadlift                         │
│ ...                              │
│                                  │
└──────────────────────────────────┘

Ventaja: Inline, sin dialog, más rápido
```

---

## 6. Flujo de Guardado

```
ANTES:
Profesor click [GUARDAR]
Si error: toast rojo
Confusión

DESPUÉS:
1. Profesor intenta guardar
2. Sistema valida EN VIVO mientras edita
3. Si hay problema: [GUARDAR] disabled + mensaje
4. Profesor ve qué arreglar
5. Arregla
6. [GUARDAR] se activa
7. Click
8. ✅ Toast: "Plan guardado"
9. Auto-redirect a /profesor/planes en 2 seg

Benefit: Cero sorpresas
```

---

## 7. Checklist de Mejoras por Prioridad

### 🔴 CRÍTICO (Cambiar UX Radicalmente)

- [ ] Reorganizar: Sidebar (resumen + calendar) | Main (edición)
- [ ] Calendar visual: L-D y números secuenciales
- [ ] Resumen visible siempre (no colapsado)
- [ ] Validación en vivo (no solo al guardar)

### 🟡 IMPORTANTE (Mejorar Flujo)

- [ ] Botón [⚡ COPIAR A...] inline (no en opciones)
- [ ] Agregar ejercicio inline (no dialog)
- [ ] Undo visible después de copiar
- [ ] Nomeclatura clara: "Lunes (Semana 1)" no "Día 1"

### 🟢 NICE-TO-HAVE (Polish)

- [ ] Checkmarks en calendar (días con ejercicios)
- [ ] Duración estimada por día (ej: "~40 min")
- [ ] Historial de cambios (undo/redo)
- [ ] Sugerencias rápidas (templates)

---

## 8. Comparación: Antes vs Después

```
MÉTRICA: Tiempo para crear plan 4 semanas, 3 días

ANTES (Actual):
Profesor abre
Confusión visual → 2 min
Entiende estructura → 3 min
Agrega ejercicios día 1 → 10 min
Copia a otras semanas → 5 min
Guarda → 2 min
TOTAL: ~22 minutos

DESPUÉS (Con mejoras):
Profesor abre
Ve resumen claro → 30 seg
Entiende: Lunes es Lunes → 30 seg
Click L (Semana 1) → 5 seg
Agrega ejercicios → 8 min
Click [⚡ COPIAR A...] → 30 seg
Selecciona Sem 2,3,4 → 10 seg
Guarda → 2 min
TOTAL: ~12 minutos (45% más rápido)

Ganancia: 10 minutos = MUCHO en UX
```

---

## 9. Prototipo de Secuencia (Step-by-Step)

```
PASO 1: Profesor abre
┌─────────────────────────────────┐
│ RESUMEN                         │
│ ✓ 4 Semanas                     │
│ ✓ 3 días/semana (calc)          │
│ ✓ 0 ejercicios (aún)            │
│                                 │
│ CALENDAR                        │
│ [L] [M] [M] [J] [V] [S] [D]   │
│  1   2   3   4   5   6   7     │
│                                 │
│ Hoy: Lunes (clic p/ cambiar)   │
└─────────────────────────────────┘

PASO 2: Click Lunes
┌─────────────────────────────────┐
│ LUNES, SEMANA 1                 │
│ [Nombre] = "Pecho"              │
│                                 │
│ Ejercicios: 0                   │
│ [+ Agregar ejercicio]           │
│                                 │
│ Validación: ⚠️ Sin ejercicios   │
│ [GUARDAR] deshabilitado         │
└─────────────────────────────────┘

PASO 3: Click [+ Agregar]
┌─────────────────────────────────┐
│ Buscar ejercicio:               │
│ [Bench] ← escribe               │
│                                 │
│ Sugerencias:                    │
│ • Bench press (muscle)          │
│ • Bench incline (secundary)     │
│ • Bench smith (similar)         │
│                                 │
│ Click "Bench press"             │
└─────────────────────────────────┘

PASO 4: Bench agregado
┌─────────────────────────────────┐
│ LUNES, SEMANA 1                 │
│ [Pecho]                         │
│                                 │
│ 1. Bench press 4x8              │
│    [Editar] [X]                 │
│ [+ Agregar otro]                │
│                                 │
│ Validación: ✓ 1 ejercicio       │
│ [GUARDAR] ahora HABILITADO      │
└─────────────────────────────────┘

PASO 5: Copia a otra semana
┌─────────────────────────────────┐
│ [⚡ COPIAR A...]                 │
│                                 │
│ ☑ Semana 2                      │
│ ☑ Semana 3                      │
│ ☑ Semana 4                      │
│ [Copiar]                        │
│                                 │
│ ✅ "Copiado a 3 semanas"         │
│ [Deshacer]                      │
└─────────────────────────────────┘

PASO 6: Guarda
┌─────────────────────────────────┐
│ [GUARDAR PLAN]                  │
│                                 │
│ ⚙️ Guardando...                  │
│                                 │
│ ✅ Plan creado exitosamente     │
│ Redirigiendo a /profesor/planes │
└─────────────────────────────────┘
```

---

## 10. Resumen de Cambios

### En el Código (Para Developer)

**No especificar detalles código, pero:**

1. **Reorganizar layout:** Sidebar siempre visible (desktop) + Sheet (mobile)
2. **Mejorar calendar:** Mostrar L-D, numeración, checkmarks
3. **Validación:** Computed en vivo, deshabilitar botón si hay error
4. **Agregar ejercicio:** Cambiar de dialog a inline (autocomplete)
5. **Copiar:** Modal simple con checkboxes

### En el UX (Lo Importante)

1. **Claridad:** Resumen + calendario = entiende estructura
2. **Velocidad:** Flujo lineal (día → ejercicios → copia → guarda)
3. **Seguridad:** Validación en vivo, undo visible
4. **Confianza:** Botones deshabilitados solo cuando es necesario

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0  
**Owner:** NODO Studio | MiGym  
**Próxima acción:** Feedback del código actual + Priorizarizar cambios