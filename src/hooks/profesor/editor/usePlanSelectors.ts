import { useMemo } from "react";
import type { PlanData, RutinaDiaria } from "@/types/planes";
import type { AlumnoDePlan as Alumno } from "@/types/planes";
import { getGroupedExercises } from "./utils";

/**
 * usePlanSelectors: Lógica pura de cálculo para el Plan Editor.
 * Centraliza el agrupamiento de rutinas y filtrado de alumnos.
 */
export function usePlanSelectors(plan: any, studentSearch: string = "") {
  // ... (previous logic)
  const formattedCreatedDate = useMemo(() => {
    if (!plan?.created_at) return "-";
    return new Date(plan.created_at).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [plan?.created_at]);

  const activeStudents = useMemo(() => {
    const alumnos = (plan?.alumnos || []) as Alumno[];
    return alumnos
      .filter((a) => !a.deleted_at)
      .filter(a => a.nombre.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [plan?.alumnos, studentSearch]);

  const groupedRoutines = useMemo(() => {
    const groups: { [key: number]: (RutinaDiaria | any)[] } = {};
    const routines = plan?.rutinas || plan?.rutinas_diarias || [];
    const frec = Math.max(1, plan?.frecuencia_semanal || 1);
    
    [...routines]
      .sort((a, b) => a.dia_numero - b.dia_numero)
      .forEach(r => {
        const week = Math.ceil(r.dia_numero / frec);
        if (!groups[week]) groups[week] = [];
        groups[week].push(r);
      });
      
    return groups;
  }, [plan?.rutinas, plan?.rutinas_diarias, plan?.frecuencia_semanal]);

  return {
    formattedCreatedDate,
    activeStudents,
    groupedRoutines,
    getGroupedExercises
  };
}
