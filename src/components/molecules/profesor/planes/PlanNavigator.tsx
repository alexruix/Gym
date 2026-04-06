import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { useRef, useEffect } from "react";

interface PlanNavigatorProps {
  currentWeek: number;
  numWeeks: number;
  onWeekChange: (w: number) => void;
  activeDiaAbsoluto: number;
  onDiaChange: (d: number) => void;
  rutinas: any[];
}

const DIAS_LABELS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"];

export function PlanNavigator({
  currentWeek,
  numWeeks,
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
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            
            {/* Selector de Semanas (Compacto) */}
            <div className="flex items-center gap-4 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Semana</span>
                <div 
                    ref={weekScrollRef}
                    className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800"
                >
                    {Array.from({ length: Math.min(numWeeks, 8) }, (_, i) => {
                        const wNum = i + 1;
                        const isActive = currentWeek === wNum;
                        return (
                            <button
                                key={wNum}
                                data-week={wNum}
                                onClick={() => onWeekChange(wNum)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                                    isActive 
                                        ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-md scale-105" 
                                        : "text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200"
                                )}
                            >
                                S{wNum}
                            </button>
                        );
                    })}
                    {numWeeks > 8 && (
                        <select 
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase px-2 text-zinc-500"
                            value={currentWeek > 8 ? currentWeek : ""}
                            onChange={(e) => e.target.value && onWeekChange(parseInt(e.target.value))}
                        >
                            <option value="">...</option>
                            {Array.from({ length: numWeeks - 8 }, (_, i) => (
                                <option key={i+9} value={i+9}>W{i+9}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Separador (Solo en Desktop) */}
            <div className="hidden md:block w-px h-8 bg-zinc-100 dark:bg-zinc-800" />

            {/* Selector de Días (Grid 7 Columnas) */}
            <div className="flex-1 grid grid-cols-7 gap-2">
                {DIAS_LABELS.map((label, dIdx) => {
                    const diaNumAbsoluto = (currentWeek - 1) * 7 + (dIdx + 1);
                    const isActive = activeDiaAbsoluto === diaNumAbsoluto;
                    const routine = rutinas[diaNumAbsoluto - 1];
                    const hasExercises = (routine?.ejercicios?.length || 0) > 0;

                    return (
                        <button
                            key={dIdx}
                            onClick={() => onDiaChange(diaNumAbsoluto)}
                            className={cn(
                                "group flex flex-col items-center justify-center p-1.5 rounded-full transition-all relative",
                                isActive 
                                    ? "bg-lime-400 text-zinc-950 shadow-xl shadow-lime-500/20 scale-110 z-10" 
                                    : "bg-transparent text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                            )}
                        >
                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 leading-none mb-0.5">
                                {label}
                            </span>
                            <span className="text-xs font-black leading-none">{dIdx + 1}</span>
                            
                            {/* Puntito indicador */}
                            {hasExercises && !isActive && (
                                <div className="absolute top-0 right-1/4 w-1 h-1 rounded-full bg-lime-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}
