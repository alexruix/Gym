import { useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import type { PlanData, RutinaDiaria, EjercicioPlan } from "@/types/planes";

/**
 * usePlanOperations: Lógica de mutación centralizada para el motor de edición.
 * Implementa Optimistic Updates y construcción de payloads (DRY).
 */
export function usePlanOperations(
  plan: any, 
  setPlan: (p: any) => void,
  isInteracting?: React.MutableRefObject<boolean>
) {

  // 1. Helper: Mapear estado local a Payload de Servidor (PlanSchema)
  const getUpdatePayload = useCallback((currentPlan: any) => {
    const routines = currentPlan.rutinas || currentPlan.rutinas_diarias || [];
    
    return {
      id: currentPlan.id,
      nombre: currentPlan.nombre,
      duracion_semanas: currentPlan.duracion_semanas,
      frecuencia_semanal: currentPlan.frecuencia_semanal,
      rutinas: routines.map((r: any) => ({
        dia_numero: r.dia_numero,
        nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
        ejercicios: (r.ejercicios_plan || r.ejercicios || [])
          .filter((e: any) => e.biblioteca_ejercicios?.id || e.ejercicio_id)
          .map((e: any, idx: number) => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || e.ejercicio_id,
            series: e.series ?? 3,
            reps_target: e.reps_target ?? "12",
            descanso_seg: e.descanso_seg ?? 60,
            orden: idx,
            exercise_type: e.exercise_type || "base",
            position: idx + 1,
            peso_target: e.peso_target || "",
            grupo_bloque_id: e.grupo_bloque_id || null,
            grupo_nombre: e.grupo_nombre || null
          }))
      }))
    };
  }, []);

  // 2. Acción: Remover Ejercicio (Optimista)
  const removeExercise = useCallback(async (rutinaId: string, exerciseId: string) => {
    if (isInteracting) isInteracting.current = true;
    
    const oldPlan = { ...plan };
    const routinesKey = plan.rutinas ? 'rutinas' : 'rutinas_diarias';
    
    const newPlan = {
      ...plan,
      [routinesKey]: plan[routinesKey].map((r: any) => {
        if (r.id !== rutinaId) return r;
        return {
          ...r,
          ejercicios_plan: r.ejercicios_plan.filter((e: any) => e.id !== exerciseId)
        };
      })
    };

    setPlan(newPlan);
    toast.info("Removiste un ejercicio");
    
    return newPlan;
  }, [plan, setPlan, isInteracting]);

  // 3. Acción: Agregar Ejercicio (Optimista)
  const addExercise = useCallback(async (rutinaId: string, exercise: any) => {
    if (isInteracting) isInteracting.current = true;

    const routinesKey = plan.rutinas ? 'rutinas' : 'rutinas_diarias';
    const newExercise: EjercicioPlan = {
      id: crypto.randomUUID(),
      orden: 0, 
      series: 3,
      reps_target: "12",
      descanso_seg: 60,
      biblioteca_ejercicios: {
        id: exercise.id,
        nombre: exercise.nombre,
        media_url: exercise.media_url
      }
    };

    const newPlan = {
      ...plan,
      [routinesKey]: plan[routinesKey].map((r: any) => {
        if (r.id !== rutinaId) return r;
        return {
          ...r,
          ejercicios_plan: [...(r.ejercicios_plan || []), newExercise]
        };
      })
    };

    setPlan(newPlan);
    toast.success("¡Agregaste un ejercicio nuevo!");
    return newPlan;
  }, [plan, setPlan, isInteracting]);

  // 4. Acción: Reordenar Ejercicio (Optimista)
  const reorderExercise = useCallback(async (rutinaId: string, ejercicioId: string, direction: "up" | "down") => {
    if (isInteracting) isInteracting.current = true;

    const routinesKey = plan.rutinas ? 'rutinas' : 'rutinas_diarias';
    
    const newPlan = {
      ...plan,
      [routinesKey]: plan[routinesKey].map((r: any) => {
        if (r.id !== rutinaId) return r;
        
        const ejs = [...(r.ejercicios_plan || [])].sort((a,b) => a.orden - b.orden);
        const idx = ejs.findIndex(e => e.id === ejercicioId);
        if (idx === -1) return r;

        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= ejs.length) return r;

        // Swap
        const [moved] = ejs.splice(idx, 1);
        ejs.splice(newIdx, 0, moved);

        // Haptic Feedback (Industrial feel)
        if ('vibrate' in navigator) navigator.vibrate(10);

        return {
          ...r,
          ejercicios_plan: ejs.map((e, i) => ({ ...e, orden: i, position: i + 1 }))
        };
      })
    };

    setPlan(newPlan);
    toast.success("¡Reordenaste la rutina!", { duration: 1500 }); // Voseo + feedback
    return newPlan;
  }, [plan, setPlan, isInteracting]);


  // 5. Acción: Duplicar Rutina (Optimista)
  const duplicateRoutine = useCallback(async (rutinaId: string) => {
    if (isInteracting) isInteracting.current = true;

    const routinesKey = plan.rutinas ? 'rutinas' : 'rutinas_diarias';
    const sourceRoutine = plan[routinesKey].find((r: any) => r.id === rutinaId);
    if (!sourceRoutine) return plan;

    // Determinar el próximo número de día disponible
    const maxDia = Math.max(...plan[routinesKey].map((r: any) => r.dia_numero), 0);
    
    const newRoutine = {
      ...sourceRoutine,
      id: crypto.randomUUID(),
      dia_numero: maxDia + 1,
      nombre_dia: sourceRoutine.nombre_dia ? `${sourceRoutine.nombre_dia} (Copia)` : `Día ${maxDia + 1}`,
      ejercicios_plan: (sourceRoutine.ejercicios_plan || []).map((e: any) => ({
        ...e,
        id: crypto.randomUUID()
      }))
    };

    const newPlan = {
      ...plan,
      [routinesKey]: [...plan[routinesKey], newRoutine]
    };

    setPlan(newPlan);
    toast.success("¡Rutina duplicada!");
    return newPlan;
  }, [plan, setPlan, isInteracting]);

  // 6. Acción: Eliminar Rutina Completa (Optimista)
  const deleteRoutine = useCallback(async (rutinaId: string) => {
    if (isInteracting) isInteracting.current = true;

    const routinesKey = plan.rutinas ? 'rutinas' : 'rutinas_diarias';
    const newRoutines = plan[routinesKey]
      .filter((r: any) => r.id !== rutinaId)
      .map((r: any, idx: number) => ({
        ...r,
        dia_numero: idx + 1 // Reordenar números de día para mantener consistencia
      }));

    const newPlan = {
      ...plan,
      [routinesKey]: newRoutines
    };

    setPlan(newPlan);
    toast.info("Día eliminado del plan");
    return newPlan;
  }, [plan, setPlan, isInteracting]);

  return {
    getUpdatePayload,
    removeExercise,
    addExercise,
    reorderExercise,
    duplicateRoutine,
    deleteRoutine
  };
}

