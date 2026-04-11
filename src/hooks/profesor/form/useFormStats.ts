import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

/**
 * useFormStats: Cálculos derivados y métricas del formulario.
 */
export function useFormStats(form: UseFormReturn<any>, rutinasWatch: any[]) {
    const numWeeks = form.watch("duracion_semanas") ?? 1;
    const effectiveNumWeeks = numWeeks === 0 ? 1 : numWeeks;
    const freqSemanal = form.watch("frecuencia_semanal") || 3;
    const nombre = form.watch("nombre");

    const stats = useMemo(() => {
        let totalEjercicios = 0;
        let activeDays = 0;
        let hasHiddenData = false;
        
        const maxValidDay = effectiveNumWeeks * freqSemanal;
        
        rutinasWatch?.forEach((r: any, i: number) => {
            const count = r.ejercicios?.length || 0;
            if (count > 0) {
                if (i < maxValidDay) {
                    activeDays++;
                    totalEjercicios += count;
                } else {
                    hasHiddenData = true;
                }
            }
        });
        
        return { 
            activeDaysCount: activeDays,
            totalEjercicios,
            hasHiddenData,
            isValid: activeDays > 0 && (nombre?.length >= 3)
        };
    }, [rutinasWatch, nombre, effectiveNumWeeks, freqSemanal]);

    return {
        stats,
        effectiveNumWeeks,
        freqSemanal
    };
}
