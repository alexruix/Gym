import React from "react";
import { MoveLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

/**
 * BackButton: Ãtomo que recrea el diseÃ±o de CreationHeader para componentes React.
 * DiseÃ±o Industrial Minimalist con espaciado tÃ©cnico.
 */
export function BackButton({ href, label = "Volver", className }: BackButtonProps) {
  return (
    <a 
      href={href} 
      className={cn(
        "inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-lime-500 transition-all group select-none",
        className
      )}
    >
      <div className="p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 group-hover:border-lime-500/30 group-hover:bg-lime-500/5 transition-all duration-300">
        <MoveLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      </div>
      {label}
    </a>
  );
}
