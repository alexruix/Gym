import React from 'react';
import { cn } from '@/lib/utils';

interface PositionIndicatorProps {
  number: number;
  isActive: boolean;
}

export function PositionIndicator({ number, isActive }: PositionIndicatorProps) {
  return (
    <div className={cn(
      "absolute -left-3 top-8 w-10 h-10 rounded-2xl flex items-center justify-center font-black italic text-sm shadow-xl transition-all duration-500",
      isActive 
        ? "bg-lime-400 text-black -rotate-6 scale-110 shadow-lime-500/30" 
        : "bg-zinc-800 text-zinc-500 scale-100"
    )}>
      {number}
    </div>
  );
}
