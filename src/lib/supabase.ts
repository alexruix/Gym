import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Blindaje NODO: Si falta la URL, lanzamos un error claro antes de que Supabase explote
if (!supabaseUrl || supabaseUrl === 'undefined') {
  throw new Error(
    "❌ Error de Configuración: PUBLIC_SUPABASE_URL es undefined. Verificá las variables de entorno en Vercel."
  );
}

export const supabase = createBrowserClient<Database>(
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