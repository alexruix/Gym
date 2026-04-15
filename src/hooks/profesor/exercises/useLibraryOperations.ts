import { useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { trackExerciseUsage } from "@/lib/recency";
import type { Exercise } from "./useLibraryState";

/**
 * useLibraryOperations: Motor de mutaciones e inteligencia de recencia.
 */
export function useLibraryOperations(
    exercises: Exercise[], 
    setExercises: (val: any) => void,
    setRecentIds: (val: string[]) => void
) {

    // --- Inteligencia de Recencia ---
    const trackUsage = useCallback((id: string) => {
        trackExerciseUsage(id);
    }, []);

    // --- Acciones ---

    const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
        // Feedback Táctil: Ancla
        if ('vibrate' in navigator) navigator.vibrate(10);

        setExercises((prev: Exercise[]) => prev.map(ex => ex.id === id ? { ...ex, is_favorite: isFavorite } : ex));
        
        try {
            const { error } = await actions.profesor.toggleFavorite({ id, isFavorite });
            if (error) throw error;
            toast.success(isFavorite ? "Lo guardaste en favoritos" : "Quitado de favoritos");
        } catch (err) {
            toast.error("Error al actualizar favorito");
            setExercises((prev: Exercise[]) => prev.map(ex => ex.id === id ? { ...ex, is_favorite: !isFavorite } : ex));
        }
    }, [setExercises]);

    const deleteExercise = useCallback(async (id: string) => {
        const original = exercises.find(ex => ex.id === id);
        if (!original) return;

        // Feedback Táctil: Alerta Destructiva
        if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);

        setExercises((prev: Exercise[]) => prev.filter(ex => ex.id !== id));
        
        try {
            const { error } = await actions.profesor.deleteExercise({ id });
            if (error) throw error;
            toast.success("Borraste el ejercicio");
        } catch (err) {
            toast.error("No se pudo eliminar");
            setExercises((prev: Exercise[]) => [...prev, original].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        }
    }, [exercises, setExercises]);

    const duplicateExercise = useCallback(async (id: string) => {
        const ex = exercises.find(e => e.id === id);
        if (!ex) return;

        const toastId = toast.loading("Duplicando...");
        try {
            const { data: result, error } = await actions.profesor.createExercise({
                nombre: `${ex.nombre} (Copia)`,
                descripcion: ex.descripcion || "",
                media_url: ex.media_url || "",
                tags: ex.tags || [],
                parent_id: ex.parent_id || ex.id 
            });

            if (error) throw error;
            if (result?.exercise) {
                setExercises((prev: Exercise[]) => [...prev, result.exercise as Exercise].sort((a, b) => a.nombre.localeCompare(b.nombre)));
                toast.success("¡Listo! Ya tenés tu copia", { id: toastId });
            }
        } catch (err) {
            toast.error("Error al duplicar", { id: toastId });
        }
    }, [exercises, setExercises]);

    return {
        toggleFavorite,
        deleteExercise,
        duplicateExercise,
        trackUsage
    };
}
