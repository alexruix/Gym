import { Card } from "@/components/ui/card";
import { Trash2, ChevronUp, ChevronDown, Info, Dumbbell, Layers, Box } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  routineIdx?: number;
  exerciseIdx: number;
  exercise: any;
  getExerciseName: (id: string) => string;
  removeExercise: (routineIdx: number, exerciseIdx: number) => void;
  onSwap?: () => void;
  onMove?: (direction: "up" | "down") => void;
  isFirst?: boolean;
  isLast?: boolean;

  // Rotation / Personalized Props
  form?: any;
  onEditRotation?: (routineIdx: number, exerciseIdx: number) => void;
  hasRotation?: (position: number) => boolean;
  getRotationForPosition?: (position: number) => any;
  removeRotationExercise?: (position: number, exerciseId: string) => void;
  readOnly?: boolean;
}

/**
 * ExerciseCard: Molécula central para la visualización estructural del plan.
 * Enfocada en la claridad técnica y el ordenamiento.
 */
export function ExerciseCard({
  routineIdx = 0,
  exerciseIdx,
  exercise: ex,
  getExerciseName,
  removeExercise,
  onSwap,
  onMove,
  isFirst,
  isLast,
  onEditRotation,
  hasRotation,
  getRotationForPosition,
  removeRotationExercise,
  readOnly = false
}: ExerciseCardProps) {
  const ejId = ex.ejercicio_id || ex.ejercicio_plan?.ejercicio_id || ex.biblioteca_ejercicios?.id;
  const rotationActive = hasRotation?.(ex.position);
  const rotationData = getRotationForPosition?.(ex.position);

  return (
    <Card
      className={cn(
        "industrial-card-md group",
        rotationActive && "border-lime-500/30 bg-lime-500/[0.02]"
      )}
    >
      {/* Botón Eliminar (Contextual) */}
      {!readOnly && (
        <button
          type="button"
          onClick={() => removeExercise(routineIdx, exerciseIdx)}
          className="absolute -top-3 -right-3 p-3 bg-white dark:bg-zinc-950 text-red-500 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-red-500/10 hover:bg-red-500 hover:text-white transition-all sm:opacity-0 group-hover:opacity-100 z-20"
          title="Quitar ejercicio"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center gap-6">
        {/* Reordering Controls (Only if onMove exists & NOT readOnly) */}
        {(onMove && !readOnly) && (
          <div className="flex flex-col gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              disabled={isFirst}
              onClick={() => onMove("up")}
              className="p-1.5 text-ui-muted hover:text-lime-500 disabled:opacity-0 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              disabled={isLast}
              onClick={() => onMove("down")}
              className="p-1.5 text-ui-muted hover:text-lime-500 disabled:opacity-0 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Thumbnail Técnico */}
        <div className="industrial-thumbnail group/thumb">
          {ex.biblioteca_ejercicios?.media_url ? (
            <img src={ex.biblioteca_ejercicios.media_url} className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity" alt="" />
          ) : (
            <Dumbbell className="w-6 h-6 text-zinc-500 dark:text-zinc-600" />
          )}
          <div className="absolute top-0 left-0 p-1.5">
            <div className="w-5 h-5 rounded-lg bg-lime-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold italic shadow-inner">
              {exerciseIdx + 1}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xl text-zinc-950 dark:text-zinc-50 tracking-tighter leading-none group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors truncate">
              {getExerciseName(ejId)}
            </h5>
            {ex.grupo_nombre && (
              <span className="industrial-label mt-1 flex items-center gap-1.5 opacity-70">
                <Box className="w-3 h-3 text-lime-500" /> {ex.grupo_nombre}
              </span>
            )}

            {rotationActive && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-lime-500/10 text-lime-600 dark:text-lime-400 text-[8px] font-bold uppercase tracking-widest rounded-full border border-lime-400/20">
                <span className="w-1 h-1 rounded-full bg-lime-500 animate-pulse" />
                Rotación: {rotationData?.cycles[0]?.exercises?.length || 2} variantes
              </span>
            )}
          </div>

          <div className="flex gap-4 items-center">
            {(onSwap && !readOnly) && (
              <button
                type="button"
                onClick={onSwap}
                className="flex items-center gap-2 industrial-label text-[9px] hover:text-lime-500 transition-colors"
              >
                <Info className="w-3 h-3" />
                Intercambiar Variación
              </button>
            )}

            {(onEditRotation && !readOnly) && (
              <button
                type="button"
                onClick={() => onEditRotation(routineIdx, exerciseIdx)}
                className="flex items-center gap-2 industrial-label text-[9px] hover:text-lime-500 transition-colors"
              >
                <Layers className="w-3 h-3" />
                {rotationActive ? "Gestionar Rotación" : "Añadir Rotación"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
