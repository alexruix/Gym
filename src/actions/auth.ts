import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { completeOnboardingSchema } from "@/lib/validators/profesor";
import { authCopy } from "@/data/es/auth";

export const authActions = {
  completeOnboarding: defineAction({
    accept: "json",
    input: completeOnboardingSchema,
    handler: async (input, context) => {
      const copy = authCopy.onboarding.actions;
      const supabase = createSupabaseServerClient(context);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
         throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });
      }

      const userId = user.id;
      const userEmail = user.email;

      // 2. Guardar los datos en la tabla profesores (Atomic SSOT)
      const { error: upsertError } = await (supabase
        .from("profesores") as any)
        .upsert({
          id: userId,
          email: userEmail || '',
          nombre: input.publicName, 
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (upsertError) {
        throw new ActionError({ code: "BAD_REQUEST", message: `${copy.error.save_failed}${upsertError.message}` });
      }

      return {
        success: true,
        mensaje: copy.success,
      };
    },
  }),
};
