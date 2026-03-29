import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { parse } from 'cookie';
import type { Database } from './database.types';

export function createSupabaseServerClient(context: { cookies: any, request: Request }) {
  return createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          // Fallback defensivo: si getAll() no existe (algunos contextos de Astro), 
          // parseamos el header 'cookie' directamente manualmente.
          if (typeof context.cookies.getAll === 'function') {
            return context.cookies.getAll().map((c: any) => ({ name: c.name, value: c.value }));
          }
          
          const cookieHeader = context.request.headers.get('cookie') || '';
          const parsed = parse(cookieHeader);
          return Object.entries(parsed).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Astro cookies.set espera opciones de tipo CookieOptions compatibles
            context.cookies.set(name, value, {
              path: options?.path || '/',
              httpOnly: options?.httpOnly ?? true,
              secure: options?.secure ?? import.meta.env.PROD,
              sameSite: (options?.sameSite as any) || 'lax',
              maxAge: options?.maxAge,
              domain: options?.domain,
              expires: options?.expires
            });
          });
        },
      },
    }
  );
}
