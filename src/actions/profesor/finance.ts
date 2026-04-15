import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { 
  subscriptionSchema, 
  linkSubscriptionSchema, 
  updateMassivePricesSchema,
  registrarCobroSchema,
  idParamSchema
} from "@/lib/validators/profesor";
import { pagosCopy } from "@/data/es/profesor/pagos";

/**
 * Profesor: Finance Actions
 * Gestión de cobranzas, métricas de ingresos y estados de morosidad.
 */
export const financeActions = {

  /** registrarCobro: Transacción atómica de pago (RPC-based). */
  registrarCobro: defineAction({
    accept: "json",
    input: registrarCobroSchema,
    handler: async (input, context) => {
      const copy = pagosCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      let finalMonto = input.monto_cobrado;
      if (finalMonto === undefined) {
        const { data: alumno } = await supabase.from("alumnos").select("monto, monto_personalizado").eq("id", input.alumno_id).single();
        finalMonto = (alumno as any)?.monto_personalizado || (alumno as any)?.monto || 0;
      }

      const { data, error } = await (supabase as any).rpc('registrar_pago_atomico', {
        p_alumno_id: input.alumno_id,
        p_pago_id: input.pago_id,
        p_monto: finalMonto,
        p_profesor_id: user.id
      });

      if (error) {
        throw new ActionError({ code: "BAD_REQUEST", message: copy.error.general });
      }

      const pagoData = data as any;
      if (!pagoData?.success) {
        throw new ActionError({ code: "BAD_REQUEST", message: pagoData?.mensaje || copy.error.general });
      }

      return { success: true, mensaje: pagoData.mensaje };
    }
  }),

  /** getPaymentsData: Consolidado financiero para la Consola de Pagos. */
  getPaymentsData: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const copy = pagosCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

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

      if (alumnosRes.error) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: copy.error.load_failed });

      // Argentina Time Context
      const now = new Date();
      const arFormatter = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric', month: '2-digit'
      });
      const arParts = arFormatter.formatToParts(now);
      const currentMonthKey = `${arParts.find(p => p.type === 'year')?.value}-${arParts.find(p => p.type === 'month')?.value}`;

      const today = new Date();
      today.setHours(0,0,0,0);

      const processedAlumnos = (alumnosRes.data || []).map((alumno: any) => {
        let historial = (alumno.pagos || []).sort((a: any, b: any) => 
          new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime()
        );
        
        let pagoActivo = historial.length > 0 ? { ...historial[0] } : null;
        let needsVirtual = !pagoActivo || (pagoActivo.estado === 'pagado' && (new Date(pagoActivo.fecha_vencimiento).getMonth() < now.getMonth()));

        if (needsVirtual) {
          pagoActivo = {
            id: `virtual-${alumno.id}`,
            monto: alumno.monto_personalizado || alumno.monto || 0,
            fecha_vencimiento: alumno.dia_pago ? new Date(now.getFullYear(), now.getMonth(), alumno.dia_pago).toISOString().split('T')[0] : null,
            estado: 'pendiente' as const,
            isVirtual: true
          };
        }

        const isMoroso = pagoActivo?.estado !== 'pagado' && pagoActivo?.fecha_vencimiento && new Date(pagoActivo.fecha_vencimiento) < today;

        return {
          ...alumno,
          pago_activo: pagoActivo,
          is_moroso: isMoroso,
          historial: historial.slice(0, 5)
        };
      });

      const allPayments = (alumnosRes.data || []).flatMap((a: any) => a.pagos || []);
      const morososList = processedAlumnos.filter((a: any) => a.is_moroso);

      const metrics = {
        ingresosPagados: allPayments
          .filter((p: any) => p.estado === "pagado" && p.fecha_pago?.startsWith(currentMonthKey))
          .reduce((sum: number, p: any) => sum + (Number(p.monto) || 0), 0),
        ingresosPendientes: processedAlumnos.reduce((acc: number, a: any) => acc + (a.pago_activo?.estado !== 'pagado' ? (a.pago_activo?.monto || a.monto || 0) : 0), 0),
        totalMorosos: morososList.length,
        morosos: morososList
      };

      return { 
        alumnos: processedAlumnos, 
        subscriptions: subsRes.data || [], 
        metrics,
        lastUpdated: new Date().toISOString()
      };
    }
  }),

  /** upsertSubscription: Crea o actualiza un plan de precios. */
  upsertSubscription: defineAction({
    accept: "json",
    input: subscriptionSchema,
    handler: async (input, context) => {
      const copy = pagosCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { data, error } = await (supabase as any)
        .from("suscripciones")
        .upsert({ ...input, profesor_id: user.id, updated_at: new Date().toISOString() })
        .select().single();

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, data };
    },
  }),

  /** deleteSubscription: Elimina plan y blinda montos de alumnos (Auto-Lock). */
  deleteSubscription: defineAction({
    accept: "json",
    input: subscriptionSchema.pick({ id: true }),
    handler: async (input, context) => {
      const copy = pagosCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user || !input.id) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      // Blindaje de montos
      await (supabase as any).from("alumnos").update({ monto_personalizado: true }).eq("suscripcion_id", input.id).eq("profesor_id", user.id);

      const { error } = await supabase.from("suscripciones").delete().eq("id", input.id).eq("profesor_id", user.id);
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    },
  }),

  /** linkStudentSubscription: Vincula un alumno a un plan de precios con herencia de monto. */
  linkStudentSubscription: defineAction({
    accept: "json",
    input: linkSubscriptionSchema,
    handler: async (input, context) => {
      const copy = pagosCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const updateData: any = { suscripcion_id: input.suscripcion_id, monto_personalizado: input.monto_personalizado };

      if (!input.monto_personalizado && input.suscripcion_id) {
        const { data: plan } = await (supabase as any).from("suscripciones").select("monto").eq("id", input.suscripcion_id).single();
        if (plan) updateData.monto = (plan as any).monto;
      } else if (input.monto !== undefined) {
        updateData.monto = input.monto;
      }

      const { error } = await (supabase as any).from("alumnos").update(updateData).eq("id", input.alumno_id).eq("profesor_id", user.id);
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    },
  }),

  /** updateMassivePrices: Actualización volumétrica de precios (SSOT). */
  updateMassivePrices: defineAction({
    accept: "json",
    input: updateMassivePricesSchema,
    handler: async (input, context) => {
      const copy = pagosCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { data: sub } = await (supabase as any).from("suscripciones").select("cantidad_dias, nombre").eq("id", input.suscripcion_id).eq("profesor_id", user.id).single();
      if (!sub) throw new ActionError({ code: "NOT_FOUND", message: copy.error.planNotFound });

      const nombreFinal = input.nuevo_nombre?.trim() || ((sub as any).cantidad_dias === 0 ? "Pase Libre" : `Plan ${(sub as any).cantidad_dias} días`);

      // 1. Alumnos (solo no personalizados)
      await (supabase as any).from("alumnos").update({ monto: input.nuevo_monto }).eq("suscripcion_id", input.suscripcion_id).eq("monto_personalizado", false).eq("profesor_id", user.id);
      
      // 2. El Plan en sí
      const { error } = await (supabase as any).from("suscripciones").update({ monto: input.nuevo_monto, nombre: nombreFinal }).eq("id", input.suscripcion_id).eq("profesor_id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, nombre: nombreFinal };
    },
  }),

  /** registrarNotificacion: Actualiza el timestamp del último recordatorio de pago. */
  registrarNotificacion: defineAction({
    accept: "json",
    input: idParamSchema,
    handler: async (input, context) => {
      const copy = pagosCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { error } = await (supabase as any)
        .from("alumnos")
        .update({ ultimo_recordatorio_pago_at: new Date().toISOString() })
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    }
  }),
};
