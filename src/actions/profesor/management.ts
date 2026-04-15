import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { 
  studentSchema, 
  updateStudentSchema, 
  inviteStudentSchema, 
  turnoSchema, 
  bulkAssignSchema,
  idParamSchema,
  assignPlanToStudentsSchema
} from "@/lib/validators/profesor";
import { alumnosListCopy } from "@/data/es/profesor/alumnos";

/**
 * Profesor: Management Actions
 * Maneja la nómina de alumnos, invitaciones y la agenda horaria (Turnos).
 */
export const managementActions = {

  /** getProfessorStudentsWithPlans: Listado consolidado de alumnos activos. */
  getProfessorStudentsWithPlans: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { data, error } = await supabase
        .from("alumnos")
        .select(`
            id, nombre, email, estado, plan_id, dias_asistencia, turno_id,
            planes ( id, nombre )
        `)
        .eq("profesor_id", user.id)
        .is("deleted_at", null)
        .order("nombre", { ascending: true });

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });

      return {
        success: true,
        alumnos: (data || []).map((a: any) => ({
            ...a,
            nombre_plan: (Array.isArray(a.planes) ? a.planes[0]?.nombre : (a.planes as any)?.nombre) || null
        }))
      };
    }
  }),

  /** updateStudent: Actualización de ficha técnica del alumno. */
  updateStudent: defineAction({
    accept: "json",
    input: updateStudentSchema,
    handler: async (input, context) => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const updateData: any = { ...input };
      if (input.email) updateData.email = input.email.toLowerCase().trim();
      if (input.fecha_inicio) updateData.fecha_inicio = input.fecha_inicio.toISOString().split('T')[0];
      if (input.fecha_fin) updateData.fecha_fin = input.fecha_fin.toISOString().split('T')[0];
      if (input.fecha_nacimiento) updateData.fecha_nacimiento = input.fecha_nacimiento.toISOString().split('T')[0];
      delete updateData.id;

      const { data: student, error } = await (supabase as any)
        .from("alumnos")
        .update(updateData)
        .eq("id", input.id)
        .eq("profesor_id", user.id)
        .select().single();

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `${copy.error.general}${error.message}` });
      return { success: true, student };
    },
  }),

  /** deleteStudent: Maneja el borrado físico o archivado (Soft Delete). */
  deleteStudent: defineAction({
    accept: "json",
    input: idParamSchema,
    handler: async (input, context) => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { data: student } = await supabase
        .from("alumnos")
        .select("id, plan_id")
        .eq("id", input.id)
        .eq("profesor_id", user.id).single();

      if (!student) throw new ActionError({ code: "NOT_FOUND", message: copy.error.studentNotFound });

      if (!(student as any).plan_id) {
        await (supabase as any).from("alumnos").delete().eq("id", input.id);
        return { success: true, type: 'deleted' };
      } else {
        await (supabase as any).from("alumnos").update({ 
          deleted_at: new Date().toISOString(),
          estado: 'archivado'
        }).eq("id", input.id);
        return { success: true, type: 'archived' };
      }
    },
  }),

  /** getStudentGuestLink: Genera el Magic Link (Modo Barrio) para acceso sin login. */
  getStudentGuestLink: defineAction({
    accept: "json",
    input: idParamSchema,
    handler: async (input, context) => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { data: student } = await supabase
        .from("alumnos")
        .select("nombre, access_token")
        .eq("id", input.id)
        .eq("profesor_id", user.id).single();

      if (!student) throw new ActionError({ code: "NOT_FOUND", message: copy.error.studentNotFound });

      let token = (student as any).access_token;
      if (!token) {
        const { data: updated } = await (supabase as any).from("alumnos").update({ access_token: crypto.randomUUID() }).eq("id", input.id).select().single();
        token = updated?.access_token;
      }

      return { success: true, link: `${context.url.origin}/r/${token}`, nombre: (student as any).nombre };
    },
  }),

  /** inviteStudent: Registro JIT e invitación de nuevos atletas. */
  inviteStudent: defineAction({
    accept: "json",
    input: inviteStudentSchema,
    handler: async (input, context) => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const dbDate = input.fecha_inicio.toISOString().split('T')[0];
      const { data: student, error } = await (supabase as any)
        .from("alumnos")
        .insert({
          profesor_id: user.id,
          email: input.email.toLowerCase().trim(),
          nombre: input.nombre,
          plan_id: input.plan_id || null,
          turno_id: input.turno_id || null,
          fecha_inicio: dbDate,
          dia_pago: input.dia_pago,
          telefono: input.telefono || null,
          monto: input.monto || null,
          notas: input.notas || null,
          dias_asistencia: input.dias_asistencia || [],
          estado: 'activo'
        })
        .select().single();

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      if (!student) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: copy.error.createError });
      return { success: true, student_id: (student as any).id };
    },
  }),

  /** getTurnos: Obtiene la grilla horaria del profesor. */
  getTurnos: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: alumnosListCopy.management.actions.error.unauthorized });

      const { data, error } = await supabase
        .from("turnos")
        .select("*")
        .eq("profesor_id", user.id)
        .order("hora_inicio");

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return data || [];
    }
  }),

  /** upsertTurno: Crea o actualiza un bloque horario. */
  upsertTurno: defineAction({
    accept: "json",
    input: turnoSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: alumnosListCopy.management.actions.error.unauthorized });

      const dataToUpsert = {
        profesor_id: user.id,
        nombre: input.nombre,
        hora_inicio: input.hora_inicio,
        hora_fin: input.hora_fin,
        capacidad_max: input.capacidad_max,
        color_tag: input.color_tag || null,
        dias_asistencia: input.dias_asistencia || [],
      };

      const { data, error } = input.id 
        ? await (supabase as any).from("turnos").update(dataToUpsert).eq("id", input.id).eq("profesor_id", user.id).select().single()
        : await (supabase as any).from("turnos").insert(dataToUpsert).select().single();

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, turno: data };
    }
  }),

  /** bulkUpdateStudents: Organiza a múltiples alumnos en un turno/días. */
  bulkUpdateStudents: defineAction({
    accept: "json",
    input: bulkAssignSchema,
    handler: async (input, context) => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { error } = await (supabase as any)
        .from("alumnos")
        .update({
          turno_id: input.turno_id,
          dias_asistencia: input.dias_asistencia,
        })
        .in("id", input.studentIds)
        .eq("profesor_id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, mensaje: copy.success.organized };
    },
  }),

  /** assignPlanToStudents: Vinculación masiva de plan a alumnos. */
  assignPlanToStudents: defineAction({
    accept: "json",
    input: assignPlanToStudentsSchema,
    handler: async (input, context) => {
      const copy = alumnosListCopy.management.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      const { error } = await (supabase as any)
        .from("alumnos")
        .update({ plan_id: input.plan_id })
        .in("id", input.student_ids)
        .eq("profesor_id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, mensaje: copy.success.planAssigned };
    }
  }),
};
