import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton: Átomo base de carga pulsante.
 * Usa los tokens de la UI Industrial Minimalist (zinc + pulse).
 * Compatible con dark mode automáticamente.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800",
        className
      )}
      aria-hidden="true"
    />
  );
}
