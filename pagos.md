# 💰 Diseño de Pantalla: `/profesor/pagos`

**Principio:** Resolver los problemas reales del profesor con gestión de cuotas. **Sin código, pensemos en el usuario primero.**

---

## 1. Problema Real del Profesor

### Lo Que Hace Hoy (Manualmente)

```
LUNES 9 AM:
Abre:
  - Excel: "Pagos_marzo.xlsx"
  - WhatsApp
  - Cuaderno
  
Proceso:
1. "¿Juan pagó?" → Busca en Excel → No → Envía msg WhatsApp
2. "¿María está al día?" → Busca en cuaderno → Sí → ✓
3. "¿Diego debe?" → Memoria + cálculo mental
4. Fin: Confusión. Pierde 1 hora.

PROBLEMA: 
- Datos en 3 lugares diferentes
- Imposible saber quién debe en 30 segundos
- Olvida recordarles a morosos
```

### Qué Debería Pasar (Con MiGym)

```
LUNES 9 AM:
Abre MiGym
Ve en 5 segundos:
  ✅ María: Pagada
  ⚠️  Juan: Vence mañana (recordar)
  ❌ Diego: Vencido hace 5 días (URGENTE)

Con 1 click:
  - Envía recordatorio a Juan + Diego
  - Genera reporte de deuda
  - Exporta Excel para contador

Tiempo: 5 min. Claridad: 100%.
```

---

## 2. Necesidades del Profesor

### A. VER de un Vistazo

```
El profesor necesita responder RÁPIDO:

"¿Quién pagó?"
"¿Quién vence pronto?"
"¿Cuánto me deben en total?"
"¿Quiénes son morosos?"
```

**Sin buscar. Sin navegar. En la pantalla principal.**

---

### B. RECORDAR Automáticamente

```
Hoy es 15/04 (vence día 15)
Profesor NO tiene que hacer nada

Sistema automático:
- Día 8: Alerta "Se acerca vencimiento de Juan"
- Día 15: Alerta "Juan vence HOY"
- Día 16: Alerta "Juan está vencido" + proponer recordatorio

Profesor solo: Click [Recordar a Juan]
Sistema: Envía email + WhatsApp (futuro)
```

---

### C. IMPORTAR Datos Viejos

```
Profesor tiene Excel con:
- Nombre, Email, Monto, Día de pago

Hoy: Copia nombre en MiGym, luego email, luego monto = tedioso

Futuro:
- Descarga template Excel
- Llena 4 columnas
- Click [Importar]
- Sistema pregunta: "¿Estos datos son correctos?"
- 10 segundos: todo cargado
```

---

### D. CONTROLAR Pagos

```
"Marqué a Juan como 'pagado' hace 1 semana"
"¿Cuándo fue exactamente?"
"¿Cuál fue el monto?"
"¿Nota del pago?"

NECESITA: Historial completo, editable si es error.
```

---

### E. REPORTAR

```
"Mi contador me pide reporte de ingresos marzo"
"¿Cuántos alumnos pagaron? ¿Cuánto en total?"
"Necesito Excel con nombre + fecha + monto"

NECESITA: 1 click para exportar.
```

---

## 3. Estados de Pago (Visuales)

### Los 4 Estados Principales

```
✅ PAGADO
   Cuota cobrada ≤ hoy
   Color: Verde
   Icono: Check
   Ej: "Pagado el 15/04"

⏰ POR VENCER (< 7 DÍAS)
   Vencimiento próximo
   Color: Ámbar
   Icono: ⏰
   Ej: "Vence mañana" o "Vence en 3 días"

❌ VENCIDO
   Hoy > día de pago
   Color: Rojo
   Icono: X
   Ej: "Vencido hace 5 días"

⚪ NO ASIGNADO / SIN PLAN
   Alumno sin plan o sin día de pago definido
   Color: Gris
   Icono: ?
   Ej: "Sin plan asignado"
```

---

## 4. Estructura de Pantalla: Layout Jerárquico

