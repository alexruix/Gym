import { z } from "zod";
import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { exerciseLibrarySchema } from "@/lib/validators";
import { baseExercises } from "@/data/es/profesor/biblioteca-base";

/**
 * Ejercicios Actions: Gestión de la Biblioteca de Ejercicios.
 * Implementa el patrón "Living Cabinet" con soporte para Hybrid Hydration.
 */
export const ejercicioActions = {
  
  /**
   * Obtiene la biblioteca completa (Publica + Privada).
   * Realiza un Smart Sync silencioso con la base de datos si detecta cambios en el archivo TS.
   */
  getExerciseLibrary: defineAction({
    accept: "json",
    handler: async (_, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      // 1. SILENT SEEDING & SMART SYNC
      const { data: rawSystemItems } = await supabaseAdmin
        .from("biblioteca_ejercicios")
        .select("*")
        .is("profesor_id", null);

      const systemItems = (rawSystemItems || []) as any[];
      const dbMap = new Map<string, any>(systemItems.map(item => [item.nombre, item]));
      let needsSync = false;

      // Detección de cambios rápida
      for (const ex of baseExercises) {
        const dbEx = dbMap.get(ex.nombre);
        if (!dbEx) { needsSync = true; break; }
        if (
          dbEx.descripcion !== (ex.descripcion || null) ||
          dbEx.media_url !== (ex.media_url || null) ||
          JSON.stringify(dbEx.tags?.sort()) !== JSON.stringify([...(ex as any).tags || []].sort())
        ) {
          needsSync = true;
          break;
        }
      }

      if (needsSync || systemItems.length === 0) {
        console.log("[Smart Sync] Actualizando catálogo base...");
        for (const ex of baseExercises) {
          const { variants, ...parentData } = (ex as any);
          const dbEx = dbMap.get(ex.nombre);
          let parentId: string | null = dbEx?.id || null;

          if (!dbEx) {
            const { data: newP } = await (supabaseAdmin.from("biblioteca_ejercicios") as any)
              .insert({ ...parentData, profesor_id: null, is_template_base: true })
              .select("id")
              .single();
            parentId = newP?.id || null;
          } else {
            await (supabaseAdmin.from("biblioteca_ejercicios") as any)
              .update({ ...parentData })
              .eq("id", dbEx.id);
          }

          if (variants && variants.length > 0 && parentId) {
            const currentVariants = systemItems.filter(v => v.parent_id === parentId);
            const toInsert = (variants as string[]).filter(vName => !currentVariants.some(cv => cv.nombre === vName));
            if (toInsert.length > 0) {
              await (supabaseAdmin.from("biblioteca_ejercicios") as any).insert(
                toInsert.map(vName => ({
                  nombre: vName,
                  parent_id: parentId,
                  profesor_id: null,
                  is_template_base: false,
                  tags: parentData.tags || []
                }))
              );
            }
          }
        }
      }

      // 2. FETCH UNIFICADO
      const { data, error } = await supabase
        .from("biblioteca_ejercicios")
        .select("*, is_favorite, usage_count")
        .or(`profesor_id.eq.${user.id},profesor_id.is.null`)
        .order("nombre", { ascending: true });

      if (error) throw new Error(`Error al sincronizar biblioteca: ${error.message}`);
      
      return (data || []).filter(item => {
        if (item.profesor_id !== null) return true;
        const validSystemNames = new Set(baseExercises.map(ex => ex.nombre));
        if (!item.parent_id) return validSystemNames.has(item.nombre);
        const parent = data.find(p => p.id === item.parent_id);
        return parent && validSystemNames.has(parent.nombre);
      });
    },
  }),

  /** Crea un ejercicio y opcionalmente sus variantes */
  createExercise: defineAction({
    accept: "json",
    input: exerciseLibrarySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const normalizedTags = Array.from(new Set((input.tags || []).map(t => t.toLowerCase().trim()))).slice(0, 6);

      const { data: exercise, error } = await supabase
        .from("biblioteca_ejercicios")
        .insert({
          profesor_id: user.id,
          parent_id: input.parent_id || null,
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          media_url: input.media_url || null,
          tags: normalizedTags,
          is_template_base: !input.parent_id,
        })
        .select()
        .single();

      if (error || !exercise) throw new Error(`Error al crear: ${error?.message}`);

      if (!input.parent_id && input.variants && input.variants.length > 0) {
        await supabase.from("biblioteca_ejercicios").insert(
          input.variants.map(vName => ({
            profesor_id: user.id,
            parent_id: exercise.id,
            nombre: vName,
            tags: normalizedTags,
            is_template_base: false
          }))
        );
      }

      // Devolvemos el objeto completo para actualización optimista
      return { success: true, exercise };
    },
  }),

  /** Actualiza un ejercicio o crea un Fork si es de sistema */
  updateExercise: defineAction({
    accept: "json",
    input: exerciseLibrarySchema,
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user || !input.id) throw new Error("No autorizado");

      const normalizedTags = Array.from(new Set((input.tags || []).map(t => t.toLowerCase().trim()))).slice(0, 6);

      const { data: existing } = await supabase
        .from("biblioteca_ejercicios")
        .select("profesor_id")
        .eq("id", input.id)
        .single();

      if (!existing) throw new Error("Ejercicio no encontrado");

      // FORKING: Si no es el dueño, creamos una copia privada
      if (existing.profesor_id !== user.id) {
        const { data: fork, error } = await supabase
          .from("biblioteca_ejercicios")
          .insert({
            profesor_id: user.id,
            parent_id: input.id,
            nombre: input.nombre,
            descripcion: input.descripcion || null,
            media_url: input.media_url || null,
            tags: normalizedTags,
            is_template_base: false,
          })
          .select()
          .single();

        if (error) throw new Error(`Error en Fork: ${error.message}`);
        return { success: true, exercise: fork, isFork: true };
      }

      // UPDATE NORMAL
      const { data: updated, error } = await supabase
        .from("biblioteca_ejercicios")
        .update({
          nombre: input.nombre,
          descripcion: input.descripcion || null,
          media_url: input.media_url || null,
          tags: normalizedTags,
        })
        .eq("id", input.id)
        .eq("profesor_id", user.id)
        .select()
        .single();

      if (error) throw new Error(`Error en Update: ${error.message}`);
      return { success: true, exercise: updated };
    },
  }),

  /** Elimina un ejercicio (Solo si es dueño) */
  deleteExercise: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("biblioteca_ejercicios")
        .delete()
        .eq("id", input.id)
        .eq("profesor_id", user.id);

      if (error) throw new Error(error.message);
      return { success: true };
    },
  }),

  /** Alterna el estado de favorito */
  toggleFavorite: defineAction({
    accept: "json",
    input: z.object({ id: z.string().uuid(), isFavorite: z.boolean() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const user = context.locals.user;
      if (!user) throw new Error("No autorizado");

      const { error } = await supabase
        .from("biblioteca_ejercicios")
        .update({ is_favorite: input.isFavorite })
        .eq("id", input.id)
        .or(`profesor_id.eq.${user.id},profesor_id.is.null`);

      if (error) throw new Error(error.message);
      return { success: true };
    },
  }),

  /** Obtiene variantes sugeridas (hermanos o padre) */
  getVariants: defineAction({
    accept: "json",
    input: z.object({ exercise_id: z.string().uuid() }),
    handler: async (input, context) => {
      const supabase = createSupabaseServerClient(context);
      const { data: current } = await supabase
        .from("biblioteca_ejercicios")
        .select("parent_id")
        .eq("id", input.exercise_id)
        .single();

      if (!current) return [];

      const parentId = current.parent_id || input.exercise_id;
      const { data } = await supabase
        .from("biblioteca_ejercicios")
        .select("id, nombre, media_url")
        .or(`parent_id.eq.${parentId},id.eq.${parentId}`)
        .neq("id", input.exercise_id)
        .order("nombre");

      return data || [];
    },
  }),
};
