export interface EjercicioPlan {
  id: string;
  orden: number;
  series: number;
  reps_target: string;
  descanso_seg: number;
  peso_target?: string;
  exercise_type?: 'unico' | 'bloque';
  position?: number;
  grupo_bloque_id: string | null;
  grupo_nombre: string | null;
  grupo_tipo_bloque?: 'superserie' | 'circuito' | 'agrupador';
  grupo_vueltas?: number;
  grupo_descanso_ronda?: number;
  grupo_descanso_final?: number;
  biblioteca_ejercicios: {
    id: string;
    nombre: string;
    media_url: string | null;
  } | null;
}

export interface RutinaDiaria {
  id: string;
  dia_numero: number;
  nombre_dia: string | null;
  orden: number;
  ejercicios_plan: EjercicioPlan[];
}

export interface AlumnoDePlan {
  id: string;
  nombre: string;
  email: string | null;
  estado: string;
  telefono?: string;
  notas?: string;
  deleted_at?: string | null;
}

export interface PlanData {
  id: string;
  nombre: string;
  duracion_semanas: number;
  frecuencia_semanal: number;
  created_at: string;
  profesor_id: string | null;
  is_template: boolean;
  rutinas_diarias: RutinaDiaria[];
  alumnos: AlumnoDePlan[];
}

export type SyncStatus = "synced" | "syncing" | "error" | "retrying";
