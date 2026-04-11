import { useState, useCallback, useEffect } from "react";
import { actions } from "astro:actions";

/**
 * useDashboardSync: El "pulso" global de MiGym.
 */
export function useDashboardSync(setData: (data: any) => void) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        try {
            const { data: newData, error } = await actions.profesor.getDashboardData();
            if (error) throw error;
            if (newData) {
                setData(newData);
                
                // PWA Badging API
                if ('setAppBadge' in navigator) {
                    const totalAlerts = (newData.atRiskStudents?.length || 0) + 
                                       (newData.expiringPayments?.length || 0) + 
                                       (newData.noPlanStudents?.length || 0);
                    
                    if (totalAlerts > 0) {
                        (navigator as any).setAppBadge(totalAlerts).catch(console.error);
                    } else {
                        (navigator as any).clearAppBadge().catch(console.error);
                    }
                }

                window.dispatchEvent(new CustomEvent('dashboard-updated', { detail: newData }));
            }
        } catch (err) {
            console.error("[useDashboardSync] Refresh failed:", err);
        } finally {
            setIsRefreshing(false);
        }
    }, [setData]);

    // Refresco al recuperar foco (Consola Viva)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refresh(true);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [refresh]);

    return {
        isRefreshing,
        refresh
    };
}
