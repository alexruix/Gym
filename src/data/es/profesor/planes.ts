export const planesCopy = {
  header: {
    title: "Diseñar Nuevo Plan",
    subtitle: "Creá un plan de entrenamiento con rutinas separadas por días.",
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
      title: "2. Rutinas Diarias",
      selectDayTitle: "Día",
      dayNamePlaceholder: "Ej: Pecho y Tríceps",
      emptyDay: "No hay ejercicios en esta rutina aún.",
      addExerciseBtn: "+ Buscar y Agregar Ejercicio",
      exerciseCard: {
        series: "Series",
        reps: "Reps Target (Ej. 10-12)",
        rest: "Descanso (seg)",
        notes: "Notas técnicas",
        remove: "Quitar",
      }
    },
    exerciseModal: {
      title: "Agregar Ejercicios",
      searchPlaceholder: "Buscar en tu biblioteca...",
      empty: "No encontraste lo que buscabas? Creá el ejercicio primero en tu Biblioteca.",
      addBtn: "Agregar",
      closeBtn: "Cerrar",
    },
    submit: {
      btn: "Guardar Plan Completo",
      loading: "Guardando...",
    },
    messages: {
      success: "¡Plan creado exitosamente!",
      error: "Hubo un error al crear el plan.",
    }
  }
} as const;
