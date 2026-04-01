import { useState, useMemo } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { Dumbbell } from "lucide-react";

import { SearchHeader } from "@/components/molecules/SearchHeader";
import { ExerciseCard } from "@/components/molecules/profesor/ejercicios/ExerciseCard";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { EmptyState } from "@/components/atoms/EmptyState";

interface Exercise {
  id: string;
  nombre: string;
  descripcion: string | null;
  media_url: string | null;
  tags?: string[];
  created_at: string;
}

export function ExerciseLibrary({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [search, setSearch] = useState("");
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!exerciseToDelete) return;
    
    setIsDeleting(true);
    try {
      const { data: result, error } = await actions.profesor.deleteExercise({ id: exerciseToDelete.id });
      if (error) throw new Error(error.message);
      
      if (result?.success) {
        toast.success(result.mensaje);
        setExercises(exercises.filter((ex) => ex.id !== exerciseToDelete.id));
        setExerciseToDelete(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar ejercicio");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExercises = useMemo(() => {
    if (!search) return exercises;
    const lowerSearch = search.toLowerCase();
    return exercises.filter((ex) =>
      ex.nombre.toLowerCase().includes(lowerSearch) ||
      ex.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
    );
  }, [exercises, search]);

  return (
    <div className="space-y-6">
      <SearchHeader 
        value={search}
        onChange={setSearch}
        count={filteredExercises.length}
        label="Ejercicios"
        placeholder="Buscar por nombre o etiqueta..."
      />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex) => (
          <ExerciseCard 
            key={ex.id} 
            exercise={ex} 
            onDelete={setExerciseToDelete}
          />
        ))}
      </div>

      {exercises.length === 0 && (
        <EmptyState 
            title="No hay ejercicios"
            description="Comenzá creando tu primer ejercicio en la biblioteca."
            icon={<Dumbbell className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        isOpen={!!exerciseToDelete}
        onOpenChange={(open) => !open && setExerciseToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Eliminar Ejercicio"
        description={
            <>
                ¿Estás seguro de que querés eliminar <span className="font-bold text-zinc-900 dark:text-zinc-100">"{exerciseToDelete?.nombre}"</span>? Esta acción no se puede deshacer.
            </>
        }
      />
    </div>
  );
}
