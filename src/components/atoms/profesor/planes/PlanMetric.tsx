import React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanMetricProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
  accent?: boolean;
}

/**
 * PlanMetric: Átomo para mostrar estadísticas clave en el detalle del plan.
 * Sigue la estética "Industrial Minimalist" con tipografía pesada y acentos sutiles.
 */
export function PlanMetric({ icon: Icon, label, value, className, accent }: PlanMetricProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-1.5 py-6 px-4 transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 group",
      className
    )}>
      {/* Icon Area */}
      <div className={cn(
        "p-2 rounded-xl transition-all duration-500",
        accent ? "bg-lime-400/10 text-lime-600 dark:text-lime-400 scale-110" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"
      )}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>

      {/* Label (Detail Level) */}
      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] text-center leading-none">
        {label}
      </span>

      {/* Value (Anchor Level) */}
      <span className={cn(
        "text-2xl font-black tracking-tight leading-none",
        accent ? "text-lime-600 dark:text-lime-400" : "text-zinc-950 dark:text-zinc-50"
      )}>
        {value}
      </span>
    </div>
  );
}
