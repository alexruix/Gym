import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { sessionLogSchema } from "@/lib/validators";

export const alumnoActions = {
  logExercise: defineAction({
    accept: "json",
    input: sessionLogSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 2. Map series for DB insert
      const logs = input.series_completadas.map((s, idx) => ({
        alumno_id: user.id, 
        ejercicio_id: input.ejercicio_id,
        sesion_id: input.alumno_id, 
        reps_reales: s.reps,
        peso_kg: s.peso_kg,
        rpe: s.rpe || null,
        series_reales: 1, // En v3.1 mapeamos por serie individual
      }));

      const { error } = await supabase
        .from("ejercicio_logs")
        .insert(logs);

      if (error) throw new Error(`Error al guardar progreso: ${error.message}`);

      return {
        success: true,
        mensaje: "✅ Progreso guardado",
      };
    },
  }),
};
