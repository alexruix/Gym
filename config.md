# ⚙️ Diseño de UX: `/profesor/configuracion`

**Propósito:** Especificar experiencia de configuración/ajustes del profesor en MiGym.

---

## 1. Análisis de Necesidades

### 1.1 Campos por Categoría

#### **PERFIL (Core)**

| Campo | Tipo | Requerido | Default | Razón |
|-------|------|-----------|---------|-------|
| Nombre | Text | ✅ | Del signup | Identificación básica |
| Email | Email | ✅ | Del signup | Cambiar email (importante) |
| Foto/Avatar | File | ❌ | Inicial | Personalización visual |
| Teléfono | Tel | ❌ | — | Futuro: WhatsApp |
| Bio/Descripción | Textarea | ❌ | — | Alumno ve esto |
| Gimnasio/Studio | Text | ❌ | — | Branding |
| Ubicación | Text | ❌ | — | SEO futuro |

#### **NOTIFICACIONES (Importante)**

| Opción | Tipo | Default | Razón |
|--------|------|---------|-------|
| Cuotas vencen (< 7 días) | Toggle | ON | Info crítica |
| Cuota marcada como vencida | Toggle | ON | Info crítica |
| Alumno completó sesión | Toggle | ON | Validación |
| Nuevo alumno agregado | Toggle | ON | Confirmación |
| Email semanal de resumen | Toggle | OFF | Nice-to-have |
| WhatsApp notificaciones (futuro) | Toggle | OFF | Futuro v1.1 |
| Frecuencia de notificaciones | Select | "Por cada evento" | Control |

#### **PRIVACIDAD (Seguridad)**

| Opción | Tipo | Default | Razón |
|--------|------|---------|-------|
| Perfil visible públicamente | Toggle | OFF | No lanzo marketplace aún |
| Permitir contacto directo | Toggle | ON | Alumnos pueden escribir |
| Mostrar foto en perfiles alumno | Toggle | ON | Confianza |
| Datos están encriptados | Info | — | Tranquilidad |

#### **DATOS Y SEGURIDAD (Advanced)**

| Opción | Tipo | Acción | Razón |
|--------|------|--------|-------|
| Descargar mis datos | Button | ZIP con JSON | GDPR, backup |
| Cambiar contraseña | Button | Modal | Seguridad (NO magic link) |
| Sesiones activas | List | Ver + logout | Control |
| Conectar WhatsApp | Button | OAuth | Futuro |
| Eliminar cuenta | Button | Confirmación | Salida clean |

#### **FACTURACIÓN (Futuro)**

| Opción | Tipo | Acción | Razón |
|--------|------|--------|-------|
| Plan actual | Info | "Gratis" o "Pro" | Transparencia |
| Próximo cobro | Date | Automático | Tranquilidad |
| Historial de pagos | Table | CSV export | Auditoría |
| Cambiar plan | Button | Upgrade/Downgrade | Futura monetización |

---

### 1.2 Priorización MVP

```
MVP (v1.0):
✅ Perfil (nombre, email, foto, teléfono)
✅ Notificaciones (toggles principales)
✅ Privacidad (públicamente visible, contacto)
⚠️ Datos (descargar datos, cambiar contraseña)
❌ Facturación (sin cobros aún)
❌ WhatsApp (futuro v1.1)

Total campos MVP: ~12-15
```

---

## 2. Estructura de Página

### 2.1 Opciones de Layout

#### **Opción A: Tabs Horizontales (Desktop)**

```
┌──────────────────────────────────────────┐
│ Configuración                            │
├──────────────────────────────────────────┤
│ [Perfil] [Notificaciones] [Privacidad]   │
│         [Datos] [Facturación]            │
├──────────────────────────────────────────┤
│                                          │
│ Contenido del tab activo                 │
│                                          │
└──────────────────────────────────────────┘
```

**Ventaja:** Desktop limpio, muchas opciones visibles
**Desventaja:** Móvil apretado

---

#### **Opción B: Sidebar (Desktop) + Accordion (Mobile)**

