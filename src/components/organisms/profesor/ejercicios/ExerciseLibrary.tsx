import { useState, useMemo, useTransition, useEffect } from "react";
import {
  Dumbbell,
  ChevronDown,
  Star,
  Flame,
  User,
  Library,
  Search,
  LayoutGrid,
  List,
  Plus,
  ChevronUp,
  Video
} from "lucide-react";

import { ExerciseCard } from "@/components/molecules/profesor/ejercicios/ExerciseCard";
import { ExerciseLibrarySkeleton } from "@/components/molecules/profesor/ejercicios/ExerciseCardSkeleton";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useExercises } from "@/hooks/profesor/useExercises";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";
import { exerciseLibraryCopy as copy } from "@/data/es/profesor/ejercicios";
import { StandardTable, type TableColumn } from "@/components/organisms/StandardTable";
import { ExerciseActions } from "@/components/molecules/profesor/ejercicios/ExerciseActions";
import type { Exercise } from "@/hooks/profesor/exercises/useLibraryState";



export function ExerciseLibrary({ initialExercises }: { initialExercises: any[] }) {
  const {
    exercises: gridList,
    allFiltered,
    allExercises,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    muscleFilter,
    setMuscleFilter,
    toggleFavorite,
    deleteExercise,
    duplicateExercise
  } = useExercises(initialExercises);

  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [visibleCount, setVisibleCount] = useState(18);

  // Reset pagination when filtering
  useEffect(() => {
    setVisibleCount(18);
  }, [searchQuery, activeFilter, muscleFilter]);

  // Sync local search when global state changes (e.g. clear)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const categories = [
    { id: "todos", label: "Todos", icon: Library },
    { id: "favoritos", label: "Favoritos", icon: Star },
    { id: "top", label: "Top 15", icon: Flame },
    { id: "migym", label: "Master", icon: Library },
    { id: "míos", label: "Propios", icon: User },
  ];

  const muscleGroups = [
    "Abdominales", "Glúteos", "Cuádriceps", "Isquios", "Gemelos", "Pecho", "Espalda", "Hombros", "Tríceps", "Bíceps"
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

    allExercises.forEach(ex => {
      if (ex.parent_id) {
        if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
        vMap[ex.parent_id].push(ex);
      }
    });

    gridList.forEach(ex => {
      const parentId = ex.parent_id || ex.id;
      if (!parentsAdded.has(parentId)) {
        parentsAdded.add(parentId);
        // Buscar el padre real (sin asumir que no tiene parent_id)
        const parentOb = allExercises.find(e => e.id === parentId);

        if (parentOb) {
          parents.push({
            ...parentOb,
            variantCount: vMap[parentOb.id]?.length || 0
          });
        } else {
          // Fallback de seguridad: Si por alguna razón la BD tiene un parent_id huerfano,
          // mostramos el ejercicio original como si fuera un padre para no ocultarlo.
          parents.push({
            ...ex,
            variantCount: vMap[ex.id]?.length || 0
          });
        }
      }
    });

    return { displayParents: parents, variantsMap: vMap };
  }, [gridList, allExercises]);

  // Table Columns Definition
  const columns: TableColumn<Exercise>[] = [
    {
      header: "Nombre",
      render: (ex) => {
        const isMaster = ex.profesor_id === null;
        const hasVideo = !!ex.video_url || ex.media_url?.match(/\.(mp4|webm|ogg|mov)$/i);

        return (
          <div className="flex items-center gap-3">
            {ex.media_url && !ex.media_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shrink-0">
                <img src={ex.media_url} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800">
                {hasVideo ? (
                  <Video className="w-5 h-5 text-lime-500" />
                ) : (
                  <Dumbbell className="w-5 h-5 text-zinc-400" />
                )}
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">

                <span className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{ex.nombre}</span>

                {hasVideo && <Video className="w-3 h-3 text-lime-500/50" />}
              </div>
              {ex.parent_id && (
                <span className="text-[9px] uppercase tracking-tighter text-zinc-400 font-black">Variante</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: "Categoría",
      render: (ex) => (
        <div className="flex flex-wrap gap-1.5">
          {ex.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-200/50 dark:border-zinc-800/50">
              {tag}
            </span>
          ))}
          {ex.tags && ex.tags.length > 3 && (
            <span className="text-[9px] text-zinc-400 font-bold">+{ex.tags.length - 3}</span>
          )}
        </div>
      )
    },
    {
      header: "Descripción",
      render: (ex) => {
        const isMaster = ex.profesor_id === null;
        if (!ex.descripcion) return <span className="text-zinc-300 italic text-xs">Sin descripción</span>;

        return (
          <div className="max-w-[300px]">

            <p className="line-clamp-1 text-xs text-zinc-500">{ex.descripcion}</p>

          </div>
        );
      }
    },
    {
      header: "Acciones",
      align: "right",
      render: (ex) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(ex.id, !ex.is_favorite);
            }}
            className={cn(
              "h-9 w-9 rounded-xl transition-all",
              ex.is_favorite ? "text-lime-500 bg-lime-500/5" : "text-zinc-300 hover:text-zinc-500"
            )}
          >
            <Star className={cn("h-4 w-4", ex.is_favorite && "fill-current")} />
          </Button>
          <ExerciseActions
            exercise={ex}
            onDelete={deleteFlow.setItemToDelete}
            onDuplicate={duplicateExercise}
          />
        </div>
      )
    }
  ];

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
                onClick={() => {
                  startTransition(() => {
                    setActiveFilter(cat.id);
                  });
                }}
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

          {/* View Toggle & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-white dark:bg-zinc-800 shadow-sm text-lime-500" : "text-zinc-400"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  viewMode === "table" ? "bg-white dark:bg-zinc-800 shadow-sm text-lime-500" : "text-zinc-400"
                )}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative group flex-1 md:w-80 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
              <Input
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  startTransition(() => {
                    setSearchQuery(e.target.value);
                  });
                }}
                placeholder={copy.list.searchPlaceholder}
                className="pl-11 h-12 bg-zinc-50 dark:bg-zinc-900 border-transparent rounded-2xl font-bold text-sm focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Muscle Group Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {muscleGroups.map(mg => (
            <button
              key={mg}
              onClick={() => {
                startTransition(() => {
                  setMuscleFilter(muscleFilter === mg ? null : mg);
                });
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap transition-all border",
                muscleFilter === mg
                  ? "bg-lime-500 text-zinc-950 border-lime-500 shadow-md scale-105"
                  : "bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-lime-500/50 hover:bg-lime-500/5"
              )}
            >
              {mg}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Content */}
      {(isLoading && gridList.length === 0) ? (
        <ExerciseLibrarySkeleton />
      ) : (
        <div className={cn(
          "transition-all duration-300",
          isPending ? "opacity-30 blur-[1px] pointer-events-none scale-[0.995]" : "opacity-100 blur-0 scale-100"
        )}>
          {(gridList.length === 0 && allFiltered.length === 0) ? (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                <Dumbbell className="w-16 h-16 text-zinc-200 dark:text-zinc-800" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest">{copy.list.noResults}</h3>
                <p className="text-sm text-zinc-500 font-medium tracking-tight">Probá con otros términos o ajustá los filtros.</p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="pb-32">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {displayParents.slice(0, visibleCount).map((parent) => (
                <div key={parent.id} className="space-y-4 group">
                  <ExerciseCard
                    exercise={parent}
                    onDelete={deleteFlow.setItemToDelete}
                    onToggleFavorite={toggleFavorite}
                    onDuplicate={duplicateExercise}
                    expanded={expandedParents.has(parent.id)}
                    onToggleExpand={() => toggleParent(parent.id)}
                  />

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
              {visibleCount < displayParents.length && (
                <div className="flex justify-center pt-8 pb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setVisibleCount(v => v + 18)}
                    className="border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl px-8 py-6 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-lime-500 hover:border-lime-500 hover:bg-lime-500/5 transition-all w-full md:w-auto"
                  >
                    Cargar Más Ejercicios
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="pb-32 animate-in slide-in-from-bottom-4 duration-500">
              <StandardTable
                data={allFiltered.slice(0, visibleCount)}
                columns={columns}
                entityName="Ejercicios"
                hideSearch={true}
                responsiveMode="scroll"
              />
              {visibleCount < allFiltered.length && (
                <div className="flex justify-center pt-8 pb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setVisibleCount(v => v + 18)}
                    className="border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl px-8 py-6 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-lime-500 hover:border-lime-500 hover:bg-lime-500/5 transition-all w-full md:w-auto"
                  >
                    Cargar Más Ejercicios
                  </Button>
                </div>
              )}
            </div>
          )}
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
