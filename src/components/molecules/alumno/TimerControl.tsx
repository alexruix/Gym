import React from 'react';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { sesionStrings } from '@/data/es/alumno/sesion';

interface TimerControlProps {
  secondsLeft: number | undefined;
  targetSeconds: number;
  isActive: boolean;
  onStart: () => void;
}

export function TimerControl({ secondsLeft, targetSeconds, isActive, onStart }: TimerControlProps) {
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-3xl flex flex-col justify-center items-center gap-2 border border-transparent">
      <TechnicalLabel className="text-zinc-400">
        {sesionStrings.activeSession.rest}
      </TechnicalLabel>
      <div 
        onClick={(e) => { e.stopPropagation(); onStart(); }}
        className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 duration-500",
          isActive
            ? "bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.3)]"
            : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white"
        )}
      >
        <Timer className={cn("w-5 h-5", isActive && "animate-pulse")} />
        <span className="text-xl font-black tabular-nums">
          {isActive && secondsLeft !== undefined
            ? formatTime(secondsLeft)
            : `${targetSeconds}"`}
        </span>
      </div>
    </div>
  );
}
