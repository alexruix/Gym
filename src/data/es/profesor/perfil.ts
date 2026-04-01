export const athleteProfileCopy = {
  header: {
    role: "Alumno",
    actions: {
      whatsapp: "WhatsApp",
      copyLink: "Copia Link",
      registerPayment: "Cobrar",
      linkCopied: "¡Magic Link copiado!",
      noPhone: "El alumno no tiene teléfono registrado."
    },
    status: {
      active: "Activo",
      overdue: "Moroso",
      noPlan: "Sin Plan Asignado"
    },
    metrics: {
        payDay: "Día de Pago",
        startDate: "Inició el",
        lastSession: "Última Sesión",
        never: "Nunca",
        today: "Hoy",
        yesterday: "Ayer",
        daysAgo: "Hace {n} días"
    }
  },
  sidebar: {
    criticalNotes: {
      label: "Notas Internas (Solo Profe)",
      semaphore: "SEMÁFORO DE SEGURIDAD",
      empty: "Sin observaciones o notas registradas."
    },
    info: {
      label: "Información del Alumno",
      email: "Email",
      phone: "Teléfono",
      startDate: "Fecha de inicio",
      payDay: "Día de pago",
      contactWhatsApp: "Contactar por WhatsApp",
      emptyPhone: "No registrado",
      emptyEmail: "No registrado"
    }
  },
  workspace: {
    tabs: {
      plan: "Plan",
      routine: "Rutina",
      info: "Información",
      history: "Historial"
    },
    routine: {
      title: "Rutina Asignada",
      emptyState: {
        title: "Aún no tiene un plan asignado.",
        description: "Podés asignarle una rutina yendo a tus Planes.",
        btnLabel: "Ver planes"
      },
      dayLabel: "Día",
      restLabel: "Descanso",
      targetLabel: "Target",
      sets: "Series",
      reps: "Reps",
      seconds: "seg",
      emptyDay: "Sin ejercicios asignados a este día.",
      actions: {
        deleteExercise: "Quitar",
        deleteDay: "Eliminar día",
        forkingTitle: "Personalizando plan...",
        forkingDesc: "Creando una instancia única para este alumno.",
        promote: "Subir a Maestro",
      },
      metricsTab: {
        title: "Centro de Carga Semanal",
        subtitle: "Ajustá las métricas sobre la base del plan activo.",
        helper: "Cargá las métricas para esta semana sobre la base del plan",
        lastWeights: "Ver últimos pesos"
      }
    }
  }
} as const;
