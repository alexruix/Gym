import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * COPIA ROBUSTA AL PORTAPAPELES
 * Funciona en contextos seguros (HTTPS) y no seguros (HTTP/IP) mediante fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Intentar con la API moderna (preferido)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('navigator.clipboard falló:', err);
    }
  }

  // 2. Fallback: Método tradicional (Legacy/HTTP/IP)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Asegurar que sea invisible pero seleccionable
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copyToClipboard falló:', err);
    return false;
  }
}
