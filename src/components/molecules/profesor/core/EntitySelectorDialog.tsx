import { useState, useEffect, useMemo, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Search,
    Loader2,
    Check,
    X,
    Tag,
    AlertTriangle,
    Plus,
    Ghost
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BaseEntity } from "@/types/core";

interface Props<T extends BaseEntity> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    items: T[];
    isLoading?: boolean;
    isSaving?: boolean;
    /** Soporta selección múltiple si se provee multiple=true */
    multiple?: boolean;
    /** IDs inicialmente seleccionados */
    initialSelectedIds?: string[];
    /** Texto del botón de confirmación */
    confirmLabel?: string;
    onConfirm: (selectedIds: string[]) => void;
    /** Slot para renderizado personalizado de cada fila */
    renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
    /** Alerta opcional (ej: advertencia de sobreescritura) */
    warningMessage?: string;
    /** Todas las etiquetas disponibles para el autocompletado de #tags */
    allTags?: string[];
    /** Opción para añadir entidad inline */
    onCreateNew?: () => void;
    createNewLabel?: string;
    children?: React.ReactNode;
}

/**
 * EntitySelectorDialog: El selector universal de MiGym (V2.2 Core).
 * Unifica la inteligencia de búsqueda, el filtrado por hashtags y la selección en un solo motor.
 */
export function EntitySelectorDialog<T extends BaseEntity>({
    open,
    onOpenChange,
    title,
    description,
    items,
    isLoading = false,
    isSaving = false,
    multiple = false,
    initialSelectedIds = [],
    confirmLabel = "Confirmar Selección",
    onConfirm,
    renderItem,
    warningMessage,
    allTags = [],
    onCreateNew,
    createNewLabel = "Crear Nuevo",
    children
}: Props<T>) {
    const [search, setSearch] = useState("");
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Resetear estado al abrir
    useEffect(() => {
        if (open) {
            setSelectedIds(new Set(initialSelectedIds));
            setSearch("");
            setActiveTags([]);
            setTimeout(() => searchInputRef.current?.focus(), 150);
        }
    }, [open]); // No incluimos initialSelectedIds para evitar bucles si es un literal []

    // Lógica de Filtrado (Coincidencia con DashboardConsole)
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());

            if (activeTags.length === 0) return matchesSearch;

            const itemTags = (item.tags || []).map(t => t.toLowerCase());
            const matchesTags = activeTags.every(tag => itemTags.includes(tag.toLowerCase()));

            return matchesSearch && matchesTags;
        });
    }, [items, search, activeTags]);

    const handleToggle = (id: string) => {
        if (!multiple) {
            setSelectedIds(new Set([id]));
            return;
        }

        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const addTag = (tag: string) => {
        if (!activeTags.includes(tag)) {
            setActiveTags([...activeTags, tag]);
            setSearch("");
        }
    };

    const removeTag = (tag: string) => {
        setActiveTags(activeTags.filter(t => t !== tag));
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedIds));
        if (!multiple) onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 rounded-[32px] bg-white dark:bg-zinc-950 shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl font-bold uppercase tracking-tight shrink-0">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {/* Buscador Universal */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 relative group">
                    <Search className={cn(
                        "absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                        search ? "text-lime-500" : "text-zinc-400 group-focus-within:text-lime-500"
                    )} />
                    <Input
                        ref={searchInputRef}
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-12 bg-zinc-100/50 dark:bg-zinc-900/50 border-none rounded-2xl text-sm font-bold placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-lime-400/20"
                    />

                    {/* Hashtag Suggestions */}
                    {search.startsWith("#") && allTags.length > 0 && (
                        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50">
                            <div className="flex flex-wrap gap-2">
                                {allTags.filter(t => t.toLowerCase().includes(search.slice(1).toLowerCase())).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => addTag(t)}
                                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-lime-500 hover:text-zinc-950 transition-all"
                                    >
                                        #{t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Etiquetas Activas */}
                {activeTags.length > 0 && (
                    <div className="px-6 py-3 flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                        {activeTags.map(tag => (
                            <div key={tag} className="flex items-center gap-2 bg-lime-500/10 border border-lime-400/20 px-2.5 py-1 rounded-xl">
                                <Tag className="w-3 h-3 text-lime-500" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">#{tag}</span>
                                <button onClick={() => removeTag(tag)} className="p-0.5 hover:bg-lime-500 hover:text-zinc-950 rounded-md transition-all">
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Listado de Items o Content Slot */}
                <div className="max-h-[450px] overflow-y-auto no-scrollbar">
                    {children ? (
                        children
                    ) : isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-8 text-center italic">Sincronizando biblioteca core...</span>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-center px-12">
                            <Ghost className="w-12 h-12 text-zinc-100 dark:text-zinc-900" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No encontramos lo que buscás.</p>
                            {onCreateNew && (
                                <button
                                    onClick={onCreateNew}
                                    className="text-lime-500 font-bold text-[10px] uppercase tracking-widest h-10"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-2" /> {createNewLabel}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                            {filteredItems.map((item) => {
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleToggle(item.id)}
                                        className={cn(
                                            "group flex items-center gap-4 px-6 py-4 cursor-pointer transition-all",
                                            isSelected ? "bg-lime-500/5" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                                        )}
                                    >
                                        {multiple && (
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => handleToggle(item.id)}
                                                className="rounded-md border-2 border-zinc-200"
                                            />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            {renderItem ? (
                                                renderItem(item, isSelected)
                                            ) : (
                                                <div className="flex flex-col">
                                                    <p className={cn(
                                                        "text-sm font-bold uppercase tracking-tight truncate",
                                                        isSelected ? "text-zinc-950 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                                                    )}>
                                                        {item.name}
                                                    </p>
                                                    {item.tags && item.tags.length > 0 && (
                                                        <p className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 truncate">
                                                            {item.tags.map(t => `#${t}`).join(" ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {!multiple && isSelected && (
                                            <div className="bg-lime-500 p-1 rounded-full shadow-lg">
                                                <Check className="w-3 h-3 text-zinc-950" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ooter Industrial (Solo si no hay children manejando el form) */}
                {!children && (
                    <DialogFooter className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                        <div className="flex flex-col w-full gap-4">
                            {warningMessage && selectedIds.size > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl animate-in slide-in-from-bottom-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 leading-snug">
                                        {warningMessage}
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    className="flex-1 h-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    disabled={isSaving || selectedIds.size === 0}
                                    onClick={handleConfirm}
                                    className="flex-[2] h-12 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-lime-500/10"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
