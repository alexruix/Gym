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
      label: "Cantidad de alumnos",
      tooltip: "Alumnos activos",
    },
    pendingRoutines: {
      label: "Alumnos sin rutina",
      tooltip: "Alumnos que necesitan que les asignes una rutina",
    },
    adherenceRate: {
      label: "Entrenaron esta semana",
      tooltip: "% de alumnos activos que registraron al menos 1 sesión en los últimos 7 días",
    },
    monthlyRevenue: {
      label: "Cobrado este mes",
      tooltip: "Total de pagos confirmados en el mes actual",
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
        action: "Asignar planificación",
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
    title: "Alumnos",
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
      editProfile: "Editar Perfil",
      editRoutine: "Editar Rutina",
      registerPayment: "Registrar Pago",
      copyMagicLink: "Copiar Link de acceso",
      sendWhatsApp: "Enviar WhatsApp",
      archive: "Archivar",
      triggerAria: "Abrir menú de acciones",
    }
  },
  onboarding: {
    title: "Arrancá por acá",
    description: "Completá estos pasos para poner a rodar tu gimnasio digital.",
    progressText: "{n} de 3 listos",
    steps: {
      profile: {
        title: "Creá tu perfil",
        desc: "Nombre público guardado.",
      },
      plan: {
        title: "Creá tu primer Plan",
        desc: "Armá una rutina para tus alumnos.",
      },
      student: {
        title: "Invitá un Alumno",
        desc: "Sumalo a la plataforma con un link.",
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
