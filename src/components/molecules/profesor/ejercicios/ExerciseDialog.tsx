import React, { useState } from "react";
import { Search, Plus, ArrowLeft, Dumbbell, Loader2, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Components
import { ExerciseForm } from "@/components/molecules/profesor/ejercicios/ExerciseForm";
import { ExerciseRow } from "@/components/molecules/profesor/ejercicios/ExerciseRow";

// Hooks
import { useExerciseDialog } from "@/hooks/profesor/exercises/useExerciseDialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    library?: any[];
    currentExerciseId?: string | null;
    onlyBase?: boolean;
    allowCreate?: boolean;
    onSelect: (exerciseId: string) => void;
    onExerciseCreated?: (exercise: any) => void;
    title?: string;
    description?: string;
}

/**
 * ExerciseDialog: Selector universal de ejercicios (V2.1).
 * Orquestador liviano que delega la lógica pesada a useExerciseDialog.
 */
export function ExerciseDialog({
    open,
    onOpenChange,
    library: externalLibrary,
    currentExerciseId = null,
    onlyBase = false,
    allowCreate = false,
    onSelect,
    onExerciseCreated,
    title = "Seleccioná un ejercicio",
    description = "Buscá en tu biblioteca de ejercicios"
}: Props) {
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState<"all" | "mine" | "migym">("all");
    const [isCreating, setIsCreating] = useState(false);

    const {
        isLoading,
        suggestedVariants,
        parents,
        variantsMap,
        expandedParents,
        toggleParent,
        totalResults
    } = useExerciseDialog({
        open,
        externalLibrary,
        currentExerciseId,
        onlyBase,
        sourceFilter,
        search
    });

    const handleSelect = (id: string) => {
        onSelect(id);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-[2.5rem] border-zinc-200 shadow-2xl">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <DialogDescription className="sr-only">{description}</DialogDescription>

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        {isCreating ? (
                            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest rounded-xl">
                                <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Volver
                            </Button>
                        ) : (
                            <div className="space-y-0.5">
                                <h2 className="text-xl font-bold uppercase tracking-tighter text-zinc-950 dark:text-white leading-none">{title}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{currentExerciseId ? "Elegí una alternativa" : description}</p>
                            </div>
                        )}
                        {!isCreating && allowCreate && (
                            <Button variant="outline" size="sm" onClick={() => setIsCreating(true)} className="h-10 rounded-2xl border-zinc-200 text-[10px] font-bold uppercase tracking-widest shrink-0">
                                <Plus className="w-3 h-3 mr-1.5" /> Nuevo
                            </Button>
                        )}
                    </div>

                    {!isCreating && (
                        <div className="space-y-3">
                            <div className="relative group">
                                <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", search ? "text-lime-500" : "text-zinc-400 group-focus-within:text-lime-500")} />
                                <Input autoFocus placeholder="Buscar ejercicio..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 bg-white dark:bg-zinc-900 border-zinc-200 rounded-2xl font-bold text-sm" />
                                {search && <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-100 rounded-lg"><X className="w-3.5 h-3.5 text-zinc-400" /></button>}
                            </div>
                            <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit">
                                {[
                                    { id: "all" as const, label: "Todos" },
                                    { id: "mine" as const, label: "Propios" },
                                    { id: "migym" as const, label: "MiGym" }
                                ].map((tab) => (
                                    <button key={tab.id} type="button" onClick={() => setSourceFilter(tab.id)} className={cn("px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all", sourceFilter === tab.id ? "bg-white dark:bg-zinc-800 text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Body ─────────────────────────────────────────────────── */}
                <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
                    {isCreating ? (
                        <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <ExerciseForm onSuccess={(res) => { onExerciseCreated?.(res.data); setIsCreating(false); }} onCancel={() => setIsCreating(false)} />
                        </div>
                    ) : isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-zinc-400"><Loader2 className="w-8 h-8 animate-spin text-lime-500" /><span className="text-[10px] font-bold uppercase tracking-widest">Consultando biblioteca...</span></div>
                    ) : totalResults === 0 ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-center px-12"><Dumbbell className="w-10 h-10 text-zinc-200" /><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No se encontraron resultados.</p></div>
                    ) : (
                        <div className="py-2">
                            {suggestedVariants.length > 0 && (
                                <div className="mb-1">
                                    <div className="px-6 py-2 flex items-center gap-2"><Check className="w-3 h-3 text-fuchsia-500 shrink-0" /><span className="text-[8px] font-bold uppercase tracking-[0.2em] text-fuchsia-500">Sustituciones rápidas</span></div>
                                    <div className="px-4 space-y-1 pb-2">{suggestedVariants.map(ex => <ExerciseRow key={ex.id} ex={ex} isVariant onSelect={handleSelect} />)}</div>
                                    <div className="mx-6 border-t border-zinc-100 dark:border-zinc-900 mt-1 mb-3" />
                                </div>
                            )}
                            <div className="px-4 space-y-1 pb-4">
                                {parents.map(parent => (
                                    <div key={parent.id} className="space-y-1">
                                        <ExerciseRow ex={parent} onSelect={handleSelect} isMiGym={parent.profesor_id === null} variantCount={onlyBase ? 0 : (variantsMap[parent.id]?.length || 0)} isExpanded={expandedParents.has(parent.id)} onToggleExpand={() => toggleParent(parent.id)} />
                                        {expandedParents.has(parent.id) && variantsMap[parent.id] && (
                                            <div className="pl-5 border-l-2 border-zinc-100 dark:border-zinc-800 ml-5 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                                {variantsMap[parent.id].map(variant => <ExerciseRow key={variant.id} ex={variant} onSelect={handleSelect} isNested />)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ───────────────────────────────────────────────── */}
                {!isCreating && (
                    <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{totalResults} ejercicios</span>
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest", suggestedVariants.length > 0 ? "text-fuchsia-500 animate-pulse" : "text-zinc-300")}>
                            {suggestedVariants.length > 0 ? `${suggestedVariants.length} variantes encontradas ✓` : "Biblioteca completa"}
                        </span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
