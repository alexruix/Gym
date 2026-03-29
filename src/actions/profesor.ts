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

      if (!user) {
        throw new Error("No estás logueado.");
      }

      // 1. Insertar el Plan Maestro
      const { data: plan, error: planError } = await supabase
        .from("planes")
        .insert({
          profesor_id: user.id,
          nombre: input.nombre,
          duracion_semanas: input.duracion_semanas,
          frecuencia_semanal: input.frecuencia_semanal,
        })
        .select()
        .single();

      if (planError || !plan) {
        throw new Error(`Error DB (Plan): ${planError?.message || "Sin datos"}`);
      }

      // 2. Insertar Rutinas Diarias en cascada
      for (const rutina of input.rutinas) {
        const { data: rutinaData, error: rutinaError } = await supabase
          .from("rutinas_diarias")
          .insert({
            plan_id: plan.id,
            dia_numero: rutina.dia_numero,
            nombre_dia: rutina.nombre_dia || `Día ${rutina.dia_numero}`,
            orden: rutina.dia_numero,
          })
          .select()
          .single();

        if (rutinaError || !rutinaData) {
          throw new Error(`Error DB (Rutina ${rutina.dia_numero}): ${rutinaError?.message}`);
        }

        // 3. Insertar Ejercicios de esta Rutina
        if (rutina.ejercicios && rutina.ejercicios.length > 0) {
          const ejerciciosPlan = rutina.ejercicios.map((e, idx) => ({
            rutina_id: rutinaData.id,
            ejercicio_id: e.ejercicio_id,
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            orden: e.orden || idx,
          }));

          const { error: ejerciciosError } = await supabase
            .from("ejercicios_plan")
            .insert(ejerciciosPlan);

          if (ejerciciosError) {
            throw new Error(`Error DB (Ejercicios Día ${rutina.dia_numero}): ${ejerciciosError.message}`);
          }
        }
      }

      return {
        success: true,
        plan_id: plan.id,
        mensaje: "El plan, las rutinas y sus ejercicios se guardaron correctamente.",
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
        // Nota: Postgres 'date' prefiere YYYY-MM-DD
        const dbDate = input.fecha_inicio.toISOString().split('T')[0];

        const { data: student, error: dbError } = await supabase
          .from("alumnos")
          .insert({
            profesor_id: user.id,
            email: input.email,
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
          // No lanzamos error aquí para no perder el registro del alumno, 
          // el profesor puede reenviar la invitación luego.
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
