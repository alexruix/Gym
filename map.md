# 📋 Sitemap MiGym v2.0
## Software de Gestión para Gimnasios de Barrio

**Contexto:** MiGym es una plataforma para profesores y personal trainers de gimnasios de barrio. El profesor crea planes desde templates Excel (2, 3, 4 días), los personaliza, asigna alumnos, y gestiona pagos + progreso. **Sin cobros en app, sin membresías, sin control de acceso.**

---

## 1. Nivel Público (Landing & Auth)

Puerta de entrada simple. Objetivo: Explicar que MiGym simplifica la gestión del gimnasio.

### Rutas

| Ruta | Página | Propósito |
|------|--------|----------|
| `/` | **Landing** | Propuesta de valor: "Gestiona tus alumnos, planes y pagos en un lugar" |
| `/login` | **Magic Link** | Email → magic link. Acceso sin contraseña |
| `/login/magic-link-sent` | **Confirmación** | "Revisá tu email" (feedback visual) |
| `/onboarding` | **Onboarding** (Profesor) | Flujo guiado: rol, nombre, crear 1er plan (opcional) |

---

## 2. Panel del Profesor (PRIMARY USER)

Enfoque: Gestión operacional del gimnasio. Profesor está ocupado → todo en pocos clics.

### 2.1 Dashboard (Home del Profesor)

**Ruta:** `/profesor`

**Widgets clave:**
1. **Tarjetas de resumen:** Alumnos activos, planes, vencimientos hoy, morosos
2. **Alertas:** Acordeón con vencimientos próximos y morosos
3. **Feed:** Últimas actividades (sesiones completadas, alumnos nuevos, planes creados)
4. **CTAs rápidas:** Botones flotantes o sticky: "Nuevo alumno", "Crear plan"

---

### 2.2 Gestión de Planes

**Ruta base:** `/profesor/planes`

- `/profesor/planes` (Listado)
- `/profesor/planes/new` (Crear en 4 pasos)
- `/profesor/planes/[id]` (Ver/Editar)

---

### 2.3 Gestión de Alumnos

**Ruta base:** `/profesor/alumnos`

- `/profesor/alumnos` (Listado)
- `/profesor/alumnos/new` (Invitar)
- `/profesor/alumnos/import` (Excel)
- `/profesor/alumnos/[id]` (Ficha con tabs: Info, Pagos, Progreso)

---

### 2.4 Gestión de Pagos

**Ruta:** `/profesor/pagos` (Tablero general y exportación Excel)

---

### 2.5 Biblioteca de Ejercicios

**Ruta:** `/profesor/ejercicios` (Listado de movimientos personalizados)

---

### 2.6 Configuración & Ajustes

**Ruta:** `/profesor/configuracion` (Perfil, Notificaciones, Datos)

---

## 3. Panel del Alumno (SECONDARY USER)

Enfoque: Siguiendo el plan, registrando sesiones. **Móvil-first.**

### 3.1 Dashboard (Home Alumno)

**Ruta:** `/alumno` (CTA Empezar, Racha, Progreso)

---

### 3.2 Mi Plan

**Ruta:** `/alumno/mi-plan` (Estructura de rutinas por semana)

---

### 3.3 Tracker de Sesión

**Ruta:** `/alumno/sesion/[numero]` (Carga de reps reales por ejercicio)

---

### 3.4 Mi Progreso

**Ruta:** `/alumno/progreso` (Gráficos de evolución)

---

### 3.5 Perfil Alumno

**Ruta:** `/alumno/perfil` (Membresía y contacto profesor)

---

## 4. Estructura de Rutas (Astro Ready)

```
src/pages/
├── index.astro                    # Landing público
├── login.astro                    # Magic link
├── onboarding/
│   └── [step].astro              # Steps 1-N (rol, nombre, etc)
│
├── profesor/
│   ├── index.astro               # Dashboard
│   ├── planes/
│   │   ├── index.astro           # Listado
│   │   ├── new.astro             # Crear (4 pasos)
│   │   └── [id]/
│   │       └── index.astro       # Ver/Editar
│   ├── alumnos/
│   │   ├── index.astro           # Listado
│   │   ├── new.astro             # Invitar
│   │   ├── import.astro          # Importar Excel
│   │   └── [id]/
│   │       └── index.astro       # Ficha + tabs
│   ├── ejercicios/
│   │   ├── index.astro           # Listado
│   │   ├── new.astro             # Crear
│   │   └── [id]/
│   │       └── index.astro       # Editar
│   ├── pagos/
│   │   └── index.astro           # Tablero pagos
│   └── configuracion.astro       # Ajustes
│
├── alumno/
│   ├── index.astro               # Dashboard (home)
│   ├── mi-plan.astro             # Ver plan
│   ├── sesion/
│   │   └── [numero].astro        # Tracker
│   ├── progreso.astro            # Gráficos
│   └── perfil.astro              # Perfil
```

**Total rutas MVP: 17**
