import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { 
  planSchema, 
  blockSchema, 
  idParamSchema, 
  updatePlanSchema, 
  forkPlanSchema,
  importPlansSchema 
} from "@/lib/validators/profesor";
import { planesCopy } from "@/data/es/profesor/planes";
import masterPlans from "@/data/es/profesor/master-plans.json";
import { supabaseAdmin } from "@/lib/supabase-admin";

const normalizeStr = (str: string) =>
  str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

/**
 * Profesor: Planning Actions
 * Gestión de arquitectura de entrenamiento: Planes Maestros y Bloques (Templates).
 */
export const plansActions = {

  /** getBlocks: Obtiene la librería de bloques del profesor. */
  getBlocks: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const copy = planesCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

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

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `${copy.error.loadBlocksError}${error.message}` });

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
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

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
    input: idParamSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

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
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

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
    input: updatePlanSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

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
    input: forkPlanSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

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
    input: idParamSchema,
    handler: async (input, context) => {
      const copy = planesCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

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

      if (fetchError || !source) throw new ActionError({ code: "NOT_FOUND", message: copy.error.planNotFound });

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
      return { success: true, plan_id: newId, mensaje: copy.success.planDuplicated };
    },
  }),

  /** promotePlan: Convierte un plan privado en una plantilla reusable. */
  promotePlan: defineAction({
    accept: "json",
    input: idParamSchema,
    handler: async (input, context) => {
      const copy = planesCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { error } = await (supabase.from("planes") as any).update({ is_template: true }).eq("id", input.id).eq("profesor_id", user.id);
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, mensaje: copy.success.planPromoted };
    },
  }),

  /** getProfessorMaestroPlans: Listado simplificado de templates del profesor. */
  getProfessorMaestroPlans: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

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

  /** importPlans: Carga masiva de cabeceras de planes maestros. */
  importPlans: defineAction({
    accept: "json",
    input: importPlansSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

      const items = input.map(item => ({
        profesor_id: user.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        duracion_semanas: item.duracion_semanas,
        frecuencia_semanal: item.frecuencia_semanal,
        is_template: true
      }));

      const { data, error } = await (supabase.from("planes") as any).insert(items).select();
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      
      return { success: true, count: data?.length || 0 };
    }
  }),


  /** importLibraryPlans: Carga manual de los planes maestros desde el JSON. */
  importLibraryPlans: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

      // 1. Obtener ejercicios maestros para resolución de IDs
      const { data: exercises } = await (supabase.from("biblioteca_ejercicios").select("id, nombre").is("profesor_id", null) as any);
      const exMap = new Map((exercises || []).map((ex: any) => [normalizeStr(ex.nombre), ex.id]));

      // 2. Importar cada plan del JSON
      let count = 0;
      for (const plan of masterPlans) {
        const mappedRutinas = plan.rutinas.map(r => ({
          ...r,
          ejercicios: r.ejercicios.map(e => ({
            ...e,
            ejercicio_id: exMap.get(normalizeStr(e.nombre))
          })).filter(e => !!e.ejercicio_id)
        })).filter(r => r.ejercicios.length > 0);

        if (mappedRutinas.length > 0) {
          const { error: rpcErr } = await (supabase as any).rpc("crear_plan_completo", {
            p_profesor_id: user.id,
            p_nombre: plan.nombre,
            p_duracion_semanas: plan.duracion_semanas,
            p_frecuencia_semanal: plan.frecuencia_semanal,
            p_rutinas: mappedRutinas,
            p_rotaciones: []
          });

          if (!rpcErr) count++;
        }
      }

      return { success: true, count };
    }
  }),

  /** getPlanes: Fetch unificado de planes del profesor. */
  getPlanes: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: planesCopy.actions.error.unauthorized });

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
        .eq("profesor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return data || [];
    }
  }),
};
