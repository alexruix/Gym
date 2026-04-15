import React from "react";
import { Search, Plus, Dumbbell, Loader2, Check, Box, Layers, Edit3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseForm } from "@/components/molecules/profesor/ejercicios/ExerciseForm";
import { BlockForm } from "@/components/molecules/profesor/ejercicios/BlockForm";
import { ExerciseRow } from "@/components/molecules/profesor/ejercicios/ExerciseRow";

// Hooks
import { usePlanLibraryPanel } from "@/hooks/profesor/planes/usePlanLibraryPanel";

interface Props {
  onSelectExercise: (exerciseId: string) => void;
  onSelectBlock: (block: any) => void;
  library?: any[];
  currentExerciseId?: string | null;
  allowCreate?: boolean;
  className?: string;
}

/**
 * PlanLibraryPanel: Lateral del editor de rutinas para selección de material.
 * Modularizado (V2.1) para maximizar la fluidez durante el armado de planes.
 */
export function PlanLibraryPanel({ onSelectExercise, onSelectBlock, library: externalLibrary, currentExerciseId = null, allowCreate = true, className }: Props) {
    const {
        mode, setMode,
        view, setView,
        search, setSearch,
        sourceFilter, setSourceFilter,
        isLoading,
        suggestedVariants,
        parents,
        variantsMap,
        filteredBlocks,
        expandedParents,
        toggleParent,
        editingBlockData,
        handleEditBlock,
        refresh,
        libraryCount,
        blocksCount,
        library
    } = usePlanLibraryPanel({ externalLibrary, currentExerciseId });

    const handleCreateSuccess = () => {
        setView("list");
        refresh();
    };

    const isFormOpen = view !== "list";

    return (
        <aside className={cn("flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-900 h-full overflow-hidden", className)}>
            {/* HEADER */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                <div className="flex items-center justify-between gap-4 mb-6">
                    {!isFormOpen ? (
                        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit">
                            {[
                                { id: "exercises" as const, label: "Ejercicios" },
                                { id: "blocks" as const, label: "Bloques" }
                            ].map(tab => (
                                <button key={tab.id} type="button" onClick={() => setMode(tab.id)} className={cn("px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", mode === tab.id ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2"><Box className="w-3.5 h-3.5 text-lime-500" /><span className="text-[10px] font-black uppercase tracking-widest">Constructor</span></div>
                    )}

                    {!isFormOpen && allowCreate && (
                        <Button variant="outline" size="sm" onClick={() => mode === "exercises" ? setView("create-exercise") : setView("create-block")} className="h-10 rounded-2xl border-zinc-200 text-[10px] font-bold uppercase tracking-widest shrink-0">
                            <Plus className="w-3 h-3 mr-1.5" /> {mode === "exercises" ? "Nuevo" : "Crear"}
                        </Button>
                    )}
                </div>

                {!isFormOpen && (
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", search ? "text-lime-500" : "text-zinc-400 group-focus-within:text-lime-500")} />
                            <Input placeholder={mode === "exercises" ? "Buscar ejercicio" : "Buscar bloque"} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 bg-white dark:bg-zinc-950 border-zinc-200 rounded-2xl font-bold text-sm shadow-sm" />
                        </div>
                        {mode === "exercises" && (
                            <div className="flex gap-1.5">
                                {[
                                    { id: "all" as const, label: "Todos" },
                                    { id: "mine" as const, label: "Propios" },
                                    { id: "migym" as const, label: "MiGym" }
                                ].map((tab) => (
                                    <button key={tab.id} type="button" onClick={() => setSourceFilter(tab.id)} className={cn("px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all border", sourceFilter === tab.id ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent" : "bg-transparent text-zinc-400 border-zinc-200 hover:border-zinc-400")}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950 pb-20">
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center gap-4 text-zinc-400"><Loader2 className="w-8 h-8 animate-spin text-lime-500" /><span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</span></div>
                ) : view === "create-exercise" ? (
                    <div className="p-6">
                        <ExerciseForm onSuccess={(res) => { onSelectExercise(res.data.id); handleCreateSuccess(); }} onCancel={() => setView("list")} />
                    </div>
                ) : (view === "create-block" || view === "edit-block") ? (
                    <BlockForm library={library} initialData={view === "edit-block" ? editingBlockData : null} onSuccess={handleCreateSuccess} onCancel={() => setView("list")} />
                ) : mode === "exercises" ? (
                    <div className="p-4 space-y-1">
                        {suggestedVariants.length > 0 && (
                            <div className="mb-4">
                                <div className="px-3 flex items-center gap-2 mb-2"><Check className="w-3 h-3 text-fuchsia-500" /><span className="text-[9px] font-bold uppercase tracking-widest text-fuchsia-500">Sugerencias</span></div>
                                {suggestedVariants.map(ex => <ExerciseRow key={ex.id} ex={ex} isVariant onSelect={onSelectExercise} />)}
                                <div className="mx-3 h-px bg-zinc-100 dark:bg-zinc-900 my-4" />
                            </div>
                        )}
                        {parents.map(parent => (
                            <div key={parent.id} className="space-y-1">
                                <ExerciseRow ex={parent} onSelect={onSelectExercise} isMiGym={parent.profesor_id === null} variantCount={variantsMap[parent.id]?.length || 0} isExpanded={expandedParents.has(parent.id)} onToggleExpand={() => toggleParent(parent.id)} />
                                {expandedParents.has(parent.id) && variantsMap[parent.id] && (
                                    <div className="pl-6 border-l-2 border-zinc-100 dark:border-zinc-900 ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {variantsMap[parent.id].map(variant => <ExerciseRow key={variant.id} ex={variant} onSelect={onSelectExercise} isNested />)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {filteredBlocks.map(block => (
                            <div key={block.id} className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl hover:border-zinc-200 transition-all group overflow-hidden">
                                <div className="p-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-xs uppercase tracking-tight truncate">{block.nombre}</h4>
                                            <button type="button" onClick={() => handleEditBlock(block)} className="p-1 text-zinc-300 hover:text-lime-500 opacity-0 group-hover:opacity-100"><Edit3 className="w-3 h-3" /></button>
                                        </div>
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{block.bloques_ejercicios?.length || 0} Ejercicios</span>
                                    </div>
                                    <button type="button" onClick={() => onSelectBlock(block)} className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-lime-500 hover:text-zinc-950 transition-all"><Plus className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isFormOpen && (
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{mode === "exercises" ? `${libraryCount} Técnicas` : `${blocksCount} Protocolos`}</span>
                    <button type="button" onClick={() => refresh()} className="text-[9px] font-bold uppercase tracking-widest text-lime-500 hover:underline">Sincronizar</button>
                </div>
            )}
        </aside>
    );
}
