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
          nombre: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          nombre: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          created_at?: string
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
      planes: {
        Row: {
          id: string
          profesor_id: string
          nombre: string
          duracion_semanas: number
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profesor_id: string
          nombre: string
          duracion_semanas: number
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profesor_id?: string
          nombre?: string
          duracion_semanas?: number
          descripcion?: string | null
          created_at?: string
          updated_at?: string
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
      ejercicios: {
        Row: {
          id: string
          plan_id: string
          nombre: string
          descripcion: string | null
          series: number
          reps: number
          descanso_seg: number
          media_url: string | null
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          nombre: string
          descripcion?: string | null
          series: number
          reps: number
          descanso_seg?: number
          media_url?: string | null
          orden: number
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          nombre?: string
          descripcion?: string | null
          series?: number
          reps?: number
          descanso_seg?: number
          media_url?: string | null
          orden?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ejercicios_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "planes"
            referencedColumns: ["id"]
          }
        ]
      }
      alumnos: {
        Row: {
          id: string
          profesor_id: string
          email: string
          nombre: string
          plan_id: string | null
          fecha_inicio: string
          dia_pago: number
          estado: 'activo' | 'pausado' | 'completado'
          created_at: string
        }
        Insert: {
          id?: string
          profesor_id: string
          email: string
          nombre: string
          plan_id?: string | null
          fecha_inicio?: string
          dia_pago?: number
          estado?: 'activo' | 'pausado' | 'completado'
          created_at?: string
        }
        Update: {
          id?: string
          profesor_id?: string
          email?: string
          nombre?: string
          plan_id?: string | null
          fecha_inicio?: string
          dia_pago?: number
          estado?: 'activo' | 'pausado' | 'completado'
          created_at?: string
        }
        Relationships: [
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
      sesiones: {
        Row: {
          id: string
          alumno_id: string
          plan_id: string
          fecha: string
          numero_sesion: number
          completada: boolean
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          alumno_id: string
          plan_id: string
          fecha: string
          numero_sesion: number
          completada?: boolean
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          alumno_id?: string
          plan_id?: string
          fecha?: string
          numero_sesion?: number
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
          },
          {
            foreignKeyName: "sesiones_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "planes"
            referencedColumns: ["id"]
          }
        ]
      }
      ejercicio_logs: {
        Row: {
          id: string
          sesion_id: string
          ejercicio_id: string
          alumno_id: string
          numero_serie: number
          reps: number
          peso_kg: number
          rpe: number | null
          created_at: string
        }
        Insert: {
          id?: string
          sesion_id: string
          ejercicio_id: string
          alumno_id: string
          numero_serie: number
          reps: number
          peso_kg: number
          rpe?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          sesion_id?: string
          ejercicio_id?: string
          alumno_id?: string
          numero_serie?: number
          reps?: number
          peso_kg?: number
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
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ejercicio_logs_alumno_id_fkey"
            columns: ["alumno_id"]
            referencedRelation: "alumnos"
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
