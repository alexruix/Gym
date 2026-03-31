import { z } from "zod";
import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export const pagosActions = {
  registrarCobro: defineAction({
    accept: "json",
    input: z.object({
      pago_id: z.string().uuid(),
      alumno_id: z.string().uuid(),
      monto_cobrado: z.number().optional()
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      
      if (!user) throw new Error("No autorizado");

      // 1. Verificamos Seguridad (IDOR) y obtenemos el alumno
      // Aseguramos que el alumno pertenezca al profesor actual
      const { data: alumno, error: alumnoError } = await supabase
        .from("alumnos")
        .select("id, dia_pago, monto, nombre")
        .eq("id", input.alumno_id)
        .eq("profesor_id", user.id)
        .single();
        
      if (alumnoError || !alumno) {
        throw new Error("Alumno no encontrado o sin permisos.");
      }

      // 2. Marcamos el pago actual como 'pagado'
      const { error: updateError } = await supabase
        .from("pagos")
        .update({
          estado: 'pagado',
          fecha_pago: new Date().toISOString(),
        })
        .eq("id", input.pago_id)
        .eq("alumno_id", input.alumno_id);

      if (updateError) {
        console.error("Error actualizando pago:", updateError);
        throw new Error("Error al actualizar el estado del pago.");
      }

      // 3. RENOVACIÓN AUTOMÁTICA DEL PRÓXIMO MES
      // Calculamos la próxima fecha de vencimiento usando el `dia_pago` del alumno
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      // Ajustar al día de pago del alumno (por defecto sugerimos el 15 si no tiene)
      const diaPago = alumno.dia_pago || 15;
      const maxDaysInNextMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      
      // Si el día de pago es 31 y el próximo mes es Abril, se ajusta al 30 de Abril
      nextDate.setDate(Math.min(diaPago, maxDaysInNextMonth));
      
      // Formatear para Postgres DB: YYYY-MM-DD
      const dbDateNext = nextDate.toISOString().split('T')[0];

      // Creamos el registro del siguiente mes como 'pendiente'
      const { error: insertError } = await supabase
        .from("pagos")
        .insert({
          alumno_id: input.alumno_id,
          monto: input.monto_cobrado || alumno.monto || 0,
          fecha_vencimiento: dbDateNext,
          estado: 'pendiente'
        });

      if (insertError) {
        console.error("Error renovando pago:", insertError);
        throw new Error("El cobro se registró, pero hubo un error generando la próxima cuota automática.");
      }

      return {
        success: true,
        mensaje: `✅ Pago registrado para ${alumno.nombre}. Mes renovado automáticamente.`,
      };
    }
  })
};
