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

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error("⚠️ Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.");
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
