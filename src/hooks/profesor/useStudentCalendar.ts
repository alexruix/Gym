import { useCallback, useEffect, useMemo, useState } from "react";
import { actions } from "astro:actions";
import { getTodayISO, convertDaysToNumbers } from "@/lib/schedule";
import { useCalendarState } from "./calendar/useCalendarState";
import { useCalendarLoader } from "./calendar/useCalendarLoader";
import { useCalendarOperations } from "./calendar/useCalendarOperations";
import type { CalendarDay } from "@/components/molecules/DayCalendarStrip";
import type { SesionDetalle, EjercicioDetail } from "@/types/calendar";

export function useStudentCalendar(
  alumnoId: string, 
  fechaInicio: string | null, 
  initialPlan: any,
  diasAsistenciaStrings: string[] = [],
  onPlanChange?: (planId: string, updates: any) => void
) {
  // 1. Gabinete de Estado
  const {
    loading, setLoading,
    loadingDetalle, setLoadingDetalle,
    calendarDays, setCalendarDays,
    selectedDay, setSelectedDay,
    selectedSesion, setSelectedSesion,
    planData,
    stats, setStats,
    savingIds, setSavingIds,
    hasOmissions, setHasOmissions
  } = useCalendarState(initialPlan, getTodayISO());

  const [isRealigning, setIsRealigning] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [isInstantiatingExtra, setIsInstantiatingExtra] = useState(false);

  const diasAsistencia = useMemo(() => 
    convertDaysToNumbers(diasAsistenciaStrings), 
    [diasAsistenciaStrings.join(",")]
  );
  const ancla = useMemo(() => fechaInicio || getTodayISO(), [fechaInicio]);

  // 2. Motor de Carga y Previews
  const { loadSesiones: coreLoad, buildPreviewFromPlan } = useCalendarLoader(
    alumnoId, fechaInicio, planData, diasAsistencia, ancla
  );

  // 3. Motor de Operaciones y Mutaciones
  const {
    updateMetric,
    completeSession: coreComplete,
    swapExercise: coreSwap,
    addExercise: coreAdd,
    removeExercise: coreRemove,
    realignCalendar: coreRealign
  } = useCalendarOperations(alumnoId, selectedSesion, setSelectedSesion, setSavingIds, onPlanChange);

  // --- Orquestación ---

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const { days, hasOmissions } = await coreLoad();
      setCalendarDays(days);
      setHasOmissions(hasOmissions);

      // Calcular Stats
      const pasados = days.filter((d) => !d.esFuturo && !d.esHoy);
      const completadas = pasados.filter((d) => d.status === "completada").length;
      setStats({ completadas, total: pasados.length });
    } finally {
      setLoading(false);
    }
  }, [coreLoad]);

  const loadSesionDetalle = useCallback(async (sesionId: string, dia: CalendarDay) => {
    setLoadingDetalle(true);
    try {
      const { data } = await actions.alumno.instanciarSesion({ 
        fecha_real: dia.fecha,
        alumno_id: alumnoId
      });
      if (data?.sesion) {
        const s = data.sesion;
        setSelectedSesion({
          id: s.id,
          fecha_real: s.fecha_real,
          nombre_dia: s.nombre_dia || `Día ${s.numero_dia_plan}`,
          estado: s.estado,
          numero_dia_plan: s.numero_dia_plan,
          semana_numero: s.semana_numero,
          cycle_number: s.cycleNumber,
          relative_week: s.relativeWeek,
          ejercicios: (s.sesion_ejercicios_instanciados || [])
            .sort((a: any, b: any) => a.orden - b.orden)
            .map((ej: any) => {
              const bib = Array.isArray(ej.biblioteca_ejercicios) ? ej.biblioteca_ejercicios[0] : ej.biblioteca_ejercicios;
              return {
                id: ej.id,
                ejercicio_plan_id: ej.ejercicio_plan_id,
                biblioteca_ejercicio_id: bib?.id,
                nombre: bib?.nombre || "Ejercicio",
                series_real: ej.series_real, reps_real: ej.reps_real, peso_real: ej.peso_real,
                series_plan: ej.series_plan, reps_plan: ej.reps_plan, peso_plan: ej.peso_plan, descanso_plan: ej.descanso_plan,
                completado: ej.completado ?? false,
                media_url: bib?.media_url, is_variation: ej.is_variation
              };
            })
        });
      }
    } finally {
      setLoadingDetalle(false);
    }
  }, [alumnoId, setSelectedSesion]);

  // Ciclo de Vida inicial
  useEffect(() => { loadAll(); }, [loadAll]);

  // Reactividad ante navegación de días
  useEffect(() => {
    if (!selectedDay) return;
    const dia = calendarDays.find((d) => d.fecha === selectedDay);
    if (!dia) return;

    if (dia.sesionId) loadSesionDetalle(dia.sesionId, dia);
    else setSelectedSesion(buildPreviewFromPlan(selectedDay, dia));
  }, [selectedDay, calendarDays, loadSesionDetalle, buildPreviewFromPlan]);

  // Fachada de Acciones (Wrapped for Refresh)
  const wrappedAction = (fn: Function, setPending?: Function) => async (...args: any[]) => {
    if (setPending) setPending(true);
    const success = await fn(...args);
    if (success) await loadAll();
    if (setPending) setPending(false);
  };

  return {
    loading,
    calendarDays,
    selectedDay, setSelectedDay,
    selectedSesion,
    loadingDetalle,
    stats,
    savingIds,
    hasOmissions,
    isRealigning,
    isClosingSession,
    isInstantiatingExtra,
    planRoutines: planData?.rutinas_diarias || [],
    // Actions
    updateMetric,
    completeSession: () => wrappedAction(coreComplete, setIsClosingSession)(),
    swapExercise: (ejId: string, bId: string, perm: boolean) => wrappedAction(coreSwap)(ejId, bId, perm),
    addExercise: (bId: string, perm: boolean) => wrappedAction(coreAdd)(bId, perm),
    removeExercise: (ejId: string, perm: boolean) => wrappedAction(coreRemove)(ejId, perm),
    addExtraSession: async (fecha: string, rutinaId: string) => {
        setIsInstantiatingExtra(true);
        const { error } = await actions.alumno.instanciarSesion({ alumno_id: alumnoId, fecha_real: fecha, rutina_id: rutinaId });
        if (!error) await loadAll();
        setIsInstantiatingExtra(false);
    },
    realignCalendar: async () => { setIsRealigning(true); await coreRealign(); setIsRealigning(false); },
    refreshCalendar: loadAll
  };
}
