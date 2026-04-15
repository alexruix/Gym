import { useState, useMemo, useEffect } from "react";
import { getRecentExercises } from "@/lib/recency";

export interface Exercise {
    id: string;
    nombre: string;
    descripcion?: string | null;
    media_url?: string | null;
    video_url?: string | null;
    parent_id?: string | null;
    is_template_base?: boolean;
    is_favorite?: boolean;
    usage_count?: number;
    tags?: string[];
    profesor_id?: string | null;
    created_at?: string;
    [key: string]: any;
}

/**
 * useLibraryState: Motor de búsqueda, filtrado y jerarquía.
 */
export function useLibraryState(initialExercises: Exercise[]) {
    // Definimos la función de normalización fuera para reutilizarla
    const normalize = (s: string) => 
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Enriquecemos los ejercicios con datos pre-normalizados para búsqueda Zero Friction
    const prepareExercises = (list: Exercise[]) => list.map(ex => ({
        ...ex,
        _searchable: `${normalize(ex.nombre)} ${ex.tags?.map(t => normalize(t)).join(" ") || ""}`
    }));

    const [exercises, setExercisesState] = useState<Exercise[]>(() => prepareExercises(initialExercises));
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("todos"); // todos | favoritos | recientes | top | mi-gym | míos
    const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
    const [recentIds, setRecentIds] = useState<string[]>([]);

    const setExercises = (newList: Exercise[] | ((prev: Exercise[]) => Exercise[])) => {
        if (typeof newList === "function") {
            setExercisesState(prev => prepareExercises(newList(prev)));
        } else {
            setExercisesState(prepareExercises(newList));
        }
    };

    // Cargar recencia inicial y escuchar actualizaciones
    useEffect(() => {
        setRecentIds(getRecentExercises());

        const handleUpdate = (e: any) => {
            if (e.detail) setRecentIds(e.detail);
        };
        window.addEventListener("migym:recency_updated", handleUpdate);
        return () => window.removeEventListener("migym:recency_updated", handleUpdate);
    }, []);

    const filteredExercises = useMemo(() => {
        let list = [...exercises];

        // 1. Filtrado por Etiquetas / Categorías
        if (activeFilter === "favoritos") {
            list = list.filter(ex => ex.is_favorite);
        } else if (activeFilter === "recientes") {
            const recentSet = new Set(recentIds);
            list = list.filter(ex => recentSet.has(ex.id));
        } else if (activeFilter === "top") {
            list = list.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 20);
        } else if (activeFilter === "mi-gym") {
            list = list.filter(ex => ex.profesor_id === null);
        } else if (activeFilter === "míos") {
            list = list.filter(ex => ex.profesor_id !== null);
        }

        // 2. Filtrado Muscular (Pills)
        if (muscleFilter) {
            const m = normalize(muscleFilter);
            list = list.filter(ex => (ex as any)._searchable.includes(m));
        }

        // 3. Búsqueda Industrial (Zero friction)
        if (searchQuery) {
            const q = normalize(searchQuery);
            list = list.filter(ex => (ex as any)._searchable.includes(q));
        }

        // 4. Ordenamiento con Boost de Recencia
        const recentMap = new Map<string, number>(recentIds.map((id, index) => [id, index]));
        const isDefaultFilter = activeFilter === "todos";

        return list.sort((a, b) => {
            if (isDefaultFilter) {
                if (a.is_favorite && !b.is_favorite) return -1;
                if (!a.is_favorite && b.is_favorite) return 1;
            }

            const indexA = recentMap.has(a.id) ? recentMap.get(a.id)! : -1;
            const indexB = recentMap.has(b.id) ? recentMap.get(b.id)! : -1;
            
            if (indexA !== -1 || indexB !== -1) {
                if (indexA !== -1 && indexB === -1) return -1;
                if (indexA === -1 && indexB !== -1) return 1;
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            }

            return a.nombre.localeCompare(b.nombre);
        });
    }, [exercises, searchQuery, activeFilter, recentIds, muscleFilter]);

    // Herramientas de Jerarquía
    const getVariantsOf = (parentId: string) => {
        return exercises.filter(ex => ex.parent_id === parentId);
    };


    const mainExercises = useMemo(() => {
        if (!searchQuery && activeFilter === "todos" && !muscleFilter) {
            return filteredExercises.filter(ex => !ex.parent_id);
        }
        
        const parentIdsToShow = new Set<string>();
        filteredExercises.forEach(ex => {
            parentIdsToShow.add(ex.parent_id || ex.id);
        });
        
        return exercises.filter(ex => parentIdsToShow.has(ex.id));
    }, [filteredExercises, exercises, searchQuery, activeFilter, muscleFilter]);

    return {
        exercises: mainExercises,
        allFiltered: filteredExercises,
        rawExercises: exercises,
        setExercises,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        muscleFilter,
        setMuscleFilter,
        recentIds,
        setRecentIds,
        getVariantsOf
    };
}