### 4.1 Zona Superior: Resumen de Golpe

```
┌─────────────────────────────────────────────┐
│ 💰 Pagos (Marzo 2024)                       │
├─────────────────────────────────────────────┤
│                                             │
│  Total Activos: 48 alumnos                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✅ 32 Pagados                       │   │
│  │ ⏰ 8 Por vencer                     │   │
│  │ ❌ 7 Vencidos                       │   │
│  │ ⚪ 1 Sin asignar                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💵 Ingresos esperados: $15.240            │
│  💵 Ingresos cobrados: $12.800             │
│  📊 Cobranza: 84%                          │
│                                             │
│  [Filtrar] [Exportar Excel] [Importar]     │
│                                             │
└─────────────────────────────────────────────┘
```

**Información que Ve:**
- Totales absolutos (32 vs 8 vs 7)
- Porcentaje de cobranza
- Dinero esperado vs real
- CTAs principales (filtrar, exportar, importar)

---

### 4.2 Zona Media: Alertas + Acciones Urgentes

```
┌─────────────────────────────────────────────┐
│ 🚨 ACCIÓN REQUERIDA HOY                    │
├─────────────────────────────────────────────┤
│                                             │
│ ❌ 7 Alumnos Vencidos (actuar YA)           │
│                                             │
│  1. Diego López          Vencido hace 10d   │
│     Debe: $800           [Recordar] [Ver]   │
│                                             │
│  2. Ana Martínez         Vencido hace 5d    │
│     Debe: $600           [Recordar] [Ver]   │
│                                             │
│  3. Carlos Ruiz          Vencido hace 2d    │
│     Debe: $400           [Recordar] [Ver]   │
│                          ... (4 más)        │
│                                             │
│  [Recordar a TODOS vencidos] [Ver todos]    │
│                                             │
└─────────────────────────────────────────────┘
```

**Qué Hay:**
- Orden: Vencidos más viejos primero (urgencia)
- Nombre + días vencido + monto
- CTAs rápidas: [Recordar] [Ver detalles]
- Opción batch: recordar a todos de una vez

---

### 4.3 Zona Principal: Tabla de Alumnos

```
┌─────────────────────────────────────────────────────────┐
│ LISTADO COMPLETO DE ALUMNOS                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Filtro: [Todos ▼] [Pagados] [Por vencer] [Vencidos]   │
│         [Sin asignar]                                  │
│                                                         │
│ Búsqueda: [Escribi nombre]                             │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ NOMBRE         | PLAN      | PAGO  | ESTADO | ACCIONES
│ ├─────────────────────────────────────────────────────┤│
│ │ ✅ Juan García  | 3 días    | $400  | Pagado | [Ver]
│ │                                    | 15/04  |      │
│ │                                                     │
│ │ ⏰ María López  | 2 días    | $300  | Vence  | [Ver]
│ │                                    | en 2d  |      │
│ │                                                     │
│ │ ❌ Diego S.    | Full body | $500  | Vencid | [Ver]
│ │                                    | o 3d   |      │
│ │                                                     │
│ │ ⚪ Laura R.    | SIN PLAN  | —     | Sin    | [Ver]
│ │                                    | asignar|      │
│ │                                                     │
│ │ ... (44 más)                                        │
│ │                                                     │
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Mostrando 1-4 de 48                   [Cargar más]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Qué Tiene:**
- Filtros rápidos (estado)
- Búsqueda por nombre
- Tabla clara: nombre, plan, monto, estado, acciones
- Icono de estado en cada fila
- Paginación/lazy load (no 48 de una vez)

---

### 4.4 Modal/Drawer: Ver Detalles de 1 Alumno

```
┌──────────────────────────────┐
│ Juan García                  │
│ Plan: Push/Pull/Legs (3d)    │
├──────────────────────────────┤
│                              │
│ 💳 INFORMACIÓN DE PAGO       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              │
│ Monto: $400/mes              │
│ Día de pago: 15 del mes      │
│ Estado: ✅ Pagado            │
│ Fecha pago: 15/04/2024       │
│ Nota: "Pagó completo"        │
│                              │
│ 📜 HISTORIAL (últimos 3 m)   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              │
│ Abril:    ✅ Pagado 15/04    │
│ Marzo:    ✅ Pagado 14/03    │
│ Febrero:  ✅ Pagado 15/02    │
│                              │
│ 🔧 ACCIONES                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                              │
│ [Marcar como pagado]         │
│ [Cambiar monto]              │
│ [Cambiar día de pago]        │
│ [Agregar nota]               │
│ [Enviar recordatorio]        │
│ [Ver alumno en dash]         │
│                              │
│ [Cerrar]                     │
│                              │
└──────────────────────────────┘
```

**Qué Muestra:**
- Información de pago clara
- Historial de últimos meses
- Acciones posibles
- Editable si hay error

---

## 5. Flujos de Trabajo

### Flujo 1: Marcar Alumno como Pagado

```
PROFESOR ABRE APP:

