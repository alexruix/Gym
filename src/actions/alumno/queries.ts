import { defineAction, ActionError } from "astro:actions";
import { getAuthenticatedClient } from "@/lib/supabase-ssr";
import { 
  getDashboardDataSchema,
  getStudentPerformanceSchema,
  getPlanDetailsSchema,
  getWeeklySessionsSchema
} from "../../lib/validators";
import { 
  getTodayISO, 
  getCycleInfo, 
  getDayNumber, 
  getWeekNumber, 
  getStructuralDay, 
  convertDaysToNumbers 
} from "@/lib/schedule";

/**
 * Alumno: Query Actions
 * Acciones de solo lectura para alimentar el HUD, estadísticas y planes.
 */
export const queryActions = {

  /** getDashboardData: Centraliza info para el HUD (RPC-based). */
  getDashboardData: defineAction({
    accept: "json",
    input: getDashboardDataSchema,
    handler: async (input, context): Promise<any> => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data: rpcResponse, error } = await (supabase as any).rpc('get_student_dashboard_data', {
        p_user_id: user.id
      });

      if (error) {
        console.error("[Action: getStudentDashboard] RPC Error:", error);
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Error al cargar dashboard" });
      }

      const rpcResult = rpcResponse as any;
      if (rpcResult?.error) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Error al cargar dashboard" });
      }

      const { data } = rpcResult;
      const { alumno, fechaHoyISO } = data;

      const diasAsistenciaIdx = convertDaysToNumbers(alumno.dias_asistencia || []);
      const calendarDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(fechaHoyISO);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split("T")[0];
        return {
          fecha: iso,
          isToday: i === 0,
          hasSession: diasAsistenciaIdx.includes(d.getDay())
        };
      });

      return {
        success: true,
        data: {
          ...data,
          calendarDays,
          semanaActual: 1
        }
      };
    },
  }),

  /** getStudentPerformance: Analítica de ingeniería (PRs, Volumen, Heatmap). */
  getStudentPerformance: defineAction({
    accept: "json",
    input: getStudentPerformanceSchema,
    handler: async (_, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      const { data: alu } = await supabase
        .from("alumnos")
        .select("id")
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .single();
      
      if (!alu) throw new ActionError({ code: "NOT_FOUND", message: "Alumno no encontrado" });

      const { data: sesiones } = await (supabase as any)
        .from("sesiones_instanciadas")
        .select(`
          id, fecha_real,
          sesion_ejercicios_instanciados (
            id, rpe, peso_real, series_real, reps_real, completado,
            biblioteca_ejercicios (id, nombre)
          )
        `)
        .eq("alumno_id", (alu as any).id)
        .eq("estado", "completada")
        .order("fecha_real", { ascending: true });

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
        
        let intensity = 1; 
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

  /** getPlanDetails: Estructura técnica del plan activo. */
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
      
      if (!alu || !(alu as any).plan_id) throw new ActionError({ code: "NOT_FOUND", message: "Plan no encontrado" });

      const { data: plan } = await (supabase as any)
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
        .eq("id", (alu as any).plan_id)
        .single();

      return {
        success: true,
        data: plan
      };
    }
  }),

  /** getWeeklySessions: Ventana de sesiones (Agenda/Calendario). */
  getWeeklySessions: defineAction({
    accept: "json",
    input: getWeeklySessionsSchema,
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });
      const supabase = getAuthenticatedClient(context);

      let alumnoId = input.alumno_id || user.id;
      const { data: a, error: e } = await supabase
        .from("alumnos")
        .select("id, fecha_inicio, plan_id, profesor_id, dias_asistencia")
        .or(`id.eq.${alumnoId},user_id.eq.${alumnoId}`)
        .single();
      
      if (e || !a) throw new ActionError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
      const alumno = a as any;

      if (input.alumno_id && alumno.profesor_id !== user.id) {
        throw new ActionError({ code: "FORBIDDEN", message: "Sin permisos" });
      }

      if (!alumno.plan_id) return { dias: [] };

      const hoyStr = getTodayISO();
      const hoy = new Date(hoyStr + "T12:00:00");
      const desde = new Date(hoy);
      desde.setDate(hoy.getDate() - input.dias_atras);
      const hasta = new Date(hoy);
      hasta.setDate(hoy.getDate() + input.dias_adelante);

      const { data: sesiones } = await supabase
        .from("sesiones_instanciadas")
        .select("id, fecha_real, numero_dia_plan, semana_numero, nombre_dia, estado")
        .eq("alumno_id", alumno.id)
        .gte("fecha_real", desde.toISOString().split("T")[0])
        .lte("fecha_real", hasta.toISOString().split("T")[0]);

      const sesionesMap = Object.fromEntries(((sesiones as any[]) || []).map((s: any) => [s.fecha_real, s]));

      const { data: rutinasPlan } = await supabase.from("rutinas_diarias").select("id, dia_numero").eq("plan_id", alumno.plan_id);
      const activeDaysMap = new Map((rutinasPlan as any[] || []).map(r => [r.dia_numero, r.id]));
      const availableDiaNumeros = (rutinasPlan as any[] || []).map(r => r.dia_numero);

      const diasAsistencia = convertDaysToNumbers(alumno.dias_asistencia || []);
      const days = [];
      const currentDate = new Date(desde);
      const fechaInicio = alumno.fecha_inicio || hoyStr;

      const { data: pData } = await supabase.from("planes").select("duracion_semanas").eq("id", alumno.plan_id).single();
      const maxWeeks = (pData as any)?.duracion_semanas || 4;

      while (currentDate <= hasta) {
        const iso = currentDate.toISOString().split("T")[0];
        const sesion = sesionesMap[iso];
        const { cycleNumber, relativeWeek } = getCycleInfo(fechaInicio, currentDate, maxWeeks, diasAsistencia);
        const numeroDia = sesion?.numero_dia_plan ?? getDayNumber(fechaInicio, currentDate, diasAsistencia);
        const semana = sesion?.semana_numero ?? getWeekNumber(fechaInicio, currentDate, diasAsistencia);
        const diaEstructural = getStructuralDay(fechaInicio, currentDate, availableDiaNumeros, diasAsistencia);
        const hasRoutineAtStructure = !!activeDaysMap.get(diaEstructural) && diaEstructural > 0;

        days.push({
          fecha: iso,
          numeroDiaPlan: numeroDia,
          semana, cycleNumber, relativeWeek,
          status: sesion ? sesion.estado : (iso > hoyStr ? (hasRoutineAtStructure ? "futura" : "descanso") : (hasRoutineAtStructure ? "omitida" : "descanso")),
          esHoy: iso === hoyStr,
          esFuturo: iso > hoyStr,
          sesionId: sesion?.id ?? null
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return { success: true, data: { dias: days } };
    },
  }),
};
