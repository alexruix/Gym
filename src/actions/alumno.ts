import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { sessionLogSchema, commentExerciseSchema, completeSessionSchema } from "@/lib/validators";

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
        nota_alumno: idx === input.series_completadas.length - 1 ? input.nota_alumno : null, // Guardamos nota en la última fila
      }));

      const { error } = await supabase
        .from("ejercicio_logs")
        .insert(logs);

      if (error) throw new Error(`Error al guardar progreso: ${error.message}`);

      // Si hay una nota, también guardar notificación para el profesor
      if (input.nota_alumno) {
        // Necesitamos obtener el profesor_id del alumno
        const { data: alumno } = await supabase
          .from("alumnos")
          .select("profesor_id")
          .eq("id", user.id)
          .single();

        if (alumno) {
          await supabase.from("notificaciones").insert({
            profesor_id: alumno.profesor_id,
            alumno_id: user.id,
            tipo: "comentario_ejercicio",
            mensaje: `Comentó en un ejercicio: "${input.nota_alumno.substring(0, 50)}..."`,
            referencia_id: input.ejercicio_id,
          });
        }
      }

      return {
        success: true,
        mensaje: "✅ Progreso guardado",
      };
    },
  }),

  // Nueva Acción: Guardar o actualizar sólo la nota de un ejercicio que ya fue completado
  commentExercise: defineAction({
    accept: "json",
    input: commentExerciseSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // Buscar el último log de ese ejercicio para esta sesión para actualizarle la nota
      // (Suponiendo que ya trackeó las series)
      const { data: lastLog } = await supabase
        .from("ejercicio_logs")
        .select("id")
        .eq("sesion_id", input.sesion_id)
        .eq("ejercicio_id", input.ejercicio_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastLog) {
        const { error } = await supabase
          .from("ejercicio_logs")
          .update({ nota_alumno: input.nota_alumno })
          .eq("id", lastLog.id);
        
        if (error) throw new Error(`Error al guardar comentario: ${error.message}`);
      } else {
        // Si no hay series trackeadas aún, podríamos dejar un log vacío solo con el comment
        // pero lo ideal es que espere a completar la serie. Por ahora lo insertamos vacío.
        const { error } = await supabase
          .from("ejercicio_logs")
          .insert({
            alumno_id: user.id,
            ejercicio_id: input.ejercicio_id,
            sesion_id: input.sesion_id,
            nota_alumno: input.nota_alumno
          });
          
        if (error) throw new Error(`Error al guardar comentario preventivo: ${error.message}`);
      }

      // Notificar al profesor
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("profesor_id")
        .eq("id", user.id)
        .single();

      if (alumno) {
        await supabase.from("notificaciones").insert({
          profesor_id: alumno.profesor_id,
          alumno_id: user.id,
          tipo: "comentario_ejercicio",
          mensaje: `Nuevo comentario en ejercicio: "${input.nota_alumno.substring(0, 50)}..."`,
          referencia_id: input.sesion_id,
        });
      }

      return { success: true, mensaje: "💬 Comentario enviado" };
    }
  }),

  // Acción: Completar Sesión (Final del día)
  completeSession: defineAction({
    accept: "json",
    input: completeSessionSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("sesiones")
        .update({ 
          completada: true,
          notas_alumno: input.notas_alumno 
        })
        .eq("id", input.sesion_id);

      if (error) throw new Error(`Error al finalizar sesión: ${error.message}`);

      // Notificar al profesor que el alumno terminó y si dejó nota
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("profesor_id, nombre")
        .eq("id", user.id)
        .single();

      if (alumno) {
        let mensajeStr = `${alumno.nombre} completó su rutina de hoy.`;
        if (input.notas_alumno) {
          mensajeStr += ` Dejó una nota: "${input.notas_alumno.substring(0,40)}..."`;
        }
        
        await supabase.from("notificaciones").insert({
          profesor_id: alumno.profesor_id,
          alumno_id: user.id,
          tipo: input.notas_alumno ? "comentario_sesion" : "sesion_completada",
          mensaje: mensajeStr,
          referencia_id: input.sesion_id,
        });
      }

      return { success: true, mensaje: "🏆 ¡Sesión Completada!" };
    }
  }),
};