1. Ve tabla con "⏰ María por vencer en 2d"
   ↓
2. Click [Ver] en María
   ↓
3. Modal abre, ve:
   - Monto: $300
   - Día de pago: 15
   - Estado: Por vencer
   ↓
4. Profesor recibe pago en el gym
   ↓
5. Click [Marcar como pagado]
   ↓
6. Sistema pregunta: "¿Fecha del pago?"
   - Default: Hoy
   - Profesor puede cambiar
   ↓
7. Sistema pregunta: "¿Monto recibido?"
   - Default: $300 (del plan)
   - Profesor puede ajustar si pagó $250
   ↓
8. Sistema pregunta: "¿Nota?"
   - "Pagó en efectivo"
   - Opcional
   ↓
9. Click [Guardar]
   ↓
10. ✅ Toast: "María marcada como pagada"
    Vuelve a listado
    María ahora aparece en ✅ Pagados
```

**Detalles importantes:**
- Rápido: 10 segundos
- Información capturada: fecha, monto, nota
- Confirmación visual inmediata
- Editable después si hay error

---

### Flujo 2: Enviar Recordatorio a Moroso

```
PROFESOR EN LA MAÑANA:

1. Ve zona de "Acción Requerida"
   ❌ Diego vencido hace 10 días
   ↓
2. Click [Recordar]
   ↓
3. Sistema muestra:
   📧 Email: diego@email.com
   📱 WhatsApp: +54 9 11 2345-6789
   
   Mensaje sugerido:
   "Hola Diego, tu cuota venció hace 10 días.
    Monto: $800. Por favor regulariza.
    Gracias. [Profesor]"
   
   ☐ Permitir editar mensaje
   ↓
4. Opciones:
   [Enviar Email] [Enviar WhatsApp] [Ambos]
   ↓
5. Confirmación:
   ✅ "Recordatorio enviado a Diego"
   
6. Sistema anota:
   - Fecha del recordatorio
   - Medio (email/whatsapp)
   - Nota interna: "Recordado 22/04"
```

**Detalles importantes:**
- Mensaje templado pero editable
- Opción de email + WhatsApp (futuro)
- Queda registro en historial del alumno
- Profesor puede ver cuándo recordó

---

### Flujo 3: Importar Excel de Pagos Viejos

```
PROFESOR TIENE EXCEL:
- Columna A: Nombres
- Columna B: Email
- Columna C: Monto
- Columna D: Día de pago

PASO 1: Descargar Template
────────────────────────────
1. Click [Importar]
2. Sistema muestra:
   "¿Tienes datos de pagos en Excel?"
   [Sí, tengo archivo]
   ↓
3. Click [Descargar template]
   ↓
4. Archivo "pagos_template.xlsx"
   Abre en Excel del profesor
   
   Tiene 4 columnas ejemplo:
   ┌─────────────────────────┐
   │ Nombre | Email | Monto | Día
   │ Juan   | ...   | 400   | 15
   │ María  | ...   | 300   | 20
   └─────────────────────────┘

