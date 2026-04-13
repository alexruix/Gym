import { z } from "zod";
import { defineAction } from "astro:actions";
import { createSupabaseServerClient } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { exerciseLibrarySchema } from "@/lib/validators";
import { baseExercises } from "@/data/es/profesor/biblioteca-base";

let hasSynced = false;

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

      const normalizeStr = (str: string) => 
        str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";


      // 1. SILENT SEEDING & SMART SYNC (Una vez por instancia, NON-BLOCKING)
      if (!hasSynced) {
        hasSynced = true;
        Promise.resolve().then(async () => {
          const { data: rawSystemItems } = await supabaseAdmin
            .from("biblioteca_ejercicios")
            .select("*")
            .is("profesor_id", null);

          const systemItems = (rawSystemItems || []) as any[];
          
          // Mapa por nombre normalizado para evitar colisiones por acentos
          const dbMap = new Map<string, any>();
          systemItems.forEach(item => {
            const normName = normalizeStr(item.nombre);
            if (!dbMap.has(normName) || item.parent_id === null) {
              dbMap.set(normName, item);
            }
          });

          let needsSync = false;

          // Detección de cambios rápida
          for (const ex of baseExercises) {
            const dbEx = dbMap.get(normalizeStr(ex.nombre));
            if (!dbEx) { needsSync = true; break; }
            const exTags = ((ex as any).tags || []) as string[];
            if (
              dbEx.descripcion !== (ex.descripcion || null) ||
              dbEx.media_url !== (ex.media_url || null) ||
              dbEx.video_url !== (ex.video_url || null) ||
              JSON.stringify((dbEx.tags || []).sort()) !== JSON.stringify([...exTags].sort())
            ) {
              needsSync = true;
              break;
            }
          }

          if (needsSync || systemItems.length === 0) {
            console.log("[Smart Sync] Actualizando catálogo base...");
            for (const ex of baseExercises) {
              const { variants, category, ...parentData } = (ex as any);
              const dbEx = dbMap.get(normalizeStr(ex.nombre));
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
                const variantData = variants as any[];
                const variantNamesNorm = new Set(variantData.map(v => normalizeStr(v.nombre)));

                // Encontrar ejercicios en la DB que deberían ser variantes de este padre
                const toUpdate = systemItems.filter(v => {
                   const normV = normalizeStr(v.nombre);
                   return variantNamesNorm.has(normV) && v.parent_id !== parentId;
                });

                const existingInDbNorm = new Set(
                  systemItems.filter(v => v.parent_id === parentId).map(v => normalizeStr(v.nombre))
                );

                const toInsert = variantData.filter(v =>
                  !existingInDbNorm.has(normalizeStr(v.nombre)) &&
                  !toUpdate.some(tu => normalizeStr(tu.nombre) === normalizeStr(v.nombre))
                );

                if (toUpdate.length > 0) {
                  await (supabaseAdmin.from("biblioteca_ejercicios") as any)
                    .update({ parent_id: parentId, is_template_base: false })
                    .in("id", toUpdate.map(tu => tu.id));
                }

                if (toInsert.length > 0) {
                  await (supabaseAdmin.from("biblioteca_ejercicios") as any).insert(
                    toInsert.map(v => ({
                      nombre: v.nombre,
                      descripcion: v.descripcion || null,
                      media_url: v.media_url || null,
                      video_url: v.video_url || null,
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
        }).catch(err => console.error("[Smart Sync Error]", err));
      }

      // 2. FETCH UNIFICADO
      const { data, error } = await supabase
        .from("biblioteca_ejercicios")
        .select("*, is_favorite, usage_count")
        .or(`profesor_id.eq.${user.id},profesor_id.is.null`)
        .order("nombre", { ascending: true });

      if (error) throw new Error(`Error al sincronizar biblioteca: ${error.message}`);

      const allItems = (data || []) as any[];
      const itemMap = new Map<string, any>(allItems.map(item => [item.id, item]));

      // 3. FILTRADO DE SEGURIDAD (Nombres válidos del archivo base)
      const validNames = new Set<string>();
      baseExercises.forEach(ex => {
        validNames.add(normalizeStr(ex.nombre));
        (ex.variants || []).forEach((v: any) => validNames.add(normalizeStr(v.nombre)));
      });

      const filteredItems = allItems.filter(item => {
        // Si es un ejercicio propio, siempre es válido
        if (item.profesor_id !== null) return true;

        // Si es de sistema, su nombre debe estar en el catálogo maestro
        return validNames.has(normalizeStr(item.nombre));
      });

      console.log(`[Diagnostic] DB Items: ${allItems.length} | Filtered: ${filteredItems.length}`);
      
      return filteredItems;
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
          video_url: input.video_url || null,
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
            video_url: input.video_url || null,
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
          video_url: input.video_url || null,
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
