import React, { useState, useEffect, useRef } from "react";
import { MoveHorizontal, ArrowRight, Dumbbell, MoreVertical, Zap } from "lucide-react";
import { StatusRing } from "@/components/atoms/profesor/StatusRing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { agendaCopy } from "@/data/es/profesor/agenda";

interface AgendaStudentCardProps {
  student: {
    id: string;
    nombre: string;
    turno_id?: string;
    email?: string;
  };
  session?: {
    progress: number;
    coreExercise?: {
      nombre: string;
      peso_target?: string;
      peso_real?: string;
    };
  };
  onViewRoutine: (id: string) => void;
  onChangeTurno: (id: string) => void;
  active?: boolean;
}

export function AgendaStudentCard({ student, session, onViewRoutine, onChangeTurno, active = false }: AgendaStudentCardProps) {
  const t = agendaCopy.studentCard;
  const progress = session?.progress ?? 0;
  
  // Swipe Logic (Native feel without dependencies)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [bounceHint, setBounceHint] = useState(false);

  // Bounce hint on mount
  useEffect(() => {
     const timer = setTimeout(() => setBounceHint(true), 1000);
     const timerEnd = setTimeout(() => setBounceHint(false), 1400);
     return () => { clearTimeout(timer); clearTimeout(timerEnd); };
  }, []);

  const minSwipeDistance = 50;
  const maxActionWidth = 80;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Clamp the translation to action widths
    const clampedDiff = Math.max(-maxActionWidth, Math.min(maxActionWidth, diff));
    setTranslateX(clampedDiff);
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (!touchStart || !touchEnd) {
        // Reset if didn't move enough
        if (Math.abs(translateX) < minSwipeDistance) {
            setTranslateX(0);
        } else {
            // Keep open if swiped enough
            setTranslateX(translateX > 0 ? maxActionWidth : -maxActionWidth);
        }
        return;
    }
  };

  // Close swipe actions when clicking outside would be ideal, but for now, click to toggle/reset
  const resetSwipe = () => setTranslateX(0);

  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-900 group">
      
      {/* BACKGROUND ACTIONS (Revealed via Swipe) */}
      <div className="absolute inset-0 flex justify-between items-center px-4">
        {/* Left Action: Change Turno */}
        <button 
            onClick={() => { onChangeTurno(student.id); resetSwipe(); }}
            className="flex flex-col items-center justify-center w-[70px] h-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
        >
            <MoveHorizontal className="w-5 h-5 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tight">Turno</span>
        </button>

        {/* Right Action: View Routine */}
        <button 
            onClick={() => { onViewRoutine(student.id); resetSwipe(); }}
            className="flex flex-col items-center justify-center w-[70px] h-full bg-lime-500 text-zinc-950"
        >
            <ArrowRight className="w-5 h-5 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tight">Ver</span>
        </button>
      </div>

      {/* FOREGROUND CONTENT (The Card) */}
      <div
        className={cn(
          "relative z-10 flex items-center p-3 bg-white dark:bg-zinc-950 transition-all duration-300 select-none touch-pan-y shadow-sm",
          isSwiping ? "transition-none" : "transition-transform ease-out",
          bounceHint && "-translate-x-4", // Hint bounce
          active && "border-l-4 border-l-lime-500"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => translateX !== 0 && resetSwipe()}
      >
        {/* Left Side: Avatar & Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <StatusRing progress={progress} size="sm" />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-black text-zinc-900 dark:text-zinc-50">{Math.round(progress)}</span>
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50 truncate tracking-tight leading-tight">
                {student.nombre}
            </h3>
            {session?.coreExercise ? (
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate flex items-center gap-1.5 uppercase tracking-tighter">
                    <Dumbbell className="w-2.5 h-2.5 text-lime-600" />
                    {session.coreExercise.nombre} 
                    <span className="text-zinc-900 dark:text-zinc-200 font-bold ml-1">
                        {session.coreExercise.peso_real || session.coreExercise.peso_target || "0"}KG
                    </span>
                </p>
            ) : (
                <p className="text-[10px] text-zinc-400 italic uppercase">Sin actividad</p>
            )}
          </div>
        </div>

        {/* Right Side: Desktop Actions Only */}
        <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-zinc-300 hover:text-zinc-950 transition-colors"
              onClick={(e) => { e.stopPropagation(); onChangeTurno(student.id); }}
            >
              <MoveHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-lime-500 hover:text-zinc-950 transition-all"
              onClick={(e) => { e.stopPropagation(); onViewRoutine(student.id); }}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
        </div>

        {/* Swipe Handle Indicator (Mobile only) */}
        <div className="md:hidden flex items-center justify-center px-1 text-zinc-200">
             <div className="w-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
