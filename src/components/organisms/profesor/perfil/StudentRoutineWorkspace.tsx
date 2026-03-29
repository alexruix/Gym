import React, { useState } from "react";
import { Dumbbell, Clock, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";

// --- Tipos para la Rutina ---
interface EjercicioPlan {
  id: string;
  orden: number;
  series: number;
  reps_target: string;
  descanso_seg: number;
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
  rutinas_diarias: RutinaDiaria[];
}

interface Props {
  planData?: AssignedPlan | null;
}

export function StudentRoutineWorkspace({ planData }: Props) {
  const { workspace } = athleteProfileCopy;

  const [openRutinas, setOpenRutinas] = useState<Set<string>>(
    new Set(planData?.rutinas_diarias?.slice(0, 1).map((r) => r.id) || [])
  );

  const toggleRutina = (id: string) => {
    setOpenRutinas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!planData || !planData.rutinas_diarias || planData.rutinas_diarias.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950/40 rounded-3xl p-6 md:p-12 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center mt-1">
        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <Dumbbell className="w-8 h-8 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white uppercase mb-2">
          {workspace.routine.emptyState.title}
        </h3>
        <p className="text-sm font-medium text-zinc-500 mb-8 max-w-sm">
          {workspace.routine.emptyState.description}
        </p>
        <Button
          onClick={() => window.location.href = '/profesor/planes'}
          className="gap-2 bg-lime-400 text-zinc-950 hover:bg-lime-500 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 px-6"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {workspace.routine.emptyState.btnLabel}
        </Button>
      </div>
    );
  }

  // Ordenar rutinas y ejercicios para mostrar correctamente
  const sortedRutinas = [...planData.rutinas_diarias].sort((a, b) => a.dia_numero - b.dia_numero);

  return (
    <div className="bg-white dark:bg-zinc-950/40 rounded-3xl p-4 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 mt-1">
      {/* Cabecera */}
      <div className="px-2">
        <h3 className="text-lg md:text-xl font-black tracking-tighter text-zinc-950 dark:text-white flex items-center gap-3 uppercase">
          {workspace.routine.title}
          <span className="text-[10px] font-black text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/40 px-3 py-1 rounded-full border border-lime-200 dark:border-lime-500/20 uppercase tracking-widest">
            {planData.nombre}
          </span>
        </h3>
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
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400 transition-transform" aria-hidden="true" />
                )}
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
                        <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
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
                        </div>

                        {/* Info Principal */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-zinc-950 dark:text-white text-base md:text-sm uppercase tracking-tight truncate mb-1 md:mb-0">
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
    </div>
  );
}
