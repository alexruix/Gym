import { cn } from "@/lib/utils";

interface SessionCounterProps {
  current: number;
  total: number;
  className?: string;
}

export const SessionCounter = ({ current, total, className }: SessionCounterProps) => {
  const isCompleted = current >= total;

  return (
    <div className={cn(
      "flex items-baseline gap-1 font-mono",
      isCompleted ? "text-lime-600" : "text-zinc-600",
      className
    )}>
      <span className="text-lg font-bold">{current}</span>
      <span className="text-xs text-zinc-400">/</span>
      <span className="text-xs font-semibold">{total}</span>
      <span className="ml-1 text-[10px] font-bold uppercase tracking-tighter">SESIONES</span>
    </div>
  );
};

SessionCounter.displayName = "SessionCounter";
