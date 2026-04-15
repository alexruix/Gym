import { z } from "zod";
import { defineAction, ActionError } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { exerciseLibrarySchema, importExercisesSchema, toggleFavoriteSchema } from "@/lib/validators/profesor";
import { baseExercises } from "@/data/es/profesor/biblioteca-base";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
      const copy = exerciseLibraryCopy.actions;
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: copy.error.unauthorized });

      // Silent Sync Logic (Abstracted for modularity)
      const runSync = async () => {
        // Obtenemos ejercicios del sistema (Globales)
        const { data: systemItems } = await supabase.from("biblioteca_ejercicios").select("id, nombre").is("profesor_id", null);
        const dbMap = new Map((systemItems || []).map((item: any) => [normalizeStr(item.nombre), item]));

        const missingExercises = baseExercises.filter(ex => !dbMap.get(normalizeStr(ex.nombre)));

        if (missingExercises.length > 0) {
          console.log(`[Library Sync] Insertando ${missingExercises.length} ejercicios maestros.`);
          
          for (const ex of missingExercises) {
            // 1. Insertar Ejercicio Base
            const { data: insertedBase, error: baseErr } = await (supabaseAdmin as any)
              .from("biblioteca_ejercicios")
              .insert({
                nombre: ex.nombre,
                descripcion: ex.descripcion,
                media_url: ex.media_url,
                video_url: ex.video_url,
                tags: ex.tags,
                is_template_base: true,
                profesor_id: null // Global
              })
              .select("id")
              .single();

            if (baseErr) {
              console.error(`[Library Sync] Error al insertar base ${ex.nombre}:`, baseErr.message);
              continue;
            }

            // 2. Insertar Variantes vinculadas
            if (ex.variants && ex.variants.length > 0) {
              const variantsToInsert = ex.variants.map(v => ({
                nombre: v.nombre,
                descripcion: v.descripcion,
                media_url: v.media_url,
                video_url: v.video_url,
                parent_id: insertedBase.id,
                is_template_base: false,
                profesor_id: null
              }));

              await (supabaseAdmin as any).from("biblioteca_ejercicios").insert(variantsToInsert);
            }
          }
          console.log("[Library Sync] Sincronización completada con éxito.");
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

      if (error) throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: copy.error.load_failed });

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
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: exerciseLibraryCopy.actions.error.unauthorized });

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
    input: importExercisesSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: exerciseLibraryCopy.actions.error.unauthorized });

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
    input: toggleFavoriteSchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED", message: exerciseLibraryCopy.actions.error.unauthorized });

      const { error } = await (supabase as any)
        .from("biblioteca_ejercicios")
        .update({ is_favorite: input.isFavorite })
        .eq("id", input.id)
        .or(`profesor_id.eq.${user.id},profesor_id.is.null`);

      if (error) throw new ActionError({ code: "BAD_REQUEST", message: `${exerciseLibraryCopy.actions.error.general}${error.message}` });
      return { success: true };
    },
  }),
};
