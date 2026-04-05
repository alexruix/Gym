import { cn } from "@/lib/utils";

interface SessionStatusBadgeProps {
  estado: string;
  className?: string;
}

/**
 * SessionStatusBadge: Atom para mostrar el estado de una sesión (Completada, Pendiente, etc.)
 */
export function SessionStatusBadge({ estado, className }: SessionStatusBadgeProps) {
  const map: Record<string, { label: string; cls: string }> = {
    completada:  { label: "Completada",   cls: "text-lime-500 bg-lime-500/10 border-lime-500/20" },
    en_progreso: { label: "En progreso",  cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    pendiente:   { label: "Pendiente",    cls: "text-zinc-300 bg-zinc-800 border-zinc-700" },
    omitida:     { label: "Omitida",      cls: "text-red-400 bg-red-500/10 border-red-500/20" },
    futura:      { label: "Próximamente", cls: "text-zinc-500 bg-zinc-900 border-zinc-800" },
  };

  const info = map[estado] || map.pendiente;

  return (
    <span className={cn(
      "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all", 
      info.cls,
      className
    )}>
      {info.label}
    </span>
  );
}
