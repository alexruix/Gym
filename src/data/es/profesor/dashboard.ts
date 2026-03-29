export const dashboardCopy = {
  header: {
    title: "Tu espacio",
    actions: {
      newStudent: "Nuevo alumno",
      createPlan: "Crear plan",
    }
  },
  metrics: {
    activeStudents: {
      label: "Comunidad actual", // Alumnos activos
      tooltip: "Alumnos siguiendo un plan activamente",
    },
    pendingRoutines: {
      label: "Rutinas pendientes",
      tooltip: "Alumnos que necesitan que les asignes un plan",
    },
    adherenceRate: {
      label: "Planes al día", // Tasa de Adherencia %
      tooltip: "Porcentaje de alumnos que completaron sus sesiones esta semana",
    }
  },
  alerts: {
    title: "Central de alertas",
    empty: "Todo bajo control. 🎯",
    types: {
      payment: {
        title: "Cuota vencida",
        action: "Avisar por WhatsApp",
      },
      risk: {
        title: "Riesgo de abandono",
        action: "Enviar mensaje motivacional",
      },
      noPlan: {
        title: "Sin rutina asignada",
        action: "Armar plan",
      }
    }
  },
  feed: {
    title: "Actividad reciente",
    empty: "Todavía no hay actividad reciente.",
    labels: {
      sessionCompleted: "completó su sesión",
      weightLogged: "registró nuevo peso en",
      newStudent: "se unió a tu equipo",
    }
  },
  recentStudents: {
    title: "Últimos ingresos",
    empty: "Aún no tenés alumnos.",
    emptySearch: "No hay resultados para tu búsqueda.",
    action: "Ver todos",
    columns: {
      name: "Alumno",
      plan: "Plan",
      status: "Estado",
    },
    filters: {
      searchPlaceholder: "Buscar por nombre o plan...",
      plan: {
        all: "Todos los planes",
      }
    },
    dropdownMenu: {
      viewProfile: "Ver Perfil",
      editRoutine: "Editar Rutina",
      registerPayment: "Registrar Pago",
      viewProgress: "Ver Progreso",
      copyMagicLink: "Copiar Magic Link",
      sendWhatsApp: "Enviar WhatsApp",
      archive: "Archivar",
      triggerAria: "Abrir menú de acciones",
    }
  },
  onboarding: {
    title: "Empezá por acá",
    description: "Tu cuenta está lista. Completá estos 3 pasos rápidos para sacarle todo el jugo a MiGym.",
    progressText: "1 de 3 completados",
    steps: {
      profile: {
        title: "Crear tu perfil",
        desc: "Nombre público guardado.",
      },
      plan: {
        title: "Crear un plan",
        desc: "Diseñá tu primer plan de entrenamiento.",
      },
      student: {
        title: "Sumar un alumno",
        desc: "E invitá a descargar la app.",
      }
    }
  },
  layout: {
    globalSearch: "Buscar alumnos, planes o ejercicios..."
  },
  fab: {
    newStudent: "Nuevo alumno",
    createPlan: "Crear plan nuevo",
    registerPayment: "Registrar pago manual"
  }
} as const;
