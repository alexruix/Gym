import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { parse } from 'cookie';
import type { Database } from './database.types';
import { supabaseAdmin } from './supabase-admin';

export function createSupabaseServerClient(context: { cookies: any, request: Request }): SupabaseClient<Database> {
  const env = (import.meta.env || {}) as any;
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

  // 🛡️ HARDENING: Validación estricta de configuración
  const isValidUrl = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');
  const isValidKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 0 && supabaseAnonKey !== 'undefined';

  if (!isValidUrl || !isValidKey) {
    console.warn("⚠️ MiGym SSR: createSupabaseServerClient llamado sin configuración. Devolviendo Proxy defensivo.");
    
    return new Proxy({} as any, {
      get(_, prop) {
        throw new Error(`❌ Supabase SSR: Intentaste acceder a client.${String(prop)} en el servidor, pero PUBLIC_SUPABASE_URL no está configurada correctamente.`);
      }
    });
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          if (typeof context.cookies.getAll === 'function') {
            return context.cookies.getAll().map((c: any) => ({ name: c.name, value: c.value }));
          }
          const cookieHeader = context.request.headers.get('cookie') || '';
          const parsed = parse(cookieHeader);
          return Object.entries(parsed).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
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
          } catch (err) {
            // 🛡️ 防御: Si la respuesta ya se envió (ResponseSentError), ignoramos el set
            console.warn("[supabase-ssr] No se pudo actualizar la cookie auth (Response already sent)");
          }
        },
      },
    }
  );
}

/**
 * 🛠️ HELPER: Obtener el cliente correcto según el rol
 * Si el usuario es 'invitado', devuelve el cliente admin (service role) ya que los invitados
 * no tienen sesión de Supabase Auth y el RLS los bloquearía.
 */
export function getAuthenticatedClient(context: { locals: App.Locals, cookies: any, request: Request }): SupabaseClient<Database> {
  const user = context.locals.user;
  
  if (user?.role === "invitado") {
    // ⚠️ USO DE ADMIN: Solo porque los invitados no tienen Auth real.
    // El sistema debe asegurar que siempre se filtre por user.id.
    return supabaseAdmin;
  }
  
  return createSupabaseServerClient(context);
}
