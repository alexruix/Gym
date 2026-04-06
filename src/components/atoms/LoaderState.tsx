import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderStateProps {
  label: string;
  className?: string;
}

/**
 * LoaderState: Atom para mostrar estados de carga unificados.
 */
export function LoaderState({ label, className }: LoaderStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 gap-3 text-zinc-500", className)}>
      <Loader2 className="w-5 h-5 animate-spin text-lime-400" />
      <span className="industrial-label text-zinc-400 animate-pulse">
        {label}
      </span>
    </div>
  );
}
