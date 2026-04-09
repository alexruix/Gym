import React from "react";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionBridgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

/**
 * ActionBridge (Molecule): Estado vacío instructivo y accionable.
 * Diseñado para reducir la carga cognitiva guiando al usuario.
 * Estética: Industrial Cruda (Dashed borders, High contrast).
 */
export const ActionBridge = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: ActionBridgeProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] gap-6 animate-in fade-in duration-500",
        className
      )}
    >
      <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm rotate-3">
        <Icon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
      </div>

      <div className="space-y-1 max-w-xs">
        <h3 className="text-lg font-bold uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 font-medium leading-tight">
          {description}
        </p>
      </div>

      <Button
        type="button"
        onClick={onAction}
        className="bg-lime-500 text-zinc-950 hover:bg-lime-400 font-bold px-8 py-6 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/20 active:scale-95 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
        <span className="relative z-10">{actionLabel}</span>
      </Button>
    </div>
  );
};

ActionBridge.displayName = "ActionBridge";
