import { useState, useEffect, useRef, useMemo } from "react";

/**
 * usePlanState: Maneja el estado local, la sincronización (SSOT) y el dirty state del Plan.
 */
export function usePlanState<T>(initialPlan: T) {
  const [localPlan, setLocalPlan] = useState<T>(initialPlan);
  const [openRutinas, setOpenRutinas] = useState<Set<string>>(new Set());
  const [studentSearch, setStudentSearch] = useState("");
  const [activeRoutineTarget, setActiveRoutineTarget] = useState<string | null>(null);
  const isInteracting = useRef(false);

  // Guardamos el estado inicial en un ref para detectar cambios (Dirty State)
  const initialPlanRef = useRef<string>(JSON.stringify(initialPlan));

  // Sincronización SSOT: Si el plan inicial cambia externamente (ej: refresh), actualizamos el local
  useEffect(() => {
    if (!isInteracting.current) {
        setLocalPlan(initialPlan);
        initialPlanRef.current = JSON.stringify(initialPlan);
    }
  }, [initialPlan]);

  // Cálculo de Dirty State (Optimizado)
  const isDirty = useMemo(() => {
    if (!localPlan) return false;
    return JSON.stringify(localPlan) !== initialPlanRef.current;
  }, [localPlan]);

  // UI: Toggle de rutinas
  const toggleRutina = (id: string) => {
    setOpenRutinas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return {
    localPlan,
    setLocalPlan,
    openRutinas,
    setOpenRutinas,
    studentSearch,
    setStudentSearch,
    activeRoutineTarget,
    setActiveRoutineTarget,
    isInteracting,
    isDirty,
    toggleRutina
  };
}
