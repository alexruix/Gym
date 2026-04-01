import React, { useState, useEffect, useMemo } from "react";
import { Search, Plus, Check, Loader2, Dumbbell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
  tags: string[];
}

interface ExerciseSearchPickerProps {
  existingIds: string[];
  onSelect: (exercise: Exercise) => void;
  trigger?: React.ReactNode;
}

/**
 * ExerciseSearchPicker: DiÃ¡logo de bÃºsqueda para la biblioteca de ejercicios.
 * Filtra automÃ¡ticamente los que ya estÃ¡n en el plan con un badge informativo.
 */
export function ExerciseSearchPicker({ existingIds, onSelect, trigger }: ExerciseSearchPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (open) {
      loadLibrary();
    }
  }, [open]);

  const loadLibrary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await actions.profesor.getExerciseLibrary();
      if (error) throw error;
      setExercises(data.exercises || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar biblioteca");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = ex.nombre.toLowerCase().includes(query.toLowerCase()) || 
                            ex.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      const isAlreadyInPlan = existingIds.includes(ex.id);
      
      if (showAll) return matchesSearch;
      return matchesSearch && !isAlreadyInPlan;
    });
  }, [exercises, query, showAll, existingIds]);

  const existingInResultsCount = useMemo(() => {
    return exercises.filter(ex => 
        existingIds.includes(ex.id) && 
        ex.nombre.toLowerCase().includes(query.toLowerCase())
    ).length;
  }, [exercises, query, existingIds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full py-6 border-dashed border-2 rounded-2xl gap-2 font-black text-[11px] uppercase tracking-widest text-zinc-400 hover:text-lime-600 hover:border-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950/20 transition-all">
            <Plus className="w-4 h-4" />
            Agregar ejercicio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-3xl p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-950 dark:text-white">
            Buscar en mi biblioteca
          </DialogTitle>
          <div className="mt-4 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
            <input
              autoFocus
              type="text"
              placeholder="Filtra por nombre o etiqueta (ej. piernas, pecho)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-lime-400 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold placeholder:text-zinc-400 outline-none transition-all"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">Consultando arsenal...</span>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center text-center px-6 gap-3">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="font-bold text-zinc-900 dark:text-white">{error}</p>
              <Button onClick={loadLibrary} variant="outline" size="sm">Reintentar</Button>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-16 text-center space-y-4">
               <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-900 rounded-2xl mx-auto flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Dumbbell className="w-7 h-7 text-zinc-300" />
               </div>
               <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                 {query ? "No hay resultados para esta bÃºsqueda" : "Tu biblioteca estÃ¡ vacÃ­a"}
               </p>
               {existingInResultsCount > 0 && !showAll && (
                 <button 
                   onClick={() => setShowAll(true)}
                   className="text-[10px] font-black text-lime-600 uppercase tracking-widest hover:underline"
                 >
                   Ver {existingInResultsCount} que ya estÃ¡n en el plan
                 </button>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
              {filteredExercises.map((ex) => {
                const isAlreadyIn = existingIds.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => {
                        onSelect(ex);
                        setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-left group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800",
                      isAlreadyIn && "opacity-60"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                      {ex.media_url ? (
                        <img src={ex.media_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Dumbbell className="w-4 h-4 text-zinc-300 group-hover:rotate-12 transition-transform" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-zinc-950 dark:text-white text-sm uppercase tracking-tight">{ex.nombre}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ex.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-zinc-400">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    {isAlreadyIn ? (
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ya en plan
                      </span>
                    ) : (
                        <div className="p-2 bg-lime-400 text-zinc-950 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-center shadow-lime-500/20">
                            <Plus className="w-4 h-4" />
                        </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {existingInResultsCount > 0 && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                   {showAll ? "Mostrando duplicados" : `Ocultando ${existingInResultsCount} repetidos`}
                </span>
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest hover:text-lime-600 transition-colors"
                >
                    {showAll ? "Esconder repetidos" : "Mostrar todos"}
                </button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
