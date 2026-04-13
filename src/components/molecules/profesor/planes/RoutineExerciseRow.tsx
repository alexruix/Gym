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
    notas?: string;
    biblioteca_ejercicios: ExerciseInfo | null;
  };
  index: number;
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
  onDelete?: () => void;
  onChange?: (updates: Partial<{ series: number; reps_target: string; descanso_seg: number; peso_target: string; notas: string }>) => void;
  onSwap?: () => void;
  onMove?: (direction: "up" | "down") => void;
  hideMetrics?: boolean;
  readOnly?: boolean;
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
  hideMetrics = false,
  readOnly = false
}: RoutineExerciseRowProps) {
  const ej = exercise.biblioteca_ejercicios;

  const handleMetricChange = (field: string, value: string | number) => {
    onChange?.({ [field]: value });
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all duration-300 group/ej border-l-2 border-transparent hover:border-lime-400 relative",
      className
    )}>
      {/* 1. INFO BASE + REORDER */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {(!readOnly && onMove) && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              disabled={isFirst}
              onClick={() => onMove?.("up")}
              className="text-zinc-300 hover:text-lime-500 disabled:opacity-0 transition-colors pt-1"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shadow-inner group-hover/ej:bg-zinc-950 group-hover/ej:text-white transition-colors">
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
        )}

        {readOnly && (
          <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shadow-inner shrink-0 leading-none">
            {index + 1}
          </div>
        )}

        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
          {ej?.media_url ? (
            <img src={ej.media_url} alt={ej.nombre} className="w-full h-full object-cover" />
          ) : (
            <Dumbbell className="w-5 h-5 text-zinc-300" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2 sm:pr-4">
          <h4 className="font-bold text-zinc-950 dark:text-white text-[13px] sm:text-sm uppercase tracking-tight truncate leading-tight">
            {ej?.nombre || "Ejercicio"}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            {(!readOnly && onSwap) && (
              <button
                onClick={onSwap}
                className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-lime-500 transition-colors"
              >
                <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Variaciones
              </button>
            )}
            {ej?.media_url && (
               <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-500">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Con Video
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MÉTRICAS INLINE + NOTAS (SOLO SI NO ESTÁN OCULTAS) */}
      <div className="flex-1 flex flex-col gap-4">
        {!hideMetrics && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Series */}
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Series</label>
              <input
                type="number"
                defaultValue={exercise.series}
                onBlur={(e) => handleMetricChange("series", parseInt(e.target.value) || 0)}
                readOnly={readOnly}
                className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-center font-bold text-xs text-zinc-950 dark:text-white focus:border-lime-500 focus:ring-0 transition-all shadow-inner"
              />
            </div>

            {/* Reps */}
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Reps</label>
              <input
                type="text"
                defaultValue={exercise.reps_target}
                onBlur={(e) => handleMetricChange("reps_target", e.target.value)}
                placeholder="10"
                readOnly={readOnly}
                className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-center font-bold text-xs text-zinc-950 dark:text-white focus:border-lime-500 focus:ring-0 transition-all shadow-inner"
              />
            </div>

            {/* Peso */}
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Peso (Kg)</label>
              <input
                type="text"
                defaultValue={exercise.peso_target || ""}
                onBlur={(e) => handleMetricChange("peso_target", e.target.value)}
                placeholder="60"
                readOnly={readOnly}
                className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-center font-bold text-xs text-zinc-950 dark:text-white focus:border-lime-500 focus:ring-0 transition-all shadow-inner"
              />
            </div>

            {/* Descanso */}
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">Desc. (min)</label>
              <input
                type="text"
                defaultValue={exercise.descanso_seg}
                onBlur={(e) => handleMetricChange("descanso_seg", e.target.value)}
                placeholder="2:00"
                readOnly={readOnly}
                className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-center font-bold text-xs text-zinc-950 dark:text-white focus:border-lime-500 focus:ring-0 transition-all shadow-inner"
              />
            </div>
          </div>
        )}

        {/* NOTAS TÉCNICAS (VOSEO) */}
        <div className="relative group/notes">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500 opacity-50 group-hover/notes:opacity-100 transition-opacity">
              <Info className="w-3.5 h-3.5" />
           </div>
           <input
             type="text"
             defaultValue={exercise.notas || ""}
             onBlur={(e) => handleMetricChange("notas", e.target.value)}
             placeholder="Anotale acá los detalles de la técnica..."
             readOnly={readOnly}
             className="w-full pl-9 pr-4 py-2 bg-transparent border-b border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 focus:text-zinc-950 dark:focus:text-white focus:border-lime-500 transition-all outline-none italic placeholder:italic"
           />
        </div>
      </div>

      {/* 3. ACCIONES */}
      {(!readOnly && onDelete) && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="sm:opacity-0 group-hover/ej:opacity-100 p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300 ml-2 h-fit self-start sm:self-center"
          title="Eliminar de la rutina"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
