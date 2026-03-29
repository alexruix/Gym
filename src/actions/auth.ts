import { defineAction } from "astro:actions";
import { z } from "astro:content";
import { createSupabaseServerClient } from "../lib/supabase-ssr";

export const authActions = {
  completeOnboarding: defineAction({
    accept: "json",
    input: z.object({
      publicName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    }),
    handler: async (input, context) => {
      // Usamos el cliente servidor pasándole el contexto de Astro (cookies)
      const supabase = createSupabaseServerClient(context);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
         throw new Error("No estás autenticado o la sesión expiró.");
      }

      const userId = user.id;
      const userEmail = user.email;

      // 2. Guardar los datos en la tabla profesores
      const { error: upsertError } = await supabase
        .from("profesores")
        .upsert({
          id: userId,
          email: userEmail || '',
          nombre: input.publicName, // Nombre público unificado
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (upsertError) {
        throw new Error(`Error guardando onboarding: ${upsertError.message}`);
      }

      return {
        success: true,
        mensaje: "¡Espacio creado con éxito!",
      };
    },
  }),
};
