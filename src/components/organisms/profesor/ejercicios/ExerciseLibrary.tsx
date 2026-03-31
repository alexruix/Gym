import { useState, useMemo } from "react";
import { actions } from "astro:actions";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { 
  Search, 
  Dumbbell, 
  PlaySquare, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  ListFilter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExerciseForm } from "@/components/molecules/profesor/ejercicios/ExerciseForm";

interface Exercise {
  id: string;
  nombre: string;
  descripcion: string | null;
  media_url: string | null;
  created_at: string;
}

export function ExerciseLibrary({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [search, setSearch] = useState("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${nombre}"?`)) return;
    
    try {
      const { data: result, error } = await actions.profesor.deleteExercise({ id });
      if (error) throw new Error(error.message);
      
      if (result?.success) {
        toast.success(result.mensaje);
        setExercises(exercises.filter(ex => ex.id !== id));
      }
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el ejercicio");
    }
  };

  const filteredExercises = useMemo(() => {
    if (!search) return exercises;
    return exercises.filter((ex) =>
      ex.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [exercises, search]);

  return (
    <div className="space-y-6">
      {/* Search Bar - Gestalt: Similarity with StudentList */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white dark:bg-zinc-950/20 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm gap-4">
        <div className="relative flex-1 max-w-lg w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
          <Input 
            placeholder={exerciseLibraryCopy.list.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl font-medium focus:ring-2 focus:ring-lime-400/20 w-full"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl w-full md:w-auto justify-center">
           <ListFilter className="w-4 h-4 text-zinc-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
             {filteredExercises.length} {filteredExercises.length === 1 ? 'Resultado' : 'Resultados'}
           </span>
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="py-20 text-center space-y-4">
            <Dumbbell className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
              {exerciseLibraryCopy.list.noResults}
            </p>
        </div>
      ) : (
        /* Gestalt: Similarity & Grid Architecture */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((ex) => (
            <Card 
              key={ex.id} 
              className="p-0 border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 overflow-hidden group hover:border-lime-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-lime-400/5 relative flex flex-col min-h-[180px]"
            >
              {/* Card Header Area */}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex justify-between items-start gap-4">
                   <h4 className="font-bold text-lg text-zinc-950 dark:text-zinc-50 leading-none group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                      {ex.nombre}
                   </h4>
                   <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {ex.media_url && (
                          <div className="bg-lime-400/10 text-lime-600 p-2 rounded-lg border border-lime-400/10">
                            <PlaySquare className="w-4 h-4" />
                          </div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-2">
                              <DropdownMenuItem 
                                onClick={() => setEditingExercise(ex)} 
                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 cursor-pointer focus:bg-lime-400 focus:text-zinc-950 py-2.5"
                               >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 cursor-pointer focus:bg-red-500 focus:text-white text-red-500 py-2.5"
                                onClick={() => handleDelete(ex.id, ex.nombre)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                   </div>
                </div>
                
                {ex.descripcion && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-normal">
                    {ex.descripcion}
                  </p>
                )}
              </div>

              {/* Card Footer Gestalt: Continuity */}
              <div className="px-5 py-4 bg-zinc-50/50 dark:bg-white/[0.02] border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-sm" />
                   {new Date(ex.created_at).toLocaleDateString("es-AR", { month: 'short', year: 'numeric' })}
                </div>
                <Dumbbell className="w-3.5 h-3.5 opacity-40" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingExercise} onOpenChange={(open) => !open && setEditingExercise(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-8 border-zinc-200 dark:border-zinc-800">
          <DialogHeader className="mb-4">
             <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
               <Pencil className="w-6 h-6 text-lime-500" />
               Editar Ejercicio
             </DialogTitle>
          </DialogHeader>
          {editingExercise && (
            <ExerciseForm 
              initialValues={editingExercise} 
              onSuccess={(res) => {
                setExercises(exercises.map(ex => ex.id === editingExercise.id ? { 
                    ...ex, 
                    nombre: ex.nombre, // Result contains updated data
                    ...res.data 
                } : ex));
                setEditingExercise(null);
                // Simple state reload for now, ideally update from res
                window.location.reload(); 
              }}
              onCancel={() => setEditingExercise(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
