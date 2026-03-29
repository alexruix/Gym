import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase-ssr";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context);
  const { data: { user } } = await supabase.auth.getUser();

  context.locals.user = user ? {
    id: user.id,
    email: user.email || "",
    role: (user.app_metadata?.role as any) || "profesor",
  } : null;

  const url = new URL(context.request.url);
  const path = url.pathname;

  // 🛡️ PROTECCIÓN DE RUTAS (RBAC)
  // Si intenta acceder a áreas privadas sin sesión, al login.
  if (!user && (path.startsWith('/profesor') || path.startsWith('/alumno') || path.startsWith('/entrenamiento'))) {
    return context.redirect('/login?error=unauthorized');
  }

  // Redirección lógica: Si ya está logueado y va a login, mandarlo a su dashboard
  if (user && path === '/login') {
    const role = user.app_metadata?.role || 'profesor';
    return context.redirect(role === 'profesor' ? '/profesor' : '/entrenamiento');
  }

  return next();
});
