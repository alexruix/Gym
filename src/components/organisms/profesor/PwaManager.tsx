import React from "react";
import { usePwaBadging } from "@/hooks/usePwaBadging";
import { usePwaSync } from "@/hooks/usePwaSync";

/**
 * PwaManager: Orquestador silencioso de funciones PWA Phase 3.
 * No renderiza nada en la UI (Gabinete Oculto), pero activa la 
 * inteligencia de badging y sincronización periódica.
 */
export function PwaManager() {
  // Activar Inteligencia de Badging (Punto rojo en icono)
  usePwaBadging();

  // Activar Sincronización Periódica (Background Warm-up)
  usePwaSync();

  return null;
}
