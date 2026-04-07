import React from "react";
import { cn } from "@/lib/utils";

const DAYS = [
  { label: "Lun", value: "Lunes" },
  { label: "Mar", value: "Martes" },
  { label: "Mié", value: "Miércoles" },
  { label: "Jue", value: "Jueves" },
  { label: "Vie", value: "Viernes" },
  { label: "Sáb", value: "Sábado" },
  { label: "Dom", value: "Domingo" },
];

interface DaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  className?: string;
  compact?: boolean;
}

export function DaySelector({ selectedDays, onChange, className, compact }: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className={cn(
      compact ? "grid grid-cols-7 gap-1" : "grid grid-cols-4 sm:grid-cols-7 gap-2",
      className
    )}>
      {DAYS.map((day) => {
        const isSelected = selectedDays.includes(day.value);

        return (
          <button
            key={day.value}
            type="button"
            onClick={() => toggleDay(day.value)}
            className={cn(
              compact ? "h-9 rounded-lg" : "h-12 rounded-xl",
              "flex items-center justify-center border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-95",
              isSelected
                ? "bg-lime-500 border-lime-500 text-zinc-950 shadow-lg shadow-lime-400/20"
                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 font-bold"
            )}
          >
            {compact ? day.label.charAt(0) : day.label}
          </button>
        );
      })}
    </div>
  );
}
