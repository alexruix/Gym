# 🛰️ Lógica de Acceso: El Link Permanente (Modo Barrio)

Este documento detalla cómo los alumnos acceden a **MiGym**. A diferencia de una app tradicional con registro y contraseña, MiGym usa un modelo de **Acceso Híbrido** diseñado para la velocidad y comodidad de un gimnasio de barrio.

---

## 1. Filosofía: El "Modo Barrio" 🇦🇷

En un gimnasio real, el profesor te anota y ya estás adentro. MiGym replica esto eliminando la fricción de "crearse una cuenta". 

- **Sin contraseñas**: No hay nada que olvidar.
- **Acceso Directo**: Un link único que "simplemente funciona".
- **Persistencia**: Una vez que entrás, tu teléfono te recuerda por 1 año.

---

## 2. Los Dos Caminos de Acceso

Aunque el sistema es uno solo, existen dos formas técnicas de entrar:

### A. Link de Acceso Permanente (Recomendado)
Es un puente directo que vincula el dispositivo del alumno con su perfil mediante un token único (`access_token`).
- **Ruta**: `/r/[token]`
- **Expira**: Nunca (el token es estático hasta que el profesor lo regenere).
- **Cookie**: Genera una cookie `gym_access` válida por 1 año.

### B. Acceso Formal (Magic Link)
Es el flujo estándar de Supabase Auth. Útil si el alumno cambia de dispositivo o prefiere loguearse con su email.
- **Ruta**: `/login` -> `/auth/verify`
- **Fricción**: Requiere abrir el email y hacer clic en un link temporal.

---

## 3. Flujo Técnico del Link Permanente

Cuando el profesor genera el link para un alumno, ocurre lo siguiente:

1.  **Generación de Token**: Cada registro en la tabla `alumnos` tiene un `access_token` (UUIDv4).
2.  **El Puente (`/r/[token]`)**:
    - El archivo `src/pages/r/[token].astro` recibe el token.
    - Valida el token contra la DB usando `supabaseAdmin` (bypass de RLS ya que el alumno aún es anónimo).
    - Si es válido, setea la cookie `httpOnly` llamada `gym_access`.
    - Redirige directamente al panel del alumno (`/alumno`).
3.  **Middleware de Sesión**:
    - `src/middleware.ts` detecta la cookie `gym_access`.
    - Resuelve la identidad del alumno y le asigna el rol `invitado`.
    - Crea el objeto `context.locals.user` con el ID del alumno.

---

## 4. Resolución de Identidad en el Middleware

El sistema es agnóstico a *cómo* entraste. El middleware unifica la sesión:

```typescript
// Lógica simplificada de prioridad
if (sesion_supabase_auth) {
  // Alumno "Formal" con cuenta vinculada
  user = { id: auth.uid, role: "alumno" }
} else if (cookie_gym_access) {
  // Alumno "Modo Barrio" (Invitado)
  user = { id: id_alumno_db, role: "invitado" }
}
```

Esto permite que todas las páginas en `/alumno/*` consulten `locals.user` sin preocuparse por el método de login.

---

## 5. Vinculación Atómica (Binding)

Si un alumno decide usar el Magic Link, el sistema intenta vincular su cuenta de Supabase Auth con su registro de alumno pre-existente en `/api/auth/callback.ts`:

- Si el email coincide y el `user_id` en la tabla `alumnos` es NULL, se hace el **Bind**.
- Esto permite "formalizar" una cuenta de invitado si el usuario así lo desea.

---

## 6. Seguridad y Revocación

Como los links permanentes son poderosos, el profesor tiene el control total:

- **Regeneración**: Desde el panel del profesor, se puede "Regenerar link". Esto cambia el `access_token` en la DB, invalidando instantáneamente todos los accesos anteriores (incluyendo dispositivos logueados con la cookie vieja).
- **Borrado Lógico**: Si el alumno es archivado (`deleted_at`), el link deja de funcionar inmediatamente.

---

## 7. Checklist para Profesores

Para invitar a un alumno:
1.  Crear el alumno en `/profesor/alumnos/new`.
2.  Desde la ficha del alumno, copiar el **"Link de Acceso Permanente"**.
3.  Enviárselo por WhatsApp (formato recomendado: `r/[token]`).
4.  Recordarle que **no necesita registrarse**, solo abrir el link una vez.