```
DESKTOP:                    MOBILE:
┌────────────────────┐     ┌──────────────┐
│ Config     │       │     │ Config       │
├────────────┤ Cont. │     ├──────────────┤
│ Perfil    │ │      │     │ ▼ Perfil     │
│ Notif.    │ │      │     │ ▼ Notif.     │
│ Privacidad│ del    │     │ ▼ Privacidad │
│ Datos     │ tab    │     │ ▼ Datos      │
│ Fact.     │        │     │ ▼ Fact.      │
│           │        │     │              │
└────────────────────┘     └──────────────┘
```

**Ventaja:** Escalable, mobile-friendly
**Desventaja:** Desktop sidebar toma espacio

---

#### **Opción C: Full Accordion (Ambos)**

```
┌──────────────────────┐
│ Configuración        │
├──────────────────────┤
│ ▼ PERFIL             │ ← Expandido
│   Campos...          │
│                      │
│ ▶ NOTIFICACIONES     │ ← Colapsado
│ ▶ PRIVACIDAD         │
│ ▶ DATOS              │
│ ▶ FACTURACIÓN        │
│                      │
└──────────────────────┘
```

**Ventaja:** Uniforme en ambos dispositivos
**Desventaja:** Menos elegante en desktop

---

### 2.2 Recomendación: **OPCIÓN B (Sidebar + Accordion)**

Razón: Escalable, soporta futuro (cuando haya 10+ secciones).

---

## 3. Wireframes Detallados

### 3.1 Desktop: Sidebar + Contenido

```
┌────────────────────────────────────────────────────┐
│ ⚙️ Configuración                    [👤 Marcos]    │
├────────────────────────────────────────────────────┤
│                                                    │
│ ┌──────────────┐  ┌──────────────────────────────┐│
│ │ PERFIL      │  │ Tu Información                ││
│ │ Notif.      │  ├──────────────────────────────┐│
│ │ Privacidad  │  │                              ││
│ │ Datos       │  │ Foto                        ││
│ │ Facturación │  │ [Avatar] [Cambiar] [Quitar] ││
│ │             │  │                              ││
│ │             │  │ Nombre                       ││
│ │             │  │ [Marcos García]              ││
│ │             │  │                              ││
│ │             │  │ Email                        ││
│ │             │  │ [marcos@gmail.com]           ││
│ │             │  │ Cambiar email                ││
│ │             │  │                              ││
│ │             │  │ Teléfono (opcional)          ││
│ │             │  │ [+54 9 11 2345-6789]         ││
│ │             │  │                              ││
│ │             │  │ Bio/Descripción              ││
│ │             │  │ [Personal trainer con 10...] ││
│ │             │  │ Máx 160 caracteres           ││
│ │             │  │                              ││
│ │             │  │ Gimnasio/Studio              ││
│ │             │  │ [CrossFit Zona Sur]          ││
│ │             │  │                              ││
│ │             │  │ Ubicación                    ││
│ │             │  │ [La Plata, Buenos Aires]     ││
│ │             │  │                              ││
│ │             │  │ [Cancelar] [Guardar cambios]││
│ │             │  │                              ││
│ └────────────────────────────────────────────────┘│
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 3.2 Sección: NOTIFICACIONES

```
┌──────────────────────────────────────────────────────┐
│ 🔔 Notificaciones                                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ALERTAS IMPORTANTES                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ ☑ Cuotas a vencer (< 7 días)                        │
│   Recibís un email cuando falta 1 semana             │
│                                                      │
│ ☑ Cuota vencida                                      │
│   Recibís un email cuando algo vence                 │
│                                                      │
│ ☑ Alumno completó sesión                            │
│   Notificación instantánea                           │
│                                                      │
│ ☑ Nuevo alumno agregado                             │
│   Confirmación cuando alguien se une                 │
│                                                      │
│ NEWSLETTER (opcional)                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ ☐ Email semanal de resumen                          │
│   Cada lunes: resumen de la semana                   │
│                                                      │
│ FUTURO                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ ☐ Notificaciones WhatsApp (próximamente)            │
│                                                      │
│ FRECUENCIA                                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ Notificaciones:                                      │
│ [Por cada evento ▼]                                  │
│  • Por cada evento                                   │
│  • Resumen diario                                    │
│  • Resumen semanal                                   │
│                                                      │
│ [Guardar cambios]                                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 3.3 Sección: DATOS Y SEGURIDAD

