import { cn } from "@/lib/utils";

interface QuickOptionsGroupProps {
  options: readonly string[];
  selectedOptions?: string[];
  onToggle: (option: string) => void;
  className?: string;
}

export function QuickOptionsGroup({ 
    options, 
    selectedOptions = [], 
    onToggle,
    className 
}: QuickOptionsGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={cn(
            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
            "border border-dashed",
            selectedOptions.includes(option)
              ? "bg-zinc-950 text-white border-zinc-950 dark:bg-lime-400 dark:text-zinc-950 dark:border-lime-400 shadow-lg"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
