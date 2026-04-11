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
        // @ts-ignore - API moderna puede no estar en tipos estándar aún
        const tags = await registration.periodicSync.getTags();
        
        if (!tags.includes('warm-up-agenda')) {
          // @ts-ignore
          await registration.periodicSync.register('warm-up-agenda', {
            // Intervalo mínimo sugerido: 24 horas (en ms)
            // Nota: El OS decidirá cuándo ejecutarlo basado en el uso.
            minInterval: 24 * 60 * 60 * 1000, 
          });
          console.log("[MiGym PWA] Periodic Sync 'warm-up-agenda' registrado.");
        }
      } catch (err) {
        console.error("[MiGym PWA] No se pudo registrar Periodic Sync:", err);
      }
    };

    registerPeriodicSync();
  }, []);
}
