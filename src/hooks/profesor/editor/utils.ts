import type { EjercicioPlan } from "@/types/planes";

/**
 * Agrupa ejercicios por bloque (grupo_bloque_id).
 * Útil para la visualización en la UI de "Bloques de Ejercicios".
 */
export function getGroupedExercises(ejercicios: EjercicioPlan[]) {
  const groups: { id: string | null; nombre: string | null; exercises: EjercicioPlan[] }[] = [];
  let currentGroup: { id: string | null; nombre: string | null; exercises: EjercicioPlan[] } | null = null;

  [...ejercicios]
    .sort((a, b) => a.orden - b.orden)
    .forEach((ex) => {
      if (ex.grupo_bloque_id) {
        if (!currentGroup || currentGroup.id !== ex.grupo_bloque_id) {
          currentGroup = {
            id: ex.grupo_bloque_id,
            nombre: ex.grupo_nombre || "Bloque",
            exercises: [ex],
          };
          groups.push(currentGroup);
        } else {
          currentGroup.exercises.push(ex);
        }
      } else {
        currentGroup = null;
        groups.push({ id: null, nombre: null, exercises: [ex] });
      }
    });

  return groups;
}
