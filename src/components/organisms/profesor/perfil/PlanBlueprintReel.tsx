import React from "react";
import { PlanBlueprintCard } from "@/components/molecules/profesor/perfil/PlanBlueprintCard";
import { cn } from "@/lib/utils";
import { Box } from "lucide-react";

interface Routine {
  id: string;
  dia_numero: number;
  nombre_dia?: string;
  ejercicios_plan: any[];
}

interface PlanBlueprintReelProps {
  routines: Routine[];
  getGroupedExercises: (ejs: any[]) => any[];
  className?: string;
  isMaster?: boolean;
}

/**
 * PlanBlueprintReel: Organismo que orquestador el scroll horizontal de tarjetas de ADN.
 * Optimizado para PWA con Snap Scroll nativo.
 */
export function PlanBlueprintReel({
  routines,
  getGroupedExercises,
  className,
  isMaster = false,
}: PlanBlueprintReelProps) {
  const sortedRoutines = [...routines].sort((a, b) => a.dia_numero - b.dia_numero);

  return (
    <div className={cn("relative group/reel", className)}>
      {/* GRADIENTE DE DESVANECIMIENTO (Derecha) */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none opacity-0 group-hover/reel:opacity-100 transition-opacity duration-500" />

      {/* REEL DE TARJETAS */}
      <div 
        className={cn(
          "flex gap-6 overflow-x-auto pb-12 pt-4 px-4 hide-scrollbar scroll-smooth",
          "snap-x snap-mandatory" // PWA Snap Behavior
        )}
      >
        {sortedRoutines.length > 0 ? (
          sortedRoutines.map((rutina, idx) => {
            const grouped = getGroupedExercises(rutina.ejercicios_plan || []);
            
            return (
              <div 
                key={rutina.id} 
                className="snap-center sm:snap-start" // Centrar en móvil, empezar en escritorio
              >
                <PlanBlueprintCard
                  diaNumero={rutina.dia_numero}
                  nombreDia={rutina.nombre_dia}
                  groupedExercises={grouped}
                  isActive={idx === 0} // Resaltar el primer día por defecto
                  isMaster={isMaster}
                />
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20">
            <div className="w-16 h-16 rounded-[2rem] border-2 border-dashed border-zinc-400 flex items-center justify-center mb-4">
               <Box className="w-8 h-8 text-zinc-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando ADN Maestro...</span>
          </div>
        )}

        {/* ESPACIADOR FINAL PARA EL SCROLL */}
        <div className="w-16 shrink-0" />
      </div>

      {/* INDICADOR TÉCNICO DE POSICIÓN (Opcional) */}
      <div className="flex items-center justify-center gap-2 -mt-4">
         {sortedRoutines.map((r, i) => (
            <div 
               key={r.id} 
               className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  i === 0 ? "bg-lime-500 w-4" : "bg-zinc-200 dark:bg-zinc-800"
               )}
            />
         ))}
      </div>
    </div>
  );
}
