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
}

/**
 * ExerciseSelectorDialog: Diálogo ligero para seleccionar un ejercicio de la biblioteca.
 * Optimizado para el flujo de "Swap" (Sustitución) en el calendario operativo.
 */
export function ExerciseSelectorDialog({ isOpen, onOpenChange, onSelect, title = "Sustituir ejercicio" }: Props) {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  async function loadExercises() {
    setLoading(true);
    try {
      const { data } = await actions.profesor.getExercises();
      if (data) setExercises(data as any);
    } catch (err) {
      console.error("Error cargando ejercicios:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = exercises.filter(ex => 
    ex.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-300">
          
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-2xl font-black uppercase tracking-tighter text-zinc-950 dark:text-white leading-none">
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
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-2 no-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4 text-zinc-400">
                  <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Consultando biblioteca...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Dumbbell className="w-10 h-10 text-zinc-800 mx-auto opacity-20" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">No se encontraron resultados</p>
                </div>
              ) : (
                filtered.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => {
                        onSelect(ex.id);
                        onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-lime-400/30 hover:bg-lime-400/5 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 overflow-hidden shrink-0 shadow-lg">
                        {ex.media_url ? (
                            <img src={ex.media_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <Dumbbell className="w-4 h-4 text-zinc-400 group-hover:text-lime-400 transition-colors" />
                        )}
                    </div>
                    <span className="font-bold text-sm text-zinc-950 dark:text-zinc-100 group-hover:text-lime-500 transition-colors">{ex.nombre}</span>
                    <Check className="w-4 h-4 text-lime-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                {filtered.length} ejercicios disponibles
            </span>
            <span className="text-[9px] font-black text-lime-500 uppercase tracking-widest animate-pulse">
                Sustitución puntual
            </span>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
