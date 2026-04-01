# 🔬 Análisis Crítico: Rutinas Variables Semanales

**Propósito:** Validar que el enfoque está bien pensado antes de empezar a codificar.

---

## 1. Validación de Requisitos vs Solución

### 1.1 Lo que Dijo el Profesor

> "Las rutinas tienen variaciones semanalmente para que nadie en el mismo mes haga la misma rutina 2 veces, siempre cambia algún ejercicio accesorio."

**Interpretación nuestra:**
- ✅ Accesorios rotan cada 2-4 semanas
- ✅ Ejercicios principales fijos
- ❓ Rotación es en TODAS las sesiones de un grupo muscular, o solo en una?

**Ambigüedad 1:** ¿Qué es "accesorio"?

```
Opción A: 
Lunes: Bench (primary) + Incline (secondary) + Tricep dips (accesorio que rota)
```

---

> "Se van modificando según ausencias o feriados porque en vez de los dias él intenta meter grupos musculares en 2 días"

**Interpretación nuestra:**
- ✅ Variaciones por feriados/ausencias
- ✅ Reagrupamiento de grupos musculares
- ❓ El profesor decide esto
- ❓ Se aplica por alumno porque se modifica la rutina del alumno que falta o que no asiste por ser dia feriado

**Ambigüedad 2:** Alcance de variaciones

```
ESCENARIO: Gym cierra viernes

Opción A (Profesor por alumno):
Profesor puede crear variación POR ALUMNO
Ej: Juan solo puede entrenar lunes+miércoles → redistribuir su sesiones
```

---

### 1.2 Problemas Encontrados

#### 🔴 CRÍTICO: Rotación de Accesorios

**Pregunta:** ¿Cómo sabe el sistema CUÁL accesorio rotar?

Ejemplo:
```
PLAN: "Pecho"
Lunes:
  - Bench press 4x8
  - Incline dumbbell 3x10
  - Tricep dips 3x8

¿Cuál rota? ¿Solo Dips? ¿O Incline también?
```

**Nuestro documento dice:**
```
categoria: enum['primary', 'secondary', 'accesorio']
```

**Pero el profesor probablemente piensa:**
```
"Los ejercicios 1-2 son fijos (Bench, Incline)"
"El ejercicio 3 rota (dips vs rope vs cable)"
```

**Problema:** No es categoría global, es POSICIÓN en la sesión.

---

#### 🔴 CRÍTICO: Accesorios Diferentes Según Músculo

```
Lunes (Pecho + Tríceps):
Accesorio: Tricep dips (rota con rope pushdown)

Miércoles (Espalda + Bíceps):
Accesorio: Barbell curls (rota con machine curls)

¿Sistema detecta que son diferentes rotaciones?
¿O asume que TODOS los accesorios rotan con mismo ciclo?
```

**Nuestro documento es vago aquí:**
```
PLAN_ROTACIONES
├─ ejercicio_ids: ['tricep_dips', 'rope_pushdown', ...]
```

**Pero esto no captura:**
- Qué accesorios van juntos en rotación
- Cuáles son del mismo grupo muscular
- El ciclo específico

---

#### 🟡 MEDIO: Variaciones Nivel Plan vs Nivel Alumno

**Nuestro modelo:**
```
PLAN_VARIACIONES (tabla global)
└─ Se aplica a TODOS los alumnos en el plan
```

**Pero en realidad:**
```
Escenario 1: "Gym cierra viernes"
→ Todos los alumnos en Plan A sufren cambio

Escenario 2: "Juan falta miércoles"
→ Solo el plan de Juan cambia
(No es variación de plan, es personalización)
```
---

#### 🟡 MEDIO: Cuándo se Generan las Sesiones

```
Opción A (Current):
createStudent → generar todas las sesiones (4 semanas)

Opción B (More realistic):
createStudent → generar sesiones próximas 2 semanas
Profesor puede ajustar después

Opción C (Most flexible):
createStudent → generar 1 sesión a la vez
Profesor revisa antes de cada semana
```

**Problema:** Si plan tiene 4 semanas y profesor ajusta en semana 2, ya hay sesiones del 3-4 generadas.

