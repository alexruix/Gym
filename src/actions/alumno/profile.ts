import { defineAction, ActionError } from "astro:actions";
import { getAuthenticatedClient } from "@/lib/supabase-ssr";
import { 
  activarPerfilSchema, 
  updateStudentProfileSchema, 
  updateStudentStartDateOffsetSchema 
} from "../../lib/validators";

/**
 * Alumno: Profile Actions
 * Maneja la activación inicial y actualización de datos personales del atleta.
 */
export const profileActions = {
  
  /** activarPerfilTecnico: (Alumno) Guarda la configuración inicial JIT. */
  activarPerfilTecnico: defineAction({
    accept: "json",
    input: activarPerfilSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { error } = await (supabase as any)
        .from("alumnos")
        .update({
          peso_actual: input.peso_actual,
          objetivo_principal: input.objetivo_principal,
          dias_asistencia: input.dias_asistencia,
          lesiones: input.lesiones,
          perfil_completado: true
        })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error al guardar perfil: ${error.message}` });

      return { success: true, message: "¡HUD configurado exitosamente!" };
    }
  }),

  /** updateStudentProfile: (Alumno) Actualización de datos personales y físicos. */
  updateStudentProfile: defineAction({
    accept: "json",
    input: updateStudentProfileSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const cleanInput = Object.fromEntries(
        Object.entries(input).map(([k, v]) => [k, v === "" ? null : v])
      ) as any;

      const { data: updated, error } = await (supabase as any)
        .from("alumnos")
        .update({
          telefono: cleanInput.telefono,
          fecha_nacimiento: cleanInput.fecha_nacimiento,
          peso_actual: cleanInput.peso_actual,
          altura_cm: cleanInput.altura_cm,
          objetivo_principal: cleanInput.objetivo_principal,
          nivel_experiencia: cleanInput.nivel_experiencia,
          profesion: cleanInput.profesion,
          lesiones: cleanInput.lesiones,
          genero: cleanInput.genero,
          turno_id: cleanInput.turno_id,
          dias_asistencia: cleanInput.dias_asistencia,
          perfil_completado: true
        })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .select()
        .single();

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error: ${error.message}` });
      return { success: true, user: updated };
    }
  }),

  /** updateStudentStartDateOffset: Ajusta la fecha de inicio para calibrar el calendario. */
  updateStudentStartDateOffset: defineAction({
    accept: "json",
    input: updateStudentStartDateOffsetSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data: alumno, error: fetchError } = await (supabase as any)
        .from("alumnos")
        .select("fecha_inicio")
        .eq("id", input.alumno_id)
        .single();

      if (fetchError || !alumno) throw new ActionError({ code: "NOT_FOUND", message: "Alumno no encontrado" });

      // 2. Calcular la nueva fecha
      const currentStart = new Date(alumno.fecha_inicio);
      currentStart.setDate(currentStart.getDate() + input.offset_days);
      const newStartISO = currentStart.toISOString().split("T")[0];

      // 3. Actualizar
      const { error: updateError } = await (supabase as any)
        .from("alumnos")
        .update({ fecha_inicio: newStartISO })
        .eq("id", input.alumno_id);

      if (updateError) throw new ActionError({ code: "BAD_REQUEST", message: "Error al actualizar fecha" });
      return { success: true, nueva_fecha: newStartISO };
    }
  }),
};
