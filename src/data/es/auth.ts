export const authCopy = {
  login: {
    title: "¡Hola!",
    subtitle: "Ingresá a tu consola de gestión",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    btnEmail: "Entrar con email",
    btnGoogle: "Entrar con Google",
    divider: "O también",
    states: {
      success: {
        title: "Revisá tu email",
        desc: "Te enviamos un link mágico para entrar sin contraseña.",
        spamHint: "No olvides revisar la carpeta de Spam.",
        resendBtn: "¿No llegó? Reintentar"
      },
      error: {
        invalidEmail: "Ingresá un email válido (ej: nombre@gym.com).",
        rate_limit: "Demasiados intentos. Esperá unos minutos.",
        network: "Problemas de conexión. Reintentá.",
        general: "Algo salió mal. Por favor reintentá.",
        auth_failed: "No pudimos validar tu identidad.",
        expired: "El link expiró o ya fue usado. Pedí uno nuevo."
      }
    }
  },
  onboarding: {
    title: "Casi listo",
    subtitle: "Configurá tu perfil profesional para empezar",
    step1: {
      label: "Tu nombre profesional",
      placeholder: "Ej: Profe Alex o Gimnasio Central",
      description: "Este nombre lo verán tus alumnos en su dashboard.",
      btn: "Completar perfil"
    },
    states: {
      loading: "Completando...",
      error: "No pudimos guardar tu perfil. Reintentá en un momento."
    },
    actions: {
      success: "¡Espacio creado con éxito!",
      error: {
        unauthorized: "No estás autenticado o la sesión expiró.",
        save_failed: "Error al guardar el perfil: "
      }
    }
  }
} as const;
