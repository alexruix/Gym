import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useRef, useEffect } from "react";

interface PlanNavigatorProps {
    currentWeek: number;
    numWeeks: number;
    freqSemanal?: number;
    onWeekChange: (w: number) => void;
    activeDiaAbsoluto: number;
    onDiaChange: (d: number) => void;
    rutinas: any[];
}

export function PlanNavigator({
    currentWeek,
    numWeeks,
    freqSemanal = 3,
    onWeekChange,
    activeDiaAbsoluto,
    onDiaChange,
    rutinas,
}: PlanNavigatorProps) {
    const weekScrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active week
    useEffect(() => {
        const activeBtn = weekScrollRef.current?.querySelector(`[data-week="${currentWeek}"]`);
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
    }, [currentWeek]);

    return (
        <div className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 lg:px-8 py-2 md:py-3">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">

                    {/* Selector de Semanas (Industrial Pills) */}
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Semana</span>
                        <div
                            ref={weekScrollRef}
                            className="flex gap-1 overflow-x-auto no-scrollbar py-0.5"
                        >
                            {Array.from({ length: numWeeks }, (_, i) => {
                                const wNum = i + 1;
                                const isActive = currentWeek === wNum;
                                return (
                                    <button
                                        key={wNum}
                                        data-week={wNum}
                                        type="button"
                                        onClick={() => onWeekChange(wNum)}
                                        className={cn(
                                            "px-3 py-1 rounded-3xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 border",
                                            isActive
                                                ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 border-zinc-950 dark:border-zinc-50 shadow-md"
                                                : "text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200 border-zinc-200 dark:border-zinc-800"
                                        )}
                                    >
                                        S{wNum}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Separador (Desktop) */}
                    <div className="hidden md:block w-px h-6 bg-zinc-100 dark:bg-zinc-800 opacity-50" />

                    {/* Selector de Días (High Density Grid) */}
                    <div className="flex-1">
                        <div 
                            className="grid gap-1.5"
                            style={{ gridTemplateColumns: `repeat(${Math.max(1, freqSemanal)}, minmax(0, 1fr))` }}
                        >
                            {Array.from({ length: freqSemanal }, (_, dIdx) => {
                                const diaNumAbsoluto = (currentWeek - 1) * freqSemanal + (dIdx + 1);
                                const isActive = activeDiaAbsoluto === diaNumAbsoluto;
                                const routine = rutinas[diaNumAbsoluto - 1];
                                const hasExercises = (routine?.ejercicios?.length || 0) > 0;

                                return (
                                    <button
                                        key={dIdx}
                                        type="button"
                                        onClick={() => onDiaChange(diaNumAbsoluto)}
                                        className={cn(
                                            "group flex flex-col items-center justify-center py-1 rounded-xl transition-all relative border",
                                            isActive
                                                ? "bg-lime-500 border-lime-400 text-zinc-950 shadow-lg shadow-lime-500/10 z-10"
                                                : "bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-800"
                                        )}
                                    >
                                        <span className="text-[7px] font-bold uppercase tracking-tighter opacity-60 leading-none mb-0.5">
                                            RUTINA
                                        </span>
                                        <span className="text-[11px] font-bold font-mono leading-none">{dIdx + 1}</span>

                                        {/* Puntito indicador de contenido */}
                                        {hasExercises && !isActive && (
                                            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-lime-500 border border-white dark:border-zinc-950 shadow-sm" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
