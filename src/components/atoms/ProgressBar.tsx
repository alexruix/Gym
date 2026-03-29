import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  showValue?: boolean;
}

export const ProgressBar = ({ value, max = 100, className, showValue = false }: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
        <div 
          className="h-full bg-lime-400 transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <p className="text-[10px] font-bold text-zinc-500 text-right uppercase tracking-widest">
          {Math.round(percentage)}% COMPLETADO
        </p>
      )}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
