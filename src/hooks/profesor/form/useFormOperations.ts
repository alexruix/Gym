import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { trackExerciseUsage } from "@/lib/recency";

interface UseFormOperationsProps {
    form: UseFormReturn<any>;
    activeDiaAbsoluto: number;
    historyRef: React.MutableRefObject<any>;
    setIsBulkOpen: (val: boolean) => void;
}

/**
 * useFormOperations: Motor de mutaciones estructurales del formulario.
 */
export function useFormOperations({
    form,
    activeDiaAbsoluto,
    historyRef,
    setIsBulkOpen
}: UseFormOperationsProps) {

    // --- Auxiliares ---
    const getRoutineIdx = () => activeDiaAbsoluto - 1;

    // --- Acciones ---

    const addExercise = useCallback((exerciseId: string) => {
        trackExerciseUsage(exerciseId);
        const routineIdx = getRoutineIdx();
        const currentExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`) || [];
        
        const position = Math.floor(Math.random() * 1000000000); // Evitar Integer Overflow
        const newExercise = {
            ejercicio_id: exerciseId, 
            series: 3, 
            reps_target: "12", 
            descanso_seg: 60, 
            orden: currentExercises.length, 
            exercise_type: "base", 
            position, 
            peso_target: ""
        };
        
        form.setValue(`rutinas.${routineIdx}.ejercicios`, [...currentExercises, newExercise]);
        toast.success("Agregaste un ejercicio nuevo");
    }, [form, activeDiaAbsoluto]);

    const addBlockToRoutine = useCallback((block: any) => {
        const routineIdx = getRoutineIdx();
        const currentExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`) || [];
        
        const newExercises = (block.bloques_ejercicios || []).map((item: any, idx: number) => ({
            ejercicio_id: item.ejercicio_id,
            series: item.series,
            reps_target: item.reps_target,
            descanso_seg: item.descanso_seg,
            orden: currentExercises.length + idx,
            exercise_type: "base",
            position: Math.floor(Math.random() * 1000000000),
            peso_target: "",
            grupo_bloque_id: block.id,
            grupo_nombre: block.nombre,
            grupo_tipo_bloque: block.tipo_bloque,
            grupo_vueltas: block.vueltas,
            grupo_descanso_final: block.descanso_final
        }));
        
        form.setValue(`rutinas.${routineIdx}.ejercicios`, [...currentExercises, ...newExercises]);
        toast.success(`Importaste el bloque "${block.nombre}"`);
    }, [form, activeDiaAbsoluto]);

    const removeExercise = useCallback((ri: number, ei: number) => {
        const updated = [...form.getValues(`rutinas.${ri}.ejercicios`)];
        updated.splice(ei, 1);
        form.setValue(`rutinas.${ri}.ejercicios`, updated);
        toast.info("Removiste un ejercicio");
    }, [form]);

    const moveExercise = useCallback((ri: number, ei: number, direction: "up" | "down") => {
        const currentExercises = [...form.getValues(`rutinas.${ri}.ejercicios`)];
        const targetIdx = direction === "up" ? ei - 1 : ei + 1;
        
        if (targetIdx < 0 || targetIdx >= currentExercises.length) return;
        
        const [moved] = currentExercises.splice(ei, 1);
        currentExercises.splice(targetIdx, 0, moved);
        
        const finalized = currentExercises.map((ex, idx) => ({ ...ex, orden: idx }));
        form.setValue(`rutinas.${ri}.ejercicios`, finalized);

        // Haptic Feedback
        if ('vibrate' in navigator) navigator.vibrate(10);
    }, [form]);

    const handleDuplicateMulti = useCallback((targetDayNums: number[]) => {
        historyRef.current = JSON.parse(JSON.stringify(form.getValues("rutinas")));
        const rutinas = form.getValues("rutinas");
        const sourceRoutine = rutinas[getRoutineIdx()];
        if (!sourceRoutine) return;
        
        const newRutinas = [...rutinas];
        targetDayNums.forEach(dNum => {
            newRutinas[dNum - 1] = { 
                ...newRutinas[dNum - 1], 
                ejercicios: JSON.parse(JSON.stringify(sourceRoutine.ejercicios || [])) 
            };
        });
        
        form.setValue("rutinas", newRutinas);
        setIsBulkOpen(false);
        
        // Haptic Feedback PWA
        if ('vibrate' in navigator) navigator.vibrate(20);

        toast(`Copiaste el día a ${targetDayNums.length} destinos`, {
            action: {
                label: "Deshacer",
                onClick: () => {
                    if (historyRef.current) form.setValue("rutinas", historyRef.current);
                    toast.success("Cambios revertidos");
                }
            }
        });
    }, [form, activeDiaAbsoluto, setIsBulkOpen, historyRef]);

    return {
        addExercise,
        addBlockToRoutine,
        removeExercise,
        moveExercise,
        handleDuplicateMulti
    };
}
