import React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanPillProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  variant?: "default" | "accent";
  className?: string;
}

/**
 * PlanPill (Atom): Métrica técnica compacta para planes.
 * Sigue la jerarquía visual de MiGym: Nivel 3 (Detalle).
 */
export const PlanPill = ({
  icon: Icon,
  value,
  label,
  variant = "default",
  className,
}: PlanPillProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all duration-300",
        variant === "default"
          ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          : "bg-lime-500/10 border-lime-400/20 text-lime-600 dark:text-lime-400",
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", variant === "default" ? "text-zinc-400" : "text-current")} />
      <div className="flex items-baseline gap-1">
        <span className="text-[11px] font-bold font-mono tracking-tight leading-none">
          {value}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 leading-none">
          {label}
        </span>
      </div>
    </div>
  );
};

PlanPill.displayName = "PlanPill";
