import React, { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import {
  History,
  ChevronDown,
  Dumbbell,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { MetricConsole } from "@/components/molecules/profesor/MetricConsole";
import { ExerciseHistoryPanel } from "@/components/molecules/profesor/ExerciseHistoryPanel";
import { cn } from "@/lib/utils";
import { useAccordion } from "@/hooks/useAccordion";
import { useAsyncAction } from "@/hooks/useAsyncAction";

// --- Tipos de Datos (Mirroring StudentPlanWorkspace para SSOT) ---
interface EjercicioPlan {
  id: string;
  orden: number;
  series: number;
  reps_target: string;
  descanso_seg: number;
  peso_target?: string;
  biblioteca_ejercicios: {
    id: string;
    nombre: string;
    media_url: string | null;
  } | null;
  ejercicio_plan_personalizado?: any;
}

interface RutinaDiaria {
  id: string;
  dia_numero: number;
  nombre_dia: string | null;
  ejercicios_plan: EjercicioPlan[];
}

interface AssignedPlan {
  id: string;
  nombre: string;
  duracion_semanas: number;
  rutinas_diarias: RutinaDiaria[];
}

interface Props {
  alumnoId: string;
  planData?: AssignedPlan | null;
}

/**
 * StudentMetricsWorkspace: Centro de comando OPERATIVO del profesor (Vista Semanal).
 * Refactorizado para usar la arquitectura de moléculas unificadas (Atomic Design).
 */
export function StudentMetricsWorkspace({ alumnoId, planData }: Props) {
  const { metricsTab } = athleteProfileCopy.workspace.routine;
  const { execute: run, isPending } = useAsyncAction();
  const [currentWeek, setCurrentWeek] = useState(1);
  const { isOpen, toggleItem } = useAccordion(
    planData?.rutinas_diarias?.slice(0, 1).map(r => r.id) || []
  );

  const numWeeks = planData?.duracion_semanas || 1;

  const handleUpdateMetric = (ejercicioPlanId: string, updates: any) => {
    if (!planData || isPending) return;

    run(async () => {
      const { error } = await actions.profesor.upsertStudentMetricOverride({
        alumno_id: alumnoId,
        ejercicio_plan_id: ejercicioPlanId,
        semana_numero: currentWeek,
        ...updates
      });

      if (error) throw new Error(error.message);
      toast.success("Métrica actualizada", { icon: "🎯", duration: 1500 });
    }, { loadingMsg: "Guardando...", reloadOnSuccess: true });
  };

  const handleCopyFromPrevious = () => {
    if (!planData || currentWeek <= 1 || isPending) return;

    run(async () => {
      const { data: res, error } = await actions.profesor.copyMetricsToNextWeek({
        alumno_id: alumnoId,
        from_week: currentWeek - 1,
        to_week: currentWeek,
        plan_id: planData.id
      });

      if (error) throw new Error(error.message);
      if (res?.success) toast.success(res.mensaje);
      else toast.error("No hay métricas para copiar de la semana anterior");
    }, { loadingMsg: "Clonando métricas...", reloadOnSuccess: true });
  };

  if (!planData || !planData.rutinas_diarias || planData.rutinas_diarias.length === 0) {
    return <EmptyState />;
  }

  const sortedRutinas = [...planData.rutinas_diarias].sort((a, b) => a.dia_numero - b.dia_numero);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Operativo Industrial */}
      <div className="bg-zinc-950 dark:bg-zinc-900 px-8 py-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Dumbbell className="w-32 h-32 text-white -rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-fuchsia-400/80">
              <div className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Consola Semanal</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-bold tracking-tighter text-white uppercase italic leading-none">{metricsTab.title}</h3>
              <p className="text-zinc-400 font-medium text-sm max-w-xs">{metricsTab.subtitle}</p>
            </div>
          </div>

          {/* Selector de Semanas */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-4">Semana Seleccionada</span>
            <div className="flex items-center gap-2 p-1.5 bg-zinc-900 dark:bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
              {Array.from({ length: numWeeks }, (_, i) => {
                const w = i + 1;
                const isActive = currentWeek === w;
                return (
                  <button
                    key={w}
                    onClick={() => setCurrentWeek(w)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                      isActive ? "bg-white text-zinc-950 shadow-xl scale-110" : "text-zinc-500 hover:text-white"
                    )}
                  >
                    S{w}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRutinas.map(rutina => {
          const isOpened = isOpen(rutina.id);
          return (
            <div key={rutina.id} className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all">
              <button onClick={() => toggleItem(rutina.id)} className="w-full flex items-center justify-between p-6">
                <div className="flex items-center gap-6">
                  <span className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all", isOpened ? "bg-zinc-950 text-white" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400")}>
                    {rutina.dia_numero}
                  </span>
                  <h4 className="font-bold text-lg text-zinc-950 dark:text-white uppercase tracking-tighter">{rutina.nombre_dia || `Día ${rutina.dia_numero}`}</h4>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-zinc-300 transition-transform", isOpened && "rotate-180")} />
              </button>

              {isOpened && (
                <div className="border-t border-zinc-50 dark:border-zinc-900 bg-zinc-50/10 divide-y divide-zinc-50 dark:divide-zinc-900/50 animate-in fade-in">
                  {rutina.ejercicios_plan.map(ej => {
                    const overridesArray = Array.isArray(ej.ejercicio_plan_personalizado) ? ej.ejercicio_plan_personalizado : ej.ejercicio_plan_personalizado ? [ej.ejercicio_plan_personalizado] : [];
                    const override = overridesArray.find((o: any) => o.alumno_id === alumnoId && o.semana_numero === currentWeek);
                    const effectiveEx = { ...ej, series: override?.series ?? ej.series, reps_target: override?.reps_target ?? ej.reps_target, descanso_seg: override?.descanso_seg ?? ej.descanso_seg, peso_target: override?.peso_target ?? ej.peso_target };

                    return (
                      <div key={ej.id} className="p-6 space-y-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-lg overflow-hidden">
                              {ej.biblioteca_ejercicios?.media_url ? <img src={ej.biblioteca_ejercicios.media_url} className="w-full h-full object-cover" /> : <Dumbbell className="w-6 h-6 text-lime-400" />}
                            </div>
                            <h5 className="font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-tight text-lg leading-tight">{ej.biblioteca_ejercicios?.nombre}</h5>
                          </div>
                          <MetricConsole
                            series={effectiveEx.series}
                            reps={effectiveEx.reps_target}
                            peso={effectiveEx.peso_target || ""}
                            descanso={effectiveEx.descanso_seg}
                            isSaving={isPending}
                            onUpdate={onUpdate => handleUpdateMetric(ej.id, onUpdate)}
                          />
                        </div>
                        <ExerciseHistoryPanel
                          alumnoId={alumnoId}
                          ejercicioId={ej.biblioteca_ejercicios?.id || ""}
                          className="bg-transparent border-zinc-100 dark:border-zinc-800/50"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-24 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center gap-8 text-center">
      <div className="w-24 h-24 bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-zinc-800 shadow-2xl">
        <Sparkles className="w-10 h-10 text-lime-400 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h3 className="font-bold text-2xl uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">Base de Plan Vacía</h3>
        <p className="text-sm text-zinc-400 font-medium px-6">Asigná un plan para empezar a cargar métricas.</p>
      </div>
    </div>
  );
}
