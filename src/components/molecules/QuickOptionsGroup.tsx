import { cn } from "@/lib/utils";

interface QuickOptionsGroupProps {
  options: string[] | readonly string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  maxSelections?: number;
  className?: string;
}

export function QuickOptionsGroup({
  options,
  selectedOptions,
  onToggle,
  maxSelections,
  className
}: QuickOptionsGroupProps) {
  const isAtLimit = maxSelections !== undefined && selectedOptions.length >= maxSelections;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => {
        const lower = option.toLowerCase();
        const isSelected = selectedOptions.includes(lower);

        return (
          <button
            key={option}
            type="button"
            disabled={isAtLimit && !isSelected}
            onClick={() => onToggle(lower)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50",
              isSelected
                ? "bg-lime-500 border-lime-400 text-zinc-950 shadow-md shadow-lime-400/20"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-lime-500 hover:text-lime-500 dark:hover:text-lime-400"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
