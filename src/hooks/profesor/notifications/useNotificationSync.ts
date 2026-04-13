import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { actions } from "astro:actions";
import type { Notification } from "./useNotificationState";

export function useNotificationSync(
    profesorId: string,
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
    setLoading: (loading: boolean) => void
) {

    const fetchNotifications = useCallback(async (force = false) => {
        const StorageKey = "MiGym_CachedNotifs";

        if (!force) {
            const cachedStr = sessionStorage.getItem(StorageKey);
            if (cachedStr) {
                try {
                    setNotifications(JSON.parse(cachedStr));
                    setLoading(false);
                    return;
                } catch(e) {}
            }
        }

        try {
            const { data, error } = await actions.profesor.getNotifications();
            if (error) throw error;
            if (data) {
                sessionStorage.setItem(StorageKey, JSON.stringify(data));
                setNotifications(data as Notification[]);
            }
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

                    setNotifications((prev) => {
                        const updated = [newNotif, ...prev].slice(0, 30);
                        sessionStorage.setItem("MiGym_CachedNotifs", JSON.stringify(updated));
                        return updated;
                    });
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
                    setNotifications((prev) => {
                        const updated = prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n));
                        sessionStorage.setItem("MiGym_CachedNotifs", JSON.stringify(updated));
                        return updated;
                    });
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
