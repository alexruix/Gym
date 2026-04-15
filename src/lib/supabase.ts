import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

let _supabase: any = null;

/**
 * Lazy Initializer: Solo crea el cliente de Supabase cuando se accede a él.
 * Esto evita crasheos durante el SSR si las variables de entorno aún no están listas.
 */
function getSupabaseClient() {
  if (_supabase) return _supabase;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // 🛡️ HARDENING: Validación estricta de configuración
  const isValidUrl = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');
  const isValidKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 0 && supabaseAnonKey !== 'undefined';

  if (!isValidUrl || !isValidKey) {
    // No lanzamos error aquí para evitar crashear el proceso de importación
    console.warn("⚠️ MiGym Supabase: Esperando configuración válida.");
    return null;
  }

  _supabase = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: !import.meta.env.SSR,
        detectSessionInUrl: !import.meta.env.SSR,
      }
    }
  );

  return _supabase;
}

// Exportamos un Proxy que actúa como el cliente de Supabase
export const supabase = new Proxy({} as any, {
  get(_, prop) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("❌ Supabase: Intentaste usar el cliente pero PUBLIC_SUPABASE_URL es undefined.");
    }
    
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});