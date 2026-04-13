/**
 * SSOT (Single Source of Truth) para las Planificaciones Master del Gimnasio.
 * Estos planes se sincronizan automáticamente con la base de datos (is_template: true).
 * Los ejercicios deben coincidir exactamente con los nombres en biblioteca-base.ts.
 */

export interface MasterPlanExercise {
  nombre: string;
  series: number;
  reps_target: string;
  descanso_seg: number;
  notas?: string;
  exercise_type?: "base" | "variante";
}

export interface MasterPlanRoutine {
  dia_numero: number;
  nombre_dia: string;
  ejercicios: MasterPlanExercise[];
}

export interface MasterPlanTemplate {
  nombre: string;
  descripcion: string;
  duracion_semanas: number;
  frecuencia_semanal: number;
  rutinas: MasterPlanRoutine[];
}

export const masterPlans: MasterPlanTemplate[] = [
  {
    nombre: "Plan de entrenamiento 3 días Mujer",
    descripcion: "Rutina de 3 días por semana diseñada para tonificar y fortalecer glúteos, piernas y tren superior.",
    duracion_semanas: 4,
    frecuencia_semanal: 3,
    rutinas: [
      {
        dia_numero: 1,
        nombre_dia: "Glúteos y Piernas",
        ejercicios: [
          { nombre: "Peso muerto rumano con mancuerna", series: 4, reps_target: "10", descanso_seg: 90 },
          { nombre: "Camilla de isquiotibiales", series: 3, reps_target: "12", descanso_seg: 90 },
          { nombre: "Elevación de cadera libre", series: 4, reps_target: "10", descanso_seg: 120 },
          { nombre: "Estocadas hacia atrás", series: 4, reps_target: "20", descanso_seg: 60 },
          { nombre: "Patada de glúteo en polea", series: 4, reps_target: "15", descanso_seg: 60 },
          { nombre: "Abdominales bisagras", series: 4, reps_target: "20", descanso_seg: 30 },
        ]
      },
      {
        dia_numero: 2,
        nombre_dia: "Tren Superior",
        ejercicios: [
          { nombre: "Jalón al pecho agarre abierto", series: 4, reps_target: "8", descanso_seg: 120 },
          { nombre: "Press inclinado con mancuernas", series: 4, reps_target: "10", descanso_seg: 90 },
          { nombre: "Press militar con mancuerna", series: 3, reps_target: "12", descanso_seg: 90 },
          { nombre: "Vuelos laterales con mancuernas parado", series: 4, reps_target: "12", descanso_seg: 60 },
          { nombre: "Tríceps en polea con agarre recto", series: 4, reps_target: "15", descanso_seg: 60 },
          { nombre: "Biceps alternado con mancuernas", series: 4, reps_target: "20", descanso_seg: 60 },
          { nombre: "Crunch corto en colchoneta", series: 4, reps_target: "20", descanso_seg: 30 },
        ]
      },
      {
        dia_numero: 3,
        nombre_dia: "Piernas Completas",
        ejercicios: [
          { nombre: "Planchas estaticas", series: 4, reps_target: "00:30 min", descanso_seg: 60 },
          { nombre: "Sillón de cuádriceps", series: 3, reps_target: "12", descanso_seg: 60 },
          { nombre: "Estocadas alternadas", series: 4, reps_target: "20", descanso_seg: 60 },
          { nombre: "Sentadilla sumo", series: 4, reps_target: "15", descanso_seg: 60 },
          { nombre: "Sentadilla libre con barra", series: 4, reps_target: "8", descanso_seg: 120 },
          { nombre: "Prensa", series: 4, reps_target: "15", descanso_seg: 60 },
        ]
      }
    ]
  }
];
