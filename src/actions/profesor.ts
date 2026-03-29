import { z } from "zod";
import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { planSchema, studentSchema, inviteStudentSchema, exerciseLibrarySchema } from "@/lib/validators";

export const profesorActions = {
  createExercise: defineAction({
    accept: "json",
    input: exerciseLibrarySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { data: exercise, error } = await supabase
        .from("biblioteca_ejercicios")
        .insert({
          profesor_id: user.id,
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          media_url: input.media_url || null,
        })
        .select()
        .single();

      if (error || !exercise) throw new Error(`Error DB: ${error?.message}`);

      return {
        success: true,
        exercise_id: exercise.id,
        mensaje: `✅ Ejercicio "${exercise.nombre}" creado`,
      };
    },
  }),
  updateExercise: defineAction({
    accept: "json",
    input: exerciseLibrarySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user || !input.id) throw new Error("No autorizado");

      const { data: exercise, error } = await supabase
        .from("biblioteca_ejercicios")
        .update({
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          media_url: input.media_url || null,
        })
        .eq("id", input.id)
        .eq("profesor_id", user.id) // Seguridad: solo el dueño puede editar
        .select()
        .single();

      if (error || !exercise) throw new Error(`Error DB: ${error?.message}`);

      return {
        success: true,
        exercise_id: exercise.id,
        mensaje: `✅ Ejercicio "${exercise.nombre}" actualizado`,
      };
    },
  }),
  deleteExercise: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("biblioteca_ejercicios")
        .delete()
        .eq("id", input.id)
        .eq("profesor_id", user.id); // Seguridad

      if (error) throw new Error(`Error DB: ${error.message}`);

      return {
        success: true,
        mensaje: "✅ Ejercicio eliminado correctamente",
      };
    },
  }),
  createPlan: defineAction({
    accept: "json",
    input: planSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;

      if (!user) throw new Error("No autorizado");

      // Usamos el RPC para garantizar transaccionalidad total (todo o nada)
      // y validación de propiedad de ejercicios en el servidor.
      const { data: planId, error } = await supabase.rpc('crear_plan_completo', {
        p_profesor_id: user.id,
        p_nombre: input.nombre,
        p_duracion_semanas: input.duracion_semanas,
        p_frecuencia_semanal: input.frecuencia_semanal,
        p_rutinas: input.rutinas // Pasamos el JSON completo
      });

      if (error) {
        console.error("[Action: createPlan] RPC Error:", error);
        throw new Error(`Error al crear el plan: ${error.message}`);
      }

      return {
        success: true,
        plan_id: planId,
        mensaje: "✅ El plan se guardó correctamente con transaccionalidad garantizada.",
      };
    },
  }),

  deleteStudent: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // SOFT DELETE: No borramos la fila, solo marcamos deleted_at
      // Esto protege los datos históricos de pagos y sesiones.
      const { error } = await supabase
        .from("alumnos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) {
        console.error("[Action: deleteStudent] Error:", error);
        throw new Error(`Error al eliminar alumno: ${error.message}`);
      }

      return {
        success: true,
        mensaje: "✅ Alumno eliminado (Soft Delete activo).",
      };
    },
  }),

  inviteStudent: defineAction({
    accept: "json",
    input: inviteStudentSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      
      if (!user) {
        console.error("[Action: inviteStudent] No user in context.locals");
        throw new Error("No autorizado: Sesión no encontrada.");
      }

      try {
        // Verificación de Seguridad (IDOR): Asegurar que el plan_id pertenece a este profesor
        if (input.plan_id) {
          const { data: planOwner, error: planError } = await supabase
            .from("planes")
            .select("id")
            .eq("id", input.plan_id)
            .eq("profesor_id", user.id)
            .single();

          if (planError || !planOwner) {
            console.error("[Action: inviteStudent] IDOR Check failed or Plan Error:", planError);
            throw new Error("Plan no válido o no tienes permisos para usarlo.");
          }
        }

        // 1. Crear alumno en DB
        const dbDate = input.fecha_inicio.toISOString().split('T')[0];

        const { data: student, error: dbError } = await supabase
          .from("alumnos")
          .insert({
            profesor_id: user.id,
            email: input.email.toLowerCase().trim(),
            nombre: input.nombre,
            plan_id: input.plan_id || null,
            fecha_inicio: dbDate,
            dia_pago: input.dia_pago,
            telefono: input.telefono || null,
            monto: input.monto || null,
            notas: input.notas || null,
            estado: 'activo'
          })
          .select()
          .single();

        if (dbError || !student) {
          console.error("[Action: inviteStudent] DB Insert Error:", dbError);
          throw new Error(`Error en base de datos: ${dbError?.message || "No se pudo crear el registro"}`);
        }

        // 2. Enviar Magic Link (Supabase Auth)
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: input.email.toLowerCase().trim(),
          options: {
            emailRedirectTo: `${context.url.origin}/api/auth/callback?next=/alumno`,
            data: {
              student_id: student.id,
              role: "alumno"
            }
          }
        });

        if (authError) {
          console.error("[Action: inviteStudent] Auth SignIn Error:", authError);
          return {
            success: true,
            student_id: student.id,
            mensaje: `Alumno creado, pero hubo un error enviando el email: ${authError.message}`,
            auth_error: true
          };
        }

        return {
          success: true,
          student_id: student.id,
          mensaje: `✅ Invitación enviada exitosamente a ${input.email}`,
        };

      } catch (e: any) {
        console.error("[Action: inviteStudent] Unhandled Exception:", e);
        throw new Error(e.message || "Error interno del servidor");
      }
    },
  }),
};