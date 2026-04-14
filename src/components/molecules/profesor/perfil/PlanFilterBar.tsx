import React from "react";
import { FilterChip } from "@/components/atoms/profesor/core/FilterChip";
import { Clock, Layers, Calendar } from "lucide-react";

interface PlanFilterBarProps {
  selectedFrequency: number | null;
  onFrequencyChange: (freq: number | null) => void;
  sortByRecent: boolean;
  onSortChange: (recent: boolean) => void;
  frequencies: number[];
}

/**
 * PlanFilterBar: Molécula que agrupa los controles de filtrado para planes.
 * Sigue la arquitectura de Atomic Design agrupando átomos de FilterChip.
 */
export function PlanFilterBar({
  selectedFrequency,
  onFrequencyChange,
  sortByRecent,
  onSortChange,
  frequencies
}: PlanFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-900/50 animate-in slide-in-from-top-1 duration-500">
      <div className="flex flex-col gap-3">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
          Filtrar por frecuencia
        </label>
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
          <FilterChip
            label="Todos"
            isActive={selectedFrequency === null}
            onClick={() => onFrequencyChange(null)}
            icon={<Layers className="w-3 h-3" />}
          />
          {frequencies.map((freq) => (
            <FilterChip
              key={freq}
              label={`${freq} Días`}
              isActive={selectedFrequency === freq}
              onClick={() => onFrequencyChange(freq)}
              icon={<Calendar className="w-3 h-3" />}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
          Ordenamiento
        </label>
        <div className="flex gap-2">
          <FilterChip
            label="Más recientes"
            isActive={sortByRecent}
            onClick={() => onSortChange(!sortByRecent)}
            icon={<Clock className="w-3 h-3" />}
          />
        </div>
      </div>
    </div>
  );
}
