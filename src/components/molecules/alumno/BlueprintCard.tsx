import React from 'react';
import { cn } from '@/lib/utils';
import { Box, Dumbbell } from 'lucide-react';

interface BlueprintCardProps {
  diaNumero: number;
  nombreDia?: string;
  groupedExercises: any[];
  isActive?: boolean;
}

/**
 * BlueprintCard: Visualización técnica del ADN de un día de entrenamiento.
 * Diseño Industrial Minimalist para el Alumno.
 */
export function BlueprintCard({
  diaNumero,
  nombreDia,
  groupedExercises,
  isActive = false,
}: BlueprintCardProps) {
  const totalEjercicios = groupedExercises.reduce((acc, g) => acc + g.exercises.length, 0);

  return (
    <div className={cn(
      "w-[260px] shrink-0 p-6 rounded-[2.5rem] border transition-all duration-500 group",
      isActive 
        ? "bg-zinc-900 border-lime-500/30 shadow-2xl shadow-lime-500/10" 
        : "bg-zinc-900/40 border-white/5 hover:border-white/10"
    )}>
      {/* HEADER TÉCNICO */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-1">
          <span className={cn(
            "text-[9px] font-black uppercase tracking-[0.3em] block transition-colors",
            isActive ? "text-lime-500" : "text-zinc-600"
          )}>
            Day Node
          </span>
          <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">
            {nombreDia || `Día ${diaNumero}`}
          </h4>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center font-black italic border transition-all",
          isActive 
            ? "bg-lime-500 text-black border-lime-400 rotate-6" 
            : "bg-zinc-800 text-zinc-500 border-white/5 group-hover:rotate-3"
        )}>
          {diaNumero}
        </div>
      </div>

      {/* ADN VISUAL (GRID DE EJERCICIOS) */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
            {groupedExercises.flatMap(g => g.exercises).map((ex, i) => (
                <div 
                    key={ex.id || i}
                    className={cn(
                        "h-1.5 rounded-full transition-all duration-700",
                        isActive ? "bg-lime-500" : "bg-zinc-700 group-hover:bg-zinc-600"
                    )}
                    style={{ opacity: 1 - (i * 0.1) }}
                />
            ))}
            {/* Espaciadores para mantener la grilla consistente */}
            {Array.from({ length: Math.max(0, 10 - totalEjercicios) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-1.5 rounded-full bg-zinc-800/20" />
            ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
            <div className="flex -space-x-1.5">
                {Array.from({ length: Math.min(3, totalEjercicios) }).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <Dumbbell className="w-2.5 h-2.5 text-zinc-600" />
                    </div>
                ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                {totalEjercicios} Movimientos
            </span>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-3 h-3 text-zinc-700" />
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                {groupedExercises.length} Bloques ADN
            </span>
          </div>
          {isActive && (
            <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-lime-500 animate-pulse" />
                <span className="text-[8px] font-black text-lime-500 uppercase">Input Activo</span>
            </div>
          )}
      </div>
    </div>
  );
}
