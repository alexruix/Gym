# 📋 Sitemap MiGym v2.0
## Software de Gestión para Gimnasios de Barrio

**Contexto:** MiGym es una plataforma para profesores y personal trainers de gimnasios de barrio. El profesor crea planes desde templates o personalizados, asigna alumnos, y gestiona pagos + progreso. **Sin cobros en app, sin membresías complex, sin control de acceso físico.**

---

## 1. Nivel Público (Landing, Auth & Perfiles)

Puerta de entrada y perfiles públicos de marketing para los profesores.

### Rutas

| Ruta | Página | Propósito |
|------|--------|----------|
| `/` | **Landing** | Propuesta de valor: "Gestioná tus alumnos, planes y pagos en un lugar" |
| `/login` | **Magic Link** | Ingreso al sistema mediante email (sin contraseña) |
| `/auth/verify` | **Verificación** | Procesa el magic link de Supabase |
| `/p/[slug]` | **Perfil Público** | "Link en bio" del profesor con sus especialidades y redes |
| `/r/[token]` | **Acceso Alumno** | Puente de acceso permanente para alumnos vía token único |
| `/onboarding` | **Onboarding** | Flujo inicial para nuevos profesores (setup de perfil) |

---

## 2. Panel del Profesor (PRIMARY USER)

Enfoque: Gestión operacional rápida. "Industrial Minimalist" para eficiencia técnica.

### 2.1 Dashboard (Home del Profesor)

**Ruta:** `/profesor`

**Widgets clave:**
1. **Métricas rápidas:** Alumnos activos, planes vigentes, recaudación estimada
2. **Alertas:** Vencimientos de planes en los próximos 7 días
3. **Actividad reciente:** Últimos alumnos registrados o planes asignados
4. **Accesos directos:** "Nuevo alumno", "Crear plan", "Cargar ejercicio"

---

### 2.2 Gestión de Planes

**Ruta base:** `/profesor/planes`

- `/profesor/planes` (Listado y filtros)
- `/profesor/planes/new` (Creador de rutinas dinámico)
- `/profesor/planes/[id]` (Vista detallada del plan)
- `/profesor/planes/[id]/edit` (Editor de estructura y ejercicios)

---

### 2.3 Gestión de Alumnos

**Ruta base:** `/profesor/alumnos`

- `/profesor/alumnos` (Directorio de atletas)
- `/profesor/alumnos/new` (Registro individual)
- `/profesor/alumnos/import` (Carga masiva desde Excel)
- `/profesor/alumnos/[id]` (Ficha clínica: Plan actual, Pagos, Evolución)

---

### 2.4 Biblioteca de Ejercicios

**Ruta base:** `/profesor/ejercicios`

- `/profesor/ejercicios` (Base de datos de movimientos)
- `/profesor/ejercicios/new` (Carga de ejercicio individual)
- `/profesor/ejercicios/import` (Carga masiva - biblioteca estándar)
- `/profesor/ejercicios/[id]` (Edición de técnica y videos)

---

### 2.5 Pagos & Finanzas

**Ruta:** `/profesor/pagos` (Registro manual de cobros y control de morosidad)

---

### 2.6 Configuración

**Ruta:** `/profesor/configuracion` (Perfil, seguridad, redes sociales y links públicos)

---

## 3. Panel del Alumno (SECONDARY USER)

Enfoque: Ejecución del entrenamiento. **Mobile-first & High-contrast.**

### 3.1 Dashboard (Home Alumno)

**Ruta:** `/alumno` (Acceso rápido a la rutina de hoy y racha)

---

### 3.2 Entrenamiento

- `/alumno/mi-plan` (Estructura completa de la semana)
- `/alumno/sesion/[numero]` (Tracker de repeticiones y cargas en tiempo real)
- `/alumno/espera` (Pantalla de transición/carga personalizada)

---

### 3.3 Mi Evolución

**Ruta:** `/alumno/progreso` (Gráficos de volumen y marcas personales)

---

### 3.4 Cuenta

**Ruta:** `/alumno/perfil` (Datos personales y contacto con el profesor)

---

## 4. Estructura de Rutas (Astro Filesystem)

```
src/pages/
├── index.astro                    # Landing
├── login.astro                    # Página de ingreso
│
├── auth/
│   └── verify.astro               # Verificador de sesión
│
├── onboarding/
│   ├── index.astro                # Inicio onboarding
│   └── [step].astro               # Pasos dinámicos
│
├── p/
│   └── [slug].astro               # Perfil público profesor
│
├── r/
│   └── [token].astro              # Login bypass alumno
│
├── profesor/
│   ├── index.astro               # Dashboard principal
│   ├── configuracion.astro       # Ajustes de cuenta
│   ├── alumnos/
│   │   ├── index.astro           # Listado
│   │   ├── new.astro             # Form manual
│   │   ├── import.astro          # Bulk import
│   │   └── [id]/index.astro      # Detalle alumno
│   ├── ejercicios/
│   │   ├── index.astro           # Biblioteca
│   │   ├── new.astro             # Nuevo ejercicio
│   │   ├── import.astro          # Bulk library
│   │   └── [id]/index.astro      # Editar ejercicio
│   ├── planes/
│   │   ├── index.astro           # Listado planes
│   │   ├── new.astro             # Creador
│   │   └── [id]/
│   │       ├── index.astro       # Ver plan
│   │       └── edit.astro        # Editor rutinas
│   └── pagos/
│       └── index.astro           # Gestión de cobros
│
├── alumno/
│   ├── index.astro               # Dashboard
│   ├── mi-plan.astro             # Rutina activa
│   ├── progreso.astro            # Stats
│   ├── perfil.astro              # Datos
│   ├── espera.astro              # Loading state
│   └── sesion/
│       └── [numero].astro        # Tracker activo
│
└── api/
    └── auth/callback.ts          # Endpoint OAuth/MagicLink
```

**Total rutas actuales: 29**
