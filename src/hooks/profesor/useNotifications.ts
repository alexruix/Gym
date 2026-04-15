import { useNotificationState, type Notification } from "./notifications/useNotificationState";
import { useNotificationSync } from "./notifications/useNotificationSync";
import { useNotificationOperations } from "./notifications/useNotificationOperations";

/**
 * useNotifications: El cerebro de alertas del profesor.
 * Orquesta la sincronización en tiempo real (El Oído), la memoria del sistema (El Estado) 
 * y las acciones de procesamiento (El Descarte).
 */
export function useNotifications(profesorId: string) {
    
    // 1. Memoria Reactiva (Estado y Contador)
    const { 
        notifications, 
        setNotifications, 
        unreadCount, 
        loading, 
        setLoading 
    } = useNotificationState();

    // 2. El Vigía (Sincronización Realtime - El Oído)
    const { refresh } = useNotificationSync(profesorId, setNotifications, setLoading);

    // 3. El Motor de Acciones (El Descarte)
    const { markAsRead, markAllAsRead } = useNotificationOperations(setNotifications, refresh);

    return {
        // Data & UI State
    notifications,
    unreadCount,
    loading,

    // Actions
    markAsRead,
    markAllAsRead,
    refresh
  };
}

export type { Notification };
