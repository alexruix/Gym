import { useState, useMemo } from "react";

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

/**
 * useNotificationState: El corazón reactivo de las alertas.
 */
export function useNotificationState(initialNotifications: Notification[] = []) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [loading, setLoading] = useState(true);

    const unreadCount = useMemo(() => 
        notifications.filter(n => !n.leido).length, 
    [notifications]);

    return {
        notifications,
        setNotifications,
        unreadCount,
        loading,
        setLoading
    };
}
