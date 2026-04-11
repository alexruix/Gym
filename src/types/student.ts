export interface EjercicioPlanMetric {
  id: string;
  orden: number;
  series: number;
  reps_target: string;
  descanso_seg: number;
  peso_target: string | null;
  exercise_type?: 'unico' | 'bloque';
  position?: number;
  grupo_bloque_id?: string | null;
  grupo_nombre?: string | null;
  biblioteca_ejercicios: {
    id: string;
    nombre: string;
    media_url: string | null;
  } | null;
  ejercicio_plan_personalizado?: any;
}

export interface RutinaDiariaMetric {
  id: string;
  dia_numero: number;
  nombre_dia: string | null;
  ejercicios_plan: EjercicioPlanMetric[];
}

export interface AssignedPlanMetric {
  id: string;
  nombre: string;
  duracion_semanas: number;
  is_template?: boolean;
  rutinas_diarias: RutinaDiariaMetric[];
}
