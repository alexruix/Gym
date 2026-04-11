import type { BaseEntity } from "./core";

export interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad_max: number;
  color_tag?: string;
  dias_asistencia: string[];
}

export interface StudentInAgenda extends BaseEntity {
  nombre: string;
  turno_id: string | null;
  dias_asistencia: string[];
}

export interface SessionInAgenda {
  alumno_id: string;
  progress: number;
  coreExercise?: {
    nombre: string;
    peso_target?: string;
    peso_real?: string;
  };
}
