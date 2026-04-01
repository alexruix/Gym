import React, { useMemo } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dumbbell, Repeat, Star, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
  parent_id?: string | null;
  is_template_base?: boolean;
  tags?: string[];
}

interface ExerciseVariationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentExercise: Exercise | null;
  library: Exercise[];
  onSelect: (exerciseId: string) => void;
}

/**
 * ExerciseVariationDialog: Molécula elitista para el intercambio de ejercicios.
 * Filtra la biblioteca para mostrar variantes directas y sugerencias por tags.
 */
export function ExerciseVariationDialog({
  open,
  onOpenChange,
  currentExercise,
  library,
  onSelect
}: ExerciseVariationDialogProps) {
  
  const suggestions = useMemo(() => {
    if (!currentExercise) return { family: [], byTags: [] };

    const family: Exercise[] = [];
    const byTags: Exercise[] = [];
    const list = library || [];

    // 1. Buscar familia directa (Padre e Hijos)
    const activeParentId = currentExercise.parent_id || currentExercise.id;
    
    list.forEach(ex => {
      if (ex.id === currentExercise.id) return; // Omitir el actual

      // Familia: Mismo padre o es el padre
      if (ex.id === activeParentId || ex.parent_id === activeParentId) {
        family.push(ex);
      } else if (currentExercise.tags?.some(t => ex.tags?.includes(t))) {
        // Fallback por tags (si comparten al menos uno)
        byTags.push(ex);
      }
    });

    return { 
        family: family.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        byTags: byTags.sort((a, b) => a.nombre.localeCompare(b.nombre)).slice(0, 8) // Limitar tags
    };
  }, [currentExercise, library]);

  if (!currentExercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-3xl border-none shadow-2xl">
        <DialogTitle className="sr-only">Variaciones de {currentExercise.nombre}</DialogTitle>
        <DialogDescription className="sr-only">Selecciona un ejercicio alternativo para intercambiar por el actual.</DialogDescription>

        <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
            <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-tight flex items-center gap-3">
                <Repeat className="w-5 h-5 text-lime-500" />
                Intercambiar ejercicio
            </h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">
                Sugerencias para: <span className="text-zinc-600 dark:text-lime-400">{currentExercise.nombre}</span>
            </p>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* SECCIÓN 1: VARIANTES DIRECTAS */}
            {suggestions.family.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 flex items-center gap-2">
                        <Star className="w-3 h-3 fill-lime-400 text-lime-400" />
                        Variantes recomendadas
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {suggestions.family.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => onSelect(ex.id)}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 hover:bg-zinc-950 dark:hover:bg-lime-400 border border-zinc-100 dark:border-zinc-800 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center">
                                    <Dumbbell className="w-5 h-5 text-zinc-400 group-hover:text-lime-400 dark:group-hover:text-zinc-950" />
                                </div>
                                <span className="font-black text-sm text-zinc-950 dark:text-white group-hover:text-white dark:group-hover:text-zinc-950 uppercase tracking-tight">{ex.nombre}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* SECCIÓN 2: SIMILARES POR TAGS */}
            {suggestions.byTags.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        Relacionados biomecánicamente
                    </h3>
                    <div className="grid grid-cols-1 gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        {suggestions.byTags.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => onSelect(ex.id)}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                                    <Dumbbell className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
                                </div>
                                <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-zinc-200">{ex.nombre}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {suggestions.family.length === 0 && suggestions.byTags.length === 0 && (
                <div className="py-12 text-center">
                    <X className="w-8 h-8 text-zinc-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No hay variaciones sugeridas</p>
                </div>
            )}
        </div>

        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50">
            <Button 
                onClick={() => onOpenChange(false)}
                variant="ghost" 
                className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-400"
            >
                Cancelar
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
