import React, { useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { blockSchema, type BlockFormData } from "@/lib/validators";
import { blocksCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, Dumbbell, GripVertical, Box } from "lucide-react";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
} from "@/components/ui/form";
import { StandardField } from "@/components/molecules/StandardField";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";

interface BlockFormProps {
  library: any[];
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

/**
 * BlockForm: Constructor de "Bloques (Circuitos)" premium.
 * Permite armar secuencias de ejercicios, guardarlas en la biblioteca e insertarlas.
 */
export function BlockForm({ library, onSuccess, onCancel }: BlockFormProps) {
  const { execute, isPending } = useAsyncAction();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const copy = blocksCopy.form;

  const form = useForm<BlockFormData>({
    resolver: zodResolver(blockSchema),
    defaultValues: {
      nombre: "",
      ejercicios: [],
      tags: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "ejercicios",
  });

  const onSubmit: SubmitHandler<BlockFormData> = (values) => {
    if (values.ejercicios.length === 0) {
        toast.error("El bloque debe tener al menos un ejercicio");
        return;
    }

    execute(async () => {
      const { data: result, error } = await actions.profesor.createBlock(values);

      if (error || !result) {
        throw error || new Error("Error al crear el bloque");
      }

      onSuccess?.(result);
    }, {
      loadingMsg: "Creando bloque...",
      successMsg: copy.messages.success,
    });
  };

  const addExerciseToBlock = (exerciseId: string) => {
    const exercise = library.find(e => e.id === exerciseId);
    append({
        ejercicio_id: exerciseId,
        orden: fields.length,
        series: 3,
        reps_target: "12",
        descanso_seg: 60,
        notas: ""
    });
    setIsSearchOpen(false);
  };

  const getExerciseName = (id: string) => library.find(e => e.id === id)?.nombre || "Ejercicio";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <div className="industrial-card group bg-ui-soft p-8 space-y-8 flex-col items-stretch">
                    <FormField
                        control={form.control as any}
                        name="nombre"
                        render={({ field, fieldState }) => (
                            <StandardField
                                label={copy.labels.nombre}
                                error={fieldState.error?.message}
                                required
                            >
                                <FormControl>
                                    <Input
                                        placeholder={copy.placeholders.nombre}
                                        {...field}
                                        className="industrial-input-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-lime-500"
                                    />
                                </FormControl>
                            </StandardField>
                        )}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="industrial-label">
                                {copy.labels.ejercicios} ({fields.length})
                            </label>
                            <Button 
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSearchOpen(true)}
                                className="rounded-xl h-10 px-4 industrial-label border-zinc-200 dark:border-zinc-800 hover:border-lime-500 hover:text-lime-500 transition-all font-black text-[10px]"
                            >
                                <Plus className="w-3.5 h-3.5 mr-2" /> Añadir ejercicio
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div 
                                    key={field.id}
                                    className="industrial-card-sm bg-white dark:bg-zinc-950 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group animate-in fade-in slide-in-from-right-4 duration-300"
                                >
                                    <div className="industrial-icon-box-sm border border-zinc-200 dark:border-zinc-800 font-black text-xs text-zinc-400 italic">
                                        {index + 1}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm text-zinc-950 dark:text-zinc-50 truncate uppercase tracking-tight">
                                            {getExerciseName(field.ejercicio_id)}
                                        </p>
                                        <div className="flex gap-4 mt-1">
                                            <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                <span className="industrial-metadata">Series:</span>
                                                <input 
                                                    {...form.register(`ejercicios.${index}.series`, { valueAsNumber: true })}
                                                    className="w-10 bg-transparent border-none p-0 text-[10px] font-black text-lime-600 focus:ring-0"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                <span className="industrial-metadata">Reps:</span>
                                                <input 
                                                    {...form.register(`ejercicios.${index}.reps_target`)}
                                                    className="w-12 bg-transparent border-none p-0 text-[10px] font-black text-lime-600 focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-3 text-zinc-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <div 
                                    onClick={() => setIsSearchOpen(true)}
                                    className="industrial-card-ghost"
                                >
                                    <Dumbbell className="w-10 h-10 opacity-20" />
                                    <p className="industrial-label italic">Arrancá sumando ejercicios</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end sticky bottom-0 bg-white dark:bg-zinc-950 p-6 -mx-8 -mb-8 border-t border-zinc-100 dark:border-zinc-900 shadow-2xl z-20">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={onCancel}
                        className="rounded-2xl industrial-label h-14 px-8 border-zinc-200 dark:border-zinc-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || fields.length === 0}
                        variant="industrial"
                        size="xl"
                        className="px-12 shadow-2xl shadow-lime-400/10 min-w-[200px]"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center">
                                <Box className="w-5 h-5 mr-3" />
                                <span className="text-sm font-black uppercase tracking-tight">Crear Bloque</span>
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </Form>

        <ExerciseSearchDialog 
            open={isSearchOpen}
            onOpenChange={setIsSearchOpen}
            library={library}
            onSelect={addExerciseToBlock}
            onExerciseCreated={(ex) => addExerciseToBlock(ex.id)}
            onlyBase={true}
        />
    </div>
  );
}
