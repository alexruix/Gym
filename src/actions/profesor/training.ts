import { z } from "zod";
import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

/**
 * Profesor: Training Actions
 * Ajustes finos de entrenamiento, sobrecarga progresiva y analítica de ejercicios.
 */
export const trainingActions = {

  /** upsertStudentMetricOverride: Personalización JIT de ejercicios para un alumno. */
  upsertStudentMetricOverride: defineAction({ 
    accept: "json", 
    input: z.object({ 
      alumno_id: z.string().uuid(), 
      ejercicio_plan_id: z.string().uuid(), 
      series: z.number().int().optional(), 
      reps_target: z.string().optional(), 
      descanso_seg: z.number().int().optional(), 
      peso_target: z.string().optional(),
      semana_numero: z.number().int().default(1)
    }), 
    handler: async (input, context) => { 
      const supabase = createSupabaseServerClient(context); 
      const user = context.locals.user; 
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" }); 

      const { data, error } = await (supabase
        .from("ejercicio_plan_personalizado") as any)
        .upsert({ 
          alumno_id: input.alumno_id, 
          ejercicio_plan_id: input.ejercicio_plan_id, 
          series: input.series, 
          reps_target: input.reps_target, 
          descanso_seg: input.descanso_seg, 
          peso_target: input.peso_target, 
          semana_numero: input.semana_numero,
          updated_at: new Date().toISOString() 
        }, { onConflict: "alumno_id, ejercicio_plan_id, semana_numero" })
        .select().single(); 

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message }); 
      return { success: true, data }; 
    } 
  }),

  /** getExerciseHistory: Auditoría de carga para un ejercicio y alumno específico. */
  getExerciseHistory: defineAction({
    accept: "json",
    input: z.object({
      alumno_id: z.string().uuid(),
      ejercicio_id: z.string().uuid(),
      limit: z.number().int().default(3)
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data, error } = await supabase
        .from("ejercicio_logs")
        .select(`id, peso, reps, rpe, created_at, sesion:sesion_id ( alumno_id )`)
        .eq("ejercicio_id", input.ejercicio_id)
        .eq("sesion.alumno_id", input.alumno_id)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });

      const filteredData = (data || []).filter((log: any) => (log.sesion as any)?.alumno_id === input.alumno_id);

      return {
        success: true,
        history: filteredData.map((log: any) => ({
          peso: log.peso,
          reps: log.reps,
          rpe: log.rpe,
          fecha: log.created_at
        }))
      };
    }
  }),

  /** copyMetricsToNextWeek: Clonación masiva de mejoras (RPC-based). */
  copyMetricsToNextWeek: defineAction({
    accept: "json",
    input: z.object({
      alumno_id: z.string().uuid(),
      from_week: z.number().int(),
      to_week: z.number().int()
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data, error } = await (supabase as any).rpc('clonar_metrica_semanal', {
        p_alumno_id: input.alumno_id,
        p_from_week: input.from_week,
        p_to_week: input.to_week
      });

      if (error || (data && data.error)) {
        throw new ActionError({ code: "BAD_REQUEST", message: data?.error || "Error al clonar métricas." });
      }

      return { success: true, mensaje: `✅ Métricas clonadas a la Semana ${input.to_week}` };
    }
  }),

  /** getExerciseVariants: Sugerencias de sustitución inteligente basadas en parentesco. */
  getExerciseVariants: defineAction({
    accept: "json",
    input: z.object({ exercise_id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data: current } = await (supabase
        .from("biblioteca_ejercicios") as any)
        .select("id, parent_id")
        .eq("id", input.exercise_id)
        .single();

      if (!current) throw new ActionError({ code: "NOT_FOUND", message: "Ejercicio no encontrado" });

      const query = (supabase
        .from("biblioteca_ejercicios") as any)
        .select("id, nombre, media_url")
        .eq("profesor_id", user.id)
        .neq("id", input.exercise_id);

      if (current.parent_id) {
          query.or(`parent_id.eq.${current.parent_id},id.eq.${current.parent_id}`);
      } else {
          query.eq("parent_id", current.id);
      }

      const { data } = await query.order("nombre");
      return data || [];
    },
  }),
};
