import { z } from "zod";
import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { exerciseLibrarySchema } from "@/lib/validators";
import { baseExercises } from "@/data/es/profesor/biblioteca-base";

let hasSynced = false;

const normalizeStr = (str: string) =>
  str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

const validBaseNames = new Set<string>();
baseExercises.forEach((ex: any) => {
  validBaseNames.add(normalizeStr(ex.nombre));
  (ex.variants || []).forEach((v: any) => validBaseNames.add(normalizeStr(v.nombre)));
});

/**
 * Profesor: Exercise Library Actions
 * Gestión de la biblioteca maestra ( Living Cabinet ).
 */
export const libraryActions = {

  /** getExerciseLibrary: Obtiene la biblioteca completa con Smart Sync silencioso. */
  getExerciseLibrary: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      // Silent Sync Logic (Abstracted for modularity)
      const runSync = async () => {
        const { data: systemItems } = await supabaseAdmin.from("biblioteca_ejercicios").select("*").is("profesor_id", null);
        const dbMap = new Map((systemItems || []).map((item: any) => [normalizeStr(item.nombre), item]));

        let needsSync = false;
        for (const ex of (baseExercises as any[])) {
          const dbEx = dbMap.get(normalizeStr(ex.nombre));
          if (!dbEx) { needsSync = true; break; }
        }

        if (needsSync) {
           // Basic seeding if needed - In a real scenario, this would be a more complex merge
           console.log("[Library Sync] Sincronización requerida detectada.");
        }
      };

      if (!hasSynced) {
        hasSynced = true;
        runSync().catch(console.error);
      }

      const { data, error } = await supabase
        .from("biblioteca_ejercicios")
        .select("*, is_favorite, usage_count")
        .or(`profesor_id.eq.${user.id},profesor_id.is.null`)
        .order("nombre", { ascending: true });

      if (error) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Error al cargar biblioteca" });

      return (data || []).filter((item: any) => item.profesor_id !== null || validBaseNames.has(normalizeStr(item.nombre)));
    },
  }),

  /** createExercise: Alta de nuevo ejercicio con soporte de variantes. */
  createExercise: defineAction({
    accept: "json",
    input: exerciseLibrarySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { data: exercise, error } = await (supabase as any)
        .from("biblioteca_ejercicios")
        .insert({
          profesor_id: user.id,
          parent_id: input.parent_id || null,
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          media_url: input.media_url || null,
          video_url: input.video_url || null,
          tags: (input.tags || []).map((t: any) => t.toLowerCase().trim()),
          is_template_base: !input.parent_id,
        })
        .select().single();

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, exercise };
    },
  }),

  /** importExercises: Carga masiva desde CSV/JSON. */
  importExercises: defineAction({
    accept: "json",
    input: z.array(z.object({
      nombre: z.string().min(1),
      descripcion: z.string().optional().nullable(),
      media_url: z.string().optional().nullable(),
      tags: z.array(z.string()).optional().default([]),
    })),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const items = input.map(item => ({
        profesor_id: user.id,
        nombre: item.nombre,
        descripcion: item.descripcion || null,
        media_url: item.media_url || null,
        tags: item.tags.map(t => t.toLowerCase().trim()).slice(0, 6),
      }));

      const { data, error } = await (supabase as any).from("biblioteca_ejercicios").insert(items).select();
      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true, count: data?.length || 0 };
    },
  }),

  toggleFavorite: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid(), isFavorite: z.boolean() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: "No autorizado" });

      const { error } = await (supabase as any)
        .from("biblioteca_ejercicios")
        .update({ is_favorite: input.isFavorite })
        .eq("id", input.id)
        .or(`profesor_id.eq.${user.id},profesor_id.is.null`);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    },
  }),
};
