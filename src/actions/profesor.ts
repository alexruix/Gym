import { z } from "zod";
import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { planSchema, studentSchema, updateStudentSchema, inviteStudentSchema, exerciseLibrarySchema, updateAccountSchema, updatePublicProfileSchema, updateNotificationsSchema, updatePrivacySchema, changePasswordSchema } from "@/lib/validators";

export const profesorActions = {
  createExercise: defineAction({
    accept: "json",
    input: exerciseLibrarySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const normalizedTags = Array.from(new Set((input.tags || []).map(t => t.toLowerCase().trim()))).slice(0, 6);

      const { data: exercise, error } = await supabase
        .from("biblioteca_ejercicios")
        .insert({
          profesor_id: user.id,
          parent_id: input.parent_id || null,
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          media_url: input.media_url || null,
          tags: normalizedTags,
          is_template_base: !input.parent_id, // Jerarquía automática: si no tiene padre, ES base.
        })
        .select()
        .single();

      if (error || !exercise) {
        console.error("[Action: createExercise] DB Error:", error);
        throw new Error(`Error en DB al crear: ${error?.message || "Registro fallido"}`);
      }

      // CREACIÓN INLINE DE VARIANTES (Si es un ejercicio base)
      if (!input.parent_id && input.variants && input.variants.length > 0) {
        const variantsData = input.variants.map(vName => ({
          profesor_id: user.id,
          parent_id: exercise.id,
          nombre: vName,
          tags: normalizedTags,
          is_template_base: false
        }));

        const { error: variantError } = await supabase
          .from("biblioteca_ejercicios")
          .insert(variantsData);
        
        if (variantError) console.error("[Action: createExercise] Variants Error:", variantError);
      }

      return {
        success: true,
        exercise_id: exercise.id,
        mensaje: `✅ Ejercicio "${exercise.nombre}" creado ${input.variants?.length ? `con ${input.variants.length} variantes` : ""}`,
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

      const normalizedTags = Array.from(new Set((input.tags || []).map(t => t.toLowerCase().trim()))).slice(0, 6);

      const { data: exercise, error } = await supabase
        .from("biblioteca_ejercicios")
        .update({
          parent_id: input.parent_id || null,
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          media_url: input.media_url || null,
          tags: normalizedTags,
          is_template_base: !input.parent_id, // Recalcular jerarquía al editar
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

      const { data: planId, error } = await supabase.rpc('crear_plan_completo', {
        p_profesor_id: user.id,
        p_nombre: input.nombre,
        p_duracion_semanas: input.duracion_semanas,
        p_frecuencia_semanal: input.frecuencia_semanal,
        p_rutinas: input.rutinas 
      });

      if (error) {
        console.error("[Action: createPlan] RPC Error:", error);
        throw new Error(`Error al crear el plan: ${error.message}`);
      }

      return {
        success: true,
        plan_id: planId,
        mensaje: "El plan se guardó correctamente.",
      };
    },
  }),
  updatePlan: defineAction({
    accept: "json",
    input: planSchema.extend({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { data: success, error } = await supabase.rpc('actualizar_plan_completo', {
        p_plan_id: input.id,
        p_profesor_id: user.id,
        p_nombre: input.nombre,
        p_duracion_semanas: input.duracion_semanas,
        p_frecuencia_semanal: input.frecuencia_semanal,
        p_rutinas: input.rutinas
      });

      if (error) {
        console.error("[Action: updatePlan] RPC Error:", error);
        throw new Error(`Error al actualizar el plan: ${error.message}`);
      }

      return {
        success: true,
        mensaje: "✅ El plan se actualizó correctamente.",
      };
    },
  }),

  deletePlan: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("planes")
        .delete()
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) {
        console.error("[Action: deletePlan] Error:", error);
        throw new Error(`Error en DB al eliminar el plan: ${error.message}`);
      }

      return {
        success: true,
        mensaje: "✅ Plan eliminado correctamente",
      };
    },
  }),

  duplicatePlan: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. Obtener datos origen (Plan + Rutinas + Ejercicios)
      const { data: source, error: fetchError } = await supabase
        .from("planes")
        .select(`
          nombre,
          duracion_semanas,
          frecuencia_semanal,
          rutinas_diarias (
            dia_numero,
            nombre_dia,
            ejercicios_plan (
              ejercicio_id,
              series,
              reps_target,
              descanso_seg,
              orden,
              exercise_type,
              position
            )
          )
        `)
        .eq("id", input.id)
        .eq("profesor_id", user.id)
        .single();

      if (fetchError || !source) {
        console.error("[Action: duplicatePlan] Fetch Error:", fetchError);
        throw new Error("No se pudo encontrar el plan original para duplicar.");
      }

      // 2. Mapear rutinas para el RPC 'crear_plan_completo'
      const mappedRutinas = (source.rutinas_diarias || []).map((r: any) => ({
        dia_numero: r.dia_numero,
        nombre_dia: r.nombre_dia,
        ejercicios: (r.ejercicios_plan || []).map((e: any) => ({
          ejercicio_id: e.ejercicio_id,
          series: e.series,
          reps_target: e.reps_target,
          descanso_seg: e.descanso_seg,
          orden: e.orden,
          exercise_type: e.exercise_type,
          position: e.position
        }))
      }));

      // 3. Crear copia transaccional
      const { data: newId, error: createError } = await supabase.rpc('crear_plan_completo', {
        p_profesor_id: user.id,
        p_nombre: `${source.nombre} (Copia)`,
        p_duracion_semanas: source.duracion_semanas,
        p_frecuencia_semanal: source.frecuencia_semanal,
        p_rutinas: mappedRutinas
      });

      if (createError) {
        console.error("[Action: duplicatePlan] RPC Error:", createError);
        throw new Error(`Error fatal al duplicar: ${createError.message}`);
      }

      return {
        success: true,
        plan_id: newId,
        mensaje: `✅ Plan "${source.nombre}" duplicado con éxito`,
      };
    },
  }),

  forkPlan: defineAction({
    accept: "json",
    input: z.object({
      planId: z.string().uuid(),
      alumnoId: z.string().uuid(),
      nombre: z.string().min(2),
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { data: newPlanId, error } = await supabase.rpc('fork_plan', {
        p_plan_id: input.planId,
        p_alumno_id: input.alumnoId,
        p_nuevo_nombre: input.nombre,
      });

      if (error) {
        console.error("[Action: forkPlan] RPC Error:", error);
        throw new Error(`Error al bifurcar el plan: ${error.message}`);
      }

      return {
        success: true,
        plan_id: newPlanId,
        mensaje: "Plan personalizado creado y asignado al alumno.",
      };
    },
  }),
  promotePlan: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("planes")
        .update({ is_template: true })
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) {
        console.error("[Action: promotePlan] Error:", error);
        throw new Error(`Error al promocionar plan: ${error.message}`);
      }

      return {
        success: true,
        mensaje: "Ahora lo convertiste en un plan reutilizable y aparecerá en Planes.",
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

      const { error } = await supabase
        .from("alumnos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) {
        console.error("[Action: deleteStudent] Error:", error);
        throw new Error(`Error al archivar alumno: ${error.message}`);
      }

      return {
        success: true,
        mensaje: "Alumno archivado",
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

        if (input.cobrarPrimerMes) {
          const { error: paymentError } = await supabase
            .from("pagos")
            .insert({
              alumno_id: student.id,
              monto: input.monto || 0,
              fecha_vencimiento: dbDate,
              estado: 'pendiente'
            });
          
          if (paymentError) {
            console.error("[Action: inviteStudent] Initial Payment Error:", paymentError);
          }
        }



        return {
          success: true,
          student_id: student.id,
          mensaje: `Alumno guardado exitosamente. Generá su enlace para darle acceso.`,
        };

      } catch (e: any) {
        console.error("[Action: inviteStudent] Unhandled Exception:", e);
        throw new Error(e.message || "Error interno del servidor");
      }
    },
  }),

  updateStudent: defineAction({
    accept: "json",
    input: updateStudentSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const updateData: any = {};
      if (input.nombre) updateData.nombre = input.nombre;
      if (input.email) updateData.email = input.email.toLowerCase().trim();
      if (input.telefono !== undefined) updateData.telefono = input.telefono;
      if (input.fecha_inicio) updateData.fecha_inicio = input.fecha_inicio.toISOString().split('T')[0];
      if (input.dia_pago) updateData.dia_pago = input.dia_pago;
      if (input.notas !== undefined) updateData.notas = input.notas;

      const { data: student, error } = await supabase
        .from("alumnos")
        .update(updateData)
        .eq("id", input.id)
        .eq("profesor_id", user.id)
        .select()
        .single();

      if (error || !student) {
        console.error("[Action: updateStudent] Error:", error);
        throw new Error(`Error al actualizar alumno: ${error?.message || "No se encontró el registro"}`);
      }

      return {
        success: true,
        student_id: student.id,
        mensaje: `Datos de "${student.nombre}" actualizados`,
      };
    },
  }),

  updateAccount: defineAction({
    accept: "json",
    input: updateAccountSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autenticado");

      const { error: updateError } = await supabase
        .from("profesores")
        .update({
          telefono: input.telefono || null,
        })
        .eq("id", user.id);

      if (updateError) throw new Error(updateError.message);

      return {
        success: true,
        message: "Datos de cuenta actualizados correctamente",
      };
    },
  }),

  updatePublicProfile: defineAction({
    accept: "json",
    input: updatePublicProfileSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autenticado");

      if (input.slug) {
        const { data: existing } = await supabase
          .from("profesores")
          .select("id")
          .eq("slug", input.slug)
          .neq("id", user.id)
          .single();
        
        if (existing) throw new Error("Ese enlace (slug) ya está en uso. Elige otro.");
      }

      const { error: updateError } = await supabase
        .from("profesores")
        .update({
          nombre: input.nombre,
          slug: input.slug || null,
          bio: input.bio || null,
          instagram: input.instagram || null,
          youtube: input.youtube || null,
          tiktok: input.tiktok || null,
          x_twitter: input.x_twitter || null,
          especialidades: input.especialidades,
          perfil_publico: input.perfil_publico,
        })
        .eq("id", user.id);

      if (updateError) throw new Error(updateError.message);

      return {
        success: true,
        message: "✅ Perfil Público actualizado correctamente",
      };
    },
  }),

  updateNotifications: defineAction({
    accept: "json",
    input: updateNotificationsSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase
        .from("profesores")
        .update(input)
        .eq("id", user.id);

      if (error) throw new Error(error.message);

      return {
        success: true,
        message: "✅ Preferencias de notificaciones guardadas",
      };
    },
  }),

  updatePrivacy: defineAction({
    accept: "json",
    input: updatePrivacySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase
        .from("profesores")
        .update(input)
        .eq("id", user.id);

      if (error) throw new Error(error.message);

      return {
        success: true,
        message: "✅ Preferencias de privacidad guardadas",
      };
    },
  }),

  changePassword: defineAction({
    accept: "json",
    input: changePasswordSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autenticado");

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: input.currentPassword,
      });

      if (authError || !authData.user) {
        throw new Error("Contraseña actual incorrecta");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: input.newPassword,
      });

      if (updateError) throw new Error(updateError.message);

      return {
        success: true,
        message: "✅ Contraseña actualizada",
      };
    },
  }),

  globalSearch: defineAction({
    accept: "json",
    input: z.object({ query: z.string() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user || !input.query || input.query.length < 2) {
        return { success: true, results: { alumnos: [], planes: [], ejercicios: [] } };
      }

      const searchTerm = `%${input.query}%`;

      const [alumnosRes, planesRes, ejerciciosRes] = await Promise.all([
        supabase
          .from("alumnos")
          .select("id, nombre, email")
          .eq("profesor_id", user.id)
          .is("deleted_at", null)
          .or(`nombre.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from("planes")
          .select("id, nombre")
          .eq("profesor_id", user.id)
          .ilike("nombre", searchTerm)
          .limit(5),
        supabase
          .from("biblioteca_ejercicios")
          .select("id, nombre")
          .eq("profesor_id", user.id)
          .ilike("nombre", searchTerm)
          .limit(5)
      ]);

      return {
        success: true,
        results: {
          alumnos: alumnosRes.data || [],
          planes: planesRes.data || [],
          ejercicios: ejerciciosRes.data || []
        }
      };
    },
  }),
  importExercises: defineAction({
    accept: "json",
    input: z.array(z.object({
      nombre: z.string().min(1),
      descripcion: z.string().optional().nullable(),
      media_url: z.string().optional().nullable(),
      tags: z.array(z.string()).optional().default([]),
    })),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      if (input.length === 0) return { success: true, count: 0 };

      const itemsToInsert = input.map(item => ({
        profesor_id: user.id,
        nombre: item.nombre,
        descripcion: item.descripcion || null,
        media_url: item.media_url || null,
        tags: Array.from(new Set((item.tags || []).map(t => t.toLowerCase().trim()))).slice(0, 6),
      }));

      const { data, error } = await supabase
        .from("biblioteca_ejercicios")
        .insert(itemsToInsert)
        .select();

      if (error) throw new Error(`Error al importar: ${error.message}`);

      return {
        success: true,
        count: data?.length || 0,
        mensaje: `✅ ${data?.length} ejercicios importados exitosamente`,
      };
    },
  }),
  importPlans: defineAction({
    accept: "json",
    input: z.array(z.object({
      nombre: z.string().min(1),
      descripcion: z.string().optional().nullable(),
      duracion_semanas: z.number().int().optional(),
      frecuencia_semanal: z.number().int().optional(),
    })),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      if (input.length === 0) return { success: true, count: 0 };

      const itemsToInsert = input.map(item => ({
        profesor_id: user.id,
        nombre: item.nombre,
        descripcion: item.descripcion || null,
        duracion_semanas: item.duracion_semanas || 4,
        frecuencia_semanal: item.frecuencia_semanal || 3,
        is_template: true, // Siempre se importan como plantillas base
      }));

      const { data, error } = await supabase
        .from("planes")
        .insert(itemsToInsert)
        .select();

      if (error) throw new Error(`Error al importar: ${error.message}`);

      return {
        success: true,
        count: data?.length || 0,
        mensaje: `✅ ${data?.length} planes importados exitosamente`,
      };
    },
  }),

  // 🛡️ ACCIÓN: Generación de Link de Invitado Permanente (Modo Barrio)
  getStudentGuestLink: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. Obtener el access_token del alumno (o generarlo si falta)
      const { data: student, error: studentError } = await supabase
        .from("alumnos")
        .select("nombre, access_token")
        .eq("id", input.id)
        .eq("profesor_id", user.id)
        .single();

      if (studentError || !student) {
        throw new Error("Alumno no encontrado o no tienes permisos");
      }

      // Si por alguna razón no tiene token (alumnos viejos pre-migración), lo generamos
      let token = student.access_token;
      if (!token) {
        const { data: updated, error: updateError } = await supabase
            .from("alumnos")
            .update({ access_token: crypto.randomUUID() })
            .eq("id", input.id)
            .select("access_token")
            .single();
        if (updateError || !updated) throw new Error("Error al inicializar token de invitado");
        token = updated.access_token;
      }

      const guestLink = `${context.url.origin}/r/${token}`;

      return {
        success: true,
        link: guestLink,
        nombre: student.nombre,
      };
    },
  }),

  // 🔄 ACCIÓN: Regenerar Link de Invitado (Revocación)
  regenerateStudentGuestLink: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const newToken = crypto.randomUUID();

      const { data: student, error: updateError } = await supabase
        .from("alumnos")
        .update({ access_token: newToken })
        .eq("id", input.id)
        .eq("profesor_id", user.id)
        .select("nombre")
        .single();

      if (updateError || !student) {
        throw new Error("No se pudo regenerar el link de acceso");
      }

      return {
        success: true,
        link: `${context.url.origin}/r/${newToken}`,
        mensaje: `✅ Link de acceso regenerado para ${student.nombre}`,
      };
    },
  }),

  // 👥 ACCIÓN: Obtener Alumnos con sus Planes Actuales
  getProfessorStudentsWithPlans: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { data, error } = await supabase
        .from("alumnos")
        .select(`
            id,
            nombre,
            email,
            estado,
            plan_id,
            planes (
                id,
                nombre
            )
        `)
        .eq("profesor_id", user.id)
        .is("deleted_at", null)
        .order("nombre", { ascending: true });

      if (error) throw new Error(`Error al obtener alumnos: ${error.message}`);

      return {
        success: true,
        alumnos: (data || []).map(a => ({
            id: a.id,
            nombre: a.nombre,
            email: a.email,
            estado: a.estado,
            plan_id: a.plan_id,
            nombre_plan: (Array.isArray(a.planes) ? a.planes[0]?.nombre : (a.planes as any)?.nombre) || null
        }))
      };
    }
  }),

  // 🔗 ACCIÓN: Asignar Plan a Alumnos (Bulk Update)
  assignPlanToStudents: defineAction({
    accept: "json",
    input: z.object({
        plan_id: z.string().uuid(),
        student_ids: z.array(z.string().uuid())
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. Validar que el plan pertenece al profesor (seguridad)
      const { data: planCheck } = await supabase
        .from("planes")
        .select("id")
        .eq("id", input.plan_id)
        .eq("profesor_id", user.id)
        .single();
      
      if (!planCheck) throw new Error("No tienes permisos sobre este plan");

      // 2. Actualizar alumnos
      const { error } = await supabase
        .from("alumnos")
        .update({ plan_id: input.plan_id })
        .in("id", input.student_ids)
        .eq("profesor_id", user.id); // Seguridad adicional

      if (error) throw new Error(`Error al asignar alumnos: ${error.message}`);

      return {
        success: true,
        mensaje: `✅ Se asignaron ${input.student_ids.length} alumnos correctamente`,
      };
    }
  }),

  getProfessorMaestroPlans: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { data, error } = await supabase
        .from("planes")
        .select("id, nombre")
        .eq("profesor_id", user.id)
        .eq("is_template", true)
        .order("nombre", { ascending: true });

      if (error) throw new Error(`Error al obtener planes: ${error.message}`);

      return {
        success: true,
        planes: data || []
      };
    }
  }),
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
      if (!user) throw new Error("No autorizado"); 

      const { data, error } = await supabase
        .from("ejercicio_plan_personalizado")
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
        .select()
        .single(); 

      if (error) throw new Error("Error al guardar personalización: " + error.message); 
      return { success: true, data }; 
    } 
  }),

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
      if (!user) throw new Error("No autorizado");

      // Obtenemos logs uniéndolos con sesiones para filtrar por alumno
      const { data, error } = await supabase
        .from("ejercicio_logs")
        .select(`
          id,
          peso,
          reps,
          rpe,
          created_at,
          sesion:sesion_id (
            alumno_id
          )
        `)
        .eq("ejercicio_id", input.ejercicio_id)
        .eq("sesion.alumno_id", input.alumno_id)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) throw new Error(`Error al obtener historial: ${error.message}`);

      // Supabase PostgREST a veces devuelve nulos si el join no matchea correctamente en el filtrado eq de la relación
      // pero aquí estamos filtrando logs de sesiones que pertenecen al alumno.
      // Filtramos en JS por si el PostgREST no aplicó el filtro de la relación correctamente en el SELECT.
      const filteredData = data?.filter(log => (log.sesion as any)?.alumno_id === input.alumno_id) || [];

      return {
        success: true,
        history: filteredData.map(log => ({
          peso: log.peso,
          reps: log.reps,
          rpe: log.rpe,
          fecha: log.created_at
        }))
      };
    }
  }),

  /**
   * copyMetricsToNextWeek: Clona los overrides de una semana a la siguiente
   * para acelerar la planificación de sobrecarga progresiva.
   */
  copyMetricsToNextWeek: defineAction({
    accept: "json",
    input: z.object({
      alumno_id: z.string().uuid(),
      from_week: z.number().int(),
      to_week: z.number().int(),
      plan_id: z.string().uuid()
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. Obtener todos los overrides de la semana origen
      const { data: sourceMetrics, error: fetchError } = await supabase
        .from("ejercicio_plan_personalizado")
        .select("*")
        .eq("alumno_id", input.alumno_id)
        .eq("semana_numero", input.from_week);

      if (fetchError) throw new Error("Error al obtener métricas de origen: " + fetchError.message);
      if (!sourceMetrics || sourceMetrics.length === 0) return { success: false, mensaje: "No hay métricas para copiar" };

      // 2. Preparar los datos para la semana destino (Upsert)
      const targetMetrics = sourceMetrics.map(({ id, created_at, updated_at, semana_numero, ...rest }) => ({
        ...rest,
        semana_numero: input.to_week
      }));

      // 3. Upsert en batch
      const { error: upsertError } = await supabase
        .from("ejercicio_plan_personalizado")
        .upsert(targetMetrics, { onConflict: "alumno_id, ejercicio_plan_id, semana_numero" });

      if (upsertError) throw new Error("Error al clonar métricas: " + upsertError.message);

      return { 
        success: true, 
        mensaje: `✅ Métricas clonadas a la Semana ${input.to_week}` 
      };
    }
  }),
};
