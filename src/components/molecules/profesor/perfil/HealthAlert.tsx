import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface HealthAlertProps {
  notes?: string | null;
  className?: string;
}

export function HealthAlert({ notes, className }: HealthAlertProps) {
  if (!notes) return null;

  const { sidebar } = athleteProfileCopy;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-950 border-2 border-lime-400/30 p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 group",
        className
      )}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-transparent pointer-events-none" />

      <div className="flex gap-5 items-center relative z-10">
        <div className="bg-lime-500 p-3 rounded-2xl shrink-0 shadow-[0_0_20px_rgba(163,230,53,0.4)] group-hover:rotate-12 transition-transform duration-500">
          <AlertCircle className="w-6 h-6 text-zinc-950" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-lime-400">
            {sidebar.criticalNotes.semaphore}
          </h4>
          <p className="text-sm font-bold text-zinc-50 leading-tight">
            {notes}
          </p>
        </div>
      </div>
    </div>
  );
}
