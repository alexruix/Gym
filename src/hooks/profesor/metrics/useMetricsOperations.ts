import { useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import type { AssignedPlanMetric } from "@/types/student";

/**
 * useMetricsOperations: Motor de ingeniería de cargas y progreso.
 */
export function useMetricsOperations(
    alumnoId: string,
    planData: AssignedPlanMetric | null | undefined,
    currentWeek: number,
    isPending: boolean,
    runAction: any
) {

    const handleUpdateMetric = useCallback((ejercicioPlanId: string, updates: any) => {
        if (!planData || isPending) return;

        runAction(async () => {
            const { error } = await actions.profesor.upsertStudentMetricOverride({
                alumno_id: alumnoId,
                ejercicio_plan_id: ejercicioPlanId,
                semana_numero: currentWeek,
                ...updates
            });

            if (error) throw new Error(error.message);

            // Feedback Táctil: Confirmación de carga
            if ('vibrate' in navigator) navigator.vibrate(10);

            toast.success("Dato guardado. ¡Vamos que sigue subiendo!", { 
                icon: "🎯", 
                duration: 2000 
            });
        }, { loadingMsg: "Guardando...", reloadOnSuccess: true });
    }, [alumnoId, planData, currentWeek, isPending, runAction]);

    const handleCopyFromPrevious = useCallback(() => {
        if (!planData || currentWeek <= 1 || isPending) return;

        runAction(async () => {
            const { data: res, error } = await actions.profesor.copyMetricsToNextWeek({
                alumno_id: alumnoId,
                from_week: currentWeek - 1,
                to_week: currentWeek,
                plan_id: planData.id
            });

            if (error) throw new Error(error.message);
            
            if (res?.success) {
                toast.success("Estamos clonando tus cargas...", { icon: "🧬" });
            } else {
                toast.error("No hay métricas para copiar de la semana anterior");
            }
        }, { loadingMsg: "Clonando métricas...", reloadOnSuccess: true });
    }, [alumnoId, planData, currentWeek, isPending, runAction]);

    return {
        handleUpdateMetric,
        handleCopyFromPrevious
    };
}
