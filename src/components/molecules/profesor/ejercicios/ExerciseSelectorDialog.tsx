import React, { useState, useEffect } from "react";
import { actions } from "astro:actions";
import { Search, Loader2, Dumbbell, Check, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exerciseId: string) => void;
  title?: string;
  description?: string;
  currentExerciseId?: string | null; // ID del ejercicio que se está sustituyendo
}

/**
 * ExerciseSelectorDialog: Diálogo ligero para seleccionar un ejercicio de la biblioteca.
 */
export function ExerciseSelectorDialog({
  isOpen,
  onOpenChange,
  onSelect,
  title = "Seleccionar ejercicio",
  description = "Selecciona un ejercicio",
  currentExerciseId = null
}: Props) {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [variants, setVariants] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExercises();
      if (currentExerciseId) loadVariants(currentExerciseId);
      else setVariants([]);
    }
  }, [isOpen, currentExerciseId]);

  async function loadExercises() {
    setLoading(true);
    try {
      const { data } = await actions.profesor.getExerciseLibrary();
      if (data) setExercises(data as any);
    } catch (err) {
      console.error("Error cargando ejercicios:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadVariants(id: string) {
    try {
      const { data } = await actions.profesor.getExerciseVariants({ exercise_id: id });
      if (data) setVariants(data as any);
    } catch (err) {
      console.error("Error cargando variantes:", err);
    }
  }

  const filtered = exercises.filter(ex =>
    ex.id !== currentExerciseId && // No mostrar el que ya está
    ex.nombre.toLowerCase().includes(search.toLowerCase()) &&
    !variants.some(v => v.id === ex.id) // No duplicar si ya está en variantes
  );

  const filteredVariants = variants.filter(v =>
    v.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-300">

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-2xl font-bold uppercase tracking-tighter text-zinc-950 dark:text-white leading-none">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <X className="w-4 h-4 text-zinc-400" />
                </Button>
              </Dialog.Close>
            </div>

            {/* Buscador */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 text-sm font-bold text-zinc-950 dark:text-white outline-none focus:ring-4 focus:ring-lime-400/10 focus:border-lime-400/50 transition-all shadow-inner"
                autoFocus
              />
            </div>

            {/* Lista de Ejercicios */}
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4 text-zinc-400">
                  <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Consultando biblioteca...</span>
                </div>
              ) : filtered.length === 0 && filteredVariants.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Dumbbell className="w-10 h-10 text-zinc-800 mx-auto opacity-20" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">No se encontraron resultados</p>
                </div>
              ) : (
                <>
                  {/* Variantes Sugeridas */}
                  {filteredVariants.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1 mb-3">
                        <Check className="w-3 h-3 text-fuchsia-500" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-fuchsia-500 underline decoration-fuchsia-500/30 underline-offset-4">Variantes sugeridas</span>
                      </div>
                      {filteredVariants.map(ex => (
                        <ExerciseItem key={ex.id} ex={ex} isVariant onSelect={onSelect} onClose={() => onOpenChange(false)} />
                      ))}
                    </div>
                  )}

                  {/* Todos los ejercicios */}
                  {filtered.length > 0 && (
                    <div className="space-y-2">
                      {filteredVariants.length > 0 && (
                        <div className="flex items-center gap-2 px-1 mt-4 mb-3">
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">Otros ejercicios</span>
                        </div>
                      )}
                      {filtered.map(ex => (
                        <ExerciseItem key={ex.id} ex={ex} onSelect={onSelect} onClose={() => onOpenChange(false)} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
              {filtered.length + filteredVariants.length} ejercicios disponibles
            </span>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest animate-pulse",
              filteredVariants.length > 0 ? "text-fuchsia-500" : "text-lime-500"
            )}>
              {filteredVariants.length > 0 ? "¡Variantes encontradas!" : description}
            </span>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ExerciseItem({ ex, isVariant, onSelect, onClose }: { ex: Exercise, isVariant?: boolean, onSelect: (id: string) => void, onClose: () => void }) {
  return (
    <button
      onClick={() => {
        onSelect(ex.id);
        onClose();
      }}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
        isVariant
          ? "bg-fuchsia-500/5 border-fuchsia-500/20 hover:border-fuchsia-500/50"
          : "bg-zinc-50 dark:bg-zinc-900/50 border-transparent hover:border-lime-400/30 hover:bg-lime-500/5"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center border overflow-hidden shrink-0 shadow-lg transition-transform group-hover:scale-105",
        isVariant ? "bg-zinc-950 border-fuchsia-500/30" : "bg-zinc-950 border-zinc-800"
      )}>
        {ex.media_url ? (
          <img src={ex.media_url} className="w-full h-full object-cover" alt="" />
        ) : (
          <Dumbbell className={cn("w-4 h-4 transition-colors", isVariant ? "text-fuchsia-400" : "text-zinc-400 group-hover:text-lime-400")} />
        )}
      </div>
      <div className="flex flex-col">
        <span className={cn(
          "font-bold text-sm transition-colors",
          isVariant ? "text-fuchsia-200" : "text-zinc-950 dark:text-zinc-100 group-hover:text-lime-500"
        )}>
          {ex.nombre}
        </span>
        {isVariant && <span className="text-[7px] font-bold uppercase tracking-widest text-fuchsia-500 mt-0.5">Sustitución rápida</span>}
      </div>
      <Check className={cn(
        "w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity",
        isVariant ? "text-fuchsia-500" : "text-lime-500"
      )} />
    </button>
  );
}