```
┌──────────────────────────────────────────────────────┐
│ 🔐 Datos y Seguridad                                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│ DESCARGAR MIS DATOS                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ Descargá un ZIP con todos tus datos en JSON          │
│ para backup o migración.                             │
│                                                      │
│ [📥 Descargar datos (ZIP)]                           │
│                                                      │
│ CAMBIAR CONTRASEÑA                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ Recomendación: Cambiar cada 3 meses                  │
│ Última vez: 15/03/2024                               │
│                                                      │
│ [Cambiar contraseña]  ← Abre modal                   │
│                                                      │
│ SESIONES ACTIVAS                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ Dispositivos donde estás loguead@:                   │
│                                                      │
│ 🖥️  Chrome · MacBook Pro                             │
│     Última actividad: Hoy 14:32                      │
│     [Cerrar sesión]                                  │
│                                                      │
│ 📱 Safari · iPhone 14                                │
│     Última actividad: Ayer 20:15                     │
│     [Cerrar sesión]                                  │
│                                                      │
│ PRIVACIDAD DE DATOS                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                      │
│ ✅ Todos tus datos están encriptados                 │
│ ✅ Cumplimos GDPR                                    │
│ ✅ No vendemos datos                                 │
│                                                      │
│ [Ver política de privacidad]                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### 3.4 Mobile: Accordion

```
┌────────────────────────┐
│ ⚙️ Configuración       │
├────────────────────────┤
│                        │
│ ▼ PERFIL              │ ← Expandido
│                        │
│ Foto                   │
│ [Avatar] [Cambiar]     │
│                        │
│ Nombre                 │
│ [Marcos García]        │
│                        │
│ Email                  │
│ [marcos@gmail...]      │
│ [Cambiar]              │
│                        │
│ Teléfono               │
│ [+54 9 11...]          │
│                        │
│ Bio                    │
│ [Personal trainer...]  │
│                        │
│ [Guardar]              │
│                        │
│ ▶ NOTIFICACIONES       │
│ ▶ PRIVACIDAD           │
│ ▶ DATOS                │
│ ▶ FACTURACIÓN          │
│                        │
│ ▼ CUENTA               │
│                        │
│ [Cerrar sesión]        │
│ [Eliminar cuenta]      │
│                        │
└────────────────────────┘
```

---

## 4. Flujos Específicos

### 4.1 Cambiar Email

```
USUARIO HACE CLICK: [Cambiar email] en Perfil
         ↓
MODAL ABRE:
  "Cambiar email"
  
  Email actual: marcos@gmail.com (read-only, gris)
  
  Nuevo email: [___________________]
  
  Confirmar con OTP: ☑
  
  [Cancelar] [Siguiente]

         ↓
         
SE VALIDA:
  - Nuevo email ≠ actual
  - Email válido
  - Email no registrado ya
  
         ↓
         
SI OK → EMAIL OTP:
  "Enviamos un código a tu nuevo email."
  "Expira en 15 minutos."
  
  Código: [__] [__] [__] [__] [__] [__]
  
  [Verificar]
  
         ↓
         
SI VERIFICA → SUCCESS:
  Toast: "✅ Email actualizado a [nuevo]"
  Redirecciona a Perfil
  
         ↓
         
SI FALLA → ERROR:
  Toast: "❌ Código incorrecto o expirado. Intentá de nuevo."
  Botón: [Reenviar código]
```

---

### 4.2 Cambiar Contraseña

```
USUARIO HACE CLICK: [Cambiar contraseña]
         ↓
MODAL ABRE:
  "Cambiar contraseña"
  
  Contraseña actual: [**************] (password)
  
  Nueva contraseña: [**************] (password)
  
  Confirmar: [**************] (password)
  
  ℹ️ Mínimo 8 caracteres, con mayúscula y número
  
  [Cancelar] [Cambiar]

         ↓
         
SE VALIDA:
  - Contraseña actual correcta
  - Nueva ≠ actual
  - Mínimo 8 caracteres
  - Incluye mayúscula + número
  - Nueva == confirmar
  
         ↓
         
