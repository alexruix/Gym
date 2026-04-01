import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";

interface PlanNavigatorProps {
  currentWeek: number;
  numWeeks: number;
  onWeekChange: (w: number) => void;
  activeDiaAbsoluto: number;
  onDiaChange: (d: number) => void;
  rutinas: any[];
}

const DIAS_CORTOS = ["L", "M", "M", "J", "V", "S", "D"];

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
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4 space-y-4">
        
        {/* Selector de Semanas (Horizontal Scroll) */}
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 shrink-0">Semana</span>
            <div 
                ref={weekScrollRef}
                className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-right"
            >
                {Array.from({ length: numWeeks }, (_, i) => {
                    const wNum = i + 1;
                    const isActive = currentWeek === wNum;
                    return (
                        <button
                            key={wNum}
                            data-week={wNum}
                            onClick={() => onWeekChange(wNum)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2",
                                isActive 
                                    ? "bg-zinc-950 border-zinc-950 text-white dark:bg-white dark:text-zinc-950" 
                                    : "bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-400 hover:border-zinc-200"
                            )}
                        >
                            W{wNum}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Selector de Días de la Semana Seleccionada */}
        <div className="grid grid-cols-7 gap-2 lg:gap-4">
            {DIAS_CORTOS.map((label, dIdx) => {
                const diaNumAbsoluto = (currentWeek - 1) * 7 + (dIdx + 1);
                const isActive = activeDiaAbsoluto === diaNumAbsoluto;
                const routine = rutinas[diaNumAbsoluto - 1];
                const hasExercises = (routine?.ejercicios?.length || 0) > 0;

                return (
                    <button
                        key={dIdx}
                        onClick={() => onDiaChange(diaNumAbsoluto)}
                        className={cn(
                            "group flex flex-col items-center gap-1 py-1.5 rounded-2xl border-2 transition-all relative overflow-hidden",
                            isActive 
                                ? "bg-lime-400 border-lime-400 text-zinc-950 shadow-lg shadow-lime-500/20 scale-105 z-10" 
                                : "bg-white dark:bg-zinc-900 border-transparent text-zinc-400 hover:border-zinc-100 dark:hover:border-zinc-800"
                        )}
                    >
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 leading-none">
                            {label}
                        </span>
                        <span className="text-xs font-black leading-none">{dIdx + 1}</span>
                        
                        {/* Indicador de progreso/ejercicios */}
                        {hasExercises && !isActive && (
                            <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-lime-500" />
                        )}
                        {isActive && hasExercises && (
                            <CheckCircle2 className="w-2 h-2 mt-0.5 animate-in zoom-in duration-300" />
                        )}
                    </button>
                );
            })}
        </div>
      </div>
    </div>
  );
}
