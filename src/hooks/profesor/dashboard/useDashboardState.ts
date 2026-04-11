import { useState, useMemo } from "react";
import type { DashboardData, ActivityLog } from "@/types/dashboard";

/**
 * useDashboardState: Memoria reactiva de la Consola General.
 */
export function useDashboardState(initialData: DashboardData) {
    const [data, setData] = useState<DashboardData>(initialData);
    const [activityFilter, setActivityFilter] = useState<"todos" | "records">("todos");

    const filteredActivities = useMemo(() => {
        const logs = data.activities || [];
        if (activityFilter === "records") {
            return logs.filter(log => log.type === "weight_logged");
        }
        return logs;
    }, [data.activities, activityFilter]);

    return {
        data,
        setData,
        stats: data.stats,
        alerts: {
            expiringPayments: data.expiringPayments || [],
            atRiskStudents: data.atRiskStudents || [],
            noPlanStudents: data.noPlanStudents || []
        },
        recentStudents: data.recentStudents || [],
        activities: filteredActivities,
        activityFilter,
        setActivityFilter,
        lastUpdated: data.lastUpdated || new Date().toISOString()
    };
}