SI OK → SUCCESS:
  Toast: "✅ Contraseña actualizada"
  Se cierra modal
  
         ↓
         
SI FALLA → ERROR:
  Mensaje: "Contraseña actual incorrecta"
  O: "Las contraseñas no coinciden"
  Campo se destaca en rojo
```

---

### 4.3 Descargar Datos

```
USUARIO HACE CLICK: [Descargar datos]
         ↓
CONFIRMACIÓN MODAL:
  "¿Descargar todos tus datos?"
  
  Se descargará un ZIP que incluye:
  - Tu perfil
  - Todos tus planes
  - Todos tus alumnos
  - Historial de pagos
  
  [Cancelar] [Sí, descargar]

         ↓
         
SE GENERA ZIP:
  Backend crea JSON con:
  {
    profesor: { id, email, nombre, ... },
    planes: [ { id, nombre, ejercicios }, ... ],
    alumnos: [ { id, email, plan, ... }, ... ],
    sesiones: [ { ... }, ... ],
    pagos: [ { ... }, ... ]
  }
  
         ↓
         
DESCARGA INICIA:
  migym_backup_15-03-2024.zip
  
  Toast: "✅ Descargando backup..."
```

---

## 5. Copy & Mensajes

### 5.1 Centralizado en SSOT

```typescript
// src/data/es/profesor/configuracion.ts

export const configurationCopy = {
  title: "Configuración",
  
  profile: {
    section: "Tu Información",
    labels: {
      foto: "Foto",
      nombre: "Nombre",
      email: "Email",
      telefono: "Teléfono (opcional)",
      bio: "Bio / Descripción",
      gimnasio: "Gimnasio o Studio",
      ubicacion: "Ubicación",
    },
    hints: {
      foto: "JPG o PNG. Máx 2MB.",
      bio: "Máx 160 caracteres. Tus alumnos lo ven.",
      gimnasio: "Nombre de tu gimnasio o studio.",
      ubicacion: "Ciudad, provincia. Para SEO futuro.",
    },
    actions: {
      changeFoto: "Cambiar",
      removeFoto: "Quitar",
      changeEmail: "Cambiar email",
      saveChanges: "Guardar cambios",
    },
    success: "✅ Perfil actualizado",
    error: "❌ No se pudo guardar. Intenta de nuevo.",
  },

  notifications: {
    section: "Notificaciones",
    important: "Alertas Importantes",
    newsletter: "Newsletter (opcional)",
    future: "Futuro",
    frequency: "Frecuencia",
    labels: {
      expiringPayments: "Cuotas a vencer (< 7 días)",
      expiredPayments: "Cuota vencida",
      studentCompleted: "Alumno completó sesión",
      newStudent: "Nuevo alumno agregado",
      weeklyDigest: "Email semanal de resumen",
      whatsapp: "Notificaciones WhatsApp (próximamente)",
    },
    hints: {
      expiringPayments: "Recibís un email cuando falta 1 semana",
      expiredPayments: "Recibís un email cuando vence",
      studentCompleted: "Notificación instantánea",
      newStudent: "Confirmación cuando se une",
      weeklyDigest: "Cada lunes: resumen de la semana",
    },
  },

  privacy: {
    section: "Privacidad",
    labels: {
      publicProfile: "Perfil visible públicamente",
      directContact: "Permitir contacto directo",
      showPhoto: "Mostrar foto en perfiles alumno",
    },
    hints: {
      publicProfile: "Futuro: cuando lancemos marketplace",
      directContact: "Tus alumnos pueden escribirte",
      showPhoto: "Aumenta confianza",
    },
  },

  security: {
    section: "Datos y Seguridad",
    downloadData: "Descargar mis datos",
    downloadHint: "ZIP con todos tus datos en JSON",
    changePassword: "Cambiar contraseña",
    passwordHint: "Recomendación: cada 3 meses",
    activeSessions: "Sesiones activas",
    privacy: "Privacidad de datos",
    privacyHints: [
      "✅ Todos tus datos están encriptados",
      "✅ Cumplimos GDPR",
      "✅ No vendemos datos",
    ],
    actions: {
      download: "📥 Descargar datos",
      changePassword: "Cambiar contraseña",
      logout: "Cerrar sesión",
      deleteAccount: "Eliminar cuenta",
      viewPrivacy: "Ver política de privacidad",
    },
  },

  modals: {
    changeEmail: {
      title: "Cambiar email",
      currentEmail: "Email actual",
      newEmail: "Nuevo email",
      otpSent: "Enviamos un código a tu nuevo email. Expira en 15 minutos.",
      otpCode: "Código OTP",
      verify: "Verificar",
      resend: "Reenviar código",
      success: "✅ Email actualizado",
      error: {
        invalid: "Email inválido",
        duplicate: "Este email ya está registrado",
        noMatch: "Las direcciones no coinciden",
        otpExpired: "Código expirado",
        otpIncorrect: "Código incorrecto",
      },
    },
    changePassword: {
      title: "Cambiar contraseña",
      currentPassword: "Contraseña actual",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      hint: "Mínimo 8 caracteres, con mayúscula y número",
      change: "Cambiar",
      success: "✅ Contraseña actualizada",
      error: {
        currentIncorrect: "Contraseña actual incorrecta",
        noMatch: "Las contraseñas no coinciden",
        tooShort: "Mínimo 8 caracteres",
        noCapital: "Debe incluir mayúscula",
        noNumber: "Debe incluir número",
      },
    },
    deleteAccount: {
      title: "Eliminar cuenta",
      warning: "⚠️ Esta acción es irreversible",
      message: "Se eliminarán permanentemente:",
      items: [
        "Tu perfil",
        "Todos tus planes",
        "Datos de tus alumnos",
        "Historial de pagos",
      ],
      confirmText: "Escribí ELIMINAR para confirmar",
      delete: "Sí, eliminar mi cuenta",
      cancel: "Cancelar",
      success: "Tu cuenta fue eliminada. Te echamos de menos.",
    },
  },
};
```

---

## 6. Validaciones & Error Handling

### 6.1 Validadores Zod

```typescript
// src/lib/validators.ts

