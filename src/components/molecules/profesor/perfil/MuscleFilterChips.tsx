import React from "react";
import { cn } from "@/lib/utils";

interface MuscleFilterChipsProps {
  exercises: any[];
  activeFilter: string | null;
  onFilterChange: (muscle: string | null) => void;
}

export function MuscleFilterChips({ exercises, activeFilter, onFilterChange }: MuscleFilterChipsProps) {
  // Extraer grupos musculares únicos de los ejercicios presentes
  const muscleGroups = React.useMemo(() => {
    const groups = new Set<string>();
    exercises.forEach((ej) => {
      // Usamos tags o categorías de la biblioteca base
      const tags = ej.biblioteca_ejercicios?.tags || [];
      tags.forEach((tag: string) => groups.add(tag));
    });
    return Array.from(groups).sort();
  }, [exercises]);

  if (muscleGroups.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-4 border-y border-zinc-100 dark:border-zinc-900/50">
      <button
        onClick={() => onFilterChange(null)}
        className={cn(
          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
          !activeFilter 
            ? "bg-zinc-950 text-white border-zinc-950 dark:bg-lime-500 dark:text-zinc-950 dark:border-lime-500 shadow-lg" 
            : "bg-white text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 hover:border-zinc-400"
        )}
      >
        Todos
      </button>
      {muscleGroups.map((muscle) => (
        <button
          key={muscle}
          onClick={() => onFilterChange(activeFilter === muscle ? null : muscle)}
          className={cn(
            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
            activeFilter === muscle 
              ? "bg-zinc-950 text-white border-zinc-950 dark:bg-lime-500 dark:text-zinc-950 dark:border-lime-500 shadow-lg" 
              : "bg-white text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 hover:border-zinc-400"
          )}
        >
          {muscle}
        </button>
      ))}
    </div>
  );
}
