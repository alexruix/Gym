/**
 * Tipos compartidos para el motor de Calendario de Alumnos.
 */

export interface EjercicioDetail {
  id: string; // ID en sesion_ejercicios_instanciados
  biblioteca_ejercicio_id: string;
  ejercicio_plan_id?: string | null;
  nombre: string;
  series_real?: number | null;
  reps_real?: string | null;
  peso_real?: number | null;
  series_plan: number;
  reps_plan: string;
  peso_plan?: number | null;
  descanso_plan?: number | null;
  completado: boolean;
  media_url?: string | null;
  is_variation?: boolean;
}

export interface SesionDetalle {
  id: string;
  fecha_real: string;
  nombre_dia: string;
  estado: string;
  numero_dia_plan: number;
  semana_numero: number;
  cycle_number?: number;
  relative_week?: number;
  ejercicios: EjercicioDetail[];
}
