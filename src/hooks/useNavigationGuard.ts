import { useEffect } from "react";

interface UseNavigationGuardProps {
  enabled: boolean;
  message?: string;
}

/**
 * useNavigationGuard: Evita la pérdida de datos accidentales protegiendo la navegación.
 * Maneja tanto el cierre de la pestaña (beforeunload) como la navegación interna (astro:before-preparation).
 */
export function useNavigationGuard({ 
  enabled, 
  message = "Tenés cambios sin guardar. ¿Querés salir igual?" 
}: UseNavigationGuardProps) {
  
  useEffect(() => {
    if (!enabled) return;

    // 1. Protección de Navegador (Pestaña / Refresco)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // 2. Protección de Astro (View Transitions / Links internos)
    const handleAstroBeforePreparation = (e: any) => {
      if (!window.confirm(message)) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("astro:before-preparation", handleAstroBeforePreparation);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("astro:before-preparation", handleAstroBeforePreparation);
    };
  }, [enabled, message]);
}
