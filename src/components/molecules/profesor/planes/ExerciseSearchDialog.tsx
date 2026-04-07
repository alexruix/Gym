import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, ArrowLeft, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { planesCopy } from "@/data/es/profesor/planes";
import { ExerciseForm } from "@/components/molecules/profesor/ejercicios/ExerciseForm";

interface Exercise {
    id: string;
    nombre: string;
    media_url: string | null;
    parent_id?: string | null;
    is_template_base?: boolean;
    profesor_id?: string | null;
}

interface ExerciseSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    library: Exercise[];
    onSelect: (exerciseId: string) => void;
    onExerciseCreated: (exercise: any) => void;
    onlyBase?: boolean;
}

export function ExerciseSearchDialog({
    open,
    onOpenChange,
    library,
    onSelect,
    onExerciseCreated,
    onlyBase = false
}: ExerciseSearchDialogProps) {
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState<"all" | "mine" | "migym">("all");
    const [isCreatingInline, setIsCreatingInline] = useState(false);
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

    const { displayLibrary, variantsMap } = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        const vMap: Record<string, Exercise[]> = {};
        const parents: (Exercise & { variantCount: number })[] = [];

        // Pre-filtrado por origen
        const filteredBySource = library.filter(ex => {
            if (sourceFilter === "mine") return ex.profesor_id !== null;
            if (sourceFilter === "migym") return ex.profesor_id === null;
            return true;
        });

        filteredBySource.forEach(ex => {
            if (ex.parent_id) {
                if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
                vMap[ex.parent_id].push(ex);
            }
        });

        filteredBySource.forEach(ex => {
            // Si onlyBase es true, ignoramos cualquier ejercicio que tenga padre
            if (onlyBase && ex.parent_id) return;

            if (!ex.parent_id) {
                const hasMatchingChild = !onlyBase && vMap[ex.id]?.some(c => c.nombre.toLowerCase().includes(lowerSearch));
                if (ex.nombre.toLowerCase().includes(lowerSearch) || hasMatchingChild) {
                    parents.push({
                        ...ex,
                        variantCount: onlyBase ? 0 : (vMap[ex.id]?.length || 0)
                    });
                }
            }
        });

        return {
            displayLibrary: parents.sort((a, b) => a.nombre.localeCompare(b.nombre)),
            variantsMap: vMap
        };
    }, [library, search, sourceFilter, onlyBase]);

    const toggleParent = (parentId: string) => {
        const newExpanded = new Set(expandedParents);
        if (newExpanded.has(parentId)) newExpanded.delete(parentId);
        else newExpanded.add(parentId);
        setExpandedParents(newExpanded);
    };

    const handleClose = () => {
        onOpenChange(false);
        setIsCreatingInline(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-3xl border-none shadow-2xl">
                <DialogTitle className="sr-only">Buscador de Ejercicios</DialogTitle>
                <DialogDescription className="sr-only">
                    Busca y selecciona ejercicios de tu biblioteca para aÃ±adirlos a la rutina.
                </DialogDescription>

                <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-ui-soft/50 dark:bg-zinc-900/20">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                            {isCreatingInline ? planesCopy.form.exerciseModal.titleCreate : planesCopy.form.exerciseModal.title}
                        </h2>
                        {!isCreatingInline ? (
                            <Button
                                variant="industrial"
                                size="sm"
                                onClick={() => setIsCreatingInline(true)}
                                className="rounded-xl px-4 text-[10px]"
                            >
                                <Plus className="w-3 h-3 mr-2" /> {planesCopy.form.exerciseModal.createBtn}
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreatingInline(false)}
                                className="text-ui-muted font-bold text-[10px] uppercase tracking-widest hover:text-zinc-950"
                            >
                                <ArrowLeft className="w-3 h-3 mr-2" /> {planesCopy.form.exerciseModal.backBtn}
                            </Button>
                        )}
                    </div>

                    {!isCreatingInline && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted" />
                                    <Input
                                        autoFocus
                                        placeholder={planesCopy.form.exerciseModal.searchPlaceholder}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-12 h-14 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold shadow-sm"
                                    />
                                </div>
                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-zinc-200 dark:border-zinc-800 shrink-0">
                                    <Filter className="w-5 h-5 text-ui-muted" />
                                </Button>
                            </div>

                            <div className="flex gap-1.5 p-1 bg-ui-soft dark:bg-zinc-900 rounded-xl w-fit">
                                {[
                                    { id: "all", label: "Todos" },
                                    { id: "mine", label: "Míos" },
                                    { id: "migym", label: "MiGym" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setSourceFilter(tab.id as any)}
                                        className={cn(
                                            "px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all",
                                            sourceFilter === tab.id
                                                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="max-h-[500px] overflow-y-auto p-6 custom-scrollbar">
                    {isCreatingInline ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <ExerciseForm
                                onSuccess={(res) => onExerciseCreated(res.data)}
                                onCancel={() => setIsCreatingInline(false)}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {displayLibrary.length === 0 ? (
                                <div className="p-16 text-center space-y-6">
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                                        <Dumbbell className="w-8 h-8 text-zinc-200" />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-300 italic">
                                        {planesCopy.form.exerciseModal.empty}
                                    </p>
                                </div>
                            ) : (
                                displayLibrary.map(parent => (
                                    <div key={parent.id} className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => onSelect(parent.id)}
                                            className="w-full text-left industrial-card-sm group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "industrial-icon-box-sm",
                                                    parent.profesor_id === null ? "bg-lime-500/10 dark:bg-lime-500/5" : "bg-white dark:bg-zinc-950"
                                                )}>
                                                    <Dumbbell className={cn(
                                                        "w-5 h-5 transition-colors group-hover:text-white dark:group-hover:text-zinc-950",
                                                        parent.profesor_id === null ? "text-lime-600 dark:text-lime-400" : "text-zinc-500"
                                                    )} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-white dark:group-hover:text-zinc-950 transition-colors">
                                                            {parent.nombre}
                                                        </span>
                                                        {parent.profesor_id === null && (
                                                            <span className="px-1.5 py-0.5 bg-lime-500 text-zinc-950 text-[7px] font-bold uppercase rounded-[4px] tracking-tighter">MiGym</span>
                                                        )}
                                                    </div>
                                                    {parent.is_template_base && (
                                                        <span className="text-[8px] font-bold uppercase text-lime-600 dark:text-lime-400 group-hover:text-white/70">Patrón base</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {parent.variantCount > 0 && (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleParent(parent.id);
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-tighter transition-all cursor-pointer",
                                                            expandedParents.has(parent.id)
                                                                ? "bg-lime-500 text-zinc-950 border-lime-500"
                                                                : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-lime-500"
                                                        )}
                                                    >
                                                        {parent.variantCount} variantes
                                                    </div>
                                                )}
                                                <div className="w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-all group-hover:border-white/50 dark:group-hover:border-zinc-950/50 group-hover:rotate-90">
                                                    <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-950" />
                                                </div>
                                            </div>
                                        </button>
                                        {expandedParents.has(parent.id) && variantsMap[parent.id] && (
                                            <div className="pl-6 space-y-2 border-l-2 border-zinc-100 dark:border-zinc-800 py-1 ml-5 animate-in slide-in-from-top-2 duration-200">
                                                {variantsMap[parent.id].map(variant => (
                                                    <button
                                                        key={variant.id}
                                                        type="button"
                                                        onClick={() => onSelect(variant.id)}
                                                        className="w-full text-left p-4 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10 hover:bg-zinc-950 dark:hover:bg-lime-500 group transition-all duration-200 flex items-center justify-between border border-transparent hover:border-zinc-950 dark:hover:border-lime-400"
                                                    >
                                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-900">
                                                            {variant.nombre}
                                                        </span>
                                                        <Plus className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white dark:group-hover:text-zinc-900" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}