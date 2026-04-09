import { useState, useMemo } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { Dumbbell, ChevronDown, ChevronUp, Star, Flame, User, Library, Plus } from "lucide-react";

import { ExerciseCard } from "@/components/molecules/profesor/ejercicios/ExerciseCard";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";
import { useUniqueTags } from "@/hooks/useUniqueTags";
import { exerciseLibraryCopy as copy } from "@/data/es/profesor/ejercicios";

interface Exercise {
  id: string;
  name: string; // Required by BaseEntity
  nombre: string;
  descripcion: string | null;
  media_url: string | null;
  tags?: string[];
  parent_id?: string | null;
  is_template_base?: boolean;
  profesor_id?: string | null;
  is_favorite?: boolean;
  usage_count?: number;
  created_at: string;
  createdAt: string; // Required by BaseEntity
}

export function ExerciseLibrary({ initialExercises }: { initialExercises: any[] }) {
  const [exercises, setExercises] = useState<Exercise[]>(
    initialExercises.map(ex => ({ 
      ...ex, 
      name: ex.nombre, 
      createdAt: ex.created_at 
    }))
  );
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState("todos"); // 'todos' | 'favoritos' | 'top' | 'migym' | 'míos'

  const categories = [
    { id: "todos", label: "Todos", icon: Library },
    { id: "favoritos", label: "Favoritos", icon: Star },
    { id: "top", label: "Top 15", icon: Flame },
    { id: "migym", label: "Master", icon: Library },
    { id: "míos", label: "Propios", icon: User },
  ];

  const sourceFilteredExercises = useMemo(() => {
    let list = [...exercises];
    if (sourceFilter === "favoritos") list = list.filter(ex => ex.is_favorite);
    if (sourceFilter === "top") list = list.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 15);
    if (sourceFilter === "migym") list = list.filter(ex => ex.profesor_id === null);
    if (sourceFilter === "míos") list = list.filter(ex => ex.profesor_id !== null);
    return list;
  }, [exercises, sourceFilter]);

  const toggleParent = (parentId: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    // Optimistic UI - preserving BaseEntity fields
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, is_favorite: isFavorite } : ex));
    
    const { error } = await actions.profesor.toggleFavoriteExercise({ id, isFavorite });
    if (error) {
      toast.error("Error al actualizar favorito");
      setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, is_favorite: !isFavorite } : ex));
    } else {
      toast.success(isFavorite ? "⭐ Agregado a favoritos" : "Quitado de favoritos");
    }
  };

  const handleDuplicate = async (id: string) => {
    const original = exercises.find(e => e.id === id);
    if (!original) return;

    toast.loading("Duplicando ejercicio...");
    const { data: result, error } = await actions.profesor.createExercise({
      nombre: `${original.nombre} (Copia)`,
      descripcion: original.descripcion || "",
      media_url: original.media_url || "",
      tags: original.tags || [],
      parent_id: original.id // Se vuelve variante del original
    });

    toast.dismiss();
    if (error) {
       toast.error("Error al duplicar");
    } else if (result?.success) {
       toast.success("✅ Ejercicio duplicado");
       window.location.reload();
    }
  };

  const deleteFlow = useDeleteWithConfirm<Exercise>({
    onDelete: async (ex) => {
      const { data: result, error } = await actions.profesor.deleteExercise({ id: ex.id });
      if (error) throw new Error(error.message);
      if (result?.success) {
        setExercises((prev) => prev.filter((e) => e.id !== ex.id));
      }
    },
    successMsg: "Ejercicio eliminado",
  });

  const getGroupedExercises = (filteredList: Exercise[]) => {
    const vMap: Record<string, Exercise[]> = {};
    const displayParents: (Exercise & { variantCount: number })[] = [];

    exercises.forEach(ex => {
      if (ex.parent_id) {
        if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
        vMap[ex.parent_id].push(ex);
      }
    });

    const parentsAdded = new Set<string>();

    filteredList.forEach(ex => {
      const parentId = ex.parent_id || ex.id;
      if (!parentsAdded.has(parentId)) {
        parentsAdded.add(parentId);
        const parentOb = exercises.find(e => e.id === parentId && !e.parent_id);
        if (parentOb) {
          displayParents.push({
            ...parentOb,
            variantCount: vMap[parentOb.id]?.length || 0
          });
        }
      }
    });

    return { displayParents, variantsMap: vMap };
  };

  const GridRenderer = ({ filtered, search }: { filtered: Exercise[], search: string }) => {
    const { displayParents, variantsMap } = useMemo(
      () => getGroupedExercises(filtered),
      [filtered, exercises]
    );
    
    const effectivelyExpanded = useMemo(() => {
      if (!search) return expandedParents;
      const autoExpanded = new Set(expandedParents);
      displayParents.forEach(p => autoExpanded.add(p.id));
      return autoExpanded;
    }, [expandedParents, search, displayParents]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-32">
        {displayParents.map((parent) => (
          <div key={parent.id} className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <ExerciseCard
                  exercise={parent}
                  onDelete={(ex) => deleteFlow.setItemToDelete({ ...ex, nombre: ex.nombre } as any)}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicate}
                />
              </div>
              {parent.variantCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mt-8 md:mt-12 h-10 w-10 md:h-12 md:w-12 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all",
                    effectivelyExpanded.has(parent.id) ? "bg-lime-500 text-zinc-900 border-lime-500 shadow-lg" : "bg-white dark:bg-zinc-900 text-zinc-400"
                  )}
                  onClick={() => toggleParent(parent.id)}
                >
                  {effectivelyExpanded.has(parent.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              )}
            </div>
            {effectivelyExpanded.has(parent.id) && variantsMap[parent.id] && (
              <div className="pl-4 md:pl-10 border-l-2 border-zinc-100 dark:border-zinc-800 py-1 space-y-3 animate-in slide-in-from-top-2 duration-300">
                {variantsMap[parent.id].map(variant => (
                  <ExerciseCard
                    key={variant.id}
                    exercise={variant}
                    onDelete={(ex) => deleteFlow.setItemToDelete({ ...ex, nombre: ex.nombre } as any)}
                    onToggleFavorite={handleToggleFavorite}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Category Pills - Sticky PWA Style */}
      <div className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 -mx-4 px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSourceFilter(cat.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2",
              sourceFilter === cat.id
                ? "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white shadow-lg"
                : "bg-white dark:bg-zinc-900 text-zinc-400 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            )}
          >
            <cat.icon className={cn("w-3.5 h-3.5", sourceFilter === cat.id ? "animate-pulse" : "")} />
            {cat.label}
          </button>
        ))}
      </div>

      <DashboardConsole
        items={sourceFilteredExercises}
        itemLabel="Ejercicios"
        storageKey="ejercicios"
        initialSort="nombre-asc"
        searchPlaceholder="Buscar por nombre o categoría..."
        onSort={(items, order) => [...items].sort((a, b) => {
          if (order === "nombre-asc") return a.nombre.localeCompare(b.nombre);
          if (order === "fecha-desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return 0;
        })}
        renderCreateAction={() => null} 
        emptyIcon={<Dumbbell className="w-12 h-12" />}
        renderGrid={(filtered, controllers) => (
          <GridRenderer
            filtered={filtered as Exercise[]}
            search={controllers.search}
          />
        )}
        renderTable={() => (
           <div className="py-20 text-center text-zinc-400 italic font-medium">
             La vista de tabla se habilitará próximamente.
           </div>
        )}
      />

      {/* FAB - Global Quick Action */}
      <a
        href="/profesor/ejercicios/new"
        className="fixed bottom-10 right-6 z-50 bg-zinc-950 dark:bg-lime-500 text-white dark:text-zinc-950 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 hover:scale-110 border-4 border-white dark:border-zinc-950 group"
      >
        <Plus className="w-8 h-8 transition-transform group-hover:rotate-90" strokeWidth={3} />
      </a>

      <DeleteConfirmDialog
        isOpen={!!deleteFlow.itemToDelete}
        onOpenChange={(open) => !open && deleteFlow.clearItem()}
        onConfirm={deleteFlow.handleConfirm}
        isDeleting={deleteFlow.isPending}
        title="Eliminar ejercicio"
        description={
          <>
            ¿Estás seguro de que querés eliminar <span className="font-bold text-zinc-900 dark:text-zinc-100">"{deleteFlow.itemToDelete?.nombre}"</span>? Esta acción no se puede deshacer.
          </>
        }
      />
    </>
  );
}
