import React from 'react';
import { BlueprintCard } from '@/components/molecules/alumno/BlueprintCard';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Routine {
  id: string;
  dia_numero: number;
  nombre_dia?: string;
  ejercicios_plan: any[];
}

interface BlueprintGridProps {
  routines: Routine[];
  getGroupedExercises: (ejs: any[]) => any[];
  className?: string;
}

/**
 * BlueprintGrid: Reel horizontal de tarjetas de ADN para el Alumno.
 * Optimizado para PWA con Snap Scroll.
 */
export function BlueprintGrid({
  routines,
  getGroupedExercises,
  className,
}: BlueprintGridProps) {
  const sortedRoutines = [...routines].sort((a, b) => a.dia_numero - b.dia_numero);

  return (
    <div className={cn("relative group/reel", className)}>
      {/* INDICADOR DE SCROLL (Móvil) */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
          Scroll to Explore / {sortedRoutines.length} Nodes
        </span>
        <ChevronRight className="w-4 h-4 text-zinc-700 animate-pulse" />
      </div>

      {/* REEL DE TARJETAS */}
      <div 
        className={cn(
          "flex gap-6 overflow-x-auto pb-12 pt-4 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        )}
      >
        {sortedRoutines.map((rutina, idx) => {
          const grouped = getGroupedExercises(rutina.ejercicios_plan || []);
          
          return (
            <div 
              key={rutina.id} 
              className="snap-center"
            >
              <BlueprintCard
                diaNumero={rutina.dia_numero}
                nombreDia={rutina.nombre_dia}
                groupedExercises={grouped}
                isActive={idx === 0}
              />
            </div>
          );
        })}

        {/* ESPACIADOR FINAL */}
        <div className="w-12 shrink-0" />
      </div>

      {/* PAGINACIÓN TÉCNICA */}
      <div className="flex items-center justify-center gap-2 -mt-4">
         {sortedRoutines.map((r, i) => (
            <div 
               key={r.id} 
               className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  i === 0 ? "bg-lime-500 w-4" : "bg-zinc-800"
               )}
            />
         ))}
      </div>
    </div>
  );
}
