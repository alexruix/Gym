import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { planSchema } from "@/lib/validators";
import { planesCopy } from "@/data/es/profesor/planes";
import { blocksCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { useAsyncAction } from "@/hooks/useAsyncAction";

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

export function usePlanForm({ library, initialValues, onSuccess }: UsePlanFormProps) {
    const [activeDiaAbsoluto, setActiveDiaAbsoluto] = useState<number>(1);
    const [localLibrary, setLocalLibrary] = useState<Exercise[]>(library);
    const [rotationEditing, setRotationEditing] = useState<{ routineIdx: number; exerciseIdx: number } | null>(null);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isBlockSearchOpen, setIsBlockSearchOpen] = useState(false);
    const [isAddElementOpen, setIsAddElementOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    
    // Undo Support
    const historyRef = useRef<any>(null);

    const { execute, isPending } = useAsyncAction();

    const form = useForm<any>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            id: initialValues?.id,
            nombre: initialValues?.nombre || "",
            descripcion: initialValues?.descripcion || "",
            duracion_semanas: initialValues?.duracion_semanas || 1,
            is_template: initialValues?.is_template ?? true,
            rutinas: initialValues?.rutinas || Array.from({ length: 84 }, (_, i) => ({
                dia_numero: i + 1,
                nombre_dia: `Día ${i + 1}`,
                ejercicios: [],
            })),
            rotaciones: initialValues?.rotaciones || [],
        },
    });

    const rutinasWatch = useWatch({
        control: form.control,
        name: "rutinas",
    });

    const stats = useMemo(() => {
        const uniqueDays = new Set<number>();
        let totalEjercicios = 0;
        rutinasWatch?.forEach(r => {
            const c = r.ejercicios?.length || 0;
            if (c > 0) {
                uniqueDays.add(((r.dia_numero - 1) % 7) + 1);
                totalEjercicios += c;
            }
        });
        return { 
            activeDaysCount: uniqueDays.size,
            totalEjercicios,
            isValid: uniqueDays.size > 0 && form.watch("nombre")?.length >= 3
        };
    }, [rutinasWatch, form.watch("nombre")]);

    const numWeeks = form.watch("duracion_semanas") || 1;

    // Sincronizar frecuencia semanal
    useEffect(() => {
        form.setValue("frecuencia_semanal", stats.activeDaysCount);
    }, [stats.activeDaysCount, form]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            // Teclado Industrial: 'S' para cambiar de semana, 'D' para cambiar de dÃa
            if (e.key === "s" || e.key === "S") {
                const nextWeek = (currentWeek % numWeeks) + 1;
                setCurrentWeek(nextWeek);
                setActiveDiaAbsoluto((nextWeek - 1) * 7 + 1);
            }
            if (e.key === "d" || e.key === "D") {
                const nextDia = (activeDiaAbsoluto % (numWeeks * 7)) + 1;
                if (Math.ceil(nextDia / 7) !== currentWeek) setCurrentWeek(Math.ceil(nextDia / 7));
                setActiveDiaAbsoluto(nextDia);
            }
            if (e.key === "Enter" && e.ctrlKey) {
                if (stats.isValid) form.handleSubmit(onSubmit)();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentWeek, numWeeks, activeDiaAbsoluto, stats.isValid]);

    const onSubmit = async (data: any) => {
        await execute(async () => {
            const maxDay = numWeeks * 7;
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

    const addExercise = (exerciseId: string) => {
        const routineIdx = activeDiaAbsoluto - 1;
        const currentExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`) || [];
        
        // FIX CRÃ TICO: Usamos un entero de 9 dÃgitos para evitar el Integer Overflow en la DB (LÃmite 2.1B)
        const position = Math.floor(Math.random() * 1000000000);
        
        const newExercise = {
            ejercicio_id: exerciseId, 
            series: 3, 
            reps_target: "12", 
            descanso_seg: 60, 
            orden: currentExercises.length, 
            exercise_type: "base" as const, 
            position, 
            peso_target: ""
        };
        
        form.setValue(`rutinas.${routineIdx}.ejercicios`, [...currentExercises, newExercise]);
        setIsSearchOpen(false);
    };

    const addBlockToRoutine = (block: any) => {
        const routineIdx = activeDiaAbsoluto - 1;
        const currentExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`) || [];
        
        const newExercises = (block.bloques_ejercicios || []).map((item: any, idx: number) => ({
            ejercicio_id: item.ejercicio_id,
            series: item.series,
            reps_target: item.reps_target,
            descanso_seg: item.descanso_seg,
            orden: currentExercises.length + idx,
            exercise_type: "base" as const,
            position: Math.floor(Math.random() * 1000000000),
            peso_target: "",
            grupo_bloque_id: block.id,
            grupo_nombre: block.nombre
        }));
        
        form.setValue(`rutinas.${routineIdx}.ejercicios`, [...currentExercises, ...newExercises]);
        setIsBlockSearchOpen(false);
        toast.success(`Bloque "${block.nombre}" importado`);
    };

    const saveDayAsBlock = async () => {
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

            const { data, error } = await actions.profesor.createBlock(payload);
            if (error) throw error;
        }, {
            successMsg: blocksCopy.form.messages.success
        });
    };

    const removeExercise = (ri: number, ei: number) => {
        const updated = [...form.getValues(`rutinas.${ri}.ejercicios`)];
        updated.splice(ei, 1);
        form.setValue(`rutinas.${ri}.ejercicios`, updated);
    };

    const handleDuplicateMulti = (targetDayNums: number[]) => {
        historyRef.current = JSON.parse(JSON.stringify(form.getValues("rutinas")));
        const rutinas = form.getValues("rutinas");
        const sourceRoutine = rutinas[activeDiaAbsoluto - 1];
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
        
        toast(`${targetDayNums.length} ${targetDayNums.length === 1 ? 'Día duplicado' : 'Días duplicados'} correctamente`, {
            action: {
                label: "Deshacer",
                onClick: () => {
                    if (historyRef.current) form.setValue("rutinas", historyRef.current);
                    toast.success("Cambios revertidos");
                }
            }
        });
    };

    const handleExerciseCreated = (newEx: any) => {
        // Al crearse inline, el profesor_id será el del usuario actual (no null)
        setLocalLibrary(prev => [{ 
            id: newEx.id, 
            nombre: newEx.nombre, 
            media_url: newEx.media_url || null,
            profesor_id: "user_owned" // Marcamos como propio para que el filtro "Propios" lo capture
        }, ...prev]); 
        addExercise(newEx.id); 
    };

    const handleSetRotation = (altId: string, dur: number) => {
        const ri = rotationEditing!.routineIdx; 
        const ei = rotationEditing!.exerciseIdx;
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
    };

    const handleRemoveRotationExercise = (p: number, id: string) => {
        const updated = form.getValues("rotaciones")
            .map((rot: any) => rot.position === p ? ({ ...rot, cycles: rot.cycles.map((c: any) => ({ ...c, exercises: c.exercises.filter((exid: string) => exid !== id) })) }) : rot)
            .filter((rot: any) => rot.cycles[0].exercises.length > 1);
        form.setValue("rotaciones", updated);
    };

    const getExerciseName = (id: string) => localLibrary.find(e => e.id === id)?.nombre || "Ejercicio";

    return {
        form,
        stats,
        isPending,
        activeDiaAbsoluto,
        setActiveDiaAbsoluto,
        currentWeek,
        setCurrentWeek,
        numWeeks,
        localLibrary,
        isSearchOpen,
        setIsSearchOpen,
        isBlockSearchOpen,
        setIsBlockSearchOpen,
        isAddElementOpen,
        setIsAddElementOpen,
        isBulkOpen,
        setIsBulkOpen,
        rotationEditing,
        setRotationEditing,
        actions: {
            onSubmit: form.handleSubmit(onSubmit),
            addExercise,
            addBlockToRoutine,
            saveDayAsBlock,
            removeExercise,
            handleDuplicateMulti,
            handleExerciseCreated,
            handleSetRotation,
            handleRemoveRotationExercise,
            getExerciseName
        }
    };
}
