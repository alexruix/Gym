import React, { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import {
  Dumbbell,
  Clock,
  ChevronDown,
  Plus,
  Settings2,
  Trash2,
  X,
  Layers,
  ArrowUpRight,
  Library,
  Search,
  Copy as CopyIcon,
  Sparkles,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { RoutineExerciseRow } from "@/components/molecules/profesor/planes/RoutineExerciseRow";
import { MasterPlanAssignmentDialog } from "@/components/molecules/profesor/perfil/MasterPlanAssignmentDialog";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";
import { RotationDialog } from "@/components/molecules/profesor/planes/RotationDialog";
import { ExerciseCard } from "@/components/molecules/profesor/planes/ExerciseCard";
import { cn } from "@/lib/utils";
import { useAccordion } from "@/hooks/useAccordion";
import { useAsyncAction } from "@/hooks/useAsyncAction";

// --- Tipos para la Rutina ---
interface EjercicioPlan {
  id: string;
  orden: number;
  series: number;
  reps_target: string;
  descanso_seg: number;
  peso_target?: string;
  exercise_type: "base" | "complementary" | "accessory";
  position: number;
  biblioteca_ejercicios: {
    id: string;
    nombre: string;
    media_url: string | null;
    parent_id?: string | null;
    tags?: string[];
  } | null;
  ejercicio_plan_personalizado?: {
    series?: number;
    reps_target?: string;
    descanso_seg?: number;
    peso_target?: string;
  }[] | {
    series?: number;
    reps_target?: string;
    descanso_seg?: number;
    peso_target?: string;
  }; 
}

interface RutinaDiaria {
  id: string;
  dia_numero: number;
  nombre_dia: string | null;
  orden: number;
  ejercicios_plan: EjercicioPlan[];
}

interface AssignedPlan {
  id: string;
  nombre: string;
  is_template: boolean;
  duracion_semanas: number;
  rutinas_diarias: RutinaDiaria[];
}

interface Props {
  alumnoId: string;
  planData?: AssignedPlan | null;
  library: any[];
  mode?: "plan" | "routine";
}

/**
 * StudentRoutineWorkspace: Orquestador de la personalización de rutina del alumno.
 * Implementa el Fork Automático (Invisible) y la edición inline de métricas.
 */
export function StudentRoutineWorkspace({ alumnoId, planData, library, mode = "routine" }: Props) {
  const { workspace } = athleteProfileCopy;
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVariationOpen, setIsVariationOpen] = useState(false);
  const [showPromotion, setShowPromotion] = useState(false);
  const [isPromotionDismissed, setIsPromotionDismissed] = useState(false);
  const [activeRoutineTarget, setActiveRoutineTarget] = useState<string | null>(null);
  const [selectedExerciseForVariation, setSelectedExerciseForVariation] = useState<EjercicioPlan | null>(null);

  const { execute: run, isPending } = useAsyncAction();
  const { isOpen: isRutinaOpen, toggleItem: toggleRutina } = useAccordion(
    planData?.rutinas_diarias?.slice(0, 1).map((r) => r.id) || []
  );

  const isReadOnlyTemplate = mode === "plan" && planData?.is_template;

  /**
   * handleAutoFork: Lógica central para "desprender" un plan si es plantilla.
   */
  const handleAutoFork = async () => {
    if (!planData) return null;
    if (!planData.is_template) return planData.id;

    const { data: forkRes, error: forkErr } = await actions.profesor.forkPlan({
      planId: planData.id,
      alumnoId,
      nombre: `${planData.nombre} (Personalizado)`
    });

    if (forkErr || !forkRes?.plan_id) throw new Error(forkErr?.message || "Error al bifurcar plan");

    toast.success("¡Listo! Creaste una versión personalizada para este alumno", {
      icon: "✨",
      duration: 4000
    });

    return forkRes.plan_id;
  };

  const handleUpdateExercise = (ejercicioPlanId: string, updates: any) => {
    if (!planData || isPending) return;

    if (planData.is_template) {
       // --- MODIFICACIÓN MÉTRICA (OVERRIDE) ---
       run(async () => {
         const { error } = await actions.profesor.upsertStudentMetricOverride({
           alumno_id: alumnoId,
           ejercicio_plan_id: ejercicioPlanId,
           ...updates
         });
         
         if (error) throw new Error(error.message);
         toast.success("Ajuste personalizado guardado", { icon: "🎯", duration: 2000 });
         window.location.reload(); // Recarga simple para ver el override aplicado
       });
       return;
    }

    // --- MODIFICACIÓN DIRECTA (SI YA ES UN FORK) ---
    run(async () => {
      const updatedRutinas = planData.rutinas_diarias.map(r => ({
        dia_numero: r.dia_numero,
        nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
        ejercicios: r.ejercicios_plan.map(e => {
          if (e.id === ejercicioPlanId) {
            return {
              ejercicio_id: e.biblioteca_ejercicios?.id || "",
              series: updates.series ?? e.series,
              reps_target: updates.reps_target ?? e.reps_target,
              descanso_seg: updates.descanso_seg ?? e.descanso_seg,
              peso_target: updates.peso_target ?? (e.peso_target || ""),
              orden: e.orden,
              exercise_type: e.exercise_type,
              position: e.position
            };
          }
          return {
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: e.orden,
            exercise_type: e.exercise_type,
            position: e.position
          };
        })
      }));

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.filter(r => r.ejercicios.length > 0).length,
        rutinas: updatedRutinas
      });

      if (error) throw new Error(error.message);
    }, { loadingMsg: "Guardando cambios...", successMsg: "Métricas actualizadas", reloadOnSuccess: true });
  };

  const handleAddExercise = (exerciseId: string) => {
    if (!planData || !activeRoutineTarget) return;

    if (planData.is_template) {
       setShowPromotion(true);
       toast.info("Para añadir ejercicios nuevos, debés crear una copia de esta planificación.", { 
         description: "Presioná 'Guardar como nueva planificación' para continuar.",
         duration: 5000 
       });
       setIsSearchOpen(false);
       return;
    }

    run(async () => {
      const updatedRutinas = planData.rutinas_diarias.map(r => {
        const exercises = r.ejercicios_plan.map(e => ({
          ejercicio_id: e.biblioteca_ejercicios?.id || "",
          series: e.series,
          reps_target: e.reps_target,
          descanso_seg: e.descanso_seg,
          peso_target: e.peso_target || "",
          orden: e.orden,
          exercise_type: e.exercise_type,
          position: e.position
        }));

        if (r.id === activeRoutineTarget) {
          exercises.push({
            ejercicio_id: exerciseId,
            series: 3,
            reps_target: "12",
            descanso_seg: 60,
            peso_target: "",
            orden: exercises.length,
            exercise_type: "base",
            position: exercises.length + 1
          });
        }

        return {
          dia_numero: r.dia_numero,
          nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
          ejercicios: exercises
        };
      });

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.filter(r => r.ejercicios.length > 0).length,
        rutinas: updatedRutinas
      });

      if (error) throw new Error(error.message);
      setIsSearchOpen(false);
    }, { loadingMsg: "Añadiendo ejercicio...", successMsg: "Ejercicio añadido", reloadOnSuccess: true });
  };

  const handleSwapExercise = (newExerciseId: string) => {
    if (!planData || !selectedExerciseForVariation) return;

    if (planData.is_template) {
       setShowPromotion(true);
       toast.info("Para cambiar ejercicios, debés crear una copia personalizada.", { duration: 5000 });
       setIsVariationOpen(false);
       return;
    }

    run(async () => {
      const updatedRutinas = planData.rutinas_diarias.map(r => ({
        dia_numero: r.dia_numero,
        nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
        ejercicios: r.ejercicios_plan.map(e => {
          if (e.id === selectedExerciseForVariation.id) {
            return {
              ejercicio_id: newExerciseId,
              series: e.series,
              reps_target: e.reps_target,
              descanso_seg: e.descanso_seg,
              peso_target: e.peso_target || "",
              orden: e.orden,
              exercise_type: e.exercise_type,
              position: e.position
            };
          }
          return {
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: e.orden,
            exercise_type: e.exercise_type,
            position: e.position
          };
        })
      }));

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.filter(r => r.ejercicios.length > 0).length,
        rutinas: updatedRutinas
      });

      if (error) throw new Error(error.message);
      setIsVariationOpen(false);
    }, { loadingMsg: "Intercambiando...", successMsg: "Variación aplicada", reloadOnSuccess: true });
  };

  const handleDeleteExercise = (ejercicioPlanId: string) => {
    if (!planData || isPending) return;

    if (planData.is_template) {
       setShowPromotion(true);
       toast.info("Para quitar ejercicios, debés crear una copia personalizada.", { duration: 5000 });
       return;
    }

    if (!confirm("¿Seguro que querés quitar este ejercicio?")) return;

    run(async () => {
      const updatedRutinas = planData.rutinas_diarias.map(r => ({
        dia_numero: r.dia_numero,
        nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
        ejercicios: r.ejercicios_plan
          .filter(e => e.id !== ejercicioPlanId)
          .map((e, idx) => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: idx,
            exercise_type: e.exercise_type,
            position: idx + 1
          }))
      }));

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.filter(r => r.ejercicios.length > 0).length,
        rutinas: updatedRutinas
      });

      if (error) throw new Error(error.message);
    }, { loadingMsg: "Quitando ejercicio...", successMsg: "Ejercicio eliminado", reloadOnSuccess: true });
  };

  const handleDeleteDay = (rutinaId: string) => {
    if (!planData || isPending) return;

    if (planData.is_template) {
       setShowPromotion(true);
       toast.info("Para eliminar días, debés crear una copia personalizada.", { duration: 5000 });
       return;
    }

    if (!confirm("¿Eliminar este día completo?")) return;

    run(async () => {
      const updatedRutinas = planData.rutinas_diarias
        .filter(r => r.id !== rutinaId)
        .map((r, rIdx) => ({
          dia_numero: rIdx + 1,
          nombre_dia: r.nombre_dia || `Día ${rIdx + 1}`,
          ejercicios: r.ejercicios_plan.map((e, idx) => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: idx,
            exercise_type: e.exercise_type,
            position: idx + 1
          }))
        }));

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.length,
        rutinas: updatedRutinas
      });
      if (error) throw new Error(error.message);
    }, { loadingMsg: "Actualizando...", successMsg: "Día eliminado", reloadOnSuccess: true });
  };

  const handlePromotePlan = () => {
    if (!planData || isPending) return;
    run(async () => {
      const { data, error } = await actions.profesor.promotePlan({ id: planData.id });
      if (error) throw new Error(error.message);
      toast.success(data.mensaje);
      window.location.reload();
    }, { loadingMsg: "Promocionando..." });
  };

  const handleMoveExercise = (ejercicioPlanId: string, direction: "up" | "down") => {
    if (!planData || isPending) return;

    if (planData.is_template) {
       setShowPromotion(true);
       toast.info("Para reordenar ejercicios, debés crear una copia personalizada.", { duration: 5000 });
       return;
    }

    run(async () => {
      const updatedRutinas = planData.rutinas_diarias.map(r => {
        const ejs = [...r.ejercicios_plan].sort((a, b) => a.orden - b.orden);
        const idx = ejs.findIndex(e => e.id === ejercicioPlanId);
        
        if (idx === -1) return {
          dia_numero: r.dia_numero,
          nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
          ejercicios: r.ejercicios_plan.map(e => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: e.orden,
            exercise_type: e.exercise_type,
            position: e.position
          }))
        };

        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= ejs.length) return {
          dia_numero: r.dia_numero,
          nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
          ejercicios: r.ejercicios_plan.map(e => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: e.orden,
            exercise_type: e.exercise_type,
            position: e.position
          }))
        };

        // Swap actual
        const temp = ejs[idx];
        ejs[idx] = ejs[newIdx];
        ejs[newIdx] = temp;

        return {
          dia_numero: r.dia_numero,
          nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
          ejercicios: ejs.map((e, i) => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: i,
            exercise_type: e.exercise_type,
            position: i + 1
          }))
        };
      });

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.filter(r => r.ejercicios.length > 0).length,
        rutinas: updatedRutinas
      });

      if (error) throw new Error(error.message);
    }, { loadingMsg: "Reordenando...", successMsg: "Orden actualizado", reloadOnSuccess: true });
  };

  const handleAddEmptyDay = () => {
    if (!planData || isPending) return;

    if (planData.is_template) {
       setShowPromotion(true);
       toast.info("Para añadir días, debés crear una copia personalizada.", { duration: 5000 });
       return;
    }

    run(async () => {
      const nextDayNum = planData.rutinas_diarias.length + 1;
      const updatedRutinas = [
        ...planData.rutinas_diarias.map(r => ({
          dia_numero: r.dia_numero,
          nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
          ejercicios: r.ejercicios_plan.map(e => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: e.orden,
            exercise_type: e.exercise_type,
            position: e.position
          }))
        })),
        {
          dia_numero: nextDayNum,
          nombre_dia: `Día ${nextDayNum}`,
          ejercicios: []
        }
      ];

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.length,
        rutinas: updatedRutinas
      });

      if (error) throw new Error(error.message);
    }, { loadingMsg: "Añadiendo día...", successMsg: "Día añadido", reloadOnSuccess: true });
  };

  const handleDuplicateDay = (rutinaId: string) => {
    if (!planData || isPending) return;

    if (planData.is_template) {
       setShowPromotion(true);
       toast.info("Para duplicar días, debés crear una copia personalizada.", { duration: 5000 });
       return;
    }

    run(async () => {
      const sourceDay = planData.rutinas_diarias.find(r => r.id === rutinaId);
      if (!sourceDay) return;

      const nextDayNum = planData.rutinas_diarias.length + 1;
      const updatedRutinas = [
        ...planData.rutinas_diarias.map(r => ({
          dia_numero: r.dia_numero,
          nombre_dia: r.nombre_dia || `Día ${r.dia_numero}`,
          ejercicios: r.ejercicios_plan.map(e => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: e.orden,
            exercise_type: e.exercise_type,
            position: e.position
          }))
        })),
        {
          dia_numero: nextDayNum,
          nombre_dia: `${sourceDay.nombre_dia || `Día ${sourceDay.dia_numero}`} (Copia)`,
          ejercicios: sourceDay.ejercicios_plan.map(e => ({
            ejercicio_id: e.biblioteca_ejercicios?.id || "",
            series: e.series,
            reps_target: e.reps_target,
            descanso_seg: e.descanso_seg,
            peso_target: e.peso_target || "",
            orden: e.orden,
            exercise_type: e.exercise_type,
            position: e.position
          }))
        }
      ];

      const { error } = await actions.profesor.updatePlan({
        id: planData.id,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.length,
        rutinas: updatedRutinas
      });

      if (error) throw new Error(error.message);
    }, { loadingMsg: "Duplicando día...", successMsg: "Día duplicado", reloadOnSuccess: true });
  };

  const isEmpty = !planData || !planData.rutinas_diarias || planData.rutinas_diarias.length === 0;
  const sortedRutinas = planData?.rutinas_diarias 
    ? [...planData.rutinas_diarias].sort((a, b) => a.dia_numero - b.dia_numero) 
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {isEmpty ? (
        <div className="py-24 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center gap-8 text-center shadow-2xl shadow-zinc-950/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          <div className="w-24 h-24 bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-zinc-800 shadow-2xl group-hover:rotate-6 transition-transform duration-500">
            <Dumbbell className="w-10 h-10 text-lime-400" />
          </div>
          <div className="space-y-2 relative z-10 max-w-sm">
            <h3 className="font-black text-2xl uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">{workspace.routine.emptyState.title}</h3>
            <p className="text-sm text-zinc-400 font-medium px-6">{workspace.routine.emptyState.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <Button
              onClick={() => setIsAssignDialogOpen(true)}
              variant="industrial"
              size="xl"
              className="shadow-xl shadow-lime-500/10"
            >
              <Library className="w-5 h-5 mr-3" />
              {workspace.routine.emptyState.assignBtn}
            </Button>

            <Button
              onClick={() => window.location.href = '/profesor/planes'}
              variant="outline"
              className="h-14 px-8 rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-sans"
            >
              <Plus className="w-4 h-4 mr-3" />
              {workspace.routine.emptyState.createBtn}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Header Operational */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-lg">
                <Layers className="w-6 h-6 text-lime-400" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase leading-none mb-1">
                  {mode === "plan" ? athleteProfileCopy.workspace.tabs.plan : athleteProfileCopy.workspace.tabs.routine}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{planData?.nombre}</span>
                  {planData && !planData.is_template && (
                    <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20">
                      PERSONALIZADO
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(!isReadOnlyTemplate && planData && !planData.is_template) && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handlePromotePlan}
                  className="h-10 rounded-xl font-black text-[9px] tracking-[0.2em] border-zinc-200 dark:border-zinc-800 hover:bg-lime-400 hover:text-zinc-950 hover:border-lime-500 transition-all gap-2"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  {workspace.routine.emptyState.promoteBtn}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-black uppercase text-[9px] tracking-widest"
                onClick={() => setIsAssignDialogOpen(true)}
              >
                <Library className="w-3.5 h-3.5 mr-2" />
                {workspace.routine.emptyState.changeBtn}
              </Button>
            </div>
          </div>

          {/* 2. MASTER PLAN BANNER (READ-ONLY) */}
          {isReadOnlyTemplate && (
            <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 mb-10 animate-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
               <div className="flex items-center gap-6 relative z-10 text-center md:text-left flex-col md:flex-row">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shadow-zinc-950/50 shrink-0">
                    <AlertTriangle className="w-7 h-7 md:w-8 md:h-8 text-lime-400" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter mb-1">
                      {workspace.routine.masterPlan.bannerTitle}
                    </h4>
                    <p className="text-zinc-400 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                      {workspace.routine.masterPlan.bannerDesc}
                    </p>
                  </div>
               </div>
               <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
                  <Button
                    onClick={() => window.location.href = `/profesor/planes/${planData?.id}`}
                    variant="outline"
                    className="h-12 px-6 rounded-xl border-white/10 hover:bg-white/5 text-white font-black uppercase text-[10px] tracking-widest w-full md:w-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    {workspace.routine.masterPlan.editMasterBtn}
                  </Button>
                  <Button
                    onClick={async () => {
                      const newId = await handleAutoFork();
                      if (newId) window.location.reload();
                    }}
                    className="h-12 px-8 rounded-xl bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase text-[10px] tracking-widest w-full md:w-auto shadow-xl shadow-lime-500/20"
                  >
                    {workspace.routine.masterPlan.personalizeBtn}
                  </Button>
               </div>
            </div>
          )}

          {/* 3. Smart Promotion Banner (Bifurcación/Promoción) */}
          {(planData && ((!planData.is_template || showPromotion) && !isPromotionDismissed && !isReadOnlyTemplate)) && (
            <div className="p-1 min-h-16 rounded-[2rem] bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group animate-in slide-in-from-bottom-4 duration-500">
              <div className="absolute inset-0 bg-lime-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 md:gap-6 px-6 md:px-8 relative z-10 w-full md:w-auto text-center md:text-left flex-col md:flex-row py-4 md:py-0">
                <div className="w-10 h-10 rounded-2xl bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-500/20 rotate-3 shrink-0">
                  <Sparkles className="w-5 h-5 text-zinc-950" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">
                    {planData.is_template ? "Cambios estructurales" : "Modificaste la rutina"}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 max-w-[280px] mx-auto md:mx-0">
                    {planData.is_template 
                      ? "Para guardar estos cambios debés crear una versión personalizada para el alumno."
                      : "¿Querés guardarla como una nueva planificación para usar con otros?"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 px-6 md:px-8 pb-6 md:pb-0 relative z-10 w-full md:w-auto">
                <Button
                  variant="industrial"
                  onClick={async () => {
                    const newId = await handleAutoFork();
                    if (newId) window.location.reload();
                  }}
                  disabled={isPending}
                  className="h-10 px-8 rounded-xl bg-lime-400 hover:bg-lime-500 text-zinc-950 w-full md:w-auto uppercase text-[10px] font-black"
                >
                  Guardar como nuevo plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPromotionDismissed(true)}
                  disabled={isPending}
                  className="h-10 px-6 rounded-xl border-white/10 hover:bg-white/5 text-white w-full md:w-auto uppercase text-[10px] font-black"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

      {/* Accordion List (PlanDetail Style) */}
      <div className="space-y-4">
        {sortedRutinas.map((rutina) => {
          const isOpen = isRutinaOpen(rutina.id);
          const ejs = (rutina.ejercicios_plan || []).sort((a, b) => a.orden - b.orden);

          return (
            <div
              key={rutina.id}
              className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-zinc-950/5 group"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRutina(rutina.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleRutina(rutina.id); }}
                className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <span className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500 shadow-sm",
                    isOpen ? "bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950 rotate-3" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:rotate-6"
                  )}>
                    {rutina.dia_numero}
                  </span>
                  <div className="text-left">
                    <h4 className="font-black text-lg text-zinc-950 dark:text-white uppercase tracking-tighter leading-none group-hover:text-lime-600 transition-colors">
                      {rutina.nombre_dia || `Día ${rutina.dia_numero}`}
                    </h4>
                    <p className="text-[10px] font-black text-zinc-400 tracking-widest mt-1.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {ejs.length} Ejercicios
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  {!isReadOnlyTemplate && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={(e) => { e.stopPropagation(); handleDuplicateDay(rutina.id); }}
                        className="h-9 w-9 rounded-xl text-zinc-400 hover:text-lime-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all sm:opacity-0 group-hover:opacity-100"
                        title="Duplicar día"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={(e) => { e.stopPropagation(); handleDeleteDay(rutina.id); }}
                        className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all sm:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center transition-all shrink-0",
                    isOpen ? "rotate-180 bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950" : "group-hover:bg-zinc-100"
                  )}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-zinc-50 dark:border-zinc-900 divide-y divide-zinc-50 dark:divide-zinc-900/50 animate-in fade-in slide-in-from-top-2 duration-500">
                  {ejs.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <X className="w-8 h-8 text-zinc-200 mx-auto" />
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">{workspace.routine.emptyDay}</p>
                    </div>
                  ) : mode === "plan" ? (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                       {ejs.map((ej, idx) => {
                          const overridesArray = Array.isArray(ej.ejercicio_plan_personalizado)
                            ? ej.ejercicio_plan_personalizado
                            : ej.ejercicio_plan_personalizado ? [ej.ejercicio_plan_personalizado] : [];
                          const override = overridesArray.find((o: any) => o.alumno_id === alumnoId);
                          
                          return (
                            <ExerciseCard 
                              key={ej.id}
                              exerciseIdx={idx}
                              exercise={ej}
                              getExerciseName={(id) => library.find(l => l.id === id)?.nombre || "Ejercicio"}
                              isFirst={idx === 0}
                              isLast={idx === ejs.length - 1}
                              readOnly={isReadOnlyTemplate}
                              removeExercise={() => handleDeleteExercise(ej.id)}
                              onMove={(dir) => handleMoveExercise(ej.id, dir)}
                              onSwap={() => {
                                setSelectedExerciseForVariation(ej);
                                setIsVariationOpen(true);
                              }}
                            />
                          );
                       })}
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                      {ejs.map((ej, idx) => {
                        // MERGE LOGIC: Priorizar Overrides de la tabla personalizada (filtrado por este alumno)
                        const overridesArray = Array.isArray(ej.ejercicio_plan_personalizado)
                          ? ej.ejercicio_plan_personalizado
                          : ej.ejercicio_plan_personalizado ? [ej.ejercicio_plan_personalizado] : [];
                        
                        const override = overridesArray.find((o: any) => o.alumno_id === alumnoId);
                        
                        const effectiveExercise = {
                          ...ej,
                          series: override?.series ?? ej.series,
                          reps_target: override?.reps_target ?? ej.reps_target,
                          descanso_seg: override?.descanso_seg ?? ej.descanso_seg,
                          peso_target: override?.peso_target ?? ej.peso_target
                        };

                        return (
                          <RoutineExerciseRow
                            key={ej.id}
                            exercise={{
                              ...effectiveExercise,
                              peso_target: effectiveExercise.peso_target || ""
                            }}
                            index={idx}
                            hideMetrics={mode === ("plan" as string)}
                            readOnly={isReadOnlyTemplate}
                            isFirst={idx === 0}
                            isLast={idx === ejs.length - 1}
                            onDelete={() => handleDeleteExercise(ej.id)}
                            onChange={(upd) => handleUpdateExercise(ej.id, upd)}
                            onMove={(dir) => handleMoveExercise(ej.id, dir)}
                            onSwap={() => {
                              setSelectedExerciseForVariation(ej);
                              setIsVariationOpen(true);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Botón Añadir Ejercicio Profesional */}
                  <div className="p-4 bg-zinc-50/10 dark:bg-zinc-900/20">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full h-14 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 hover:border-lime-400 hover:bg-lime-400/5 transition-all gap-3 font-black uppercase text-[10px] tracking-widest",
                        isReadOnlyTemplate ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:border-zinc-100 dark:hover:border-zinc-800 text-zinc-400" : "text-zinc-400 hover:text-lime-500"
                      )}
                      onClick={() => {
                        if (isReadOnlyTemplate) {
                          toast.error(workspace.routine.masterPlan.restrictedAction, {
                            description: workspace.routine.masterPlan.restrictedDesc,
                            icon: "🔒"
                          });
                          return;
                        }
                        setActiveRoutineTarget(rutina.id);
                        setIsSearchOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      {isReadOnlyTemplate ? "Añadir ejercicio (Restringido)" : `Añadir ejercicio al ${rutina.nombre_dia || `Día ${rutina.dia_numero}`}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
          {/* Botón Añadir Día */}
          <div className="mt-8 px-2">
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "w-full h-16 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-lime-400 hover:bg-lime-400/5 transition-all gap-3 font-black uppercase text-xs tracking-widest",
                isReadOnlyTemplate ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-zinc-400" : "text-zinc-400 hover:text-lime-500 shadow-sm"
              )}
              onClick={() => {
                if (isReadOnlyTemplate) {
                  toast.error(workspace.routine.masterPlan.restrictedAction, {
                    description: workspace.routine.masterPlan.restrictedDesc,
                    icon: "🔒"
                  });
                  return;
                }
                handleAddEmptyDay();
              }}
            >
              <Plus className="w-5 h-5" />
              {isReadOnlyTemplate ? "Añadir nuevo día (Restringido)" : "Añadir nuevo día de entrenamiento"}
            </Button>
          </div>
        </>
      )}

      <MasterPlanAssignmentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        alumnoId={alumnoId}
        onSuccess={() => window.location.reload()}
      />

      <ExerciseSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelect={handleAddExercise}
        library={library}
        onExerciseCreated={() => window.location.reload()}
      />

      <RotationDialog
        open={isVariationOpen}
        onOpenChange={setIsVariationOpen}
        exercise={selectedExerciseForVariation ? {
          ejercicio_id: selectedExerciseForVariation.biblioteca_ejercicios?.id,
          ...selectedExerciseForVariation
        } : null}
        library={library}
        onSetRotation={(altId) => handleSwapExercise(altId)}
        onAutoPilot={(altIds) => handleSwapExercise(altIds[0])}
      />
    </div>
  );
}
