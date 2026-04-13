import { useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import type { SesionDetalle, EjercicioDetail } from "@/types/calendar";

/**
 * useCalendarOperations: Motor de mutaciones y persistencia del Calendario.
 * Implementa JITI (Just In Time Instantiation) y Voseo Industrial.
 */
export function useCalendarOperations(
  alumnoId: string,
  selectedSesion: SesionDetalle | null,
  setSelectedSesion: React.Dispatch<React.SetStateAction<SesionDetalle | null>>,
  setSavingIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  onPlanChange?: (id: string, updates: any) => void
) {

  // Helper: Asegurar que la sesión virtual existe en DB antes de operar (JITI)
  const ensureSessionId = useCallback(async (targetSesion: SesionDetalle): Promise<string> => {
    if (targetSesion.id && targetSesion.id !== "") return targetSesion.id;

    const { data, error } = await actions.alumno.instanciarSesion({ 
      fecha_real: targetSesion.fecha_real,
      alumno_id: alumnoId
    });

    if (error || !data?.sesion) {
      throw new Error(`Error materializando sesión: ${error?.message || 'Error desconocido'}`);
    }

    return data.sesion.id;
  }, [alumnoId]);

  // --- MUTACIONES ---

  const updateMetric = useCallback(async (ej: EjercicioDetail, fields: any) => {
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
      
      // Update local state (Optimistic)
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

      if (onPlanChange) onPlanChange(ejPlanId, fields);
      
    } catch (err: any) {
      toast.error("Error al actualizar: " + err.message);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(ej.id);
        return next;
      });
    }
  }, [alumnoId, selectedSesion, setSelectedSesion, setSavingIds, onPlanChange]);

  const completeSession = useCallback(async () => {
    if (!selectedSesion) return;
    try {
      const targetId = await ensureSessionId(selectedSesion);
      const { data, error } = await actions.alumno.completeSessionByProfessor({
        sesion_id: targetId,
        alumno_id: alumnoId
      });
      if (error) throw error;
      
      // Haptic Feedback
      if ('vibrate' in navigator) navigator.vibrate(20);
      toast.success(data.mensaje);

      // Actualización optimista inmediata
      setSelectedSesion(prev => prev ? { ...prev, estado: 'completada' } : null);

      return true; // Éxito

    } catch (err: any) {
      toast.error("Error al cerrar sesión: " + err.message);
      return false;
    }
  }, [alumnoId, selectedSesion, ensureSessionId]);

  const swapExercise = useCallback(async (ejId: string, nuevoBibId: string, _isPermanent: boolean) => {
    if (!selectedSesion) return;
    try {
      const targetId = await ensureSessionId(selectedSesion);
      const { data, error } = await actions.alumno.swapExerciseInStudentPlan({
        alumno_id: alumnoId,
        sesion_id: targetId,
        ejercicio_id: ejId,
        nuevo_biblioteca_id: nuevoBibId,
        is_permanent: false // Forzado: Organismo Vivo
      });
      if (error) throw error;
      toast.success("Ejercicio cambiado correctamente (sólo por hoy).");
      return true;

    } catch (err: any) {
      toast.error("Error: " + err.message);
      return false;
    }
  }, [alumnoId, selectedSesion, ensureSessionId]);

  const addExercise = useCallback(async (bibId: string, _isPermanent: boolean) => {
    if (!selectedSesion) return;
    try {
        const targetId = await ensureSessionId(selectedSesion);
        const { data, error } = await actions.alumno.addExerciseToStudentPlan({
            alumno_id: alumnoId,
            sesion_id: targetId,
            biblioteca_id: bibId,
            is_permanent: false // Forzado: Organismo Vivo
        });
        if (error) throw error;
        toast.success("Ejercicio añadido para esta sesión.");
        return true;

    } catch (err: any) {
        toast.error("Error: " + err.message);
        return false;
    }
  }, [alumnoId, selectedSesion, ensureSessionId]);

  const removeExercise = useCallback(async (ejId: string, _isPermanent: boolean) => {
    if (!selectedSesion) return;
    try {
        const targetId = await ensureSessionId(selectedSesion);
        const { data, error } = await actions.alumno.removeExerciseFromStudentPlan({
            alumno_id: alumnoId,
            sesion_id: targetId,
            ejercicio_id: ejId,
            is_permanent: false // Forzado: Organismo Vivo
        });
        if (error) throw error;
        toast.success("Ejercicio quitado (sólo por hoy).");
        return true;

    } catch (err: any) {
        toast.error("Error: " + err.message);
        return false;
    }
  }, [alumnoId, selectedSesion, ensureSessionId]);

  const realignCalendar = useCallback(async () => {
    try {
        const { data, error } = await actions.alumno.updateStudentStartDateOffset({
            alumno_id: alumnoId,
            offset_days: 3
        });
        if (error) throw error;
        toast.success(data.mensaje);
        window.location.reload(); // Reajuste requiere reload para resetear ancla
    } catch (err: any) {
        toast.error("Error al reajustar: " + err.message);
    }
  }, [alumnoId]);

  return {
    updateMetric,
    completeSession,
    swapExercise,
    addExercise,
    removeExercise,
    realignCalendar
  };
}
