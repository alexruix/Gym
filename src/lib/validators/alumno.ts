import { z } from "zod";

/**
 * ALUMNO VALIDATORS
 * Esquemas para la gestión de rutinas, métricas y perfil del atleta.
 */

// Instanciar la sesión del día
export const instanciarSesionSchema = z.object({
  fecha_real: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  alumno_id: z.string().uuid().optional(),
  rutina_id: z.string().uuid().optional(),
});

export type InstanciarSesionData = z.infer<typeof instanciarSesionSchema>;

// Guardar las métricas reales de un ejercicio
export const logEjercicioInstanciadoSchema = z.object({
  sesion_ejercicio_id: z.string().uuid(),
  series_real: z.number().int().min(1),
  reps_real: z.string().min(1),
  peso_real: z.number().min(0).optional().nullable(),
  nota_alumno: z.string().max(300).optional().nullable(),
  rpe: z.number().int().min(1).max(10).optional().nullable(),
  completado: z.boolean().default(true),
});

export type LogEjercicioInstanciadoData = z.infer<typeof logEjercicioInstanciadoSchema>;

// Completar la sesión del día
export const completarSesionSchema = z.object({
  sesion_id: z.string().uuid(),
  notas_alumno: z.string().max(500).optional().nullable(),
});

export type CompletarSesionData = z.infer<typeof completarSesionSchema>;

// Edición de rutina (Dinamismo)
export const addExerciseToStudentPlanSchema = z.object({
  alumno_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  biblioteca_id: z.string().uuid(),
  is_permanent: z.boolean().default(false),
});

export const removeExerciseFromStudentPlanSchema = z.object({
  alumno_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(),
  is_permanent: z.boolean().default(false),
});

export const swapExerciseInStudentPlanSchema = z.object({
  alumno_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(),
  nuevo_biblioteca_id: z.string().uuid(),
  is_permanent: z.boolean().default(false),
});

// Comentarios inline
export const commentExerciseSchema = z.object({
  alumno_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  nota_alumno: z.string().min(1).max(300),
});

// NUEVOS CONTRATOS ESTRICTOS (Athlete Console)
export const getDashboardDataSchema = z.object({
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

export const getStudentPerformanceSchema = z.object({}).optional();
export const getPlanDetailsSchema = z.object({}).optional();

export const getWeeklySessionsSchema = z.object({
  alumno_id: z.string().uuid().optional(),
  dias_atras: z.number().int().min(0).max(30).default(7),
  dias_adelante: z.number().int().min(0).max(30).default(6),
});

export const updateStudentMetricWithPropagationSchema = z.object({
  alumno_id: z.string().uuid(),
  ejercicio_plan_id: z.string().uuid(),
  semana_numero: z.number().int(),
  series: z.number().int().optional(),
  reps_target: z.string().optional(),
  descanso_seg: z.number().int().optional(),
  peso_target: z.string().optional(),
});

export const completeSessionByProfessorSchema = z.object({
  sesion_id: z.string().uuid(),
  alumno_id: z.string().uuid(),
});

export const updateStudentStartDateOffsetSchema = z.object({
  alumno_id: z.string().uuid(),
  offset_days: z.number().int(),
});

export const activarPerfilSchema = z.object({
  peso_actual: z.number().min(30).max(250).optional().nullable(),
  objetivo_principal: z.string().min(2).max(100),
  dias_asistencia: z.array(z.string()).min(1),
  lesiones: z.string().max(300).optional().nullable(),
});

export type ActivarPerfilData = z.infer<typeof activarPerfilSchema>;

// Actualizar Perfil Completo (Onboarding o Edición Móvil)
export const updateStudentProfileSchema = z.object({
  telefono: z.string().max(50).optional().nullable(),
  fecha_nacimiento: z.string().optional().nullable(),
  peso_actual: z.number().min(30).max(300).optional().nullable(),
  altura_cm: z.number().min(50).max(250).optional().nullable(),
  objetivo_principal: z.string().max(100).optional().nullable(),
  nivel_experiencia: z.string().max(50).optional().nullable(),
  profesion: z.string().max(100).optional().nullable(),
  lesiones: z.string().max(500).optional().nullable(),
  genero: z.string().max(30).optional().nullable(),
  turno_id: z.string().uuid().optional().nullable(),
  dias_asistencia: z.array(z.string()).optional().nullable(),
});

export type UpdateStudentProfileData = z.infer<typeof updateStudentProfileSchema>;

// Legacy (Compatibilidad temporal)
export const sessionLogSchema = z.object({
  sesion_id: z.string(),
  ejercicio_id: z.string().uuid(),
  series_completadas: z.array(z.object({
    reps: z.number().min(0),
    peso_kg: z.number().min(0),
    rpe: z.number().min(1).max(10).optional(),
  })),
  nota_alumno: z.string().max(300).optional(),
});

export const completeSessionSchema = z.object({
  sesion_id: z.string(),
  notas_alumno: z.string().max(500).optional(),
});
