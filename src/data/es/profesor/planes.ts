export const planesCopy = {
  create: {
    step1: {
      title: "Nombre del Plan",
      placeholderName: "Ej: Hipertrofia 4 días",
      durationLabel: "Duración (Semanas)",
    },
    step2: {
      title: "Ejercicios del Plan",
      seriesLabel: "Series",
      repsLabel: "Reps",
      restLabel: "Descanso",
      restUnit: "seg",
      reviewButton: "Revisar Plan",
      placeholderExercise: "Ej: Press de Banca",
    },
    step3: {
      title: "Casi listo",
      subtitle: "Revisá que todo esté bien antes de enviarlo.",
      planLabel: "Plan de Entrenamiento",
      durationBadge: "SEM",
      confirmButton: "Confirmar y Crear",
    },
    step4: {
      title: "¡Plan Creado!",
      subtitle: "Ya podés asignarlo a tus alumnos para que empiecen a entrenar.",
      dashboardButton: "Ir al Dashboard",
      viewPlanButton: "Ver Plan",
    },
  },
  errors: {
    missingName: "Falta el nombre del plan.",
    missingExercises: "Agregá al menos un ejercicio.",
    emptyExercise: "Completá el nombre de los ejercicios.",
  }
} as const;
