import { Clock, Copy, Trash2, ChevronRight, Plus, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoutineExerciseRow } from "@/components/molecules/profesor/planes/RoutineExerciseRow";

interface Props {
  rutina: any;
  isOpen: boolean;
  onToggle: () => void;
  onAddExercise: (rutinaId: string) => void;
  onAddBlock: (rutinaId: string) => void;
  onDuplicate: (rutinaId: string) => void;
  onDelete: (rutinaId: string) => void;
  onUpdateMetrics: (id: string, updates: any) => void;
  onMoveExercise: (id: string, dir: "up" | "down") => void;
  onDeleteExercise: (id: string) => void;
  getGroupedExercises: (ejs: any[]) => any[];
  muscleFilter: string | null;
  isReadOnly: boolean;
  mode: "plan" | "routine";
}

/**
 * RoutineAccordionItem: Representación modular de un día de entrenamiento en la ficha del alumno.
 * Optimiza el rendimiento al aislar el re-renderizado de una rutina específica.
 */
export function RoutineAccordionItem({
  rutina,
  isOpen,
  onToggle,
  onAddExercise,
  onAddBlock,
  onDuplicate,
  onDelete,
  onUpdateMetrics,
  onMoveExercise,
  onDeleteExercise,
  getGroupedExercises,
  muscleFilter,
  isReadOnly,
  mode
}: Props) {
  
  // Filtrar ejercicios por grupo muscular
  const filteredExercises = (rutina.ejercicios_plan || []).filter((ej: any) => {
    if (!muscleFilter) return true;
    return ej.biblioteca_ejercicios?.tags?.includes(muscleFilter);
  });

  const groupedEjs = getGroupedExercises(filteredExercises);

  if (muscleFilter && filteredExercises.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all hover:shadow-xl group">
      {/* TRIGGER / HEADER */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 sm:p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer",
          isOpen && "sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 shadow-sm"
        )}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <span className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-500",
            isOpen ? "bg-zinc-950 text-white dark:bg-lime-500 dark:text-zinc-950 rotate-3" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"
          )}>
            {rutina.dia_numero}
          </span>
          <div className="text-left">
            <h4 className="font-bold text-base sm:text-lg text-zinc-950 dark:text-white uppercase tracking-tighter leading-none group-hover:text-lime-600 transition-colors">
              {rutina.nombre_dia || `Día ${rutina.dia_numero}`}
            </h4>
            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 tracking-widest mt-1 sm:mt-1.5 flex items-center gap-2 uppercase">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {filteredExercises.length} Ejercicios {muscleFilter && `(Filtrado)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 pr-1 sm:pr-2">
          {!isReadOnly && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(rutina.id); }}
                className="p-2 text-zinc-400 hover:text-lime-500 hover:bg-lime-500/10 rounded-xl transition-all"
                title="Duplicar día"
              >
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(rutina.id); }}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Eliminar día"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
            isOpen ? "bg-lime-500 text-zinc-950" : "text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
          )}>
            <ChevronRight className={cn("w-4 h-4 transition-transform duration-500", isOpen && "rotate-90")} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {isOpen && (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900/50 bg-white/50 dark:bg-black/5">
          {groupedEjs.map((group, gIdx) => (
            <div key={group.id || `unbound-${gIdx}`} className={cn(
              "transition-all",
              group.id && "bg-lime-500/[0.02] border-y border-lime-500/5 py-2"
            )}>
              {group.nombre && (
                <div className="px-6 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-lime-500/10 flex items-center justify-center">
                    <Box className="w-3 h-3 text-lime-500" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400">{group.nombre}</span>
                </div>
              )}
              
              {group.exercises.map((ej: any, idx: number) => (
                <RoutineExerciseRow
                  key={ej.id}
                  exercise={ej}
                  index={idx} 
                  isFirst={idx === 0 && !group.id}
                  isLast={idx === group.exercises.length - 1 && !group.id}
                  readOnly={isReadOnly}
                  hideMetrics={mode === "plan"}
                  onChange={(updates) => onUpdateMetrics(ej.id, updates)}
                  onMove={(dir) => onMoveExercise(ej.id, dir)}
                  onDelete={() => onDeleteExercise(ej.id)}
                />
              ))}
            </div>
          ))}

          {!isReadOnly && (
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10">
              <Button
                variant="ghost"
                onClick={() => onAddExercise(rutina.id)}
                className="w-full h-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 hover:border-lime-400/50 hover:bg-lime-500/5 transition-all group"
              >
                <Plus className="w-4 h-4 text-zinc-400 group-hover:text-lime-500 transition-colors" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">Añadir ejercicio</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
