import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { blockSchema, type BlockFormData } from "@/lib/validators/profesor";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { blocksCopy } from "@/data/es/profesor/ejercicios";

interface Props {
    library: any[];
    initialData?: any;
    onSuccess?: (data: any) => void;
}

/**
 * useBlockForm: Hook para orquestar la creación/edición de bloques técnicos.
 * Extraído de BlockForm.tsx para reducir la latencia del componente visual.
 */
export function useBlockForm({ library, initialData, onSuccess }: Props) {
    const { execute, isPending } = useAsyncAction();
    const isEditing = !!initialData?.id;
    const copy = blocksCopy.form;

    const form = useForm<BlockFormData>({
        resolver: zodResolver(blockSchema) as any,
        defaultValues: initialData ? {
            id: initialData.id,
            nombre: initialData.nombre,
            tipo_bloque: initialData.tipo_bloque,
            vueltas: initialData.vueltas,
            descanso_final: initialData.descanso_final,
            tags: initialData.tags || [],
            ejercicios: initialData.bloques_ejercicios?.map((be: any) => ({
                ejercicio_id: be.ejercicio_id,
                orden: be.orden,
                series: be.series,
                reps_target: be.reps_target,
                descanso_seg: be.descanso_seg,
                notas: be.notas || ""
            })) || []
        } : {
            nombre: "",
            ejercicios: [],
            tags: [],
            tipo_bloque: "agrupador",
            vueltas: 1,
            descanso_ronda: 0,
            descanso_final: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ejercicios",
    });

    // Búsqueda integrada
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLibrary = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return library
            .filter(ex => ex.nombre.toLowerCase().includes(lower))
            .slice(0, 10);
    }, [library, searchTerm]);

    const addExercise = (exerciseId: string) => {
        append({
            ejercicio_id: exerciseId,
            orden: fields.length,
            series: 3,
            reps_target: "12",
            descanso_seg: 60,
            notas: ""
        });
        setIsSearching(false);
        setSearchTerm("");
    };

    const onSubmit = (values: BlockFormData) => {
        if (values.ejercicios.length === 0) {
            toast.error("El bloque debe tener al menos un ejercicio");
            return;
        }

        execute(async () => {
            const action = isEditing ? actions.profesor.updateBlock : actions.profesor.createBlock;
            const { data: result, error } = await action(values as any);

            if (error || !result) {
                throw error || new Error("Error al procesar el bloque");
            }

            onSuccess?.(isEditing ? { ...values, id: initialData.id } : result);
        }, {
            loadingMsg: isEditing ? "Actualizando bloque..." : "Creando bloque...",
            successMsg: isEditing ? "✅ Bloque actualizado" : copy.messages.success,
        });
    };

    return {
        form,
        fields,
        remove,
        addExercise,
        isPending,
        search: {
            isSearching,
            setIsSearching,
            searchTerm,
            setSearchTerm,
            filteredLibrary
        },
        onSubmit: form.handleSubmit(onSubmit),
        isEditing
    };
}