¿Qué pasa si elimina una variación? ¿Se regeneran?

---

### 1.3 Casos Edge No Cubiertos

#### **Caso 1: Alumno se une a mitad de ciclo**

```
PLAN: Push/Pull/Legs, 4 semanas, accesorios rotan cada 2 sem

Profesor crea plan: Semana 1
Semana 1-2: Tricep dips
Semana 3-4: Rope pushdown

Alumno se agrega en Semana 3 ← ¿Qué accesorio ve?

Opción A: Ve rope pushdown (correcto ciclo)
Opción B: Ve dips (empezar del inicio)
Opcion C: Sistema pregunta "¿De qué semana empieza?"
```

**Nuestro documento no lo especifica.**

---

#### **Caso 2: Profesor edita plan DESPUÉS de generar sesiones**

```
Plan creado:
Semana 1-2: Dips
Semana 3-4: Rope

Profesor cambia a:
Semana 1: Dips
Semana 2: Rope
Semana 3: Dips
Semana 4: Rope

¿Sesiones ya creadas se recalculan?
¿O profesor tiene que regenerar todo?
```

---

#### **Caso 3: Alumno completa sesión con accesorio X, pero variación cambia a Y**

```
Lunes Semana 2: Completó "Tricep dips"
Profesor agrega variación: "Cambiar a Rope pushdown"

¿Sesión ya completada se "repara"?
¿Qué ve en progreso?
```

---

#### **Caso 4: Múltiples rotaciones en mismo día**

```
Lunes: Pecho + Tríceps
- Bench press (primary) → FIJO
- Incline DB (secondary) → Alterna cada 4 sem con DB incline alt
- Tricep dips (accesorio) → Rota cada 2 sem con rope

¿Sistema soporta 2 rotaciones en mismo día?
Nuestro modelo parece soportarlo, pero...
```

---

## 2. Complejidad Oculta Identificada

### 2.1 Generador de Sesiones

**Nuestro pseudo-código:**
```typescript
function resolverEjercicios(ejercicios_plan, rotaciones, semana) {
  return ejercicios_plan.map(ej => {
    if (ej.categoria === 'accesorio') {
      const rotacion = rotaciones.find(r => r.includes(ej.id));
      const indice = Math.floor((semana - 1) / rotacion.duracion) % rotacion.ejercicios.length;
      return rotacion.ejercicios[indice];
    }
    return ej;
  });
}
```

**Problemas:**

1. **`.find()` es frágil:** Si múltiples rotaciones incluyen mismo ejercicio, cuál gana?

2. **El ciclo `%` asume repetición infinita:**
```
Si plan = 4 sem, rotación = 3 sem
Semana 1: indice = 0 (ejer 1)
Semana 2: indice = 0 (ejer 1) ← repetido
Semana 3: indice = 1 (ejer 2)
Semana 4: indice = 1 (ejer 2) ← repetido

¿Es esto lo que quiere el profesor?
```

3. **No valida que rotación tiene suficientes ejercicios:**
```
Rotación con 2 ejercicios, duración 3 semanas
→ Qué sucede semana 4-6?
→ `% 2` vuelve a ciclo = repetición, pero ¿es intencional?
```

---

### 2.2 Tabla PLAN_ROTACIONES (Diseño Dudoso)

```typescript
{
  id: 'rot_123',
  plan_id: 'plan_1',
  tipo: 'accesorio_2sem',
  ejercicios: ['tricep_dips', 'rope_pushdown'],
  duracion: 2,
}
```

**Problemas:**

1. **¿`tipo` es redundante?**
```
Si ejercicios = ['A', 'B'] y duracion = 2
Tipo = 'accesorio_2sem' es inferible
¿Para qué guardarlo?
```

2. **¿Qué pasa si añado ejercicio 3?**
```
ejercicios: ['tricep_dips', 'rope_pushdown', 'cable_press']
Ahora es 3 ejercicios, pero duracion = 2

¿Ciclo es: sem1-2 (A), sem3-4 (B), sem5-6 (C)?
¿O: sem1-2 (A,B), sem3-4 (C)?
```

