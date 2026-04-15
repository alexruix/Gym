import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { exerciseLibrarySchema, type ExerciseLibraryFormData } from "@/lib/validators";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Props {
    initialValues?: Partial<ExerciseLibraryFormData>;
    onSuccess?: (data: any) => void;
    successHref?: string;
}

/**
 * useExerciseForm: Lógica de negocio para la biblioteca de ejercicios.
 * Simplifica el manejo de colecciones (tags, variants) y fork de ejercicios de sistema.
 */
export function useExerciseForm({ initialValues, onSuccess, successHref }: Props) {
    const { execute, isPending } = useAsyncAction();
    const [tagInput, setTagInput] = useState("");
    const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);
    const [variantInput, setVariantInput] = useState("");

    const form = useForm<ExerciseLibraryFormData>({
        resolver: zodResolver(exerciseLibrarySchema) as any,
        defaultValues: {
            id: initialValues?.id,
            parent_id: initialValues?.parent_id || undefined,
            nombre: initialValues?.nombre ?? "",
            descripcion: initialValues?.descripcion ?? "",
            media_url: initialValues?.media_url ?? "",
            video_url: (initialValues as any)?.video_url ?? "",
            tags: initialValues?.tags ?? [],
            is_template_base: initialValues?.is_template_base ?? false,
            is_favorite: initialValues?.is_favorite ?? false,
            usage_count: initialValues?.usage_count ?? 0,
            variants: [],
        } as ExerciseLibraryFormData,
    });

    const parentId = form.watch("parent_id");
    const isBaseExercise = !parentId || parentId === "none";

    const onSubmit: SubmitHandler<ExerciseLibraryFormData> = (values) => {
        execute(async () => {
            const finalValues = {
                ...values,
                is_template_base: !values.parent_id || values.parent_id === "none"
            };

            const { data: result, error } = values.id
                ? await actions.profesor.updateExercise(finalValues as any)
                : await actions.profesor.createExercise(finalValues as any);

            if (error || !result) throw error || new Error("Error desconocido");

            onSuccess?.(result);

            if (!values.id) {
                form.reset();
                setTagInput("");
                setVariantInput("");
            }
        }, {
            loadingMsg: values.id ? "Guardando cambios..." : "Creando ejercicio...",
            successHref
        });
    };

    const addTag = (tag: string) => {
        const currentTags = form.getValues("tags") || [];
        const lowerTag = tag.trim().toLowerCase();
        if (lowerTag && !currentTags.includes(lowerTag) && currentTags.length < 6) {
            form.setValue("tags", [...currentTags, lowerTag], { shouldValidate: true });
            return true;
        }
        return false;
    };

    const toggleTag = (tag: string) => {
        const currentTags = form.getValues("tags") || [];
        const lowerTag = tag.toLowerCase();
        if (currentTags.includes(lowerTag)) {
            form.setValue("tags", currentTags.filter(t => t !== lowerTag), { shouldValidate: true });
        } else if (currentTags.length < 6) {
            form.setValue("tags", [...currentTags, lowerTag], { shouldValidate: true });
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags") || [];
        form.setValue("tags", currentTags.filter(t => t !== tagToRemove), { shouldValidate: true });
    };

    const addVariant = (name: string) => {
        const currentVariants = form.getValues("variants") || [];
        const entry = name.trim();
        if (entry && !currentVariants.includes(entry)) {
            form.setValue("variants", [...currentVariants, entry], { shouldValidate: true });
            return true;
        }
        return false;
    };

    const removeVariant = (variantToRemove: string) => {
        const currentVariants = form.getValues("variants") || [];
        form.setValue("variants", currentVariants.filter(v => v !== variantToRemove), { shouldValidate: true });
    };

    return {
        form,
        isPending,
        isBaseExercise,
        tagInput,
        setTagInput,
        isCreatingNewTag,
        setIsCreatingNewTag,
        variantInput,
        setVariantInput,
        addTag,
        toggleTag,
        removeTag,
        addVariant,
        removeVariant,
        onSubmit: form.handleSubmit(onSubmit)
    };
}
