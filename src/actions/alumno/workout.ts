import { defineAction, ActionError } from "astro:actions";
import { getAuthenticatedClient } from "@/lib/supabase-ssr";
import { 
  instanciarSesionSchema,
  logEjercicioInstanciadoSchema,
  completarSesionSchema,
  updateStudentMetricWithPropagationSchema,
  swapExerciseInStudentPlanSchema,
  completeSessionByProfessorSchema,
  addExerciseToStudentPlanSchema,
  removeExerciseFromStudentPlanSchema,
  sessionLogSchema,
  commentExerciseSchema,
  completeSessionSchema
} from "../../lib/validators";
import { getTodayISO } from "@/lib/schedule";

/**
 * Helper: Sanitiza un string para convertirlo en un número decimal válido para Postgres.
 */
const sanitizeWeight = (val: string | null | undefined): number | null => {
  if (!val) return null;
  const cleaned = val.replace(/[^0-9.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Alumno: Workout Actions
 * Maneja la ejecución diaria, instanciación de sesiones y ajustes operativos.
 */
export const workoutActions = {

  /** instanciarSesion: Obtiene o crea la sesión operativa para una fecha. */
  instanciarSesion: defineAction({
    accept: "json",
    input: instanciarSesionSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const fechaReal = input.fecha_real || getTodayISO();
      
      const { data, error } = await (supabase as any).rpc('instanciar_sesion_alumno', {
        p_alumno_id: input.alumno_id || user.id,
        p_fecha_real: fechaReal,
        p_force_rutina_id: input.rutina_id
      });

      if (error) {
        console.error("[Action: instanciarSesion] RPC Error:", error);
        throw new ActionError({ 
          code: "BAD_REQUEST", 
          message: "Error al inicializar la sesión." 
        });
      }

      const rpcData = data as any;
      if (rpcData?.error) {
        throw new ActionError({ code: "BAD_REQUEST", message: rpcData.error });
      }

      const { data: sesionCompleta } = await supabase
        .from("sesiones_instanciadas")
        .select(`
          *,
          sesion_ejercicios_instanciados (
            *,
            biblioteca_ejercicios (id, nombre, descripcion, media_url)
          )
        `)
        .eq("id", rpcData.sesion_id)
        .single();

      return { 
        success: true, 
        message: "Sesión sincronizada",
        data: { sesion: sesionCompleta, creada: true } 
      };
    },
  }),

  /** logEjercicioInstanciado: Guarda métricas reales de un ejercicio. */
  logEjercicioInstanciado: defineAction({
    accept: "json",
    input: logEjercicioInstanciadoSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { error } = await (supabase
        .from("sesion_ejercicios_instanciados") as any)
        .update({
          series_real: input.series_real,
          reps_real: input.reps_real,
          peso_real: input.peso_real ?? null,
          nota_alumno: input.nota_alumno ?? null,
          rpe: input.rpe ?? null,
          completado: input.completado,
        })
        .eq("id", input.sesion_ejercicio_id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error al guardar progreso: ${error.message}` });

      return { success: true, message: "✅ Progreso guardado" };
    },
  }),

  /** completarSesionInstanciada: Cierra la sesión del día. */
  completarSesionInstanciada: defineAction({
    accept: "json",
    input: completarSesionSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { error } = await (supabase
        .from("sesiones_instanciadas") as any)
        .update({
          estado: "completada",
          notas_alumno: input.notas_alumno ?? null,
          completed_at: new Date().toISOString(),
        } as any)
        .eq("id", input.sesion_id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error al cerrar sesión: ${error.message}` });

      const { data: a } = await supabase
        .from("alumnos")
        .select("profesor_id, nombre")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();
      
      const alumno = a as any;

      if (alumno) {
        await supabase.from("notificaciones").insert({
          profesor_id: alumno.profesor_id,
          alumno_id: user.id,
          tipo: "sesion_completada",
          mensaje: `${alumno.nombre} completó su rutina de hoy.${input.notas_alumno ? ` Nota: "${input.notas_alumno.substring(0, 40)}..."` : ""}`,
          referencia_id: input.sesion_id,
        } as any);

        // Detector de Burnout (Logic simplified for readability in modular file)
        const { data: ultimasSesiones } = await supabase
          .from("sesiones_instanciadas")
          .select("id")
          .eq("alumno_id", alumno.id)
          .eq("estado", "completada")
          .order("completed_at", { ascending: false })
          .limit(3);

        const ids = ((ultimasSesiones as any[]) || []).map((s: any) => s.id);
        if (ids.length === 3) {
          const { data: rpe10s } = await supabase
            .from("sesion_ejercicios_instanciados")
            .select("sesion_id")
            .in("sesion_id", ids)
            .eq("rpe", 10);

          const uniqueSessions = new Set(((rpe10s as any[]) || []).map((e: any) => e.sesion_id));
          if (uniqueSessions.size === 3) {
            await supabase.from("notificaciones").insert({
              profesor_id: alumno.profesor_id,
              alumno_id: user.id,
              tipo: "burnout_alert",
              mensaje: `⚠️ ALERTA DE FATIGA: ${alumno.nombre} reportó Esfuerzo Máximo (RPE 10) en sus últimas 3 sesiones.`,
              referencia_id: input.sesion_id,
            } as any);
          }
        }
      }

      return { success: true, message: "🏆 ¡Sesión completada!" };
    },
  }),

  /** updateStudentMetricWithPropagation: Progresión técnica (RPC-based). */
  updateStudentMetricWithPropagation: defineAction({
    accept: "json",
    input: updateStudentMetricWithPropagationSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data, error } = await (supabase as any).rpc('propagar_metrica_ejercicio', {
        p_alumno_id: input.alumno_id,
        p_ejercicio_plan_id: input.ejercicio_plan_id,
        p_semana_desde: input.semana_numero,
        p_series: input.series,
        p_reps_target: input.reps_target,
        p_descanso_seg: input.descanso_seg,
        p_peso_target: input.peso_target
      });

      const rpcMetricData = data as any;
      if (error || (rpcMetricData?.error)) {
        throw new ActionError({ code: "BAD_REQUEST", message: rpcMetricData?.error || "Error al propagar mejoras." });
      }

      return { success: true, mensaje: "Progresión aplicada correctamente." };
    }
  }),

  /** swapExerciseInStudentPlan: Sustitución de ejercicio (RPC-based para permanente). */
  swapExerciseInStudentPlan: defineAction({
    accept: "json",
    input: swapExerciseInStudentPlanSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      if (input.is_permanent) {
        const { data, error } = await (supabase as any).rpc('sustituir_ejercicio_permanente', {
          p_instancia_id: input.ejercicio_id,
          p_nuevo_biblioteca_id: input.nuevo_biblioteca_id
        });

        const rpcSwapData = data as any;
        if (error || (rpcSwapData?.error)) {
          throw new ActionError({ code: "BAD_REQUEST", message: rpcSwapData?.error || "Error en cambio permanente." });
        }
        return { success: true, mensaje: "Sustitución permanente aplicada." };
      } else {
        const { error } = await (supabase as any)
            .from("sesion_ejercicios_instanciados")
            .update({ 
                ejercicio_id: input.nuevo_biblioteca_id, 
                is_variation: true,
                series_real: null, reps_real: null, peso_real: null, completado: false 
            })
            .eq("id", input.ejercicio_id);

        if (error) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Error al sustituir ejercicio." });
        return { success: true, mensaje: "Sustituido solo por hoy." };
      }
    }
  }),

  /** completeSessionByProfessor: Cierre administrativo de sesión. */
  completeSessionByProfessor: defineAction({
    accept: "json",
    input: completeSessionByProfessorSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data: a } = await supabase.from("alumnos").select("profesor_id, nombre").eq("id", input.alumno_id).single();
      const alumno = a as any;

      if (!alumno || alumno.profesor_id !== user.id) {
        throw new ActionError({ code: "FORBIDDEN", message: "Sin permisos" });
      }

      const { error } = await (supabase.from("sesiones_instanciadas") as any)
        .update({
          estado: "completada",
          completed_at: new Date().toISOString(),
          notas_alumno: "Completada por el profesor",
          completed_by_professor: true
        } as any) 
        .eq("id", input.sesion_id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, mensaje: `Sesión de ${alumno.nombre} marcada como realizada.` };
    }
  }),

  /** addExerciseToStudentPlan: Añadir ejercicio (Puesta al día con SSOT structural). */
  addExerciseToStudentPlan: defineAction({
    accept: "json",
    input: addExerciseToStudentPlanSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data: s, error: sesionErr } = await supabase
        .from("sesiones_instanciadas")
        .select("*, alumnos(profesor_id, plan_id, nombre)")
        .eq("id", input.sesion_id)
        .single();
      
      if (sesionErr || !s) throw new ActionError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
      const sesion = s as any;
      const alumno = sesion.alumnos as any;
      if (alumno.profesor_id !== user.id) throw new ActionError({ code: "FORBIDDEN", message: "Sin permisos" });

      if (input.is_permanent) {
        const { data: plan } = await supabase.from("planes").select("nombre, is_template").eq("id", alumno.plan_id).single();
        let planId = alumno.plan_id;

        if ((plan as any)?.is_template) {
          const { data: forkedId, error: forkErr } = await (supabase as any).rpc("fork_plan", {
            p_plan_id: planId,
            p_alumno_id: input.alumno_id,
            p_nuevo_nombre: `${(plan as any).nombre} (${alumno.nombre})`
          });
          if (forkErr) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Error al personalizar plan" });
          planId = forkedId;
          await (supabase as any).from("alumnos").update({ plan_id: planId }).eq("id", input.alumno_id);
        }

        const { data: rutina } = await (supabase.from("rutinas_diarias") as any).select("id").eq("plan_id", planId).eq("dia_numero", sesion.numero_dia_plan).single();
        if (!rutina) throw new ActionError({ code: "NOT_FOUND", message: "Estructura no encontrada" });

        const { data: countRes } = await (supabase.from("ejercicios_plan") as any).select("orden").eq("rutina_id", (rutina as any).id).order("orden", { ascending: false }).limit(1);
        const nextOrder = ((countRes as any[])?.[0]?.orden ?? 0) + 1;

        const { data: newEjPlan } = await (supabase.from("ejercicios_plan") as any)
          .insert({ rutina_id: (rutina as any).id, ejercicio_id: input.biblioteca_id, orden: nextOrder, series: 3, reps_target: "10", descanso_seg: 60 })
          .select("id")
          .single();
        
        const { data: sesionesFuturas } = await (supabase.from("sesiones_instanciadas") as any).select("id").eq("alumno_id", input.alumno_id).eq("numero_dia_plan", sesion.numero_dia_plan).is("estado", "pendiente");
        const idsAInstanciar = [sesion.id, ...(((sesionesFuturas as any[])?.map((s: any) => s.id) || []).filter(id => id !== sesion.id))];
        
        if (idsAInstanciar.length > 0) {
          await (supabase.from("sesion_ejercicios_instanciados") as any).insert(idsAInstanciar.map(sid => ({
            sesion_id: sid,
            ejercicio_id: input.biblioteca_id,
            ejercicio_plan_id: (newEjPlan as any).id,
            orden: nextOrder,
            series_plan: 3,
            reps_plan: "10",
            descanso_seg: 60,
            is_variation: false
          })));
        }
        return { success: true, mensaje: "✅ Ejercicio añadido permanentemente." };
      } else {
        const { data: countRes } = await (supabase.from("sesion_ejercicios_instanciados") as any).select("orden").eq("sesion_id", input.sesion_id).order("orden", { ascending: false }).limit(1);
        const nextOrder = ((countRes as any[])?.[0]?.orden ?? 0) + 1;
        await (supabase.from("sesion_ejercicios_instanciados") as any).insert({ sesion_id: input.sesion_id, ejercicio_id: input.biblioteca_id, orden: nextOrder, series_plan: 3, reps_plan: "10", descanso_seg: 60, is_variation: true });
        return { success: true, mensaje: "✅ Ejercicio añadido para hoy." };
      }
    }
  }),

  /** removeExerciseFromStudentPlan: Eliminar ejercicio. */
  removeExerciseFromStudentPlan: defineAction({
    accept: "json",
    input: removeExerciseFromStudentPlanSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data: i } = await supabase.from("sesion_ejercicios_instanciados").select("*, sesiones_instanciadas(alumno_id, numero_dia_plan, semana_numero, alumnos(profesor_id))").eq("id", input.ejercicio_id).single();
      if (!i) throw new ActionError({ code: "NOT_FOUND", message: "Ejercicio no encontrado" });
      const instancia = i as any;
      if (instancia.sesiones_instanciadas.alumnos.profesor_id !== user.id) throw new ActionError({ code: "FORBIDDEN", message: "Sin permisos" });

      if (input.is_permanent) {
        const ejPlanId = instancia.ejercicio_plan_id;
        if (!ejPlanId) throw new ActionError({ code: "BAD_REQUEST", message: "Solo ejercicios base se pueden quitar permanentemente." });

        await (supabase.from("ejercicios_plan") as any).delete().eq("id", ejPlanId);
        const { data: f } = await (supabase.from("sesiones_instanciadas") as any).select("id").eq("alumno_id", instancia.sesiones_instanciadas.alumno_id).eq("numero_dia_plan", instancia.sesiones_instanciadas.numero_dia_plan).gte("semana_numero", instancia.sesiones_instanciadas.semana_numero);
        if (f && f.length > 0) {
          await (supabase.from("sesion_ejercicios_instanciados") as any).delete().eq("ejercicio_plan_id", ejPlanId).is("completado", false).in("sesion_id", (f as any[]).map(s => s.id));
        }
        return { success: true, mensaje: "✅ Ejercicio eliminado permanentemente." };
      } else {
        await (supabase.from("sesion_ejercicios_instanciados") as any).delete().eq("id", input.ejercicio_id);
        return { success: true, mensaje: "✅ Ejercicio eliminado solo hoy." };
      }
    }
  }),

  /** Legacy / Passthrough markers */
  logExercise: defineAction({ accept: "json", input: sessionLogSchema, handler: async () => ({ success: true }) }),
  commentExercise: defineAction({ accept: "json", input: commentExerciseSchema, handler: async () => ({ success: true }) }),
  completeSession: defineAction({ accept: "json", input: completeSessionSchema, handler: async () => ({ success: true }) }),
};
