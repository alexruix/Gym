export const configurationCopy = {
  title: "Configuración",
  subtitle: "Administrá tu perfil, notificaciones y cuenta en un solo lugar.",
  
  profile: {
    section: "Tu Información",
    description: "Actualizá tu información personal y pública.",
    labels: {
      foto: "Foto de Perfil",
      email: "Email (Sólo lectura por ahora)",
      telefono: "Número de Teléfono",
    },
    hints: {
      foto: "JPG o PNG. Máx 2MB.",
      telefono: "Incluí tu código de área e internacional (ej: +54). Pronto servirá para iniciar sesión rápida.",
    },
    actions: {
      changeFoto: "Cambiar",
      removeFoto: "Quitar",
      changeEmail: "Cambiar email",
      saveChanges: "Guardar cambios",
    },
    toast: {
      success: "✅ Datos de cuenta actualizados",
      error: "❌ No se pudo guardar. Intentá de nuevo.",
    }
  },

  publicProfile: {
    section: "Perfil Público",
    description: "Diseñá cómo te ven tus futuros alumnos al buscarte en la plataforma.",
    banner: {
      title: "¡Consigue nuevos clientes!",
      subtitle: "Tener tu perfil completo te ayuda a posicionarte y recibir más contactos directos.",
      cta: "Ver mi perfil público",
    },
    labels: {
      nombre: "Nombre del entrenador/gimnasio",
      slug: "Enlace personalizado (URL)",
      bio: "Biografía (Presentación corta)",
      especialidades: "Especialidades (Apretá Enter para agregar)",
      instagram: "Instagram (URL de tu perfil)",
      youtube: "Canal de YouTube (URL)",
      tiktok: "TikTok (URL)",
      x_twitter: "X / Twitter (URL)",
    },
    hints: {
      slug: "Ej: mi-gimnasio. Sólo letras, números y guiones.",
      bio: "Explica brevemente tu experiencia. Máx 160 caracteres.",
      especialidades: "Ej: Funcional, Nutrición, Musculación.",
    },
    actions: {
      add: "Añadir",
      saveChanges: "Publicar perfil",
    },
    toast: {
      success: "✅ Perfil público guardado exitosamente",
      error: "❌ Verifica los campos e intentá de nuevo.",
      slugError: "Ese enlace ya está en uso. Elige otro.",
    }
  },

  notifications: {
    section: "Notificaciones",
    important: "Alertas Importantes",
    newsletter: "Newsletter (opcional)",
    frequency: "Frecuencia de Alertas",
    labels: {
      expiringPayments: "Cuotas a vencer (< 7 días)",
      expiredPayments: "Cuota vencida",
      studentCompleted: "Alumno completó sesión",
      newStudent: "Nuevo alumno agregado",
    },
    hints: {
      expiringPayments: "Recibís un email cuando falta 1 semana",
      expiredPayments: "Recibís un email el día del vencimiento",
      studentCompleted: "Notificación instantánea en la app",
      newStudent: "Confirmación cuando se registra tu alumno",
    },
    frecuencias: [
      { value: "evento", label: "Por cada evento" },
      { value: "diario", label: "Resumen diario" },
      { value: "semanal", label: "Resumen semanal" },
    ],
    toast: {
      success: "✅ Preferencias guardadas",
    }
  },

  privacy: {
    section: "Privacidad",
    labels: {
      publicProfile: "Perfil visible públicamente",
      directContact: "Permitir contacto directo",
      showPhoto: "Mostrar foto en perfil visible",
    },
    hints: {
      publicProfile: "Futuro: los alumnos podrán encontrarte",
      directContact: "Tus alumnos pueden contactarte",
      showPhoto: "Aumenta la confianza",
    },
  },

  security: {
    section: "Datos y Seguridad",
    description: "Administrá tu acceso y mirá tu privacidad.",
    downloadData: "Descargar mis datos",
    downloadHint: "Próximamente",
    changePassword: "Cambiar contraseña",
    passwordHint: "Última vez actualizado: ",
    activeSessions: "Sesiones Activas",
    privacy: "Privacidad de datos",
    privacyHints: [
      "✅ Todos tus datos están encriptados y protegidos.",
      "✅ No vendemos ni compartimos tu información.",
      "✅ Total confidencialidad sobre el progreso e información de tus alumnos.",
    ],
    actions: {
      download: "Descargar",
      changePassword: "Cambiar mi contraseña",
      logout: "Cerrar sesión global",
    },
  },

  modals: {
    changePassword: {
      title: "Cambiar tu contraseña",
      description: "Por seguridad, te pedimos tu contraseña actual para establecer una nueva.",
      currentPassword: "Contraseña actual",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      hint: "Mínimo 8 caracteres, ideal combinando letras y números.",
      change: "Guardar contraseña",
      cancel: "Cancelar",
      success: "✅ Contraseña actualizada exitosamente",
      error: {
        currentIncorrect: "Contraseña actual incorrecta",
        noMatch: "Las contraseñas no coinciden",
        general: "No se pudo cambiar la contraseña",
      },
    },
  },
};