3. **Falta orden/prioridad:**
```
¿Rope pushdown es mejor que Tricep dips?
¿Debería progresar desde A → B → C?
¿O es aleatorio?
```

---

### 2.3 Tabla PLAN_VARIACIONES (Ajustes Ambiguos)

```typescript
{
  id: 'var_1',
  plan_id: 'plan_1',
  numero_semana: 3,
  ajustes: {
    "lunes": { accion: "mover_a", target_dia: "martes" },
    "viernes": { accion: "saltear" }
  },
  razon: "feriado"
}
```

**Problemas:**

1. **¿Acción "mover_a" es apto para todos los casos?**
```
Si lunes = 6 ejer, martes = 3 ejer
¿Cómo hago para meter 6 en 3 espacios?
Sistema debería permitir:
- "dividir_en" (split 6 ejer en 2 sesiones)
- "redistribuir" (repartir en toda la semana)
```

2. **¿Qué sucede con accesorios en variación?**
```
Lunes original: Bench, Incline, Tricep dips (v1)
Se mueve a Martes

¿Martes ya tiene sesión? ¿Sobreescribe?
¿Accesorios de Martes cambian también?
```

3. **No captura todas las intenciones del profesor:**
```
Profesor: "Mete Pecho+Tríceps y Espalda+Bíceps en Lunes+Martes"
(Reagrupamiento de grupos musculares)

Nuestro modelo puede hacer:
- Mover Lunes → Martes ✓
- Aber no "combinar Lunes + Viernes" ✗
```

---

## 3. Problemas en Implementación

### 3.1 RLS Policy para PLAN_VARIACIONES

```sql
-- Qué queremos:
PROFESOR puede crear/editar/deletar variaciones de SUS planes

-- La realidad:
CREATE POLICY "profesor_create_variation" ON plan_variaciones
  FOR INSERT WITH CHECK (
    plan_id IN (SELECT id FROM planes WHERE profesor_id = auth.uid())
  );

-- Pero luego:
CREATE POLICY "student_view_variation" ON plan_variaciones
  FOR SELECT USING (
    -- ¿Cómo sabe student que puede ver variación?
    -- Opción 1: A través de SESIONES que referencian variación
    -- Opción 2: A través de PLANES → ALUMNOS
    -- Ambas son queries complejas
  );
```

**Problema:** RLS para variaciones visibles a alumnos es compleja.

---

### 3.2 Migración de Datos

```
Planes viejos (sin categoría de ejercicio)
↓
¿Cómo sé cuál es accesorio?

Opción A: Automático
- Último ejercicio de cada sesión es accesorio
- (Asumido, puede estar mal)

Opción B: Manual
- Profesor debe revisar + marcar
- (Tedioso)

Opción C: Híbrido
- Sistema sugiere "estos parecen accesorios", profesor revisa
```

**Nuestro documento dice:** "Opción B (no fuerza, pero permite)"

**Pero es más complejo que eso:**
```
Si profesor ignora migración:
- Plan viejo sigue funcionando (sin rotaciones)
- Plan nuevo permite rotaciones
- ¿Cómo mezcla ambos tipos?

Versioning de planes puede ser necesario
```

---

### 3.3 Testing es Complejo

```
Escenarios que hay que testear:

1. Generar sesiones con rotación 2 sem
   → Verificar ciclo es correcto (sem 1-2 = A, 3-4 = B)

2. Generar sesiones con variación
   → Verificar sesiones se recalculan bien

3. Alumno se une a mitad de ciclo
   → Verificar accesorio está en fila correcta

4. Profesor edita plan después de crear sesiones
   → Verificar regeneración es correcta

5. Múltiples variaciones en mismo plan
   → No hay conflicto

6. Eliminar variación
   → Sesiones vuelven al original

7. Progreso: alumno hace A en sem 1, B en sem 3
   → Gráfica muestra ambos en línea de tiempo
```

**Cobertura necesaria: ~30+ tests**

---

## 4. Recomendaciones Antes de Codificar

### 4.1 ACLARAR CON PROFESOR (Preguntas Críticas)

