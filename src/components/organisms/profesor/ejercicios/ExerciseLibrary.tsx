import { useState, useMemo } from "react";
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
import { SplitActionButton } from "@/components/molecules/profesor/core/SplitActionButton";
import { ImportExercisesModal } from "@/components/organisms/profesor/ejercicios/ImportExercisesModal";
import { exerciseLibraryCopy as copy } from "@/data/es/profesor/ejercicios";

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
  const [isImportOpen, setIsImportOpen] = useState(false);

  const sortOptions = [
    { label: "Categorias", value: "etiqueta-asc" },
    { label: "Nombre A-Z", value: "nombre-asc" },
    { label: "Más recientes", value: "fecha-desc" },
  ];

  const hasTagsOrCategories = useMemo(() => exercises.some(ex => ex.tags && ex.tags.length > 0), [exercises]);
  const defaultSort = hasTagsOrCategories ? "etiqueta-asc" : "nombre-asc";

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

  const baseSortLogic = (a: Exercise, b: Exercise, order: string) => {
      if (order === "etiqueta-asc") {
          const tagA = (a.tags && a.tags.length > 0) ? a.tags[0].toLowerCase() : "zzzz";
          const tagB = (b.tags && b.tags.length > 0) ? b.tags[0].toLowerCase() : "zzzz";
          if (tagA !== tagB) return tagA.localeCompare(tagB);
          return a.nombre.localeCompare(b.nombre);
      }
      if (order === "nombre-asc") return a.nombre.localeCompare(b.nombre);
      if (order === "fecha-desc") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
  };

  // Lógica de ordenamiento inyectada al DashboardConsole
  const handleSort = (items: Exercise[], order: string) =>
    [...items].sort((a, b) => baseSortLogic(a, b, order));

  // Helper agrupador de variantes: infiere el orden directamente de la lista filtrada
  const getGroupedExercises = (filteredList: Exercise[]) => {
    const vMap: Record<string, Exercise[]> = {};
    const displayParents: (Exercise & { variantCount: number })[] = [];

    // Map all variants in the system
    exercises.forEach(ex => {
      if (ex.parent_id) {
        if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
        vMap[ex.parent_id].push(ex);
      }
    });

    // Como filteredList YA VIENE ORDENADA por DashboardConsole, 
    // insertamos los padres en el orden exacto en que aparecen sus hijos o ellos mismos.
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

    return {
        displayParents, // Hereda el orden natural del sort activo
        variantsMap: vMap
    };
  };

  const GridRenderer = ({ filtered }: { filtered: Exercise[] }) => {
    const { displayParents, variantsMap } = useMemo(
        () => getGroupedExercises(filtered),
        [filtered, exercises]
    );

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
  };

  return (
    <>
      <ImportExercisesModal 
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />
      <DashboardConsole 
        items={exercises}
        itemLabel="Ejercicios"
        storageKey="ejercicios"
        initialSort={defaultSort}
        searchPlaceholder="Buscar por nombre o categoría..."
        allTags={uniqueTags}
        sortOptions={sortOptions}
        onSort={handleSort}
        renderCreateAction={() => (
          <SplitActionButton 
              createLabel={copy.list.action}
              importLabel="Subir desde Excel"
              createHref="/profesor/ejercicios/new"
              onImportClick={() => setIsImportOpen(true)}
              className="flex-1 md:flex-none h-12 md:h-14"
          />
        )}
        emptyIcon={<Dumbbell className="w-12 h-12" />}
        renderGrid={(filtered) => <GridRenderer filtered={filtered as Exercise[]} />}
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
