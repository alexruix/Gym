import React, { useState, useMemo, useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { differenceInCalendarWeeks, parseISO } from "date-fns";
import { useAccordion } from "@/hooks/useAccordion";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface UseRoutineWorkspaceProps {
  alumnoId: string;
  student: any;
  planData: any;
  promotePlan: () => Promise<void>;
}

/**
 * useRoutineWorkspace: Hook centralizado para la lógica de la ficha de entrenamiento del alumno.
 * Extraído de StudentRoutineWorkspace para mejorar la latencia y mantenibilidad.
 */
export function useRoutineWorkspace({ alumnoId, student, planData, promotePlan }: UseRoutineWorkspaceProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPromotion, setShowPromotion] = useState(false);
  const [isPromotionDismissed, setIsPromotionDismissed] = useState(false);
  const [activeRoutineTarget, setActiveRoutineTarget] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isGuardOpen, setIsGuardOpen] = useState(false);

  const { execute: run, isPending } = useAsyncAction();
  
  const initialOpenedId = planData?.rutinas_diarias?.[0]?.id;
  const { isOpen: isRutinaOpen, toggleItem: toggleRutina } = useAccordion(
    initialOpenedId ? [initialOpenedId] : []
  );

  // 1. Cálculo de Duración Industrial
  const cicloSemanas = useMemo(() => {
    try {
      if (!student.fecha_inicio || !student.fecha_fin) return null;
      const start = typeof student.fecha_inicio === "string" ? parseISO(student.fecha_inicio) : student.fecha_inicio;
      const end = typeof student.fecha_fin === "string" ? parseISO(student.fecha_fin) : student.fecha_fin;
      return differenceInCalendarWeeks(end, start);
    } catch (err) {
      console.warn("[Industrial Guard] Date computation failed:", err);
      return null;
    }
  }, [student.fecha_inicio, student.fecha_fin]);

  // 2. Operaciones de Plan (Fork/Promote)
  const handlePersonalize = useCallback(async () => {
    if (!planData) return;
    await run(async () => {
      const { error } = await actions.profesor.forkPlan({
        planId: planData.id,
        alumnoId,
        nombre: `${planData.nombre} (Personalizado)`
      });
      if (error) throw error;
      toast.success("¡Listo! Creaste una versión personalizada");
      window.location.reload();
    });
  }, [planData, alumnoId, run]);

  const handlePromotePlan = useCallback(async () => {
    await run(async () => {
      await promotePlan();
    });
  }, [promotePlan, run]);

  const confirmForkAndExecute = useCallback(async () => {
    if (!planData || !alumnoId) return;
    await run(async () => {
      const { error } = await actions.profesor.forkPlan({
        planId: planData.id,
        alumnoId,
        nombre: `${planData.nombre} (Personalizado)`
      });
      if (error) throw error;
      toast.success("¡Plan personalizado creado! Redirigiendo...");
      setIsGuardOpen(false);
      setTimeout(() => window.location.reload(), 500);
    });
  }, [planData, alumnoId, run]);

  const ensureEditablePlan = useCallback((action: () => Promise<void>) => {
    if (planData?.is_template) {
      setIsGuardOpen(true);
      return;
    }
    action();
  }, [planData?.is_template]);

  // 3. Preparación de Datos para Renderizado
  const sortedRutinas = useMemo(() => {
    if (!planData?.rutinas_diarias) return [];
    return [...planData.rutinas_diarias].sort((a: any, b: any) => a.dia_numero - b.dia_numero);
  }, [planData?.rutinas_diarias]);

  const totalExercises = useMemo(() => {
    return planData?.rutinas_diarias?.reduce((acc: number, r: any) => acc + (r.ejercicios_plan?.length || 0), 0) || 0;
  }, [planData?.rutinas_diarias]);

  return {
    state: {
      isAssignDialogOpen, setIsAssignDialogOpen,
      isSearchOpen, setIsSearchOpen,
      showPromotion, setShowPromotion,
      isPromotionDismissed, setIsPromotionDismissed,
      activeRoutineTarget, setActiveRoutineTarget,
      muscleFilter, setMuscleFilter,
      viewMode, setViewMode,
      isGuardOpen, setIsGuardOpen,
      isPending,
      isRutinaOpen,
    },
    computed: {
      cicloSemanas,
      sortedRutinas,
      totalExercises,
      isEmpty: !planData || !planData.rutinas_diarias?.length,
      isReadOnly: planData?.profesor_id === null, // Fija si es template de MiGym
    },
    actions: {
      toggleRutina,
      handlePersonalize,
      handlePromotePlan,
      confirmForkAndExecute,
      ensureEditablePlan,
    }
  };
}
