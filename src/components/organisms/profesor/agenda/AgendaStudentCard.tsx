import React, { useState, useEffect, useRef } from "react";
import { MoveHorizontal, ArrowRight, Dumbbell, MoreVertical, Zap, UserIcon } from "lucide-react";
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
  
  // Swipe Logic remains for mobile feel
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const maxActionWidth = 80;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    const clampedDiff = Math.max(-maxActionWidth, Math.min(maxActionWidth, diff));
    setTranslateX(clampedDiff);
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (Math.abs(translateX) < 40) {
        setTranslateX(0);
    } else {
        setTranslateX(translateX > 0 ? maxActionWidth : -maxActionWidth);
    }
  };

  const resetSwipe = () => setTranslateX(0);

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-zinc-100 dark:border-zinc-900 group shadow-sm bg-white dark:bg-zinc-950">
      
      {/* BACKGROUND ACTIONS */}
      <div className="absolute inset-0 flex justify-between items-center px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <button 
            onClick={() => { onChangeTurno(student.id); resetSwipe(); }}
            className="flex flex-col items-center justify-center w-[70px] h-full text-zinc-400 hover:text-zinc-600 transition-colors"
        >
            <MoveHorizontal className="w-5 h-5 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tight">Turno</span>
        </button>

        <button 
            onClick={() => { onViewRoutine(student.id); resetSwipe(); }}
            className="flex flex-col items-center justify-center w-[70px] h-full text-lime-600 hover:text-lime-700 transition-colors"
        >
            <ArrowRight className="w-5 h-5 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tight">Ver</span>
        </button>
      </div>

      {/* FOREGROUND CONTENT */}
      <div
        className={cn(
          "relative z-10 flex items-center p-3 sm:p-4 bg-white dark:bg-zinc-950 transition-all duration-300 select-none touch-pan-y",
          isSwiping ? "transition-none" : "transition-transform ease-out",
          active && "border-l-4 border-l-lime-500"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => translateX !== 0 && resetSwipe()}
      >
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            {/* Placeholder for Avatar style from image */}
            <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                <UserIcon className="w-6 h-6 text-zinc-400" />
            </div>
            {/* Overlay progress if training */}
            {progress > 0 && (
                <div className="absolute inset-0 ring-2 ring-lime-500 ring-inset opacity-50" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50 truncate tracking-tight leading-none mb-1 text-nowrap">
                {student.nombre}
            </h3>
            <div className="flex items-center gap-2">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    session?.coreExercise ? "text-lime-600" : "text-zinc-400"
                )}>
                    {session?.coreExercise ? session.coreExercise.nombre : "SIN ACTIVIDAD"}
                </span>
                {session?.coreExercise && (
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-black">
                        {session.coreExercise.peso_real || session.coreExercise.peso_target || "0"}KG
                    </span>
                )}
            </div>
          </div>
        </div>

        {/* Industrial Buttons (Desktop & Mobile) */}
        <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-950 hover:text-white transition-all active:scale-95"
              onClick={(e) => { e.stopPropagation(); onChangeTurno(student.id); }}
            >
              <MoveHorizontal className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-950 hover:text-white transition-all active:scale-95"
              onClick={(e) => { e.stopPropagation(); onViewRoutine(student.id); }}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
        </div>
      </div>
    </div>
  );
}
