import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export const supabase = createBrowserClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: !import.meta.env.SSR,
      detectSessionInUrl: !import.meta.env.SSR,
    }
  }
);
