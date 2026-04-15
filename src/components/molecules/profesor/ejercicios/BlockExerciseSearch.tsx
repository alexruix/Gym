import React from "react";
import { Search, Plus, Dumbbell, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
    isSearching: boolean;
    setIsSearching: (val: boolean) => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    filteredLibrary: any[];
    onSelect: (id: string) => void;
}

/**
 * BlockExerciseSearch: Buscador de ejercicios integrado para la creación de bloques.
 */
export function BlockExerciseSearch({ 
    isSearching, 
    setIsSearching, 
    searchTerm, 
    setSearchTerm, 
    filteredLibrary, 
    onSelect 
}: Props) {
    if (!isSearching) {
        return (
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white">
                    Ejercicios
                </label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSearching(true)}
                    className="rounded-xl h-9 px-3 border-zinc-200 dark:border-zinc-800 hover:border-lime-500 hover:text-lime-500 transition-all font-bold text-[9px] uppercase tracking-widest"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Añadir
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-600">Buscando técnica...</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearching(false)}
                    className="h-8 px-2 text-red-500 font-bold text-[9px] uppercase tracking-widest hover:bg-red-50"
                >
                    <X className="w-3 h-3 mr-1" /> Cancelar
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                    autoFocus
                    placeholder="Buscar ejercicio técnico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 pl-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-lime-500 font-bold text-xs rounded-2xl"
                />
            </div>
            
            <div className="grid grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto no-scrollbar pb-4">
                {filteredLibrary.map((ex) => (
                    <button
                        key={ex.id}
                        type="button"
                        onClick={() => onSelect(ex.id)}
                        className="flex items-center gap-3 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-lime-500/50 hover:bg-lime-500/5 dark:hover:bg-lime-500/5 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                            {ex.media_url ? (
                                <img src={ex.media_url} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <Dumbbell className="w-4 h-4 text-zinc-300 group-hover:text-lime-500 transition-colors" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase truncate">
                                {ex.nombre}
                            </span>
                        </div>
                        <Plus className="w-4 h-4 ml-auto text-zinc-200 group-hover:text-lime-500 mr-2" />
                    </button>
                ))}
                
                {filteredLibrary.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sin resultados</p>
                    </div>
                )}
            </div>
            <div className="h-px bg-zinc-100 dark:bg-zinc-900 mx-2" />
        </div>
    );
}
