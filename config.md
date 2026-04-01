# ⚙️ Configuración del Profesor: Estructura y Lógica

Opciones de personalización, seguridad y control de la cuenta para el profesor en **MiGym**. La página de ajustes centraliza la identidad y las preferencias operativas del sistema.

---

## 1. Diseño de Interfaz (Layout) 🇦🇷

La página de `/profesor/configuracion` utiliza un diseño modular optimizado para escritorio y móvil:

- **Escritorio**: Sidebar lateral izquierdo con navegación por anclajes (`#perfil`, `#seguridad`, `#notificaciones`).
- **Móvil**: Navegador horizontal superior (Scroll Horizontal) que permite alternar rápido entre categorías.
- **Estética**: "Industrial Minimalist" con bordes `rounded-2xl` y fondo `white/50` o `zinc-950/20`.

---

## 2. Secciones del Perfil (Core) ✅

### 2.1 Tu Información (`ProfileSection`)
Campos operativos para la gestión diaria y contacto comercial:
- **Nombre**: Nombre real del profesor.
- **Email**: Única fuente de verdad (SSOT). **Nota: No es editable por el usuario por seguridad.**
- **Foto / Avatar**: Imagen de perfil (Storage en Supabase).
- **Teléfono**: Número de contacto para derivaciones y alertas de alumnos.
- **Bio**: Breve descripción (Máx 160 caracteres) visible en perfiles públicos.

### 2.2 Seguridad (`SecuritySection`)
- **Cambio de Contraseña**: Flujo directo validando la contraseña actual.
- **Tracking**: Muestra el tiempo transcurrido desde la última actualización de seguridad (ej: "hace 3 meses").

### 2.3 Notificaciones (`NotificationsSection`)
Control granular de alertas mediante toggles (Switch):
- Cuotas a vencer (< 7 días).
- Alertas de cuota vencida.
- Confirmación de sesiones completadas por alumnos.
- Avisos de nuevos alumnos registrados.

### 2.4 Perfil Público (`PublicProfileSection`)
Configuración de la página de aterrizaje del profesor:
- **Slug**: URL personalizada (ej: `migym.app/p/tu-estudio`).
- **Redes Sociales**: Instagram, YouTube, TikTok, X.
- **Especialidades**: Tags de formación técnica.

---

## 3. Lógica de Negocio y SSOT 🏛️

- **Sincronización**: Los datos se cargan en el servidor (`Astro.locals.user`) y se hidratan en componentes React específicos para edición rápida.
- **Validación**: Todas las mutaciones pasan por `validators.ts` (esquemas Zod) antes de ejecutarse.
- **Mutaciones**: Uso mandatorio de **Astro Actions** (`registrarCambioPerfil`, `changePassword`, etc.) para asegurar RLS y consistencia.

---

## 4. Ideas y Funcionalidades Futuras (Roadmap) 🚀

Las siguientes opciones están en fase de análisis o diseño, pero aún **no están operativas** en la UI actual:

- **📥 Descargar mis datos**: Opción para exportar toda la actividad (Planes, Alumnos, Pagos) en formato ZIP/JSON.
- **💳 Facturación y Planes**: Gestión de suscripción al servicio MiGym (Gratis / Pro / Studio).
- **🗑️ Eliminar cuenta**: Proceso reversible de 30 días para borrado completo de información.
- **🔌 Integración WhatsApp Business**: Conexión directa para automatizar recordatorios de pago.
- **📧 Newsletter Semanal**: Resumen automático de rendimiento y facturación del estudio.

---

## 5. Referencia de Archivos
- **Página**: `src/pages/profesor/configuracion.astro`
- **Secciones**: `src/components/organisms/profesor/`
- **Copy**: `src/data/es/profesor/configuracion.ts`
- **Validadores**: `src/lib/validators.ts`
- **Acciones**: `src/actions/profesor.ts`