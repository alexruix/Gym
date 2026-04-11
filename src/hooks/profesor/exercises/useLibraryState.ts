import { useState, useMemo, useEffect } from "react";
import { getRecentExercises } from "@/lib/recency";

interface Exercise {
    id: string;
    nombre: string;
    parent_id?: string | null;
    is_favorite?: boolean;
    usage_count?: number;
    tags?: string[];
    profesor_id?: string | null;
    [key: string]: any;
}

/**
 * useLibraryState: Motor de búsqueda, filtrado y jerarquía.
 */
export function useLibraryState(initialExercises: Exercise[]) {
    const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("todos"); // todos | favoritos | recientes | top | mi-gym | míos
    const [recentIds, setRecentIds] = useState<string[]>([]);

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
            list = list.filter(ex => recentIds.includes(ex.id));
        } else if (activeFilter === "top") {
            list = list.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 20);
        } else if (activeFilter === "mi-gym") {
            list = list.filter(ex => ex.profesor_id === null);
        } else if (activeFilter === "míos") {
            list = list.filter(ex => ex.profesor_id !== null);
        }

        // 2. Búsqueda Industrial (Zero friction)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(ex => 
                ex.nombre.toLowerCase().includes(q) || 
                ex.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        // 3. Ordenamiento con Boost de Recencia
        return list.sort((a, b) => {
            // Priorizar favoritos si no hay un filtro específico activo
            if (activeFilter === "todos") {
                if (a.is_favorite && !b.is_favorite) return -1;
                if (!a.is_favorite && b.is_favorite) return 1;
            }

            // Boost por Recencia (Últimos usados)
            const indexA = recentIds.indexOf(a.id);
            const indexB = recentIds.indexOf(b.id);
            if (indexA !== -1 || indexB !== -1) {
                if (indexA !== -1 && indexB === -1) return -1;
                if (indexA === -1 && indexB !== -1) return 1;
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            }

            // Default: Alfabético
            return a.nombre.localeCompare(b.nombre);
        });
    }, [exercises, searchQuery, activeFilter, recentIds]);

    // Herramientas de Jerarquía
    const getVariantsOf = (parentId: string) => {
        return exercises.filter(ex => ex.parent_id === parentId);
    };

    const mainExercises = useMemo(() => {
        // En la vista general, solemos mostrar solo los "Padres" (sin parent_id)
        // a menos que estemos buscando algo específico.
        if (searchQuery) return filteredExercises;
        return filteredExercises.filter(ex => !ex.parent_id);
    }, [filteredExercises, searchQuery]);

    return {
        exercises: mainExercises,
        rawExercises: exercises,
        setExercises,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        recentIds,
        setRecentIds,
        getVariantsOf
    };
}
