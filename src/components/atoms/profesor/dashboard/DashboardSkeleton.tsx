import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/**
 * StatCardSkeleton: Refleja el layout exacto de StatCard.
 * Layout: icono-label en row → número grande abajo.
 */
export function StatCardSkeleton() {
  return (
    <Card className="p-4 sm:p-6 overflow-hidden border-border">
      <div className="flex flex-col gap-4">
        {/* Header: icono + label */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl shrink-0" />
          <Skeleton className="h-2.5 w-24 rounded-sm" />
        </div>
        {/* Valor ancla */}
        <Skeleton className="h-9 sm:h-11 w-20 rounded-md" />
      </div>
    </Card>
  );
}

/**
 * MetricsSkeleton: 3 StatCards en row horizontal (igual que DashboardMetrics).
 * Se activa durante isRefreshing.
 */
export function MetricsSkeleton() {
  return (
    <div className="flex overflow-x-auto overflow-y-hidden lg:grid lg:grid-cols-4 gap-4 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x snap-mandatory">
      {[0, 1, 2].map((i) => (
        <div key={i} className="min-w-[160px] flex-1 snap-start">
          <StatCardSkeleton />
        </div>
      ))}
    </div>
  );
}

/**
 * ActivityFeedSkeleton: Refleja el layout exacto de ActivityFeed.
 * Header fijo + 5 filas de log.
 */
export function ActivityFeedSkeleton() {
  return (
    <div className="rounded-3xl border border-border overflow-hidden h-full">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="h-2.5 w-28 rounded-sm" />
      </div>
      {/* Filas de actividad */}
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-3 w-3/4 rounded-sm" />
              <Skeleton className="h-2 w-1/4 rounded-sm" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * StudentListSkeleton: Refleja el layout de tabla de StudentList en modo dashboard.
 * Header con search bar + 5 filas de tabla.
 */
export function StudentListSkeleton() {
  return (
    <div className="rounded-3xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <Skeleton className="h-9 flex-1 rounded-2xl" />
        <Skeleton className="h-9 w-24 rounded-2xl" />
      </div>
      {/* Filas de tabla */}
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-center gap-4 px-5 py-3.5">
            {/* Avatar */}
            <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
            {/* Nombre */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-3.5 w-36 rounded-sm" />
              <Skeleton className="h-2 w-20 rounded-sm" />
            </div>
            {/* Plan */}
            <Skeleton className="h-3 w-24 rounded-sm hidden sm:block" />
            {/* Teléfono */}
            <Skeleton className="h-3 w-24 rounded-sm hidden md:block" />
            {/* Menú */}
            <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * DashboardSkeleton: Esqueleto completo del dashboard (métricas + lista + feed).
 * Se muestra durante el flash de hidratación inicial.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-8">
      <MetricsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StudentListSkeleton />
        </div>
        <div>
          <ActivityFeedSkeleton />
        </div>
      </div>
    </div>
  );
}
