import { defineAction } from "astro:actions";
import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/supabase-ssr";
import {
  sessionLogSchema,
  commentExerciseSchema,
  completeSessionSchema,
  instanciarSesionSchema,
  logEjercicioInstanciadoSchema,
  completarSesionSchema,
  addExerciseToStudentPlanSchema,
  removeExerciseFromStudentPlanSchema,
  swapExerciseInStudentPlanSchema,
} from "@/lib/validators";
import { getDayNumber, getWeekNumber, getTodayISO, getCyclicDayNumber } from "@/lib/schedule";

export const alumnoActions = {

  // =============================================
  // CALENDARIO OPERATIVO REAL
  // =============================================

  /**
   * instanciarSesion: Obtiene o crea la sesión instanciada del alumno para una fecha dada.
   * Si ya existe la sesión, la devuelve con todos sus ejercicios.
   * Si no existe, la crea a partir del plan asignado y la devuelve.
   */
  instanciarSesion: defineAction({
    accept: "json",
    input: instanciarSesionSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      const fechaReal = input.fecha_real || getTodayISO();

      // 1. Obtener datos del alumno y su plan
      const { data: alumno, error: alumnoErr } = await supabase
        .from("alumnos")
        .select("id, nombre, fecha_inicio, plan_id")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();

      if (alumnoErr || !alumno || !alumno.plan_id) {
        throw new Error("Alumno sin plan asignado");
      }

      // 2. Buscar si ya existe la sesión instanciada para esta fecha
      const { data: sesionExistente } = await supabase
        .from("sesiones_instanciadas")
        .select(`
          *,
          sesion_ejercicios_instanciados (
            id, ejercicio_id, ejercicio_plan_id, orden, series_plan, reps_plan, peso_plan,
            descanso_seg, series_real, reps_real, peso_real, exercise_type,
            is_variation, nota_alumno, completado,
            biblioteca_ejercicios (id, nombre, descripcion, media_url)
          )
        `)
        .eq("alumno_id", alumno.id)
        .eq("fecha_real", fechaReal)
        .single();

      if (sesionExistente) {
        // Sesión ya instanciada → devolver directamente
        return { sesion: sesionExistente, creada: false };
      }

      // 3. Calcular qué día del plan le corresponde hoy
      const fechaInicio = alumno.fecha_inicio || new Date().toISOString().split("T")[0];
      const diaAbsoluto = getDayNumber(fechaInicio, new Date(fechaReal));
      const semanaActual = getWeekNumber(fechaInicio, new Date(fechaReal));

      // 4. Buscar las rutinas del plan para saber cuántos días tiene
      const { data: rutinasDiarias } = await supabase
        .from("rutinas_diarias")
        .select("id, dia_numero, nombre_dia")
        .eq("plan_id", alumno.plan_id)
        .order("dia_numero", { ascending: true });

      if (!rutinasDiarias || rutinasDiarias.length === 0) {
        throw new Error("El plan no tiene rutinas configuradas");
      }

      // 5. Calcular el día cíclico (módulo sobre total de días del plan)
      const diaCiclico = getCyclicDayNumber(diaAbsoluto, rutinasDiarias.length);
      const rutinaDeHoy = rutinasDiarias.find((r) => r.dia_numero === diaCiclico);

      if (!rutinaDeHoy) {
        throw new Error(`No se encontró rutina para el día ${diaCiclico}`);
      }

      // 6. Buscar los ejercicios de esa rutina
      const { data: ejerciciosPlan } = await supabase
        .from("ejercicios_plan")
        .select(`
          id, orden, series, reps_target, descanso_seg, peso_target,
          exercise_type, position,
          biblioteca_ejercicios (id, nombre, descripcion, media_url)
        `)
        .eq("rutina_id", rutinaDeHoy.id)
        .order("orden", { ascending: true });

      // 7. Crear la cabecera de la sesión instanciada
      const { data: nuevaSesion, error: errorSesion } = await supabase
        .from("sesiones_instanciadas")
        .insert({
          alumno_id: alumno.id,
          plan_id: alumno.plan_id,
          numero_dia_plan: diaCiclico,
          semana_numero: semanaActual,
          fecha_real: fechaReal,
          nombre_dia: rutinaDeHoy.nombre_dia || `Día ${diaCiclico}`,
          estado: "pendiente",
        })
        .select("id")
        .single();

      if (errorSesion || !nuevaSesion) {
        throw new Error(`Error al crear sesión: ${errorSesion?.message}`);
      }

      // 8. Instanciar los ejercicios del plan en la sesión
      const ejerciciosAInsertar = (ejerciciosPlan || []).map((ej) => {
        const bib = ej.biblioteca_ejercicios as any;
        const ejercicioId = Array.isArray(bib) ? bib[0]?.id : bib?.id;
        return {
          sesion_id: nuevaSesion.id,
          ejercicio_id: ejercicioId || "",
          ejercicio_plan_id: ej.id, // Vínculo con el plan estructural
          orden: ej.orden,
          series_plan: ej.series,
          reps_plan: ej.reps_target,
          peso_plan: ej.peso_target ? parseFloat(ej.peso_target as string) : null,
          descanso_seg: ej.descanso_seg,
          exercise_type: (ej as any).exercise_type || "base",
          is_variation: false,
        };
      }).filter((ej) => ej.ejercicio_id !== "");

      if (ejerciciosAInsertar.length > 0) {
        await supabase
          .from("sesion_ejercicios_instanciados")
          .insert(ejerciciosAInsertar);
      }

      // 9. Retornar la sesión recién creada con todos sus ejercicios
      const { data: sesionCompleta } = await supabase
        .from("sesiones_instanciadas")
        .select(`
          *,
          sesion_ejercicios_instanciados (
            id, ejercicio_id, ejercicio_plan_id, orden, series_plan, reps_plan, peso_plan,
            descanso_seg, series_real, reps_real, peso_real, exercise_type,
            is_variation, nota_alumno, completado,
            biblioteca_ejercicios (id, nombre, descripcion, media_url)
          )
        `)
        .eq("id", nuevaSesion.id)
        .single();

      return { sesion: sesionCompleta, creada: true };
    },
  }),

  /**
   * logEjercicioInstanciado: Guarda las métricas reales de un ejercicio instanciado.
   */
  logEjercicioInstanciado: defineAction({
    accept: "json",
    input: logEjercicioInstanciadoSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      const { error } = await supabase
        .from("sesion_ejercicios_instanciados")
        .update({
          series_real: input.series_real,
          reps_real: input.reps_real,
          peso_real: input.peso_real ?? null,
          nota_alumno: input.nota_alumno ?? null,
          completado: input.completado,
        })
        .eq("id", input.sesion_ejercicio_id);

      if (error) throw new Error(`Error al guardar progreso: ${error.message}`);

      return { success: true, mensaje: "✅ Progreso guardado" };
    },
  }),

  /**
   * completarSesionInstanciada: Marca la sesión del día como completada.
   */
  completarSesionInstanciada: defineAction({
    accept: "json",
    input: completarSesionSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      const { error } = await supabase
        .from("sesiones_instanciadas")
        .update({
          estado: "completada",
          notas_alumno: input.notas_alumno ?? null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", input.sesion_id);

      if (error) throw new Error(`Error al cerrar sesión: ${error.message}`);

      // Notificar al profesor
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("profesor_id, nombre")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();

      if (alumno) {
        await supabase.from("notificaciones").insert({
          profesor_id: alumno.profesor_id,
          alumno_id: user.id,
          tipo: "sesion_completada",
          mensaje: `${alumno.nombre} completó su rutina de hoy.${input.notas_alumno ? ` Nota: "${input.notas_alumno.substring(0, 40)}..."` : ""}`,
          referencia_id: input.sesion_id,
        });
      }

      return { success: true, mensaje: "🏆 ¡Sesión completada!" };
    },
  }),


  /**
   * getWeeklySessions: Devuelve las sesiones de una ventana de días alrededor de hoy.
   * Se usa para alimentar el DayCalendarStrip con estados reales de la semana.
   * Devuelve hasta 14 días (7 pasados + hoy + 6 futuros = 14 días de ventana).
   */
  getWeeklySessions: defineAction({
    accept: "json",
    input: z.object({
      dias_atras: z.number().int().min(0).max(30).default(7),
      dias_adelante: z.number().int().min(0).max(30).default(6),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      // 1. Obtener datos del alumno
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("id, fecha_inicio, plan_id")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();

      if (!alumno || !alumno.plan_id) {
        return { dias: [] };
      }

      // 2. Calcular el rango de fechas
      const hoy = new Date();
      const desde = new Date(hoy);
      desde.setDate(hoy.getDate() - input.dias_atras);
      const hasta = new Date(hoy);
      hasta.setDate(hoy.getDate() + input.dias_adelante);

      const desdISO = desde.toISOString().split("T")[0];
      const hastaISO = hasta.toISOString().split("T")[0];

      // 3. Obtener sesiones instanciadas en ese rango
      const { data: sesiones } = await supabase
        .from("sesiones_instanciadas")
        .select("id, fecha_real, numero_dia_plan, semana_numero, nombre_dia, estado, completed_at")
        .eq("alumno_id", alumno.id)
        .gte("fecha_real", desdISO)
        .lte("fecha_real", hastaISO)
        .order("fecha_real", { ascending: true });

      const sesionesMap: Record<string, any> = {};
      (sesiones || []).forEach((s) => {
        sesionesMap[s.fecha_real] = s;
      });

      // 4. Construir el array de días con cálculo de numero_dia_plan para los que no existen
      const fechaInicio = alumno.fecha_inicio || hoy.toISOString().split("T")[0];
      const days = [];
      const currentDate = new Date(desde);

      while (currentDate <= hasta) {
        const fechaISO = currentDate.toISOString().split("T")[0];
        const esFuturo = currentDate > hoy;
        const esHoy = fechaISO === hoy.toISOString().split("T")[0];

        const sesion = sesionesMap[fechaISO];
        const numeroDia = sesion?.numero_dia_plan ?? getDayNumber(fechaInicio, currentDate);
        const semana = sesion?.semana_numero ?? getWeekNumber(fechaInicio, currentDate);

        let status: string;
        if (sesion) {
          status = sesion.estado;
        } else if (esFuturo && !esHoy) {
          status = "futura";
        } else {
          status = "pendiente";
        }

        days.push({
          fecha: fechaISO,
          numeroDiaPlan: numeroDia,
          semana,
          status,
          nombreDia: sesion?.nombre_dia ?? null,
          esHoy,
          esFuturo: esFuturo && !esHoy,
          sesionId: sesion?.id ?? null,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 5. DETECTOR DE OMISIONES (Buffer de Desfase)
      // Buscamos si las últimas 3 sesiones pasadas (antes de hoy) están en estado 'omitida'
      const pasadas = days.filter(d => !d.esFuturo && !d.esHoy).reverse();
      let consecutiveOmissions = 0;
      for (const d of pasadas) {
          if (d.status === 'omitida') consecutiveOmissions++;
          else break;
      }

      return { 
          dias: days, 
          hasConsecutiveOmissions: consecutiveOmissions >= 3 
      };
    },
  }),

  /**
   * updateStudentMetricWithPropagation: Actualiza una métrica de ejercicio
   * (usada por el profesor) y propaga el cambio a todas las semanas futuras.
   */
  updateStudentMetricWithPropagation: defineAction({
    accept: "json",
    input: z.object({
      alumno_id: z.string().uuid(),
      ejercicio_plan_id: z.string().uuid(),
      semana_numero: z.number().int(),
      series: z.number().int().optional(),
      reps_target: z.string().optional(),
      descanso_seg: z.number().int().optional(),
      peso_target: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      // 1. Validar permisos y obtener duración del plan
      const { data: alumno, error: alumnoError } = await supabase
        .from("alumnos")
        .select(`
          id, profesor_id, plan_id,
          planes ( duracion_semanas )
        `)
        .eq("id", input.alumno_id)
        .single();

      if (alumnoError || !alumno) throw new Error("Alumno no encontrado");
      if (alumno.profesor_id !== user.id && alumno.id !== user.id) {
        throw new Error("No tienes permisos para editar este alumno");
      }

      const plan = Array.isArray(alumno.planes) ? alumno.planes[0] : (alumno.planes as any);
      const maxWeeks = plan?.duracion_semanas || 4;

      // 2. Persistir Overrides (Propagación)
      const metricsToPersist = [];
      for (let w = input.semana_numero; w <= maxWeeks; w++) {
        metricsToPersist.push({
          alumno_id: input.alumno_id,
          ejercicio_plan_id: input.ejercicio_plan_id,
          semana_numero: w,
          series: input.series,
          reps_target: input.reps_target,
          descanso_seg: input.descanso_seg,
          peso_target: input.peso_target,
          updated_at: new Date().toISOString()
        });
      }

      const { error: upsertError } = await supabase
        .from("ejercicio_plan_personalizado")
        .upsert(metricsToPersist, { onConflict: "alumno_id, ejercicio_plan_id, semana_numero" });

      if (upsertError) throw new Error("Error al persistir cambios: " + upsertError.message);

      // 3. Sincronizar Instancias ya creadas (futuras y hoy no completadas)
      const { data: sesiones } = await supabase
        .from("sesiones_instanciadas")
        .select("id")
        .eq("alumno_id", input.alumno_id)
        .gte("semana_numero", input.semana_numero);

      if (sesiones && sesiones.length > 0) {
        const sesionIds = sesiones.map(s => s.id);
        await supabase
          .from("sesion_ejercicios_instanciados")
          .update({
            series_plan: input.series,
            reps_plan: input.reps_target,
            peso_plan: input.peso_target ? parseFloat(input.peso_target) : null,
            descanso_plan: input.descanso_seg,
            updated_at: new Date().toISOString()
          })
          .eq("ejercicio_plan_id", input.ejercicio_plan_id)
          .is("completado", false)
          .in("sesion_id", sesionIds);
      }

      return {
        success: true,
        count: metricsToPersist.length,
        mensaje: `Actualizamos semana ${input.semana_numero} y las ${metricsToPersist.length - 1} posteriores.`
      };
    }
  }),

  /**
   * swapExerciseInStudentPlan: (Profesor) Sustituye un ejercicio por otro.
   * Si es permanente, lo cambia en el plan maestro y propaga a futuras.
   */
  swapExerciseInStudentPlan: defineAction({
    accept: "json",
    input: swapExerciseInStudentPlanSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      const { data: instancia, error: instErr } = await supabase
        .from("sesion_ejercicios_instanciados")
        .select("*, sesiones_instanciadas(alumno_id, numero_dia_plan, semana_numero, alumnos(profesor_id, plan_id, nombre))")
        .eq("id", input.ejercicio_id)
        .single();
      
      if (instErr || !instancia) throw new Error("Ejercicio no encontrado");
      const sesion = instancia.sesiones_instanciadas as any;
      const alumno = sesion.alumnos as any;
      if (alumno.profesor_id !== user.id) throw new Error("Sin permisos");

      const { data: bibEj } = await supabase.from("biblioteca_ejercicios").select("nombre").eq("id", input.nuevo_biblioteca_id).single();
      const nombreEj = bibEj?.nombre || "Nuevo Ejercicio";

      if (input.is_permanent) {
        let planId = alumno.plan_id;
        const ejPlanId = instancia.ejercicio_plan_id;
        if (!ejPlanId) throw new Error("Sólo se pueden sustituir permanentemente los ejercicios base del plan.");

        const { data: plan } = await supabase.from("planes").select("is_template").eq("id", planId).single();
        if (plan?.is_template) {
          const { data: forkedId, error: forkErr } = await supabase.rpc("fork_plan", {
            p_plan_id: planId,
            p_alumno_id: input.alumno_id,
            p_nuevo_nombre: `Plan de ${alumno.nombre}`
          });
          if (forkErr) throw new Error("Error personalizando plan: " + forkErr.message);
          planId = forkedId;
          await supabase.from("alumnos").update({ plan_id: planId }).eq("id", input.alumno_id);
        }

        // Actualizar ejercicio en el plan maestro
        await supabase.from("ejercicios_plan").update({ ejercicio_id: input.nuevo_biblioteca_id }).eq("id", ejPlanId);

        // Propagar a instancias futuras no completadas
        const { data: futuras } = await supabase.from("sesiones_instanciadas").select("id").eq("alumno_id", input.alumno_id).eq("numero_dia_plan", sesion.numero_dia_plan).is("estado", "pendiente");
        if (futuras && futuras.length > 0) {
            const ids = futuras.map(s => s.id);
            await supabase.from("sesion_ejercicios_instanciados").update({ 
                ejercicio_id: input.nuevo_biblioteca_id,
                series_real: null, reps_real: null, peso_real: null, completado: false, is_variation: false 
            }).eq("ejercicio_plan_id", ejPlanId).in("sesion_id", ids);
        }
        return { success: true, mensaje: `✅ Sustitución de "${nombreEj}" aplicada permanentemente.` };
      } else {
        await supabase.from("sesion_ejercicios_instanciados").update({ 
            ejercicio_id: input.nuevo_biblioteca_id, 
            is_variation: true,
            series_real: null, reps_real: null, peso_real: null, completado: false 
        }).eq("id", input.ejercicio_id);
        return { success: true, mensaje: `✅ Sustituidopor "${nombreEj}" solo por hoy.` };
      }
    }
  }),

  /**
   * completeSessionByProfessor: (Profesor) Marca la sesión del alumno como completada.
   * Útil si el alumno olvidó iniciar o marcar su sesión.
   */
  completeSessionByProfessor: defineAction({
    accept: "json",
    input: z.object({
      sesion_id: z.string().uuid(),
      alumno_id: z.string().uuid(),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      // 1. Validar que es el profesor
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("profesor_id, nombre")
        .eq("id", input.alumno_id)
        .single();

      if (!alumno || alumno.profesor_id !== user.id) {
        throw new Error("No tienes permisos para completar esta sesión");
      }

      // 2. Marcar como completada
      const { error } = await supabase
        .from("sesiones_instanciadas")
        .update({
          estado: "completada",
          completed_at: new Date().toISOString(),
          notas_alumno: "Completada por el profesor",
          completed_by_professor: true // Asumiendo que existe el campo o se documenta como metadata
        } as any) // Cast a any por si el campo no existe aún en tipos
        .eq("id", input.sesion_id);

      if (error) throw new Error("Error al cerrar sesión: " + error.message);

      return { success: true, mensaje: `Sesión de ${alumno.nombre} marcada como realizada.` };
    }
  }),

  /**
   * updateStudentStartDateOffset: (Profesor) Desplaza la fecha_inicio del alumno.
   * Se usa cuando el alumno falta varios días y queremos "pausar" el calendario técnico.
   */
  updateStudentStartDateOffset: defineAction({
    accept: "json",
    input: z.object({
      alumno_id: z.string().uuid(),
      offset_days: z.number().int(), // Ej: 3 para mover 3 días al futuro
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      // 1. Obtener fecha_inicio actual
      const { data: alumno } = await supabase
        .from("alumnos")
        .select("profesor_id, fecha_inicio, nombre")
        .eq("id", input.alumno_id)
        .single();

      if (!alumno || alumno.profesor_id !== user.id) {
        throw new Error("Sin permisos");
      }

      const currentStart = new Date(alumno.fecha_inicio);
      currentStart.setDate(currentStart.getDate() + input.offset_days);
      const newStartISO = currentStart.toISOString().split("T")[0];

      // 2. Actualizar alumno
      const { error } = await supabase
        .from("alumnos")
        .update({ fecha_inicio: newStartISO })
        .eq("id", input.alumno_id);

      if (error) throw new Error("Error al desplazar fecha: " + error.message);

      return { 
          success: true, 
          mensaje: `Calendario de ${alumno.nombre} reajustado +${input.offset_days} días.`,
          nueva_fecha: newStartISO 
      };
    }
  }),

  /**
   * addExerciseToStudentPlan: (Profesor) Añade un ejercicio a la sesión.
   * Si es permanente, lo añade al plan maestro y propaga a futuras.
   */
  addExerciseToStudentPlan: defineAction({
    accept: "json",
    input: addExerciseToStudentPlanSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      const { data: sesion, error: sesionErr } = await supabase
        .from("sesiones_instanciadas")
        .select("*, alumnos(profesor_id, plan_id, nombre)")
        .eq("id", input.sesion_id)
        .single();
      if (sesionErr || !sesion) throw new Error("Sesión no encontrada");
      const alumno = sesion.alumnos as any;
      if (alumno.profesor_id !== user.id) throw new Error("Sin permisos");

      const { data: bibEj } = await supabase
        .from("biblioteca_ejercicios")
        .select("nombre")
        .eq("id", input.biblioteca_id)
        .single();
      const nombreEj = bibEj?.nombre || "Ejercicio";

      if (input.is_permanent) {
        let planId = alumno.plan_id;
        const { data: plan } = await supabase.from("planes").select("is_template").eq("id", planId).single();
        if (plan?.is_template) {
          const { data: forkedId, error: forkErr } = await supabase.rpc("fork_plan", {
            p_plan_id: planId,
            p_alumno_id: input.alumno_id,
            p_nuevo_nombre: `Plan de ${alumno.nombre}`
          });
          if (forkErr) throw new Error("Error personalizando plan: " + forkErr.message);
          planId = forkedId;
          await supabase.from("alumnos").update({ plan_id: planId }).eq("id", input.alumno_id);
        }

        const { data: rutina } = await supabase.from("rutinas_diarias").select("id").eq("plan_id", planId).eq("dia_numero", sesion.numero_dia_plan).single();
        if (!rutina) throw new Error("Estructura de plan no encontrada para hoy");

        const { data: countRes } = await supabase.from("ejercicios_plan").select("orden").eq("rutina_id", rutina.id).order("orden", { ascending: false }).limit(1);
        const nextOrder = (countRes?.[0]?.orden ?? 0) + 1;

        const { data: newEjPlan, error: insertErr } = await supabase
          .from("ejercicios_plan")
          .insert({ rutina_id: rutina.id, ejercicio_id: input.biblioteca_id, orden: nextOrder, series: 3, reps_target: "10", descanso_seg: 60 })
          .select("id")
          .single();
        if (insertErr) throw new Error("Insert Error: " + insertErr.message);

        const { data: sesionesFuturas } = await supabase.from("sesiones_instanciadas").select("id").eq("alumno_id", input.alumno_id).eq("numero_dia_plan", sesion.numero_dia_plan).is("estado", "pendiente");
        const idsAInstanciar = [sesion.id, ...((sesionesFuturas?.map(s => s.id) || []).filter(id => id !== sesion.id))];
        
        if (idsAInstanciar.length > 0) {
          const instancias = idsAInstanciar.map(sid => ({
            sesion_id: sid,
            ejercicio_id: input.biblioteca_id,
            ejercicio_plan_id: newEjPlan.id,
            orden: nextOrder,
            series_plan: 3,
            reps_plan: "10",
            descanso_seg: 60,
            is_variation: false
          }));
          await supabase.from("sesion_ejercicios_instanciados").insert(instancias);
        }
        return { success: true, mensaje: `✅ Ejercicio "${nombreEj}" añadido permanentemente.` };
      } else {
        const { data: countRes } = await supabase.from("sesion_ejercicios_instanciados").select("orden").eq("sesion_id", input.sesion_id).order("orden", { ascending: false }).limit(1);
        const nextOrder = (countRes?.[0]?.orden ?? 0) + 1;
        await supabase.from("sesion_ejercicios_instanciados").insert({ sesion_id: input.sesion_id, ejercicio_id: input.biblioteca_id, orden: nextOrder, series_plan: 3, reps_plan: "10", descanso_seg: 60, is_variation: true });
        return { success: true, mensaje: `✅ Ejercicio "${nombreEj}" añadido para hoy.` };
      }
    }
  }),

  /**
   * removeExerciseFromStudentPlan: (Profesor) Elimina un ejercicio de la sesión.
   * Si es permanente, lo quita del plan maestro y futuras sesiones.
   */
  removeExerciseFromStudentPlan: defineAction({
    accept: "json",
    input: removeExerciseFromStudentPlanSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      const { data: instancia, error: instErr } = await supabase
        .from("sesion_ejercicios_instanciados")
        .select("*, sesiones_instanciadas(alumno_id, numero_dia_plan, semana_numero, alumnos(profesor_id))")
        .eq("id", input.ejercicio_id)
        .single();
      if (instErr || !instancia) throw new Error("Ejercicio no encontrado");
      const sesion = instancia.sesiones_instanciadas as any;
      const alumno = sesion.alumnos as any;
      if (alumno.profesor_id !== user.id) throw new Error("Sin permisos");

      if (input.is_permanent) {
        const ejPlanId = instancia.ejercicio_plan_id;
        if (!ejPlanId) throw new Error("Sólo se pueden eliminar ejercicios base de forma permanente.");
        await supabase.from("ejercicios_plan").delete().eq("id", ejPlanId);
        const { data: futuras } = await supabase.from("sesiones_instanciadas").select("id").eq("alumno_id", sesion.alumno_id).eq("numero_dia_plan", sesion.numero_dia_plan).gte("semana_numero", sesion.semana_numero);
        if (futuras && futuras.length > 0) {
          const ids = futuras.map(s => s.id);
          await supabase.from("sesion_ejercicios_instanciados").delete().eq("ejercicio_plan_id", ejPlanId).is("completado", false).in("sesion_id", ids);
        }
        return { success: true, mensaje: "✅ Ejercicio eliminado permanentemente." };
      } else {
        await supabase.from("sesion_ejercicios_instanciados").delete().eq("id", input.ejercicio_id);
        return { success: true, mensaje: "✅ Ejercicio eliminado solo hoy." };
      }
    }
  }),

  // =============================================
  // ACCIONES LEGACY 
  // =============================================
  logExercise: defineAction({ accept: "json", input: sessionLogSchema, handler: async () => ({ success: true }) }),
  commentExercise: defineAction({ accept: "json", input: commentExerciseSchema, handler: async () => ({ success: true }) }),
  completeSession: defineAction({ accept: "json", input: completeSessionSchema, handler: async () => ({ success: true }) }),
};
