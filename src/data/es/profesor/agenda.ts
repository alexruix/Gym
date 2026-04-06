export const agendaCopy = {
  header: {
    title: "Agenda diaria",
    subtitle: "Gestioná tu agenda y optimizá el acompañamiento de tus alumnos.",
    actions: {
      manageTurnos: "Gestionar turnos",
    }
  },
  blocks: {
    empty: "No hay alumnos asignados a este turno.",
    noBlocks: "Todavía no tenés turnos configurados. Importá tus alumnos desde Excel o creá un turno manualmente.",
    full: "Turno lleno",
    activeNow: "Bloque activo",
  },
  studentCard: {
    completed: "Sesión completada",
    inProgress: "Entrenando",
    pending: "Sin iniciar",
    coreLift: "Ejercicio Core",
    actions: {
      viewRoutine: "Ver rutina",
      changeTurno: "Cambiar turno",
    }
  },
  modals: {
    changeTurno: {
      title: "Cambiar turno",
      description: "Mové a {{name}} a otro bloque horario para la sesión de hoy.",
      submit: "Confirmar cambio",
      success: "Turno actualizado correctamente",
    },
    logistics: {
      trigger: "Asignar alumnos",
      title: "Asignar alumnos",
      description: "Seleccioná los alumnos y asignalos a un turno.",
      searchPlaceholder: "Buscá alumnos por nombre...",
      emptySearch: "No se encontraron alumnos.",
      selectTurno: "Elegir turno",
      selectDays: "Días de asistencia",
      unassigned: "Sin turno",
      alreadyIn: "Ya está en: {{time}}",
      submitInitial: "Seleccioná alumnos",
      submitActive: "Sumar {{count}} alumnos al turno de las {{hora}}",
      success: "¡Listo! Ya sumaste a los alumnos al turno de las {{hora}}.",
    }
  }
};
