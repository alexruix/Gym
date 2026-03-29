import { z } from "zod";

// Plan validation (SSOT for creating/editing plans)
export const planSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres").max(100),
  duracion_semanas: z.number().min(1, "Al menos una semana").max(52),
  ejercicios: z.array(
    z.object({
      nombre: z.string().min(1, "Nombre de ejercicio requerido"),
      series: z.number().min(1),
      reps: z.number().min(1),
      descanso_seg: z.number().min(0).default(60),
    })
  ).min(1, "Al menos un ejercicio"),
});

export type PlanFormData = z.infer<typeof planSchema>;

// Alumno validation (SSOT for inviting/editing students)
export const studentSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  plan_id: z.string().uuid("Plan inválido").optional(),
  fecha_inicio: z.coerce.date().default(() => new Date()),
  dia_pago: z.number().min(1).max(31).default(1),
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
