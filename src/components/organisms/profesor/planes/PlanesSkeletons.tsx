import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { StandardTable, type TableColumn } from "@/components/organisms/StandardTable";

export function PlanCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col md:flex-col h-full">
      {/* Visual Area Skeleton (Desktop Only) */}
      <div className="hidden md:flex aspect-[16/10] w-full bg-zinc-50 dark:bg-zinc-900 items-center justify-center relative overflow-hidden shrink-0 border-b border-zinc-100 dark:border-zinc-800/50">
        <Skeleton className="w-24 h-24 rounded-full opacity-20" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-row md:flex-col items-center md:items-stretch p-3 md:p-6 gap-3 md:gap-4 flex-1">
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-2 w-1/2 rounded-full" />
        </div>
        <Skeleton className="h-10 w-10 md:h-8 md:w-8 rounded-xl shrink-0" />
      </div>

      {/* Footer Skeleton (Desktop Only) */}
      <div className="hidden md:flex p-6 pt-0 border-t border-zinc-50 dark:border-zinc-900 items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function PlanesTableSkeleton() {
    const skeletonColumns: TableColumn<any>[] = [
        {
            header: "Planificación",
            render: () => (
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-2xl" />
                    <Skeleton className="h-4 w-32" />
                </div>
            )
        },
        {
            header: "Detalles",
            render: () => <Skeleton className="h-4 w-24" />
        },
        {
            header: "Alumnos",
            render: () => <Skeleton className="h-4 w-12 ml-auto" />,
            align: "right"
        },
        {
            header: "",
            render: () => <Skeleton className="h-8 w-8 rounded-xl ml-auto" />,
            align: "right"
        }
    ];

    return (
        <StandardTable 
            data={Array(5).fill({ id: "skeleton" })}
            columns={skeletonColumns}
            hideSearch
        />
    );
}

export function PlanesDashboardSkeleton({ viewMode }: { viewMode: "grid" | "table" }) {
    if (viewMode === "table") return <PlanesTableSkeleton />;
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
                <PlanCardSkeleton key={i} />
            ))}
        </div>
    );
}
