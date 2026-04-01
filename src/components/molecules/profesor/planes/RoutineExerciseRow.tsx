import { ChevronUp, ChevronDown, Dumbbell, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseInfo {
  id: string;
  nombre: string;
  media_url: string | null;
}

interface RoutineExerciseRowProps {
  exercise: {
    id: string;
    series: number;
    reps_target: string;
    descanso_seg: number;
    peso_target?: string;
    biblioteca_ejercicios: ExerciseInfo | null;
  };
  index: number;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
  onDelete?: () => void;
  onChange?: (updates: Partial<{ series: number; reps_target: string; descanso_seg: number; peso_target: string }>) => void;
  onSwap?: () => void;
  onMove?: (direction: "up" | "down") => void;
  hideMetrics?: boolean;
}

/**
 * RoutineExerciseRow: Molécula técnica que representa un ejercicio interactivo.
 * Permite editar métricas inline y reordenar la secuencia técnica.
 */
export function RoutineExerciseRow({ 
  exercise, 
  index, 
  isFirst,
  isLast,
  className, 
  onDelete, 
  onChange,
  onSwap,
  onMove,
  hideMetrics = false
}: RoutineExerciseRowProps) {
  const ej = exercise.biblioteca_ejercicios;

  const handleMetricChange = (field: string, value: string | number) => {
    onChange?.({ [field]: value });
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all duration-300 group/ej border-l-2 border-transparent hover:border-lime-400 relative",
      className
    )}>
      {/* 1. INFO BASE + REORDER */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button 
            disabled={isFirst}
            onClick={() => onMove?.("up")}
            className="text-zinc-300 hover:text-lime-500 disabled:opacity-0 transition-colors pt-1"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 shadow-inner group-hover/ej:bg-zinc-950 group-hover/ej:text-white transition-colors">
            {index + 1}
          </div>
          <button 
            disabled={isLast}
            onClick={() => onMove?.("down")}
            className="text-zinc-300 hover:text-lime-500 disabled:opacity-0 transition-colors pb-1"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
          {ej?.media_url ? (
            <img src={ej.media_url} alt={ej.nombre} className="w-full h-full object-cover" />
          ) : (
            <Dumbbell className="w-5 h-5 text-zinc-300" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-black text-zinc-950 dark:text-white text-sm uppercase tracking-tight truncate leading-tight">
            {ej?.nombre || "Ejercicio"}
          </h4>
          <button 
            onClick={onSwap}
            className="flex items-center gap-1.5 mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-lime-500 transition-colors"
          >
            <Info className="w-3 h-3" />
            Variaciones disponibles
          </button>
        </div>
      </div>

      {/* 2. MÉTRICAS INLINE (MODO EXCEL) */}
      {!hideMetrics && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 shrink-0 sm:pr-4">
          {/* Series */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Series</label>
            <input 
              type="number"
              defaultValue={exercise.series}
              onBlur={(e) => handleMetricChange("series", parseInt(e.target.value) || 0)}
              className="w-full sm:w-16 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center font-black text-xs text-zinc-950 dark:text-white focus:border-lime-400 focus:ring-0 transition-colors"
            />
          </div>

          {/* Reps */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Reps</label>
            <input 
              type="text"
              defaultValue={exercise.reps_target}
              onBlur={(e) => handleMetricChange("reps_target", e.target.value)}
              placeholder="12"
              className="w-full sm:w-16 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center font-black text-xs text-zinc-950 dark:text-white focus:border-lime-400 focus:ring-0 transition-colors"
            />
          </div>

          {/* Peso Target */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Peso</label>
            <input 
              type="text"
              defaultValue={exercise.peso_target || ""}
              onBlur={(e) => handleMetricChange("peso_target", e.target.value)}
              placeholder="80kg"
              className="w-full sm:w-20 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center font-black text-xs text-zinc-950 dark:text-white focus:border-lime-400 focus:ring-0 transition-colors"
            />
          </div>

          {/* Descanso */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Desc.</label>
            <input 
              type="number"
              defaultValue={exercise.descanso_seg}
              onBlur={(e) => handleMetricChange("descanso_seg", parseInt(e.target.value) || 0)}
              className="w-full sm:w-16 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center font-black text-xs text-zinc-950 dark:text-white focus:border-lime-400 focus:ring-0 transition-colors"
            />
          </div>
        </div>
      )}

      {/* 3. ACCIONES */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
        className="opacity-0 group-hover/ej:opacity-100 p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300 ml-2"
        title="Eliminar de la rutina"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
