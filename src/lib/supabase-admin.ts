import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * CLIENTE ADMINISTRATIVO (Service Role)
 * 
 * ⚠️ ADVERTENCIA DE SEGURIDAD:
 * Este cliente utiliza la SUPABASE_SERVICE_ROLE_KEY, lo que le permite
 * saltarse todas las políticas de RLS. 
 * 
 * SOLO puede ser utilizado en el servidor (Astro Actions, API Routes).
 * NUNCA debe ser importado en componentes de cliente (.tsx).
 */

let _adminClient: any = null;

/**
 * Lazy Initializer para el Cliente Admin (Service Role).
 * Solo se instancia cuando se accede a una propiedad, evitando crasheos 
 * en el Middleware durante el arranque de la aplicación en Vercel.
 */
function getAdminClient() {
  if (_adminClient) return _adminClient;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  // 🛡️ HARDENING: Validación estricta de URL y KEY
  const isValidUrl = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');
  const isValidKey = typeof supabaseServiceKey === 'string' && supabaseServiceKey.length > 0 && supabaseServiceKey !== 'undefined';

  if (!isValidUrl || !isValidKey) {
    // No lanzamos error aquí para permitir que el middleware se cargue.
    // Solo explotará si realmente se intenta usar una operación de admin.
    console.warn("⚠️ MiGym Admin: Falta configuración (URL o ServiceKey).");
    return null;
  }

  _adminClient = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  return _adminClient;
}

// Exportamos un Proxy para mantener compatibilidad con las importaciones actuales
export const supabaseAdmin = new Proxy({} as any, {
  get(_, prop) {
    const client = getAdminClient();
    if (!client) {
      throw new Error("❌ Supabase Admin: No se puede inicializar sin SUPABASE_SERVICE_ROLE_KEY.");
    }
    
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