export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  
  email: z
    .string()
    .email("Email inválido")
    .refine(async (email) => {
      // Si cambió el email, validar que sea único
      const exists = await checkEmailExists(email);
      return !exists;
    }, "Este email ya está registrado"),
  
  telefono: z
    .string()
    .optional()
    .refine((tel) => !tel || /^[\d\s\-\+\(\)]{9,}$/.test(tel), "Teléfono inválido"),
  
  bio: z
    .string()
    .optional()
    .max(160, "Máximo 160 caracteres"),
  
  gimnasio: z
    .string()
    .optional()
    .max(100, "Máximo 100 caracteres"),
  
  ubicacion: z
    .string()
    .optional()
    .max(100, "Máximo 100 caracteres"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Requerido"),
  
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .refine((pwd) => /[A-Z]/.test(pwd), "Debe incluir mayúscula")
    .refine((pwd) => /[0-9]/.test(pwd), "Debe incluir número"),
  
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .email("Email inválido")
    .refine(async (email) => {
      const exists = await checkEmailExists(email);
      return !exists;
    }, "Este email ya está registrado"),
  
  otpCode: z
    .string()
    .length(6, "Código debe tener 6 dígitos"),
});
```

---

## 7. Estados Visuales & Loading

### 7.1 Guardando

```
GUARDAR CAMBIOS HECHO:

1. Usuario hace cambios
2. Click [Guardar cambios]
   ↓
3. Botón entra en estado loading:
   [Guardando...] (disabled, spinner)
   
4. Otros inputs se deshabilitan (disabled)
   
5. Si OK (< 2 seg):
   Toast: "✅ Perfil actualizado"
   Botón vuelve a [Guardar cambios]
   
6. Si error:
   Toast: "❌ No se pudo guardar. Intenta de nuevo."
   Botón vuelve a [Guardar cambios]
   Campos mantienen valores intentados
```

---

### 7.2 Cambiar Foto

```
SUBIR FOTO:

1. Click en avatar o [Cambiar]
   ↓
2. Abre file picker (JPG, PNG, máx 2MB)
   ↓
