import { z } from "zod";
import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export const pagosActions = {
  registrarCobro: defineAction({
    accept: "json",
    input: z.object({
      pago_id: z.string(), // Puede ser UUID o "virtual-..."
      alumno_id: z.string().uuid(),
      monto_cobrado: z.number().optional()
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      
      if (!user) throw new Error("No autorizado");

      // Usamos el RPC atómico para garantizar consistencia total
      const { data, error } = await supabase.rpc('registrar_pago_atomico', {
        p_alumno_id: input.alumno_id,
        p_pago_id: input.pago_id,
        p_monto: input.monto_cobrado || 0,
        p_profesor_id: user.id
      });

      if (error || !data?.success) {
        console.error("Error en registrar_pago_atomico:", error || data?.mensaje);
        throw new Error(data?.mensaje || "Error al procesar el cobro atómico.");
      }

      return {
        success: true,
        mensaje: data.mensaje,
      };
    }
  }),

  registrarNotificacion: defineAction({
    accept: "json",
    input: z.object({
      alumno_id: z.string().uuid(),
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("alumnos")
        .update({ ultimo_recordatorio_pago_at: new Date().toISOString() })
        .eq("id", input.alumno_id)
        .eq("profesor_id", user.id);

      if (error) {
        console.error("Error registrando notificación:", error);
        throw new Error("No se pudo registrar el recordatorio.");
      }

      return {
        success: true,
        mensaje: "Recordatorio registrado correctamente.",
      };
    }
  })
};
