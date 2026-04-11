import { useDashboardState } from "./dashboard/useDashboardState";
import { useDashboardSync } from "./dashboard/useDashboardSync";
import type { DashboardData } from "@/types/dashboard";

interface UseDashboardProps {
  initialData: DashboardData;
}

/**
 * useDashboard: Motor reactivo del centro de control del profesor (Consola Viva).
 * Orquesta la sincronización silenciosa (PULSO) y la memoria reactiva (ESTADO).
 */
export function useDashboard({ initialData }: UseDashboardProps) {
    
    // 1. Memoria Reactiva (Estado Global)
    const { 
        data, 
        setData, 
        stats, 
        alerts, 
        recentStudents, 
        activities, 
        lastUpdated 
    } = useDashboardState(initialData);

    // 2. Motor de Sincronización (El Pulso)
    const { isRefreshing, refresh } = useDashboardSync(setData);

    return {
        // Data derived from state
        data,
        stats,
        alerts,
        recentStudents,
        activities,
        lastUpdated,

        // Status & Actions
        isRefreshing,
        refresh
    };
}
