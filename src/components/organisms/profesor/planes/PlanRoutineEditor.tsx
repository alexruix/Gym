import { Copy, Plus, Dumbbell, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/molecules/profesor/planes/ExerciseCard";
import { ActionBridge } from "@/components/molecules/profesor/planes/ActionBridge";

interface Props {
  form: any;
  currentExercises: any[];
  routineIdx: number;
  activeDiaAbsoluto: number;
  currentWeek: number;
  freqSemanal: number;
  isTemplate: boolean;
  actions: {
    addExercise: (id: string) => void;
    removeExercise: (rIdx: number, eIdx: number) => void;
    moveExercise: (rIdx: number, eIdx: number, dir: "up" | "down") => void;
    getExerciseName: (id: string) => string;
    setIsBulkOpen: (val: boolean) => void;
    setRotationEditing: (val: any) => void;
    handleRemoveRotationExercise: (p: number, id: string) => void;
  };
  onOpenLibrary: () => void;
}

/**
 * PlanRoutineEditor: Zona central de edición de ejercicios para un día específico.
 */
export function PlanRoutineEditor({
  form,
  currentExercises,
  routineIdx,
  activeDiaAbsoluto,
  currentWeek,
  freqSemanal,
  isTemplate,
  actions,
  onOpenLibrary
}: Props) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
        <div className="space-y-1 group relative">
          <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Semana {currentWeek}</span>
          <div className="relative flex items-center gap-3 max-w-fit group">
            <div className="relative">
              <input
                {...form.register(`rutinas.${routineIdx}.nombre_dia`)}
                placeholder={`Rutina ${activeDiaAbsoluto - (currentWeek - 1) * freqSemanal}`}
                className="text-2xl font-bold tracking-tighter text-zinc-950 dark:text-zinc-100 uppercase bg-transparent border-none focus:ring-0 focus:outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-800 pr-4"
              />
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-zinc-100 dark:bg-zinc-900 group-focus-within:bg-lime-500 transition-colors" />
            </div>
            <Pencil className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0 opacity-90 group-focus-within:opacity-0 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center gap-2">
           {currentExercises.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => actions.setIsBulkOpen(true)}
              className="rounded-xl border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </Button>
          )}
          <Button
            type="button"
            variant="industrial"
            size="sm"
            onClick={onOpenLibrary}
            className="rounded-xl lg:hidden"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Biblioteca
          </Button>
        </div>
      </div>

      <div className="space-y-4 min-h-[300px]">
        {currentExercises.length === 0 ? (
            <ActionBridge
              icon={Dumbbell}
              title="Rutina vacía"
              description="Diseñá un entrenamiento de alto rendimiento desde el panel derecho."
              actionLabel="Acceder a biblioteca"
              onAction={onOpenLibrary}
            />
        ) : (
          <div className="space-y-4">
            {currentExercises.map((ex: any, exIdx: number) => {
              const isPrevInSameBlock = exIdx > 0 && currentExercises[exIdx - 1]?.grupo_bloque_id === ex.grupo_bloque_id && !!ex.grupo_bloque_id;
              const isNextInSameBlock = exIdx < currentExercises.length - 1 && currentExercises[exIdx + 1]?.grupo_bloque_id === ex.grupo_bloque_id && !!ex.grupo_bloque_id;

              return (
                <ExerciseCard
                  key={ex.position || exIdx}
                  form={form}
                  routineIdx={routineIdx}
                  exerciseIdx={exIdx}
                  exercise={ex}
                  isTemplate={isTemplate}
                  getExerciseName={actions.getExerciseName}
                  removeExercise={actions.removeExercise}
                  onMove={(dir: "up" | "down") => actions.moveExercise(routineIdx, exIdx, dir)}
                  isFirst={exIdx === 0}
                  isLast={exIdx === currentExercises.length - 1}
                  onEditRotation={(ri, ei) => actions.setRotationEditing({ routineIdx: ri, exerciseIdx: ei })}
                  hasRotation={(pos) => form.watch("rotaciones")?.some((r: any) => r.position === pos)}
                  getRotationForPosition={(pos) => form.watch("rotaciones")?.find((r: any) => r.position === pos)}
                  removeRotationExercise={actions.handleRemoveRotationExercise}
                  
                  isInBlock={!!ex.grupo_bloque_id}
                  isPrevInSameBlock={isPrevInSameBlock}
                  isNextInSameBlock={isNextInSameBlock}
                  blockType={ex.grupo_tipo_bloque}
                  blockLaps={ex.grupo_vueltas}
                />
              );
            })}

            <button
              type="button"
              onClick={onOpenLibrary}
              className="w-full py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-lime-500 hover:border-lime-500/50 hover:bg-lime-500/[0.02] transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-zinc-950 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Siguiente elemento</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
