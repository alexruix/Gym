import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ExerciseCardSkeleton: Previsualización de carga industrial.
 * Mantiene el layout exacto de la card para evitar Cumulative Layout Shift (CLS).
 */
export function ExerciseCardSkeleton() {
  return (
    <Card className="relative bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 overflow-hidden rounded-3xl flex flex-row h-28 md:h-auto md:flex-col animate-pulse">
      
      {/* Media Placeholder */}
      <div className="w-28 h-full md:aspect-video md:w-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Content Placeholder */}
      <div className="p-3 md:p-5 flex-1 flex flex-col justify-center gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Title line */}
            <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            {/* Tags line */}
            <div className="flex gap-2">
              <div className="h-3 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
              <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>
          
          {/* Action dots placeholder */}
          <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Shimmer Overlay (Industrial Gradient) */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </Card>
  );
}

/**
 * ExerciseLibrarySkeleton: Grilla de carga completa.
 */
export function ExerciseLibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
      {Array.from({ length: 9 }).map((_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  );
}
