import { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { Dumbbell, ChevronDown, ChevronUp } from "lucide-react";

import { ExerciseCard } from "@/components/molecules/profesor/ejercicios/ExerciseCard";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";
import { useUniqueTags } from "@/hooks/useUniqueTags";

interface Exercise {
  id: string;
  name: string; // Alias de 'nombre' para compatibilidad con BaseEntity
  nombre: string;
  descripcion: string | null;
  media_url: string | null;
  tags?: string[];
  parent_id?: string | null;
  is_template_base?: boolean;
  created_at: string;
}

export function ExerciseLibrary({ initialExercises }: { initialExercises: Exercise[] }) {
  // Aseguramos compatibilidad con BaseEntity (name = nombre)
  const [exercises, setExercises] = useState<Exercise[]>(
    initialExercises.map(ex => ({ ...ex, name: ex.nombre }))
  );
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const sortOptions = [
    { label: "Nombre A-Z", value: "nombre-asc" },
    { label: "Más Recientes", value: "fecha-desc" },
  ];

  const toggleParent = (parentId: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  // Hooks Core
  const uniqueTags = useUniqueTags(exercises, (ex) => ex.tags);
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

  // Lógica de ordenamiento inyectada al DashboardConsole
  const handleSort = (items: Exercise[], order: string) =>
    [...items].sort((a, b) => {
      if (order === "nombre-asc") return a.nombre.localeCompare(b.nombre);
      if (order === "fecha-desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  // Helper agrupador de variantes: respeta la lista filtrada actual
  const getGroupedExercises = (filteredList: Exercise[], sortOrder: string) => {
    const vMap: Record<string, Exercise[]> = {};
    const displayParents: (Exercise & { variantCount: number })[] = [];

    // Map all variants in the system
    exercises.forEach(ex => {
      if (ex.parent_id) {
        if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
        vMap[ex.parent_id].push(ex);
      }
    });

    // Strategy: Show a parent if IT matches OR if ANY of its children match
    const matchingIds = new Set(filteredList.map(ex => ex.id));
    
    // Identificamos qué padres deben mostrarse
    const parentsToShow = new Set<string>();
    exercises.forEach(ex => {
        if (!ex.parent_id && matchingIds.has(ex.id)) {
            parentsToShow.add(ex.id);
        } else if (ex.parent_id && matchingIds.has(ex.id)) {
            parentsToShow.add(ex.parent_id);
        }
    });

    exercises.filter(ex => !ex.parent_id && parentsToShow.has(ex.id)).forEach(parent => {
        displayParents.push({
            ...parent,
            variantCount: vMap[parent.id]?.length || 0
        });
    });

    return {
        displayParents: displayParents.sort((a, b) => {
            if (sortOrder === "nombre-asc") return a.nombre.localeCompare(b.nombre);
            if (sortOrder === "fecha-desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return 0;
        }),
        variantsMap: vMap
    };
  };

  return (
    <>
      <DashboardConsole 
        items={exercises}
        itemLabel="Ejercicios"
        storageKey="ejercicios"
        searchPlaceholder="Buscar por nombre o #tag..."
        allTags={uniqueTags}
        sortOptions={sortOptions}
        onSort={handleSort}
        onCreateClick={() => window.location.href = "/profesor/ejercicios/new"}
        emptyIcon={<Dumbbell className="w-12 h-12" />}
        renderGrid={(filtered) => {
            const { displayParents, variantsMap } = getGroupedExercises(filtered as Exercise[], "nombre-asc");
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayParents.map((parent) => (
                        <div key={parent.id} className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <ExerciseCard 
                                        exercise={parent} 
                                        onDelete={(ex) => deleteFlow.setItemToDelete({ ...ex, name: ex.nombre })}
                                    />
                                </div>
                                {parent.variantCount > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className={cn(
                                            "mt-6 h-12 w-12 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all",
                                            expandedParents.has(parent.id) ? "bg-lime-400 text-zinc-900 border-lime-500" : "bg-white dark:bg-zinc-900 text-zinc-400"
                                        )}
                                        onClick={() => toggleParent(parent.id)}
                                    >
                                        {expandedParents.has(parent.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </Button>
                                )}
                            </div>
                            {expandedParents.has(parent.id) && variantsMap[parent.id] && (
                                <div className="pl-6 md:pl-10 border-l-2 border-zinc-100 dark:border-zinc-800 py-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    {variantsMap[parent.id].map(variant => (
                                        <ExerciseCard 
                                            key={variant.id} 
                                            exercise={variant} 
                                            onDelete={(ex) => deleteFlow.setItemToDelete({ ...ex, name: ex.nombre })}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }}
        renderTable={(filtered) => (
            <div className="text-center py-20 text-zinc-400 font-medium italic bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                La vista de tabla para ejercicios llegará pronto. <br/> Por ahora, usá la vista de grilla para gestionar tus variantes.
            </div>
        )}
      />

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
