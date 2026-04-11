import { useMetricsState } from "./metrics/useMetricsState";
import { useMetricsOperations } from "./metrics/useMetricsOperations";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { AssignedPlanMetric } from "@/types/student";

interface UseStudentMetricsProps {
  alumnoId: string;
  planData?: AssignedPlanMetric | null;
}

/**
 * useStudentMetrics: Motor de seguimiento técnico y progreso del alumno.
 * Orquesta la navegación de semanas (MEMORIA) y la ingeniería de cargas (OPERACIONES).
 */
export function useStudentMetrics({ alumnoId, planData }: UseStudentMetricsProps) {
    const { execute: run, isPending } = useAsyncAction();

    // 1. Memoria Técnica (Estado: Semanas y Acordeón)
    const { 
        currentWeek, 
        setCurrentWeek, 
        numWeeks, 
        accordion 
    } = useMetricsState(planData);

    // 2. Ingeniería de Cargas (Operaciones: Overrides y Clones)
    const { 
        handleUpdateMetric, 
        handleCopyFromPrevious 
    } = useMetricsOperations(alumnoId, planData, currentWeek, isPending, run);

    return {
        // Data & Navigation
        currentWeek,
        setCurrentWeek,
        numWeeks,
        isPending,
        accordion,

        // Technical Actions
        actions: {
            handleUpdateMetric,
            handleCopyFromPrevious
        }
    };
}
