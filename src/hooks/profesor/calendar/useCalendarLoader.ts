import { useCallback } from "react";
import { actions } from "astro:actions";
import { getDayNumber, getWeekNumber, getCyclicDayNumber, getStructuralDay, getTodayISO } from "@/lib/schedule";
import type { CalendarDay, DayStatus } from "@/components/molecules/DayCalendarStrip";
import type { SesionDetalle, EjercicioDetail } from "@/types/calendar";

const DIAS_SEMANA_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function useCalendarLoader(
  alumnoId: string,
  fechaInicio: string | null,
  planData: any,
  diasAsistencia: number[],
  ancla: string
) {

  // 1. Cargar Historial (Calendario)
  const loadSesiones = useCallback(async () => {
    const DIAS_ATRAS = 28;
    const DIAS_ADELANTE = 28;
    
    const hoyStr = getTodayISO();
    const hoyLocal = new Date(hoyStr + "T12:00:00");
    let desde = new Date(hoyLocal);
    desde.setDate(desde.getDate() - DIAS_ATRAS);
    
    if (fechaInicio) {
      const fInicio = new Date(fechaInicio + "T12:00:00");
      if (desde < fInicio) desde = fInicio;
    }

    // ALINEACIÓN A LUNES
    const day = desde.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    desde.setDate(desde.getDate() - diffToMonday);

    const hasta = new Date(hoyLocal);
    hasta.setDate(hasta.getDate() + DIAS_ADELANTE);

    const realDiasAtras = Math.floor((hoyLocal.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));

    const { data: resultado } = await actions.alumno.getWeeklySessions({
      alumno_id: alumnoId,
      dias_atras: Math.max(0, realDiasAtras),
      dias_adelante: DIAS_ADELANTE,
    });

    const sesionesMap: Record<string, any> = {};
    (resultado?.dias || []).forEach((d: any) => { sesionesMap[d.fecha] = d; });

    const days: CalendarDay[] = [];
    const cur = new Date(desde);
    while (cur <= hasta) {
      const fechaISO = cur.toISOString().split("T")[0];
      const esHoy = fechaISO === hoyStr;
      const esFuturo = fechaISO > hoyStr;
      const sesion = sesionesMap[fechaISO];

      const numeroDia = sesion?.numero_dia_plan ?? (sesion?.numeroDiaPlan ?? getDayNumber(ancla, new Date(cur), diasAsistencia));
      const semana = sesion?.semana_numero ?? getWeekNumber(ancla, new Date(cur), diasAsistencia);
      const status = (sesion?.status as DayStatus) || (esFuturo && !esHoy ? "futura" : "pendiente");

      days.push({
        fecha: fechaISO,
        fechaDisplay: String(cur.getUTCDate()),
        diaSemana: DIAS_SEMANA_CORTO[cur.getUTCDay()],
        numeroDiaPlan: numeroDia,
        semana,
        cycleNumber: sesion?.cycleNumber || 1,
        relativeWeek: sesion?.relativeWeek || semana,
        status,
        nombreDia: sesion?.nombre_dia ?? undefined,
        esHoy,
        esFuturo: esFuturo && !esHoy,
        sesionId: sesion?.id ?? undefined,
        rutinaIdOriginal: sesion?.rutina_id_original ?? undefined,
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return { days, hasOmissions: resultado?.hasConsecutiveOmissions ?? false };
  }, [alumnoId, ancla, fechaInicio, diasAsistencia]);

  // 2. Preview desde Plan (Ghost Sessions)
  const buildPreviewFromPlan = useCallback((fecha: string, dia: CalendarDay): SesionDetalle | null => {
    if (!planData || !planData.rutinas_diarias?.length) return null;
    
    const availableDiaNumeros = (planData.rutinas_diarias as any[])
      .map(r => r.dia_numero)
      .sort((a,b) => a-b);
    
    const diaEstructural = getStructuralDay(ancla, new Date(fecha + "T12:00:00"), availableDiaNumeros, diasAsistencia);
    if (diaEstructural === 0) return null; 

    const rutina = planData.rutinas_diarias.find((r: any) => r.dia_numero === diaEstructural);
    if (!rutina) return null;

    const maxWeeks = planData.duracion_semanas || 4;
    
    // Calcular Semana Relativa para el Preview
    const fechaObj = new Date(fecha + "T12:00:00");
    const diffTime = Math.abs(fechaObj.getTime() - new Date(ancla + "T12:00:00").getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const absoluteWeek = Math.floor(diffDays / 7) + 1;
    const currentRelativeWeek = ((absoluteWeek - 1) % maxWeeks) + 1;

    return {
      id: "",
      fecha_real: fecha,
      nombre_dia: rutina.nombre_dia || `Día ${diaEstructural}`,
      estado: dia.status,
      numero_dia_plan: dia.numeroDiaPlan,
      semana_numero: absoluteWeek,
      ejercicios: (rutina.ejercicios_plan || []).map((ej: any) => {
        const bib = Array.isArray(ej.biblioteca_ejercicios) ? ej.biblioteca_ejercicios[0] : ej.biblioteca_ejercicios;
        const personalizaciones = ej.ejercicio_plan_personalizado || [];
        const override = personalizaciones.find((p: any) => p.semana_numero === currentRelativeWeek);

        return {
          id: ej.id,
          ejercicio_plan_id: ej.id,
          biblioteca_ejercicio_id: bib?.id,
          nombre: bib?.nombre || "Ejercicio",
          series_plan: override?.series ?? ej.series,
          reps_plan: override?.reps_target ?? ej.reps_target,
          peso_plan: override?.peso_target ? parseFloat(override.peso_target) : (ej.peso_target ? parseFloat(ej.peso_target) : null),
          descanso_plan: override?.descanso_seg ?? ej.descanso_seg,
          completado: false,
          media_url: bib?.media_url,
          is_variation: false
        };
      }),
    };
  }, [planData, ancla, diasAsistencia]);

  return { loadSesiones, buildPreviewFromPlan };
}
