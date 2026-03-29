export const planesCopy = {
  header: {
    title: "Diseñar Nuevo Plan",
    subtitle: "Creá un plan de entrenamiento con rutinas separadas por días.",
  },
  list: {
    header: {
      title: "Tus planes",
      subtitle: "Gestioná tu biblioteca de rutinas y programas.",
      newBtn: "Nuevo Plan"
    },
    table: {
      title: "Todos los planes",
      searchPlaceholder: "Buscar por nombre...",
      empty: "Todavía no tenés planes creados.",
      emptySearch: "No encontramos planes con ese nombre.",
      columns: {
        name: "Nombre del Plan",
        duration: "Duración",
        frequency: "Frecuencia",
        studentsCount: "Alumnos Activos",
      },
      dropdownMenu: {
        triggerAria: "Opciones del plan",
        viewDetails: "Ver Detalle",
        editPlan: "Editar Plan",
        duplicatePlan: "Duplicar Plan",
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
      title: "1. Info del Plan",
      nameOptions: ["Hipertrofia", "Fuerza", "Resistencia", "Pérdida de Peso", "Rehabilitación"],
      labels: {
        nombre: "Nombre o Enfoque del Plan",
        duracion: "Duración (Semanas)",
        frecuencia: "Frecuencia (Días por Semana)",
        descripcion: "Nota o descripción general (opcional)",
      },
      placeholders: {
        nombre: "Ej: Hipertrofia 4 días",
        descripcion: "Enfoque en tren superior 2x a la semana...",
      }
    },
    routines: {
      title: "2. Rutinas diarias",
      selectDayTitle: "Día",
      dayNamePlaceholder: "Ej: Pecho y Tríceps",
      emptyDay: "No hay ejercicios en esta rutina aún.",
      addExerciseBtn: "Agregar ejercicio",
      exerciseCard: {
        series: "Series",
        reps: "Reps Target (Ej. 10-12)",
        rest: "Descanso (seg)",
        notes: "Notas técnicas",
        remove: "Quitar",
      }
    },
    exerciseModal: {
      title: "Agregar ejercicios",
      searchPlaceholder: "Buscar en tu biblioteca...",
      empty: "No encontraste lo que buscabas? Creá el ejercicio primero en tu Biblioteca.",
      addBtn: "Agregar",
      closeBtn: "Cerrar",
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
