import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { idParamSchema, alumnoIdParamSchema } from "@/lib/validators/profesor";
import { alumnosListCopy } from "@/data/es/profesor/alumnos";
import type { DashboardData } from "@/types/dashboard";

/**
 * Profesor: Dashboard Actions
 * Acciones para el HUD de control y monitoreo en tiempo real.
 */
export const dashboardActions = {

  /** getDashboardData: Obtiene métricas consolidadas (RPC-based). */
  getDashboardData: defineAction({
    accept: "json",
    handler: async (_, context): Promise<DashboardData> => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { data, error } = await (supabase as any).rpc('get_professor_dashboard_stats', { 
        p_profesor_id: user.id 
      });


      if (error) {
        console.error("[Action: getDashboardData] RPC Error:", error);
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Error al cargar métricas." });
      }

      return (data as any) as DashboardData;
    },
  }),

  /** getNotifications: Obtiene el feed de actividad del centro de alertas. */
  getNotifications: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: alumnosListCopy.management.actions.error.unauthorized });

      const { data, error } = await supabase
        .from("notificaciones")
        .select("id, tipo, mensaje, leida, created_at, alumno_id, referencia_id")
        .eq("profesor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: "Error al obtener notificaciones" });
      return (data || []).map((n: any) => ({ ...n, leido: !!n.leida }));
    },
  }),

  /** markNotificationAsRead: Marca una alerta específica como vista. */
  markNotificationAsRead: defineAction({
    accept: "json",
    input: idParamSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: alumnosListCopy.management.actions.error.unauthorized });

      const { error } = await (supabase as any)
        .from("notificaciones")
        .update({ leida: true })
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: "Error al actualizar notificación" });
      return { success: true };
    },
  }),

  /** markAllNotificationsAsRead: Limpia el centro de alertas. */
  markAllNotificationsAsRead: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: alumnosListCopy.management.actions.error.unauthorized });

      const { error } = await (supabase as any)
        .from("notificaciones")
        .update({ leida: true })
        .eq("profesor_id", user.id)
        .eq("leida", false);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: "Error al limpiar notificaciones" });
      return { success: true };
    },
  }),

  /** getStudentSessionProgress: Monitoreo en tiempo real de la sesión de un alumno. */
  getStudentSessionProgress: defineAction({
    accept: "json",
    input: alumnoIdParamSchema,
    handler: async (input, context) => {
        const supabase = createSupabaseServerClient(context);
        const today = new Date().toISOString().split('T')[0];

        const { data: session, error } = await supabase
            .from("sesiones_instanciadas")
            .select(`
                id,
                sesion_ejercicios_instanciados (
                    id, completado, exercise_type, peso_target, peso_real,
                    biblioteca_ejercicios ( nombre )
                )
            `)
            .eq("alumno_id", input.alumno_id)
            .eq("fecha_real", today)
            .maybeSingle();

        if (error || !session) return null;

        const exercises = (session as any).sesion_ejercicios_instanciados || [];
        const total = exercises.length;
        const completed = exercises.filter((e: any) => e.completado).length;
        const core = exercises.find((e: any) => e.exercise_type === 'base');

        return {
            alumno_id: input.alumno_id,
            progress: total > 0 ? (completed / total) * 100 : 0,
            coreExercise: core ? {
                nombre: (core as any).biblioteca_ejercicios?.nombre || "Ejercicio",
                peso_target: (core as any).peso_target?.toString(),
                peso_real: (core as any).peso_real?.toString()
            } : undefined
        };
    }
  }),
};
