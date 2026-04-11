import { useCallback } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import type { Notification } from "./useNotificationState";

/**
 * useNotificationOperations: Motor de descarte y procesamiento de alertas.
 */
export function useNotificationOperations(
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
    refresh: () => void
) {

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic UI: Descarte instantáneo
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
        );

        // Feedback Sensorial sutil
        if ('vibrate' in navigator) navigator.vibrate(10);

        try {
            const { error } = await actions.profesor.markNotificationAsRead({ id });
            if (error) throw error;
        } catch (err) {
            console.error("[useNotificationOperations] Error marking as read:", err);
            refresh(); // Revertir si falla
        }
    }, [setNotifications, refresh]);

    const markAllAsRead = useCallback(async () => {
        // Optimistic UI
        setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
        
        const toastId = toast.loading("Procesando todas las alertas...");

        try {
            const { error } = await actions.profesor.markAllNotificationsAsRead();
            if (error) throw error;
            toast.success("Ya leíste todas las notificaciones", { id: toastId });
        } catch (err) {
            console.error("[useNotificationOperations] Error marking all as read:", err);
            toast.error("Hubo un error al procesar", { id: toastId });
            refresh();
        }
    }, [setNotifications, refresh]);

    return {
        markAsRead,
        markAllAsRead
    };
}
