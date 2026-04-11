import { useState } from "react";
import { useAccordion } from "@/hooks/useAccordion";
import type { AssignedPlanMetric } from "@/types/student";

/**
 * useMetricsState: Memoria técnica del progreso del alumno.
 */
export function useMetricsState(planData?: AssignedPlanMetric | null) {
    const [currentWeek, setCurrentWeek] = useState(1);
    
    const { isOpen, toggleItem } = useAccordion(
        planData?.rutinas_diarias?.slice(0, 1).map(r => r.id) || []
    );

    const numWeeks = planData?.duracion_semanas || 1;

    return {
        currentWeek,
        setCurrentWeek,
        numWeeks,
        accordion: {
            isOpen,
            toggleItem
        }
    };
}
