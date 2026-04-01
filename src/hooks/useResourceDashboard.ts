import { useState, useEffect, useMemo } from "react";
import type { BaseEntity, SortOrder } from "@/types/core";

interface UseResourceDashboardOptions<T extends BaseEntity> {
    items: T[];
    storageKey: string;
    initialSort?: SortOrder;
    onSort?: (items: T[], order: SortOrder) => T[];
}

/**
 * useResourceDashboard: El "Cerebro" de MiGym. 🧠
 * Encapsula búsqueda, filtrado por hashtags y persistencia de vista.
 * Separa la lógica de datos de los componentes de UI (Layout/Organisms).
 */
export function useResourceDashboard<T extends BaseEntity>({
    items,
    storageKey,
    initialSort = "name-asc",
    onSort
}: UseResourceDashboardOptions<T>) {
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [search, setSearch] = useState("");
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<SortOrder>(initialSort);

    // Persistencia de Vista (Grid/Table)
    useEffect(() => {
        const savedView = localStorage.getItem(`viewMode_${storageKey}`);
        if (savedView === "grid" || savedView === "table") {
            setViewMode(savedView);
        }
        
        const savedSort = localStorage.getItem(`sortOrder_${storageKey}`);
        if (savedSort) {
            setSortOrder(savedSort);
        }
    }, [storageKey]);

    const toggleView = (mode: "grid" | "table") => {
        setViewMode(mode);
        localStorage.setItem(`viewMode_${storageKey}`, mode);
    };

    const handleSortChange = (newOrder: SortOrder) => {
        setSortOrder(newOrder);
        localStorage.setItem(`sortOrder_${storageKey}`, newOrder);
    };

    // Filtrado Avanzado (Búsqueda + Hashtags AND)
    const filteredItems = useMemo(() => {
        let result = items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            
            if (activeTags.length === 0) return matchesSearch;
            
            // Lógica AND: El item debe tener TODAS las etiquetas activas
            const itemTags = (item.tags || []).map(t => t.toLowerCase());
            const matchesTags = activeTags.every(tag => itemTags.includes(tag.toLowerCase()));
            
            return matchesSearch && matchesTags;
        });

        // Aplicar Ordenamiento
        if (onSort) {
            return onSort(result, sortOrder);
        }
        
        // Ordenamiento por defecto (Nombre A-Z)
        return [...result].sort((a, b) => a.name.localeCompare(b.name));

    }, [items, search, activeTags, sortOrder, onSort]);

    const addTag = (tag: string) => {
        if (!activeTags.includes(tag)) {
            setActiveTags([...activeTags, tag]);
        }
    };

    const removeTag = (tag: string) => {
        setActiveTags(activeTags.filter(t => t !== tag));
    };

    const clearFilters = () => {
        setSearch("");
        setActiveTags([]);
    };

    return {
        viewMode,
        toggleView,
        search,
        setSearch,
        activeTags,
        addTag,
        removeTag,
        clearFilters,
        sortOrder,
        setSortOrder: handleSortChange,
        filteredItems,
        totalCount: filteredItems.length
    };
}
