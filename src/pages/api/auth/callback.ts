import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session && data.user) {
      const { access_token, refresh_token, expires_in } = data.session;

      // 1. Guardamos tokens en cookies httpOnly
      cookies.set('sb-access-token', access_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: expires_in
      });

      cookies.set('sb-refresh-token', refresh_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      });

      // 2. Lógica de Redirección Dinámica (SSOT)
      
      // Intentamos buscarlo como Profesor
      const { data: profData } = await supabase
        .from('profesores')
        .select('nombre')
        .eq('id', data.user.id)
        .maybeSingle(); // .maybeSingle() no explota si no hay resultados

      if (profData) {
        if (!profData.nombre) return redirect('/onboarding');
        return redirect(next || '/profesor/dashboard');
      }

      // Si no es profesor, buscamos si es Alumno
      const { data: alumData } = await supabase
        .from('alumnos')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (alumData) {
        // Redirigir a la vista de alumno (placeholder por ahora)
        return redirect('/entrenamiento');
      }

      // Si no existe en ninguna, asumimos que es un Profesor nuevo
      return redirect('/onboarding');
    }
  }

  return redirect('/login?error=auth_callback_failed');
};
