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
 * Formatea una fecha en formato largo (Ej: "8 de julio")
 */
export function formatDateLong(date: Date | string | undefined | null): string {
  if (!date) return "";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  
  return d.toLocaleDateString("es-AR", { 
    day: 'numeric', 
    month: 'long' 
  });
}

/**
 * Retorna tiempo relativo (Ej: "hace 5 min", "hace 1h")
 */
export function formatRelativeTime(date: Date | string | undefined | null): string {
  if (!date) return "";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "Ahora";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays}d`;
  
  return d.toLocaleDateString("es-AR", { day: 'numeric', month: 'short' });
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

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calculateAge(birthDate: Date | string | undefined | null): number | null {
  if (!birthDate) return null;
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * FORMATEADOR PARA INPUT DATE (YYYY-MM-DD)
 * Convierte una fecha a string compatible con <input type="date" />.
 */
export function toInputDate(date: Date | string | undefined | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * FORMATEADOR PARA INPUT TIME (HH:mm)
 * Extrae la hora en formato 24hs para <input type="time" />.
 */
export function toInputTime(date: Date | string | undefined | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * FORMATEADOR DE FECHAS LATAM (es-AR)
 * Evita el bug de zona horaria y devuelve un string legible.
 */
export function formatDateLatam(dateString: string | Date | undefined | null, style: 'short' | 'long' | 'full' = 'long'): string {
  if (!dateString) return "";
  
  // 1. Normalizar entrada a string YYYY-MM-DD para evitar el bug de zona horaria de JS
  let dateToProcess = "";
  if (dateString instanceof Date) {
    dateToProcess = dateString.toISOString().split('T')[0];
  } else {
    dateToProcess = dateString.split('T')[0];
  }

  const parts = dateToProcess.split("-").map(Number);
  if (parts.length < 3) return "";

  const [year, month, day] = parts;
  const localDate = new Date(year, month - 1, day);

  // 2. Formateador nativo para Argentina
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: style === 'short' ? 'short' : 'long' };
  
  if (style === 'full') {
      options.year = 'numeric'; // "12 de marzo de 2026"
  }

  return new Intl.DateTimeFormat('es-AR', options).format(localDate);
}

/**
 * Obtiene el ID de un video de YouTube a partir de su URL
 */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Convierte una URL de YouTube en una URL de embed
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
}
