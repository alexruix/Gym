import { useCallback } from "react";
import { actions } from "astro:actions";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";
import type { Turno } from "@/types/agenda";

interface SuccessEvent {
    type: 'upsert' | 'delete';
    turno?: Turno;
    id?: string;
}

/**
 * useTurnoOperations: Motor de alta velocidad para la gestión de turnos.
 */
export function useTurnoOperations(
    editingId: string | null,
    setEditingId: (id: string | null) => void,
    execute: any,
    onSuccess?: (event: SuccessEvent) => void
) {

    // 1. Operación de Eliminación (Higiene de Agenda)
    const deleteFlow = useDeleteWithConfirm<Turno>({
        onDelete: async (turno) => {
            const { error } = await actions.profesor.deleteTurno({ id: turno.id });
            if (error) throw error;
            
            if (onSuccess) {
                onSuccess({ type: 'delete', id: turno.id });
            }
        },
        loadingMsg: "Eliminando turno...",
        successMsg: "Turno borrado",
        reloadOnSuccess: false,
    });

    // 2. Operación de Guardado (Alta Velocidad < 300ms)
    const handleSave = useCallback((data: any) => {
        execute(
            async () => {
                const isNew = editingId === "new";
                const payload = isNew ? data : { ...data, id: editingId };
                
                const { data: result, error } = await actions.profesor.upsertTurno(payload);
                if (error) throw error;

                // Feedback Sensorial PWA Consistente
                if ('vibrate' in navigator) navigator.vibrate(10);

                // Disparo inmediato de éxito para percepción de instantaneidad
                if (onSuccess && result?.turno) {
                    onSuccess({ type: 'upsert', turno: result.turno as Turno });
                }
                
                setEditingId(null);
            },
            {
                loadingMsg: "Estamos anotando el turno...",
                successMsg: editingId === "new" ? "Listo, turno agendado" : "Guardaste los cambios",
                reloadOnSuccess: false,
            }
        );
    }, [editingId, setEditingId, execute, onSuccess]);

    const handleAdd = useCallback(() => {
        setEditingId("new");
    }, [setEditingId]);

    const handleEdit = useCallback((id: string) => {
        setEditingId(id);
    }, [setEditingId]);

    const handleCancel = useCallback(() => {
        setEditingId(null);
    }, [setEditingId]);

    return {
        handleSave,
        handleAdd,
        handleEdit,
        handleCancel,
        deleteFlow
    };
}
