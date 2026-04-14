import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, Clock, Calendar, Layers } from "lucide-react";
import { FilterChip } from "@/components/atoms/profesor/core/FilterChip";
import { cn } from "@/lib/utils";

interface PlanFilterPopoverProps {
  selectedFrequency: number | null;
  onFrequencyChange: (freq: number | null) => void;
  sortByRecent: boolean;
  onSortChange: (recent: boolean) => void;
  frequencies: number[];
}

/**
 * PlanFilterPopover: Molécula que compacta los filtros de planes tras un botón industrial.
 * Sigue el patrón estándar de la industria para buscadores con filtros opcionales.
 */
export function PlanFilterPopover({
  selectedFrequency,
  onFrequencyChange,
  sortByRecent,
  onSortChange,
  frequencies
}: PlanFilterPopoverProps) {
  const hasActiveFilters = selectedFrequency !== null || sortByRecent;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-14 w-14 rounded-2xl border-zinc-200 dark:border-zinc-800 shrink-0 transition-all active:scale-95 relative",
            hasActiveFilters && "border-lime-500 bg-lime-500/5"
          )}
        >
          <Filter className={cn(
            "w-5 h-5",
            hasActiveFilters ? "text-lime-600 dark:text-lime-400" : "text-zinc-400"
          )} />
          {hasActiveFilters && (
            <span className="absolute top-3 right-3 w-2 h-2 bg-lime-500 rounded-full border-2 border-white dark:border-zinc-950 animate-in zoom-in duration-300" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white">Filtros de búsqueda</h4>
        </div>
        
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
              Frecuencia semanal
            </label>
            <div className="flex flex-wrap gap-2">
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

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
              Ordenamiento
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Más recientes"
                isActive={sortByRecent}
                onClick={() => onSortChange(!sortByRecent)}
                icon={<Clock className="w-3 h-3" />}
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900">
            <Button 
                variant="ghost" 
                onClick={() => {
                    onFrequencyChange(null);
                    onSortChange(true);
                }}
                className="w-full h-10 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500"
            >
                Limpiar filtros
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
