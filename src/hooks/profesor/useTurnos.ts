import { useTurnoState } from "./turnos/useTurnoState";
import { useTurnoOperations } from "./turnos/useTurnoOperations";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { Turno } from "@/types/agenda";

interface SuccessEvent {
  type: 'upsert' | 'delete';
  turno?: Turno;
  id?: string;
}

interface UseTurnosOptions {
  initialTurnos: Turno[]; // Conservado por compatibilidad de firma, aunque se gestiona externamente
  onSuccess?: (event: SuccessEvent) => void;
}

/**
 * useTurnos: Motor de Gestión de Agenda Industrial.
 * Orquesta el estado de edición (MEMORIA) y el CRUD de alta velocidad (OPERACIONES).
 * Optimizado para percepción de instantaneidad (<300ms) y feedback sensorial PWA.
 */
export function useTurnos({ initialTurnos, onSuccess }: UseTurnosOptions) {
    const { execute, isPending } = useAsyncAction();

    // 1. Memoria de Agenda (Estado de Edición y Limpieza)
    const { 
        editingId, 
        setEditingId 
    } = useTurnoState();

    // 2. Motor de Alta Velocidad (Operaciones: CRUD e Instantaneidad)
    const { 
        handleSave, 
        handleAdd, 
        handleEdit, 
        handleCancel, 
        deleteFlow 
    } = useTurnoOperations(editingId, setEditingId, execute, onSuccess);

    return {
        // State
        editingId,
        isPending,

        // Actions
        handleEdit,
        handleCancel,
        handleSave,
        handleAdd,
        
        // Modules
        deleteFlow
    };
}
