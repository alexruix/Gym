import { useState, useEffect } from "react";
import {
    LayoutGrid,
    List,
    Search,
    Plus,
    X,
    Tag,
    ChevronDown,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useResourceDashboard } from "@/hooks/useResourceDashboard";
import type { BaseEntity, SortOption } from "@/types/core";

export interface DashboardControllers {
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    setSearch: (search: string) => void;
    clearFilters: () => void;
    search: string;
}

interface DashboardConsoleProps<T extends BaseEntity> {
    items: T[];
    renderGrid: (items: T[], controllers: DashboardControllers) => React.ReactNode;
    renderTable: (items: T[], controllers: DashboardControllers) => React.ReactNode;
    searchPlaceholder?: string;
    itemLabel: string;
    storageKey: string;
    allTags?: string[];
    onCreateClick?: () => void;
    createLabel?: string;
    /** Opcional: Proporcionar un componente personalizado para la acción de creación (ej. SplitButton) */
    renderCreateAction?: () => React.ReactNode;
    /** Opcional: Proporcionar lógica de ordenamiento personalizada */
    onSort?: (items: T[], order: string) => T[];
    sortOptions?: SortOption[];
    initialSort?: string;
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    searchSuffix?: React.ReactNode;
    /** Si es true, renderiza la vista incluso si la lista estÃ¡ vacÃ­a (util para la Agenda) */
    forceRender?: boolean;
}

/**
 * DashboardConsole: El Layout Maestro de MiGym (V2.2 Refactored).
 * Ahora utiliza el hook useResourceDashboard (Core Brain) para gestionar el estado de forma limpia.
 */
