import { useMemo } from "react";

/**
 * useUniqueTags: Extrae y deduplica etiquetas de un array de entidades.
 *
 * REGLA DE ORO: El patrón de derivar tags únicos apareció en
 * ExerciseLibrary.tsx y StudentList.tsx con lógica idéntica.
 *
 * @param items - Array de entidades
 * @param getTags - Función que extrae el array de tags de cada item
 *
 * Uso:
 * ```tsx
 * // Desde strings directos
 * const tags = useUniqueTags(exercises, (ex) => ex.tags);
 *
 * // Desde un campo específico (ej: planName como tag)
 * const tags = useUniqueTags(students, (s) => s.planName ? [s.planName] : []);
 * ```
 */
export function useUniqueTags<T>(
    items: T[],
    getTags: (item: T) => string[] | null | undefined
): string[] {
    return useMemo(() => {
        const tagSet = new Set<string>();
        items.forEach((item) => {
            const tags = getTags(item);
            tags?.forEach((tag) => tag && tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [items, getTags]);
}
