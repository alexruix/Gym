import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase-ssr";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 🌩️ OPTIMIZACIÓN: Saltamos el middleware para assets estáticos y rutas públicas de marketing
  const isStaticAsset = (path.includes('.') && !path.startsWith('/_actions')) || path.startsWith('/_astro');
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
         context.locals.user = {
           id: guestStudent.id,
           email: guestStudent.email || "",
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

  // 1. SI NO HAY SESIÓN (NI GUEST NI AUTH)
  if (!localUser) {
    if (path.startsWith('/alumno')) return context.redirect('/login?error=no_token');
    if (path.startsWith('/profesor') || path.startsWith('/onboarding')) return context.redirect('/login?error=unauthorized');
    return next();
  }

  // 2. BLINDAJE DE ONBOARDING: Prohibido para Alumnos o Profesores ya registrados
  if (path.startsWith('/onboarding')) {
    if (localUser.role === 'invitado') return context.redirect('/alumno');
    
    const { data: isProfesor } = await supabase.from('profesores').select('id').eq('id', localUser.id).maybeSingle();
    if (isProfesor) return context.redirect('/profesor');
  }

  // 3. PROTECCIÓN DE RUTA PROFESOR
  if (path.startsWith('/profesor')) {
    if (localUser.role !== 'profesor') {
      if (localUser.role === 'invitado' || localUser.role === 'alumno') return context.redirect('/alumno');
      return context.redirect('/onboarding');
    }
    // Verificación final de integridad de profesor
    const { data: isProf } = await supabase.from('profesores').select('id').eq('id', localUser.id).maybeSingle();
    if (!isProf) return context.redirect('/onboarding');
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