3. Usuario selecciona archivo
   ↓
4. Previsualizador muestra selección (small)
   Botones: [Cambiar] [Quitar]
   
5. Si hace click en vacío del input, se limpia
   ↓
6. Upload cuando hace [Guardar cambios]:
   - Subida a Supabase Storage
   - Progreso bar (si > 1 MB)
   - Spinner hasta completar
   
7. Success: Toast + avatar actualizado inmediato
   
8. Error: Toast + intenta de nuevo
```

---

## 8. Astro Actions

### 8.1 updateProfile

```typescript
// src/actions/profesor.ts

export const updateProfile = defineAction({
  accept: "json",
  input: updateProfileSchema,
  handler: async (input, context) => {
    const user = context.locals.user;
    if (!user) throw new Error("No autenticado");

    // 1. Upload foto si hay
    let fotoUrl = null;
    if (input.fotoFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}/profile-${Date.now()}.jpg`, input.fotoFile, {
          upsert: true,
        });
      if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);
      fotoUrl = uploadData.path;
    }

    // 2. Update en DB
    const { error: updateError } = await supabase
      .from("profesores")
      .update({
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono || null,
        bio: input.bio || null,
        gimnasio: input.gimnasio || null,
        ubicacion: input.ubicacion || null,
        foto_url: fotoUrl,
      })
      .eq("id", user.id);

    if (updateError) throw new Error(updateError.message);

    return {
      success: true,
      message: "✅ Perfil actualizado",
    };
  },
});
```

---

### 8.2 changePassword

```typescript
export const changePassword = defineAction({
  accept: "json",
  input: changePasswordSchema,
  handler: async (input, context) => {
    const user = context.locals.user;
    if (!user) throw new Error("No autenticado");

    // 1. Verificar contraseña actual
    const { data: authData, error: authError } = 
      await supabase.auth.signInWithPassword({
        email: user.email!,
        password: input.currentPassword,
      });

    if (authError || !authData.user) {
      throw new Error("Contraseña actual incorrecta");
    }

    // 2. Cambiar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: input.newPassword,
    });

    if (updateError) throw new Error(updateError.message);

    return {
      success: true,
      message: "✅ Contraseña actualizada",
    };
  },
});
```

---

### 8.3 changeEmail

```typescript
export const requestEmailChange = defineAction({
  accept: "json",
  input: z.object({
    newEmail: z.string().email(),
  }),
  handler: async (input, context) => {
    const user = context.locals.user;
    if (!user) throw new Error("No autenticado");

    // 1. Enviar OTP al nuevo email
    const { error } = await supabase.auth.signInWithOtp({
      email: input.newEmail,
      options: {
        emailRedirectTo: `${context.url.origin}/profesor/configuracion?tab=perfil&email=${input.newEmail}`,
      },
    });

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: `✅ Código enviado a ${input.newEmail}`,
      expiresIn: 900, // 15 minutos
    };
  },
});

export const verifyEmailChange = defineAction({
  accept: "json",
  input: changeEmailSchema,
  handler: async (input, context) => {
    const user = context.locals.user;
    if (!user) throw new Error("No autenticado");

    // 1. Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email: input.newEmail,
      token: input.otpCode,
      type: "email",
    });

    if (error || !data.user) throw new Error("Código incorrecto");

    // 2. Update email en DB
    const { error: updateError } = await supabase
      .from("profesores")
      .update({ email: input.newEmail })
      .eq("id", user.id);

    if (updateError) throw new Error(updateError.message);

    return {
      success: true,
      message: `✅ Email actualizado a ${input.newEmail}`,
    };
  },
});
```

---

## 9. Componentes React (Islands)

### 9.1 ProfileSection.tsx

```tsx
// src/components/organisms/profesor/ProfileSection.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { updateProfileSchema } from "@/lib/validators";
import { configurationCopy } from "@/data/es/profesor/configuracion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileSectionProps {
  profesor: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    bio?: string;
    gimnasio?: string;
    ubicacion?: string;
    fotoUrl?: string;
  };
}

export function ProfileSection({ profesor }: ProfileSectionProps) {
  const [isPending, setIsPending] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: profesor,
  });

  const onSubmit = async (data) => {
    setIsPending(true);
    try {
      const result = await actions.profesor.updateProfile({
        ...data,
        fotoFile: foto,
      });
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  const copy = configurationCopy.profile;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">{copy.section}</h3>

        {/* FOTO */}
        <div className="mb-6">
          <label>{copy.labels.foto}</label>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profesor.fotoUrl} />
              <AvatarFallback>{profesor.nombre[0]}</AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] || null)}
                className="hidden"
                id="foto-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("foto-input")?.click()}
              >
                {copy.actions.changeFoto}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFoto(null)}
              >
                {copy.actions.removeFoto}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{copy.hints.foto}</p>
        </div>

        {/* NOMBRE */}
        <div className="mb-4">
          <label>{copy.labels.nombre}</label>
          <Input
            {...register("nombre")}
            error={errors.nombre?.message}
          />
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label>{copy.labels.email}</label>
          <div className="flex gap-2">
            <Input
              {...register("email")}
              disabled
              className="flex-1"
            />
            <Button type="button" variant="outline">
              {copy.actions.changeEmail}
            </Button>
          </div>
        </div>

        {/* TELÉFONO, BIO, GIMNASIO, UBICACIÓN */}
        {/* ... similar pattern ... */}

        {/* CTA */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline">Cancelar</Button>
          <Button disabled={isPending}>
            {isPending ? "Guardando..." : copy.actions.saveChanges}
          </Button>
        </div>
      </div>
    </form>
  );
}
```

---

## 10. Checklist de Implementación

### MVP v1.0

- [ ] **Perfil**
  - [ ] Foto (upload a Supabase Storage)
  - [ ] Nombre, email, teléfono
  - [ ] Bio, gimnasio, ubicación
  - [ ] Guardar cambios
  - [ ] Validaciones Zod

- [ ] **Notificaciones**
  - [ ] 4 toggles principales
  - [ ] Selector de frecuencia
  - [ ] Guardar preferencias

- [ ] **Privacidad**
  - [ ] Perfil público (toggle, sin efecto aún)
  - [ ] Contacto directo (toggle)
  - [ ] Mostrar foto (toggle)

- [ ] **Datos**
  - [ ] Cambiar contraseña (modal)
  - [ ] Descargar datos (genera ZIP)
  - [ ] Sesiones activas (list)
  - [ ] Cerrar sesión individual

- [ ] **Diseño**
  - [ ] Desktop: sidebar + contenido
  - [ ] Mobile: accordion
  - [ ] Estados loading/pending
  - [ ] Modales para acciones críticas
  - [ ] Toast notifications

- [ ] **Validaciones**
  - [ ] Email duplicado check
  - [ ] Contraseña (8+ chars, mayús, número)
  - [ ] Teléfono formato válido
  - [ ] Bio máx 160 chars

- [ ] **Accesibilidad**
  - [ ] aria-labels en inputs
  - [ ] Keyboard navigation (Tab, Enter)
  - [ ] Focus visible
  - [ ] Error messages accesibles

- [ ] **Testing**
  - [ ] Unit tests validadores
  - [ ] Component tests (perfil, notif)
  - [ ] E2E: cambiar perfil → guardar
  - [ ] E2E: cambiar contraseña

---

### Future (v1.1+)

- [ ] Cambiar email (con OTP)
- [ ] Conectar WhatsApp
- [ ] Facturación (plan, historial)
- [ ] Eliminar cuenta (con confirmación)
- [ ] Preferencias de privacidad de datos (GDPR)

---

## 11. Alineación con Documentación

### Voice & Tone ✅

- Copy específica: "Máx 160 caracteres. Tus alumnos lo ven."
- Voseo: "Cambiar email", "Descargá un ZIP"
- Emojis contextuales: ✅, ❌, 🔐, 📥
- Error messages: "Contraseña actual incorrecta" (sin "Error 401")

### Best Practices ✅

- Validación Zod (client + server)
- RLS en DB (solo profesor modifica sus datos)
- Astro Actions (type-safe)
- Error handling con try/catch
- Loading states visibles

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0  
**Owner:** NODO Studio | MiGym