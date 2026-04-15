import React, { useState, useEffect, useMemo } from "react";
import { actions } from "astro:actions";
import {
  Search, Plus, ArrowLeft, Dumbbell,
  Loader2, Check, X, Layers, ChevronDown, Box, Info, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExerciseForm } from "@/components/molecules/profesor/ejercicios/ExerciseForm";
import { BlockForm } from "@/components/molecules/profesor/ejercicios/BlockForm";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
  parent_id?: string | null;
  is_template_base?: boolean;
  profesor_id?: string | null;
}

interface Block {
  id: string;
  nombre: string;
  tipo_bloque: 'superserie' | 'circuito' | 'agrupador';
  vueltas: number;
  descanso_final: number;
  tags?: string[];
  bloques_ejercicios?: any[];
}

type TabMode = "exercises" | "blocks";
type SourceFilter = "all" | "mine" | "migym";
type ViewMode = "list" | "create-exercise" | "create-block" | "edit-block";

interface PlanLibraryPanelProps {
  onSelectExercise: (exerciseId: string) => void;
  onSelectBlock: (blockId: string) => void;
  library?: Exercise[];
  currentExerciseId?: string | null;
  allowCreate?: boolean;
  className?: string;
}

const STORAGE_KEY = "migym_plan_library_tab";

