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
  }),

  getPaymentsData: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. Fetch Paralelo: Alumnos (con Pagos) y Suscripciones
      const [alumnosRes, subsRes] = await Promise.all([
        supabase
          .from('alumnos')
          .select(`
            id, nombre, email, telefono, monto, dia_pago, monto_personalizado, ultimo_recordatorio_pago_at,
            pagos (id, monto, fecha_vencimiento, estado, fecha_pago)
          `)
          .eq('profesor_id', user.id)
          .is('deleted_at', null)
          .order('nombre'),
        supabase
          .from("suscripciones")
          .select("*")
          .eq("profesor_id", user.id)
          .order("cantidad_dias", { ascending: true })
      ]);

      const { data: alumnosRaw, error: alumnosErr } = alumnosRes;
      if (alumnosErr) throw new Error("Error cargando alumnos: " + alumnosErr.message);

      const today = new Date();
      today.setHours(0,0,0,0);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // 2. Process Business Logic (Virtual Injections & Delinquency)
      const alumnos = (alumnosRaw || []).map((alumno: any) => {
        let historial = (alumno.pagos || []).sort((a: any, b: any) => 
          new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime()
        );
        
        let pagoActivo = historial.length > 0 ? { ...historial[0] } : null;
        let needsVirtual = !pagoActivo;

        if (pagoActivo && pagoActivo.estado === 'pagado') {
          const lastVenc = new Date(pagoActivo.fecha_vencimiento);
          if (lastVenc.getMonth() < currentMonth || lastVenc.getFullYear() < currentYear) {
            needsVirtual = true;
          }
        }

        if (needsVirtual) {
          const virtualDate = alumno.dia_pago ? new Date(currentYear, currentMonth, alumno.dia_pago) : null;
          pagoActivo = {
            id: `virtual-${alumno.id}`,
            monto: alumno.monto || 0,
            fecha_vencimiento: virtualDate ? virtualDate.toISOString().split('T')[0] : null,
            estado: 'pendiente' as const,
            fecha_pago: null,
            isVirtual: true
          };
        }

        let isMoroso = false;
        if (pagoActivo && pagoActivo.estado !== 'pagado' && pagoActivo.fecha_vencimiento) {
          if (new Date(pagoActivo.fecha_vencimiento) < today) {
            isMoroso = true;
            pagoActivo.estado = 'vencido' as const;
          }
        }

        return {
          ...alumno,
          name: alumno.nombre,
          pago_activo: pagoActivo,
          is_moroso: isMoroso,
          historial: historial.slice(0, 5), // Only last 5 for performance
          tags: [
            isMoroso ? "Moroso" :
            pagoActivo?.estado === 'pagado' ? "Pagado" : "Pendiente"
          ]
        };
      });

      // 3. Subscription handling
      let subscriptions = subsRes.data || [];

      // Auto-initialize if empty
      if (subscriptions.length === 0) {
        await supabase.rpc('inicializar_suscripciones_profesor', { p_profesor_id: user.id });
        const { data: retry } = await supabase
          .from("suscripciones")
          .select("*")
          .eq("profesor_id", user.id)
          .order("cantidad_dias", { ascending: true });
        subscriptions = retry || [];
      }

      // 4. Calculate Metrics
      const metrics = {
        ingresosPagados: alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado === 'pagado' ? (a.pago_activo.monto || a.monto || 0) : 0), 0),
        ingresosPendientes: alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado !== 'pagado' ? (a.pago_activo?.monto || a.monto || 0) : 0), 0),
        totalMorosos: alumnos.filter(a => a.is_moroso).length,
        morosos: alumnos.filter(a => a.is_moroso).slice(0, 6)
      };

      return {
        alumnos,
        subscriptions,
        metrics,
        lastUpdated: new Date().toISOString()
      };
    }
  })
};
