import React from "react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

/**
 * FilterChip: Atom de diseño industrial para selectores de estado binario (on/off).
 */
export function FilterChip({ label, isActive, onClick, icon }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 active:scale-95",
        isActive
          ? "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-lg"
          : "bg-white dark:bg-zinc-900/50 text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
      )}
    >
      {icon && <span className={cn("w-3 h-3", isActive ? "text-lime-400" : "text-zinc-400")}>{icon}</span>}
      {label}
    </button>
  );
}
