import React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Variant = "default" | "accent" | "alert";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Unidad o sufijo pequeño junto al valor (ej: "%", "ARS") */
  badge?: string;
  variant?: Variant;
  tooltip?: string;
  /** Si se pasa, la card entera actúa como link */
  href?: string;
}

const variantStyles: Record<Variant, string> = {
  default:
    "bg-card border-border hover:shadow-xl hover:shadow-zinc-900/5",
  accent:
    "bg-lime-500 border-lime-500/20 shadow-lg shadow-lime-500/20 hover:shadow-2xl hover:shadow-lime-500/30",
  alert:
    "bg-error/10 border-error/20 hover:shadow-xl",
};

const iconStyles: Record<Variant, string> = {
  default: "bg-secondary text-secondary-foreground",
  accent: "bg-lime-300 text-zinc-950",
  alert: "bg-error/20 text-error",
};

const labelStyles: Record<Variant, string> = {
  default: "text-ui-muted",
  accent: "text-zinc-800",
  alert: "text-error/80",
};

const valueStyles: Record<Variant, string> = {
  default: "text-card-foreground",
  accent: "text-zinc-950",
  alert: "text-error",
};

/**
 * StatCard: Átomo para métricas clave del dashboard del profesor.
 * Soporta 3 variantes: default (zinc), accent (lime), alert (red).
 * Cumple jerarquía visual "Industrial Minimalist": Ancla (número) + Detalle (label).
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  badge,
  variant = "default",
  tooltip,
  href,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative p-4 sm:p-6 overflow-hidden hover:-translate-y-1 transition-all duration-300 group",
        variantStyles[variant],
        href && "cursor-pointer"
      )}
      title={tooltip}
    >
      {/* Blob decorativo para variante accent */}
      {variant === "accent" && (
        <div
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-110 transition-transform pointer-events-none"
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header: icono + label */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0", iconStyles[variant])}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
          <h3
            className={cn(
              "text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-tight",
              labelStyles[variant]
            )}
          >
            {label}
          </h3>
        </div>

        {/* Valor ancla */}
        <div className="flex items-baseline gap-1 sm:gap-1.5">
          <p
            className={cn(
              "text-3xl sm:text-4xl font-bold tracking-tight leading-none",
              valueStyles[variant]
            )}
          >
            {value}
          </p>
          {badge && (
            <span
              className={cn(
                "text-base sm:text-lg font-bold",
                variant === "accent"
                  ? "text-zinc-700"
                  : variant === "alert"
                    ? "text-red-400"
                    : "text-zinc-400"
              )}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Link overlay accesible */}
      {href && (
        <a
          href={href}
          className="absolute inset-0 z-20 rounded-[inherit]"
          aria-label={label}
        />
      )}
    </Card>
  );
}
