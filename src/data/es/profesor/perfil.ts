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
      empty: "Sin observaciones o notas registradas."
    },
    info: {
      label: "Información del alumno",
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
      plan: "Planificación",
      routine: "Rutina",
      notes: "Notas",
      info: "Información",
      history: "Historial"
    },
    notes: {
      title: "Notas Privadas",
      subtitle: "Aclaraciones sobre lesiones, objetivos o cuidados especiales.",
      placeholder: "Escribí acá las aclaraciones importantes para este alumno...",
      saveAction: "Guardar notas",
      lastUpdate: "Actualizado el",
      emptyState: "Todavía no cargaste ninguna nota para este alumno.",
      success: "✅ Notas actualizadas correctamente"
    },
    routine: {
      title: "Rutina Asignada",
      emptyState: {
        title: "Sin plan asignado",
        description: "Esta persona aún no tiene rutinas activas, debes asignarle una.",
        assignBtn: "Asignar de planificación",
        createBtn: "Crear nuevo Plan",
        changeBtn: "Cambiar de plan",
        promoteBtn: "Promover a maestro"
      },
      masterPlan: {
        bannerTitle: "Planificación",
        bannerDesc: "Los cambios en esta planificación afectarán a todos los alumnos vinculados.",
        editMasterBtn: "Editar planificación",
        personalizeBtn: "Personalizar para este alumno",
        restrictedAction: "Acción restringida",
        restrictedDesc: "Para modificar la estructura, primero debés personalizar el plan para este alumno.",
        hideSwap: "Las variaciones solo se editan en la Planificación o en una versión personalizada."
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
        title: "Centro de carga semanal",
        subtitle: "Ajustá las métricas sobre la base del plan activo.",
        helper: "Cargá las métricas para esta semana sobre la base del plan",
        lastWeights: "Ver últimos pesos"
      },
      assignmentDialog: {
        title: "Asignar planificación",
        description: "Elegí una planificación de tu biblioteca para este alumno.",
        confirmBtn: "Asignar",
        frequencyMismatch: "El plan seleccionado es de {p} días, pero el alumno tiene registrados {s} días de asistencia. Esto podría causar desajustes en la agenda.",
        overwrite: "Vas a reemplazar la planificación actual: {name}. El progreso de esta semana se perderá.",
        success: "Planificación asignada correctamente",
        error: "No se pudieron cargar las planificaciones",
        saveError: "Error al asignar la planificación"
      }
    },
    calendar: {
      title: "Agenda",
      metrics: {
        compliance: "Cumplimiento",
        sessions: "Sesiones"
      },
      status: {
        loading: "Cargando historial...",
        fetching: "Consultando sesión..."
      },
      banners: {
        omissions: {
          tag: "Inasistencia prolongada detectada",
          title: "¿Querés reajustar el calendario para que no pierda contenido técnico?",
          action: "Reajustar 3 días"
        },
        structural: {
          tag: "Cambios estructurales detectados",
          title: "¿Querés guardar esta nueva estructura como una planificación?",
          action: "Guardar como nueva planificación"
        }
      },
      actions: {
        complete: "Marcar como realizada",
        addExercise: "Añadir ejercicio a la rutina",
        addExtraSession: "Sumar sesión extra",
        copyPlan: "Cargar del Plan",
        copyLast: "Clonar sesión pasada",
      },
      restDay: {
        title: "Día de Descanso",
        tag: "RECUPERACIÓN TÉCNICA",
        description: "El plan no tiene actividad hoy, pero podés activar una rutina desde acá.",
        action: "Sumar sesión extra"
      },

      exerciseRow: {
        variant: "Variante",
        real: "Real",
        swapHint: "Sustituir",
        removeHint: "Eliminar"
      },
      dialogs: {
        selector: {
          addTitle: "Añadir ejercicio",
          swapTitle: "Sustituir ejercicio",
          addDesc: "Se añadirá al final de la rutina",
          swapDesc: "Se perderá el progreso de hoy"
        },
        scope: {
          addTitle: "¿Añadir ejercicio?",
          removeTitle: "¿Eliminar ejercicio?",
          swapTitle: "¿Sustituir ejercicio?",
          description: "Seleccioná el alcance de este cambio para",
          temporary: {
            title: "Solo por hoy",
            desc: "El cambio se aplicará únicamente a esta sesión de entrenamiento."
          },
          permanent: {
            title: "Plan Base",
            tag: "Permanente",
            desc: "Modifica la estructura del plan para todas las semanas siguientes."
          },
          cancel: "Cancelar operación"
        }
      }
    }
  }
} as const;
