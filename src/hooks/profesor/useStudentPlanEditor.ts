import { useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { usePlanState } from "./editor/usePlanState";
import { usePlanSelectors } from "./editor/usePlanSelectors";
import { usePlanOperations } from "./editor/usePlanOperations";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import type { AssignedPlanMetric as AssignedPlan } from "@/types/student";

/**
 * useStudentPlanEditor: Fachada refinada para la edición de planes asignados a alumnos.
 * Maneja la distinción entre "Master Plan" (Overrides) y "Plan Bifurcado" (Edición Directa).
 */
export function useStudentPlanEditor(alumnoId: string, initialPlan: AssignedPlan | null, library: any[]) {
  
  // 1. Motor de Estado
  const {
    localPlan,
    setLocalPlan,
    openRutinas,
    studentSearch,
    activeRoutineTarget,
    setActiveRoutineTarget,
    isInteracting,
    isDirty,
    toggleRutina
  } = usePlanState<AssignedPlan | null>(initialPlan);

  // Guardián de Navegación: Proteger cambios no guardados en el plan del alumno
  useNavigationGuard({ enabled: isDirty });

  // 2. Motor de Operaciones (Mutaciones de Estructura)
  const { 
    getUpdatePayload, 
    removeExercise: coreRemove, 
    addExercise: coreAdd,
    addBlockToRoutine: coreAddBlock,
    reorderExercise: coreReorder,
    duplicateRoutine,
    deleteRoutine
  } = usePlanOperations(localPlan, setLocalPlan, isInteracting);


  // 3. Motor de Selectores (Vista)
  const { groupedRoutines } = usePlanSelectors(localPlan, studentSearch);

  // --- Mutaciones de Métricas (Específico de Alumnos) ---

  const updateExerciseMetrics = useCallback(async (ejercicioPlanId: string, updates: any) => {
    if (!localPlan) return;
    isInteracting.current = true;

    // Optimismo local inmediato
    setLocalPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        rutinas_diarias: prev.rutinas_diarias.map(r => ({
          ...r,
          ejercicios_plan: r.ejercicios_plan.map(e => 
            e.id === ejercicioPlanId ? { ...e, ...updates } : e
          )
        }))
      };
    });

    try {
      if (localPlan.is_template) {
        // --- MASTER: Upsert Personalización ---
        const { error } = await actions.profesor.upsertStudentMetricOverride({
          alumno_id: alumnoId,
          ejercicio_plan_id: ejercicioPlanId,
          ...updates
        });
        if (error) throw error;
        toast.success("Ajuste guardado", { icon: "🎯" });
      } else {
        // --- FORK: Update Plan Completo ---
        // (Nota: En un fork, guardamos todo el plan por consistencia de IDs)
        const payload = getUpdatePayload({ ...localPlan });
        const { error } = await actions.profesor.updatePlan(payload as any);
        if (error) throw error;
        toast.success("Métricas actualizadas");
      }
    } catch (err) {
      console.error("[useStudentPlanEditor] Mutation failed:", err);
      toast.error("Error al guardar cambios");
      setLocalPlan(initialPlan); // Rollback
    } finally {
      isInteracting.current = false;
    }
  }, [localPlan, alumnoId, initialPlan, getUpdatePayload]);

  // --- Operaciones Estructurales sin Reload ---

  const addExercise = useCallback(async (rutinaId: string, exId: string) => {
    const libraryExercise = library.find(e => e.id === exId);
    if (!libraryExercise) return;

    const updatedPlan = await coreAdd(rutinaId, libraryExercise);
    
    try {
       const payload = getUpdatePayload(updatedPlan);
       const { error } = await actions.profesor.updatePlan(payload as any);
       if (error) throw error;
    } catch (err) {
       toast.error("Error al persistir ejercicio");
       setLocalPlan(initialPlan);
    }
  }, [coreAdd, getUpdatePayload, initialPlan, library]);

  const addBlock = useCallback(async (rutinaId: string, blockId: string) => {
     try {
       const { data: blocks } = await actions.profesor.getBlocks();
       const block = Array.isArray(blocks) ? (blocks as any[]).find(b => b.id === blockId) : null;
       if (!block) throw new Error("Bloque no encontrado");

       const updatedPlan = await coreAddBlock(rutinaId, block);

       const payload = getUpdatePayload(updatedPlan);
       const { error } = await actions.profesor.updatePlan(payload as any);
       if (error) throw error;
     } catch (err) {
       console.error("[useStudentPlanEditor] Add block failed:", err);
       toast.error("Error al importar bloque");
     }
  }, [coreAddBlock, getUpdatePayload, initialPlan]);

  const removeExercise = useCallback(async (exerciseId: string) => {
    if (!localPlan) return;
    const routine = localPlan.rutinas_diarias.find((r: any) => 
      r.ejercicios_plan.some((e: any) => e.id === exerciseId)
    );
    if (!routine) return;

    const updatedPlan = await coreRemove(routine.id, exerciseId);
    try {
       const payload = getUpdatePayload(updatedPlan);
       const { error } = await actions.profesor.updatePlan(payload as any);
       if (error) throw error;
    } catch (err) {
       toast.error("Error al persistir borrado");
       setLocalPlan(initialPlan);
    }
  }, [localPlan, coreRemove, getUpdatePayload, initialPlan]);

  const moveExercise = useCallback(async (ejercicioId: string, direction: "up" | "down") => {
    if (!localPlan) return;
    const routine = localPlan.rutinas_diarias.find((r: any) => 
      r.ejercicios_plan.some((e: any) => e.id === ejercicioId)
    );
    if (!routine) return;

    const updatedPlan = await coreReorder(routine.id, ejercicioId, direction);
    try {
       const payload = getUpdatePayload(updatedPlan);
       const { error } = await actions.profesor.updatePlan(payload as any);
       if (error) throw error;
    } catch (err) {
       toast.error("Error al mover ejercicio");
       setLocalPlan(initialPlan);
    }
  }, [localPlan, coreReorder, getUpdatePayload, initialPlan]);

  // --- Promoción de Plan ---
  const promotePlan = useCallback(async () => {
    if (!localPlan) return;
    try {
      const { data, error } = await actions.profesor.promotePlan({ id: localPlan.id });
      if (error) throw error;
      toast.success(data.mensaje);
      window.location.reload(); // Promoción sí requiere reload para cambiar contexto de página
    } catch (err) {
      toast.error("Error al promocionar plan");
    }
  }, [localPlan]);

  return {
    plan: localPlan,
    setPlan: setLocalPlan,
    openRutinas,
    activeRoutineTarget,
    setActiveRoutineTarget,
    selectors: {
      groupedRoutines,
      getGroupedExercises: (ejs: any[]) => {
         // Lógica simple de agrupación (se puede mover a un utils si crece)
         const groups: any[] = [];
         let currentGroup: any = { id: null, nombre: null, exercises: [] };

         ejs.forEach(ex => {
            if (ex.grupo_bloque_id) {
               if (currentGroup.id !== ex.grupo_bloque_id) {
                  if (currentGroup.exercises.length > 0) groups.push(currentGroup);
                  currentGroup = { id: ex.grupo_bloque_id, nombre: ex.grupo_nombre, exercises: [ex] };
               } else {
                  currentGroup.exercises.push(ex);
               }
            } else {
               if (currentGroup.id !== null) {
                  groups.push(currentGroup);
                  currentGroup = { id: null, nombre: null, exercises: [ex] };
               } else {
                  currentGroup.exercises.push(ex);
               }
            }
         });
         if (currentGroup.exercises.length > 0) groups.push(currentGroup);
         return groups;
      }
    },
    actions: {
      toggleRutina,
      updateExerciseMetrics,
      deleteExercise: removeExercise,
      addExercise,
      addBlock,
      moveExercise,
      promotePlan,
      duplicateRoutine: async (rutinaId: string) => {
        const updatedPlan = await duplicateRoutine(rutinaId);
        try {
           const payload = getUpdatePayload(updatedPlan);
           const { error } = await actions.profesor.updatePlan(payload as any);
           if (error) throw error;
        } catch (err) {
           toast.error("Error al persistir duplicado");
           setLocalPlan(initialPlan);
        }
      },
      deleteRoutine: async (rutinaId: string) => {
        const updatedPlan = await deleteRoutine(rutinaId);
        try {
           const payload = getUpdatePayload(updatedPlan);
           const { error } = await actions.profesor.updatePlan(payload as any);
           if (error) throw error;
        } catch (err) {
           toast.error("Error al persistir eliminación");
           setLocalPlan(initialPlan);
        }
      },
      updateStudentDates: async (dates: { fecha_inicio?: Date; fecha_fin?: Date | null }) => {

        try {
          const { error } = await actions.profesor.updateStudent({
            id: alumnoId,
            ...dates
          });
          if (error) throw error;
          toast.success("Vigencia del plan actualizada");
        } catch (err) {
          toast.error("Error al actualizar fechas");
        }
      }
    }
  };
}