#### **Pregunta 1: ¿Qué es "accesorio"?**

Mostrar ejemplo visual:
```
Lunes: Pecho + Tríceps

A) Bench (primary, fijo) | Incline (secondary, fijo) | Dips (accesorio, rota)

B) Bench (primary, fijo) | Incline (rota con alt dumbbell) | Dips (rota con rope)

C) Bench (primary, fijo) | Incline + Dips (ambos rotan juntos)
```

**Respuesta esperada:** "Opción A, los 2 últimos rotan"

---

#### **Pregunta 2: ¿Variaciones aplican a TODOS o a CADA ALUMNO?**

```
Plan: "Push/Pull/Legs"
Alumnos: Juan, María, Diego

Scenario: "Gym cierra viernes, mover Piernas a Jueves"

A) Variación global → TODOS ven cambio automático
B) Profesor crea variación, elige si aplicar a todos o solo algunos
C) Variación por alumno → Cada uno puede tener su ajuste
```

**Respuesta esperada:** "Opción A para feriados, Opción C para ausencias alumnos"

---

#### **Pregunta 3: ¿Ciclo de rotación es fijo o flexible?**

```
Plan 4 semanas
Rotación accesorios 2 semanas

Sem 1-2: Dips
Sem 3-4: Rope

¿Qué pasa si alumno hace plan de 8 semanas (2 ciclos)?
Sem 5-6: Dips (repite) ← ¿OK?
Sem 7-8: Rope (repite) ← ¿O debería agregar 3er accesorio?
```

---

#### **Pregunta 4: ¿Editabilidad en vivo?**

```
Plan creado hace 2 semanas
Semana 1-2: Ya pasaron
Semana 3-4: Vigentes
Semana 5-6: Futuro

Profesor quiere cambiar accesorios en sem 3-4

A) Sistema solo permite editar futuro (sem 5+)
B) Sistema permite editar, pero respeta lo ya completado
C) Sistema permite editar TODO, reasigna retroactivamente
```

---

### 4.2 REFACTORIZAR PROPUESTA

#### **Cambio 1: Renombrar "categoria"**

```typescript
// ANTES:
categoria: enum['primary', 'secondary', 'accesorio']

// MEJOR:
exercise_type: enum['base', 'complementary', 'accessory']
position: number // 1, 2, 3...
```

**Razón:** "Accesorio" es ambiguo. "position" es más claro (ejercicio 3 siempre rota).

---

#### **Cambio 2: Reestructurar PLAN_ROTACIONES**

```typescript
// ANTES:
{
  plan_id,
  tipo, // redundante
  ejercicios, // array plano
  duracion,
}

// MEJOR:
{
  plan_id,
  position: 3, // ejercicio en posición 3 (último) rota
  cycles: [
    { duration_weeks: 2, exercises: ['tricep_dips', 'rope_pushdown'] },
    { duration_weeks: 2, exercises: ['cable_press', 'machine_dips'] },
    // Permite múltiples ciclos sin repetición infinita
  ],
  applies_to_days: ['lunes', 'miercoles'], // en cuáles días aplica
}
```

**Ventajas:**
- Explícito qué posición rota
- Múltiples ciclos sin `% modulo`
- Claro a cuáles días aplica

---

#### **Cambio 3: Expandir PLAN_VARIACIONES**

```typescript
// ANTES:
{
  numero_semana,
  ajustes: { "lunes": { accion, target_dia } }
}

// MEJOR:
{
  numero_semana,
  tipo: enum['rest_day', 'move_day', 'redistribute', 'combine_days'],
  razon: enum['feriado', 'ausencia_alumno', 'personalización'],
  
  // Por tipo:
  // rest_day: { days: ['viernes'] }
  // move_day: { from_day: 'viernes', to_day: 'jueves' }
  // redistribute: { distribute_across: ['lunes', 'martes', 'miercoles'] }
  // combine_days: { days: ['lunes', 'martes'], new_structure: {...} }
  
  body_schema?: {...}, // Nueva distribución de grupos musculares
  aplicable_a: enum['todos', 'alumno_id'], // Global o por alumno
  profesor_nota: string,
}
```

