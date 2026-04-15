import { z } from "zod";
import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { planSchema, blockSchema } from "@/lib/validators";

/**
 * Profesor: Planning Actions
 * Gestión de arquitectura de entrenamiento: Planes Maestros y Bloques (Templates).
 */
export const plansActions = {

  /** getBlocks: Obtiene la librería de bloques del profesor. */
  getBlocks: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data, error } = await supabase
        .from("bloques")
        .select(`
          *,
          bloques_ejercicios (
            *,
            biblioteca_ejercicios (nombre, media_url)
          )
        `)
        .eq("profesor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error al obtener bloques: ${error.message}` });

      // Limpieza asíncrona de bloques vacíos (Optimización silenciosa)
      const emptyBlocks = (data || []).filter((b: any) => (b.bloques_ejercicios?.length || 0) === 0);
      if (emptyBlocks.length > 0) {
        const idsToDelete = emptyBlocks.map((b: any) => b.id);
        void (supabase.from("bloques").delete().in("id", idsToDelete) as any);
      }

      return (data || []).filter((b: any) => (b.bloques_ejercicios?.length || 0) > 0);
    }
  }),

  /** createBlock: Crea un nuevo bloque de ejercicios con auto-tagging. */
  createBlock: defineAction({
    accept: "json",
    input: blockSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data: block, error: blockError } = await (supabase
        .from("bloques") as any)
        .insert({
          profesor_id: user.id,
          nombre: input.nombre,
          tags: input.tags || [],
          tipo_bloque: input.tipo_bloque,
          vueltas: input.vueltas,
          descanso_final: input.descanso_final,
        })
        .select()
        .single();

      if (blockError || !block) throw new ActionError({ code: "BAD_REQUEST", message: "Error al crear bloque" });

      const items = input.ejercicios.map((e, idx) => ({
        bloque_id: block.id,
        ejercicio_id: e.ejercicio_id,
        orden: e.orden ?? idx,
        series: e.series,
        reps_target: e.reps_target,
        descanso_seg: e.descanso_seg,
        notas: e.notas || null
      }));

      const { error: itemsError } = await (supabase.from("bloques_ejercicios") as any).insert(items);
      if (itemsError) {
        await (supabase.from("bloques") as any).delete().eq("id", (block as any).id);
        throw new ActionError({ code: "BAD_REQUEST", message: "Error al guardar ejercicios del bloque" });
      }

      return { success: true, block_id: (block as any).id };
    },
  }),

  /** deleteBlock: Elimina un bloque. */
  deleteBlock: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await supabase
        .from("bloques")
        .delete()
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: "No se pudo eliminar el bloque." });
      return { success: true };
    }
  }),

  /** createPlan: Crea un plan maestro (Template) vía RPC. */
  createPlan: defineAction({
    accept: "json",
    input: planSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data: planId, error } = await (supabase as any).rpc('crear_plan_completo', {
        p_profesor_id: user.id,
        p_nombre: input.nombre,
        p_duracion_semanas: input.duracion_semanas,
        p_frecuencia_semanal: input.frecuencia_semanal,
        p_rutinas: input.rutinas,
        p_rotaciones: input.rotaciones
      });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, data: { plan_id: planId } };
    },
  }),

  /** updatePlan: Actualiza la estructura de un plan (RPC). */
  updatePlan: defineAction({
    accept: "json",
    input: planSchema.extend({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await (supabase as any).rpc('actualizar_plan_completo', {
        p_plan_id: input.id,
        p_profesor_id: user.id,
        p_nombre: input.nombre,
        p_duracion_semanas: input.duracion_semanas,
        p_frecuencia_semanal: input.frecuencia_semanal,
        p_rutinas: input.rutinas,
        p_rotaciones: input.rotaciones
      });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, plan_id: input.id };
    },
  }),

  /** forkPlan: Crea una copia privada para un alumno específico. */
  forkPlan: defineAction({
    accept: "json",
    input: z.object({
      planId: z.string().uuid(),
      alumnoId: z.string().uuid(),
      nombre: z.string().min(2),
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data: newPlanId, error } = await (supabase as any).rpc('fork_plan', {
        p_plan_id: input.planId,
        p_alumno_id: input.alumnoId,
        p_nuevo_nombre: input.nombre,
      });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, plan_id: newPlanId };
    },
  }),

  /** duplicatePlan: Clonación de planes existentes. */
  duplicatePlan: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data: source, error: fetchError } = await (supabase
        .from("planes") as any)
        .select(`
          nombre, duracion_semanas, frecuencia_semanal,
          rutinas_diarias (
            dia_numero, nombre_dia,
            ejercicios_plan (*)
          )
        `)
        .eq("id", input.id)
        .eq("profesor_id", user.id)
        .single();

      if (fetchError || !source) throw new ActionError({ code: "NOT_FOUND", message: "Plan no encontrado" });

      const mappedRutinas = (source.rutinas_diarias || []).map((r: any) => ({
        dia_numero: r.dia_numero,
        nombre_dia: r.nombre_dia,
        ejercicios: (r.ejercicios_plan || [])
      }));

      const { data: newId, error: createError } = await (supabase as any).rpc('crear_plan_completo', {
        p_profesor_id: user.id,
        p_nombre: `${source.nombre} (Copia)`,
        p_duracion_semanas: source.duracion_semanas,
        p_frecuencia_semanal: source.frecuencia_semanal,
        p_rutinas: mappedRutinas
      });

      if (createError) throw new ActionError({ code: "BAD_REQUEST", message: createError.message });
      return { success: true, plan_id: newId };
    },
  }),

  /** promotePlan: Convierte un plan privado en una plantilla reusable. */
  promotePlan: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await (supabase.from("planes") as any).update({ is_template: true }).eq("id", input.id).eq("profesor_id", user.id);
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, mensaje: "Plan convertido en plantilla." };
    },
  }),

  /** getProfessorMaestroPlans: Listado simplificado de templates del profesor. */
  getProfessorMaestroPlans: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data, error } = await supabase
        .from("planes")
        .select("id, nombre, frecuencia_semanal, created_at")
        .eq("profesor_id", user.id)
        .eq("is_template", true)
        .order("nombre", { ascending: true });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, planes: data || [] };
    }
  }),

  /** getPlanes: Fetch unificado (Propios + Master Globales) con Silent Sync. */
  getPlanes: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      // Fetch de Planes (Propios + Globales)
      const { data, error } = await supabase
        .from("planes")
        .select(`
          *,
          rutinas_diarias (
            *,
            ejercicios_plan (
              *,
              biblioteca_ejercicios (*)
            )
          )
        `)
        .or(`profesor_id.eq.${user.id},profesor_id.is.null`)
        .order("created_at", { ascending: false });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return data || [];
    }
  }),
};
