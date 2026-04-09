export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alumnos: {
        Row: {
          id: string
          user_id: string | null
          profesor_id: string
          plan_id: string | null
          email: string | null
          nombre: string
          telefono: string | null
          notas: string | null
          dia_pago: number | null
          monto: number | null
          fecha_inicio: string | null
          estado: string | null
          access_token: string | null
          deleted_at: string | null
          ultimo_recordatorio_pago_at: string | null
          created_at: string | null
          turno_id: string | null
          dias_asistencia: string[] | null
          suscripcion_id: string | null
          monto_personalizado: boolean | null
          fecha_nacimiento: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          profesor_id: string
          plan_id?: string | null
          email?: string | null
          nombre: string
          telefono?: string | null
          notas?: string | null
          dia_pago?: number | null
          monto?: number | null
          fecha_inicio?: string | null
          estado?: string | null
          access_token?: string | null
          deleted_at?: string | null
          ultimo_recordatorio_pago_at?: string | null
          created_at?: string | null
          turno_id?: string | null
          dias_asistencia?: string[] | null
          suscripcion_id?: string | null
          monto_personalizado?: boolean | null
          fecha_nacimiento?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          profesor_id?: string
          plan_id?: string | null
          email?: string | null
          nombre?: string
          telefono?: string | null
          notas?: string | null
          dia_pago?: number | null
          monto?: number | null
          fecha_inicio?: string | null
          estado?: string | null
          access_token?: string | null
          deleted_at?: string | null
          ultimo_recordatorio_pago_at?: string | null
          created_at?: string | null
          turno_id?: string | null
          dias_asistencia?: string[] | null
          suscripcion_id?: string | null
          monto_personalizado?: boolean | null
          fecha_nacimiento?: string | null
        }
      }
      biblioteca_ejercicios: {
        Row: {
          id: string
          profesor_id: string | null
          parent_id: string | null
          nombre: string
          descripcion: string | null
          media_url: string | null
          tags: string[] | null
          is_template_base: boolean | null
          is_favorite: boolean | null
          usage_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profesor_id?: string | null
          parent_id?: string | null
          nombre: string
          descripcion?: string | null
          media_url?: string | null
          tags?: string[] | null
          is_template_base?: boolean | null
          is_favorite?: boolean | null
          usage_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profesor_id?: string | null
          parent_id?: string | null
          nombre?: string
          descripcion?: string | null
          media_url?: string | null
          tags?: string[] | null
          is_template_base?: boolean | null
          is_favorite?: boolean | null
          usage_count?: number | null
          created_at?: string | null
        }
      }
      bloques: {
        Row: {
          id: string
          profesor_id: string
          nombre: string
          tags: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profesor_id: string
          nombre: string
          tags?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profesor_id?: string
          nombre?: string
          tags?: string[] | null
          created_at?: string | null
        }
      }
      bloques_ejercicios: {
        Row: {
          id: string
          bloque_id: string
          ejercicio_id: string
          orden: number
          series: number | null
          reps_target: string | null
          descanso_seg: number | null
          notas: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          bloque_id: string
          ejercicio_id: string
          orden: number
          series?: number | null
          reps_target?: string | null
          descanso_seg?: number | null
          notas?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          bloque_id?: string
          ejercicio_id?: string
          orden?: number
          series?: number | null
          reps_target?: string | null
          descanso_seg?: number | null
          notas?: string | null
          created_at?: string | null
        }
      }
      ejercicio_plan_personalizado: {
        Row: {
          id: string
          alumno_id: string
          ejercicio_plan_id: string
          semana_numero: number
          series: number | null
          reps_target: string | null
          descanso_seg: number | null
          peso_target: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          alumno_id: string
          ejercicio_plan_id: string
          semana_numero?: number
          series?: number | null
          reps_target?: string | null
          descanso_seg?: number | null
          peso_target?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          alumno_id?: string
          ejercicio_plan_id?: string
          semana_numero?: number
          series?: number | null
          reps_target?: string | null
          descanso_seg?: number | null
          peso_target?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      ejercicios_plan: {
        Row: {
          id: string
          rutina_id: string
          ejercicio_id: string
          series: number | null
          reps_target: string | null
          descanso_seg: number | null
          orden: number | null
          exercise_type: "base" | "complementary" | "accessory" | null
          position: number | null
          peso_target: string | null
          grupo_bloque_id: string | null
          grupo_nombre: string | null
        }
        Insert: {
          id?: string
          rutina_id: string
          ejercicio_id: string
          series?: number | null
          reps_target?: string | null
          descanso_seg?: number | null
          orden?: number | null
          exercise_type?: "base" | "complementary" | "accessory" | null
          position?: number | null
          peso_target?: string | null
          grupo_bloque_id?: string | null
          grupo_nombre?: string | null
        }
        Update: {
          id?: string
          rutina_id?: string
          ejercicio_id?: string
          series?: number | null
          reps_target?: string | null
          descanso_seg?: number | null
          orden?: number | null
          exercise_type?: "base" | "complementary" | "accessory" | null
          position?: number | null
          peso_target?: string | null
          grupo_bloque_id?: string | null
          grupo_nombre?: string | null
        }
      }
      notificaciones: {
        Row: {
          id: string
          profesor_id: string
          alumno_id: string
          tipo: string
          mensaje: string
          referencia_id: string | null
          leida: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profesor_id: string
          alumno_id: string
          tipo: string
          mensaje: string
          referencia_id?: string | null
          leida?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profesor_id?: string
          alumno_id?: string
          tipo?: string
          mensaje?: string
          referencia_id?: string | null
          leida?: boolean | null
          created_at?: string | null
        }
      }
      pagos: {
        Row: {
          id: string
          alumno_id: string
          monto: number
          fecha_vencimiento: string
          fecha_pago: string | null
          estado: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          alumno_id: string
          monto: number
          fecha_vencimiento: string
          fecha_pago?: string | null
          estado?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          alumno_id?: string
          monto?: number
          fecha_vencimiento?: string
          fecha_pago?: string | null
          estado?: string | null
          created_at?: string | null
        }
      }
      plan_rotaciones: {
        Row: {
          id: string
          plan_id: string
          position: number
          applies_to_days: string[]
          cycles: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          position: number
          applies_to_days: string[]
          cycles: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          position?: number
          applies_to_days?: string[]
          cycles?: Json
          created_at?: string | null
        }
      }
      plan_variaciones: {
        Row: {
          id: string
          plan_id: string
          numero_semana: number
          tipo: "move_day" | "rest_day" | "redistribute" | "combine_days"
          ajustes: Json
          razon: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          numero_semana: number
          tipo: "move_day" | "rest_day" | "redistribute" | "combine_days"
          ajustes: Json
          razon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          numero_semana?: number
          tipo?: "move_day" | "rest_day" | "redistribute" | "combine_days"
          ajustes?: Json
          razon?: string | null
          created_at?: string | null
        }
      }
      planes: {
        Row: {
          id: string
          profesor_id: string
          nombre: string
          descripcion: string | null
          duracion_semanas: number | null
          frecuencia_semanal: number | null
          is_template: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profesor_id: string
          nombre: string
          descripcion?: string | null
          duracion_semanas?: number | null
          frecuencia_semanal?: number | null
          is_template?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profesor_id?: string
          nombre?: string
          descripcion?: string | null
          duracion_semanas?: number | null
          frecuencia_semanal?: number | null
          is_template?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profesores: {
        Row: {
          id: string
          email: string
          nombre: string | null
          gym_nombre: string | null
          telefono: string | null
          bio: string | null
          ubicacion: string | null
          foto_url: string | null
          slug: string | null
          portada_url: string | null
          instagram: string | null
          youtube: string | null
          tiktok: string | null
          x_twitter: string | null
          especialidades: string[] | null
          notif_cuotas_vencer: boolean | null
          notif_cuota_vencida: boolean | null
          notif_alumno_completado: boolean | null
          notif_nuevo_alumno: boolean | null
          notif_email_semanal: boolean | null
          notif_frecuencia: string | null
          perfil_publico: boolean | null
          permitir_contacto: boolean | null
          mostrar_foto: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          nombre?: string | null
          gym_nombre?: string | null
          telefono?: string | null
          bio?: string | null
          ubicacion?: string | null
          foto_url?: string | null
          slug?: string | null
          portada_url?: string | null
          instagram?: string | null
          youtube?: string | null
          tiktok?: string | null
          x_twitter?: string | null
          especialidades?: string[] | null
          notif_cuotas_vencer?: boolean | null
          notif_cuota_vencida?: boolean | null
          notif_alumno_completado?: boolean | null
          notif_nuevo_alumno?: boolean | null
          notif_email_semanal?: boolean | null
          notif_frecuencia?: string | null
          perfil_publico?: boolean | null
          permitir_contacto?: boolean | null
          mostrar_foto?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          gym_nombre?: string | null
          telefono?: string | null
          bio?: string | null
          ubicacion?: string | null
          foto_url?: string | null
          slug?: string | null
          portada_url?: string | null
          instagram?: string | null
          youtube?: string | null
          tiktok?: string | null
          x_twitter?: string | null
          especialidades?: string[] | null
          notif_cuotas_vencer?: boolean | null
          notif_cuota_vencida?: boolean | null
          notif_alumno_completado?: boolean | null
          notif_nuevo_alumno?: boolean | null
          notif_email_semanal?: boolean | null
          notif_frecuencia?: string | null
          perfil_publico?: boolean | null
          permitir_contacto?: boolean | null
          mostrar_foto?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      rutinas_diarias: {
        Row: {
          id: string
          plan_id: string
          dia_numero: number
          nombre_dia: string | null
          orden: number | null
        }
        Insert: {
          id?: string
          plan_id: string
          dia_numero: number
          nombre_dia?: string | null
          orden?: number | null
        }
        Update: {
          id?: string
          plan_id?: string
          dia_numero?: number
          nombre_dia?: string | null
          orden?: number | null
        }
      }
      sesion_ejercicios_instanciados: {
        Row: {
          id: string
          sesion_id: string
          ejercicio_id: string
          ejercicio_plan_id: string | null
          orden: number
          series_plan: number
          reps_plan: string
          peso_plan: number | null
          descanso_seg: number | null
          descanso_plan: number | null
          series_real: number | null
          reps_real: string | null
          peso_real: number | null
          exercise_type: string | null
          is_variation: boolean | null
          nota_alumno: string | null
          respuesta_profesor: string | null
          completado: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          sesion_id: string
          ejercicio_id: string
          ejercicio_plan_id?: string | null
          orden?: number
          series_plan?: number
          reps_plan?: string
          peso_plan?: number | null
          descanso_seg?: number | null
          descanso_plan?: number | null
          series_real?: number | null
          reps_real?: string | null
          peso_real?: number | null
          exercise_type?: string | null
          is_variation?: boolean | null
          nota_alumno?: string | null
          respuesta_profesor?: string | null
          completado?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sesion_id?: string
          ejercicio_id?: string
          ejercicio_plan_id?: string | null
          orden?: number
          series_plan?: number
          reps_plan?: string
          peso_plan?: number | null
          descanso_seg?: number | null
          descanso_plan?: number | null
          series_real?: number | null
          reps_real?: string | null
          peso_real?: number | null
          exercise_type?: string | null
          is_variation?: boolean | null
          nota_alumno?: string | null
          respuesta_profesor?: string | null
          completado?: boolean | null
          created_at?: string | null
        }
      }
      sesiones_instanciadas: {
        Row: {
          id: string
          alumno_id: string
          plan_id: string
          numero_dia_plan: number
          semana_numero: number
          fecha_real: string
          nombre_dia: string | null
          estado: string
          notas_alumno: string | null
          notas_profesor: string | null
          completed_by_professor: boolean | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          alumno_id: string
          plan_id: string
          numero_dia_plan: number
          semana_numero?: number
          fecha_real?: string
          nombre_dia?: string | null
          estado?: string
          notas_alumno?: string | null
          notas_profesor?: string | null
          completed_by_professor?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          alumno_id?: string
          plan_id?: string
          numero_dia_plan?: number
          semana_numero?: number
          fecha_real?: string
          nombre_dia?: string | null
          estado?: string
          notas_alumno?: string | null
          notas_profesor?: string | null
          completed_by_professor?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      student_plan_customizations: {
        Row: {
          id: string
          alumno_id: string
          plan_id: string
          numero_semana: number
          tipo: "move_day" | "rest_day" | "redistribute" | "combine_days"
          ajustes: Json
          razon: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          alumno_id: string
          plan_id: string
          numero_semana: number
          tipo: "move_day" | "rest_day" | "redistribute" | "combine_days"
          ajustes: Json
          razon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          alumno_id?: string
          plan_id?: string
          numero_semana?: number
          tipo?: "move_day" | "rest_day" | "redistribute" | "combine_days"
          ajustes?: Json
          razon?: string | null
          created_at?: string | null
        }
      }
      suscripciones: {
        Row: {
          id: string
          profesor_id: string
          nombre: string
          monto: number
          cantidad_dias: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profesor_id: string
          nombre: string
          monto?: number
          cantidad_dias?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profesor_id?: string
          nombre?: string
          monto?: number
          cantidad_dias?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      turnos: {
        Row: {
          id: string
          profesor_id: string
          nombre: string
          hora_inicio: string
          hora_fin: string
          capacidad_max: number | null
          color_tag: string | null
          created_at: string | null
          dias_asistencia: string[] | null
        }
        Insert: {
          id?: string
          profesor_id: string
          nombre: string
          hora_inicio: string
          hora_fin: string
          capacidad_max?: number | null
          color_tag?: string | null
          created_at?: string | null
          dias_asistencia?: string[] | null
        }
        Update: {
          id?: string
          profesor_id?: string
          nombre?: string
          hora_inicio?: string
          hora_fin?: string
          capacidad_max?: number | null
          color_tag?: string | null
          created_at?: string | null
          dias_asistencia?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_plan_completo: {
        Args: {
          p_plan_id: string
          p_profesor_id: string
          p_nombre: string
          p_duracion_semanas: number
          p_frecuencia_semanal: number
          p_rutinas: Json
          p_rotaciones?: Json
        }
        Returns: boolean
      }
      crear_plan_completo: {
        Args: {
          p_profesor_id: string
          p_nombre: string
          p_duracion_semanas: number
          p_frecuencia_semanal: number
          p_rutinas: Json
          p_rotaciones?: Json
        }
        Returns: string
      }
      fork_plan: {
        Args: {
          p_plan_id: string
          p_alumno_id: string
          p_nuevo_nombre: string
        }
        Returns: string
      }
      inicializar_suscripciones_profesor: {
        Args: {
          p_profesor_id: string
        }
        Returns: null
      }
      registrar_pago_atomico: {
        Args: {
          p_alumno_id: string
          p_pago_id: string
          p_monto: number
          p_profesor_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      exercise_type: "base" | "complementary" | "accessory"
      variation_type: "move_day" | "rest_day" | "redistribute" | "combine_days"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
