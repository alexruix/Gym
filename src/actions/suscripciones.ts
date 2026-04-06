import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { subscriptionSchema, linkSubscriptionSchema, updateMassivePricesSchema } from "@/lib/validators";

export const suscripcionesActions = {
  upsertSubscription: defineAction({
    accept: "json",
    input: subscriptionSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { data, error } = await supabase
        .from("suscripciones")
        .upsert({
          ...input,
          profesor_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    },
  }),

  deleteSubscription: defineAction({
    accept: "json",
    input: subscriptionSchema.pick({ id: true }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user || !input.id) throw new Error("No autorizado");

      // 1. "Auto-Lock": Blindamos los montos de los alumnos asociados para que no pierdan su valor
      // al quedar huérfanos (ON DELETE SET NULL vacía el suscripcion_id).
      const { error: lockError } = await supabase
        .from("alumnos")
        .update({ monto_personalizado: true })
        .eq("suscripcion_id", input.id)
        .eq("profesor_id", user.id);

      if (lockError) throw new Error("No se pudo blindar los montos de los alumnos: " + lockError.message);

      // 2. Eliminación física del plan
      const { error } = await supabase
        .from("suscripciones")
        .delete()
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) throw new Error(error.message);
      return { success: true };
    },
  }),

  linkStudentSubscription: defineAction({
    accept: "json",
    input: linkSubscriptionSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const updateData: any = {
        suscripcion_id: input.suscripcion_id,
        monto_personalizado: input.monto_personalizado,
      };

      // Si no es personalizado y hay plan, heredamos el monto del plan
      if (!input.monto_personalizado && input.suscripcion_id) {
        const { data: plan } = await supabase
          .from("suscripciones")
          .select("monto")
          .eq("id", input.suscripcion_id)
          .single();
        if (plan) updateData.monto = plan.monto;
      } else if (input.monto !== undefined) {
        updateData.monto = input.monto;
      }

      const { error } = await supabase
        .from("alumnos")
        .update(updateData)
        .eq("id", input.alumno_id)
        .eq("profesor_id", user.id);

      if (error) throw new Error(error.message);
      return { success: true };
    },
  }),

  updateMassivePrices: defineAction({
    accept: "json",
    input: updateMassivePricesSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("Acción no autorizada");

      try {
        // 1. Obtener la suscripción para saber sus días (para el nombre por defecto)
        const { data: sub } = await supabase
            .from("suscripciones")
            .select("cantidad_dias, nombre")
            .eq("id", input.suscripcion_id)
            .eq("profesor_id", user.id)
            .single();

        if (!sub) throw new Error("Plan no encontrado");

        // 2. Determinar nombre final
        let nombreFinal = input.nuevo_nombre?.trim();
        if (!nombreFinal) {
            nombreFinal = sub.cantidad_dias === 0 ? "Pase Libre" : `Plan ${sub.cantidad_dias} días`;
        }

        // 3. Actualizar monto masivo en alumnos (SOLO no personalizados)
        const { error: errorAlumnos } = await supabase
          .from("alumnos")
          .update({ monto: input.nuevo_monto })
          .eq("suscripcion_id", input.suscripcion_id)
          .eq("monto_personalizado", false)
          .eq("profesor_id", user.id);
        
        if (errorAlumnos) throw errorAlumnos;

        // 4. Actualizar plan
        const { error: errorPlan } = await supabase
          .from("suscripciones")
          .update({ 
            monto: input.nuevo_monto,
            nombre: nombreFinal
          })
          .eq("id", input.suscripcion_id)
          .eq("profesor_id", user.id);

        if (errorPlan) throw errorPlan;

        return { success: true, nombre: nombreFinal };
      } catch (error: any) {
        console.error("[Suscripciones] Error en actualización masiva:", error);
        throw new Error("No se pudo completar la actualización masiva de precios");
      }
    },
  }),

  inicializarDefault: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase.rpc('inicializar_suscripciones_profesor', {
        p_profesor_id: user.id
      });

      if (error) throw new Error(error.message);
      return { success: true };
    }
  })
};
