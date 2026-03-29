import { defineAction } from "astro:actions";
import { z } from "astro:content";
import { supabase } from "../lib/supabase";

export const authActions = {
  completeOnboarding: defineAction({
    accept: "json",
    input: z.object({
      nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
      gymName: z.string().min(2, "El nombre del gimnasio es muy corto"),
    }),
    handler: async (input, context) => {
      // 1. Verificar sesión autenticada. Dependiendo del Setup de Astro,
      // acá podríamos obtener el id usando el JWT de res.locals o verificarlo contra supabase cookie.
      // Para mayor seguridad validaremos desde el token de Supabase en Astro 5.
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.user) {
         throw new Error("No estás autenticado o la sesión expiró.");
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      // 2. Guardar los datos en la tabla profesores (upsert en caso de que ya exista pero le falten datos)
      const { error: upsertError } = await supabase
        .from("profesores")
        .upsert({
          id: userId,
          email: userEmail,
          nombre: input.nombre,
          gym_nombre: input.gymName,
          created_at: new Date().toISOString()
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
