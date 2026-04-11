import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { actions } from "astro:actions";
import type { Notification } from "./useNotificationState";

/**
 * useNotificationSync: El vigía que escucha la base de datos en tiempo real.
 */
export function useNotificationSync(
    profesorId: string,
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
    setLoading: (loading: boolean) => void
) {

    const fetchNotifications = useCallback(async () => {
        try {
            const { data, error } = await actions.profesor.getNotifications();
            if (error) throw error;
            if (data) setNotifications(data as Notification[]);
        } catch (err) {
            console.error("[useNotificationSync] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [setNotifications, setLoading]);

    useEffect(() => {
        if (!profesorId) return;

        fetchNotifications();

        const channel = supabase
            .channel(`notificaciones_profesor_${profesorId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notificaciones",
                    filter: `profesor_id=eq.${profesorId}`,
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    
                    // Feedback Sensorial: Nueva alerta
                    if ('vibrate' in navigator) navigator.vibrate(50);

                    setNotifications((prev) => [newNotif, ...prev].slice(0, 30));
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notificaciones",
                    filter: `profesor_id=eq.${profesorId}`,
                },
                (payload) => {
                    const updatedNotif = payload.new as Notification;
                    setNotifications((prev) => 
                        prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
                    );
                }
            )
            .subscribe();

        return () => {
            // Cleanup Innegociable: Ahorro de batería y recursos
            supabase.removeChannel(channel);
        };
    }, [profesorId, fetchNotifications, setNotifications]);

    return {
        refresh: fetchNotifications
    };
}
