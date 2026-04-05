import { cn } from "@/lib/utils";

interface StatBadgeProps {
  label: string;
  value: string | number;
  color?: "lime" | "zinc";
  className?: string;
}

/**
 * StatBadge: Atom para mostrar métricas clave con estética industrial.
 */
export function StatBadge({ 
  label, 
  value, 
  color = "zinc",
  className 
}: StatBadgeProps) {
  return (
    <div className={cn(
      "flex flex-col items-center border border-zinc-800/70 rounded-2xl px-5 py-3 min-w-[100px] transition-al",
      className
    )}>
      <span className={cn(
        "text-2xl font-black leading-none", 
        color === "lime" ? "text-lime-400" : "text-white"
      )}>
        {value}
      </span>
      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}
