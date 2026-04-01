# Lógica de Login y Vinculación de Alumnos (Magic Link)

Este documento detalla el flujo técnico para que un alumno pueda acceder a **Migym** y vincular su identidad de Supabase Auth con el registro creado previamente por su profesor de forma automática y segura.

## 1. Requisitos Previos en Supabase

Para que el login funcione, se debe configurar lo siguiente en el Dashboard de Supabase:
1.  **Habilitar Magic Link:** En `Authentication > providers > Email`, activar el interruptor de "Magic Link".
2.  **Configurar Site URL:** En `Authentication > URL Configuration`, poner el dominio de la app
3.  **Redirect URLs:** Asegurarse de que `/api/auth/callback` esté en la lista de URLs permitidas.
4.  **Confirmación de Email:** Si se usa Magic Link, Supabase enviará un correo. Para desarrollo local se recomienda usar una cuenta de prueba o configurar un servicio SMTP (como Resend/SendGrid).

## 2. El Estado Inicial en la Base de Datos

Cuando un profesor registra a un alumno (acción `inviteStudent`), se crea una fila en la tabla `alumnos` con:
- `email`: El correo del alumno (ej: `alumno@email.com`).
- `user_id`: **NULL** (Campo libre para reclamar).
- `profesor_id`: El ID del profesor que lo creó.

## 3. Flujo Crítico: Vinculación en el Servidor (Binding)

A diferencia de otros enfoques, **Migym** realiza la vinculación en el servidor durante el intercambio de código. Esto garantiza que el alumno vea sus datos inmediatamente al entrar, sin esperas ni "flashes" de contenido vacío.

### Paso A: Invitación (Redirect Controlado)
La acción de invitar al alumno (`src/actions/profesor.ts`) envía el Magic Link apuntando específicamente a nuestro endpoint de API:
```typescript
emailRedirectTo: `${context.url.origin}/api/auth/callback?next=/alumno`
```

### Paso B: Intercambio y Vinculación (Callback API)
En `src/pages/api/auth/callback.ts`, el servidor procesa el login:
1.  **Intercambio de Código**: Cambia el código de Supabase por una sesión real (`exchangeCodeForSession`).
2.  **Búsqueda por Email**: Si el usuario no tiene `user_id` vinculado todavía, busca en la tabla `alumnos` una fila con ese `email` e `is('user_id', null)`.
3.  **Vínculo Atómico**: Si lo encuentra, ejecuta el `UPDATE` para asignar el `auth.uid()` a esa fila.

```typescript
// Lógica simplificada en src/pages/api/auth/callback.ts
const { data: alumByEmail } = await supabase
  .from('alumnos')
  .select('id')
  .eq('email', user.email)
  .is('user_id', null)
  .maybeSingle();

if (alumByEmail) {
  await supabase
    .from('alumnos')
    .update({ user_id: user.id })
    .eq('id', alumByEmail.id);
  
  return redirect('/alumno');
}
```

## 4. Seguridad vía RLS

Para que el servidor (actuando con la sesión del usuario recién logueado) pueda realizar el `UPDATE`, la política en `supabase.md` (Sección 16) debe permitirlo:

```sql
CREATE POLICY "Alumnos reclaman su perfil" ON alumnos 
  FOR UPDATE USING (
    email = (auth.jwt() ->> 'email') AND 
    user_id IS NULL
  ) 
  WITH CHECK (
    user_id = auth.uid()
  );
```
> [!IMPORTANT]
> Esta política garantiza que **solo** el dueño legítimo del email puede reclamar el perfil, y **solo una vez** (mientras `user_id` sea NULL).

## 5. Beneficios de esta Lógica
- **Experiencia de Usuario (DX/UX)**: El alumno entra directamente a su panel con su plan asignado.
- **Robustez**: No dependemos de que el navegador del cliente ejecute un script o de que el usuario no cierre la pestaña antes de tiempo.
- **Seguridad Atómica**: El servidor valida la identidad antes de mostrar cualquier dato sensible.

## 6. Casos de Borde
- **Email no registrado**: Si el alumno se loguea con un email que ningún profesor asignó, el `callback` no encontrará el registro y lo enviará a `/onboarding` o le mostrará un estado vacío, protegiendo la privacidad de los demás alumnos.
- **Re-login**: En logins posteriores, el `callback` detectará que el `user_id` ya está vinculado y simplemente redirigirá a `/alumno`.
