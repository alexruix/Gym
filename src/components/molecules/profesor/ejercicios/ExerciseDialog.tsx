import React, { useState, useEffect, useMemo } from "react";
import { actions } from "astro:actions";
import {
    Search, Filter, Plus, ArrowLeft, Dumbbell,
    Loader2, Check, X, Layers, ChevronDown
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExerciseForm } from "@/components/molecules/profesor/ejercicios/ExerciseForm";

interface Exercise {
    id: string;
    nombre: string;
    media_url: string | null;
    parent_id?: string | null;
    is_template_base?: boolean;
    profesor_id?: string | null;
}

type SourceFilter = "all" | "mine" | "migym";

interface Props {
    // — Control del diálogo —
    open: boolean;
    onOpenChange: (open: boolean) => void;

    // — Datos —
    /** Si se pasa, el componente usa la librería en memoria (sin fetch). */
    library?: Exercise[];
    /** ID del ejercicio actual para priorizar variantes sugeridas. */
    currentExerciseId?: string | null;

    // — Comportamiento —
    /** Muestra solo ejercicios base (sin parent_id). */
    onlyBase?: boolean;
    /** Habilita formulario de creación inline. */
    allowCreate?: boolean;

    // — Callbacks —
    onSelect: (exerciseId: string) => void;
    /** Callback al crear un ejercicio nuevo inline. */
    onExerciseCreated?: (exercise: any) => void;

    // — Copy —
    title?: string;
    description?: string;
}

