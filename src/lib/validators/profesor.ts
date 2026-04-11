import { z } from "zod";

/**
 * PROFESOR VALIDATORS
 * Esquemas para la gestión administrativa y técnica del docente.
 */

// Plan validation (SSOT for creating/editing plans)
export const planSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres").max(100, "Máximo 100 caracteres"),
  duracion_semanas: z.number().int().min(0).max(52),
  frecuencia_semanal: z.number().int().min(0).max(7),
  descripcion: z.string().optional(),
  is_template: z.boolean().default(true),
  rutinas: z.array(
    z.object({
      dia_numero: z.number().int().min(1).max(365),
      nombre_dia: z.string().optional(),
      ejercicios: z.array(
        z.object({
          ejercicio_id: z.string().uuid(),
          series: z.number().int().min(0).optional(),
          reps_target: z.string().optional(),
          descanso_seg: z.number().int().min(0).optional(),
          orden: z.number().int().min(0).optional(),
          exercise_type: z.enum(["base", "complementary", "accessory"]).optional().default("base"),
          position: z.number().int().min(0).optional().default(0),
          notas: z.string().optional(),
          peso_target: z.string().optional().default(""),
          grupo_bloque_id: z.string().uuid().optional().nullable(),
          grupo_nombre: z.string().optional().nullable(),
        })
      )
    })
  ).min(1, "El plan debe tener al menos 1 rutina"),
  rotaciones: z.array(
    z.object({
      position: z.number().int(),
      applies_to_days: z.array(z.string()).optional(),
      cycles: z.array(
        z.object({
          duration_weeks: z.number().int().min(1),
          exercises: z.array(z.string().uuid()),
        })
      ),
    })
  ).optional().default([]),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Exercise Library validation
export const exerciseLibrarySchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  descripcion: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  media_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  tags: z.array(z.string()).max(6, "Máximo 6 etiquetas"),
  is_template_base: z.boolean().optional(),
  variants: z.array(z.string()).optional(),
  is_favorite: z.boolean().optional().default(false),
  usage_count: z.number().int().optional().default(0),
});

export type ExerciseLibraryFormData = z.infer<typeof exerciseLibrarySchema> & {
  existing_variants?: { id: string, nombre: string }[];
};

// Block validation
export const blockSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  tags: z.array(z.string()),
  ejercicios: z.array(
    z.object({
      ejercicio_id: z.string().uuid(),
      orden: z.number().int().min(0),
      series: z.number().int().min(1),
      reps_target: z.string().min(1),
      descanso_seg: z.number().int().min(0),
      notas: z.string().optional(),
    })
  ).min(1, "El bloque debe tener al menos 1 ejercicio"),
});

export type BlockFormData = z.infer<typeof blockSchema>;

export const studentSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  plan_id: z.string().uuid("Plan inválido").optional(),
  turno_id: z.string().uuid("Turno inválido").optional().nullable(),
  dias_asistencia: z.array(z.string()).default([]),
  fecha_inicio: z.coerce.date().default(() => new Date()),
  dia_pago: z.number().min(1).max(31).default(1),
  fecha_nacimiento: z.coerce.date().optional().nullable(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

export const turnoSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  hora_inicio: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Formato HH:MM requerido"),
  hora_fin: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Formato HH:MM requerido"),
  capacidad_max: z.number().int().min(1).default(10),
  color_tag: z.string().optional().nullable(),
  dias_asistencia: z.array(z.string()).default([]),
});

export type TurnoFormData = z.infer<typeof turnoSchema>;

export const updateStudentSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, "Nombre requerido").optional(),
  email: z.string().email("Email inválido").optional(),
  telefono: z.string().optional().nullable(),
  fecha_inicio: z.coerce.date().optional(),
  dia_pago: z.number().min(1).max(31).optional(),
  monto: z.number().min(0).optional().nullable(),
  suscripcion_id: z.string().uuid().optional().nullable(),
  monto_personalizado: z.boolean().optional().default(false),
  notas: z.string().max(500).optional().nullable(),
  turno_id: z.string().uuid().optional().nullable(),
  dias_asistencia: z.array(z.string()).optional(),
  fecha_nacimiento: z.coerce.date().optional().nullable(),
});

export const personalizeExerciseSchema = z.object({
  alumno_id: z.string().uuid(),
  ejercicio_plan_id: z.string().uuid(),
  series: z.number().int().min(1),
  reps_target: z.string().min(1),
  descanso_seg: z.number().int().min(0),
});

export const inviteStudentSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: z.string().email("Email inválido"),
  plan_id: z.string().uuid("Plan inválido"),
  fecha_inicio: z.coerce.date(), // Validación inline se maneja en el componente o acción si es complejo
  dia_pago: z.number().min(1).max(31),
  telefono: z.string().optional(),
  monto: z.number().optional(),
  notas: z.string().max(500).optional(),
  turno_id: z.string().uuid().optional().nullable(),
  dias_asistencia: z.array(z.string()).default([]),
  cobrarPrimerMes: z.boolean().default(false),
  fecha_nacimiento: z.coerce.date().optional().nullable(),
});

export const paymentSchema = z.object({
  monto: z.number().min(0),
  mes_pago: z.string(),
  estado: z.enum(["pagado", "por_vencer", "vencido"]),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export const updatePublicProfileSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  slug: z.string().optional().nullable(),
  bio: z.string().max(160).optional().nullable(),
  instagram: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  x_twitter: z.string().optional().nullable(),
  especialidades: z.array(z.string()).max(10).default([]),
  perfil_publico: z.boolean().default(false),
});

export const updateNotificationsSchema = z.object({
  notif_cuotas_vencer: z.boolean().default(true),
  notif_cuota_vencida: z.boolean().default(true),
  notif_alumno_completado: z.boolean().default(true),
  notif_nuevo_alumno: z.boolean().default(true),
  notif_email_semanal: z.boolean().default(false),
  notif_frecuencia: z.enum(["evento", "diario", "semanal"]).default("evento"),
});

export const updatePrivacySchema = z.object({
  perfil_publico: z.boolean().default(false),
  permitir_contacto: z.boolean().default(true),
  mostrar_foto: z.boolean().default(true),
});

export const importPlansSchema = z.array(z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional().nullable(),
  duracion_semanas: z.number().int().min(1).max(52).default(4),
  frecuencia_semanal: z.number().int().min(1).max(7).default(3),
}));

export const bulkAssignSchema = z.object({
  studentIds: z.array(z.string().uuid()),
  turno_id: z.string().uuid(),
  dias_asistencia: z.array(z.string()).min(1),
});

export type BulkAssignData = z.infer<typeof bulkAssignSchema>;

export const subscriptionSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100),
  monto: z.number().min(0),
  cantidad_dias: z.number().int().min(0).max(7),
});

export const linkSubscriptionSchema = z.object({
  alumno_id: z.string().uuid(),
  suscripcion_id: z.string().uuid().nullable(),
  monto_personalizado: z.boolean().default(false),
  monto: z.number().optional(),
});

export const updateMassivePricesSchema = z.object({
  suscripcion_id: z.string().uuid(),
  nuevo_monto: z.number().min(0),
  nuevo_nombre: z.string().min(2).optional(),
});
