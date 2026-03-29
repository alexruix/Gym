import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase-ssr";

export const onRequest = defineMiddleware(async (context, next) => {
  // 1. Iniciamos el cliente de servidor pasándole el contexto (acceso a cookies)
  const supabase = createSupabaseServerClient(context);

  // 2. Obtenemos el usuario. getUser() es más seguro que getSession()
  // y @supabase/ssr se encarga de refrescar el token si expiró usando las cookies.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    context.locals.user = null;
  } else {
    // 3. Poblamos locals.user para las Actions y Páginas (.astro)
    // Para el rol, podríamos hacer una consulta rápida o usar app_metadata
    context.locals.user = {
      id: user.id,
      email: user.email || "",
      // Por defecto no sabemos el rol sin una consulta, 
      // pero podemos dejarlo opcional o consultarlo si es necesario.
      // Para no penalizar cada request, asumiremos que las páginas validarán su propia tabla.
      role: (user.app_metadata?.role as any) || "profesor",
    };
  }

  return next();
});
