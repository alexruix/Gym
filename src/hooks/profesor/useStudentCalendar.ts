import { useState, useEffect, useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { getDayNumber, getWeekNumber, getCyclicDayNumber, getStructuralDay, getTodayISO } from "@/lib/schedule";
import type { CalendarDay, DayStatus } from "@/components/molecules/DayCalendarStrip";

// =============================================
// Tipos
// =============================================

export interface EjercicioDetail {
  id: string; // ID en sesion_ejercicios_instanciados
  biblioteca_ejercicio_id: string;
  ejercicio_plan_id?: string | null;
  nombre: string;
  series_real?: number | null;
  reps_real?: string | null;
  peso_real?: number | null;
  series_plan: number;
  reps_plan: string;
  peso_plan?: number | null;
  descanso_plan?: number | null;
  completado: boolean;
  media_url?: string | null;
  is_variation?: boolean;
}

export interface SesionDetalle {
  id: string;
  fecha_real: string;
  nombre_dia: string;
  estado: string;
  numero_dia_plan: number;
  semana_numero: number;
  cycle_number?: number;
  relative_week?: number;
  ejercicios: EjercicioDetail[];
}

const DIAS_SEMANA_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// =============================================
// Hook Principal
// =============================================

export function useStudentCalendar(alumnoId: string, fechaInicio: string | null, planData: any) {
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSesion, setSelectedSesion] = useState<SesionDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [stats, setStats] = useState({ completadas: 0, total: 0 });
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [hasOmissions, setHasOmissions] = useState(false);
  const [isRealigning, setIsRealigning] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);

  const [planRoutines, setPlanRoutines] = useState<any[]>([]);
  const [isInstantiatingExtra, setIsInstantiatingExtra] = useState(false);

  const hoyISO = new Date().toISOString().split("T")[0];
  const ancla = fechaInicio || hoyISO;

  // Sincronizar rutinas del plan para diálogos
  useEffect(() => {
    if (planData?.rutinas_diarias) {
      setPlanRoutines(planData.rutinas_diarias);
    }
  }, [planData]);

  // 1. Cargar Historial (Calendario)
  const loadSesiones = useCallback(async () => {
    setLoading(true);
    try {
      const DIAS_ATRAS = 28;
      const DIAS_ADELANTE = 28;
      
      const hoyStr = getTodayISO();
      const hoyLocal = new Date(hoyStr + "T12:00:00");
      let desde = new Date(hoyLocal);
      desde.setDate(desde.getDate() - DIAS_ATRAS);
      
      // No retroceder más allá de la fecha de inicio del alumno
      if (fechaInicio) {
        const fInicio = new Date(fechaInicio + "T12:00:00");
        if (desde < fInicio) {
          desde = fInicio;
        }
      }

      // ALINEACIÓN A LUNES: Siempre empezar la tira en el lunes de la semana correspondiente
      const day = desde.getDay(); // 0 es Domingo, 1 es Lunes
      const diffToMonday = day === 0 ? 6 : day - 1;
      desde.setDate(desde.getDate() - diffToMonday);

      const hasta = new Date(hoyLocal);
      hasta.setDate(hasta.getDate() + DIAS_ADELANTE);

      // Recalcular dias_atras real para la acción
      const realDiasAtras = Math.floor((new Date().getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));

      const { data: resultado } = await actions.alumno.getWeeklySessions({
        alumno_id: alumnoId,
        dias_atras: Math.max(0, realDiasAtras),
        dias_adelante: DIAS_ADELANTE,
      });

      const sesionesMap: Record<string, any> = {};
      (resultado?.dias || []).forEach((d: any) => {
        sesionesMap[d.fecha] = d;
      });

      // Local buildCalendarDays logic
      const todayISO = hoyStr;

      const days: CalendarDay[] = [];
      const cur = new Date(desde);
      while (cur <= hasta) {
        const fechaISO = cur.toISOString().split("T")[0];
        const esHoy = fechaISO === todayISO;
        const esFuturo = fechaISO > todayISO;
        const sesion = sesionesMap[fechaISO];

        const numeroDia = sesion?.numero_dia_plan ?? (sesion?.numeroDiaPlan ?? getDayNumber(ancla, new Date(cur)));
        const semana = sesion?.semana_numero ?? getWeekNumber(ancla, new Date(cur));

        const status = sesion?.status as DayStatus || (esFuturo && !esHoy ? "futura" : "pendiente");

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
          sesionId: sesion?.id ?? (sesion?.sesionId ?? undefined), // Soportar ambos formatos
          rutinaIdOriginal: sesion?.rutina_id_original ?? undefined,
        });
        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      setCalendarDays(days);
      setHasOmissions(resultado?.hasConsecutiveOmissions ?? false);

      const pasados = days.filter((d) => !d.esFuturo && !d.esHoy);
      const completadas = pasados.filter((d) => d.status === "completada").length;
      setStats({ completadas, total: pasados.length });

      if (!selectedDay) setSelectedDay(hoyISO);

      // ...
    } catch (err) {
      console.error("Error cargando sesiones:", err);
    } finally {
      setLoading(false);
    }
  }, [alumnoId, ancla, selectedDay, hoyISO, fechaInicio, planData]);

  // 2. Cargar Detalle de Sesión
  const loadSesionDetalle = useCallback(async (sesionId: string, dia: CalendarDay) => {
    setLoadingDetalle(true);
    try {
      const { data } = await actions.alumno.instanciarSesion({ 
        fecha_real: dia.fecha,
        alumno_id: alumnoId
      });
      if (data?.sesion) {
        const s = data.sesion;
        const ejercicios = (s.sesion_ejercicios_instanciados || [])
          .sort((a: any, b: any) => a.orden - b.orden)
          .map((ej: any) => {
            const bib = Array.isArray(ej.biblioteca_ejercicios) ? ej.biblioteca_ejercicios[0] : ej.biblioteca_ejercicios;
            return {
              id: ej.id,
              ejercicio_plan_id: ej.ejercicio_plan_id,
              biblioteca_ejercicio_id: bib?.id,
              nombre: bib?.nombre || "Ejercicio",
              series_real: ej.series_real,
              reps_real: ej.reps_real,
              peso_real: ej.peso_real,
              series_plan: ej.series_plan,
              reps_plan: ej.reps_plan,
              peso_plan: ej.peso_plan,
              descanso_plan: ej.descanso_plan,
              completado: ej.completado ?? false,
              media_url: bib?.media_url,
              is_variation: ej.is_variation
            };
          });

        setSelectedSesion({
          id: s.id,
          fecha_real: s.fecha_real,
          nombre_dia: s.nombre_dia || `Día ${s.numero_dia_plan}`,
          estado: s.estado,
          numero_dia_plan: s.numero_dia_plan,
          semana_numero: s.semana_numero,
          cycle_number: s.cycleNumber,
          relative_week: s.relativeWeek,
          ejercicios,
        });
      }
    } catch (err) {
      console.error("Error cargando detalle:", err);
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  // 3. Preview desde Plan
  const buildPreviewFromPlan = useCallback((fecha: string, dia: CalendarDay): SesionDetalle | null => {
    if (!planData || !planData.rutinas_diarias?.length) return null;
    const totalWeeks = planData.duracion_semanas || 1;
    const diaEstructural = getStructuralDay(ancla, new Date(fecha + "T12:00:00"), totalWeeks);
    const rutina = planData.rutinas_diarias.find((r: any) => r.dia_numero === diaEstructural);
    if (!rutina) return null;

    return {
      id: "",
      fecha_real: fecha,
      nombre_dia: rutina.nombre_dia || `Día ${diaEstructural}`,
      estado: dia.status,
      numero_dia_plan: dia.numeroDiaPlan,
      semana_numero: dia.semana,
      ejercicios: (rutina.ejercicios_plan || []).map((ej: any) => {
        const bib = Array.isArray(ej.biblioteca_ejercicios) ? ej.biblioteca_ejercicios[0] : ej.biblioteca_ejercicios;
        return {
          id: ej.id,
          ejercicio_plan_id: ej.id,
          biblioteca_ejercicio_id: bib?.id,
          nombre: bib?.nombre || "Ejercicio",
          series_plan: ej.series,
          reps_plan: ej.reps_target,
          peso_plan: ej.peso_target ? parseFloat(ej.peso_target) : null,
          descanso_plan: ej.descanso_seg,
          completado: false,
          media_url: bib?.media_url,
          is_variation: false
        };
      }),
    };
  }, [planData]);

  // Efectos de carga inicial y navegación
  useEffect(() => {
    loadSesiones();
  }, [loadSesiones]);

  useEffect(() => {
    if (!selectedDay) return;
    const dia = calendarDays.find((d) => d.fecha === selectedDay);
    if (!dia) return;

    if (dia.sesionId) loadSesionDetalle(dia.sesionId, dia);
    else setSelectedSesion(buildPreviewFromPlan(selectedDay, dia));
  }, [selectedDay, calendarDays, loadSesionDetalle, buildPreviewFromPlan]);

  // MUTACIONES

  const updateMetric = async (ej: EjercicioDetail, fields: any) => {
    if (!selectedSesion) return;
    const ejPlanId = selectedSesion.id === "" ? ej.id : ej.ejercicio_plan_id;
    if (!ejPlanId) {
      toast.error("No se pudo identificar el ID del plan.");
      return;
    }

    setSavingIds(prev => new Set(prev).add(ej.id));
    try {
      const { data, error } = await actions.alumno.updateStudentMetricWithPropagation({
        alumno_id: alumnoId,
        ejercicio_plan_id: ejPlanId,
        semana_numero: selectedSesion.semana_numero,
        ...fields
      });
      if (error) throw error;
      
      // Actualizar localmente la sesión seleccionada
      setSelectedSesion(prev => prev ? { 
        ...prev, 
        ejercicios: prev.ejercicios.map(item => item.id === ej.id ? { 
          ...item, 
          series_plan: fields.series ?? item.series_plan,
          reps_plan: fields.reps_target ?? item.reps_plan,
          peso_plan: fields.peso_target ? parseFloat(fields.peso_target) : item.peso_plan,
          descanso_plan: fields.descanso_seg ?? item.descanso_plan
        } : item) 
      } : null);

      toast.success(data.mensaje);
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSavingIds(prev => { const n = new Set(prev); n.delete(ej.id); return n; });
    }
  };

  const completeSession = async () => {
    if (!selectedSesion) return;

    let targetId = selectedSesion.id;
    setIsClosingSession(true);

    try {
      // 1. Si la sesión es "fantasma" (preview), la instanciamos antes de completar
      if (!targetId) {
        const { data: instData, error: instErr } = await actions.alumno.instanciarSesion({ 
          fecha_real: selectedSesion.fecha_real,
          alumno_id: alumnoId
        });
        if (instErr) throw new Error(`[Instanciación] ${instErr.message}`);
        if (!instData?.sesion) throw new Error("No se pudo obtener la sesión instanciada automáticamente");
        targetId = instData.sesion.id;
      }

      // 2. Marcar como completada por el profesor
      const { data, error } = await actions.alumno.completeSessionByProfessor({
        sesion_id: targetId,
        alumno_id: alumnoId
      });
      if (error) throw error;

      toast.success(data.mensaje);
      await loadSesiones(); // Recargar calendario para ver el nuevo estado
    } catch (err: any) {
      toast.error("Error al cerrar sesión: " + err.message);
    } finally {
      setIsClosingSession(false);
    }
  };

  const swapExercise = async (ejId: string, nuevoBibId: string, isPermanent: boolean) => {
    if (!selectedSesion) return;
    try {
      const { data, error } = await actions.alumno.swapExerciseInStudentPlan({
        alumno_id: alumnoId,
        sesion_id: selectedSesion.id,
        ejercicio_id: ejId,
        nuevo_biblioteca_id: nuevoBibId,
        is_permanent: isPermanent
      });
      if (error) throw error;
      toast.success(data.mensaje);
      await loadSesiones(); // Sincronizar todo
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const addExercise = async (bibId: string, isPermanent: boolean) => {
    if (!selectedSesion) return;
    try {
        const { data, error } = await actions.alumno.addExerciseToStudentPlan({
            alumno_id: alumnoId,
            sesion_id: selectedSesion.id,
            biblioteca_id: bibId,
            is_permanent: isPermanent
        });
        if (error) throw error;
        toast.success(data.mensaje);
        await loadSesiones();
    } catch (err: any) {
        toast.error("Error: " + err.message);
    }
  };

  const removeExercise = async (ejId: string, isPermanent: boolean) => {
    if (!selectedSesion) return;
    try {
        const { data, error } = await actions.alumno.removeExerciseFromStudentPlan({
            alumno_id: alumnoId,
            sesion_id: selectedSesion.id,
            ejercicio_id: ejId,
            is_permanent: isPermanent
        });
        if (error) throw error;
        toast.success(data.mensaje);
        await loadSesiones();
    } catch (err: any) {
        toast.error("Error: " + err.message);
    }
  };

  const addExtraSession = async (fecha: string, rutinaId: string) => {
    setIsInstantiatingExtra(true);
    try {
      const { data, error } = await actions.alumno.instanciarSesion({
        alumno_id: alumnoId,
        fecha_real: fecha,
        rutina_id: rutinaId
      });
      if (error) throw error;
      toast.success("Sesión extra añadida");
      await loadSesiones();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsInstantiatingExtra(false);
    }
  };

  const realignCalendar = async () => {
    setIsRealigning(true);
    try {
        const { data, error } = await actions.alumno.updateStudentStartDateOffset({
            alumno_id: alumnoId,
            offset_days: 3
        });
        if (error) throw error;
        toast.success(data.mensaje);
        window.location.reload(); 
    } catch (err: any) {
        toast.error("Error al reajustar: " + err.message);
    } finally {
        setIsRealigning(false);
    }
  };

  return {
    loading,
    calendarDays,
    selectedDay,
    setSelectedDay,
    selectedSesion,
    loadingDetalle,
    stats,
    savingIds,
    hasOmissions,
    isRealigning,
    isClosingSession,
    // Actions
    updateMetric,
    completeSession,
    swapExercise,
    addExercise,
    removeExercise,
    addExtraSession,
    realignCalendar,
    planRoutines,
    isInstantiatingExtra,
    refreshCalendar: loadSesiones
  };
}
