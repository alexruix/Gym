import { useEffect } from "react";

/**
 * usePwaSync: Registra la sincronización periódica en segundo plano.
 * Permite que el Service Worker descargue datos críticos (ej: Agenda) 
 * mientras el profesor no está usando la app.
 */
export function usePwaSync() {
  useEffect(() => {
    const registerPeriodicSync = async () => {
      // 1. Verificación de soporte (PWA 2026 Level)
      if (!('serviceWorker' in navigator)) return;
      
      const registration = await navigator.serviceWorker.ready;
      
      // La API requiere el permiso 'periodic-background-sync' (en algunos navegadores es automático si está instalada)
      if (!('periodicSync' in registration)) {
        console.log("[MiGym PWA] Periodic Sync no soportado en este navegador.");
        return;
      }

      try {
        // @ts-ignore
        const tags = await registration.periodicSync.getTags();
        
        if (!tags.includes('warm-up-agenda')) {
          // @ts-ignore
          await registration.periodicSync.register('warm-up-agenda', {
            minInterval: 24 * 60 * 60 * 1000, 
          });
          console.log("[MiGym PWA] Periodic Sync 'warm-up-agenda' registrado.");
        }
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          console.warn("[MiGym PWA] Periodic Sync denegado. Esto es normal si la PWA no está instalada o no tiene permisos de fondo.");
        } else {
          console.error("[MiGym PWA] Error inesperado en Periodic Sync:", err);
        }
      }
    };

    registerPeriodicSync();
  }, []);
}
