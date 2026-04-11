import React from 'react';
import { cn } from '@/lib/utils';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConsistencyHeatmapProps {
  data: Record<string, number>; // { "YYYY-MM-DD": intensity (0-4) }
  className?: string;
}

/**
 * ConsistencyHeatmap: Cuadrícula estilo GitHub para visualizar la adherencia.
 * Inspiración: "No romper la racha".
 * Intensidad visual basada en el volumen/esfuerzo del día.
 */
export function ConsistencyHeatmap({ data, className }: ConsistencyHeatmapProps) {
  // Generar últimos 91 días (13 semanas)
  const today = new Date();
  const startDate = subDays(today, 90);
  const days = eachDayOfInterval({ start: startDate, end: today });

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1: return 'bg-lime-500/20'; // Base / Bajo volumen
      case 2: return 'bg-lime-500/40'; // Medio
      case 3: return 'bg-lime-500/70 shadow-[0_0_10px_rgba(163,230,53,0.3)]'; // Alto
      case 4: return 'bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.5)] border border-white/20'; // Máximo
      default: return 'bg-zinc-900/40 border border-white/5'; // Sin actividad
    }
  };

  return (
    <div className={cn("w-full bg-zinc-950/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">
            Consistencia mental
          </h4>
          <p className="text-lg font-black text-white tracking-tighter uppercase">
            Adherencia al plan
          </p>
        </div>
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={cn("w-2 h-2 rounded-sm", getIntensityColor(i))} />
            ))}
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
        {days.map((day, idx) => {
          const iso = format(day, 'yyyy-MM-dd');
          const intensity = data[iso] || 0;
          
          return (
            <div
              key={iso}
              title={`${format(day, 'PPPP', { locale: es })}: Nivel ${intensity}`}
              className={cn(
                "w-3.5 h-3.5 rounded-[3px] transition-all duration-500 hover:scale-125 hover:z-10 cursor-help",
                getIntensityColor(intensity)
              )}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest">
        <span>{format(startDate, 'MMM yyyy', { locale: es })}</span>
        <div className="flex gap-4">
            <span>Menos</span>
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-900 rounded-sm" />
                <div className="w-2 h-2 bg-lime-500/30 rounded-sm" />
                <div className="w-2 h-2 bg-lime-500/60 rounded-sm" />
                <div className="w-2 h-2 bg-lime-400 rounded-sm" />
            </div>
            <span>Más esfuerzo</span>
        </div>
        <span>Hoy</span>
      </div>
    </div>
  );
}
