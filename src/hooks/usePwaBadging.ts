import { useEffect } from "react";
import { actions } from "astro:actions";

/**
 * usePwaBadging: Monitoriza cobros vencidos y actualiza el badge del icono de la app.
 * Sincroniza el estado financiero crítico con el punto de notificación nativo.
 */
export function usePwaBadging() {
  useEffect(() => {
    // Solo ejecutar si la API está disponible (PWA 2026 Level)
    if (!('setAppBadge' in navigator)) return;

    const updateBadge = async () => {
      try {
        const { data, error } = await actions.pagos.getPaymentsData();
        if (error) return;

        const overdueCount = data.metrics.totalMorosos || 0;
        
        if (overdueCount > 0) {
          await navigator.setAppBadge(overdueCount);
          console.log(`[MiGym PWA] Badge actualizado: ${overdueCount} deudas.`);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (err) {
        console.error("[MiGym PWA] Error actualizando badge:", err);
      }
    };

    // Actualización inicial
    updateBadge();

    // Listener para eventos de actualización de pagos
    const handleUpdate = () => updateBadge();
    window.addEventListener('pago-registrado', handleUpdate);
    window.addEventListener('dashboard-updated', handleUpdate);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') updateBadge();
    });

    return () => {
      window.removeEventListener('pago-registrado', handleUpdate);
      window.removeEventListener('dashboard-updated', handleUpdate);
      window.removeEventListener('visibilitychange', updateBadge);
    };
  }, []);
}
