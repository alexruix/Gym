import { useState, useRef, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { planSchema } from "@/lib/validators";
import { planesCopy } from "@/data/es/profesor/planes";
import { blocksCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { useAsyncAction } from "@/hooks/useAsyncAction";

// Modular Hooks
import { useFormNavigation } from "./form/useFormNavigation";
import { useFormStats } from "./form/useFormStats";
import { useFormOperations } from "./form/useFormOperations";

interface Exercise {
    id: string;
    nombre: string;
    media_url: string | null;
    parent_id?: string | null;
    is_template_base?: boolean;
    profesor_id?: string | null;
}

interface UsePlanFormProps {
    library: Exercise[];
    initialValues?: any;
    onSuccess?: () => void;
}

/**
 * usePlanForm: Orquestador modular para la creación y edición de planes.
 */
export function usePlanForm({ library, initialValues, onSuccess }: UsePlanFormProps) {
    const [localLibrary, setLocalLibrary] = useState<Exercise[]>(library);
    const [rotationEditing, setRotationEditing] = useState<{ routineIdx: number; exerciseIdx: number } | null>(null);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    
    const historyRef = useRef<any>(null);
    const { execute, isPending } = useAsyncAction();

    // 1. React Hook Form Setup
    const form = useForm<any>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            id: initialValues?.id,
            nombre: initialValues?.nombre || "",
            descripcion: initialValues?.descripcion || "",
            duracion_semanas: initialValues?.duracion_semanas || 1,
            frecuencia_semanal: initialValues?.frecuencia_semanal || 3,
            is_template: initialValues?.is_template ?? true,
            rutinas: initialValues?.rutinas || Array.from({ length: 365 }, (_, i) => ({
                dia_numero: i + 1,
                nombre_dia: `Rutina ${i + 1}`,
                ejercicios: [],
            })),
            rotaciones: initialValues?.rotaciones || [],
        },
    });

    const rutinasWatch = useWatch({ control: form.control, name: "rutinas" });

    // 2. Motor de Estadísticas y Validación
    const { stats, effectiveNumWeeks, freqSemanal } = useFormStats(form, rutinasWatch);

    // 3. Motor de Navegación Industrial
    const {
        activeDiaAbsoluto, setActiveDiaAbsoluto,
        currentWeek, setCurrentWeek
    } = useFormNavigation({
        effectiveNumWeeks,
        freqSemanal,
        onSave: () => {
            if (stats.isValid) {
                form.handleSubmit(onSubmit, (errors: any) => {
                    console.error("Zod Validation Errors:", errors);
                    toast.error("Error de validación interna. Revisá la consola.");
                })();
            }
        }
    });

    // 4. Motor de Operaciones Estructurales
    const {
        addExercise,
        addBlockToRoutine,
        removeExercise,
        moveExercise,
        handleDuplicateMulti
    } = useFormOperations({
        form,
        activeDiaAbsoluto,
        historyRef,
        setIsBulkOpen
    });

    // --- Persistencia y Lógica de Negocio ---

    const onSubmit = async (data: any) => {
        await execute(async () => {
            const maxDay = (data.duracion_semanas === 0 ? 1 : data.duracion_semanas) * freqSemanal;
            const activeRoutines = data.rutinas.filter((r: any) => r.ejercicios.length > 0 && r.dia_numero <= maxDay);
            const payload = { ...data, rutinas: activeRoutines };
            
            const { data: result, error } = initialValues?.id
                ? await actions.profesor.updatePlan({ id: initialValues.id, ...payload })
                : await actions.profesor.createPlan(payload);
            
            if (error) throw error;
            
            if (result?.success) {
                if (onSuccess) onSuccess();
                else setTimeout(() => window.location.assign("/profesor/planes"), 1000);
            }
        }, {
            successMsg: planesCopy.form.messages.success || "Plan guardado correctamente"
        });
    };

    const saveDayAsBlock = useCallback(async () => {
        const routineIdx = activeDiaAbsoluto - 1;
        const routineExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`) || [];
        
        if (routineExercises.length === 0) {
            toast.error("El día no tiene ejercicios para guardar");
            return;
        }

        const blockName = window.prompt("Nombre del bloque:", `Bloque Día ${activeDiaAbsoluto}`);
        if (!blockName) return;

        await execute(async () => {
            const payload = {
                nombre: blockName,
                ejercicios: routineExercises.map((ex: any, idx: number) => ({
                    ejercicio_id: ex.ejercicio_id,
                    orden: idx,
                    series: ex.series,
                    reps_target: ex.reps_target,
                    descanso_seg: ex.descanso_seg,
                    notas: ex.notas
                }))
            };

            const { error } = await actions.profesor.createBlock(payload);
            if (error) throw error;
        }, { successMsg: blocksCopy.form.messages.success });
    }, [form, activeDiaAbsoluto, execute]);

    const handleExerciseCreated = useCallback((newEx: any) => {
        setLocalLibrary(prev => [{ 
            id: newEx.id, 
            nombre: newEx.nombre, 
            media_url: newEx.media_url || null,
            profesor_id: "user_owned" 
        }, ...prev]); 
        addExercise(newEx.id); 
    }, [addExercise]);

    const handleSetRotation = useCallback((altId: string, dur: number) => {
        if (!rotationEditing) return;
        const { routineIdx: ri, exerciseIdx: ei } = rotationEditing;
        const ex = form.getValues(`rutinas.${ri}.ejercicios.${ei}`);
        const currot = form.getValues("rotaciones") || [];
        const idx = currot.findIndex((r: any) => r.position === ex.position);
        
        if (idx >= 0) { 
            const updated = [...currot]; 
            updated[idx].cycles[0].exercises.push(altId); 
            form.setValue("rotaciones", updated); 
        } else { 
            form.setValue("rotaciones", [...currot, { 
                position: ex.position, 
                cycles: [{ duration_weeks: dur, exercises: [ex.ejercicio_id, altId] }] 
            }]); 
        }
        setRotationEditing(null);
    }, [form, rotationEditing]);

    const handleRemoveRotationExercise = useCallback((p: number, id: string) => {
        const updated = form.getValues("rotaciones")
            .map((rot: any) => rot.position === p ? ({ ...rot, cycles: rot.cycles.map((c: any) => ({ ...c, exercises: c.exercises.filter((exid: string) => exid !== id) })) }) : rot)
            .filter((rot: any) => rot.cycles[0].exercises.length > 1);
        form.setValue("rotaciones", updated);
    }, [form]);

    const getExerciseName = (id: string) => localLibrary.find(e => e.id === id)?.nombre || "Ejercicio";

    return {
        form,
        stats,
        isPending,
        activeDiaAbsoluto, setActiveDiaAbsoluto,
        currentWeek, setCurrentWeek,
        numWeeks: form.watch("duracion_semanas"),
        freqSemanal,
        localLibrary,
        actions: {
            onSubmit: form.handleSubmit(onSubmit, (err) => {
                console.error("Zod Submit Errors:", err);
                toast.error("Revisá los datos del plan, hay errores de validación.");
            }),
            addExercise,
            addBlockToRoutine,
            saveDayAsBlock,
            removeExercise,
            moveExercise,
            handleDuplicateMulti,
            handleExerciseCreated,
            handleSetRotation,
            handleRemoveRotationExercise,
            getExerciseName,
            isBulkOpen, setIsBulkOpen,
            rotationEditing, setRotationEditing,
        }
    };
}
