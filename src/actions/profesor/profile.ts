import { z } from "zod";
import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { 
  updateAccountSchema, 
  updatePublicProfileSchema, 
  updateNotificationsSchema, 
  updatePrivacySchema, 
  changePasswordSchema 
} from "@/lib/validators";

/**
 * Profesor: Profile & Account Actions
 * Configuración de identidad, presencia pública y preferencias del sistema.
 */
export const profileActions = {

  /** updateAccount: Actauliza datos técnicos del profesor (Ej: Teléfono). */
  updateAccount: defineAction({
    accept: "json",
    input: updateAccountSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await supabase
        .from("profesores")
        .update({ telefono: input.telefono || null })
        .eq("id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, message: "Cuenta actualizada." };
    },
  }),

  /** updatePublicProfile: Gestión del micrositio y marca personal. */
  updatePublicProfile: defineAction({
    accept: "json",
    input: updatePublicProfileSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      if (input.slug) {
        const { data: existing } = await supabase
          .from("profesores")
          .select("id")
          .eq("slug", input.slug)
          .neq("id", user.id)
          .single();
        if (existing) throw new ActionError({ code: "CONFLICT", message: "Ese enlace ya está en uso." });
      }

      const { error } = await supabase
        .from("profesores")
        .update({
          nombre: input.nombre,
          slug: input.slug || null,
          bio: input.bio || null,
          instagram: input.instagram || null,
          youtube: input.youtube || null,
          tiktok: input.tiktok || null,
          x_twitter: input.x_twitter || null,
          especialidades: input.especialidades,
          perfil_publico: input.perfil_publico,
        })
        .eq("id", user.id);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, message: "Perfil guardado." };
    },
  }),

  /** changePassword: Orquestación de cambio de credenciales vía Auth Admin. */
  changePassword: defineAction({
    accept: "json",
    input: changePasswordSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: input.currentPassword,
      });

      if (authError) throw new ActionError({ code: "BAD_REQUEST", message: "Contraseña actual incorrecta." });

      const { error: updateError } = await supabase.auth.updateUser({ password: input.newPassword });
      if (updateError) throw new ActionError({ code: "BAD_REQUEST", message: updateError.message });

      return { success: true, message: "Contraseña actualizada." };
    },
  }),

  /** updateNotifications: Preferencias de alertas del sistema. */
  updateNotifications: defineAction({
    accept: "json",
    input: updateNotificationsSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await supabase.from("profesores").update(input).eq("id", user.id);
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    },
  }),

  /** updatePrivacy: Configuración de visibilidad de datos. */
  updatePrivacy: defineAction({
    accept: "json",
    input: updatePrivacySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await supabase.from("profesores").update(input).eq("id", user.id);
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    },
  }),
};
