import React, { useState } from "react";
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
  X
} from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { ExerciseMediaModal } from "@/components/molecules/profesor/perfil/ExerciseMediaModal";
import { cn } from "@/lib/utils";

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

export function StudentRoutineWorkspace({ alumnoId, planData }: Props) {
  const { workspace } = athleteProfileCopy;
  const [isPending, setIsPending] = useState(false);

  const [openRutinas, setOpenRutinas] = useState<Set<string>>(
    new Set(planData?.rutinas_diarias?.slice(0, 1).map((r) => r.id) || [])
  );
  
  const [selectedMedia, setSelectedMedia] = useState<{title: string, url: string} | null>(null);

  const toggleRutina = (id: string) => {
    setOpenRutinas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteExercise = async (ejercicioPlanId: string) => {
    if (!planData || isPending) return;
    
    if (!confirm("¿Seguro que querés quitar este ejercicio?")) return;

    setIsPending(true);
    const tId = toast.loading(planData.is_template ? workspace.routine.actions.forkingTitle : "Actualizando...");

    try {
      let targetPlanId = planData.id;

      // 1. Fork si es plantilla
      if (planData.is_template) {
        const { data: forkRes, error: forkErr } = await actions.profesor.forkPlan({
          planId: planData.id,
          alumnoId,
          nombre: `${planData.nombre} (Personalizado)`
        });
        if (forkErr || !forkRes?.plan_id) throw new Error(forkErr?.message || "Error al bifurcar");
        targetPlanId = forkRes.plan_id;
      }

      // 2. Reconstruir plan sin el ejercicio
      // Filtramos en todas las rutinas el ejercicio que coincida con el ID
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

      toast.success(planData.is_template ? workspace.routine.actions.forkingDesc : "Ejercicio quitado", { id: tId });
      window.location.reload();

    } catch (err: any) {
      toast.error(err.message, { id: tId });
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteDay = async (rutinaId: string) => {
    if (!planData || isPending) return;
    
    if (!confirm("¿Eliminar este día completo de la rutina del alumno?")) return;

    setIsPending(true);
    const tId = toast.loading(planData.is_template ? workspace.routine.actions.forkingTitle : "Actualizando...");

    try {
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

      // Reconstruir omitiendo el día borrado
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

      toast.success("Día eliminado correctamente", { id: tId });
      window.location.reload();

    } catch (err: any) {
      toast.error(err.message, { id: tId });
    } finally {
      setIsPending(false);
    }
  };

  if (!planData || !planData.rutinas_diarias || planData.rutinas_diarias.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 md:p-20 text-center space-y-8 shadow-sm">
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-lime-400 opacity-20 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-zinc-950 dark:bg-white p-6 rounded-[2rem] shadow-2xl rotate-3">
               <Dumbbell className="w-12 h-12 text-lime-400 dark:text-zinc-950" />
            </div>
        </div>
        
        <div className="space-y-3 max-w-sm mx-auto">
          <h3 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white uppercase italic">
            {workspace.routine.emptyState.title}
          </h3>
          <p className="text-sm font-medium text-zinc-500 leading-relaxed">
            {workspace.routine.emptyState.description}
          </p>
        </div>

        <Button
          onClick={() => window.location.href = '/profesor/planes'}
          className="h-16 px-10 bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 hover:scale-105 transition-all font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-zinc-950/20"
        >
          <Plus className="w-5 h-5 mr-3" />
          {workspace.routine.emptyState.btnLabel}
        </Button>
      </div>
    );
  }

  // Ordenar rutinas y ejercicios para mostrar correctamente
  const sortedRutinas = [...planData.rutinas_diarias].sort((a, b) => a.dia_numero - b.dia_numero);

  const handlePromotePlan = async () => {
    if (!planData || isPending) return;
    if (!confirm("¿Querés convertir este plan en una Plantilla Maestra? Aparecerá en tu lista general de planes.")) return;

    setIsPending(true);
    try {
      const { data, error } = await actions.profesor.promotePlan({ id: planData.id });
      if (error) throw new Error(error.message);
      toast.success(data.mensaje);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="px-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg md:text-xl font-black tracking-tighter text-zinc-950 dark:text-white flex items-center gap-3 uppercase">
          {workspace.routine.title}
          <span className={cn(
            "text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest",
            planData.is_template 
              ? "text-zinc-500 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700" 
              : "text-lime-600 bg-lime-100 border-lime-200 dark:bg-lime-900/40 dark:border-lime-500/20"
          )}>
            {planData.nombre} {!planData.is_template && "(Personalizado)"}
          </span>
        </h3>
        
        <div className="flex items-center gap-3">
          {!planData.is_template && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handlePromotePlan}
              className="rounded-xl font-black uppercase text-[10px] tracking-widest border-lime-500/30 text-lime-600 hover:bg-lime-50 gap-2 h-9"
            >
              <Share2 className="w-3.5 h-3.5" />
              {workspace.routine.actions.promote}
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-black uppercase text-[10px] tracking-widest border-zinc-200 gap-2 h-9 px-4 active:scale-95 transition-all shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-900"
            onClick={() => window.location.assign(`/profesor/planes/${planData.id}/edit`)}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Gestionar plan
          </Button>
        </div>
      </div>

      {/* Lista de días tipo Acordeón */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {sortedRutinas.map((rutina) => {
          const isOpen = openRutinas.has(rutina.id);
          const ejs = (rutina.ejercicios_plan || []).sort((a, b) => a.orden - b.orden);

          return (
            <div
              key={rutina.id}
              className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300"
            >
              {/* Toggle de Día */}
              <button
                onClick={() => toggleRutina(rutina.id)}
                className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50/80 dark:bg-zinc-900/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 transition-colors group"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-black text-zinc-600 dark:text-zinc-200 shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-colors shadow-sm">
                    {rutina.dia_numero}
                  </span>
                  <div className="text-left flex items-center gap-3">
                    <p className="font-black text-zinc-950 dark:text-white text-sm uppercase tracking-tight">
                      {workspace.routine.dayLabel} {rutina.dia_numero}
                      {rutina.nombre_dia && rutina.nombre_dia !== `Día ${rutina.dia_numero}` && (
                        <span className="ml-2 font-medium text-zinc-500 normal-case tracking-normal">
                          — {rutina.nombre_dia}
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {ejs.length} ejercicios
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDay(rutina.id);
                        }}
                        className="h-8 w-8 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform" aria-hidden="true" />
                    ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400 transition-transform" aria-hidden="true" />
                    )}
                </div>
              </button>

              {/* Lista de Ejercicios */}
              {isOpen && (
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {ejs.length === 0 ? (
                    <p className="text-center py-6 text-zinc-400 text-sm font-medium">{workspace.routine.emptyDay}</p>
                  ) : (
                    ejs.map((ej, idx) => (
                      <div
                        key={ej.id}
                        className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-zinc-950 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group/ej"
                      >
                        {/* Índice */}
                        <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner">
                          {idx + 1}
                        </span>

                        {/* Thumbnail */}
                        <button 
                          onClick={() => ej.biblioteca_ejercicios?.media_url && setSelectedMedia({ title: ej.biblioteca_ejercicios.nombre, url: ej.biblioteca_ejercicios.media_url })}
                          disabled={!ej.biblioteca_ejercicios?.media_url}
                          className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-inner border border-zinc-200/50 dark:border-zinc-700/50 hover:border-lime-400/50 transition-colors cursor-zoom-in"
                        >
                          {ej.biblioteca_ejercicios?.media_url ? (
                            <img
                              src={ej.biblioteca_ejercicios.media_url}
                              alt={ej.biblioteca_ejercicios.nombre}
                              className="w-full h-full object-cover grayscale brightness-90 group-hover/ej:grayscale-0 group-hover/ej:brightness-100 group-hover/ej:scale-105 transition-all duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <Dumbbell className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover/ej:scale-110 transition-transform duration-300" aria-hidden="true" />
                          )}
                        </button>

                        {/* Info Principal */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-zinc-950 dark:text-white text-base uppercase tracking-tight truncate mb-1 md:mb-0 group-hover/ej:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                            {ej.biblioteca_ejercicios?.nombre || "Ejercicio no encontrado"}
                          </p>
                          <div className="md:hidden flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                {ej.series} × {ej.reps_target}
                             </span>
                          </div>
                        </div>

                         {/* Detalles Desktop */}
                        <div className="hidden md:flex items-center gap-5 shrink-0">
                          <div className="text-center group-hover/ej:-translate-y-0.5 transition-transform duration-300">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{workspace.routine.sets}</p>
                            <p className="text-sm font-black text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg px-2 py-1 shadow-sm">{ej.series}</p>
                          </div>
                          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
                          <div className="text-center group-hover/ej:-translate-y-0.5 transition-transform duration-300 delay-75">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">{workspace.routine.reps}</p>
                            <p className="text-sm font-black text-zinc-950 dark:text-white bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg px-2 py-1 shadow-sm">{ej.reps_target}</p>
                          </div>
                          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
                          <div className="text-center group-hover/ej:-translate-y-0.5 transition-transform duration-300 delay-150 min-w-[60px]">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1 leading-none mb-1.5">
                              <Clock className="w-2.5 h-2.5" aria-hidden="true" /> {workspace.routine.restLabel}
                            </p>
                            <p className="text-sm font-black text-zinc-950 dark:text-white">{ej.descanso_seg}<span className="text-zinc-500 font-medium normal-case ml-0.5">{workspace.routine.seconds}</span></p>
                          </div>
                          
                          {/* BOTÓN QUITAR */}
                          <div className="ml-2">
                             <Button
                                variant="ghost"
                                size="icon"
                                disabled={isPending}
                                onClick={() => handleDeleteExercise(ej.id)}
                                className="h-10 w-10 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover/ej:opacity-100 transition-all active:scale-95"
                             >
                                <X className="w-4 h-4" />
                             </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ExerciseMediaModal 
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        title={selectedMedia?.title || ""}
        mediaUrl={selectedMedia?.url || null}
      />
    </div>
  );
}
