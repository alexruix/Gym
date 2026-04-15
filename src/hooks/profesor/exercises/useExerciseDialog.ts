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

type SourceFilter = "all" | "mine" | "migym";

interface Props {
    open: boolean;
    externalLibrary?: Exercise[];
    currentExerciseId?: string | null;
    onlyBase?: boolean;
    sourceFilter: SourceFilter;
    search: string;
}

/**
 * useExerciseDialog: Motor de búsqueda y filtrado de la biblioteca.
 * Aísla la complejidad del procesamiento de datos (padres/hijos) del UI del diálogo.
 */
export function useExerciseDialog({ open, externalLibrary, currentExerciseId, onlyBase, sourceFilter, search }: Props) {
    const [internalLibrary, setInternalLibrary] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

    const library = externalLibrary ?? internalLibrary;

    useEffect(() => {
        if (!open) {
            setExpandedParents(new Set());
            return;
        }
        if (!externalLibrary && internalLibrary.length === 0) {
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

    const processedData = useMemo(() => {
        const lowerSearch = search.toLowerCase();

        // 1. Variantes sugeridas
        const suggestedVariants = currentExerciseId
            ? library.filter(ex =>
                ex.parent_id === currentExerciseId &&
                ex.nombre.toLowerCase().includes(lowerSearch)
            )
            : [];

        const suggestedIds = new Set(suggestedVariants.map(v => v.id));

        // 2. Mapa de variantes
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

        // 3. Padres
        const parentList = bySource
            .filter(ex => {
                if (ex.parent_id) return false;
                if (ex.id === currentExerciseId) return false;
                if (suggestedIds.has(ex.id)) return false;
                const hasMatchingChild = !onlyBase && vMap[ex.id]?.some(c => c.nombre.toLowerCase().includes(lowerSearch));
                return ex.nombre.toLowerCase().includes(lowerSearch) || hasMatchingChild;
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        return { suggestedVariants, parents: parentList, variantsMap: vMap };
    }, [library, search, sourceFilter, currentExerciseId, onlyBase]);

    const toggleParent = (parentId: string) => {
        setExpandedParents(prev => {
            const next = new Set(prev);
            if (next.has(parentId)) next.delete(parentId);
            else next.add(parentId);
            return next;
        });
    };

    return {
        isLoading,
        suggestedVariants: processedData.suggestedVariants,
        parents: processedData.parents,
        variantsMap: processedData.variantsMap,
        expandedParents,
        toggleParent,
        totalResults: processedData.suggestedVariants.length + processedData.parents.length
    };
}
