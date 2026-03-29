import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-ssr';

export const GET: APIRoute = async (context) => {
  const { request, cookies, redirect } = context;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/profesor';

  if (code) {
    const supabase = createSupabaseServerClient(context);
    
    // 1. Intercambiamos el código por la sesión. 
    // @supabase/ssr se encarga de buscar el verifier en las cookies automáticamente.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // 2. Lógica de Redirección Dinámica (SSOT)
      
      // Intentamos buscarlo como Profesor
      const { data: profData } = await supabase
        .from('profesores')
        .select('nombre')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profData) {
        if (!profData.nombre) return redirect('/onboarding');
        return redirect(next);
      }

      // Si no es profesor, buscamos si es Alumno
      const { data: alumData } = await supabase
        .from('alumnos')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (alumData) {
        return redirect('/entrenamiento');
      }

      // Si no existe en ninguna, es un Profesor nuevo (Onboarding)
      return redirect('/onboarding');
    }
    
    if (error) {
      console.error('Auth Callback Error:', error.message);
    }
  }

  // Si algo falla, al login con error
  return redirect('/login?error=auth_callback_failed');
};