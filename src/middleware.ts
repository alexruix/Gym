import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase-ssr";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname: path } = context.url;

  // 🌩️ OPTIMIZACIÓN: Saltamos el middleware para assets estáticos y rutas públicas de marketing
  const isStaticAsset = path.includes('.') && 
                        !path.startsWith('/_actions') && 
                        !path.endsWith('.astro') || 
                        path.startsWith('/_astro') ||
                        path.endsWith('.webmanifest') ||
                        path.endsWith('.ico');

  const isPublicRoute = path === '/' || path === '/login' || path.startsWith('/api/auth');

  if (isStaticAsset) return next();

  const supabase = createSupabaseServerClient(context);
  const { data: { user } } = await supabase.auth.getUser();

  // 🚪 GESTIÓN DE SESIÓN (Prioridad: AUTH > GUEST)
  if (!user) {
    // Si no hay Auth Real, buscamos el "Link de Invitado" (Modo Barrio)
    const guestToken = context.cookies.get("gym_access")?.value;
    
    if (guestToken) {
       // Importamos admin para validar token sin RLS
       const { supabaseAdmin } = await import("./lib/supabase-admin");
       const { data: guestStudent } = await supabaseAdmin
         .from("alumnos")
         .select("id, email, nombre")
         .eq("access_token", guestToken)
         .single();
       
       if (guestStudent) {
         const student = guestStudent as { id: string, email: string | null };
         context.locals.user = {
           id: student.id,
           email: student.email || "",
           role: "invitado"
         };
       } else {
         context.locals.user = null;
       }
    } else {
       context.locals.user = null;
    }
  } else {
    // Sesión Real Detectada
    context.locals.user = {
      id: user.id,
      email: user.email || "",
      role: (user.app_metadata?.role as any) || "profesor",
    };
  }

  const localUser = context.locals.user;

  // 🛡️ ESCUDO GLOBAL (RBAC)
  if (!localUser) {
    if (path.startsWith('/alumno')) return context.redirect('/login?error=no_token');
    if (path.startsWith('/profesor') || path.startsWith('/onboarding')) return context.redirect('/login?error=unauthorized');
    return next();
  }

  // 🌩️ Verificación de Integridad de Profesor — cacheada en cookie (30 min TTL)
  // Evita un round-trip a DB en cada request de rutas /profesor/*.
  let isProfesorInDb = false;
  if (localUser.role === 'profesor' || path.startsWith('/profesor') || path.startsWith('/onboarding')) {
    const CACHE_COOKIE = `_gym_prof_ok_${localUser.id.slice(0, 8)}`;
    const cached = context.cookies.get(CACHE_COOKIE)?.value;

    if (cached === '1') {
      // Cache hit: omitir consulta a DB
      isProfesorInDb = true;
    } else {
      // Cache miss: consultar DB y guardar resultado
      const { data } = await supabase.from('profesores').select('id').eq('id', localUser.id).maybeSingle();
      isProfesorInDb = !!data;
      if (isProfesorInDb) {
        context.cookies.set(CACHE_COOKIE, '1', {
          path: '/',
          maxAge: 60 * 30, // 30 minutos
          httpOnly: true,
          sameSite: 'lax',
        });
      }
    }
  }

  // 1. BLINDAJE DE ONBOARDING: Prohibido para Alumnos o Profesores ya registrados
  if (path.startsWith('/onboarding')) {
    if (localUser.role === 'invitado') return context.redirect('/alumno');
    if (isProfesorInDb) return context.redirect('/profesor');
  }

  // 2. PROTECCIÓN DE RUTA PROFESOR
  if (path.startsWith('/profesor')) {
    if (localUser.role !== 'profesor' || !isProfesorInDb) {
      if (localUser.role === 'invitado' || localUser.role === 'alumno') return context.redirect('/alumno');
      return context.redirect('/onboarding');
    }
  }

  // 4. PROTECCIÓN DE RUTA ALUMNO
  if (path.startsWith('/alumno')) {
    if (localUser.role === 'profesor') return context.redirect('/profesor');
    if (localUser.role !== 'invitado') return context.redirect('/login?error=no_token');
  }

  // 5. LOGIN REDIRECT: Si ya tiene sesión, mandarlo a su casa
  if (path === '/login') {
    if (localUser.role === 'profesor') return context.redirect('/profesor');
    return context.redirect('/alumno');
  }

  return next();
});
