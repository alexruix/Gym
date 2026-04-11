import React from 'react';
import { cn } from '@/lib/utils';

interface RPESelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * RPESelector: Selector industrial de Esfuerzo Percibido (RPE 1-10).
 * Los colores semánticos indican la intensidad:
 * 1-6: Calentamiento (Zinc)
 * 7-8: Sweet Spot (Lime)
 * 9-10: Esfuerzo Máximo (Fuchsia/Red)
 */
export function RPESelector({ value, onChange, className }: RPESelectorProps) {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  const getLevelColor = (level: number) => {
    if (level <= 6) return 'hover:bg-zinc-700/50 bg-zinc-800/40 text-zinc-500';
    if (level <= 8) return 'hover:bg-lime-500/30 bg-lime-500/10 text-lime-400 border-lime-500/20';
    return 'hover:bg-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';
  };

  const getSelectedColor = (level: number) => {
    if (level <= 6) return 'bg-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]';
    if (level <= 8) return 'bg-lime-400 text-black shadow-[0_0_20px_rgba(163,230,53,0.4)]';
    return 'bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)]';
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Esfuerzo (RPE)
        </span>
        {value && (
          <span className={cn(
            "text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter",
            value <= 6 ? "text-zinc-500" : value <= 8 ? "text-lime-400" : "text-fuchsia-400"
          )}>
            Nivel {value} {value >= 9 ? '🔥' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {levels.map((level) => {
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={cn(
                "h-12 rounded-xl text-sm font-black transition-all duration-300 border border-transparent active:scale-90",
                isSelected ? getSelectedColor(level) : getLevelColor(level)
              )}
            >
              {level}
            </button>
          );
        })}
      </div>

      {/* RPE Description Helper */}
      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider text-center mt-2 leading-relaxed px-4">
        {value === 10 ? 'Falla técnica o absoluta' : 
         value === 9 ? 'A máxima intensidad' : 
         value >= 7 ? 'Sesión de alta mejora' : 
         value > 0 ? 'Carga de trabajo controlada' : 
         'Seleccioná qué tan pesado se sintió'}
      </p>
    </div>
  );
}
