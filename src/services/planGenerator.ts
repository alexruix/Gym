import type { PlanFormData } from "@/lib/validators";

export interface ResolvedExercise {
  ejercicio_id: string;
  series: number;
  reps_target: string;
  descanso_seg: number;
  position: number;
  exercise_type: "base" | "complementary" | "accessory";
  notas?: string;
}

export interface ResolvedRoutine {
  dia_numero: number;
  nombre_dia?: string;
  ejercicios: ResolvedExercise[];
}

export interface RotationCycle {
  duration_weeks: number;
  exercises: string[]; // exercise_ids
}

export interface PlanRotation {
  position: number;
  applies_to_days: string[]; // ["lunes", "miercoles", ...] or numbers? 
  cycles: RotationCycle[];
}

/**
 * Motor de Generación Lazy para rutinas dinámicas.
 * Resuelve qué ejercicios debe hacer un alumno en una semana específica.
 */
export class PlanGenerator {
  
  /**
   * Resuelve los ejercicios para una posición específica en una semana dada.
   */
  static getExerciseForPosition(
    defaultExerciseId: string,
    position: number,
    weekNumber: number,
    rotations: PlanRotation[]
  ): string {
    const rotation = rotations.find(r => r.position === position);
    if (!rotation) return defaultExerciseId;

    // Calcular el ciclo actual
    let currentWeek = weekNumber;
    let totalCycleWeeks = rotation.cycles.reduce((acc, c) => acc + c.duration_weeks, 0);
    
    // Si la semana supera la duración total de la rotación, se reinicia el ciclo
    const weekInTotalCycle = ((currentWeek - 1) % totalCycleWeeks) + 1;

    let weekCounter = 0;
    for (const cycle of rotation.cycles) {
      weekCounter += cycle.duration_weeks;
      if (weekInTotalCycle <= weekCounter) {
        // Estamos en este ciclo. 
        // ¿Qué ejercicio del array 'exercises' toca? 
        // Si hay varios, podríamos alternar o tomar el primero (MVP: primero)
        return cycle.exercises[0] || defaultExerciseId;
      }
    }

    return defaultExerciseId;
  }

  /**
   * Resuelve la estructura de la semana.
   */
  static resolveWeeklyPlan(
    basePlan: any, // Estructura de rutinas_diarias y ejercicios_plan
    rotations: PlanRotation[],
    weekNumber: number,
    variations: any[] = [],
    customizations: any[] = []
  ): ResolvedRoutine[] {
    
    // 1. Clonar estructura base
    let routines: ResolvedRoutine[] = basePlan.map((r: any) => ({
      dia_numero: r.dia_numero,
      nombre_dia: r.nombre_dia,
      ejercicios: r.ejercicios.map((e: any) => ({
        ...e,
        ejercicio_id: this.getExerciseForPosition(e.ejercicio_id, e.position, weekNumber, rotations)
      }))
    }));

    // 2. Aplicar Variaciones Globales (Feriados, etc)
    routines = this.applyVariations(routines, variations, weekNumber);

    // 3. Aplicar Personalizaciones (Ausencias del alumno)
    routines = this.applyVariations(routines, customizations, weekNumber);

    return routines;
  }

  private static applyVariations(routines: ResolvedRoutine[], variations: any[], weekNumber: number): ResolvedRoutine[] {
    const applicableVariations = variations.filter(v => v.numero_semana === weekNumber);

    applicableVariations.forEach(v => {
      switch (v.tipo) {
        case 'rest_day':
          // Vaciar ejercicios del día especificado
          const dayToRest = routines.find(r => r.dia_numero === v.ajustes.dia_numero);
          if (dayToRest) dayToRest.ejercicios = [];
          break;
        
        case 'move_day':
          // Mover ejercicios de un día a otro
          const sourceDay = routines.find(r => r.dia_numero === v.ajustes.from_dia);
          const targetDay = routines.find(r => r.dia_numero === v.ajustes.to_dia);
          if (sourceDay && targetDay) {
            targetDay.ejercicios = [...targetDay.ejercicios, ...sourceDay.ejercicios];
            sourceDay.ejercicios = [];
          }
          break;
        
        // Más casos (redistribute, combine) pueden agregarse aquí
      }
    });

    return routines;
  }
}
