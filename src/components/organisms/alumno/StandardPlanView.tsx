import React, { useState } from 'react';
import { BlueprintExerciseCard } from '@/components/molecules/alumno/BlueprintExerciseCard';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { BlueprintGrid } from '@/components/organisms/alumno/BlueprintGrid';
import { ViewToggle } from '@/components/molecules/ViewToggle';
import { planData } from '@/data/es/alumno/plan';
import { BookOpen, Hash, Dumbbell, Layers, ClipboardList, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StandardPlanViewProps {
  planDataRaw: any;
}

/**
 * StandardPlanView: Consola de ADN Deportivo del Alumno.
 * Permite visualizar la planificación técnica en formato Blueprint (Grilla) o Listado.
 */
export function StandardPlanView({ planDataRaw }: StandardPlanViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const rutinas = (planDataRaw?.rutinas_diarias || []).sort((a: any, b: any) => a.dia_numero - b.dia_numero);
  const isEmpty = !planDataRaw || rutinas.length === 0;

  /**
   * getGroupedExercises: Agrupo ejercicios por bloque (Superseries/Circuitos)
   * siguiendo la lógica del SSOT compartida con el profesor.
   */
  const getGroupedExercises = (ejs: any[]) => {
    const groups: any[] = [];
    let currentGroup: any = { id: null, nombre: null, exercises: [] };

    ejs.sort((a, b) => (a.orden || 0) - (b.orden || 0)).forEach(ex => {
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
  };

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-in fade-in duration-1000">
        <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900 border border-dashed border-zinc-800 flex items-center justify-center rotate-6 shadow-2xl">
          <BookOpen className="w-10 h-10 text-zinc-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
            {planData.emptyState.title}
          </h2>
          <p className="text-zinc-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
            {planData.emptyState.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-32 animate-in fade-in duration-700">
      
      {/* CABECERA INDUSTRIAL DE PLANIFICACIÓN */}
      <header className="relative p-8 md:p-12 rounded-[3.5rem] bg-zinc-950 border border-white/5 overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/5 blur-[100px] -mr-40 -mt-40 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 blur-[100px] -ml-32 -mb-32 rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-lime-400 border border-white/5 shadow-xl transition-transform group-hover:rotate-3">
                        <Layers className="w-7 h-7" />
                    </div>
                    <div>
                        <TechnicalLabel className="text-zinc-500 mb-1">{planData.header.label}</TechnicalLabel>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                            {planDataRaw?.nombre}
                        </h1>
                    </div>
                </div>

                {planDataRaw?.descripcion && (
                    <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-md italic">
                        "{planDataRaw.descripcion}"
                    </p>
                )}

                <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md">
                        <Hash className="w-4 h-4 text-zinc-600" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase leading-none">
                                {planDataRaw?.duracion_semanas}
                            </span>
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                {planData.metadata.duration.unit}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md">
                        <Dumbbell className="w-4 h-4 text-zinc-600" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase leading-none">
                                {planDataRaw?.frecuencia_semanal}
                            </span>
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                {planData.metadata.frequency.unit}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOGGLE DE VISTA (PWA MOBILE OPTIMIZED) */}
            <div className="flex justify-end">
                <ViewToggle 
                    view={viewMode}
                    onChange={setViewMode}
                    className="p-1.5 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl"
                />
            </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL SEGÚN VISTA */}
      <main className="space-y-12">
        {viewMode === "grid" ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <BlueprintGrid 
                routines={rutinas}
                getGroupedExercises={getGroupedExercises}
                className="-mx-4 px-4"
            />
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {rutinas.map((rutina: any) => (
              <section key={rutina.id} className="space-y-8">
                {/* RUTINA HEADER (ALUMNO STYLE) */}
                <div className="flex items-end justify-between px-2">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-lime-400 text-black flex items-center justify-center font-black text-2xl shadow-2xl shadow-lime-500/20 italic rotate-2 transition-transform hover:rotate-6">
                            D{rutina.dia_numero}
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
                                {rutina.nombre_dia || `Día ${rutina.dia_numero}`}
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-white/5">
                                    <ClipboardList className="w-3 h-3 text-lime-400" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                        {rutina.ejercicios_plan?.length || 0} Movimientos
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOQUES DE EJERCICIOS */}
                <div className="grid gap-4">
                  {getGroupedExercises(rutina.ejercicios_plan || []).map((group, gIdx) => (
                    <div key={group.id || `unbound-${gIdx}`} className={cn(
                        "rounded-[2.5rem] overflow-hidden transition-all",
                        group.id ? "bg-lime-500/[0.03] border border-lime-500/10 p-2" : "space-y-3"
                    )}>
                        {group.nombre && (
                            <div className="px-6 py-3 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-xl bg-lime-500/10 flex items-center justify-center">
                                    <Hash className="w-3.5 h-3.5 text-lime-500" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 italic">
                                    {group.nombre}
                                </span>
                            </div>
                        )}
                        
                        <div className={cn("grid gap-3", group.id && "bg-black/20 rounded-[2rem] p-1")}>
                            {group.exercises.map((ej: any, idx: number) => (
                                <BlueprintExerciseCard 
                                    key={ej.id} 
                                    ej={ej} 
                                    index={idx} 
                                />
                            ))}
                        </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER INFO */}
      <footer className="mt-12 p-12 border-2 border-dashed border-zinc-900 rounded-[4rem] text-center space-y-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-lime-400/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <Info className="w-10 h-10 text-zinc-800 mx-auto transition-transform group-hover:scale-110" />
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto italic">
                {planData.footer.message}
            </p>
            <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest">
                Versión de planificación v2.0
            </p>
          </div>
      </footer>
    </div>
  );
}
