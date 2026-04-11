/**
 * Recency Utility: Gestión persistente de ejercicios recientes.
 */

const RECENCY_KEY = "migym_recent_exercises";
const MAX_RECENTS = 20;

export const trackExerciseUsage = (id: string) => {
    if (typeof window === "undefined") return;
    
    try {
        const stored = localStorage.getItem(RECENCY_KEY);
        let recents: string[] = stored ? JSON.parse(stored) : [];
        
        // Mover al principio y limitar
        recents = [id, ...recents.filter(rid => rid !== id)].slice(0, MAX_RECENTS);
        
        localStorage.setItem(RECENCY_KEY, JSON.stringify(recents));
        
        // Disparar evento para que otros hooks se enteren
        window.dispatchEvent(new CustomEvent("migym:recency_updated", { detail: recents }));
    } catch (err) {
        console.error("[Recency] Error tracking usage:", err);
    }
};

export const getRecentExercises = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(RECENCY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};
