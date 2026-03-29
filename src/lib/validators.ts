import { z } from "zod";

// Plan validation (SSOT for creating/editing plans)
export const planSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  duracion_semanas: z.number().int().min(1, "Mínimo 1 semana").max(52, "Máximo 52 semanas"),
  frecuencia_semanal: z.number().int().min(1).max(7),
  descripcion: z.string().optional(),
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
          notas: z.string().optional(),
        })
      )
    })
  ).min(1, "El plan debe tener al menos 1 rutina"),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Exercise Library validation (SSOT for creating/editing exercises)
export const exerciseLibrarySchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  descripcion: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  media_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});
export type ExerciseLibraryFormData = z.infer<typeof exerciseLibrarySchema>;

// Alumno validation (SSOT for inviting/editing students)
export const studentSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  plan_id: z.string().uuid("Plan inválido").optional(),
  fecha_inicio: z.coerce.date().default(() => new Date()),
  dia_pago: z.number().min(1).max(31).default(1),
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
  alumno_id: z.string().uuid(),
  ejercicio_id: z.string().uuid(),
  series_completadas: z.array(
    z.object({
      reps: z.number().min(0),
      peso_kg: z.number().min(0),
      rpe: z.number().min(1).max(10).optional(),
    })
  ),
});

export type SessionLogData = z.infer<typeof sessionLogSchema>;
