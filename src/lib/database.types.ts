export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profesores: {
        Row: {
          id: string
          email: string
          nombre: string | null
          gym_nombre: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nombre?: string | null
          gym_nombre?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          gym_nombre?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profesores_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      biblioteca_ejercicios: {
        Row: {
          id: string
          profesor_id: string
          nombre: string
          descripcion: string | null
          media_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profesor_id: string
          nombre: string
          descripcion?: string | null
          media_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profesor_id?: string
          nombre?: string
          descripcion?: string | null
          media_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_ejercicios_profesor_id_fkey"
            columns: ["profesor_id"]
            referencedRelation: "profesores"
            referencedColumns: ["id"]
          }
        ]
      }
      planes: {
        Row: {
          id: string
          profesor_id: string
          nombre: string
          duracion_semanas: number
          frecuencia_semanal: number
          created_at: string
        }
        Insert: {
          id?: string
          profesor_id: string
          nombre: string
          duracion_semanas?: number
          frecuencia_semanal?: number
          created_at?: string
        }
        Update: {
          id?: string
          profesor_id?: string
          nombre?: string
          duracion_semanas?: number
          frecuencia_semanal?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planes_profesor_id_fkey"
            columns: ["profesor_id"]
            referencedRelation: "profesores"
            referencedColumns: ["id"]
          }
        ]
      }
      rutinas_diarias: {
        Row: {
          id: string
          plan_id: string
          dia_numero: number
          nombre_dia: string | null
          orden: number
        }
        Insert: {
          id?: string
          plan_id: string
          dia_numero: number
          nombre_dia?: string | null
          orden?: number
        }
        Update: {
          id?: string
          plan_id?: string
          dia_numero?: number
          nombre_dia?: string | null
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "rutinas_diarias_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "planes"
            referencedColumns: ["id"]
          }
        ]
      }
      ejercicios_plan: {
        Row: {
          id: string
          rutina_id: string
          ejercicio_id: string
          series: number
          reps_target: string
          descanso_seg: number
          orden: number
        }
        Insert: {
          id?: string
          rutina_id: string
          ejercicio_id: string
          series?: number
          reps_target?: string
          descanso_seg?: number
          orden?: number
        }
        Update: {
          id?: string
          rutina_id?: string
          ejercicio_id?: string
          series?: number
          reps_target?: string
          descanso_seg?: number
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "ejercicios_plan_rutina_id_fkey"
            columns: ["rutina_id"]
            referencedRelation: "rutinas_diarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ejercicios_plan_ejercicio_id_fkey"
            columns: ["ejercicio_id"]
            referencedRelation: "biblioteca_ejercicios"
            referencedColumns: ["id"]
          }
        ]
      }
      alumnos: {
        Row: {
          id: string
          user_id: string | null
          profesor_id: string
          plan_id: string | null
          email: string | null
          nombre: string
          fecha_inicio: string
          estado: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          profesor_id: string
          plan_id?: string | null
          email?: string | null
          nombre: string
          fecha_inicio?: string
          estado?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          profesor_id?: string
          plan_id?: string | null
          email?: string | null
          nombre?: string
          fecha_inicio?: string
          estado?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumnos_profesor_id_fkey"
            columns: ["profesor_id"]
            referencedRelation: "profesores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumnos_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "planes"
            referencedColumns: ["id"]
          }
        ]
      }
      pagos: {
        Row: {
          id: string
          alumno_id: string
          monto: number
          fecha_vencimiento: string
          fecha_pago: string | null
          estado: string
          created_at: string
        }
        Insert: {
          id?: string
          alumno_id: string
          monto: number
          fecha_vencimiento: string
          fecha_pago?: string | null
          estado?: string
          created_at?: string
        }
        Update: {
          id?: string
          alumno_id?: string
          monto?: number
          fecha_vencimiento?: string
          fecha_pago?: string | null
          estado?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_alumno_id_fkey"
            columns: ["alumno_id"]
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          }
        ]
      }
      sesiones: {
        Row: {
          id: string
          alumno_id: string
          fecha: string
          completada: boolean
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          alumno_id: string
          fecha: string
          completada?: boolean
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          alumno_id?: string
          fecha?: string
          completada?: boolean
          notas?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_alumno_id_fkey"
            columns: ["alumno_id"]
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          }
        ]
      }
      ejercicio_logs: {
        Row: {
          id: string
          sesion_id: string
          ejercicio_id: string
          series_reales: number | null
          reps_reales: number | null
          peso_kg: number | null
          rpe: number | null
          created_at: string
        }
        Insert: {
          id?: string
          sesion_id: string
          ejercicio_id: string
          series_reales?: number | null
          reps_reales?: number | null
          peso_kg?: number | null
          rpe?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          sesion_id?: string
          ejercicio_id?: string
          series_reales?: number | null
          reps_reales?: number | null
          peso_kg?: number | null
          rpe?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ejercicio_logs_sesion_id_fkey"
            columns: ["sesion_id"]
            referencedRelation: "sesiones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ejercicio_logs_ejercicio_id_fkey"
            columns: ["ejercicio_id"]
            referencedRelation: "ejercicios_plan"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
