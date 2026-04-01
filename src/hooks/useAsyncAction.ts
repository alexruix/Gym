import { useState } from "react";
import { toast } from "sonner";

interface AsyncActionOptions {
    /** Mensaje mostrado mientras se ejecuta (en el toast de loading) */
    loadingMsg?: string;
    /** Mensaje de éxito automático. Si no se pasa, el caller maneja el toast de éxito. */
    successMsg?: string;
    /** Si es true, recarga la página al completar con éxito */
    reloadOnSuccess?: boolean;
}

/**
 * useAsyncAction: Envuelve cualquier acción async con manejo automático de
 * estado de carga y notificaciones.
 *
 * REGLA DE ORO: El patrón `isPending + setIsPending + try/catch + toast.loading/dismiss`
 * apareció en 6+ componentes (Security, Profile, PlanForm, StudentEdit, InviteStudent, Workspace).
 * Esta es la mayor fuente de deuda técnica del proyecto.
 *
 * Uso:
 * ```tsx
 * const { execute, isPending } = useAsyncAction();
 *
 * const handleDelete = () => execute(
 *   async () => {
 *     const { error } = await actions.profesor.deleteStudent({ id });
 *     if (error) throw error;
 *   },
 *   { loadingMsg: "Archivando...", successMsg: "Alumno archivado", reloadOnSuccess: true }
 * );
 * ```
 */
export function useAsyncAction() {
    const [isPending, setIsPending] = useState(false);

    const execute = async (
        action: () => Promise<void>,
        options: AsyncActionOptions = {}
    ) => {
        const { loadingMsg, successMsg, reloadOnSuccess = false } = options;

        if (isPending) return; // Evitar doble-click
        setIsPending(true);

        let toastId: string | number | undefined;
        if (loadingMsg) {
            toastId = toast.loading(loadingMsg);
        }

        try {
            await action();

            if (toastId !== undefined) toast.dismiss(toastId);
            if (successMsg) toast.success(successMsg);
            if (reloadOnSuccess) window.location.reload();
        } catch (err: any) {
            if (toastId !== undefined) toast.dismiss(toastId);
            toast.error(err?.message || "Ocurrió un error inesperado.");
        } finally {
            setIsPending(false);
        }
    };

    return { execute, isPending };
}
