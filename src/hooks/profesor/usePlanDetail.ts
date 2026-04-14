import { useRef, useCallback, useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePlanState } from "./editor/usePlanState";
import { usePlanSelectors } from "./editor/usePlanSelectors";
import { usePlanOperations } from "./editor/usePlanOperations";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import type { PlanData, AlumnoDePlan } from "@/types/planes";

interface UsePlanDetailProps {
  initialPlan: PlanData;
  library: any[];
}

/**
 * usePlanDetail: Fachada delgada para la gestión de Planes Maestros.
 * Utiliza el motor modular y añade persistencia por AutoSave.
 */
export function usePlanDetail({ initialPlan, library }: UsePlanDetailProps) {
  // 1. Estado y UI (Gabinete de Estado)
  const [isDuplicating, setIsDuplicating] = useState(false);
  const {
    localPlan,
    setLocalPlan,
    openRutinas,
    studentSearch,
    setStudentSearch,
    activeRoutineTarget,
    setActiveRoutineTarget,
    isInteracting,
    isDirty,
    toggleRutina
  } = usePlanState<PlanData>(initialPlan);

  // Guardián de Navegación: Proteger cambios no guardados
  useNavigationGuard({ enabled: isDirty });

  // 2. Operaciones (Motor de Mutaciones)
  const { 
    getUpdatePayload, 
    removeExercise: coreRemove, 
    addExercise: coreAdd,
    addBlockToRoutine: coreAddBlock 
  } = usePlanOperations(localPlan, setLocalPlan, isInteracting);

  // 3. Selectores (Lógica de Vista)
  const { 
    formattedCreatedDate, 
    activeStudents, 
    groupedRoutines 
  } = usePlanSelectors(localPlan, studentSearch);

  // 4. Persistencia: AutoSave (Configuración Industrial)
  const { status: syncStatus, retryCount, setStatus: setSyncStatus, setRetryCount } = useAutoSave({
    data: localPlan,
    onSave: async (plan) => {
      const payload = getUpdatePayload(plan);
      const { error } = await actions.profesor.updatePlan(payload);
      if (error) throw error;
    }
  });

  // --- Handlers Específicos ---

  const addExercise = (exerciseId: string) => {
    if (!activeRoutineTarget) return;
    const exercise = library.find(ex => ex.id === exerciseId);
    if (exercise) {
      coreAdd(activeRoutineTarget, exercise);
      setActiveRoutineTarget(null);
    }
  };

  const addBlockToRoutine = (block: any) => {
    if (!activeRoutineTarget) return;
    coreAddBlock(activeRoutineTarget, block);
    setActiveRoutineTarget(null);
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    toast.loading("Duplicando plan...");
    try {
      const { data: result, error } = await actions.profesor.duplicatePlan({ id: localPlan.id });
      if (error) {
        toast.error(error.message || "Error al duplicar");
        return;
      }
      if (result?.success) {
        toast.dismiss();
        toast.success(result.mensaje);
        window.location.href = `/profesor/planes/${result.plan_id}/edit`;
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleAssignmentSuccess = (newAssignedStudents: any[]) => {
    setLocalPlan(prev => ({
      ...prev,
      alumnos: newAssignedStudents.map(s => ({
        id: s.id,
        nombre: s.name,
        email: s.email,
        estado: s.estado || 'activo'
      }))
    }));
  };

  return {
    localPlan,
    syncStatus,
    retryCount,
    openRutinas,
    isDuplicating,
    studentSearch,
    selectors: {
      createdDate: formattedCreatedDate,
      activeStudents,
      groupedRoutines,
    },
    setters: {
      setStudentSearch,
      setSyncStatus,
      setRetryCount,
      setActiveRoutineTarget,
    },
    actions: {
      toggleRutina,
      removeExercise: coreRemove,
      addExercise,
      addBlockToRoutine,
      handleDuplicate,
      handleAssignmentSuccess,
    }
  };
}