PASO 2: Llenar Datos
────────────────────────────
5. Profesor copia sus datos
   (o llena 4 columnas)
   
   Guarda: "mis_pagos.xlsx"

PASO 3: Importar en MiGym
────────────────────────────
6. Click [Importar] de nuevo
7. Sistema muestra:
   "Selecciona tu archivo Excel"
   [Explorar archivo]
   ↓
8. Profesor elige "mis_pagos.xlsx"
   ↓
9. Sistema procesa:
   ⚙️ "Leyendo archivo..."
   
10. Sistema muestra PREVIEW:
    ┌──────────────────────────┐
    │ Estos datos se importarán │
    ├──────────────────────────┤
    │ ✅ Juan García           │
    │    Email: juan@...       │
    │    Monto: $400           │
    │    Día: 15               │
    │                          │
    │ ✅ María López           │
    │    Email: maria@...      │
    │    Monto: $300           │
    │    Día: 20               │
    │                          │
    │ ⚠️  Diego Sánchez        │
    │    ❌ Email no válido    │
    │    Monto: $500           │
    │    Día: 25               │
    │                          │
    │ 2 OK, 1 advertencia      │
    └──────────────────────────┘
    
    [Volver] [Importar igualmente]
    
    ℹ️ Nota: "Diego tendrá email vacío.
           Edítalo después manualmente."
    ↓
11. Click [Importar]
    ↓
12. ✅ Toast: "Importados 3 alumnos"
    
    Vuelve a listado
    Ahora ve a Juan, María, Diego en tabla
```

**Detalles importantes:**
- Template descargable
- Preview antes de confirmar
- Detecta errores (emails inválidos)
- Permite importar parcial si hay warning
- Queda anotado el cambio

---

### Flujo 4: Filtrar + Exportar Reporte

```
PROFESOR NECESITA REPORTE PARA CONTADOR:

1. En pantalla de pagos, usa filtro:
   [Filtro: Pagados ▼]
   ↓
2. Tabla muestra solo ✅ Pagados
   32 alumnos
   ↓
3. Click [Exportar Excel]
   ↓
4. Sistema pregunta:
   "¿Qué deseas exportar?"
   
   ☑ Nombre
   ☑ Email
   ☑ Monto
   ☑ Fecha de pago
   ☑ Plan
   
   [Aceptar]
   ↓
5. Sistema genera:
   "pagos_marzo_2024.xlsx"
   
   Con columnas:
   Nombre | Email | Monto | Fecha pago | Plan
   Juan   | ...   | $400  | 15/04      | PPL
   María  | ...   | $300  | 20/04      | Push/Pull
   
   Totales al pie:
   32 alumnos | $12.800 | Cobranza: 84%
   ↓
6. Descarga automática
   ✅ "Reporte descargado"
```

**Detalles importantes:**
- Exporta según filtro activo
- Elige qué columnas exportar
- Incluye totales/summary
- Fecha en nombre del archivo

---

## 6. Estados Visuales (No Código, Puro UX)

### 6.1 Estados por Alumno

```
PAGADO (✅ Verde)
┌─────────────────────────────┐
│ Juan García        ✅        │
│ Push/Pull/Legs | $400 | Pagado
│                              │
│ Detalles: Pagado el 15/04    │
└─────────────────────────────┘
Acción posible: Editar, ver historial
Sensación: Tranquilo, hecho


POR VENCER (⏰ Ámbar)
┌─────────────────────────────┐
│ María López        ⏰        │
│ 2 días | $300 | Vence mañana │
│                              │
│ [Recordar] [Marcar pagado]   │
└─────────────────────────────┘
Acción posible: Recordar ahora o esperar
Sensación: Atención requerida pronto


