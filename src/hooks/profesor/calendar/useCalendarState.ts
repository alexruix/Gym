import { useState, useEffect } from "react";
import type { CalendarDay } from "@/components/molecules/DayCalendarStrip";
import type { SesionDetalle } from "@/types/calendar";

/**
 * useCalendarState: Gestión de UI y estado del Calendario del Alumno.
 */
export function useCalendarState(initialPlan: any) {
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSesion, setSelectedSesion] = useState<SesionDetalle | null>(null);

  const [planData, setPlanData] = useState(initialPlan);
  const [stats, setStats] = useState({ completadas: 0, total: 0 });
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [hasOmissions, setHasOmissions] = useState(false);

  // Sincronización con cambios externos del plan (SSOT)
  useEffect(() => {
    setPlanData(initialPlan);
  }, [initialPlan]);

  return {
    loading,
    setLoading,
    loadingDetalle,
    setLoadingDetalle,
    calendarDays,
    setCalendarDays,
    selectedDay,
    setSelectedDay,
    selectedSesion,
    setSelectedSesion,
    planData,
    stats,
    setStats,
    savingIds,
    setSavingIds,
    hasOmissions,
    setHasOmissions
  };
}
