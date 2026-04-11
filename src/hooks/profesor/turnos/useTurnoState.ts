import { useState, useCallback } from "react";

/**
 * useTurnoState: Memoria reactiva de la Agenda Industrial.
 */
export function useTurnoState() {
    const [editingId, setEditingId] = useState<string | null>(null);

    const resetState = useCallback(() => {
        setEditingId(null);
    }, []);

    return {
        editingId,
        setEditingId,
        resetState
    };
}