VENCIDO (❌ Rojo)
┌─────────────────────────────┐
│ Diego Sánchez      ❌        │
│ 10 días | $500 | ¡Vencido!  │
│                              │
│ [RECORDAR URGENTE] [Marcar]  │
└─────────────────────────────┘
Acción posible: Recordar AHORA o marcar como pagado
Sensación: Urgencia, actuar ya


SIN ASIGNAR (⚪ Gris)
┌─────────────────────────────┐
│ Laura Rodríguez    ⚪        │
│ SIN PLAN | — | Incompleto    │
│                              │
│ [Asignar plan] [Editar]      │
└─────────────────────────────┘
Acción posible: Asignar plan o definir pago
Sensación: Necesita configuración
```

---

### 6.2 Estados de Importación

```
SIN IMPORTAR (Default)
┌──────────────────────┐
│ 📥 Importar Datos    │
│                      │
│ Carga tus alumnos    │
│ desde Excel fácil    │
│                      │
│ [Descargar template] │
│ [Subir archivo]      │
└──────────────────────┘


PROCESANDO
┌──────────────────────┐
│ ⚙️  Procesando...     │
│                      │
│ Leyendo "pagos.xlsx" │
│ Validando datos...   │
│ [████████░░] 80%     │
│                      │
└──────────────────────┘


CON PREVIEW (Antes de confirmar)
┌──────────────────────────────┐
│ ✅ 32 alumnos listos         │
│ ⚠️  2 advertencias           │
│ ❌ 0 errores                 │
│                              │
│ [Ver detalles]               │
│ [Volver] [Importar]          │
└──────────────────────────────┘


POST-IMPORTACIÓN
┌──────────────────────────────┐
│ ✅ 32 alumnos importados     │
│                              │
│ Vista previa:                │
│ - Juan García (pagado)       │
│ - María López (por vencer)   │
│ - ...                        │
│                              │
│ [Ver en listado completo]    │
└──────────────────────────────┘
```

---

## 7. Información + Notificaciones Automáticas

### 7.1 Alertas Proactivas (Sin que profesor haga nada)

```
DÍA 8 (vence el 15):
Notificación: "Juan García vence en 7 días"
Acción sugerida: Nada aún

DÍA 14 (vence mañana):
Notificación: "María López vence MAÑANA"
Acción sugerida: Recordarle hoy

DÍA 15 (día de vencimiento):
Notificación: "Diego Sánchez vence HOY"
Acción sugerida: Recordar hoy mismo

DÍA 16 (ya vencido):
Notificación: "4 alumnos vencidos"
Acción sugerida: Recordar urgente
```

### 7.2 Datos que Sistema Recuerda

```
Para cada pago, guarda:
- Alumno
- Monto
- Día de pago (del mes)
- Fecha cuando se marcó pagado
- Quién lo marcó (profesor)
- Nota del profesor
- Historial completo (cuándo se recordó, cuándo pagó)
```

---

## 8. Reportes y Exportación

### 8.1 Reportes Posibles

```
1. COBRANZA DEL MES
   Período: Marzo 2024
   
   Total alumnos activos: 48
   Cobrados: 32
   Por vencer: 8
   Vencidos: 7
   Sin plan: 1
   
   Ingresos esperado: $15.240
   Ingresos cobrado: $12.800
   Cobranza %: 84%
   
   Deuda: $2.440

2. MOROSOS (Vencidos hace > 30 días)
   Diego Sánchez - $500 (vencido 40d)
   Carlos Ruiz - $400 (vencido 35d)
   Total morosos: $900

3. HISTORIAL INDIVIDUAL
   Alumno: Juan García
   
   Marzo 2024: Pagado $400 (15/03)
   Febrero 2024: Pagado $400 (14/02)
   Enero 2024: Pagado $400 (15/01)
   
   Puntualidad: 100%

4. INGRESOS POR PLAN
   Push/Pull/Legs (8 alumnos): $3.200
   Full Body (12 alumnos): $3.600
   Funcional (15 alumnos): $3.750
   Otros: $2.250
