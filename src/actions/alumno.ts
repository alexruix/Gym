import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";
import { getAuthenticatedClient } from "@/lib/supabase-ssr";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  instanciarSesionSchema,
  logEjercicioInstanciadoSchema,
  completarSesionSchema,
  addExerciseToStudentPlanSchema,
  removeExerciseFromStudentPlanSchema,
  swapExerciseInStudentPlanSchema,
  sessionLogSchema,
  commentExerciseSchema,
  completeSessionSchema,
  getDashboardDataSchema,
  getStudentPerformanceSchema,
  getPlanDetailsSchema,
  getWeeklySessionsSchema,
  updateStudentMetricWithPropagationSchema,
  completeSessionByProfessorSchema,
  updateStudentStartDateOffsetSchema,
  activarPerfilSchema,
  updateStudentProfileSchema
} from "../lib/validators";
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

  /**
   * activarPerfilTecnico: (Alumno) Guarda la configuración inicial JIT.
   */
  activarPerfilTecnico: defineAction({
    accept: "json",
    input: activarPerfilSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");
      const supabase = getAuthenticatedClient(context);

      const { error } = await supabase
        .from("alumnos")
        .update({
          peso_actual: input.peso_actual,
          objetivo_principal: input.objetivo_principal,
          dias_asistencia: input.dias_asistencia,
          lesiones: input.lesiones,
          perfil_completado: true
        } as any)
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error al guardar perfil: ${error.message}` });

      return { success: true, message: "¡HUD configurado exitosamente!" };
    }
  }),

  /**
   * updateStudentProfile: (Alumno) Permite actualizar el perfil técnico y personal.
   */
  updateStudentProfile: defineAction({
    accept: "json",
    input: updateStudentProfileSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      // Limpieza de inputs si vinieron como string vacío desde el form
      const cleanInput = Object.fromEntries(
        Object.entries(input).map(([k, v]) => [k, v === "" ? null : v])
      ) as any;

      const { data: updated, error } = await supabase
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
          perfil_completado: true,
        })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .select()
        .single();

      if (error) {
        console.error("[DEBUG] StudentUpdateError:", {
          user_id: user.id,
          input: cleanInput,
          supabase_error: error
        });
        throw new ActionError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: `Error al actualizar: ${error.message}${error.hint ? ' - ' + error.hint : ''}` 
        });
      }

      return { success: true, data: updated };
    },
  }),

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
        // Si ya tiene ejercicios y no estamos forzando una rutina, devolvemos.
        // Si estamos forzando una rutina (input.rutina_id) y la sesión está vacía, permitimos continuar.
        const tieneEjercicios = sesionExistente.sesion_ejercicios_instanciados?.length > 0;
        
        if (!input.rutina_id || tieneEjercicios) {
          return { sesion: sesionExistente, creada: false };
        }
        
        // Si llegamos acá, la sesión existe pero está vacía y queremos cargar una rutina.
        // Usamos la sesión existente pero seguiremos adelante para insertar ejercicios.
        // Seteamos una bandera para saber que no hay que hacer upsert de la cabecera.
      }


      // 3. Calcular qué día del plan le corresponde hoy
      const creada = true; // Si llegamos aquí, la sesión no existía
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
        const diaEstructural = getStructuralDay(fechaInicio, new Date(fechaReal + "T12:00:00"), availableDiaNumeros, diasAsistencia);
        
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
        new Date(fechaReal + "T12:00:00"), 
        planDetalle?.duracion_semanas || 4,
        diasAsistencia
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

      return { 
        success: true, 
        message: creada ? "Sesión operativa inicializada" : "Sesión recuperada",
        data: { sesion: sesionCompleta, creada } 
      };
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
          rpe: input.rpe ?? null,
          completado: input.completado,
        })
        .eq("id", input.sesion_ejercicio_id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error al guardar progreso: ${error.message}` });

      return { success: true, message: "✅ Progreso guardado" };
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

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `Error al cerrar sesión: ${error.message}` });

      // Notificar al profesor
      const { data: a } = await supabase
        .from("alumnos")
        .select("profesor_id, nombre")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();
      
      const alumno = a as any;

      if (alumno) {
        // 1. Notificación estándar de sesión completada
        await supabase.from("notificaciones").insert({
          profesor_id: alumno.profesor_id,
          alumno_id: user.id,
          tipo: "sesion_completada",
          mensaje: `${alumno.nombre} completó su rutina de hoy.${input.notas_alumno ? ` Nota: "${input.notas_alumno.substring(0, 40)}..."` : ""}`,
          referencia_id: input.sesion_id,
        } as any);

        // 2. DETECTOR DE BURNOUT (3 sesiones consecutivas con RPE 10)
        const { data: ultimasSesiones } = await supabase
          .from("sesiones_instanciadas")
          .select("id")
          .eq("alumno_id", alumno.id)
          .eq("estado", "completada")
          .order("completed_at", { ascending: false })
          .limit(3);

        const ids = (ultimasSesiones || []).map(s => s.id);
        
        if (ids.length === 3) {
          const { data: ejerciciosConRPE } = await supabase
            .from("sesion_ejercicios_instanciados")
            .select("sesion_id, rpe")
            .in("sesion_id", ids)
            .eq("rpe", 10);

          const sesionesConRpe10 = new Set((ejerciciosConRPE || []).map(e => e.sesion_id));
          
          if (sesionesConRpe10.size === 3) {
            await supabase.from("notificaciones").insert({
              profesor_id: alumno.profesor_id,
              alumno_id: user.id,
              tipo: "burnout_alert",
              mensaje: `⚠️ ALERTA DE FATIGA: ${alumno.nombre} reportó Esfuerzo Máximo (RPE 10) en sus últimas 3 sesiones.`,
              referencia_id: input.sesion_id,
              leida: false
            } as any);
          }
        }
      }

      return { success: true, message: "🏆 ¡Sesión completada!" };
    },
  }),


  /**
   * getWeeklySessions: Devuelve las sesiones de una ventana de días alrededor de hoy.
   * Se usa para alimentar el DayCalendarStrip con estados reales de la semana.
   * Devuelve hasta 14 días (7 pasados + hoy + 6 futuros = 14 días de ventana).
   */
  getWeeklySessions: defineAction({
    accept: "json",
    input: getWeeklySessionsSchema,
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

      const fechaInicio = alumno.fecha_inicio || hoyStr;

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
        .select("id, dia_numero, nombre_dia")
        .eq("plan_id", alumno.plan_id)
        .order("dia_numero", { ascending: true });
      
      const activeDaysMap = new Map(((rutinasPlan as any[]) || []).map(r => [r.dia_numero, r.id]));
      const availableDiaNumeros = ((rutinasPlan as any[]) || []).map(r => r.dia_numero);

      // 4. Construir el array de días con cálculo de numero_dia_plan para los que no existen
      const diasAsistenciaRaw = alumno.dias_asistencia || [];
      const diasAsistencia = convertDaysToNumbers(diasAsistenciaRaw);
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
          (planDetalle as any)?.duracion_semanas || 4,
          diasAsistencia
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
          success: true,
          data: {
            dias: days, 
            hasConsecutiveOmissions: consecutiveOmissions >= 3 
          }
      };
    },
  }),

  /**
   * updateStudentMetricWithPropagation: Actualiza una métrica de ejercicio
   * (usada por el profesor) y propaga el cambio a todas las semanas futuras.
   */
  updateStudentMetricWithPropagation: defineAction({
    accept: "json",
    input: updateStudentMetricWithPropagationSchema,
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
    input: completeSessionByProfessorSchema,
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
    input: updateStudentStartDateOffsetSchema,
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

  /**
   * getDashboardData: Centraliza toda la información para el dashboard del alumno.
   * Garantiza sincronización total entre agenda, turnos y rutinas.
   */
  getDashboardData: defineAction({
    accept: "json",
    input: getDashboardDataSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const hoyStr = input.desde || getTodayISO();

      // 1. Obtener datos base del alumno
      const { data: a, error: e } = await supabase
        .from("alumnos")
        .select(`
          id, nombre, fecha_inicio, plan_id, dias_asistencia, perfil_completado,
          planes (id, nombre, duracion_semanas, frecuencia_semanal),
          turnos (id, nombre, hora_inicio, hora_fin)
        `)
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();
      
      if (e || !a) throw new ActionError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
      const alumno = a as any;
      const plan = alumno.planes;
      const turno = alumno.turnos;
      const diasAsistenciaRaw = alumno.dias_asistencia || [];
      const diasAsistenciaIdx = convertDaysToNumbers(diasAsistenciaRaw);
      const fechaInicio = alumno.fecha_inicio || getTodayISO();
      const hoyISO = getTodayISO();

      // 2. Sesión de hoy (priorizar instanciada)
      let sesionHoyRaw: any = null;
      const { data: sesionHoyData } = await supabase
        .from("sesiones_instanciadas")
        .select(`
          id, estado, nombre_dia, numero_dia_plan, semana_numero,
          sesion_ejercicios_instanciados (
            id, orden, series_plan, reps_plan, peso_plan, descanso_seg, completado,
            biblioteca_ejercicios (id, nombre, media_url)
          )
        `)
        .eq("alumno_id", alumno.id)
        .eq("fecha_real", hoyISO)
        .maybeSingle();

      sesionHoyRaw = sesionHoyData;

      // 2b. Si no hay sesión instanciada, preparar routinePreview si hoy toca entrenar
      let routinePreview = null;
      if (!sesionHoyRaw && plan) {
        const { data: rutinasPlan } = await supabase
          .from("rutinas_diarias")
          .select("id, dia_numero, nombre_dia")
          .eq("plan_id", plan.id)
          .order("dia_numero", { ascending: true });
        
        const available = (rutinasPlan || []).map(r => r.dia_numero);
        const diaEst = getStructuralDay(fechaInicio, new Date(hoyISO + 'T12:00:00'), available, diasAsistenciaIdx);
        
        if (diaEst > 0) {
          const rutina = (rutinasPlan || []).find(r => r.dia_numero === diaEst);
          if (rutina) {
            const { data: ejs } = await supabase
              .from("ejercicios_plan")
              .select("id, orden, series, reps_target, peso_target, descanso_seg, biblioteca_ejercicios(id, nombre, media_url)")
              .eq("rutina_id", rutina.id)
              .order("orden", { ascending: true });

            routinePreview = {
              nombre_dia: rutina.nombre_dia || `Día ${diaEst}`,
              numero_dia_plan: diaEst,
              ejercicios: (ejs || []).map((ej: any) => ({
                ejercicio_plan_id: ej.id,
                nombre: (ej.biblioteca_ejercicios as any)?.nombre || "Ejercicio",
                media_url: (ej.biblioteca_ejercicios as any)?.media_url,
                series_plan: ej.series,
                reps_plan: ej.reps_target,
                peso_plan: sanitizeWeight(ej.peso_target),
                descanso_seg: ej.descanso_seg,
                completado: false
              }))
            };
          }
        }
      }

      // 3. Lógica inteligente de "Próximo Entrenamiento" (Skip rest days)
      let proximaSesion = null;
      if (plan) {
        const { data: rutinas } = await supabase
          .from("rutinas_diarias")
          .select("id, dia_numero, nombre_dia")
          .eq("plan_id", plan.id)
          .order("dia_numero", { ascending: true });
        
        const available = (rutinas || []).map(r => r.dia_numero);

        let cur = new Date();
        let found = false;
        let safe = 0;
        while (!found && safe < 14) {
          cur.setDate(cur.getDate() + 1);
          safe++;
          
          const dayIdx = cur.getDay();
          if (diasAsistenciaIdx.length === 0 || diasAsistenciaIdx.includes(dayIdx)) {
            const diaEst = getStructuralDay(fechaInicio, cur, available, diasAsistenciaIdx);
            if (diaEst > 0) {
              const rutina = (rutinas || []).find(r => r.dia_numero === diaEst);
              if (rutina) {
                const { data: ejs } = await supabase
                  .from("ejercicios_plan")
                  .select("id, orden, series, reps_target, peso_target, descanso_seg, biblioteca_ejercicios(nombre)")
                  .eq("rutina_id", rutina.id)
                  .order("orden", { ascending: true });

                const { absoluteWeek, cycleNumber, relativeWeek } = getCycleInfo(fechaInicio, cur, plan.duracion_semanas || 4);
                
                proximaSesion = {
                  fecha: cur.toISOString().split("T")[0],
                  nombreDia: rutina.nombre_dia || `Día ${diaEst}`,
                  numeroDiaPlan: diaEst,
                  semana: absoluteWeek,
                  cycleNumber,
                  relativeWeek,
                  ejercicios: (ejs || []).map((ej: any) => ({
                    nombre: (ej.biblioteca_ejercicios as any)?.nombre || "Ejercicio",
                    series_plan: ej.series,
                    reps_plan: ej.reps_target,
                    peso_plan: sanitizeWeight(ej.peso_target),
                    descanso_seg: ej.descanso_seg,
                  }))
                };
                found = true;
              }
            }
          }
        }
      }

      // 4. Datos para el Calendar Strip (14 días)
      const DIAS_ATRAS = 7;
      const DIAS_ADELANTE = 6;
      const desde = new Date(); desde.setDate(desde.getDate() - DIAS_ATRAS);
      const hasta = new Date(); hasta.setDate(hasta.getDate() + DIAS_ADELANTE);

      const { data: sesionesWindow } = await supabase
        .from("sesiones_instanciadas")
        .select("id, fecha_real, numero_dia_plan, semana_numero, nombre_dia, estado")
        .eq("alumno_id", alumno.id)
        .gte("fecha_real", desde.toISOString().split("T")[0])
        .lte("fecha_real", hasta.toISOString().split("T")[0]);

      const sesionesMap: Record<string, any> = {};
      (sesionesWindow || []).forEach(s => { sesionesMap[s.fecha_real] = s; });

      const calendarDays = [];
      let iter = new Date(desde);
      while (iter <= hasta) {
        const iso = iter.toISOString().split("T")[0];
        const sesion = sesionesMap[iso];
        const isFuture = iter > new Date();
        const isToday = iso === hoyISO;
        
        const dayNum = sesion?.numero_dia_plan ?? getDayNumber(fechaInicio, iter, diasAsistenciaIdx);
        const { absoluteWeek, cycleNumber, relativeWeek } = getCycleInfo(fechaInicio, iter, plan?.duracion_semanas || 4, diasAsistenciaIdx);

        let status = "futura";
        if (sesion) status = sesion.estado;
        else if (isToday) status = "pendiente";
        else if (!isFuture && !isToday) status = "omitida";
        
        // Si el día no es de asistencia y no está instanciado → descanso
        if (!sesion && diasAsistenciaIdx.length > 0 && !diasAsistenciaIdx.includes(iter.getDay())) {
          status = "descanso";
        }

        calendarDays.push({
          fecha: iso,
          status,
          numeroDiaPlan: dayNum,
          semana: sesion?.semana_numero ?? absoluteWeek,
          cycleNumber,
          relativeWeek,
          nombreDia: sesion?.nombre_dia,
          esHoy: isToday
        });
        iter.setDate(iter.getDate() + 1);
      }

      // 5. Build Final Payload (Zero-LCP Ready)
      return {
        success: true,
        data: {
          alumno: { 
            id: alumno.id, 
            nombre: alumno.nombre, 
            plan_id: alumno.plan_id,
            plan_nombre: plan?.nombre,
            has_plan: !!plan,
            dias_asistencia: alumno.dias_asistencia || []
          },
          turno,
          sesionHoy: sesionHoyRaw as any,
          routinePreview,
          proximaSesion,
          calendarDays,
          semanaActual: getWeekNumber(fechaInicio, new Date(), diasAsistenciaIdx),
          fechaHoyISO: hoyISO,
          // Technical metadata for PWA
          planStatus: plan ? 'active' : 'waiting',
          syncTimestamp: new Date().toISOString(),
        }
      };
    }
  }),

  /**
   * getStudentPerformance: Genera métricas de ingeniería (PRs, Volumen, Consistencia).
   */
  getStudentPerformance: defineAction({
    accept: "json",
    input: getStudentPerformanceSchema,
    handler: async (_, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      // 1. Obtener ID del alumno vinculado
      const { data: alu } = await supabase
        .from("alumnos")
        .select("id")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();
      
      if (!alu) throw new ActionError({ code: "NOT_FOUND", message: "Alumno no encontrado" });

      // 2. Obtener historial de sesiones completadas
      const { data: sesiones } = await supabase
        .from("sesiones_instanciadas")
        .select(`
          id, fecha_real,
          sesion_ejercicios_instanciados (
            id, rpe, peso_real, series_real, reps_real, completado,
            biblioteca_ejercicios (id, nombre)
          )
        `)
        .eq("alumno_id", alu.id)
        .eq("estado", "completada")
        .order("fecha_real", { ascending: true });

      // 3. Procesar datos de rendimiento
      const volumeData: any[] = [];
      const prData: Record<string, { date: string, weight: number }[]> = {};
      const heatmapValues: Record<string, number> = {};

      (sesiones || []).forEach(s => {
        let dailyVolume = 0;
        const exercises = (s.sesion_ejercicios_instanciados as any[]) || [];
        
        exercises.forEach(ej => {
          if (!ej.completado) return;
          
          const weight = ej.peso_real || 0;
          const reps = parseInt(ej.reps_real) || 0;
          const series = ej.series_real || 1;
          const vol = weight * reps * series;
          dailyVolume += vol;

          // PR Tracking (High Performance)
          const ejName = ej.biblioteca_ejercicios?.nombre;
          if (ejName) {
            if (!prData[ejName]) prData[ejName] = [];
            const lastMax = prData[ejName].length > 0 ? prData[ejName][prData[ejName].length - 1].weight : 0;
            if (weight > lastMax) {
              prData[ejName].push({ date: s.fecha_real, weight });
            }
          }
        });

        volumeData.push({ date: s.fecha_real, volume: dailyVolume });
        
        // Heatmap Intensity (Gradient by Volume)
        let intensity = 1; // Mínimo por asistir
        if (dailyVolume > 6000) intensity = 4;
        else if (dailyVolume > 3000) intensity = 3;
        else if (dailyVolume > 1000) intensity = 2;
        
        heatmapValues[s.fecha_real] = intensity;
      });

      return {
        success: true,
        data: {
          volumeTrends: volumeData,
          prTrends: prData,
          heatmapData: heatmapValues,
        }
      };
    }
  }),

  /**
   * getPlanDetails: Devuelve el plan completo del alumno con su estructura técnica.
   */
  getPlanDetails: defineAction({
    accept: "json",
    input: getPlanDetailsSchema,
    handler: async (_, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data: alu } = await supabase
        .from("alumnos")
        .select("id, plan_id")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();
      
      if (!alu || !alu.plan_id) throw new ActionError({ code: "NOT_FOUND", message: "Plan no encontrado" });

      const { data: plan } = await supabase
        .from("planes")
        .select(`
          id, nombre, descripcion, duracion_semanas, frecuencia_semanal,
          rutinas_diarias (
            id, dia_numero, nombre_dia,
            ejercicios_plan (
              id, orden, series, reps_target, peso_target, descanso_seg,
              biblioteca_ejercicios (id, nombre, media_url)
            )
          )
        `)
        .eq("id", alu.plan_id)
        .single();

      return {
        success: true,
        data: plan
      };
    }
  }),

  /**
   * updateStudentProfile: Permite al alumno editar su propia ficha técnica y configuración de turnos.
   */

  // =============================================

  // ACCIONES LEGACY 
  // =============================================
  logExercise: defineAction({ accept: "json", input: sessionLogSchema, handler: async () => ({ success: true }) }),
  commentExercise: defineAction({ accept: "json", input: commentExerciseSchema, handler: async () => ({ success: true }) }),
  completeSession: defineAction({ accept: "json", input: completeSessionSchema, handler: async () => ({ success: true }) }),
};
