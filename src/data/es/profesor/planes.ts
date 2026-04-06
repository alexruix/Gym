export const planesCopy = {
  header: {
    title: "Diseñar nuevo plan",
    subtitle: "Creá un plan de entrenamiento con rutinas separadas por días.",
  },
  list: {
    header: {
      title: "Planificaciones",
      subtitle: "Diseña tus planificaciones base que luego podes asignar y editar individualmente a tus alumnos.",
      newBtn: "Crear planificación"
    },
    table: {
      title: "Todas las planificaciones",
      searchPlaceholder: "Buscar por nombre...",
      empty: "Todavía no tenés planes creados.",
      emptySearch: "No encontramos planes con ese nombre.",
      columns: {
        name: "Nombre del plan",
        frequency: "Días / Semana",
        studentsCount: "Alumnos activos",
      },
      dropdownMenu: {
        triggerAria: "Opciones del plan",
        viewDetails: "Ver detalle",
        editPlan: "Editar planificación",
        duplicatePlan: "Duplicar plan",
        deletePlan: "Eliminar"
      }
    },
    import: {
      title: "Importar planes desde Excel",
      description: "Cargá masivamente tus plantillas de planes a la biblioteca.",
      dropzone: "Subí tu archivo .xlsx o .csv",
      hint: "Solo se importarán los nombres y metadatos básicos.",
      preview: "Vista previa de planes detectados",
      cancel: "Cancelar",
      confirm: "Importar ahora",
      empty: "No se detectaron planes válidos en el archivo.",
      success: "¡{count} planes importados con éxito!",
      error: "Error al leer el archivo o procesar la importación.",
      columns: {
        name: "Nombre",
        description: "Descripción",
        weeks: "Semanas",
        frequency: "Frecuencia"
      }
    }
  },
  detail: {
    breadcrumb: "Planes",
    meta: {
      duration: "Duración",
      frequency: "Frecuencia",
      weeks: "sem",
      daysPerWeek: "días / sem",
      createdAt: "Creado el",
      studentsCount: "Alumnos activos",
    },
    tabs: {
      routines: "Rutinas",
      students: "Alumnos",
    },
    routines: {
      dayLabel: "Día",
      emptyDay: "Sin ejercicios asignados a este día.",
    },
    students: {
      empty: "Ningún alumno está usando este plan.",
      assignBtn: "Asignar Alumno",
    },
    actions: {
      edit: "Editar planificación",
      duplicate: "Duplicar",
      back: "Volver",
    }
  },
  form: {
    basic: {
      title: "Información",
      nameOptions: ["Hipertrofia", "Fuerza", "Resistencia", "Pérdida de peso", "Rehabilitación"],
      labels: {
        nombre: "Nombre o enfoque del plan",
        descripcion: "Nota o descripción general (opcional)",
      },
      placeholders: {
        nombre: "Ej: Rutina de fuerza",
        descripcion: "Enfoque en tren superior 2x a la semana...",
      }
    },
    routines: {
      title: "Rutinas diarias",
      selectDayTitle: "Día",
      dayNamePlaceholder: "Ej: Pecho y tríceps",
      emptyDay: "No hay ejercicios en esta rutina aún.",
      addExerciseBtn: "Agregar ejercicio",
      exerciseCard: {
        remove: "Quitar",
      }
    },
    exerciseModal: {
      title: "Agregar ejercicios",
      titleCreate: "Crear nuevo ejercicio",
      searchPlaceholder: "Buscar en tu biblioteca...",
      empty: "Parece que no tenés ejercicios en tu biblioteca.",
      emptyAction: "Crealo acá mismo.",
      addBtn: "Agregar",
      closeBtn: "Cerrar",
      filterBtn: "Filtrar",
      createBtn: "Nuevo Ejercicio",
      backBtn: "Volver al buscador",
    },
    submit: {
      btn: "Guardar",
      loading: "Guardando...",
    },
    messages: {
      success: "¡Planificación creada exitosamente!",
      error: "Hubo un error al crear la planificación.",
    }
  }
} as const;
