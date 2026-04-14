import React, { useState, useRef } from "react";
import { RefreshCcw, ArrowDown } from "lucide-react";
import { useDashboard } from "@/hooks/profesor/useDashboard";
import { DashboardMetrics } from "./DashboardMetrics";
import { AlertCenter } from "./AlertCenter";
import { ActivityFeed } from "./ActivityFeed";
import { StudentList } from "../StudentList";
import {
  MetricsSkeleton,
  StudentListSkeleton,
  ActivityFeedSkeleton,
} from "@/components/atoms/profesor/dashboard/DashboardSkeleton";
import type { DashboardData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface Props {
  initialData: DashboardData;
}

export function DashboardConsole({ initialData }: Props) {
  const { data, isRefreshing, refresh, lastUpdated } = useDashboard({ initialData });
  
  // Lógica simple de Pull-to-refresh
  const [pullDistance, setPullDistance] = useState(0);
  const touchStart = useRef<number | null>(null);
  const isPulling = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStart.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || touchStart.current === null) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart.current;

    if (distance > 0 && window.scrollY === 0) {
      // Aplicar resistencia
      setPullDistance(Math.min(distance * 0.4, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      refresh();
    }
    setPullDistance(0);
    isPulling.current = false;
    touchStart.current = null;
  };

  const hasAlerts =
    data.expiringPayments.length > 0 ||
    data.atRiskStudents.length > 0 ||
    data.noPlanStudents.length > 0;

  return (
    <div
      className="space-y-4 lg:space-y-8 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-busy={isRefreshing}
    >
      {/* Pull-to-refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none transition-transform duration-200 z-50"
        style={{ transform: `translateY(${pullDistance - 40}px)`, opacity: pullDistance / 60 }}
      >
        <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-full p-2 border border-zinc-100 dark:border-zinc-800">
          <ArrowDown className={cn("w-5 h-5 text-lime-500 transition-transform", pullDistance > 60 && "rotate-180")} />
        </div>
      </div>

      {/* Metrics — skeleton durante refresco */}
      {isRefreshing ? (
        <MetricsSkeleton />
      ) : (
        <DashboardMetrics
          activeStudents={data.stats.activeStudents}
          adherenceRate={data.stats.adherenceRate}
          monthlyRevenue={data.stats.monthlyRevenue}
        />
      )}

      {/* Alerts — solo visible si hay alertas y no está refrescando */}
      {!isRefreshing && hasAlerts && (
        <AlertCenter
          expiringPayments={data.expiringPayments}
          atRiskStudents={data.atRiskStudents}
          noPlanStudents={data.noPlanStudents}
          onRefresh={refresh}
        />
      )}

      {/* Students & Activity — skeleton durante refresco */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isRefreshing ? (
            <StudentListSkeleton />
          ) : (
            <StudentList students={data.recentStudents} isDashboard={true} />
          )}
        </div>
        <div>
          {isRefreshing ? (
            <ActivityFeedSkeleton />
          ) : (
            <ActivityFeed activities={data.activities} />
          )}
        </div>
      </div>

      {/* Footer / Status */}
      <div className="flex flex-col items-center justify-center pt-8 pb-12 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw
              className={cn(
                "w-3 h-3 text-zinc-400 group-hover:text-lime-500 transition-colors",
                isRefreshing && "animate-spin text-lime-500"
              )}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              {isRefreshing ? "Actualizando..." : "Actualizar ahora"}
            </span>
          </button>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
          Actualizado{" "}
          {lastUpdated.includes("T")
            ? new Date(lastUpdated).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
            : lastUpdated}
        </p>
      </div>
    </div>
  );
}
