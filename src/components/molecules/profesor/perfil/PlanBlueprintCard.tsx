import React from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Box } from "lucide-react";

interface Exercise {
  id: string;
  nombre: string;
  biblioteca_ejercicios?: {
    nombre: string;
  };
}

interface GroupedExercise {
  id: string | null;
  nombre: string | null;
  exercises: any[];
}

interface PlanBlueprintCardProps {
  diaNumero: number;
  nombreDia?: string;
  groupedExercises: GroupedExercise[];
  className?: string;
  isActive?: boolean;
  isMaster?: boolean;
}

/**
 * PlanBlueprintCard: Molécula compacta para visualizar el "ADN" de una rutina.
 * Solo muestra nombres de ejercicios y estructura de bloques.
 */
export function PlanBlueprintCard({
  diaNumero,
  nombreDia,
  groupedExercises,
  className,
  isActive = false,
  isMaster = false,
}: PlanBlueprintCardProps) {
  const totalExercises = groupedExercises.reduce((acc, g) => acc + g.exercises.length, 0);

  return (
    <div
      className={cn(
        "flex flex-col w-[280px] sm:w-[320px] h-[500px] bg-white dark:bg-zinc-950 border rounded-[2.5rem] shadow-sm transition-all duration-300 shrink-0",
        isActive 
          ? "border-lime-500 shadow-xl shadow-lime-500/5" 
          : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
        className
      )}
    >
      {/* SELLO MASTER (SUBTLE) */}
      {isMaster && (
        <div className="absolute top-4 right-6 pointer-events-none opacity-40">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 rotate-12 block">
              MASTER
           </span>
        </div>
      )}

      {/* HEADER TÉCNICO */}
      <div className="p-6 pb-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lime-400 font-black italic shadow-lg">
            {diaNumero}
          </div>
          {isMaster ? (
            <div className="flex items-center gap-2 bg-zinc-950 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
               <div className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.6)] animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white">Plan Master</span>
            </div>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
              {totalExercises} EJS.
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h4 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tighter leading-none truncate">
            {nombreDia || `Día ${diaNumero}`}
          </h4>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            ADN Estructura
          </span>
        </div>
      </div>

      {/* LISTADO DE ALTA DENSIDAD */}
      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4 hide-scrollbar">
        {groupedExercises.map((group, gIdx) => (
          <div key={group.id || `unbound-${gIdx}`} className="space-y-2">
            {group.nombre && (
              <div className="flex items-center gap-2 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 truncate">
                  {group.nombre}
                </span>
              </div>
            )}
            
            <div className={cn(
              "space-y-1 rounded-3xl p-1",
              group.id && "bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50"
            )}>
              {group.exercises.map((ej: any, idx: number) => {
                const nombre = ej.biblioteca_ejercicios?.nombre || "Ejercicio";
                return (
                  <div 
                    key={ej.id || idx} 
                    className="flex items-center gap-3 p-2 group/item"
                  >
                    <span className="text-[10px] font-black italic text-zinc-300 group-hover/item:text-lime-500 transition-colors shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight truncate leading-tight group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {nombre}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {totalExercises === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-12">
            <Dumbbell className="w-8 h-8 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-center">Rutina Vacía</span>
          </div>
        )}
      </div>

      {/* FOOTER DECORATIVO */}
      <div className="p-4 border-t border-zinc-50 dark:border-zinc-900">
         <div className="w-full h-1 bg-zinc-50 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-lime-500/20" />
         </div>
      </div>
    </div>
  );
}
