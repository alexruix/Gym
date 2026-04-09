import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, ArrowLeft, Box, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { blocksCopy } from "@/data/es/profesor/ejercicios";
import { BlockCard } from "@/components/molecules/profesor/ejercicios/BlockCard";
import { BlockForm } from "@/components/molecules/profesor/ejercicios/BlockForm";
import { actions } from "astro:actions";

interface BlockSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (block: any) => void;
  library: any[];
}

/**
 * BlockSearchDialog: Buscador premium de bloques con filtros inteligentes
 * y capacidad de creaciÃ³n inline ("On-the-fly").
 */
export function BlockSearchDialog({
  open,
  onOpenChange,
  onSelect,
  library
}: BlockSearchDialogProps) {
  const [search, setSearch] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    if (open && !isCreating) {
      loadBlocks();
    }
  }, [open, isCreating]);

  const loadBlocks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await actions.profesor.getBlocks();
      if (error) throw error;
      setBlocks(data || []);
    } catch (e) {
      console.error("Error loading blocks:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlocks = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return blocks.filter(b => {
      const matchesSearch = b.nombre.toLowerCase().includes(lowerSearch);
      const matchesFilter = !activeFilter || b.tags?.includes(activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [blocks, search, activeFilter]);

  const handleClose = () => {
    onOpenChange(false);
    setSearch("");
    setActiveFilter(null);
    setIsCreating(true);
  };

  const filters = [
    { id: "Warmup", label: blocksCopy.search.quickFilters.warmup },
    { id: "Fuerza", label: blocksCopy.search.quickFilters.fuerza },
    { id: "Finisher", label: blocksCopy.search.quickFilters.finisher },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-[3rem] border-none shadow-2xl">
        <DialogTitle className="sr-only">{blocksCopy.search.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {blocksCopy.search.description}
        </DialogDescription>

        <div className="pt-8 px-8 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight uppercase leading-none">
                {isCreating ? "Nuevo Bloque" : blocksCopy.search.title}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {isCreating ? "Arma tu secuencia" : `${blocks.length} Bloques disponibles`}
              </p>
            </div>

            <Button
              variant={isCreating ? "ghost" : "industrial"}
              size="sm"
              onClick={() => setIsCreating(!isCreating)}
              className="rounded-xl px-5 text-[10px] font-bold uppercase tracking-widest"
            >
              {isCreating ? (
                <><Box className="w-3.5 h-3.5 mr-2" /> Mis bloques</>
              ) : (
                <><Plus className="w-3.5 h-3.5 mr-2" /> Crear bloque</>
              )}
            </Button>
          </div>

          {!isCreating && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <Input
                    autoFocus
                    placeholder={blocksCopy.list.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-14 h-16 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[24px] font-bold shadow-xl shadow-zinc-950/5 focus-visible:ring-lime-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                      activeFilter === f.id
                        ? "bg-lime-500 border-lime-500 text-zinc-950 shadow-lg shadow-lime-400/20"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-lime-500"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="max-h-[550px] overflow-y-auto p-4 custom-scrollbar bg-zinc-50/20 dark:bg-transparent">
          {isCreating ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BlockForm
                library={library}
                onSuccess={(b) => {
                  onSelect(b);
                  setIsCreating(false);
                  onOpenChange(false);
                }}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          ) : isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-lime-500 animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Accediendo a la biblioteca...</p>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="py-24 text-center space-y-6">
              <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] w-24 h-24 mx-auto flex items-center justify-center border-4 border-dashed border-zinc-200 dark:border-zinc-800">
                <Box className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-300 italic">
                {blocksCopy.list.noResults}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBlocks.map(block => (
                <BlockCard
                  key={block.id}
                  block={block}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
