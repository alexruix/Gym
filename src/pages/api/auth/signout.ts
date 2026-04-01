import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";

export const POST: APIRoute = async (context) => {
  const { cookies, redirect } = context;

  // 1. Limpiar cookie de Alumno Invitado (si existe)
  cookies.delete("gym_access", { path: "/" });

  // 2. Destruir sesión de Profesor (Supabase Auth)
  const supabase = createSupabaseServerClient(context);
  await supabase.auth.signOut();

  // 3. Redirigir al inicio o login
  return redirect("/login");
};