export function DashboardConsole<T extends BaseEntity>({
    items,
    renderGrid,
    renderTable,
    searchPlaceholder = "Buscar...",
    itemLabel,
    storageKey,
    allTags = [],
    onCreateClick,
    createLabel = "Nuevo",
    onSort,
    sortOptions = [],
    initialSort,
    renderCreateAction,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    searchSuffix,
    forceRender = false
}: DashboardConsoleProps<T>) {
    const [isSticky, setIsSticky] = useState(false);

    // Integración del Cerebro Core 
    const {
        viewMode,
        toggleView,
        search,
        setSearch,
        activeTags,
        addTag,
        removeTag,
        clearFilters,
        sortOrder,
        setSortOrder,
        filteredItems,
    } = useResourceDashboard({
        items,
        storageKey,
        initialSort: initialSort as any,
        onSort
    });

    // Track scroll for sticky effect
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 250);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative">
            {/* NAVIGATION & SEARCH CONSOLE (STICKY) */}
            <div className={cn(
                "w-full transition-all duration-500 py-2 md:py-4 px-2 mb-4 md:mb-8 z-40",
                isSticky
                    ? "sticky top-0 -mx-2 px-4 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
                    : "relative"
            )}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-4">

                    {/* BUSCADOR INTELIGENTE */}
                    <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Search className={cn(
                                "w-4 h-4 transition-colors",
                                search ? "text-lime-600" : "text-zinc-500 group-focus-within:text-lime-600 "
                            )} />
                        </div>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="industrial-search h-11 md:h-14 pl-12 transition-all font-sans"
                        />

                        {/* TAG SUGGESTIONS */}
                        {search.startsWith("#") && search.length > 1 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-ui-muted p-2">Sugerencias de categorías</p>
                                <div className="flex flex-wrap gap-2 p-2">
                                    {allTags.filter(t => t.toLowerCase().includes(search.slice(1).toLowerCase())).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { addTag(t); setSearch(""); }}
                                            className="px-3 py-1.5 bg-ui-soft rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-lime-500 hover:text-zinc-950 transition-all"
                                        >
                                            #{t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {searchSuffix && (
                        <div className="shrink-0">
                            {searchSuffix}
                        </div>
                    )}

                    <div className="flex items-center rounded-2xl gap-2 w-full md:w-auto shrink-0 overflow-x-auto hide-scrollbar pb-1 md:pb-0 font-bold">
                        {/* SELECTOR DE ORDEN (RADIX) */}
                        {sortOptions.length > 0 && (
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className="industrial-select-trigger flex gap-2 h-11 md:h-14 pl-9 pr-3 min-w-[130px] md:min-w-[180px] relative border-none bg-zinc-100 dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                                    <SelectValue placeholder="Ordenar por" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl p-1 bg-white dark:bg-zinc-950">
                                    {sortOptions.map(opt => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="rounded-xl cursor-pointer py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300 focus:bg-lime-500 focus:text-zinc-950 transition-all"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* TOGGLE VISTA */}
                        <div className="industrial-toggle-container">
                            <button
                                onClick={() => toggleView("grid")}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all",
                                    viewMode === "grid" ? "bg-white dark:bg-zinc-950 text-lime-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => toggleView("table")}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all",
                                    viewMode === "table" ? "bg-white dark:bg-zinc-950 text-lime-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        {/* BOTÓN CREACIÓN PRINCIPAL */}
                        {renderCreateAction ? (
                            renderCreateAction()
                        ) : (
                            onCreateClick && (
                                <Button
                                    onClick={onCreateClick}
                                    variant="heavy"
                                    size="xl"
                                    className="h-11 md:h-14 md:px-8 px-4 flex-1 md:flex-none"
                                >
                                    <Plus className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">{createLabel}</span>
                                    <span className="md:hidden sr-only">Nuevo</span>
                                </Button>
                            )
                        )}
                    </div>
                </div>

                {/* ACTIVE TAGS (TELEMETRY) */}
                {activeTags.length > 0 && (
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 mt-4 animate-in fade-in slide-in-from-left-4">
                        <div className="flex items-center gap-2 text-lime-600 dark:text-lime-400 mr-2">
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Filtros Activos</span>
                        </div>
                        {activeTags.map(tag => (
                            <div
                                key={tag}
                                className="flex items-center gap-2 bg-lime-500/10 border border-lime-400/20 px-3 py-1.5 rounded-xl group hover:border-lime-400 transition-all"
                            >
                                <Tag className="w-3 h-3 text-lime-500" />
                                <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">#{tag}</span>
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="p-0.5 hover:bg-lime-500 hover:text-zinc-950 rounded-md transition-all ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={clearFilters}
                            className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 ml-2 transition-colors underline underline-offset-4"
                        >
                            Limpiar todo
                        </button>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="min-h-[400px]">
                {filteredItems.length === 0 && (search || activeTags.length > 0) ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                        <div className="industrial-icon-box-lg mb-8">
                            {emptyIcon || <Search className="w-12 h-12 text-zinc-200 dark:text-zinc-800" />}
                        </div>
                        <div className="space-y-2 mb-8">
                            <h3 className="industrial-title-lg">
                                Sin resultados
                            </h3>
                            <p className="industrial-description max-w-sm mx-auto px-6">
                                No encontramos nada que coincida con "{search}". Probá con otro término.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={clearFilters}
                            className="rounded-2xl px-6 font-bold text-[10px] uppercase tracking-widest border-2"
                        >
                            Reestablecer filtros
                        </Button>
                    </div>
                ) : filteredItems.length === 0 && !forceRender ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                        <div className="industrial-icon-box-lg mb-8">
                            {emptyIcon || <Search className="w-12 h-12 text-zinc-200 dark:text-zinc-800" />}
                        </div>
                        <div className="space-y-2 mb-8">
                            <h3 className="industrial-title-lg">
                                {emptyTitle || `Sin ${itemLabel} encontrados`}
                            </h3>
                            <p className="industrial-description max-w-sm mx-auto px-6">
                                {emptyDescription || "Todavía no hay datos cargados en esta sección."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {viewMode === "grid"
                            ? renderGrid(filteredItems, { addTag, removeTag, setSearch, clearFilters, search })
                            : renderTable(filteredItems, { addTag, removeTag, setSearch, clearFilters, search })}
                    </div>
                )}
            </div>
        </div>
    );
}