---

#### **Cambio 4: Nueva tabla para variaciones a NIVEL ALUMNO**

```typescript
// Tabla nueva: STUDENT_PLAN_CUSTOMIZATIONS
{
  id,
  alumno_id,
  plan_id,
  numero_semana,
  ajustes: {...}, // Igual a PLAN_VARIACIONES
  razon: 'ausencia_personal',
  profesor_nota,
  created_at,
}
```

**Razón:** Variaciones globales (feriados) ≠ Variaciones personales (ausencias Juan)

---

### 4.3 SIMPLIFICAR SCOPE PARA MVP

**MVP v1.0 NO necesita:**
- ❌ Múltiples ciclos en misma rotación
- ❌ Reagrupamiento complejo (combine_days)
- ❌ Variaciones por alumno (solo global)
- ❌ Editar planes después de generar sesiones

**MVP v1.0 SÍ necesita:**
- ✅ Accesorios que rotan cada X semanas (2, 3, o 4)
- ✅ Variaciones globales (mover día entero)
- ✅ Tracking de qué accesorio hizo el alumno
- ✅ Progreso que detecta rotación

**Esto reduce de 25h a ~15h**

---

## 5. Validación de Casos de Uso

### 5.1 Caso: Profesor crea "Push/Pull/Legs"

```
INPUT:
├─ Lunes: Pecho + Tríceps
│  ├─ Bench 4x8 (base)
│  ├─ Incline 3x10 (complementary)
│  └─ Tricep dips 3x8 (accessory, rota cada 2 sem con rope)
│
├─ Miércoles: Espalda + Bíceps
│  ├─ Deadlift 4x6 (base)
│  ├─ Rows 4x8 (complementary)
│  └─ Barbell curls 3x8 (accessory, rota cada 2 sem con machine curls)
│
└─ Viernes: Piernas
   ├─ Squat 4x6 (base)
   ├─ Leg press 3x8 (complementary)
   └─ Leg curl 3x10 (accessory, fijo)

RESULTADO ESPERADO:
Sem 1-2: [Dips, Curls, Curl] ← accesorios v1
Sem 3-4: [Rope, Machine, Curl] ← accesorios v2 (leg curl no cambia)

VALIDACIÓN:
✅ Soporta múltiples rotaciones
✅ Soporta algunos fijos, otros rotan
✅ Rota según posición (accesorio = posición 3)
```

---

### 5.2 Caso: Profesor ajusta por feriado

```
PLAN: 4 semanas
Feriado: Gym cierra viernes semana 3

ACCIÓN: Profesor crea variación
├─ Semana 3
├─ Tipo: move_day
├─ From: viernes
├─ To: jueves
└─ Razon: feriado

RESULTADO:
Sem 1-2: L/M/V (normal)
Sem 3: L/M/J (viernes movido a jueves)
Sem 4: L/M/V (normal de nuevo)

VALIDACIÓN:
✅ Sesiones se regeneran
✅ Accesorios mantienen su ciclo (sem 3-4 es v2)
✅ Alumno ve "⚠️ Sesión movida a jueves"
```

---

## 6. Checklist de Pulido Final

### ANTES de codificar

#### **Requisitos**
- [ ] Aclarar exactamente qué es "accesorio" con profesor
- [ ] Confirmar: ¿variaciones son global o por alumno?
- [ ] Definir: ¿se pueden editar planes después de generar sesiones?
- [ ] Decidir: ¿MVP incluye reagrupamiento de músculos?

#### **Diseño de Datos**
- [ ] Renombrar `categoria` → `exercise_type` + `position`
- [ ] Reestructurar `PLAN_ROTACIONES` con `cycles[]` explícito
- [ ] Expandir `PLAN_VARIACIONES` con tipos claros
- [ ] Crear tabla separada para variaciones por alumno (future, no MVP)
- [ ] Revisar RLS policies (especialmente para student view variation)

#### **Generador de Sesiones**
- [ ] Cambiar lógica de `%` por búsqueda explícita en `cycles[]`
- [ ] Validar que rotación tiene suficientes ejercicios para duración
- [ ] Documentar edge case: "alumno se une a mitad de ciclo"
- [ ] Tests: mínimo 20 casos cubiertos

