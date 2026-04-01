import React from "react";
import { Dumbbell, Clock, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineEdit } from "@/components/atoms/profesor/planes/InlineEdit";

interface ExerciseInfo {
  nombre: string;
  media_url: string | null;
}

interface RoutineExerciseRowProps {
  exercise: {
    id: string;
    series: number;
    reps_target: string;
    descanso_seg: number;
    biblioteca_ejercicios: ExerciseInfo | null;
  };
  index: number;
  className?: string;
  onUpdate?: (field: string, value: string | number) => void;
  onDelete?: () => void;
}

/**
 * RoutineExerciseRow: Molécula técnica que representa un ejercicio dentro de una rutina.
 * Ahora soporta edición "In-Place" y eliminación optimista.
 */
export function RoutineExerciseRow({ exercise, index, className, onUpdate, onDelete }: RoutineExerciseRowProps) {
  const ej = exercise.biblioteca_ejercicios;

  return (
    <div className={cn(
      "flex items-center gap-4 px-6 py-5 bg-white dark:bg-zinc-950 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-all duration-300 group/ej border-l-2 border-transparent hover:border-lime-400 relative",
      className
    )}>
      {/* Index Badge */}
      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-black text-zinc-500 shrink-0 shadow-inner group-hover/ej:bg-zinc-950 group-hover/ej:text-white transition-colors duration-500">
        {index + 1}
      </div>

      {/* Thumbnail / Icon */}
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 transition-all group-hover/ej:shadow-lg group-hover/ej:shadow-zinc-950/10 dark:group-hover/ej:shadow-none">
        {ej?.media_url ? (
          <img
            src={ej.media_url}
            alt={ej.nombre}
            className="w-full h-full object-cover group-hover/ej:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <Dumbbell className="w-6 h-6 text-zinc-300 dark:text-zinc-600 transition-transform group-hover/ej:rotate-12" aria-hidden="true" />
        )}
      </div>

      {/* Exercise Name */}
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-zinc-950 dark:text-white text-base uppercase tracking-tight truncate leading-tight">
          {ej?.nombre || "Ejercicio no disponible"}
        </h4>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Técnica estándar
            </span>
            <Info className="w-3 h-3 text-zinc-300 group-hover/ej:text-lime-500 transition-colors" />
        </div>
      </div>

      {/* Technical Data Grid (Desktop) */}
      <div className="hidden md:flex items-center gap-6 shrink-0 h-full">
        <div className="flex flex-col items-center justify-center min-w-[50px]">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Series</span>
          <InlineEdit 
            type="number" 
            value={exercise.series} 
            onChange={(val) => onUpdate?.("series", val)}
            className="text-xl font-black text-zinc-950 dark:text-zinc-50 leading-none"
          />
        </div>
        
        <div className="w-px h-10 bg-zinc-100 dark:bg-zinc-800" />
        
        <div className="flex flex-col items-center justify-center min-w-[50px]">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Reps</span>
          <InlineEdit 
            value={exercise.reps_target} 
            onChange={(val) => onUpdate?.("reps_target", val)}
            className="text-xl font-black text-zinc-950 dark:text-zinc-50 leading-none lowercase"
          />
        </div>
        
        <div className="w-px h-10 bg-zinc-100 dark:bg-zinc-800" />
        
        <div className="flex flex-col items-center justify-center min-w-[65px] bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-xl border border-transparent group-hover/ej:border-zinc-200 dark:group-hover/ej:border-zinc-800 transition-all">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> Descanso
          </span>
          <div className="flex items-baseline gap-0.5">
            <InlineEdit 
                type="number" 
                value={exercise.descanso_seg} 
                onChange={(val) => onUpdate?.("descanso_seg", val)}
                className="text-xl font-black text-zinc-950 dark:text-zinc-50 leading-none"
            />
            <span className="text-[10px] font-black text-zinc-400">s</span>
          </div>
        </div>
      </div>

      {/* Delete Action (Hover only) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
        className="opacity-0 group-hover/ej:opacity-100 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300 ml-2"
        title="Eliminar de la rutina"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Mobile Metrics (Compact) */}
      <div className="md:hidden flex items-center gap-1 shrink-0">
        <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
            <span className="text-[11px] font-black text-zinc-950 dark:text-zinc-50">
                {exercise.series}×{exercise.reps_target.toLowerCase()}
            </span>
        </div>
      </div>
    </div>
  );
}
