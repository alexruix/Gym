import { useState, useEffect } from "react";

interface UseFormNavigationProps {
    effectiveNumWeeks: number;
    freqSemanal: number;
    onSave: () => void;
}

/**
 * useFormNavigation: Gestión de navegación industrial (Teclado + Selección).
 */
export function useFormNavigation({ effectiveNumWeeks, freqSemanal, onSave }: UseFormNavigationProps) {
    const [activeDiaAbsoluto, setActiveDiaAbsoluto] = useState<number>(1);
    const [currentWeek, setCurrentWeek] = useState(1);

    // Atajos de Teclado Industriales
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            // 'S' Semana, 'D' Día
            if (e.key === "s" || e.key === "S") {
                const nextWeek = (currentWeek % effectiveNumWeeks) + 1;
                setCurrentWeek(nextWeek);
                setActiveDiaAbsoluto((nextWeek - 1) * freqSemanal + 1);
            }
            if (e.key === "d" || e.key === "D") {
                const nextDia = (activeDiaAbsoluto % (effectiveNumWeeks * freqSemanal)) + 1;
                setCurrentWeek(Math.ceil(nextDia / freqSemanal));
                setActiveDiaAbsoluto(nextDia);
            }
            if (e.key === "Enter" && e.ctrlKey) {
                onSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentWeek, effectiveNumWeeks, activeDiaAbsoluto, freqSemanal, onSave]);

    // Autocorrección de límites
    useEffect(() => {
        const maxValidDay = effectiveNumWeeks * freqSemanal;
        if (activeDiaAbsoluto > maxValidDay) {
            setActiveDiaAbsoluto(Math.max(1, maxValidDay));
            setCurrentWeek(Math.max(1, Math.ceil(maxValidDay / freqSemanal)));
        }
    }, [effectiveNumWeeks, freqSemanal, activeDiaAbsoluto]);

    return {
        activeDiaAbsoluto,
        setActiveDiaAbsoluto,
        currentWeek,
        setCurrentWeek
    };
}
