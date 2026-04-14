import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VigiaTagProps {
  id: string;
  name: string;
}

/**
 * VigiaTag: Átomo que representa un badge de alumno en la sección de Vigía.
 * Sigue la estética Industrial Minimalist con bordes técnicos y voseo rioplatense implícito en la navegación.
 */
export function VigiaTag({ id, name }: VigiaTagProps) {
  // Solo mostramos el primer nombre para mantener la densidad visual
  const firstName = name.split(" ")[0];

  return (
    <a
      href={`/profesor/alumnos/${id}`}
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest",
        "border-2 border-zinc-900/5 dark:border-white/5",
        "bg-white/5 hover:bg-white/10 dark:text-zinc-300 text-zinc-900",
        "px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 group"
      )}
    >
      {firstName}
      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
    </a>
  );
}
