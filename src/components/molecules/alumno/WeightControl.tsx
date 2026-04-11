import React from 'react';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { sesionStrings } from '@/data/es/alumno/sesion';

interface WeightControlProps {
  weight: string;
  onWeightChange: (val: string) => void;
}

export function WeightControl({ weight, onWeightChange }: WeightControlProps) {
  const update = (delta: number) => {
    const current = parseFloat(weight || "0");
    onWeightChange(String(Math.max(0, current + delta)));
  };

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-3xl space-y-3 border border-transparent focus-within:border-lime-500/30 transition-all">
      <TechnicalLabel className="text-zinc-400">
        {sesionStrings.activeSession.realWeight}
      </TechnicalLabel>
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); update(-2.5); }}
          className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-black dark:text-white font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm"
        >
          -
        </button>
        <input 
          type="number" 
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          className="w-full bg-transparent text-4xl font-black text-black dark:text-white text-center border-none outline-none focus:ring-0 p-0"
          placeholder="0"
        />
        <button 
          onClick={(e) => { e.stopPropagation(); update(2.5); }}
          className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-black dark:text-white font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm"
        >
          +
        </button>
      </div>
    </div>
  );
}
