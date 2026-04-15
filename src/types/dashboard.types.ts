/**
 * MiGym Dashboard Types (V2.0)
 * SSOT para los contratos de datos entre Supabase y la UI del Profesor.
 */

export interface ExerciseLibraryItem {
  id: string;
  nombre: string;
  media_url?: string;
  parent_id?: string;
  is_template_base?: boolean;
  tags?: string[];
  descripcion?: string;
}

export interface EjercicioPlanRow {
  id?: string;
  orden: number;
  series: number;
  reps_target: string;
  descanso_seg: number;
  peso_target?: string;
  exercise_type?: "base" | "complementary" | "accessory";
  grupo_bloque_id?: string;
  grupo_nombre?: string;
  grupo_tipo_bloque?: 'agrupador' | 'circuito' | 'superserie';
  grupo_vueltas?: number;
  grupo_descanso_ronda?: number;
  grupo_descanso_final?: number;
  biblioteca_ejercicios?: ExerciseLibraryItem;
  exercise_id?: string; // Sometimes used as alias
}

export interface RutinaDiariaRow {
  id: string;
  dia_numero: number;
  nombre_dia?: string;
  orden: number;
  ejercicios_plan: EjercicioPlanRow[];
}

export interface PlanRow {
  id: string;
  nombre: string;
  duracion_semanas: number;
  frecuencia_semanal: number;
  created_at: string;
  profesor_id: string;
  is_template: boolean;
  rutinas_diarias?: RutinaDiariaRow[];
  alumnos?: AlumnoRow[];
  plan_rotaciones?: any[]; 
}

export interface ProfesorRow {
  id: string;
  nombre: string;
  email: string;
  foto_url?: string;
  slug?: string;
  bio?: string;
  telefono?: string;
}

export interface AlumnoRow {
  id: string;
  nombre: string;
  email?: string;
  estado: 'activo' | 'inactivo' | 'pendiente';
  telefono?: string;
  notas?: string;
  plan_id?: string;
  user_id?: string;
  planes?: PlanRow;
  avatar_url?: string;
  fecha_inicio: string;
  dia_pago?: number;
  monto?: number;
  monto_personalizado?: boolean;
  dias_asistencia?: string[];
  suscripciones?: any; 
  turnos?: any;
  pagos?: any[];
  peso_actual?: number;
  objetivo_principal?: string;
  lesiones?: string;
  fecha_nacimiento?: string;
  genero?: string;
  profesion?: string;
  nivel_experiencia?: string;
  perfil_completado?: boolean;
}

export interface DashboardStats {
  activeStudents: number;
  activePlans: number;
  pendingPayments: number;
  todaySessions: number;
}
