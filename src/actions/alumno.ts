import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/supabase-ssr";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
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
import { getDayNumber, getWeekNumber, getTodayISO, getCyclicDayNumber, getCycleInfo, getStructuralDay, convertDaysToNumbers } from "@/lib/schedule";

  /**
   * Helper: Sanitiza un string para convertirlo en un número decimal válido para Postgres.
   * Si el valor contiene texto no numérico (ej: "80kg"), intenta extraer el número.
   * Si no hay número válido (ej: "Sin peso"), retorna null para evitar fallos en columnas DECIMAL.
   */
  const sanitizeWeight = (val: string | null | undefined): number | null => {
    if (!val) return null;
    // Extraer solo dígitos y puntos/comas
    const cleaned = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

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
      let alumnoId = input.alumno_id;
      let alumno;

      if (alumnoId) {
        // El profesor está instanciando para un alumno. Validar permisos.
        const { data: a, error: e } = await supabase
          .from("alumnos")
          .select("id, nombre, fecha_inicio, plan_id, profesor_id")
          .eq("id", alumnoId)
          .single();
        
        if (e || !a) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Alumno no encontrado"
          });
        }
        const alunoData = a as any;
        if (alunoData.profesor_id !== user.id) {
          throw new ActionError({
            code: "FORBIDDEN",
            message: "No tenés permiso sobre este alumno"
          });
        }
        alumno = alunoData;
      } else {
        // El alumno se está auto-instanciando
        const { data: a, error: e } = await supabase
          .from("alumnos")
          .select("id, nombre, fecha_inicio, plan_id, dias_asistencia")
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .single();
        
        if (e || !a) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "No se encontró el perfil de alumno vinculado"
          });
        }
        alumno = a as any;
      }

      if (!alumno.plan_id) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Este alumno no tiene un plan de entrenamiento asignado"
        });
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
      const diasAsistenciaRaw = alumno.dias_asistencia || [];
      const diasAsistencia = convertDaysToNumbers(diasAsistenciaRaw);
      const fechaInicio = alumno.fecha_inicio || getTodayISO();
      const diaAbsoluto = getDayNumber(fechaInicio, fechaReal, diasAsistencia);
      const semanaActual = getWeekNumber(fechaInicio, fechaReal, diasAsistencia);

      // 4. Buscar las rutinas del plan para saber cuántos días tiene
      const { data: rutinasDiarias } = await supabase
        .from("rutinas_diarias")
        .select("id, dia_numero, nombre_dia")
        .eq("plan_id", alumno.plan_id)
        .order("dia_numero", { ascending: true });

      const availableDiaNumeros = ((rutinasDiarias as any[]) || []).map(r => r.dia_numero);
      const totalRoutines = availableDiaNumeros.length || 1;

      // 4b. Obtener detalles del plan (duración para ciclos)
      const { data: planDetalleRaw } = await supabase
        .from("planes")
        .select("duracion_semanas")
        .eq("id", alumno.plan_id)
        .single();
      
      const planDetalle = planDetalleRaw as any;

      // 5. Determinar qué rutina instanciar
      let rutinaDeHoy;
      let diaParaNombre;

      if (input.rutina_id) {
        // MODO MANUAL (Sesión Extra): Se proporcionó una rutina específica
        rutinaDeHoy = (rutinasDiarias as any[])?.find((r: any) => r.id === input.rutina_id);
        
        if (!rutinaDeHoy) {
          throw new Error("La rutina seleccionada no pertenece al plan actual del alumno.");
        }
        
        // Calculamos qué día estructural le correspondería por inercia, 
        // pero usamos el ID de la rutina forzada por el profesor.
        diaParaNombre = rutinaDeHoy.dia_numero;
      } else {
        // MODO AUTOMÁTICO: Siguiendo la agenda de asistencia confirmada
        const diaEstructural = getStructuralDay(fechaInicio, new Date(fechaReal), availableDiaNumeros, diasAsistencia);
        
        if (diaEstructural === 0) {
          throw new Error("Día de descanso oficial. Para sumar una sesión hoy, debés elegir una rutina manualmente como 'Sesión Extra'.");
        }

        rutinaDeHoy = (rutinasDiarias as any[])?.find((r: any) => r.dia_numero === diaEstructural);
        
        if (!rutinaDeHoy) {
          throw new Error(`No se encontró la rutina D${diaEstructural} en el plan.`);
        }
        diaParaNombre = diaEstructural;
      }

      const { absoluteWeek, cycleNumber, relativeWeek } = getCycleInfo(
        fechaInicio, 
        new Date(fechaReal), 
        planDetalle?.duracion_semanas || 4
      );

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

      // 6b. Buscar personalizaciones de métricas para este alumno en esta semana RELATIVA (Ciclo)
      const { data: personalizaciones } = await supabase
        .from("ejercicio_plan_personalizado")
        .select("*")
        .eq("alumno_id", alumno.id)
        .eq("semana_numero", relativeWeek);

      const overridesMap = new Map(
        ((personalizaciones as any[]) || []).map(p => [p.ejercicio_plan_id, p])
      );

      // 7. Crear o recuperar la cabecera de la sesión instanciada (Atómico)
      const { data: nuevaSesionRaw, error: errorSesion } = await supabase
        .from("sesiones_instanciadas")
        .upsert(
          {
            alumno_id: alumno.id,
            plan_id: alumno.plan_id,
            numero_dia_plan: diaParaNombre,
            semana_numero: absoluteWeek,
            fecha_real: fechaReal,
            nombre_dia: (rutinaDeHoy as any).nombre_dia || `Día ${diaParaNombre}`,
            estado: "pendiente",
          } as any,
          { onConflict: "alumno_id, fecha_real", ignoreDuplicates: false }
        )
        .select("id")
        .single();
      
      const nuevaSesion = nuevaSesionRaw as any;

      if (errorSesion || !nuevaSesion) {
        console.error("DEBUG - Error al crear sesión:", errorSesion);
        throw new ActionError({
          code: "BAD_REQUEST",
          message: `Error al crear sesión operativa: ${errorSesion?.message || 'Error desconocido'}. Verifique los permisos RLS en sesiones_instanciadas.`
        });
      }

      // 8. Instanciar los ejercicios del plan en la sesión
      const ejerciciosAInsertar = ((ejerciciosPlan as any[]) || []).map((ej) => {
        const bib = ej.biblioteca_ejercicios as any;
        const ejercicioId = Array.isArray(bib) ? bib[0]?.id : bib?.id;
        const override = overridesMap.get(ej.id);

        return {
          sesion_id: nuevaSesion.id,
          ejercicio_id: ejercicioId || "",
          ejercicio_plan_id: ej.id, // Vínculo con el plan estructural
          orden: ej.orden,
          // Prioridad: 1. Personalización del alumno, 2. Valor del plan maestro
          series_plan: override?.series ?? ej.series,
          reps_plan: override?.reps_target ?? ej.reps_target,
          peso_plan: sanitizeWeight(override?.peso_target || (ej.peso_target as string)),
          descanso_seg: override?.descanso_seg ?? ej.descanso_seg,
          exercise_type: (ej as any).exercise_type || "base",
          is_variation: false,
        };
      }).filter((ej) => ej.ejercicio_id !== "");

      if (ejerciciosAInsertar.length > 0) {
        console.log("DEBUG - Insertando ejercicios:", JSON.stringify(ejerciciosAInsertar, null, 2));
        const { error: errorEjs } = await (supabase.from("sesion_ejercicios_instanciados") as any)
          .insert(ejerciciosAInsertar);
        
        if (errorEjs) {
          console.error("DEBUG - Error al insertar ejercicios:", errorEjs);
          throw new ActionError({
            code: "BAD_REQUEST",
            message: `Error al instanciar ejercicios: ${errorEjs.message}. Revise RLS en sesion_ejercicios_instanciados.`
          });
        }
      }

      // 9. Retornar la sesión recién creada con todos sus ejercicios
      const { data: sesionCompletaRaw } = await supabase
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
      
      const sesionCompleta = sesionCompletaRaw as any;

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

      const { error } = await (supabase
        .from("sesion_ejercicios_instanciados") as any)
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

      const { error } = await (supabase
        .from("sesiones_instanciadas") as any)
        .update({
          estado: "completada",
          notas_alumno: input.notas_alumno ?? null,
          completed_at: new Date().toISOString(),
        } as any)
        .eq("id", input.sesion_id);

      if (error) throw new Error(`Error al cerrar sesión: ${error.message}`);

      // Notificar al profesor
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
      alumno_id: z.string().uuid().optional(),
      dias_atras: z.number().int().min(0).max(30).default(7),
      dias_adelante: z.number().int().min(0).max(30).default(6),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      // 1. Obtener datos del alumno
      let alumnoId = input.alumno_id;
      let alumno;

      if (alumnoId) {
        // El profesor está pidiendo el calendario de un alumno
        const { data: a, error: e } = await supabase
          .from("alumnos")
          .select("id, fecha_inicio, plan_id, profesor_id, dias_asistencia")
          .eq("id", alumnoId)
          .single();
        
        if (e || !a) throw new Error("Alumno no encontrado");
        const alumnoData = a as any;
        // Nota: RLS filtrará si el profesor no tiene acceso, pero validamos igual
        if (alumnoData.profesor_id !== user.id) throw new Error("Sin permisos sobre este alumno");
        alumno = alumnoData;
      } else {
        // Autoconsulta del alumno
        const { data: a, error: e } = await supabase
          .from("alumnos")
          .select("id, fecha_inicio, plan_id, dias_asistencia")
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .single();
        
        if (e || !a) throw new Error("No se encontró perfil de alumno");
        alumno = a as any;
      }

      if (!alumno || !alumno.plan_id) {
        return { dias: [] };
      }

      // 2. Calcular el rango de fechas
      const hoyStr = getTodayISO();
      const hoy = new Date(hoyStr + "T12:00:00");
      
      const desde = new Date(hoy);
      desde.setDate(hoy.getDate() - input.dias_atras);
      const hasta = new Date(hoy);
      hasta.setDate(hoy.getDate() + input.dias_adelante);

      const desdISO = desde.toISOString().split("T")[0];
      const hastaISO = hasta.toISOString().split("T")[0];

      // 2b. Obtener duración del plan para ciclos
      const { data: planDetalle } = await supabase
        .from("planes")
        .select("duracion_semanas")
        .eq("id", alumno.plan_id)
        .single();

      // 3. Obtener sesiones instanciadas en ese rango
      const { data: sesiones } = await supabase
        .from("sesiones_instanciadas")
        .select("id, fecha_real, numero_dia_plan, semana_numero, nombre_dia, estado, completed_at")
        .eq("alumno_id", (alumno as any).id)
        .gte("fecha_real", desdISO)
        .lte("fecha_real", hastaISO)
        .order("fecha_real", { ascending: true });

      const sesionesMap: Record<string, any> = {};
      (sesiones || []).forEach((s: any) => {
        sesionesMap[s.fecha_real] = s;
      });

      // 3b. Obtener qué días del plan tienen rutinas configuradas para distinguir descansos e identificar copiado
      const { data: rutinasPlan } = await supabase
        .from("rutinas_diarias")
        .select("id, dia_numero")
        .eq("plan_id", (alumno as any).plan_id)
        .order("dia_numero", { ascending: true });
      
      const activeDaysMap = new Map(((rutinasPlan as any[]) || []).map(r => [r.dia_numero, r.id]));
      const availableDiaNumeros = ((rutinasPlan as any[]) || []).map(r => r.dia_numero);

      // 4. Construir el array de días con cálculo de numero_dia_plan para los que no existen
      const diasAsistenciaRaw = alumno.dias_asistencia || [];
      const diasAsistencia = convertDaysToNumbers(diasAsistenciaRaw);
      const fechaInicio = alumno.fecha_inicio || hoyStr;
      const days = [];
      const currentDate = new Date(desde);

      while (currentDate <= hasta) {
        const fechaISO = currentDate.toISOString().split("T")[0];
        const esHoy = fechaISO === hoyStr;
        const esFuturo = fechaISO > hoyStr;

        const sesion = sesionesMap[fechaISO];
        const { absoluteWeek, cycleNumber, relativeWeek } = getCycleInfo(
          fechaInicio, 
          currentDate, 
          (planDetalle as any)?.duracion_semanas || 4
        );

        const numeroDia = sesion?.numero_dia_plan ?? getDayNumber(fechaInicio, currentDate, diasAsistencia);
        const semana = sesion?.semana_numero ?? getWeekNumber(fechaInicio, currentDate, diasAsistencia);
        const diaEstructural = getStructuralDay(fechaInicio, currentDate, availableDiaNumeros, diasAsistencia);
        const rutinaIdAtStructure = activeDaysMap.get(diaEstructural);
        const hasRoutineAtStructure = !!rutinaIdAtStructure && diaEstructural > 0;

        let status: string;
        if (sesion) {
          status = sesion.estado;
        } else if (esFuturo && !esHoy) {
          status = hasRoutineAtStructure ? "futura" : "descanso";
        } else if (esHoy) {
          status = hasRoutineAtStructure ? "pendiente" : "descanso";
        } else {
          // Día pasado sin sesión: si tenía rutina y no se hizo, es omitida. Si no, es descanso.
          status = hasRoutineAtStructure ? "omitida" : "descanso";
        }

        days.push({
          fecha: fechaISO,
          numeroDiaPlan: numeroDia,
          semana,
          cycleNumber,
          relativeWeek,
          status,
          nombreDia: sesion?.nombre_dia ?? null,
          esHoy,
          esFuturo: esFuturo && !esHoy,
          sesionId: sesion?.id ?? null,
          rutina_id_original: rutinaIdAtStructure,
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
      const { data: a, error: alumnoError } = await supabase
        .from("alumnos")
        .select(`
          id, profesor_id, plan_id, fecha_inicio,
          planes ( id, duracion_semanas, is_template )
        `)
        .eq("id", input.alumno_id)
        .single();

      if (alumnoError || !a) throw new Error("Alumno no encontrado");
      const alumno = a as any;
      if (alumno.profesor_id !== user.id && alumno.id !== user.id) {
        throw new Error("No tienes permisos para editar este alumno");
      }

      const plan = Array.isArray(alumno.planes) ? alumno.planes[0] : (alumno.planes as any);
      const isTemplate = plan?.is_template ?? true;
      const maxWeeks = plan?.duracion_semanas || 4;

      // 1b. Obtener ciclo actual para determinar qué semana REAL estamos guardando
      // Si el profesor edita "Semana 5" de un plan de 4 semanas, estamos editando la "Semana 1" del Ciclo.
      const inputRelativeWeek = ((input.semana_numero - 1) % maxWeeks) + 1;

      // 2. Persistir Cambios: DEEP SYNC vs Weekly Overrides
      let syncMessage = "Actualizamos esta semana y las siguientes.";

      if (!isTemplate) {
        // [DEEP SYNC]: Si es un plan privado/fork, actualizamos la base estructural
        // para que sea permanente SIN necesidad de overrides futuros.
        const { error: structuralError } = await (supabase
          .from("ejercicios_plan") as any)
          .update({
            series: input.series,
            reps_target: input.reps_target,
            descanso_seg: input.descanso_seg,
            peso_target: input.peso_target,
          })
          .eq("id", input.ejercicio_plan_id);

        if (structuralError) throw new Error("Error al actualizar base estructural: " + structuralError.message);
        syncMessage = "Cambio aplicado permanentemente al plan del alumno.";
      } else {
        // [CASCADA DE PROGRESO]: Si es un template, generamos overrides para la semana actual 
        // y TODAS las semanas restantes del ciclo (1..maxWeeks).
        const metricsToPersist = [];
        for (let w = inputRelativeWeek; w <= maxWeeks; w++) {
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

        const { error: upsertError } = await (supabase
          .from("ejercicio_plan_personalizado") as any)
          .upsert(metricsToPersist, { onConflict: "alumno_id, ejercicio_plan_id, semana_numero" });

        if (upsertError) throw new Error("Error al persistir cascada de overrides: " + upsertError.message);
        syncMessage = `Cambios aplicados a la semana ${input.semana_numero} y todas las posteriores del ciclo del alumno.`;
      }

      // 3. Sincronizar Instancias ya creadas (futuras y hoy no completadas)
      const { data: sesiones } = await supabase
        .from("sesiones_instanciadas")
        .select("id")
        .eq("alumno_id", input.alumno_id)
        .gte("semana_numero", input.semana_numero);

      if (sesiones && sesiones.length > 0) {
        const sesionIds = sesiones.map((s: any) => s.id);
        await (supabase
          .from("sesion_ejercicios_instanciados") as any)
          .update({
            series_plan: input.series,
            reps_plan: input.reps_target,
            peso_plan: input.peso_target ? sanitizeWeight(input.peso_target) : null,
            descanso_plan: input.descanso_seg,
            updated_at: new Date().toISOString()
          })
          .eq("ejercicio_plan_id", input.ejercicio_plan_id)
          .is("completado", false)
          .in("sesion_id", sesionIds);
      }

      return {
        success: true,
        mensaje: syncMessage
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

      const { data: i, error: instErr } = await supabase
        .from("sesion_ejercicios_instanciados")
        .select("*, sesiones_instanciadas(alumno_id, numero_dia_plan, semana_numero, alumnos(profesor_id, plan_id, nombre))")
        .eq("id", input.ejercicio_id)
        .single();
      
      if (instErr || !i) throw new Error("Ejercicio no encontrado");
      const instancia = i as any;
      const sesion = instancia.sesiones_instanciadas as any;
      const alumno = sesion.alumnos as any;
      if (alumno.profesor_id !== user.id) throw new Error("Sin permisos");

      const { data: bibEj } = await supabase.from("biblioteca_ejercicios").select("nombre").eq("id", input.nuevo_biblioteca_id).single();
      const nombreEj = (bibEj as any)?.nombre || "Nuevo Ejercicio";

      if (input.is_permanent) {
        let planId = alumno.plan_id;
        const ejPlanId = instancia.ejercicio_plan_id;
        if (!ejPlanId) throw new Error("Sólo se pueden sustituir permanentemente los ejercicios base del plan.");

        const { data: p } = await supabase.from("planes").select("nombre, is_template").eq("id", planId).single();
        const plan = p as any;
        if (plan?.is_template) {
          const { data: forkedId, error: forkErr } = await supabase.rpc("fork_plan", {
            p_plan_id: planId,
            p_alumno_id: input.alumno_id,
            p_nuevo_nombre: `${plan.nombre} (${alumno.nombre})`
          } as any);
          if (forkErr) throw new Error("Error personalizando plan: " + forkErr.message);
          planId = forkedId;
          await supabase.from("alumnos").update({ plan_id: planId } as any).eq("id", input.alumno_id);
        }

        // Actualizar ejercicio en el plan maestro (ahora ya forkeado si era template)
        await (supabase.from("ejercicios_plan") as any).update({ ejercicio_id: input.nuevo_biblioteca_id }).eq("id", ejPlanId);

        // Propagar a instancias futuras no completadas
        const { data: f } = await (supabase.from("sesiones_instanciadas") as any).select("id").eq("alumno_id", input.alumno_id).eq("numero_dia_plan", sesion.numero_dia_plan).is("estado", "pendiente");
        const futuras = f as any[];
        if (futuras && futuras.length > 0) {
            const ids = futuras.map((s: any) => s.id);
            await (supabase.from("sesion_ejercicios_instanciados") as any).update({ 
                ejercicio_id: input.nuevo_biblioteca_id,
                series_real: null, reps_real: null, peso_real: null, completado: false, is_variation: false 
            }).eq("ejercicio_plan_id", ejPlanId).in("sesion_id", ids);
        }
        return { success: true, mensaje: `Sustitución de "${nombreEj}" aplicada permanentemente a la planificación.` };
      } else {
        await (supabase.from("sesion_ejercicios_instanciados") as any).update({ 
            ejercicio_id: input.nuevo_biblioteca_id, 
            is_variation: true,
            series_real: null, reps_real: null, peso_real: null, completado: false 
        }).eq("id", input.ejercicio_id);
        return { success: true, mensaje: `Sustituido por "${nombreEj}" solo por hoy.` };      }
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
      const { data: a } = await supabase
        .from("alumnos")
        .select("profesor_id, nombre")
        .eq("id", input.alumno_id)
        .single();
      
      const alumno = a as any;

      if (!alumno || alumno.profesor_id !== user.id) {
        throw new Error("No tienes permisos para completar esta sesión");
      }

      // 2. Marcar como completada
      const { error } = await (supabase
        .from("sesiones_instanciadas") as any)
        .update({
          estado: "completada",
          completed_at: new Date().toISOString(),
          notas_alumno: "Completada por el profesor",
          completed_by_professor: true // Asumiendo que existe el campo o se documenta como metadata
        } as any) 
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
      const { data: a } = await supabase
        .from("alumnos")
        .select("profesor_id, fecha_inicio, nombre")
        .eq("id", input.alumno_id)
        .single();
      
      const alumno = a as any;

      if (!alumno || alumno.profesor_id !== user.id) {
        throw new Error("Sin permisos");
      }

      const currentStart = new Date(alumno.fecha_inicio);
      currentStart.setDate(currentStart.getDate() + input.offset_days);
      const newStartISO = currentStart.toISOString().split("T")[0];

      // 2. Actualizar alumno
      const { error } = await (supabase.from("alumnos") as any)
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

      const { data: s, error: sesionErr } = await supabase
        .from("sesiones_instanciadas")
        .select("*, alumnos(profesor_id, plan_id, nombre)")
        .eq("id", input.sesion_id)
        .single();
      if (sesionErr || !s) throw new Error("Sesión no encontrada");
      const sesion = s as any;
      const alumno = sesion.alumnos as any;
      if (alumno.profesor_id !== user.id) throw new Error("Sin permisos");

      const { data: bibEj } = await supabase
        .from("biblioteca_ejercicios")
        .select("nombre")
        .eq("id", input.biblioteca_id)
        .single();
      const nombreEj = (bibEj as any)?.nombre || "Ejercicio";

      if (input.is_permanent) {
        let planId = alumno.plan_id;
        const { data: p } = await supabase.from("planes").select("nombre, is_template").eq("id", planId).single();
        const plan = p as any;
        if (plan?.is_template) {
          const { data: forkedId, error: forkErr } = await (supabase.rpc("fork_plan", {
            p_plan_id: planId,
            p_alumno_id: input.alumno_id,
            p_nuevo_nombre: `${plan.nombre} (${alumno.nombre})`
          } as any) as any);
          if (forkErr) throw new Error("Error personalizando plan: " + forkErr.message);
          planId = forkedId;
          await (supabase.from("alumnos") as any).update({ plan_id: planId }).eq("id", input.alumno_id);
        }

        const { data: rutina } = await (supabase.from("rutinas_diarias") as any).select("id").eq("plan_id", planId).eq("dia_numero", sesion.numero_dia_plan).single();
        if (!rutina) throw new Error("Estructura de plan no encontrada para hoy");

        const { data: countRes } = await (supabase.from("ejercicios_plan") as any).select("orden").eq("rutina_id", (rutina as any).id).order("orden", { ascending: false }).limit(1);
        const nextOrder = ((countRes as any[])?.[0]?.orden ?? 0) + 1;

        const { data: newEjPlan, error: insertErr } = await (supabase
          .from("ejercicios_plan") as any)
          .insert({ rutina_id: (rutina as any).id, ejercicio_id: input.biblioteca_id, orden: nextOrder, series: 3, reps_target: "10", descanso_seg: 60 })
          .select("id")
          .single();
        if (insertErr) throw new Error("Insert Error: " + insertErr.message);
        
        const newEjPlanData = newEjPlan as any;

        const { data: sesionesFuturas } = await (supabase.from("sesiones_instanciadas") as any).select("id").eq("alumno_id", input.alumno_id).eq("numero_dia_plan", sesion.numero_dia_plan).is("estado", "pendiente");
        const idsAInstanciar = [sesion.id, ...(((sesionesFuturas as any[])?.map((s: any) => s.id) || []).filter(id => id !== sesion.id))];
        
        if (idsAInstanciar.length > 0) {
          const instancias = idsAInstanciar.map(sid => ({
            sesion_id: sid,
            ejercicio_id: input.biblioteca_id,
            ejercicio_plan_id: newEjPlanData.id,
            orden: nextOrder,
            series_plan: 3,
            reps_plan: "10",
            descanso_seg: 60,
            is_variation: false
          }));
          await (supabase.from("sesion_ejercicios_instanciados") as any).insert(instancias);
        }
        return { success: true, mensaje: `✅ Ejercicio "${nombreEj}" añadido permanentemente.` };
      } else {
        const { data: countRes } = await (supabase.from("sesion_ejercicios_instanciados") as any).select("orden").eq("sesion_id", input.sesion_id).order("orden", { ascending: false }).limit(1);
        const nextOrder = ((countRes as any[])?.[0]?.orden ?? 0) + 1;
        await (supabase.from("sesion_ejercicios_instanciados") as any).insert({ sesion_id: input.sesion_id, ejercicio_id: input.biblioteca_id, orden: nextOrder, series_plan: 3, reps_plan: "10", descanso_seg: 60, is_variation: true });
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

      const { data: i, error: instErr } = await supabase
        .from("sesion_ejercicios_instanciados")
        .select("*, sesiones_instanciadas(alumno_id, numero_dia_plan, semana_numero, alumnos(profesor_id))")
        .eq("id", input.ejercicio_id)
        .single();
      if (instErr || !i) throw new Error("Ejercicio no encontrado");
      const instancia = i as any;
      const sesion = instancia.sesiones_instanciadas as any;
      const alumno = sesion.alumnos as any;
      if (alumno.profesor_id !== user.id) throw new Error("Sin permisos");

      if (input.is_permanent) {
        let planId = alumno.plan_id;
        const ejPlanId = instancia.ejercicio_plan_id;
        if (!ejPlanId) throw new Error("Sólo se pueden eliminar ejercicios base de forma permanente.");

        // 1. Asegurar Fork (si es template)
        const { data: p } = await supabase.from("planes").select("nombre, is_template").eq("id", planId).single();
        const plan = p as any;
        if (plan?.is_template) {
          const { data: forkedId, error: forkErr } = await supabase.rpc("fork_plan", {
            p_plan_id: planId,
            p_alumno_id: input.alumno_id,
            p_nuevo_nombre: `${plan.nombre} (${alumno.nombre})`
          } as any);
          if (forkErr) throw new Error("Error personalizando plan: " + forkErr.message);
          planId = forkedId;
          await supabase.from("alumnos").update({ plan_id: planId } as any).eq("id", input.alumno_id);
        }

        // 2. Eliminar del plan maestro (ahora ya forkeado si era template)
        await (supabase.from("ejercicios_plan") as any).delete().eq("id", ejPlanId);

        // 3. Limpiar de instancias futuras
        const { data: f } = await (supabase.from("sesiones_instanciadas") as any).select("id").eq("alumno_id", sesion.alumno_id).eq("numero_dia_plan", sesion.numero_dia_plan).gte("semana_numero", sesion.semana_numero);
        const futuras = f as any[];
        if (futuras && futuras.length > 0) {
          const ids = futuras.map((s: any) => s.id);
          await (supabase.from("sesion_ejercicios_instanciados") as any).delete().eq("ejercicio_plan_id", ejPlanId).is("completado", false).in("sesion_id", ids);
        }
        return { success: true, mensaje: "✅ Ejercicio eliminado permanentemente." };
      } else {
        await (supabase.from("sesion_ejercicios_instanciados") as any).delete().eq("id", input.ejercicio_id);
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
