import { useState, useCallback, useEffect } from "react";
import { actions } from "astro:actions";

/**
 * useLibrarySync: El "pulso" silencioso de la biblioteca.
 */
export function useLibrarySync(setExercises: (data: any[]) => void) {
    const [isLoading, setIsLoading] = useState(false);

    const refreshData = useCallback(async (silent = true) => {
        if (!silent) setIsLoading(true);
        try {
            const { data, error } = await actions.profesor.getExerciseLibrary();
            if (!error && data) {
                setExercises(data);
            }
        } catch (err) {
            console.error("[useLibrarySync] Refresh Failed:", err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [setExercises]);

    // Auto-refresh al recuperar foco (Consola Viva)
    useEffect(() => {
        const handleFocus = () => refreshData(true);
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [refreshData]);

    return {
        isLoading,
        refreshData
    };
}
