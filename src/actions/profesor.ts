import { defineAction } from "astro:actions";
import { supabase } from "@/lib/supabase";
import { planSchema, studentSchema } from "@/lib/validators";

export const profesorActions = {
  createPlan: defineAction({
    accept: "json",
    input: planSchema,
    handler: async (input, context) => {
      // 1. Auth check
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 2. Insert plan
      const { data: plan, error } = await supabase
        .from("planes")
        .insert({
          profesor_id: user.id,
          nombre: input.nombre,
          duracion_semanas: input.duracion_semanas,
          descripcion: null,
        })
        .select()
        .single();

      if (error || !plan) throw new Error(`Error en DB: ${error?.message || "Sin datos"}`);

      // 3. Insert ejercicios
      const ejercicios = input.ejercicios.map((e, idx) => ({
        plan_id: plan.id,
        nombre: e.nombre,
        series: e.series,
        reps: e.reps,
        descanso_seg: e.descanso_seg,
        orden: idx,
      }));

      const { error: ejercError } = await supabase
        .from("ejercicios")
        .insert(ejercicios);

      if (ejercError) throw new Error(`Error en ejercicios: ${ejercError.message}`);

      return {
        success: true,
        plan_id: plan.id,
        mensaje: `✅ Plan "${plan.nombre}" creado exitosamente`,
      };
    },
  }),

  inviteStudent: defineAction({
    accept: "json",
    input: studentSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. Crear alumno en DB
      const { data: student, error } = await supabase
        .from("alumnos")
        .insert({
          profesor_id: user.id,
          email: input.email,
          nombre: input.nombre,
          plan_id: input.plan_id || null,
          fecha_inicio: input.fecha_inicio.toISOString(),
          dia_pago: input.dia_pago,
          estado: 'activo'
        })
        .select()
        .single();

      if (error || !student) throw new Error(`Error al crear alumno: ${error?.message || "Sin datos"}`);

      // 2. Enviar Magic Link (Supabase Auth)
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          emailRedirectTo: `${context.url.origin}/alumno`,
          data: {
            student_id: student.id,
            role: "alumno"
          }
        }
      });

      if (authError) throw new Error(`Error al enviar invitación: ${authError.message}`);

      return {
        success: true,
        student_id: student.id,
        mensaje: `✅ Invitación enviada a ${input.email}`,
      };
    },
  }),
};
