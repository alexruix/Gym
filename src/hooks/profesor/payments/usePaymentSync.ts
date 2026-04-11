import { useState, useCallback, useEffect } from "react";
import { actions } from "astro:actions";

/**
 * usePaymentSync: El "pulso" financiero del dashboard.
 */
export function usePaymentSync(setData: (data: any) => void) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshData = useCallback(async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        try {
            const { data, error } = await actions.pagos.getPaymentsData();
            if (error) throw error;
            if (data) setData(data);
        } catch (err) {
            console.error("[usePaymentSync] Refresh failed:", err);
        } finally {
            setIsRefreshing(false);
        }
    }, [setData]);

    // Auto-Refresh al recuperar foco (Consola Viva)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refreshData(true);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [refreshData]);

    return {
        isRefreshing,
        refreshData
    };
}
