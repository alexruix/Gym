import { z } from "zod";

/**
 * COMMON VALIDATORS
 * Esquemas compartidos entre el profesor y el alumno.
 */

export const urlSchema = z
  .string()
  .url("URL inválida")
  .optional()
  .nullable()
  .or(z.literal(""));

/**
 * ActionResponse: Contrato estándar para todas las astro:actions.
 * Garantiza previsibilidad en el frontend para Toasts y feedback.
 */
export const actionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type ActionResponse = z.infer<typeof actionResponseSchema>;

// Perfil y Seguridad (Compartido entre Profesor y Alumno)
export const updateAccountSchema = z.object({
  email: z.string().email(),
  telefono: z.string().min(8),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
