import { Skeleton } from "@/components/atoms/Skeleton";

/**
 * AgendaConsoleSkeleton: Esqueleto de la vista de agenda.
 * Refleja el layout de bloques de turnos con alumnos dentro.
 * Se usa durante el flash de hidratación de client:load.
 */
export function AgendaConsoleSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Toolbar: Search + Contadores */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-28 rounded-2xl" />
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-hidden">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <Skeleton key={d} className="h-10 flex-1 rounded-xl" />
        ))}
      </div>

      {/* Turno Pills */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Bloque de Turno 1 */}
      <div className="rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        {/* Header del turno */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-sm" />
              <Skeleton className="h-2.5 w-16 rounded-sm" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Alumnos dentro del turno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-28 rounded-sm" />
                  <Skeleton className="h-2.5 w-16 rounded-sm" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Bloque de Turno 2 (más corto) */}
      <div className="rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 rounded-sm" />
              <Skeleton className="h-2.5 w-12 rounded-sm" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-24 rounded-sm" />
                  <Skeleton className="h-2.5 w-14 rounded-sm" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
