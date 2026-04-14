import React from "react";
import { ClipboardList, Plus, Dumbbell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoPlanAssignedHUDProps {
  title: string;
  description: string;
  tag?: string;
  onAssign: () => void;
  isPending?: boolean;
}

/**
 * NoPlanAssignedHUD: Molécula de diseño industrial para cuando un alumno no tiene plan.
 * Enfocado en la acción de configuración inicial.
 */
export function NoPlanAssignedHUD({ 
  title, 
  description, 
  tag = "Configuración Pendiente", 
  onAssign,
  isPending 
}: NoPlanAssignedHUDProps) {
  return (
    <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 sm:p-16 flex flex-col items-center justify-center text-center space-y-8 animate-in slide-in-from-bottom-2 duration-700 shadow-2xl relative overflow-hidden group">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] opacity-[0.05] pointer-events-none" />
      
      {/* Icon HUD */}
      <div className="relative">
        <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-inner border border-zinc-200/50 dark:border-zinc-800 relative z-10 group-hover:scale-110 transition-transform duration-500">
          <ClipboardList className="w-10 h-10 text-zinc-400 dark:text-zinc-600 group-hover:text-lime-500 transition-colors" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20 z-20 animate-bounce">
          <Sparkles className="w-4 h-4 text-zinc-950" />
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex flex-col items-center gap-1">
          <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] border border-zinc-200/30 dark:border-zinc-700/30 shadow-sm">
            {tag}
          </span>
          <h4 className="text-3xl font-black text-zinc-950 dark:text-white uppercase tracking-tighter leading-none mt-2">
            {title}
          </h4>
        </div>
        <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto leading-relaxed italic">
          "{description}"
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
        <Button
          onClick={onAssign}
          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-white font-bold uppercase text-[10px] tracking-widest h-14 px-10 rounded-2xl shadow-2xl transition-all active:scale-95 border border-zinc-800 group"
          disabled={isPending}
        >
          <Plus className="w-4 h-4 mr-3 text-lime-400 group-hover:rotate-90 transition-transform" />
          {isPending ? 'Procesando...' : 'Asignar Planificación'}
        </Button>
      </div>
    </div>
  );
}
