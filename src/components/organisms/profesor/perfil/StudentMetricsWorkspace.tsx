import React, { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { 
  History, 
  ChevronDown, 
  Dumbbell, 
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccordion } from "@/hooks/useAccordion";
import { useAsyncAction } from "@/hooks/useAsyncAction";

// --- Tipos de Datos (Mirroring StudentPlanWorkspace para SSOT) ---
interface EjercicioLog {
  peso: string | number;
  reps: number;
  rpe: number;
  fecha: string;
}

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
 * StudentMetricsWorkspace: Centro de comando OPERATIVO del profesor.
 * Visualización optimizada para carga semanal rápida (Consola Industrial).
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
    return (
      <div className="py-24 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col items-center gap-8 text-center shadow-2xl shadow-zinc-950/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="w-24 h-24 bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-zinc-800 shadow-2xl">
          <Sparkles className="w-10 h-10 text-lime-400 animate-pulse" />
        </div>
        <div className="space-y-2 relative z-10 max-w-sm">
          <h3 className="font-black text-2xl uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">Base de Plan Vacía</h3>
          <p className="text-sm text-zinc-400 font-medium px-6">Asigná un plan en la pestaña de al lado para empezar a cargar métricas.</p>
        </div>
      </div>
    );
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
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-fuchsia-400/80">Gestión de Progresión Semanal</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
                  {metricsTab.title}
                </h3>
                <p className="text-zinc-400 font-medium text-sm max-w-xs">{metricsTab.subtitle}</p>
              </div>
            </div>

            {/* Selector de Semanas Estilo PlanNavigator */}
            <div className="flex flex-col gap-3">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">Semana Activa</span>
               <div className="flex items-center gap-2 p-1.5 bg-zinc-900 dark:bg-zinc-950 rounded-2xl border border-zinc-800">
                  {Array.from({ length: numWeeks }, (_, i) => {
                    const w = i + 1;
                    const isActive = currentWeek === w;
                    return (
                      <button
                        key={w}
                        onClick={() => setCurrentWeek(w)}
                        className={cn(
                          "w-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                          isActive 
                            ? "bg-white text-zinc-950 shadow-xl scale-110" 
                            : "text-zinc-500 hover:text-white"
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

      {/* Action Bar (Copy From Prev) */}
      {currentWeek > 1 && (
        <div className="flex justify-start px-2">
           <Button
            onClick={handleCopyFromPrevious}
            variant="outline"
            className="rounded-2xl h-11 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/20 gap-3 hover:border-lime-500 hover:bg-lime-500/5 transition-all group"
           >
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-lime-500 rotate-180" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-lime-600 dark:group-hover:text-lime-400">Copiar base de Semana {currentWeek - 1}</span>
           </Button>
        </div>
      )}

      <div className="space-y-4">
        {sortedRutinas.map(rutina => {
          const isOpened = isOpen(rutina.id);
          const ejs = (rutina.ejercicios_plan || []).sort((a, b) => a.orden - b.orden);

          return (
            <div key={rutina.id} className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-300">
               <button 
                onClick={() => toggleItem(rutina.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all"
               >
                 <div className="flex items-center gap-6">
                    <span className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                      isOpened ? "bg-zinc-950 text-white" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"
                    )}>
                      {rutina.dia_numero}
                    </span>
                    <h4 className="font-black text-lg text-zinc-950 dark:text-white uppercase tracking-tighter">
                      {rutina.nombre_dia || `Día ${rutina.dia_numero}`}
                    </h4>
                 </div>
                 <ChevronDown className={cn("w-5 h-5 text-zinc-300 transition-transform", isOpened && "rotate-180")} />
               </button>

               {isOpened && (
                 <div className="border-t border-zinc-50 dark:border-zinc-900 divide-y divide-zinc-50 dark:divide-zinc-900/50 animate-in fade-in slide-in-from-top-2">
                    {ejs.length === 0 ? (
                      <div className="py-12 text-center text-zinc-400 font-black text-[10px] uppercase tracking-widest">
                        Sin estructura de plan para este día
                      </div>
                    ) : (
                      ejs.map((ej, idx) => {
                        const overridesArray = Array.isArray(ej.ejercicio_plan_personalizado)
                          ? ej.ejercicio_plan_personalizado
                          : ej.ejercicio_plan_personalizado ? [ej.ejercicio_plan_personalizado] : [];
                        
                        // FILTRO POR SEMANA ACTIVA
                        const override = overridesArray.find((o: any) => o.alumno_id === alumnoId && o.semana_numero === currentWeek);

                        const effectiveEx = {
                          ...ej,
                          series: override?.series ?? ej.series,
                          reps_target: override?.reps_target ?? ej.reps_target,
                          descanso_seg: override?.descanso_seg ?? ej.descanso_seg,
                          peso_target: override?.peso_target ?? ej.peso_target
                        };

                        return (
                          <MetricConsoleRow 
                            key={ej.id}
                            alumnoId={alumnoId}
                            ej={effectiveEx}
                            onUpdate={(vals) => handleUpdateMetric(ej.id, vals)}
                          />
                        );
                      })
                    )}
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Componente de Fila Especializado: Consola Industrial ---
function MetricConsoleRow({ alumnoId, ej, onUpdate }: { alumnoId: string, ej: any, onUpdate: (vals: any) => void }) {
  const [history, setHistory] = useState<EjercicioLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (showHistory) { setShowHistory(false); return; }
    setLoadingHistory(true);
    const { data: res } = await actions.profesor.getExerciseHistory({ 
      alumno_id: alumnoId, 
      ejercicio_id: ej.biblioteca_ejercicios?.id || "" 
    });
    if (res?.success) setHistory(res.history);
    setShowHistory(true);
    setLoadingHistory(false);
  };

  return (
    <div className="p-6 space-y-4 group/row bg-zinc-50/50 dark:bg-zinc-900/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Info Ejercicio */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-800 shadow-lg group-hover/row:scale-105 transition-transform duration-500 overflow-hidden">
             {ej.biblioteca_ejercicios?.media_url ? (
               <img src={ej.biblioteca_ejercicios.media_url} className="w-full h-full object-cover" alt="" />
             ) : (
               <Dumbbell className="w-6 h-6 text-lime-400" />
             )}
          </div>
          <div className="min-w-0">
             <h5 className="font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-tight text-base leading-tight truncate">
               {ej.biblioteca_ejercicios?.nombre}
             </h5>
             <button 
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="flex items-center gap-1.5 mt-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-lime-500 transition-colors"
             >
                {loadingHistory ? (
                  <div className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-950 animate-spin rounded-full" />
                ) : (
                  <History className="w-3 h-3" />
                )}
                {athleteProfileCopy.workspace.routine.metricsTab.lastWeights}
             </button>
          </div>
        </div>

        {/* Consola de Inputs (Industrial Style) */}
        <div className="flex items-end gap-3 sm:gap-6 bg-zinc-100 dark:bg-zinc-950 p-2 sm:p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-inner">
           {/* Series */}
           <div className="flex flex-col gap-1.5">
             <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-3">Series</label>
             <input 
              type="number"
              defaultValue={ej.series}
              onBlur={(e) => onUpdate({ series: parseInt(e.target.value) || 0 })}
              className="w-14 sm:w-20 h-12 bg-white dark:bg-zinc-900 rounded-[1.25rem] border-none text-center font-black text-lg focus:ring-2 focus:ring-lime-400 transition-all dark:text-white"
             />
           </div>

           <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mb-3" />

           {/* Reps */}
           <div className="flex flex-col gap-1.5 text-center">
             <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Reps</label>
             <input 
              type="text"
              defaultValue={ej.reps_target}
              onBlur={(e) => onUpdate({ reps_target: e.target.value })}
              className="w-16 sm:w-24 h-12 bg-white dark:bg-zinc-900 rounded-[1.25rem] border-none text-center font-black text-lg focus:ring-2 focus:ring-lime-400 transition-all dark:text-white"
             />
           </div>

           <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mb-3" />

           {/* Peso (Input Principal) */}
           <div className="flex flex-col gap-1.5">
             <label className="text-[8px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 ml-3">Peso Target</label>
             <div className="relative group/input">
                <input 
                  type="text"
                  defaultValue={ej.peso_target}
                  onBlur={(e) => onUpdate({ peso_target: e.target.value })}
                  placeholder="0kg"
                  className="w-24 sm:w-36 h-12 bg-lime-400 dark:bg-lime-400 text-zinc-950 rounded-[1.25rem] border-none font-black text-xl px-5 focus:ring-4 focus:ring-lime-400/20 transition-all shadow-lg shadow-lime-500/10"
                />
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-900 opacity-20 group-hover/input:opacity-100 transition-opacity" />
             </div>
           </div>

           <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mb-3" />

           {/* Descanso */}
           <div className="flex flex-col gap-1.5">
             <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-3">Desc.</label>
             <input 
              type="number"
              defaultValue={ej.descanso_seg}
              onBlur={(e) => onUpdate({ descanso_seg: parseInt(e.target.value) || 0 })}
              className="w-14 sm:w-20 h-12 bg-white dark:bg-zinc-900 rounded-[1.25rem] border-none text-center font-black text-lg focus:ring-2 focus:ring-lime-400 transition-all dark:text-white"
             />
           </div>
        </div>
      </div>

      {/* Historial Lookback Panel */}
      {showHistory && (
        <div className="bg-zinc-100 dark:bg-zinc-900/40 p-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-300">
           <div className="flex items-center gap-2 mb-3 px-2">
             <Sparkles className="w-3 h-3 text-lime-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Últimos registros reportados por el atleta</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             {history.length > 0 ? history.map((log, i) => (
                <div key={i} className="bg-white dark:bg-zinc-950 p-3 rounded-2xl flex items-center justify-between border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:border-lime-500/50">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(log.fecha).toLocaleDateString()}</span>
                      <span className="text-sm font-black text-zinc-950 dark:text-zinc-100">{log.peso}kg <span className="text-zinc-400 font-medium">x {log.reps}</span></span>
                   </div>
                   {log.rpe && (
                     <div className="px-2 py-1 bg-fuchsia-500/10 rounded-lg">
                        <span className="text-[9px] font-black text-fuchsia-500 uppercase tracking-widest">RPE {log.rpe}</span>
                     </div>
                   )}
                </div>
             )) : (
               <div className="col-span-3 py-4 text-center">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Sin registros de entrenamiento previos</p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}