#### **UI/UX**
- [ ] Componentes: Solo create/edit para MVP (no delete variaciones)
- [ ] SessionTracker: mostrar qué número de ciclo es ("Semana 1 del ciclo")
- [ ] /alumno/progreso: gráfica que detecta rotación (2 líneas vs 1)
- [ ] Validación: imposibilitar editar plans después de N alumnos asignados

#### **Documentación Interna**
- [ ] Diagrama visual de cómo genera sesiones
- [ ] Explicar ciclos: ejemplos 2, 3, 4 semanas
- [ ] RLS policies documentadas
- [ ] Casos edge documentados

#### **Testing**
- [ ] Unit: resolverEjercicios() con 10+ casos
- [ ] Integration: crear plan → generar → variar → verificar
- [ ] E2E: profesor flujo completo (crear + variar + alumno ve cambio)

---

## 7. Plan de Implementación Refactorizado

### **FASE 1A: Modelo Simplificado (3h)**
- [ ] Tables: PLAN_EJERCICIOS, PLAN_ROTACIONES (versión simple), PLAN_VARIACIONES (versión simple)
- [ ] Migrations
- [ ] RLS basics

### **FASE 1B: Generador (4h)**
- [ ] Algoritmo resolverEjercicios() mejorado
- [ ] Función generateSessions()
- [ ] Tests exhaustivos (15+ casos)

### **FASE 2: Variaciones (3h)**
- [ ] API: createVariation, regenerateWeek
- [ ] Logic: aplicar variación a sesiones

### **FASE 3: UI Profesor (2h)**
- [ ] VariationManager: create, view (no edit/delete MVP)
- [ ] Validaciones Zod

### **FASE 4: UI Alumno (2h)**
- [ ] SessionTracker: detecta accesorio + ciclo
- [ ] Mi Plan: muestra variaciones con badge ⚠️

### **FASE 5: Progreso (2h)**
- [ ] Query: getProgressionMultipleExercises (detecta rotación)
- [ ] Gráfica que muestra A y B en línea de tiempo

### **FASE 6: Testing & Docs (2h)**
- [ ] E2E happy path
- [ ] Documentación

**Total: 18h (vs 25h original)**

---

## 8. Riesgos Identificados

| Riesgo | Severidad | Mitigación |
|--------|-----------|-----------|
| Mal-interpretación "accesorio" | 🔴 Crítico | **Aclarar CON profesor antes de codificar** |
| Rotación infinita con `%` es confusa | 🟡 Medio | **Refactorizar a `cycles[]` explícito** |
| RLS para variaciones es compleja | 🟡 Medio | **Documentar bien, tests RLS** |
| Alumno se une a mitad de ciclo | 🟡 Medio | **Documentar comportamiento, tests** |
| Testing exhaustivo necesario | 🟡 Medio | **Planeár 20+ tests desde inicio** |
| Migración de datos complicada | 🟢 Bajo | **MVP: planes nuevos, legacy sin cambios** |

---

## 9. Conclusión

### ✅ Está bien pensado PERO:

1. **Requiere aclaraciones críticas** con profesor antes de codificar
2. **Necesita refactoring en diseño de datos** (cycles, tipos de variación)
3. **Testing exhaustivo es obligatorio** (20+ casos)
4. **Simplificar scope MVP** a lo esencial (rotar accesorios + variaciones globales)

### 🚀 Recomendación

**NO EMPEZAR a codificar hasta:**
1. ✅ Aclarar exactamente qué es accesorio
2. ✅ Confirmar alcance de variaciones
3. ✅ Refactorizar tablas (cycles[], tipos)
4. ✅ Documentar edge cases
5. ✅ Hacer prueba de concepto con generador

**Tiempo estimado de aclaraciones:** 1-2 horas con profesor

**Ganancia:** Evitar refactoring a mitad de desarrollo

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0  
**Owner:** NODO Studio | MiGym  
**Próxima acción:** Aclarar con profesor + Refactorizar propuesta