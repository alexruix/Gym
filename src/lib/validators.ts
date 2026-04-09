import { z } from "zod";

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
  is_favorite: z.boolean().optional().default(false),
  usage_count: z.number().int().optional().default(0),
});
export type ExerciseLibraryFormData = z.infer<typeof exerciseLibrarySchema> & {
  existing_variants?: { id: string, nombre: string }[];
};

// Block validation (Reusable groups of exercises)
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

  turno_id: z
    .string()
    .uuid("Turno inválido")
    .optional()
    .nullable(),
  
  dias_asistencia: z
    .array(z.string())
    .default([]),
  
  cobrarPrimerMes: z
    .boolean()
    .default(false),
  
  fecha_nacimiento: z
    .coerce.date()
    .optional()
    .nullable()
    .refine((date) => {
      if (!date) return true;
      const minDate = new Date("1900-01-01");
      const today = new Date();
      return date >= minDate && date <= today;
    }, "Fecha de nacimiento inválida"),
});

export type StudentFormData = z.infer<typeof studentSchema>;

// Pago validation
export const paymentSchema = z.object({
  monto: z.number().min(0),
  mes_pago: z.string(), // E.g. "Marzo 2026"
  estado: z.enum(["pagado", "por_vencer", "vencido"]),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// =============================================
// Schemas para el Calendario Operativo Real
// Reemplazan los schemas legacy de sesiones
// =============================================

// Instanciar la sesión del día (obtener o crear)
export const instanciarSesionSchema = z.object({
  fecha_real: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD requerido").optional(),
  alumno_id: z.string().uuid("ID de alumno inválido").optional(),
  rutina_id: z.string().uuid("ID de rutina inválido").optional(),
});

export type InstanciarSesionData = z.infer<typeof instanciarSesionSchema>;

// Guardar las métricas reales de un ejercicio
export const logEjercicioInstanciadoSchema = z.object({
  sesion_ejercicio_id: z.string().uuid(),
  series_real: z.number().int().min(1),
  reps_real: z.string().min(1),
  peso_real: z.number().min(0).optional(),
  nota_alumno: z.string().max(300).optional(),
  completado: z.boolean().default(true),
});

export type LogEjercicioInstanciadoData = z.infer<typeof logEjercicioInstanciadoSchema>;

// Completar la sesión del día
export const completarSesionSchema = z.object({
  sesion_id: z.string().uuid(),
  notas_alumno: z.string().max(500).optional(),
});

export type CompletarSesionData = z.infer<typeof completarSesionSchema>;

export const addExerciseToStudentPlanSchema = z.object({
  alumno_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  biblioteca_id: z.string().uuid(),
  is_permanent: z.boolean().default(false),
});

export const removeExerciseFromStudentPlanSchema = z.object({
  alumno_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(), // Puede ser instancia_id o ejercicio_plan_id
  is_permanent: z.boolean().default(false),
});

export const swapExerciseInStudentPlanSchema = z.object({
  alumno_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(), // ID de la instancia actual
  nuevo_biblioteca_id: z.string().uuid(), // ID del nuevo ejercicio en biblioteca
  is_permanent: z.boolean().default(false),
});

// Schema legacy mantenido para compatibilidad con el componente ActiveSession
export const sessionLogSchema = z.object({
  sesion_id: z.string(),
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

// Comment Exercise independently (mantenemos para notas inline)
export const commentExerciseSchema = z.object({
  alumno_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  nota_alumno: z.string().min(1, "Escribe un comentario").max(300, "Máximo 300 caracteres"),
});

export type CommentExerciseData = z.infer<typeof commentExerciseSchema>;

// Complete Session validation (legacy, mantenido para compatibilidad)
export const completeSessionSchema = z.object({
  sesion_id: z.string(),
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

export const importPlansSchema = z.array(z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional().nullable(),
  duracion_semanas: z.number().int().min(1).max(52).default(4),
  frecuencia_semanal: z.number().int().min(1).max(7).default(3),
}));

export const bulkAssignSchema = z.object({
  studentIds: z.array(z.string().uuid("ID de alumno inválido")).min(1, "Seleccioná al menos un alumno"),
  turno_id: z.string().uuid("Turno inválido"),
  dias_asistencia: z.array(z.string()).min(1, "Elegí al menos un día"),
});

export type BulkAssignData = z.infer<typeof bulkAssignSchema>;

// Subscription validation
export const subscriptionSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100),
  monto: z.number().min(0, "Monto inválido"),
  cantidad_dias: z.number().int().min(0).max(7), // 0 = Libre
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export const linkSubscriptionSchema = z.object({
  alumno_id: z.string().uuid(),
  suscripcion_id: z.string().uuid().nullable(),
  monto_personalizado: z.boolean().default(false),
  monto: z.number().optional(), // Si es personalizado
});

export const updateMassivePricesSchema = z.object({
  suscripcion_id: z.string().uuid(),
  nuevo_monto: z.number().min(0),
  nuevo_nombre: z.string().min(2).optional(),
});

