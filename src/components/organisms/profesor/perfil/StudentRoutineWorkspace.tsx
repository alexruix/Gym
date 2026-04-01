import React from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { 
  Dumbbell, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Settings2, 
  Trash2, 
  Loader2,
  Share2,
  X,
  Layers,
  ArrowUpRight,
  Library
} from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { RoutineExerciseRow } from "@/components/molecules/profesor/planes/RoutineExerciseRow";
import { MasterPlanAssignmentDialog } from "@/components/molecules/profesor/perfil/MasterPlanAssignmentDialog";
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
  exercise_type: "base" | "complementary" | "accessory";
  position: number;
  biblioteca_ejercicios: {
    id: string;
    nombre: string;
    media_url: string | null;
  } | null;
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
}

/**
 * StudentRoutineWorkspace: Workspace de entrenamiento del alumno.
 * Refactorizado para coincidir con la estética técnica de PlanDetail.
 */
export function StudentRoutineWorkspace({ alumnoId, planData }: Props) {
  const { workspace } = athleteProfileCopy;
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  // Hooks Core: eliminan boilerplate duplicado
  const { execute: run, isPending } = useAsyncAction();
  const { isOpen: isRutinaOpen, toggleItem: toggleRutina } = useAccordion(
    planData?.rutinas_diarias?.slice(0, 1).map((r) => r.id) || []
  );

  const handleDeleteExercise = (ejercicioPlanId: string) => {
    if (!planData || isPending) return;
    if (!confirm("¿Seguro que querés quitar este ejercicio?")) return;

    run(async () => {
      let targetPlanId = planData.id;

      if (planData.is_template) {
        const { data: forkRes, error: forkErr } = await actions.profesor.forkPlan({
          planId: planData.id,
          alumnoId,
          nombre: `${planData.nombre} (Personalizado)`
        });
        if (forkErr || !forkRes?.plan_id) throw new Error(forkErr?.message || "Error al bifurcar");
        targetPlanId = forkRes.plan_id;
      }

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
            orden: idx,
            exercise_type: e.exercise_type,
            position: e.position
          }))
      }));

      const { error: upError } = await actions.profesor.updatePlan({
        id: targetPlanId,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.filter(r => r.ejercicios.length > 0).length,
        rutinas: updatedRutinas
      });

      if (upError) throw new Error(upError.message);
    }, { loadingMsg: planData.is_template ? "Personalizando rutina..." : "Actualizando...", successMsg: "Rutina actualizada", reloadOnSuccess: true });
  };

  const handleDeleteDay = (rutinaId: string) => {
    if (!planData || isPending) return;
    if (!confirm("¿Eliminar este día completo?")) return;

    run(async () => {
      let targetPlanId = planData.id;
      if (planData.is_template) {
        const { data: forkRes, error: forkErr } = await actions.profesor.forkPlan({
          planId: planData.id,
          alumnoId,
          nombre: `${planData.nombre} (Bifurcado)`
        });
        if (forkErr || !forkRes?.plan_id) throw new Error(forkErr?.message || "Error al bifurcar");
        targetPlanId = forkRes.plan_id;
      }

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
            orden: idx,
            exercise_type: e.exercise_type,
            position: e.position
          }))
        }));

      const { error: upError } = await actions.profesor.updatePlan({
        id: targetPlanId,
        nombre: planData.nombre,
        duracion_semanas: planData.duracion_semanas,
        frecuencia_semanal: updatedRutinas.length,
        rutinas: updatedRutinas
      });
      if (upError) throw new Error(upError.message);
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

  if (!planData || !planData.rutinas_diarias || planData.rutinas_diarias.length === 0) {
    return (
        <div className="py-24 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center gap-8 text-center shadow-2xl shadow-zinc-950/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            <div className="w-24 h-24 bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-zinc-800 shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                <Dumbbell className="w-10 h-10 text-lime-400" />
            </div>
            <div className="space-y-2 relative z-10 max-w-sm">
                <h3 className="font-black text-2xl uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">Sin plan asignado</h3>
                <p className="text-sm text-zinc-400 font-medium px-6">Este atleta aún no tiene rutinas activas. Podés asignarle una pre-definda o crear una desde cero.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                <Button 
                    onClick={() => setIsAssignDialogOpen(true)}
                    variant="industrial"
                    className="h-14 px-10 rounded-2xl shadow-xl shadow-lime-500/10 uppercase"
                >
                    <Library className="w-4 h-4 mr-3" />
                    Asignar de mis Planes
                </Button>

                <Button 
                    onClick={() => window.location.href = '/profesor/planes'}
                    variant="outline"
                    className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-sans"
                >
                    <Plus className="w-4 h-4 mr-3" />
                    Crear nuevo Plan
                </Button>
            </div>

            <MasterPlanAssignmentDialog 
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
                alumnoId={alumnoId}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
  }

  const sortedRutinas = [...planData.rutinas_diarias].sort((a, b) => a.dia_numero - b.dia_numero);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Operational */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800 shadow-lg">
                <Layers className="w-6 h-6 text-lime-400" />
            </div>
            <div>
                <h3 className="text-xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase leading-none mb-1">
                    {workspace.routine.title}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{planData.nombre}</span>
                    {!planData.is_template && (
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20">
                            PERSONALIZADO
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!planData.is_template && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handlePromotePlan}
              className="h-10 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] border-zinc-200 dark:border-zinc-800 hover:bg-lime-400 hover:text-zinc-950 hover:border-lime-500 transition-all gap-2"
            >
              <ArrowUpRight className="w-3 h-3" />
              Promover a Maestro
            </Button>
          )}

          <Button 
            variant="industrial"
            size="sm" 
            className="h-10 rounded-xl px-5 shadow-lg shadow-lime-500/10"
            onClick={() => window.location.assign(`/profesor/planes/${planData.id}/edit`)}
          >
            <Settings2 className="w-3.5 h-3.5 mr-2" />
            EDITAR COMPLETO
          </Button>

          <Button 
            variant="outline"
            size="sm" 
            className="h-10 rounded-xl px-5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-black uppercase text-[9px] tracking-widest"
            onClick={() => setIsAssignDialogOpen(true)}
          >
            <Library className="w-3.5 h-3.5 mr-2" />
            Cambiar Plan
          </Button>
        </div>
      </div>

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
              <button
                onClick={() => toggleRutina(rutina.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all"
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
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {ejs.length} Actividades técnicas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={(e) => { e.stopPropagation(); handleDeleteDay(rutina.id); }}
                        className="h-9 w-9 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className={cn(
                        "w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center transition-all",
                        isOpen ? "rotate-180 bg-zinc-950 text-white" : "group-hover:bg-zinc-100"
                    )}>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-zinc-50 dark:border-zinc-900 divide-y divide-zinc-50 dark:divide-zinc-900/50 animate-in fade-in slide-in-from-top-2 duration-500">
                  {ejs.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                         <X className="w-8 h-8 text-zinc-200 mx-auto" />
                         <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">{workspace.routine.emptyDay}</p>
                    </div>
                  ) : (
                    ejs.map((ej, idx) => (
                      <RoutineExerciseRow 
                        key={ej.id} 
                        exercise={ej} 
                        index={idx} 
                        onDelete={() => handleDeleteExercise(ej.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MasterPlanAssignmentDialog 
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        alumnoId={alumnoId}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