/**
 * ExerciseDialog: Selector universal de ejercicios.
 * Unifica ExerciseSelectorDialog + ExerciseSearchDialog en un único motor.
 * — Si se provee `library`, no hace fetch. —
 * — Si se provee `currentExerciseId`, muestra variantes sugeridas primero. —
 * — Si `allowCreate=true`, habilita creación inline. —
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
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
    const [internalLibrary, setInternalLibrary] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

    const library = externalLibrary ?? internalLibrary;

    // Si no hay library externa, hacemos fetch al abrir
    useEffect(() => {
        if (!open) {
            setSearch("");
            setIsCreating(false);
            setExpandedParents(new Set());
            return;
        }
        if (!externalLibrary) {
            fetchLibrary();
        }
    }, [open]);

    async function fetchLibrary() {
        setIsLoading(true);
        try {
            const { data } = await actions.profesor.getExerciseLibrary();
            if (data) setInternalLibrary(data as any);
        } catch (err) {
            console.error("[ExerciseDialog] Error cargando biblioteca:", err);
        } finally {
            setIsLoading(false);
        }
    }

    // ── Procesamiento de datos ───────────────────────────────────────────────
    const { suggestedVariants, parents, variantsMap } = useMemo(() => {
        const lowerSearch = search.toLowerCase();

        // Variantes sugeridas del ejercicio actual
        const suggestedVariants = currentExerciseId
            ? library.filter(ex =>
                ex.parent_id === currentExerciseId &&
                ex.nombre.toLowerCase().includes(lowerSearch)
            )
            : [];

        const suggestedIds = new Set(suggestedVariants.map(v => v.id));

        // Mapa de variantes (hijo → padre)
        const vMap: Record<string, Exercise[]> = {};
        const bySource = library.filter(ex => {
            if (onlyBase && ex.parent_id) return false;
            if (sourceFilter === "mine") return ex.profesor_id !== null;
            if (sourceFilter === "migym") return ex.profesor_id === null;
            return true;
        });

        bySource.forEach(ex => {
            if (ex.parent_id) {
                if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
                vMap[ex.parent_id].push(ex);
            }
        });

        // Padres que matchean búsqueda
        const parentList = bySource
            .filter(ex => {
                if (ex.parent_id) return false; // Solo padres
                if (ex.id === currentExerciseId) return false; // Excluir el actual
                if (suggestedIds.has(ex.id)) return false; // Excluir si ya está como variante sugerida
                const hasMatchingChild = !onlyBase && vMap[ex.id]?.some(c => c.nombre.toLowerCase().includes(lowerSearch));
                return ex.nombre.toLowerCase().includes(lowerSearch) || hasMatchingChild;
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        return { suggestedVariants, parents: parentList, variantsMap: vMap };
    }, [library, search, sourceFilter, currentExerciseId, onlyBase]);

    const totalResults = suggestedVariants.length + parents.length;
    const hasActiveFilter = sourceFilter !== "all";

    const handleSelect = (id: string) => {
        onSelect(id);
        onOpenChange(false);
    };

    const toggleParent = (parentId: string) => {
        const next = new Set(expandedParents);
        next.has(parentId) ? next.delete(parentId) : next.add(parentId);
        setExpandedParents(next);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <DialogDescription className="sr-only">{description}</DialogDescription>

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        {isCreating ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreating(false)}
                                className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-950 dark:hover:text-white rounded-xl"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Volver
                            </Button>
                        ) : (
                            <div className="space-y-0.5">
                                <h2 className="text-xl font-bold uppercase tracking-tighter text-zinc-950 dark:text-white leading-none">
                                    {title}
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                    {currentExerciseId ? "Elegí una alternativa" : description}
                                </p>
                            </div>
                        )}

                        {!isCreating && allowCreate && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreating(true)}
                                className="h-10 rounded-2xl border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest shrink-0"
                            >
                                <Plus className="w-3 h-3 mr-1.5" /> Nuevo
                            </Button>
                        )}
                    </div>

                    {/* Buscador + Filtro */}
                    {!isCreating && (
                        <div className="space-y-3">
                            <div className="flex gap-2.5">
                                <div className="relative flex-1 group">
                                    <Search className={cn(
                                        "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                                        search ? "text-lime-500" : "text-zinc-400 group-focus-within:text-lime-500"
                                    )} />
                                    <Input
                                        autoFocus
                                        placeholder="Buscar ejercicio..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-11 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm shadow-sm focus-visible:ring-lime-400/20"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch("")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5 text-zinc-400" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Source Filter: Pills */}
                            <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit">
                                {([
                                    { id: "all" as const, label: "Todos" },
                                    { id: "mine" as const, label: "Propios" },
                                    { id: "migym" as const, label: "MiGym" }
                                ]).map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setSourceFilter(tab.id)}
                                        className={cn(
                                            "px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all",
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

                {/* ── Body ─────────────────────────────────────────────────── */}
                <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
                    {isCreating ? (
                        <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <ExerciseForm
                                onSuccess={(res) => {
                                    onExerciseCreated?.(res.data);
                                    setIsCreating(false);
                                }}
                                onCancel={() => setIsCreating(false)}
                            />
                        </div>
                    ) : isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-zinc-400">
                            <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Consultando biblioteca...</span>
                        </div>
                    ) : totalResults === 0 ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-center px-12">
                            <Dumbbell className="w-10 h-10 text-zinc-200 dark:text-zinc-800" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                No se encontraron resultados.
                            </p>
                            {allowCreate && (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="text-lime-500 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Crear ejercicio
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="py-2">
                            {/* Variantes Sugeridas */}
                            {suggestedVariants.length > 0 && (
                                <div className="mb-1">
                                    <div className="px-6 py-2 flex items-center gap-2">
                                        <Check className="w-3 h-3 text-fuchsia-500 shrink-0" />
                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-fuchsia-500">
                                            Sustituciones rápidas
                                        </span>
                                    </div>
                                    <div className="px-4 space-y-1 pb-2">
                                        {suggestedVariants.map(ex => (
                                            <ExerciseRow key={ex.id} ex={ex} isVariant onSelect={handleSelect} />
                                        ))}
                                    </div>
                                    <div className="mx-6 border-t border-zinc-100 dark:border-zinc-900 mt-1 mb-3" />
                                </div>
                            )}

                            {/* Lista Principal */}
                            {suggestedVariants.length > 0 && parents.length > 0 && (
                                <div className="px-6 pb-2">
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                        Otros ejercicios
                                    </span>
                                </div>
                            )}
                            <div className="px-4 space-y-1 pb-4">
                                {parents.map(parent => (
                                    <div key={parent.id} className="space-y-1">
                                        <ExerciseRow
                                            ex={parent}
                                            onSelect={handleSelect}
                                            isMiGym={parent.profesor_id === null}
                                            variantCount={onlyBase ? 0 : (variantsMap[parent.id]?.length || 0)}
                                            isExpanded={expandedParents.has(parent.id)}
                                            onToggleExpand={() => toggleParent(parent.id)}
                                        />
                                        {expandedParents.has(parent.id) && variantsMap[parent.id] && (
                                            <div className="pl-5 border-l-2 border-zinc-100 dark:border-zinc-800 ml-5 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                                {variantsMap[parent.id].map(variant => (
                                                    <ExerciseRow key={variant.id} ex={variant} onSelect={handleSelect} isNested />
                                                ))}
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
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            {totalResults} ejercicios
                        </span>
                        <span className={cn(
                            "text-[9px] font-bold uppercase tracking-widest",
                            suggestedVariants.length > 0 ? "text-fuchsia-500 animate-pulse" : "text-zinc-300 dark:text-zinc-700"
                        )}>
                            {suggestedVariants.length > 0 ? `${suggestedVariants.length} variantes encontradas ✓` : hasActiveFilter ? `Filtrado: ${sourceFilter === "mine" ? "Propios" : "MiGym"}` : "Biblioteca completa"}
                        </span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

interface ExerciseRowProps {
    ex: Exercise;
    onSelect: (id: string) => void;
    isVariant?: boolean;
    isNested?: boolean;
    isMiGym?: boolean;
    variantCount?: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

function ExerciseRow({
    ex,
    onSelect,
    isVariant,
    isNested,
    isMiGym,
    variantCount = 0,
    isExpanded,
    onToggleExpand
}: ExerciseRowProps) {
    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-2xl border transition-all group",
            isVariant
                ? "bg-fuchsia-500/5 border-fuchsia-500/20 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10"
                : isNested
                    ? "bg-zinc-50/50 dark:bg-zinc-900/20 border-transparent hover:border-lime-400/30 hover:bg-lime-500/5"
                    : "bg-transparent border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
        )}>
            {/* Thumbnail */}
            <button
                onClick={() => onSelect(ex.id)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105",
                    isVariant ? "bg-zinc-950 border border-fuchsia-500/30" : "bg-zinc-100 dark:bg-zinc-900"
                )}>
                    {ex.media_url ? (
                        <img src={ex.media_url} className="w-full h-full object-cover" alt={ex.nombre} />
                    ) : (
                        <Dumbbell className={cn(
                            "w-4 h-4 transition-colors",
                            isVariant ? "text-fuchsia-400" : isMiGym ? "text-lime-500" : "text-zinc-400 group-hover:text-lime-400"
                        )} />
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "font-bold text-sm truncate transition-colors",
                            isVariant ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-950 dark:text-zinc-100 group-hover:text-lime-500"
                        )}>
                            {ex.nombre}
                        </span>
                        {isMiGym && !isVariant && !isNested && (
                            <span className="px-1.5 py-0.5 bg-lime-500 text-zinc-950 text-[7px] font-bold uppercase rounded-[4px] tracking-tighter shrink-0">
                                MiGym
                            </span>
                        )}
                    </div>
                    {isVariant && (
                        <span className="text-[7px] font-bold uppercase tracking-widest text-fuchsia-500">Sustitución rápida</span>
                    )}
                </div>
            </button>

            {/* Acción: Expandir variantes */}
            {variantCount > 0 && onToggleExpand && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                    className={cn(
                        "px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-tighter transition-all shrink-0 flex items-center gap-1",
                        isExpanded
                            ? "bg-lime-500 text-zinc-950 border-lime-500"
                            : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-lime-500"
                    )}
                >
                    {variantCount}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                </button>
            )}

            {/* Check al seleccionar */}
            <button
                onClick={() => onSelect(ex.id)}
                className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all",
                    isVariant ? "bg-fuchsia-500/10 text-fuchsia-500" : "bg-lime-500/10 text-lime-500"
                )}
            >
                <Check className="w-4 h-4" />
            </button>
        </div>
    );
}
