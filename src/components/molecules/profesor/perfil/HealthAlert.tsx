import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthAlertProps {
  notes?: string | null;
  className?: string;
}

export function HealthAlert({ notes, className }: HealthAlertProps) {
  if (!notes) return null;

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-zinc-900 border-l-4 border-l-lime-400 p-5 rounded-r-3xl shadow-2xl animate-in slide-in-from-top-4 duration-500",
        className
      )}
    >
      <div className="flex gap-4 items-start">
        <div className="bg-lime-400 p-2 rounded-xl shrink-0 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
          <AlertCircle className="w-5 h-5 text-zinc-950" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400/80">
            Notas Críticas de Salud
          </h4>
          <p className="text-sm font-bold text-zinc-50 leading-relaxed">
            {notes}
          </p>
        </div>
      </div>
      
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-lime-400/5 to-transparent pointer-events-none" />
    </div>
  );
}
