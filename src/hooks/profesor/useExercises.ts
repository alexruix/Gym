import { useLibraryState } from "./exercises/useLibraryState";
import { useLibraryOperations } from "./exercises/useLibraryOperations";
import { useLibrarySync } from "./exercises/useLibrarySync";

/**
 * useExercises: State engine for the "Living Cabinet" Exercise Library.
 * Orchestrates Search Intelligence, Hierarchical Awareness, and Sensory Mutations.
 */
export function useExercises(initialExercises: any[]) {
    // 1. Motor de Estado y Búsqueda (Jerarquía + Recencia)
    const {
        exercises,
        rawExercises,
        setExercises,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        setRecentIds,
        getVariantsOf
    } = useLibraryState(initialExercises);

    // 2. Motor de Operaciones y Sensorial
    const {
        toggleFavorite,
        deleteExercise,
        duplicateExercise,
        trackUsage
    } = useLibraryOperations(rawExercises, setExercises, setRecentIds);

    // 3. Motor de Sincronización (Consola Viva)
    const {
        isLoading,
        refreshData
    } = useLibrarySync(setExercises);

    return {
        // Data
        exercises,
        allExercises: rawExercises, 
        isLoading,

        // Filtering
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,

        // Intelligence
        getVariantsOf,
        trackUsage,

        // Actions
        refreshData,
        toggleFavorite,
        deleteExercise,
        duplicateExercise
    };
}
