import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { exerciseLibrarySchema } from "@/lib/validators";
import type { z } from "zod";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { Plus, Search, Dumbbell, PlaySquare, CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FormValues = z.infer<typeof exerciseLibrarySchema>;

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseLibrarySchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      media_url: "",
    },
  });

  const onOpenCreate = () => {
    setEditingExercise(null);
    form.reset({
      nombre: "",
      descripcion: "",
      media_url: "",
    });
    setIsDialogOpen(true);
  };

  const onOpenEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    form.reset({
      id: ex.id,
      nombre: ex.nombre,
      descripcion: ex.descripcion || "",
      media_url: ex.media_url || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      if (editingExercise) {
        // UPDATE
        const { data: result, error } = await actions.profesor.updateExercise(data);
        if (error) throw new Error(error.message);
        
        if (result?.success) {
          toast.success(result.mensaje);
          setExercises(exercises.map(ex => ex.id === editingExercise.id ? { 
            ...ex, 
            nombre: data.nombre, 
            descripcion: data.descripcion || null, 
            media_url: data.media_url || null 
          } : ex));
          setIsDialogOpen(false);
        }
      } else {
        // CREATE
        const { data: result, error } = await actions.profesor.createExercise(data);
        if (error) throw new Error(error.message);
        
        if (result?.success) {
          toast.success(result.mensaje);
          const newEx: Exercise = {
            id: result.exercise_id,
            nombre: data.nombre,
            descripcion: data.descripcion || null,
            media_url: data.media_url || null,
            created_at: new Date().toISOString(),
          };
          setExercises([newEx, ...exercises]);
          setIsDialogOpen(false);
          form.reset();
        }
      }
    } catch (err: any) {
      toast.error(err.message || exerciseLibraryCopy.form.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    
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
    <div className="space-y-8">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder={exerciseLibraryCopy.list.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button 
          onClick={onOpenCreate}
          className="font-bold bg-lime-400 hover:bg-lime-500 text-zinc-950 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          {exerciseLibraryCopy.list.action}
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? "Editar Ejercicio" : exerciseLibraryCopy.form.title}
              </DialogTitle>
              <DialogDescription>
                {editingExercise ? "Modificá los detalles del ejercicio seleccionado." : exerciseLibraryCopy.form.description}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest">{exerciseLibraryCopy.form.labels.nombre}</FormLabel>
                      <FormControl>
                        <Input placeholder={exerciseLibraryCopy.form.placeholders.nombre} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest">{exerciseLibraryCopy.form.labels.descripcion}</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                          placeholder={exerciseLibraryCopy.form.placeholders.descripcion}
                          maxLength={1000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="media_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest">{exerciseLibraryCopy.form.labels.mediaUrl}</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder={exerciseLibraryCopy.form.placeholders.mediaUrl} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {exerciseLibraryCopy.form.actions.cancel}
                  </Button>
                  <Button type="submit" disabled={isPending} className="bg-lime-400 text-zinc-950 hover:bg-lime-500 font-bold">
                    {isPending ? exerciseLibraryCopy.form.actions.submitting : (editingExercise ? "Guardar cambios" : exerciseLibraryCopy.form.actions.submit)}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* EMPTY STATE */}
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="relative w-48 h-32 mb-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-1 p-2 opacity-50">
               {Array.from({length: 12}).map((_, i) => (
                 <div key={i} className={`rounded-sm ${i === 2 || i === 5 || i === 8 ? 'bg-lime-200 dark:bg-lime-900/50' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
               ))}
             </div>
             
             <div className="relative z-10 bg-white dark:bg-zinc-900 shadow-sm p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
               <CalendarDays className="w-8 h-8 text-lime-500 mb-1" />
               <div className="h-1.5 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
             </div>
          </div>

          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
            {exerciseLibraryCopy.emptyState.title}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 text-base leading-relaxed">
            {exerciseLibraryCopy.emptyState.description}
          </p>
          <Button onClick={onOpenCreate} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200">
            {exerciseLibraryCopy.emptyState.action}
          </Button>
        </div>
      ) : (
        /* GRID DE EJERCICIOS */
        <>
          {filteredExercises.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
              {exerciseLibraryCopy.list.noResults}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((ex) => (
                <Card 
                  key={ex.id} 
                  onClick={() => onOpenEdit(ex)}
                  className="p-5 flex flex-col justify-between group hover:border-lime-400/50 transition-colors border-zinc-200 dark:border-zinc-800 shadow-none bg-white dark:bg-zinc-950 cursor-pointer relative"
                >
                  <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpenEdit(ex)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                          onClick={() => handleDelete(ex.id, ex.nombre)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2 pr-8">
                      <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                        {ex.nombre}
                      </h4>
                      {ex.media_url && (
                        <div title={exerciseLibraryCopy.list.mediaIconTitle} className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 p-1.5 rounded-md shrink-0">
                          <PlaySquare className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {ex.descripcion && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mt-2">
                        {ex.descripcion}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-xs text-zinc-400 font-medium">
                    <span>
                      {new Date(ex.created_at).toLocaleDateString("es-AR", { month: 'short', year: 'numeric' })}
                    </span>
                    <Dumbbell className="w-4 h-4 opacity-50" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