```

### 8.2 Formatos de Exportación

```
[Exportar como Excel]
[Exportar como PDF]
[Enviar por email]
[Compartir link (futuro)]
```

---

## 9. Casos de Uso Real

### Caso 1: "Es Lunes de Mañana"

```
ANTES (sin MiGym):
6:00 AM: Profesor despierta
6:30 AM: Abre 3 archivos diferentes
7:00 AM: Sigue sin saber quién debe
8:00 AM: Perdió 1 hora, confundido

CON MIGYM:
6:00 AM: Abre app
6:01 AM: Ve en pantalla:
  - ✅ 32 pagaron
  - ⏰ 8 vencen pronto
  - ❌ 7 morosos
  
6:02 AM: Click [Recordar a todos vencidos]
Sistema envía 7 recordatorios

6:03 AM: Profesor sigue con su día tranquilo

Ganancia: 57 minutos, 100% claridad
```

---

### Caso 2: "Importar Base de Datos Vieja"

```
ANTES:
- Copia nombre a MiGym
- Copia email
- Copia monto
- Copia día de pago
- Para 48 alumnos = 2 horas

CON MIGYM:
1. Descarga template
2. Pega 48 alumnos en Excel (5 min)
3. Click [Importar]
4. Confirma preview (2 min)
5. Done

Ganancia: 1h 53 min automáticamente
```

---

### Caso 3: "Profesor Necesita Reporte"

```
ANTES:
- Abre Excel
- Cuenta manualmente: 32 pagados, 8 por vencer, 7 vencidos
- Calcula suma: $12.800
- Copia en Word
- Envía a contador

CON MIGYM:
1. Aplica filtro [Pagados]
2. Click [Exportar Excel]
3. Descarga archivo listo
4. Envía a contador

Ganancia: 30 minutos + cero errores
```

---

## 10. Integraciones Futuras (v1.1)

```
✅ Email recordatorios
⏳ WhatsApp recordatorios
⏳ Stripe/MercadoPago (cobro automático)
⏳ QR para pagar
⏳ Reporte automático cada mes
⏳ Dashboard de "Cobrados vs Esperado" gráfico
```

---

## 11. Checklist de Diseño (Sin Código)

### Información Visible

- [ ] Total de alumnos activos
- [ ] Desglose: Pagados / Por vencer / Vencidos / Sin asignar
- [ ] Dinero esperado vs cobrado
- [ ] % de cobranza
- [ ] Lista de vencidos (ordenada por antigüedad)

### Acciones Rápidas

- [ ] [Marcar como pagado]
- [ ] [Enviar recordatorio]
- [ ] [Importar Excel]
- [ ] [Exportar reporte]
- [ ] [Filtrar por estado]

### Información Detallada (Por Alumno)

- [ ] Nombre + email + plan
- [ ] Monto + día de pago
- [ ] Estado actual + fecha
- [ ] Historial últimos 3 meses
- [ ] Editable: monto, día, nota

### Flujos Clave

- [ ] Ver detalles → Marcar pagado (2 clicks)
- [ ] Importar Excel (3 pasos con preview)
- [ ] Enviar recordatorio (2 clicks)
- [ ] Exportar reporte (2 clicks)

---

## 12. Principios de Diseño para Pantalla

```
1. PRIMERO NÚMEROS GRANDES
   Profesor ve en 3 segundos: ✅ 32, ⏰ 8, ❌ 7

2. SEGUNDO ALERTAS URGENTES
   Vencidos en rojo, lista ordenada por urgencia

3. TERCERO TABLA COMPLETA
   Buscar, filtrar, detalles

4. IMPORTAR ES FÁCIL
   Template, preview, confirmar

5. EXPORTAR ES RAPIDO
   1 click después de filtrar

6. TODO EDITABLE
   Si hay error, rápido de corregir

7. HISTORIA VISIBLE
   Qué pasó antes, cuándo se recordó
```

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0  
**Owner:** NODO Studio | MiGym  
**Enfoque:** UX-First, sin código