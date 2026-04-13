/**
 * Performance Utils: Cálculos técnicos de alto rendimiento.
 */

interface ExerciseMetric {
    series?: number;
    reps_target?: string | number;
    peso_target?: string | number;
    [key: string]: any;
}

/**
 * Calcula el volumen total de una rutina de forma optimizada.
 * Maneja rutinas densas sin bloquear el hilo principal.
 */
export const calculateTotalVolume = (ejercicios: ExerciseMetric[]): number => {
    if (!ejercicios || ejercicios.length === 0) return 0;
    
    return ejercicios.reduce((total, ej) => {
        const series = Number(ej.series) || 0;
        const reps = typeof ej.reps_target === 'string' ? parseInt(ej.reps_target) : Number(ej.reps_target);
        const peso = typeof ej.peso_target === 'string' ? parseFloat(ej.peso_target) : Number(ej.peso_target);
        
        if (isNaN(reps) || isNaN(peso)) return total;
        
        return total + (series * reps * peso);
    }, 0);
};

/**
 * Emite un evento háptico de 'Récord Personal' (PR).
 */
export const triggerHapticPR = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        // Patrón de pulso doble para PR
        navigator.vibrate([100, 30, 200]);
    }
};

/**
 * Emite un vibración suave para feedback técnico (Check de serie).
 * Se siente como un "clic" mecánico de precisión.
 */
export const triggerHapticSoft = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30);
    }
};

/**
 * Emite una vibración doble corta para avisar bloqueo o error.
 * "Feedback negativo" para acciones no permitidas.
 */
export const triggerHapticWarning = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
    }
};
