import { useState } from "react";
import { useAsyncAction } from "./useAsyncAction";

interface UseDeleteWithConfirmOptions<T> {
    /** Función de eliminación. Debe lanzar error si falla. */
    onDelete: (item: T) => Promise<void>;
    /** Mensaje de loading para el toast */
    loadingMsg?: string;
    /** Mensaje de éxito (si no se provee, el caller maneja el toast) */
    successMsg?: string;
    /** Si recargar la página tras éxito */
    reloadOnSuccess?: boolean;
}

/**
 * useDeleteWithConfirm: Maneja el flujo completo de eliminación con diálogo de confirmación.
 *
 * REGLA DE ORO: El patrón `isDeleting + itemToDelete + handleConfirmDelete`
 * apareció en ExerciseLibrary.tsx y PlanesDashboard.tsx.
 *
 * Uso:
 * ```tsx
 * const deleteFlow = useDeleteWithConfirm<Plan>({
 *   onDelete: async (plan) => {
 *     const { error } = await actions.profesor.deletePlan({ id: plan.id });
 *     if (error) throw error;
 *   },
 *   successMsg: "Plan eliminado",
 *   reloadOnSuccess: false // Manejamos el state localmente con onSuccessCallback
 * });
 *
 * // En el JSX:
 * <DeleteConfirmDialog
 *   isOpen={!!deleteFlow.itemToDelete}
 *   onOpenChange={(open) => !open && deleteFlow.clearItem()}
 *   onConfirm={deleteFlow.handleConfirm}
 *   isDeleting={deleteFlow.isPending}
 * />
 * ```
 */
export function useDeleteWithConfirm<T>({
    onDelete,
    loadingMsg = "Eliminando...",
    successMsg,
    reloadOnSuccess = false,
}: UseDeleteWithConfirmOptions<T>) {
    const [itemToDelete, setItemToDelete] = useState<T | null>(null);
    const { execute, isPending } = useAsyncAction();

    const handleConfirm = async () => {
        if (!itemToDelete) return;
        await execute(
            () => onDelete(itemToDelete),
            { loadingMsg, successMsg, reloadOnSuccess }
        );
        // Solo limpiamos si no recargamos (si recargamos, el estado ya no importa)
        if (!reloadOnSuccess) {
            setItemToDelete(null);
        }
    };

    const clearItem = () => setItemToDelete(null);

    return {
        itemToDelete,
        setItemToDelete,
        isPending,
        handleConfirm,
        clearItem,
    };
}