export function PlanLibraryPanel({
  onSelectExercise,
  onSelectBlock,
  library: externalLibrary,
  currentExerciseId = null,
  allowCreate = true,
  className
}: PlanLibraryPanelProps) {
  // --- Estado ---
  const [mode, setMode] = useState<TabMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as TabMode) || "exercises";
    }
    return "exercises";
  });

  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [internalLibrary, setInternalLibrary] = useState<Exercise[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [editingBlockData, setEditingBlockData] = useState<any>(null);

  const library = externalLibrary ?? internalLibrary;

  // --- Efectos ---
  useEffect(() => {
    if (!externalLibrary) fetchLibrary();
    fetchBlocks();
  }, [externalLibrary]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // --- Data Fetching ---
  async function fetchLibrary() {
    setIsLoading(true);
    try {
      const { data } = await actions.profesor.getExerciseLibrary();
      if (data) setInternalLibrary(data as any);
    } catch (err) {
      console.error("[PlanLibraryPanel] Error loading library:", err);
    } finally {
      if (mode === "exercises") setIsLoading(false);
    }
  }

  async function fetchBlocks() {
    if (mode === "blocks") setIsLoading(true);
    try {
      const { data } = await actions.profesor.getBlocks();
      if (Array.isArray(data)) setBlocks(data);
    } catch (err) {
      console.error("[PlanLibraryPanel] Error loading blocks:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Filtering ---
  const { suggestedVariants, parents, variantsMap } = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const suggestedVariants = currentExerciseId
      ? library.filter(ex => ex.parent_id === currentExerciseId && ex.nombre.toLowerCase().includes(lowerSearch))
      : [];

    const suggestedIds = new Set(suggestedVariants.map(v => v.id));
    const vMap: Record<string, Exercise[]> = {};
    const bySource = library.filter(ex => {
      if (sourceFilter === "mine") return ex.profesor_id !== null;
      if (sourceFilter === "migym") return ex.profesor_id === null;
      return true;
    });

    bySource.forEach(ex => {
      if (ex.parent_id) {
        if (!vMap[ex.parent_id]) vMap[ex.parent_id] = [];
        vMap[ex.parent_id].push(ex);
      }
    });

    const parentList = bySource
      .filter(ex => {
        if (ex.parent_id) return false;
        if (ex.id === currentExerciseId) return false;
        if (suggestedIds.has(ex.id)) return false;
        const hasMatchingChild = vMap[ex.id]?.some(c => c.nombre.toLowerCase().includes(lowerSearch));
        return ex.nombre.toLowerCase().includes(lowerSearch) || hasMatchingChild;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    return { suggestedVariants, parents: parentList, variantsMap: vMap };
  }, [library, search, sourceFilter, currentExerciseId]);

  const filteredBlocks = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return blocks.filter(b => b.nombre.toLowerCase().includes(lowerSearch));
  }, [blocks, search]);

  const blockMatchesForDiscovery = useMemo(() => {
    if (mode === "exercises" && !parents.length && search.length > 2) {
      return blocks.filter(b => b.nombre.toLowerCase().includes(search.toLowerCase())).slice(0, 2);
    }
    return [];
  }, [mode, parents, search, blocks]);

  // --- Handlers ---
  const handleSelectExercise = (id: string) => {
    onSelectExercise(id);
    // In a panel, we might NOT want to close it automatically. 
    // PlanForm will handle the UI feedback (pulse/anim).
  };

  const handleSelectBlock = (id: string) => {
    onSelectBlock(id);
  };

  const toggleParent = (parentId: string) => {
    const next = new Set(expandedParents);
    next.has(parentId) ? next.delete(parentId) : next.add(parentId);
    setExpandedParents(next);
  };

  const handleEditBlock = (block: any) => {
    setEditingBlockData(block);
    setView("edit-block");
  };

  const handleCreateSuccess = () => {
    setView("list");
    fetchLibrary();
    fetchBlocks();
  };

  const isFormOpen = view !== "list";

  return (
    <aside className={cn("flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-900 h-full overflow-hidden", className)}>
      {/* --- HEADER --- */}
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="flex items-center justify-between gap-4 mb-6">
          {!isFormOpen && (
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setMode("exercises")}
                className={cn(
                  "px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                  mode === "exercises" ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Ejercicios
              </button>
              <button
                type="button"
                onClick={() => setMode("blocks")}
                className={cn(
                  "px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                  mode === "blocks" ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Bloques
              </button>
            </div>
          )}

          {!isFormOpen && allowCreate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => mode === "exercises" ? setView("create-exercise") : setView("create-block")}
              className="h-10 rounded-2xl border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest shrink-0"
            >
              <Plus className="w-3 h-3 mr-1.5" /> {mode === "exercises" ? "Nuevo" : "Crear"}
            </Button>
          )}
          
          {isFormOpen && (
            <div className="flex items-center gap-2">
               <Box className="w-3.5 h-3.5 text-lime-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Constructor</span>
            </div>
          )}
        </div>

        {!isFormOpen && (
          <div className="space-y-4">
            <div className="relative group">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                search ? "text-lime-500" : "text-zinc-400 group-focus-within:text-lime-500"
              )} />
              <Input
                placeholder={mode === "exercises" ? "Buscar técnica..." : "Buscar protocolo..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm shadow-sm focus-visible:ring-lime-400/20"
              />
            </div>

            {mode === "exercises" && (
              <div className="flex gap-1.5">
                {([
                  { id: "all" as const, label: "Todos" },
                  { id: "mine" as const, label: "Propios" },
                  { id: "migym" as const, label: "MiGym" }
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSourceFilter(tab.id)}
                    className={cn(
                      "px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all border",
                      sourceFilter === tab.id
                        ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent"
                        : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- BODY --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950 pb-20">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-4 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando biblioteca...</span>
          </div>
        ) : view === "create-exercise" ? (
          <div className="p-6">
             <ExerciseForm
                onSuccess={(res) => { handleSelectExercise(res.data.id); handleCreateSuccess(); }}
                onCancel={() => setView("list")}
              />
          </div>
        ) : (view === "create-block" || view === "edit-block") ? (
          <BlockForm
            library={library}
            initialData={view === "edit-block" ? editingBlockData : null}
            onSuccess={handleCreateSuccess}
            onCancel={() => setView("list")}
            onExternalSearch={(onSelect) => {
              // This is a special trick: we stay in BlockForm but show a mini search? 
              // For now, let's just use the Internal Search of BlockForm if needed, 
              // but we already refactored BlockForm to allow external search.
              // For v1 of workspace, BlockForm has its own exercise selector or we go back to list.
              // Logic: BlockForm already handles exercise selection via the library prop.
            }}
          />
        ) : mode === "exercises" ? (
          <div className="p-4 space-y-1">
            {/* Suggested Variants */}
            {suggestedVariants.length > 0 && (
              <div className="mb-4">
                <div className="px-3 flex items-center gap-2 mb-2">
                  <Check className="w-3 h-3 text-fuchsia-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-fuchsia-500">Sugerencias</span>
                </div>
                {suggestedVariants.map(ex => (
                  <ExerciseSelectionRow key={ex.id} ex={ex} isVariant onSelect={handleSelectExercise} />
                ))}
                <div className="mx-3 h-px bg-zinc-100 dark:bg-zinc-900 my-4" />
              </div>
            )}

            {/* Main List */}
            {parents.map(parent => (
              <div key={parent.id} className="space-y-1">
                <ExerciseSelectionRow
                  ex={parent}
                  onSelect={handleSelectExercise}
                  isMiGym={parent.profesor_id === null}
                  variantCount={variantsMap[parent.id]?.length || 0}
                  isExpanded={expandedParents.has(parent.id)}
                  onToggleExpand={() => toggleParent(parent.id)}
                />
                {expandedParents.has(parent.id) && variantsMap[parent.id] && (
                  <div className="pl-6 border-l-2 border-zinc-100 dark:border-zinc-900 ml-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {variantsMap[parent.id].map(variant => (
                      <ExerciseSelectionRow key={variant.id} ex={variant} onSelect={handleSelectExercise} isNested />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {parents.length === 0 && !suggestedVariants.length && (
              <div className="py-20 text-center space-y-4">
                <Dumbbell className="w-12 h-12 text-zinc-100 dark:text-zinc-900 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Sin resultados</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredBlocks.map(block => (
              <BlockSelectionCard
                key={block.id}
                block={block}
                onSelect={() => handleSelectBlock(block.id)}
                onEdit={() => handleEditBlock(block)}
              />
            ))}
            {filteredBlocks.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <Box className="w-12 h-12 text-zinc-100 dark:text-zinc-900 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Biblioteca vacía</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {!isFormOpen && (
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              {mode === "exercises" ? `${library.length} Técnicas` : `${blocks.length} Protocolos`}
           </span>
           <button type="button" onClick={() => fetchLibrary()} className="text-[9px] font-bold uppercase tracking-widest text-lime-500 hover:underline">Sincronizar</button>
        </div>
      )}
    </aside>
  );
}

// --- SUBCOMPONENTS ---

function ExerciseSelectionRow({ ex, onSelect, isVariant, isNested, isMiGym, variantCount, isExpanded, onToggleExpand }: any) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-2xl transition-all group border",
      isVariant ? "bg-fuchsia-500/[0.03] border-fuchsia-500/20 hover:border-fuchsia-500/40" : "bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-800"
    )}>
      <button type="button" onClick={() => onSelect(ex.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border overflow-hidden",
          isVariant ? "bg-zinc-950 border-fuchsia-500/30" : "bg-zinc-100 dark:bg-zinc-900 border-transparent"
        )}>
          {ex.media_url ? (
            <img src={ex.media_url} className="w-full h-full object-cover" />
          ) : (
            <Dumbbell className={cn("w-4 h-4", isVariant ? "text-fuchsia-400" : isMiGym ? "text-lime-500" : "text-zinc-400 group-hover:text-lime-500")} />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "font-bold text-xs tracking-tight truncate",
              isVariant ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-950 dark:text-zinc-100 group-hover:text-lime-500 transition-colors"
            )}>
              {ex.nombre}
            </span>
            {isMiGym && <span className="px-1 py-0.5 bg-lime-500 text-zinc-950 text-[6px] font-black uppercase rounded-[3px] tracking-tighter shrink-0">MiGym</span>}
          </div>
        </div>
      </button>

      {variantCount > 0 && onToggleExpand && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className={cn(
            "px-2 py-1 rounded-lg border text-[8px] font-bold uppercase transition-all flex items-center gap-1",
            isExpanded ? "bg-lime-500 text-zinc-950 border-transparent" : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-lime-500"
          )}
        >
          {variantCount} <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", isExpanded && "rotate-180")} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onSelect(ex.id)}
        className="w-8 h-8 rounded-lg flex items-center justify-center bg-lime-500 text-zinc-950 opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-sm shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

function BlockSelectionCard({ block, onSelect, onEdit }: { block: Block, onSelect: () => void, onEdit: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSuperserie = block.tipo_bloque === 'superserie';
  const isCircuito = block.tipo_bloque === 'circuito';

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group overflow-hidden">
      <div className="flex items-stretch min-h-[80px]">
        <div className={cn(
          "w-1.5 shrink-0 transition-colors",
          isSuperserie ? "bg-fuchsia-500" : isCircuito ? "bg-lime-500" : "bg-zinc-200 dark:bg-zinc-800"
        )} />

        <div className="flex-1 p-4 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-zinc-950 dark:text-white uppercase tracking-tight truncate">
                {block.nombre}
              </h4>
               <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="p-1.5 text-zinc-300 hover:text-lime-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="flex items-center gap-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Layers className={cn("w-3 h-3 transition-colors", isExpanded ? "text-lime-500" : "text-zinc-400")} />
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                  {block.bloques_ejercicios?.length || 0} Ex
                </span>
                <ChevronDown className={cn("w-2.5 h-2.5 transition-transform duration-300", isExpanded ? "rotate-180 text-lime-500" : "text-zinc-300")} />
              </button>
              
              {isCircuito && (
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  {block.vueltas}v
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onSelect}
            className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-lime-500 hover:text-zinc-950 transition-all active:scale-95 shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50 space-y-1">
            {block.bloques_ejercicios?.sort((a:any, b:any) => (a.orden || 0) - (b.orden || 0)).map((item: any, idx: number) => (
              <div key={item.id} className="flex items-center justify-between py-1.5">
                <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-300 truncate uppercase tracking-tight max-w-[140px]">
                  {item.biblioteca_ejercicios?.nombre || "Ejercicio"}
                </span>
                <span className="text-[9px] font-black text-lime-600 tabular-nums">
                  {item.series}×{item.reps_target}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
