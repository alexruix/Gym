import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { actions } from "astro:actions";

export interface Notification {
  id: string;
  profesor_id: string;
  alumno_id?: string;
  tipo: string;
  mensaje: string;
  referencia_id?: string;
  leido: boolean;
  created_at: string;
}

export function useNotifications(profesorId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.leido).length, 
  [notifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await actions.profesor.getNotifications();
      if (error) throw error;
      if (data) setNotifications(data as Notification[]);
    } catch (err) {
      console.error("[useNotifications] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!profesorId) return;

    fetchNotifications();

    // Suscripción Eficiente: Filtrado por profesor_id a nivel de canal
    // Usamos el filtro 'eq' en el payload si es posible, o simplemente el canal específico.
    // En Supabase, el filtro se pasa en el subscribe.
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
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
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
      supabase.removeChannel(channel);
    };
  }, [profesorId, fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic UI: Actualización instantánea local
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    );

    try {
      const { error } = await actions.profesor.markNotificationAsRead({ id });
      if (error) throw error;
    } catch (err) {
      console.error("[useNotifications] Error marking as read:", err);
      // Revertir en caso de error (opcional, pero mejor para UX de alto rendimiento)
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI
    setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));

    try {
      const { error } = await actions.profesor.markAllNotificationsAsRead();
      if (error) throw error;
    } catch (err) {
      console.error("[useNotifications] Error marking all as read:", err);
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
