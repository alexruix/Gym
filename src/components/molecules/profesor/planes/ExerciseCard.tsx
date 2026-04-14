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
  isTemplate?: boolean;
  onEditRotation?: (routineIdx: number, exerciseIdx: number) => void;
  hasRotation?: (position: number) => boolean;
  getRotationForPosition?: (position: number) => any;
  removeRotationExercise?: (position: number, exerciseId: string) => void;
  readOnly?: boolean;

  // Block Protocol Props (Visual Rail)
  isInBlock?: boolean;
  isPrevInSameBlock?: boolean;
  isNextInSameBlock?: boolean;
  blockType?: 'superserie' | 'circuito' | 'agrupador';
  blockLaps?: number;
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
  form,
  isTemplate = true,
  onEditRotation,
  hasRotation,
  getRotationForPosition,
  removeRotationExercise,
  readOnly = false,
  isInBlock = false,
  isPrevInSameBlock = false,
  isNextInSameBlock = false,
  blockType = 'agrupador',
  blockLaps = 1
}: ExerciseCardProps) {
  const ejId = ex.ejercicio_id || ex.ejercicio_plan?.ejercicio_id || ex.biblioteca_ejercicios?.id;
  const rotationActive = hasRotation?.(ex.position);
  const rotationData = getRotationForPosition?.(ex.position);

  // Helper para actualizar valores si no es template (Deep Sync)
  const updateMetric = (field: string, value: any) => {
    if (!form || isTemplate) return;
    form.setValue(`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.${field}`, value);
  };

  return (
    <Card
      className={cn(
        "industrial-card-md group relative overflow-visible transition-all duration-500",
        rotationActive && "border-lime-500/30 bg-lime-500/[0.02]",
        isInBlock && "ml-4 border-l-0 rounded-l-none"
      )}
    >
      {/* Visual Rail Side (Intensity Connector) */}
      {isInBlock && (
        <div className={cn(
          "absolute -left-4 top-0 bottom-0 w-4 flex flex-col items-center",
          isPrevInSameBlock && "-top-4",
          isNextInSameBlock && "-bottom-4"
        )}>
          {/* Connector Line */}
          <div className={cn(
            "w-1.5 h-full transition-colors duration-700",
            blockType === 'superserie' ? "bg-fuchsia-500 shadow-[0_0_10px_rgba(232,28,210,0.3)]" : 
            blockType === 'circuito' ? "bg-lime-500 border-x border-lime-500/30 bg-repeat-y bg-[length:1px_8px] bg-gradient-to-b from-lime-500 to-transparent" : 
            "bg-zinc-200 dark:bg-zinc-800",
            !isPrevInSameBlock && "rounded-t-full h-[calc(100%-12px)] mt-3",
            !isNextInSameBlock && "rounded-b-full h-[calc(100%-12px)] mb-3",
            isPrevInSameBlock && isNextInSameBlock && "h-full"
          )} />
          
          {/* Rail Indicator for Laps or Protocol */}
          {!isPrevInSameBlock && (
             <div className={cn(
               "absolute -left-1 top-3 px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-tighter whitespace-nowrap shadow-xl border z-30",
               blockType === 'superserie' ? "bg-zinc-950 text-fuchsia-400 border-fuchsia-500/50" : "bg-zinc-950 text-lime-400 border-lime-500/50"
             )}>
               {blockType === 'circuito' ? `CIRCUITO x${blockLaps}` : blockType?.toUpperCase()}
             </div>
          )}
        </div>
      )}
      {/* Botón Eliminar (Contextual) */}
      {!readOnly && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); removeExercise(routineIdx, exerciseIdx); }}
          className="absolute -top-3 -right-3 p-3 bg-white dark:bg-zinc-950 text-red-500 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-red-500/10 hover:bg-red-500 hover:text-white transition-all sm:opacity-0 group-hover:opacity-100 z-50 pointer-events-auto"
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
              type="button"
              disabled={isFirst}
              onClick={() => onMove("up")}
              className="p-1.5 text-ui-muted hover:text-lime-500 disabled:opacity-0 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={() => onMove("down")}
              className="p-1.5 text-ui-muted hover:text-lime-500 disabled:opacity-0 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Thumbnail Técnico */}
        <div className="industrial-thumbnail group/thumb overflow-hidden shrink-0">
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

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <h5 className="font-bold text-lg md:text-xl text-zinc-950 dark:text-zinc-50 tracking-tighter leading-none group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors truncate">
                {getExerciseName(ejId)}
              </h5>
              
              {/* METADATA: SOLO EN MODO PERSONALIZACIÓN (NO ADN) */}
              {!isTemplate && (
                <div className="flex items-center gap-4 animate-in fade-in duration-500">
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      value={ex.series || ""}
                      onChange={(e) => updateMetric("series", parseInt(e.target.value) || 0)}
                      placeholder="3"
                      className="w-10 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center text-[10px] font-bold focus:ring-1 focus:ring-lime-500 border-none outline-none" 
                    />
                    <span className="text-[10px] font-bold text-zinc-400">×</span>
                    <input 
                      type="text" 
                      value={ex.reps_target || ""}
                      onChange={(e) => updateMetric("reps_target", e.target.value)}
                      placeholder="12"
                      className="w-12 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center text-[10px] font-bold focus:ring-1 focus:ring-lime-500 border-none outline-none" 
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400">@</span>
                    <input 
                      type="text" 
                      value={ex.peso_target || ""}
                      onChange={(e) => updateMetric("peso_target", e.target.value)}
                      placeholder="--"
                      className="w-16 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center text-[10px] font-bold focus:ring-1 focus:ring-lime-500 border-none outline-none" 
                    />
                    <span className="text-[10px] font-bold text-zinc-400 lowercase">kg</span>
                  </div>
                </div>
              )}
            </div>

            {ex.grupo_nombre && (
              <span className="industrial-label flex items-center gap-1.5 opacity-70 shrink-0">
                <Box className="w-3 h-3 text-lime-500" /> {ex.grupo_nombre}
              </span>
            )}
            {isInBlock && !isNextInSameBlock && (
              <div className="flex gap-2 shrink-0">
                {blockType === 'circuito' && (ex.grupo_descanso_ronda > 0) && (
                   <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[7px] font-black uppercase rounded-full border border-amber-500/20">
                     Ronda: {ex.grupo_descanso_ronda}s
                   </span>
                )}
                {ex.grupo_descanso_final > 0 && (
                   <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[7px] font-black uppercase rounded-full border border-zinc-200 dark:border-zinc-700">
                     Final: {ex.grupo_descanso_final}s
                   </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 items-center">
            {rotationActive && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-lime-500/10 text-lime-600 dark:text-lime-400 text-[8px] font-bold uppercase tracking-widest rounded-full border border-lime-400/20">
                <span className="w-1 h-1 rounded-full bg-lime-500 animate-pulse" />
                Variantes: {rotationData?.cycles[0]?.exercises?.length || 2}
              </span>
            )}

            <div className="flex items-center gap-4 ml-auto">
              {(onSwap && !readOnly) && (
                <button
                  type="button"
                  onClick={onSwap}
                  className="flex items-center gap-2 industrial-label text-[9px] hover:text-lime-500 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  Variación
                </button>
              )}

              {(onEditRotation && !readOnly) && (
                <button
                  type="button"
                  onClick={() => onEditRotation(routineIdx, exerciseIdx)}
                  className="flex items-center gap-2 industrial-label text-[9px] hover:text-lime-500 transition-colors"
                >
                  <Layers className="w-3 h-3" />
                  {rotationActive ? "Rotación" : "Añadir Rotación"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
