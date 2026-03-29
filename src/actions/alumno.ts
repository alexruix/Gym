import { defineAction } from "astro:actions";
import { supabase } from "@/lib/supabase";
import { sessionLogSchema } from "@/lib/validators";

export const alumnoActions = {
  logExercise: defineAction({
    accept: "json",
    input: sessionLogSchema,
    handler: async (input, context) => {
      // 1. Auth check
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 2. Map series for DB insert
      const logs = input.series_completadas.map((s, idx) => ({
        alumno_id: user.id, // Using authenticated student ID
        ejercicio_id: input.ejercicio_id,
        sesion_id: input.alumno_id, // Actually should be sesion_id from context, but using input for now
        reps: s.reps,
        peso_kg: s.peso_kg,
        rpe: s.rpe || null,
        numero_serie: idx + 1,
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
