# MiGym | Estado del Alumno (V2.2)

Este documento describe la experiencia, capacidades y restricciones del usuario **Alumno** dentro de la plataforma MiGym.

---

## 1. Acceso y Autenticación
- **Magic Link**: El alumno accede principalmente mediante un link que contiene su email como parámetro (`/login?email=...`).
- **Persistencia**: Una vez logueado, la sesión se mantiene mediante Supabase Auth (SSR).
- **Auto-invitación**: Desde su dashboard, el alumno puede copiar su propio link de acceso para guardarlo o usarlo en otros dispositivos.

## 2. Estados de Flujo

### A. Sala de Espera (`/alumno/espera`)
- **Condición**: El alumno está registrado pero el profesor **no le ha asignado un plan** todavía (`plan_id` es nulo).
- **Interfaz**: 
  - Visualización de "Sala de Espera" con estética industrial.
  - Botón para "Consultar de nuevo" (recarga de página).
  - Instrucción de contactar al profesor por WhatsApp.
- **Restricción**: No puede ver rutinas ni iniciar sesiones.

### B. Dashboard Principal (`/alumno`)
- **Condición**: Tiene un plan activo asignado.
- **Capacidades**:
  - **Calendario Operativo**: Visualiza una tira de 14 días (7 pasados, hoy, 6 futuros) con el estado de cada sesión (completada, pendiente, omitida).
  - **Resumen Semanal**: Ve su número de semana actual, ciclo y rotación (`C2•R1`).
  - **Tarjeta de Hoy**: Muestra los primeros 3 ejercicios de la rutina del día y el estado de la sesión.
  - **Acceso Rápido**: Botón premium para "Empezar a entrenar" o "Continuar sesión".
  - **Próxima Sesión**: Vista previa de los ejercicios que le tocan mañana.

### C. Sesion Activa (`/alumno/sesion/hoy`)
- **Enfoque**: Interfaz optimizada para móviles ("Mobile First").
- **Posibilidades**:
  - **Cronómetro de Descanso**: Iniciado manualmente según el tiempo definido por el profesor.
  - **Registro de Ejercicios**: Marcar ejercicios como completados.
  - **Feedback Detallado**: Dejar notas por ejercicio (ej. "Bajé el peso por dolor").
  - **Finalización**: Al terminar todos los ejercicios, puede dejar una "Nota Global" sobre la energía del día antes de cerrar la sesión.
  - **Abandono**: Opción de salir de la sesión sin completarla totalmente (vuelve al dashboard).

## 3. Restricciones Actuales
- **Solo Hoy**: El flujo principal está diseñado para la sesión del día actual (`/hoy`). 
- **Modo Lectura**: No puede editar su plan, solo registrar el cumplimiento del mismo.
- **Dependencia**: No puede avanzar a la siguiente semana si el profesor no ha configurado la duración correcta o si no ha llegado el tiempo cronológico.

## 4. Estética y Experiencia (UX)
- **Concepto**: "Motivador de Alto Contraste".
- **Elementos**: Fondos negros, acentos en `lime-400`, efectos de "Glow" y cristalería (glassmorphism).
- **Voz**: Uso de voseo rioplatense ("Cargá tu nota", "Empezar a entrenar").
