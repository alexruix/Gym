import { z } from "zod";
import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { planSchema, studentSchema, updateStudentSchema, inviteStudentSchema, exerciseLibrarySchema, updateAccountSchema, updatePublicProfileSchema, updateNotificationsSchema, updatePrivacySchema, changePasswordSchema, turnoSchema, bulkAssignSchema } from "@/lib/validators";

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
        p_rutinas: input.rutinas,
        p_rotaciones: input.rotaciones
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
        p_rutinas: input.rutinas,
        p_rotaciones: input.rotaciones
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
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await supabase
        .from("alumnos")
        .update({ 
            deleted_at: new Date().toISOString(),
            estado: 'archivado'
        })
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) {
        console.error("[Action: deleteStudent] Error:", error);
        throw new ActionError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: `Error al archivar alumno: ${error.message}` 
        });
      }

      return {
        success: true,
        mensaje: "Alumno archivado",
      };
    },
  }),

  getTurnos: defineAction({
    accept: "json",
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { data, error } = await supabase
        .from("turnos")
        .select("*")
        .eq("profesor_id", user.id)
        .order("hora_inicio");

      if (error) throw new Error(`Error DB: ${error.message}`);
      return data || [];
    }
  }),

  upsertTurno: defineAction({
    accept: "json",
    input: turnoSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

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
        ? await supabase.from("turnos").update(dataToUpsert).eq("id", input.id).eq("profesor_id", user.id).select().single()
        : await supabase.from("turnos").insert(dataToUpsert).select().single();

      if (error) throw new Error(`Error DB: ${error.message}`);

      return {
        success: true,
        turno: data,
        mensaje: `✅ Turno "${data.nombre}" guardado`,
      };
    }
  }),

  deleteTurno: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("turnos")
        .delete()
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) throw new Error(`Error DB: ${error.message}`);

      return {
        success: true,
        mensaje: "✅ Turno eliminado",
      };
    }
  }),

  seedTurnos: defineAction({
    accept: "json",
    input: z.object({ 
      template: z.enum(["morning", "afternoon", "full"]) 
    }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const slots: { hora_inicio: string, hora_fin: string }[] = [];

      if (input.template === "morning" || input.template === "full") {
        for (let i = 8; i < 12; i++) {
          slots.push({ 
            hora_inicio: `${String(i).padStart(2, '0')}:00`, 
            hora_fin: `${String(i + 1).padStart(2, '0')}:00` 
          });
        }
      }

      if (input.template === "afternoon" || input.template === "full") {
        for (let i = 16; i < 21; i++) {
          slots.push({ 
            hora_inicio: `${String(i).padStart(2, '0')}:00`, 
            hora_fin: `${String(i + 1).padStart(2, '0')}:00` 
          });
        }
      }

      const turnosToInsert = slots.map(slot => ({
        profesor_id: user.id,
        nombre: `${slot.hora_inicio} - ${slot.hora_fin}`,
        hora_inicio: slot.hora_inicio,
        hora_fin: slot.hora_fin,
        capacidad_max: 10,
        color_tag: null,
        dias_asistencia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
      }));

      const { data, error } = await supabase
        .from("turnos")
        .insert(turnosToInsert)
        .select();

      if (error) throw new Error(`Error al sembrar turnos: ${error.message}`);

      return { 
        success: true, 
        count: data?.length || 0,
        mensaje: `✅ ${data?.length} bloques horarios creados exitosamente`
      };
    }
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
            turno_id: input.turno_id || null,
            fecha_inicio: dbDate,
            dia_pago: input.dia_pago,
            telefono: input.telefono || null,
            monto: input.monto || null,
            notas: input.notas || null,
            dias_asistencia: input.dias_asistencia || [],
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

  importStudents: defineAction({
    accept: "json",
    input: z.object({
        students: z.array(z.object({
            nombre: z.string().min(2),
            email: z.string().email().optional().or(z.literal('')),
            telefono: z.string().optional().or(z.literal('')),
            horario: z.string().optional().or(z.literal('')), // Campo para Smart-Match
            fecha_inicio: z.string(),
            dia_pago: z.number().min(1).max(31)
        }))
    }),
    handler: async (input, context) => {
        const supabase = createSupabaseServerClient(context);
        const user = context.locals.user;
        
        if (!user) {
            throw new Error("No autorizado");
        }

        // 1. Obtener turnos existentes para el Smart-Match
        const { data: existingTurnos } = await supabase
            .from("turnos")
            .select("*")
            .eq("profesor_id", user.id);

        const turnosMap = new Map<string, string>(); // Cache de nombre/hora -> id

        // Función Helper: Smart-Parse y Smart-Match
        const findOrCreateTurno = async (horarioStr?: string) => {
            if (!horarioStr) return null;
            
            // Normalizar string (ej: "9 a 10hs" -> "09:00:00")
            const match = horarioStr.match(/(\d{1,2})([:.](\d{2}))?/);
            if (!match) return null;

            let hours = parseInt(match[1]);
            let mins = match[3] ? parseInt(match[3]) : 0;
            const startTimeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

            // Buscar coincidencia exacta o cercana en el cache/DB
            const existing = (existingTurnos || []).find(t => t.hora_inicio.startsWith(startTimeStr.substring(0, 5)));
            if (existing) return existing.id;

            // Si no existe, crear un bloque de 60 min
            const endHours = (hours + 1) % 24;
            const endTimeStr = `${endHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
            
            const { data: newTurno, error } = await supabase
                .from("turnos")
                .insert({
                    profesor_id: user.id,
                    nombre: `${hours}hs a ${endHours}hs`,
                    hora_inicio: startTimeStr,
                    hora_fin: endTimeStr,
                })
                .select()
                .single();

            if (error || !newTurno) return null;
            
            existingTurnos?.push(newTurno); // Actualizar cache local para el siguiente alumno
            return newTurno.id;
        };

        const studentsWithTurnos = [];
        for (const s of input.students) {
            const turnoId = await findOrCreateTurno(s.horario);
            studentsWithTurnos.push({
                profesor_id: user.id,
                nombre: s.nombre,
                email: s.email ? s.email.toLowerCase().trim() : null,
                telefono: s.telefono || null,
                turno_id: turnoId,
                fecha_inicio: s.fecha_inicio.split('T')[0],
                dia_pago: s.dia_pago,
                estado: 'activo'
            });
        }

        const { data, error } = await supabase
            .from("alumnos")
            .insert(studentsWithTurnos)
            .select("id");

        if (error) {
            console.error("[Action: importStudents] Insert Error", error);
            throw new Error(`Falló la importación: ${error.message}`);
        }

        return {
            success: true,
            importedCount: data.length
        };
    }
  }),

  /** Recalcula y devuelve el progreso de la sesión de un alumno (para Realtime) */
  getStudentSessionProgress: defineAction({
    accept: "json",
    input: z.object({ alumno_id: z.string().uuid() }),
    handler: async (input, context) => {
        const supabase = createSupabaseServerClient(context);
        const today = new Date().toISOString().split('T')[0];

        const { data: session, error } = await supabase
            .from("sesiones_instanciadas")
            .select(`
                id,
                sesion_ejercicios_instanciados (
                    id,
                    completado,
                    exercise_type,
                    peso_target,
                    peso_real,
                    biblioteca_ejercicios ( nombre )
                )
            `)
            .eq("alumno_id", input.alumno_id)
            .eq("fecha_real", today)
            .maybeSingle();

        if (error || !session) return null;

        const exercises = session.sesion_ejercicios_instanciados || [];
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
      if (input.monto !== undefined) updateData.monto = input.monto;
      if (input.notas !== undefined) updateData.notas = input.notas;
      if (input.turno_id !== undefined) updateData.turno_id = input.turno_id;
      if (input.dias_asistencia !== undefined) updateData.dias_asistencia = input.dias_asistencia;

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

  getExercises: defineAction({
    accept: "json",
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const { data } = await supabase.from("biblioteca_ejercicios").select("id, nombre, media_url").eq("profesor_id", user.id).order("nombre");
      return data;
    },
  }),

  /**
   * getExerciseVariants: Obtiene los ejercicios que son variantes o padres del ejercicio dado.
   * Útil para sugerir sustituciones directas (hermanos o padre).
   */
  getExerciseVariants: defineAction({
    accept: "json",
    input: z.object({ exercise_id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. Obtener datos del ejercicio actual para conocer su parentesco
      const { data: current } = await supabase
        .from("biblioteca_ejercicios")
        .select("id, parent_id, is_template_base")
        .eq("id", input.exercise_id)
        .single();

      if (!current) throw new Error("Ejercicio no encontrado");

      const query = supabase
        .from("biblioteca_ejercicios")
        .select("id, nombre, media_url")
        .eq("profesor_id", user.id)
        .neq("id", input.exercise_id); // Excluir el mismo

      if (current.parent_id) {
          // Es una variante -> Buscar hermanos y al padre
          query.or(`parent_id.eq.${current.parent_id},id.eq.${current.parent_id}`);
      } else {
          // Es un base -> Buscar sus variantes (hijos)
          query.eq("parent_id", current.id);
      }

      const { data } = await query.order("nombre");
      return data || [];
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

  bulkUpdateStudents: defineAction({
    accept: "json",
    input: bulkAssignSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("alumnos")
        .update({
          turno_id: input.turno_id,
          dias_asistencia: input.dias_asistencia,
        })
        .in("id", input.studentIds)
        .eq("profesor_id", user.id);

      if (error) {
        console.error("[Action: bulkUpdateStudents] Error:", error);
        throw new Error(`Falla técnica al organizar a los chicos: ${error.message}`);
      }

      return {
        success: true,
        mensaje: "¡Listo! Ya sumaste a los chicos al turno correspondiente.",
      };
    },
  }),
};
