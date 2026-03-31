import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-ssr';

export const GET: APIRoute = async (context) => {
  const { request, redirect } = context;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/profesor';

  if (code) {
    const supabase = createSupabaseServerClient(context);
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && user) {
      // 1. Verificar si es Profesor
      const { data: profData } = await supabase
        .from('profesores')
        .select('nombre')
        .eq('id', user.id)
        .maybeSingle();

      if (profData) {
        if (!profData.nombre) return redirect('/onboarding');
        return redirect(next);
      }

      // 2. Verificar si es Alumno (Por user_id o por Email)
      // Buscamos si ya tiene el user_id vinculado
      let { data: alumData } = await supabase
        .from('alumnos')
        .select('id, user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Si no lo tiene, buscamos por email para VINCULARLO (Onboarding automático)
      if (!alumData) {
        const { data: alumByEmail } = await supabase
          .from('alumnos')
          .select('id')
          .eq('email', user.email)
          .is('user_id', null) // Solo si no está reclamado
          .maybeSingle();

        if (alumByEmail) {
          // Vínculo Vital: Asociamos la identidad de Auth con la ficha de MiGym
          await supabase
            .from('alumnos')
            .update({ user_id: user.id })
            .eq('id', alumByEmail.id);
          
          return redirect('/alumno');
        }
      }

      if (alumData) {
        return redirect('/alumno');
      }

      // 3. Si no es ninguno, asumimos que es un Profesor que arranca Onboarding
      return redirect('/onboarding');
    }
    
    if (error) {
      console.error('Auth Callback Error:', error.message);
    }
  }

  return redirect('/login?error=auth_callback_failed');
};