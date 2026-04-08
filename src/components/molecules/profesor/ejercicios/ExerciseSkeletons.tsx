import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ExerciseCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm animate-pulse">
      {/* Media Skeleton */}
      <Skeleton className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
      
      {/* Info Skeleton */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
          <Skeleton className="h-3 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-lg" />
        
        {/* Tags Skeleton */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-4 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
          <Skeleton className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ExerciseLibrarySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  );
}
