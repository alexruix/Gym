import { useState } from "react";

/**
 * useAccordion: Maneja el estado abierto/cerrado de múltiples acordeones.
 *
 * REGLA DE ORO: Usado en PlanDetail.tsx y StudentRoutineWorkspace.tsx.
 * Centraliza la lógica de Set<string> que antes se duplicaba en ambos.
 */
export function useAccordion(initialOpenIds: string[] = []) {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set(initialOpenIds));

    const toggleItem = (id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const isOpen = (id: string) => openIds.has(id);

    const openAll = (ids: string[]) => setOpenIds(new Set(ids));

    const closeAll = () => setOpenIds(new Set());

    return { openIds, toggleItem, isOpen, openAll, closeAll };
}
