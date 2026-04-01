import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "grid" | "table";
  onChange: (view: "grid" | "table") => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0", className)}>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
          view === "grid" 
            ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" 
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        )}
        aria-label="Vista cuadrícula"
        type="button"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange("table")}
        className={cn(
          "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
          view === "table" 
            ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700" 
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        )}
        aria-label="Vista tabla"
        type="button"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
