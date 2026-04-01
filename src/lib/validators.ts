import { z } from "zod";

// Plan validation (SSOT for creating/editing plans)
export const planSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  duracion_semanas: z.number().int().min(0).max(52),
  frecuencia_semanal: z.number().int().min(0).max(7),
  descripcion: z.string().optional(),
  is_template: z.boolean().default(true),
  rutinas: z.array(
    z.object({
      dia_numero: z.number().int().min(1).max(7),
      nombre_dia: z.string().optional(),
      ejercicios: z.array(
        z.object({
          ejercicio_id: z.string().uuid(),
          series: z.number().int().min(1),
          reps_target: z.string().min(1),
          descanso_seg: z.number().int().min(0),
          orden: z.number().int().min(0).optional(),
          exercise_type: z.enum(["base", "complementary", "accessory"]).optional().default("base"),
          position: z.number().int().min(0).optional().default(0),
          notas: z.string().optional(),
        })
      )
    })
  ).min(1, "El plan debe tener al menos 1 rutina"),
  rotaciones: z.array(
    z.object({
      position: z.number().int().min(0),
      applies_to_days: z.array(z.string()),
      cycles: z.array(
        z.object({
          duration_weeks: z.number().int().min(2).max(4),
          exercises: z.array(z.string().uuid())
        })
      )
    })
  ).optional(),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Exercise Library validation (SSOT for creating/editing exercises)
export const exerciseLibrarySchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  descripcion: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  media_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  tags: z.array(z.string()).max(6, "Máximo 6 etiquetas"),
  is_template_base: z.boolean().optional(),
  variants: z.array(z.string()).optional(),
});
export type ExerciseLibraryFormData = z.infer<typeof exerciseLibrarySchema> & {
  existing_variants?: { id: string, nombre: string }[];
};

export const studentSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  plan_id: z.string().uuid("Plan inválido").optional(),
  fecha_inicio: z.coerce.date().default(() => new Date()),
  dia_pago: z.number().min(1).max(31).default(1),
});

export const updateStudentSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, "Nombre requerido").optional(),
  email: z.string().email("Email inválido").optional(),
  telefono: z.string().optional().nullable(),
  fecha_inicio: z.coerce.date().optional(),
  dia_pago: z.number().min(1).max(31).optional(),
  notas: z.string().max(500).optional().nullable(),
});

export const personalizeExerciseSchema = z.object({
  alumno_id: z.string().uuid(),
  ejercicio_plan_id: z.string().uuid(),
  series: z.number().int().min(1),
  reps_target: z.string().min(1),
  descanso_seg: z.number().int().min(0),
});

export const inviteStudentSchema = z.object({
  nombre: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres"),
  
  email: z
    .string()
    .email("Email inválido"),
  
  plan_id: z
    .string()
    .uuid("Plan inválido"),
  
  fecha_inicio: z
    .coerce.date()
    .refine((date) => {
      // Comparar la fecha considerando la zona horaria local para evitar problemas de UTC
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "La fecha debe ser hoy o futura")
    .refine((date) => {
      const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      return date <= maxDate;
    }, "Máximo 1 año en el futuro"),
  
  dia_pago: z
    .number()
    .min(1, "Día inválido")
    .max(31, "Máximo 31 días"),
  
  telefono: z
    .string()
    .optional()
    .refine((tel) => !tel || /^[\d\s\-+()]{9,}$/.test(tel), "Teléfono inválido"),
  
  monto: z
    .number()
    .optional()
    .refine((monto) => !monto || monto > 0, "Monto debe ser > 0"),
  
  notas: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),
  
  cobrarPrimerMes: z
    .boolean()
    .default(false),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Pago validation
export const paymentSchema = z.object({
  monto: z.number().min(0),
  mes_pago: z.string(), // E.g. "Marzo 2026"
  estado: z.enum(["pagado", "por_vencer", "vencido"]),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Session tracker validation
export const sessionLogSchema = z.object({
  sesion_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(),
  series_completadas: z.array(
    z.object({
      reps: z.number().min(0),
      peso_kg: z.number().min(0),
      rpe: z.number().min(1).max(10).optional(),
    })
  ),
  nota_alumno: z.string().max(300, "Máximo 300 caracteres").optional(),
});

export type SessionLogData = z.infer<typeof sessionLogSchema>;

// Comment Exercise independently
export const commentExerciseSchema = z.object({
  alumno_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  nota_alumno: z.string().min(1, "Escribe un comentario").max(300, "Máximo 300 caracteres"),
});

export type CommentExerciseData = z.infer<typeof commentExerciseSchema>;

// Complete Session validation
export const completeSessionSchema = z.object({
  sesion_id: z.string().uuid(),
  notas_alumno: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export type CompleteSessionData = z.infer<typeof completeSessionSchema>;

// Account Settings validation (Private Info)
export const updateAccountSchema = z.object({
  email: z.string().email("Email inválido"),
  telefono: z.string().min(8, "Teléfono inválido").regex(/^\+[1-9]\d{1,14}$/, "Debe incluir el código de país (ej: +54911...)."),
});

export type UpdateAccountData = z.infer<typeof updateAccountSchema>;

// Public Profile validation (Landing Page Info)
const urlSchema = z.string().url("URL inválida").optional().nullable().or(z.literal(""));

export const updatePublicProfileSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  slug: z.string().min(3, "Mínimo 3 caracteres").regex(/^[a-z0-9-]+$/, "Sólo minúsculas, números y guiones").optional().nullable().or(z.literal("")),
  bio: z.string().max(160, "Máximo 160 caracteres").optional().nullable().or(z.literal("")),
  instagram: urlSchema,
  youtube: urlSchema,
  tiktok: urlSchema,
  x_twitter: urlSchema,
  especialidades: z.array(z.string()).max(10, "Máximo 10 especialidades").default([]),
  perfil_publico: z.boolean().default(false),
});

export type UpdatePublicProfileData = z.infer<typeof updatePublicProfileSchema>;

export const updateNotificationsSchema = z.object({
  notif_cuotas_vencer: z.boolean().default(true),
  notif_cuota_vencida: z.boolean().default(true),
  notif_alumno_completado: z.boolean().default(true),
  notif_nuevo_alumno: z.boolean().default(true),
  notif_email_semanal: z.boolean().default(false),
  notif_frecuencia: z.enum(["evento", "diario", "semanal"]).default("evento"),
});

export type UpdateNotificationsData = z.infer<typeof updateNotificationsSchema>;

export const updatePrivacySchema = z.object({
  perfil_publico: z.boolean().default(false),
  permitir_contacto: z.boolean().default(true),
  mostrar_foto: z.boolean().default(true),
});

export type UpdatePrivacyData = z.infer<typeof updatePrivacySchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "Mínimo 8 caracteres").regex(/[a-zA-Z]/, "Debe incluir letras").regex(/[0-9]/, "Debe incluir números"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
