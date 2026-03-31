// src/lib/plan-generator.ts

export type ExerciseType = 'base' | 'complementary' | 'accessory';

export interface EjercicioPlan {
  id: string;
  rutina_id: string;
  ejercicio_id: string;
  series: number;
  reps_target: string;
  descanso_seg: number;
  orden: number;
  exercise_type: ExerciseType;
  position: number;
  // Relación a biblioteca
  biblioteca_ejercicios?: {
    nombre: string;
    media_url: string;
    descripcion: string;
  };
}

export interface PlanRotacion {
  position: number;
  applies_to_days: string[];
  cycles: any[]; // e.g. [{ name: "Tricep Dips", media_url: "" }, { name: "Rope Pushdown", media_url: "" }]
}

/**
 * Motor Just-In-Time (JIT) para resolver la sesión del alumno.
 */
export class PlanGenerator {
  /**
   * Calcula el número de semana actual basado en la fecha de inicio del alumno.
   */
  static getCurrentWeek(fechaInicio: Date | string, currentDate: Date = new Date()): number {
    const start = new Date(fechaInicio);
    const now = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Semana 1 es desde el día 0 al 6.
    return Math.floor(diffDays / 7) + 1;
  }

  /**
   * Resuelve los ejercicios para un día específico manejando las rotaciones.
   */
  static resolveSessionExercises(
    ejerciciosBase: EjercicioPlan[],
    rotaciones: PlanRotacion[],
    currentWeek: number,
    diaSemanaStr: string
  ): EjercicioPlan[] {
    return ejerciciosBase.map(ej => {
      // Si es un accesorio y tiene una posición asignada, buscamos si hay rotación
      if (ej.exercise_type === 'accessory' && ej.position > 0) {
        const rotacionActiva = rotaciones.find(r => 
          r.position === ej.position && 
          r.applies_to_days.includes(diaSemanaStr)
        );

        if (rotacionActiva && rotacionActiva.cycles && rotacionActiva.cycles.length > 0) {
          // Determinar qué ciclo corresponde basado en la semana actual.
          // Ej: array de 2 elementos. Semana 1 -> index 0. Semana 2 -> index 1. Semana 3 -> index 0.
          const cycleIndex = (currentWeek - 1) % rotacionActiva.cycles.length;
          const cycleVariation = rotacionActiva.cycles[cycleIndex];

          // Retornamos el ejercicio pero "sobreescribiendo" los datos base con la variación
          return {
            ...ej,
            biblioteca_ejercicios: {
              ...(ej.biblioteca_ejercicios || {nombre: '', media_url: '', descripcion: ''}),
              nombre: cycleVariation.name || ej.biblioteca_ejercicios?.nombre || 'Variación Accesorio',
              media_url: cycleVariation.media_url || ej.biblioteca_ejercicios?.media_url || '',
            },
            // Le agregamos un flag transitorio para que la UI sepa que es una rotación destacada
            // @ts-ignore
            is_variation: cycleIndex > 0 
          };
        }
      }

      return ej;
    });
  }
}
