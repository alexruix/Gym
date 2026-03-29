export const authCopy = {
  login: {
    title: "Acceso a MiGym",
    subtitle: "La plataforma para profesores que quieren crecer.",
    emailLabel: "Tu email",
    emailPlaceholder: "ej: nicolas@crossfitur.com",
    btnEmail: "Continuar con Email",
    btnGoogle: "Continuar con Google",
    divider: "o también",
    states: {
      loading: "Enviando...",
      success: {
        title: "Revisá tu correo",
        desc: "Te enviamos un enlace mágico para entrar. No hace falta contraseña.",
        spamHint: "¿No te llega? Pegale una mirada a la carpeta de Spam.",
        resendBtn: "Reenviar enlace",
      },
      error: {
        expired: "El enlace expiró o ya fue usado. Pedí uno nuevo.",
        rate_limit: "Demasiados intentos seguidos. Esperá unos minutos.",
        network: "Error de red. Checkeá tu conexión e intentá de nuevo.",
        auth_failed: "No pudimos validar tu acceso. Intentá ingresar tu email otra vez.",
        general: "Hubo un error inesperado. Por favor, probá de nuevo.",
        invalidEmail: "Ingresá un email válido para poder continuar."
      }
    }
  },
  onboarding: {
    title: "¡Hola! Bienvenido a MiGym",
    subtitle: "Configurá tu espacio en un segundo.",
    step1: {
      label: "Tu nombre o el de tu espacio",
      placeholder: "ej: Nicolás Varela o CrossFit Ur",
      btn: "Empezar a usar MiGym",
      description: "Así te verán tus alumnos dentro de la app.",
    },
    states: {
      loading: "Creando tu espacio...",
      error: "No pudimos guardar tus datos. Reintentá en unos segundos."
    }
  }
} as const;
