import { useState, useEffect, useMemo } from "react";
import { actions } from "astro:actions";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
  parent_id?: string | null;
  is_template_base?: boolean;
  profesor_id?: string | null;
}

interface Block {
  id: string;
  nombre: string;
  tipo_bloque: 'superserie' | 'circuito' | 'agrupador';
  vueltas: number;
  descanso_final: number;
  tags?: string[];
  bloques_ejercicios?: any[];
}

type TabMode = "exercises" | "blocks";
type SourceFilter = "all" | "mine" | "migym";
type ViewMode = "list" | "create-exercise" | "create-block" | "edit-block";

const STORAGE_KEY = "migym_plan_library_tab";

/**
 * usePlanLibraryPanel: Motor detrás del buscador del editor de planes.
 * Optimiza la latencia de filtrado y el manejo de persistencia de pestañas.
 */
export function usePlanLibraryPanel({ externalLibrary, currentExerciseId }: { 
    externalLibrary?: Exercise[], 
    currentExerciseId?: string | null 
}) {
    const [mode, setMode] = useState<TabMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem(STORAGE_KEY) as TabMode) || "exercises";
        }
        return "exercises";
    });

    const [view, setView] = useState<ViewMode>("list");
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
    const [internalLibrary, setInternalLibrary] = useState<Exercise[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
    const [editingBlockData, setEditingBlockData] = useState<any>(null);

    const library = externalLibrary ?? internalLibrary;

    useEffect(() => {
        if (!externalLibrary) fetchLibrary();
        fetchBlocks();
    }, [externalLibrary]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, mode);
    }, [mode]);

    async function fetchLibrary() {
        if (externalLibrary) return;
        setIsLoading(true);
        try {
            const { data } = await actions.profesor.getExerciseLibrary();
            if (data) setInternalLibrary(data as any);
        } catch (err) {
            console.error("[usePlanLibraryPanel] Error loading library:", err);
        } finally {
            if (mode === "exercises") setIsLoading(false);
        }
    }

    async function fetchBlocks() {
        if (mode === "blocks") setIsLoading(true);
        try {
            const { data } = await actions.profesor.getBlocks();
            if (Array.isArray(data)) setBlocks(data);
        } catch (err) {
            console.error("[usePlanLibraryPanel] Error loading blocks:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const processedExercises = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        const suggestedVariants = currentExerciseId
            ? library.filter(ex => ex.parent_id === currentExerciseId && ex.nombre.toLowerCase().includes(lowerSearch))
            : [];

        const suggestedIds = new Set(suggestedVariants.map(v => v.id));
        const vMap: Record<string, Exercise[]> = {};
        const bySource = library.filter(ex => {
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

        const parentList = bySource
            .filter(ex => {
                if (ex.parent_id) return false;
                if (ex.id === currentExerciseId) return false;
                if (suggestedIds.has(ex.id)) return false;
                const hasMatchingChild = vMap[ex.id]?.some(c => c.nombre.toLowerCase().includes(lowerSearch));
                return ex.nombre.toLowerCase().includes(lowerSearch) || hasMatchingChild;
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        return { suggestedVariants, parents: parentList, variantsMap: vMap };
    }, [library, search, sourceFilter, currentExerciseId]);

    const filteredBlocks = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return blocks.filter(b => b.nombre.toLowerCase().includes(lowerSearch));
    }, [blocks, search]);

    const toggleParent = (parentId: string) => {
        setExpandedParents(prev => {
            const next = new Set(prev);
            if (next.has(parentId)) next.delete(parentId);
            else next.add(parentId);
            return next;
        });
    };

    const handleEditBlock = (block: any) => {
        setEditingBlockData(block);
        setView("edit-block");
    };

    return {
        mode, setMode,
        view, setView,
        search, setSearch,
        sourceFilter, setSourceFilter,
        isLoading,
        suggestedVariants: processedExercises.suggestedVariants,
        parents: processedExercises.parents,
        variantsMap: processedExercises.variantsMap,
        filteredBlocks,
        expandedParents,
        toggleParent,
        editingBlockData,
        handleEditBlock,
        refresh: () => {
            fetchLibrary();
            fetchBlocks();
        },
        libraryCount: library.length,
        blocksCount: blocks.length,
        library
    };
}
