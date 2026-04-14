export const globalCopy = {
  brand: {
    nameLine1: "MI",
    nameHighlight: "GYM",
    proBadge: "PRO",
  },
  layout: {
    profesorNav: {
      dashboard: "Dashboard",
      agenda: "Agenda",
      planes: "Planificaciones",
      alumnos: "Alumnos",
      ejercicios: "Ejercicios",
      pagos: "Pagos",
      configuracion: "Configuración",
      salir: "Salir"
    },
    alumnoNav: {
      inicio: "Inicio",
      miPlan: "Mi Plan",
      progreso: "Progreso",
      salir: "Cerrar sesión"
    },
    profesorHeader: {
      role: "Profesor",
      gymNamePlaceholder: "Gimnasio Central"
    }
  },
  actions: {
    back: "Volver",
    continue: "Continuar",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    edit: "Editar",
    add: "Agregar",
    delete: "Eliminar",
    confirm: "Confirmar",
  },
  errors: {
    unexpected: "Error inesperado. Recargá la página.",
    network: "Se cortó la conexión. Reintentá.",
  },
} as const;
