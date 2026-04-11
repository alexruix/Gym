import { useState, useMemo } from "react";
import { 
  Dumbbell, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Flame, 
  User, 
  Library, 
  Plus, 
  Search,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react";

import { ExerciseCard } from "@/components/molecules/profesor/ejercicios/ExerciseCard";
import { ExerciseLibrarySkeleton } from "@/components/molecules/profesor/ejercicios/ExerciseCardSkeleton";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useExercises } from "@/hooks/profesor/useExercises";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";
import { exerciseLibraryCopy as copy } from "@/data/es/profesor/ejercicios";

interface Exercise {
  id: string;
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
}

export function ExerciseLibrary({ initialExercises }: { initialExercises: any[] }) {
  const {
    exercises: filtered,
    allExercises,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    toggleFavorite,
    deleteExercise,
    duplicateExercise
  } = useExercises(initialExercises);

  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const categories = [
    { id: "todos", label: "Todos", icon: Library },
    { id: "favoritos", label: "Favoritos", icon: Star },
    { id: "top", label: "Top 15", icon: Flame },
    { id: "migym", label: "Master", icon: Library },
    { id: "míos", label: "Propios", icon: User },
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

  const deleteFlow = useDeleteWithConfirm<Exercise>({
    onDelete: async (ex) => {
      await deleteExercise(ex.id);
    },
    successMsg: "Ejercicio eliminado",
  });

  // Grouping logic for Grid view
  const { displayParents, variantsMap } = useMemo(() => {
    const vMap: Record<string, Exercise[]> = {};
    const parents: (Exercise & { variantCount: number })[] = [];
    const parentsAdded = new Set<string>();

    // 1. Build variant map from ALL available exercises
    allExercises.forEach(ex => {
      if (ex.parent_id) {
        if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
        vMap[ex.parent_id].push(ex);
      }
    });

    // 2. Determine which parents to show based on filtered list
    filtered.forEach(ex => {
      const parentId = ex.parent_id || ex.id;
      if (!parentsAdded.has(parentId)) {
        parentsAdded.add(parentId);
        const parentOb = allExercises.find(e => e.id === parentId && !e.parent_id);
        if (parentOb) {
          parents.push({
            ...parentOb,
            variantCount: vMap[parentOb.id]?.length || 0
          });
        }
      }
    });

    return { displayParents: parents, variantsMap: vMap };
  }, [filtered, allExercises]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* 1. Gabinete: Categorías & Search */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 -mx-4 px-4 py-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border-2",
                  activeFilter === cat.id
                    ? "bg-zinc-950 text-white border-zinc-950 dark:bg-lime-500 dark:text-zinc-950 dark:border-lime-500 shadow-xl"
                    : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                )}
              >
                <cat.icon className={cn("w-3.5 h-3.5", activeFilter === cat.id ? "animate-pulse" : "")} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input Industrial */}
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={copy.list.searchPlaceholder}
              className="pl-11 h-12 bg-zinc-50 dark:bg-zinc-900 border-transparent rounded-2xl font-bold text-sm focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* 2. Content Grid */}
      {isLoading && filtered.length === 0 ? (
        <ExerciseLibrarySkeleton />
      ) : filtered.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
            <Dumbbell className="w-16 h-16 text-zinc-200 dark:text-zinc-800" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest">{copy.list.noResults}</h3>
            <p className="text-sm text-zinc-500 font-medium tracking-tight">Probá con otros términos o ajustá los filtros.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pb-32">
          {displayParents.map((parent) => (
            <div key={parent.id} className="space-y-4 group">
              <div className="flex items-start gap-2 h-full">
                <div className="flex-1 h-full">
                  <ExerciseCard
                    exercise={parent}
                    onDelete={deleteFlow.setItemToDelete}
                    onToggleFavorite={toggleFavorite}
                    onDuplicate={duplicateExercise}
                  />
                </div>
                {parent.variantCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "mt-10 md:mt-12 h-10 w-10 shrink-0 rounded-2xl border transition-all duration-500 backdrop-blur-sm",
                      expandedParents.has(parent.id) 
                        ? "bg-lime-500 text-zinc-900 border-lime-500 shadow-xl scale-110" 
                        : "bg-white/50 dark:bg-zinc-900/50 text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:scale-105"
                    )}
                    onClick={() => toggleParent(parent.id)}
                  >
                    {expandedParents.has(parent.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                )}
              </div>
              
              {/* Variants Dropdown */}
              {expandedParents.has(parent.id) && variantsMap[parent.id] && (
                <div className="pl-6 md:pl-10 space-y-4 border-l-2 border-lime-500/20 animate-in slide-in-from-top-4 duration-500">
                  {variantsMap[parent.id].map(variant => (
                    <ExerciseCard
                      key={variant.id}
                      exercise={variant}
                      onDelete={deleteFlow.setItemToDelete}
                      onToggleFavorite={toggleFavorite}
                      onDuplicate={duplicateExercise}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. Global Actions (PWA FAB) */}
      <a
        href="/profesor/ejercicios/new"
        className="fixed bottom-10 right-8 z-50 bg-zinc-950 dark:bg-lime-500 text-white dark:text-zinc-950 w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center transition-all active:scale-95 hover:scale-110 border-4 border-white dark:border-zinc-950 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-lime-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Plus className="relative w-8 h-8 transition-transform group-hover:rotate-90" strokeWidth={3} />
      </a>

      {/* Delete Dialog */}
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
    </div>
  );
}
