export const planesCopy = {
  header: {
    title: "Diseñar nuevo plan",
    subtitle: "Creá un plan de entrenamiento con rutinas separadas por días.",
  },
  list: {
    header: {
      title: "Tus planes",
      subtitle: "Gestioná tu biblioteca de rutinas y programas.",
      newBtn: "Crear plan"
    },
    table: {
      title: "Todos los planes",
      searchPlaceholder: "Buscar por nombre...",
      empty: "Todavía no tenés planes creados.",
      emptySearch: "No encontramos planes con ese nombre.",
      columns: {
        name: "Nombre del plan",
        frequency: "Frecuencia",
        studentsCount: "Alumnos activos",
      },
      dropdownMenu: {
        triggerAria: "Opciones del plan",
        viewDetails: "Ver detalle",
        editPlan: "Editar plan",
        duplicatePlan: "Duplicar plan",
        deletePlan: "Eliminar"
      }
    }
  },
  detail: {
    breadcrumb: "Tus planes",
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
      sets: "Series",
      reps: "Reps",
      rest: "Descanso",
      seconds: "seg",
    },
    students: {
      empty: "Ningún alumno está usando este plan.",
      assignBtn: "Asignar Alumno",
    },
    actions: {
      edit: "Editar Plan",
      duplicate: "Duplicar",
      back: "Volvé a Planes",
    }
  },
  form: {
    basic: {
      title: "Info del Plan",
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
        series: "Series",
        reps: "Reps Target (Ej. 10-12)",
        rest: "Descanso (seg)",
        notes: "Notas técnicas",
        remove: "Quitar",
        typeLabels: {
          base: "Base",
          complementary: "Complemento",
          accessory: "Accesorio",
          tooltip: "Los accesorios pueden rotar semanalmente"
        },
        rotation: {
          btn: "Alternar con...",
          active: "Rotación activa",
          duration: "Rotar cada",
          weeks: "semanas",
          selectExercise: "Elegir alternativo",
        }
      }
    },
    exerciseModal: {
      title: "Agregar ejercicios",
      titleCreate: "Crear nuevo ejercicio",
      searchPlaceholder: "Buscar en tu biblioteca...",
      empty: "No encontraste lo que buscabas?",
      emptyAction: "Crealo acá mismo.",
      addBtn: "Agregar",
      closeBtn: "Cerrar",
      filterBtn: "Filtrar",
      createBtn: "Nuevo Ejercicio",
      backBtn: "Volver al buscador",
    },
    submit: {
      btn: "Guardar plan completo",
      loading: "Guardando...",
    },
    messages: {
      success: "¡Plan creado exitosamente!",
      error: "Hubo un error al crear el plan.",
    }
  }
} as const;
